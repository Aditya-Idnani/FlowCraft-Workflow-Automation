import cron from "node-cron";
import { prisma } from "./prisma.js";

// ── Schedule presets ────────────────────────────────
export const SCHEDULE_PRESETS = {
  "every_minute": { cron: "* * * * *",       label: "Every Minute" },
  "hourly":       { cron: "0 * * * *",       label: "Hourly" },
  "daily":        { cron: "0 9 * * *",       label: "Daily (9 AM)" },
  "weekly":       { cron: "0 9 * * 1",       label: "Weekly (Mon 9 AM)" },
};

// ── Active cron jobs: workflowId → { task, preset, nextRun } ──
const activeJobs = new Map();

/**
 * Calculate the next run time for a cron expression.
 */
function getNextRun(cronExpr) {
  // node-cron doesn't expose next-run natively, so we calculate it
  const interval = cron.schedule(cronExpr, () => {}, { scheduled: false });
  // We'll compute it manually based on the preset
  const now = new Date();
  const next = new Date(now);

  if (cronExpr === "* * * * *") {
    // Every minute — next minute
    next.setMinutes(next.getMinutes() + 1, 0, 0);
  } else if (cronExpr === "0 * * * *") {
    // Hourly — next hour
    next.setHours(next.getHours() + 1, 0, 0, 0);
  } else if (cronExpr === "0 9 * * *") {
    // Daily at 9 AM
    next.setHours(9, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (cronExpr === "0 9 * * 1") {
    // Weekly Monday 9 AM
    next.setHours(9, 0, 0, 0);
    const day = next.getDay();
    const daysUntilMonday = day === 0 ? 1 : day === 1 && next > now ? 0 : (8 - day);
    next.setDate(next.getDate() + daysUntilMonday);
    if (next <= now) next.setDate(next.getDate() + 7);
  }

  interval.stop();
  return next;
}

/**
 * Schedule a workflow. Returns the schedule info.
 * @param {string} workflowId
 * @param {string} preset - key from SCHEDULE_PRESETS
 * @param {Function} executeFn - async function to run the workflow
 */
export function scheduleWorkflow(workflowId, preset, executeFn) {
  // Stop existing schedule if any
  unscheduleWorkflow(workflowId);

  const presetConfig = SCHEDULE_PRESETS[preset];
  if (!presetConfig) {
    throw new Error(`Unknown schedule preset: ${preset}`);
  }

  const task = cron.schedule(presetConfig.cron, async () => {
    console.log(`[Scheduler] ⏰ Triggering scheduled run for workflow ${workflowId}`);
    try {
      await executeFn();
      // Update next run after execution
      const job = activeJobs.get(workflowId);
      if (job) {
        job.nextRun = getNextRun(presetConfig.cron);
        job.lastRun = new Date();
        job.lastStatus = "success";
      }
    } catch (err) {
      console.error(`[Scheduler] ❌ Scheduled run failed for workflow ${workflowId}:`, err.message);
      const job = activeJobs.get(workflowId);
      if (job) {
        job.lastRun = new Date();
        job.lastStatus = "failed";
      }
    }
  });

  const nextRun = getNextRun(presetConfig.cron);

  activeJobs.set(workflowId, {
    task,
    preset,
    cronExpr: presetConfig.cron,
    label: presetConfig.label,
    nextRun,
    lastRun: null,
    lastStatus: null,
    scheduledAt: new Date(),
  });

  console.log(`[Scheduler] ✅ Workflow ${workflowId} scheduled: ${presetConfig.label} (${presetConfig.cron})`);
  console.log(`[Scheduler]    Next run: ${nextRun.toISOString()}`);

  return getScheduleInfo(workflowId);
}

/**
 * Unschedule (stop) a workflow's cron job.
 */
export function unscheduleWorkflow(workflowId) {
  const job = activeJobs.get(workflowId);
  if (job) {
    job.task.stop();
    activeJobs.delete(workflowId);
    console.log(`[Scheduler] 🛑 Workflow ${workflowId} unscheduled`);
    return true;
  }
  return false;
}

/**
 * Get schedule info for a workflow.
 */
export function getScheduleInfo(workflowId) {
  const job = activeJobs.get(workflowId);
  if (!job) return null;

  return {
    preset: job.preset,
    label: job.label,
    cronExpr: job.cronExpr,
    nextRun: job.nextRun?.toISOString() ?? null,
    lastRun: job.lastRun?.toISOString() ?? null,
    lastStatus: job.lastStatus,
    scheduledAt: job.scheduledAt.toISOString(),
  };
}

/**
 * Get all active schedules.
 */
export function getAllSchedules() {
  const result = {};
  for (const [workflowId] of activeJobs) {
    result[workflowId] = getScheduleInfo(workflowId);
  }
  return result;
}

/**
 * Initialize scheduler from Database on startup.
 */
export async function initScheduler() {
  console.log("[Scheduler] 🔄 Initializing from database...");
  const scheduledWorkflows = await prisma.workflow.findMany({
    where: { schedulePreset: { not: null } },
    include: { steps: { orderBy: { position: "asc" } } },
  });

  for (const workflow of scheduledWorkflows) {
    const executeFn = async () => {
      const execution = await prisma.execution.create({
        data: {
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: "running",
          triggeredBy: "schedule",
        },
      });

      try {
        for (const step of workflow.steps) {
          await prisma.executionLog.create({
            data: { executionId: execution.id, message: `Executing step: ${step.name}` },
          });
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        await prisma.execution.update({
          where: { id: execution.id },
          data: { status: "success", finishedAt: new Date() },
        });
        console.log(`[Scheduler] Workflow "${workflow.name}" executed successfully (${execution.id})`);
      } catch (err) {
        await prisma.execution.update({
          where: { id: execution.id },
          data: { status: "failed", finishedAt: new Date(), error: err.message },
        });
        throw err;
      }
    };

    try {
      scheduleWorkflow(workflow.id, workflow.schedulePreset, executeFn);
    } catch (err) {
      console.error(`[Scheduler] Failed to restore schedule for ${workflow.id}:`, err.message);
    }
  }
  
  console.log(`[Scheduler] ✅ Restored ${scheduledWorkflows.length} scheduled workflow(s)`);
}
