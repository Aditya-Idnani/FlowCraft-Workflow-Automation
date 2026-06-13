"use client";

import { DashboardLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { Calendar, Clock, MoreHorizontal, Play, Pause, Trash2, Plus, Zap, Activity } from "lucide-react";

const MOCK_SCHEDULES = [
  { id: "SCH-1", name: "Daily Data Sync", workflow: "Salesforce to Postgres", cron: "0 0 * * *", nextRun: "In 4 hours", status: "active", icon: Zap, color: "#a855f7" },
  { id: "SCH-2", name: "Weekly Report", workflow: "Generate KPI PDF", cron: "0 9 * * 1", nextRun: "In 2 days", status: "active", icon: Activity, color: "#22c55e" },
  { id: "SCH-3", name: "Hourly Cleanup", workflow: "Delete Temp Files", cron: "0 * * * *", nextRun: "In 15 mins", status: "paused", icon: Clock, color: "#f59e0b" },
];

export default function SchedulePage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 border border-[var(--border-default)]">
                <Calendar className="w-6 h-6 text-[var(--accent-blue)]" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Schedules</h1>
            </div>
            <p className="text-[var(--text-secondary)]">Manage recurring workflow executions and cron jobs.</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-blue)] hover:bg-indigo-600 text-white text-sm font-semibold transition-all">
            <Plus className="w-4 h-4" /> New Schedule
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {MOCK_SCHEDULES.map((schedule, i) => {
            const Icon = schedule.icon;
            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 flex items-center gap-6"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[var(--border-default)]" style={{ background: `${schedule.color}15`, color: schedule.color }}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{schedule.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      schedule.status === "active" ? "bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20" : "bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--border-default)]"
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Triggers: <span className="font-semibold text-[var(--text-primary)]">{schedule.workflow}</span></p>
                </div>

                <div className="px-6 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] flex flex-col items-center justify-center min-w-[120px]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-1">Next Run</span>
                  <span className="text-sm font-semibold text-[var(--accent-blue)]">{schedule.nextRun}</span>
                </div>

                <div className="px-6 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] flex flex-col items-center justify-center min-w-[120px]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold mb-1">Schedule</span>
                  <span className="text-sm font-mono text-[var(--text-primary)]">{schedule.cron}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--border-default)]">
                    {schedule.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors border border-transparent hover:border-rose-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--border-default)]">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
