import express from "express";
import { prisma } from "../prisma.js";
import {
  scheduleWorkflow,
  unscheduleWorkflow,
  getScheduleInfo,
  getAllSchedules,
  SCHEDULE_PRESETS,
} from "../scheduler.js";

const router = express.Router();

// GET /workflows - List all workflows
router.get("/", async (req, res) => {
  const workflows = await prisma.workflow.findMany({
    include: { steps: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    workflows.map((w) => ({
      ...w,
      schedule: w.schedulePreset
        ? { preset: w.schedulePreset, label: w.scheduleLabel, cronExpr: w.scheduleCron }
        : null,
    }))
  );
});

// POST /workflows - Create new workflow
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Workflow name is required" });
  }

  const workflow = await prisma.workflow.create({
    data: { name: name.trim() },
    include: { steps: true },
  });

  res.status(201).json(workflow);
});

// GET /workflows/executions - List all executions
router.get("/executions", async (req, res) => {
  const executions = await prisma.execution.findMany({
    include: { logs: { orderBy: { timestamp: "asc" } } },
    orderBy: { startedAt: "desc" },
  });
  
  res.json(
    executions.map((ex) => ({
      id: ex.id,
      workflowId: ex.workflowId,
      workflowName: ex.workflowName,
      status: ex.status,
      startedAt: ex.startedAt.toISOString(),
      finishedAt: ex.finishedAt ? ex.finishedAt.toISOString() : null,
      error: ex.error,
      logs: ex.logs.map((l) => l.message),
    }))
  );
});

// GET /workflows/:id - Get single workflow
router.get("/:id", async (req, res) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: req.params.id },
    include: { steps: { orderBy: { position: "asc" } } },
  });

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  // Inject active schedule info if any
  const scheduleInfo = getScheduleInfo(workflow.id);
  res.json({
    ...workflow,
    schedule: scheduleInfo || (workflow.schedulePreset ? {
      preset: workflow.schedulePreset,
      label: workflow.scheduleLabel,
      cronExpr: workflow.scheduleCron,
    } : null),
  });
});

// PUT /workflows/:id - Update workflow
router.put("/:id", async (req, res) => {
  const { name } = req.body;

  try {
    const workflow = await prisma.workflow.update({
      where: { id: req.params.id },
      data: { name: name && name.trim() ? name.trim() : undefined },
      include: { steps: { orderBy: { position: "asc" } } },
    });
    res.json(workflow);
  } catch (err) {
    return res.status(404).json({ error: "Workflow not found" });
  }
});

// DELETE /workflows/:id - Delete workflow
router.delete("/:id", async (req, res) => {
  try {
    await prisma.workflow.delete({ where: { id: req.params.id } });
    unscheduleWorkflow(req.params.id);
    res.status(204).send();
  } catch (err) {
    return res.status(404).json({ error: "Workflow not found" });
  }
});

// POST /workflows/:id/steps - Add step to workflow
router.post("/:id/steps", async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Step name is required" });
  }

  try {
    const count = await prisma.step.count({ where: { workflowId: req.params.id } });
    const step = await prisma.step.create({
      data: {
        name: name.trim(),
        position: count,
        workflowId: req.params.id,
      },
    });

    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: { steps: { orderBy: { position: "asc" } } },
    });

    res.json(workflow);
  } catch (err) {
    return res.status(404).json({ error: "Workflow not found" });
  }
});

// DELETE /workflows/:id/steps/:stepId - Remove step
router.delete("/:id/steps/:stepId", async (req, res) => {
  try {
    await prisma.step.delete({
      where: { id: req.params.stepId, workflowId: req.params.id },
    });

    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: { steps: { orderBy: { position: "asc" } } },
    });

    res.json(workflow);
  } catch (err) {
    return res.status(404).json({ error: "Step or workflow not found" });
  }
});

