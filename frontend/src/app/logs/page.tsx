"use client";

import { DashboardLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { Search, Terminal, Filter, Download, Server, Cpu, Network, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";

const MOCK_LOGS = [
  { id: "LOG-01", time: "10:45:23 AM", level: "info", source: "WebhookTrigger", msg: "Received payload from Stripe" },
  { id: "LOG-02", time: "10:45:24 AM", level: "info", source: "DataTransformer", msg: "Parsed customer object" },
  { id: "LOG-03", time: "10:45:26 AM", level: "warning", source: "SalesforceAPI", msg: "Rate limit threshold at 90%" },
  { id: "LOG-04", time: "10:45:28 AM", level: "error", source: "SlackAction", msg: "Missing channel ID parameter" },
  { id: "LOG-05", time: "10:46:01 AM", level: "info", source: "System", msg: "Garbage collection completed" },
  { id: "LOG-06", time: "10:47:15 AM", level: "info", source: "ScheduleNode", msg: "Cron job 'Daily Sync' triggered" },
  { id: "LOG-07", time: "10:47:16 AM", level: "info", source: "EmailAction", msg: "Sent 50 emails successfully" },
  { id: "LOG-08", time: "10:48:30 AM", level: "warning", source: "Database", msg: "Query execution time > 1000ms" },
];

export default function LogsPage() {
  const [filter, setFilter] = useState("all");
  
  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between shrink-0"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--accent-purple)]/20 to-[var(--accent-blue)]/20 border border-[var(--border-default)]">
                <Terminal className="w-5 h-5 text-[var(--accent-purple)]" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">System Logs</h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              View and filter global application and execution logs.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-default)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover-bg)] transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="glass-card rounded-t-2xl p-4 border-b-0 shrink-0 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search logs (e.g. 'Stripe', 'Error')..."
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)]/50 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-default)]">
            {["all", "info", "warning", "error"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f
                    ? "bg-[var(--bg-sidebar)] shadow-sm text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Console Pane */}
        <div className="glass-card rounded-b-2xl flex-1 overflow-hidden flex flex-col font-mono text-sm relative">
          <div className="absolute top-0 left-0 bottom-0 w-12 bg-black/5 dark:bg-white/5 border-r border-[var(--border-default)] z-0" />
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 relative">
            {MOCK_LOGS.filter(l => filter === "all" || l.level === filter).map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={log.id}
                className="flex items-start gap-4 hover:bg-[var(--sidebar-hover-bg)] p-1.5 rounded-md transition-colors"
              >
                {/* Line number gutter */}
                <div className="w-8 shrink-0 text-right text-xs text-[var(--text-muted)] select-none pt-0.5 opacity-50">
                  {String(i + 1).padStart(3, "0")}
                </div>
                
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span className="text-[10px] text-[var(--text-muted)]">{log.time}</span>
                  {log.level === "info" && <span className="text-[var(--accent-blue)]">● INFO </span>}
                  {log.level === "warning" && <span className="text-[var(--accent-amber)]">▲ WARN </span>}
                  {log.level === "error" && <span className="text-[var(--accent-red)]">✖ ERROR</span>}
                </div>
                
                <span className="text-[var(--accent-purple)] font-semibold shrink-0">[{log.source}]</span>
                <span className="text-[var(--text-secondary)] flex-1">{log.msg}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