// POST /workflows/:id/execute - Execute workflow
router.post("/:id/execute", async (req, res) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: req.params.id },
    include: { steps: { orderBy: { position: "asc" } } },
  });

  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  // Create initial execution record
  const execution = await prisma.execution.create({
    data: {
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: "running",
      triggeredBy: "manual",
    },
  });

  try {
    for (const step of workflow.steps) {
      await prisma.executionLog.create({
        data: {
          executionId: execution.id,
          message: `Executing step: ${step.name}`,
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await prisma.execution.update({
      where: { id: execution.id },
      data: { status: "success", finishedAt: new Date() },
    });

    res.json({
      message: "Workflow executed successfully",
      executionId: execution.id,
      status: "success",
    });
  } catch (err) {
    await prisma.execution.update({
      where: { id: execution.id },
      data: { status: "failed", finishedAt: new Date(), error: err.message },
    });

    res.status(500).json({
      error: "Execution failed",
      executionId: execution.id,
      status: "failed",
    });
  }
});

// PUT /workflows/:id/canvas - Save UI layout (nodes & edges)
router.put("/:id/canvas", async (req, res) => {
  const { nodes, edges } = req.body;
  
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
    });
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    // 1. Update nodes (Steps)
    if (nodes && Array.isArray(nodes)) {
      for (const node of nodes) {
        await prisma.step.update({
          where: { id: node.id },
          data: {
            positionX: node.position?.x ?? 0,
            positionY: node.position?.y ?? 0,
            nodeType: node.data?.nodeType,
            config: node.data?.config,
          },
        });
      }
    }

    // 2. Overwrite edges
    if (edges && Array.isArray(edges)) {
      await prisma.edge.deleteMany({ where: { workflowId: req.params.id } });
      if (edges.length > 0) {
        await prisma.edge.createMany({
          data: edges.map((e) => ({
            id: e.id,
            source: e.source,
            sourceHandle: e.sourceHandle || "right",
            target: e.target,
            targetHandle: e.targetHandle || "left",
            workflowId: req.params.id,
          })),
        });
      }
    }

    // Fetch and return the updated workflow
    const updatedWorkflow = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: {
        steps: { orderBy: { position: "asc" } },
        edges: true,
      },
    });

    res.json(updatedWorkflow);
  } catch (err) {
    res.status(500).json({ error: "Failed to save canvas" });
  }
});

// ── Schedule endpoints ────────────────────────────

router.get("/schedules/all", (req, res) => {
  res.json(getAllSchedules());
});

router.get("/schedules/presets", (req, res) => {
  const presets = Object.entries(SCHEDULE_PRESETS).map(([key, val]) => ({
    id: key,
    label: val.label,
    cron: val.cron,
  }));
  res.json(presets);
});

router.get("/:id/schedule", async (req, res) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const info = getScheduleInfo(req.params.id);
  res.json({ scheduled: !!info, schedule: info });
});

router.post("/:id/schedule", async (req, res) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: req.params.id },
    include: { steps: { orderBy: { position: "asc" } } },
  });
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const { preset } = req.body;
  const presetConfig = SCHEDULE_PRESETS[preset];
  if (!preset || !presetConfig) {
    return res.status(400).json({
      error: `Invalid preset. Available: ${Object.keys(SCHEDULE_PRESETS).join(", ")}`,
    });
  }

  // DB Execute Fn
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
    const info = scheduleWorkflow(req.params.id, preset, executeFn);
    // Persist schedule info
    await prisma.workflow.update({
      where: { id: req.params.id },
      data: {
        schedulePreset: preset,
        scheduleCron: presetConfig.cron,
        scheduleLabel: presetConfig.label,
      },
    });

    res.json({ message: "Schedule set", schedule: info });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id/schedule", async (req, res) => {
  const workflow = await prisma.workflow.findUnique({ where: { id: req.params.id } });
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }

  const removed = unscheduleWorkflow(req.params.id);
  await prisma.workflow.update({
    where: { id: req.params.id },
    data: { schedulePreset: null, scheduleCron: null, scheduleLabel: null },
  });

  if (removed) {
    res.json({ message: "Schedule removed" });
  } else {
    res.json({ message: "No active schedule to remove" });
  }
});

export default router;