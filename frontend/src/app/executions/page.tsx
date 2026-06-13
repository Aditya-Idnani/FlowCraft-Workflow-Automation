"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { executionApi, type Execution } from "@/lib/api";
import { useExecutions, type LocalExecution, type LogEntry } from "@/context/ExecutionLogContext";
import { DashboardLayout } from "@/components/layout";
import {
  PlayCircle, CheckCircle, XCircle, Clock, RefreshCw, ChevronDown,
  Terminal, Loader2, AlertTriangle, X, Activity, Zap, ListChecks,
  ChevronRight, Timer, Globe, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ── Helpers ─────────────────────────────────────────
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}
function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// Log level styles
const LOG_LEVEL_STYLES: Record<LogEntry["level"], { dot: string; text: string }> = {
  info: { dot: "bg-[var(--accent-blue)]", text: "text-[var(--text-secondary)]" },
  success: { dot: "bg-[var(--accent-green)]", text: "text-[var(--accent-green)]" },
  error: { dot: "bg-[var(--accent-red)]", text: "text-[var(--accent-red)]" },
  warn: { dot: "bg-[var(--accent-amber)]", text: "text-[var(--accent-amber)]" },
};

function getStatusConfig(status: string) {
  switch (status) {
    case "success": return {
      icon: CheckCircle, bg: "bg-[var(--accent-green)]/15", text: "text-[var(--accent-green)]",
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.35)]", border: "border-[var(--accent-green)]/30", label: "Success",
      badgeClass: "badge-success",
    };
    case "failed": return {
      icon: XCircle, bg: "bg-[var(--accent-red)]/15", text: "text-[var(--accent-red)]",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.35)]", border: "border-[var(--accent-red)]/30", label: "Failed",
      badgeClass: "badge-failed",
    };
    default: return {
      icon: Loader2, bg: "bg-[var(--accent-blue)]/15", text: "text-[var(--accent-blue)]",
      glow: "shadow-[0_0_20px_rgba(99,102,241,0.35)]", border: "border-[var(--accent-blue)]/30", label: "Running",
      badgeClass: "badge-running",
    };
  }
}

// ── Execution Detail Panel (Screenshot 2 right panel) ─
type PanelTab = "details" | "logs" | "results";

// Mock node execution flow
const MOCK_FLOW_NODES = [
  { name: "Webhook", time: "0.45s", icon: Globe, color: "#6366f1" },
  { name: "Parse Data", time: "0.32s", icon: Zap, color: "#6366f1" },
  { name: "Check Lead", time: "0.15s", icon: Activity, color: "#a855f7" },
  { name: "Enrich Lead", time: "1.23s", icon: Zap, color: "#22c55e" },
  { name: "Send Email", time: "0.68s", icon: Mail, color: "#6366f1" },
  { name: "Wait 2 Days", time: "2d 0h", icon: Timer, color: "#f59e0b" },
  { name: "Follow Up Email", time: "0.75s", icon: Mail, color: "#6366f1" },
  { name: "Slack Notification", time: "0.38s", icon: ListChecks, color: "#22c55e" },
  { name: "Update Status", time: "0.22s", icon: CheckCircle, color: "#22c55e" },
];

function ExecutionDetailPanel({
  execution,
  onClose,
}: {
  execution: LocalExecution | Execution;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<PanelTab>("details");

  const isLocal = "startedAt" in execution && execution.startedAt instanceof Date;
  const startedAt = isLocal
    ? (execution as LocalExecution).startedAt
    : new Date((execution as Execution).startedAt);
  const finishedAt = (execution as any).finishedAt
    ? (isLocal ? (execution as any).finishedAt : new Date((execution as Execution).finishedAt!))
    : null;

  const status = (execution as any).status;
  const statusColor = status === "success" ? "#22c55e" : status === "failed" ? "#ef4444" : "#6366f1";
  const StatusIcon = status === "success" ? CheckCircle : status === "failed" ? XCircle : Loader2;

  const duration = finishedAt
    ? formatDuration(startedAt, finishedAt)
    : (execution as any).status === "running" ? "Running…" : "—";

  const workflowName = (execution as any).workflowName || "Unknown Workflow";
  const executionId = String((execution as any).id || "00000").slice(-5);

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-14 bottom-0 flex flex-col border-l border-[var(--border-default)] z-20"
      style={{ width: 320, background: "var(--bg-sidebar)", minWidth: 320 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Panel header */}
      <div className="px-5 pt-5 pb-0 border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-3 pr-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">Execution</span>
            <span className="text-sm font-bold text-[var(--accent-blue)]">#{executionId}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${statusColor}20`, color: statusColor }}
            >
              <StatusIcon className={`w-3 h-3 ${status === "running" ? "animate-spin" : ""}`} />
              {status === "success" ? "Success" : status === "failed" ? "Failed" : "Running"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 -mb-px">
          {(["details", "logs", "results"] as PanelTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
                tab === t
                  ? "border-[var(--accent-blue)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "details" && (
          <div className="p-5 space-y-5">
            {/* Meta */}
            <div className="space-y-3">
              {[
                { label: "Started", value: startedAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) },
                { label: "Duration", value: duration },
                { label: "Workflow", value: workflowName },
                { label: "Status", value: null, statusVal: status },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-[var(--text-muted)] shrink-0 pt-0.5">{row.label}</span>
                  {row.statusVal ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                      <span className="text-xs font-semibold capitalize" style={{ color: statusColor }}>
                        {row.statusVal}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-[var(--text-secondary)] text-right">{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Performance */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-[var(--accent-purple)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Performance</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Time", value: duration },
                  { label: "Nodes Executed", value: "8 / 8" },
                  { label: "Success Rate", value: status === "success" ? "100%" : "—" },
                  { label: "Tasks Used", value: "12" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="p-3 rounded-xl border border-[var(--border-default)]"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <p className="text-[10px] text-[var(--text-muted)] mb-1">{m.label}</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Flow */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Execution Flow</span>
              </div>
              <div className="space-y-1.5">
                {MOCK_FLOW_NODES.map((node, i) => {
                  const Icon = node.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${node.color}20` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                      </div>
                      <span className="flex-1 text-xs text-[var(--text-secondary)] truncate">{node.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{node.time}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* View Full Logs button */}
            <button
              onClick={() => setTab("logs")}
              className="w-full py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-all duration-200"
            >
              View Full Logs
            </button>
          </div>
        )}

        {tab === "logs" && (
          <div className="space-y-1.5 font-mono text-[11px]">
            {isLocal && (execution as LocalExecution).logs.length > 0 ? (
              (execution as LocalExecution).logs.map((log, i) => {
                const ls = LOG_LEVEL_STYLES[(log as LogEntry).level];
                return (
                  <div key={i} className="flex items-start gap-2 py-0.5">
                    <span className="text-[var(--text-muted)] tabular-nums shrink-0">
                      [{formatTime((log as LogEntry).timestamp)}]
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${ls.dot}`} />
                    <span className={`${ls.text} break-all leading-relaxed`}>{(log as LogEntry).message}</span>
                  </div>
                );
              })
            ) : !isLocal && (execution as Execution).logs.length > 0 ? (
              (execution as Execution).logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 py-0.5">
                  <span className="text-[var(--accent-purple)] bg-[var(--accent-purple)]/10 px-1.5 rounded text-[10px] shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[var(--text-secondary)] break-all">{log}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No logs available</p>
              </div>
            )}
          </div>
        )}

        {tab === "results" && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No result data for this execution</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Execution Card (List Row) ──────────────────────────
function ExecutionCard({
  execution,
  isLocal,
  isSelected,
  onClick,
}: {
  execution: LocalExecution | Execution;
  isLocal: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const startedAt = isLocal
    ? (execution as LocalExecution).startedAt
    : new Date((execution as Execution).startedAt);
  const finishedAt = (execution as any).finishedAt
    ? (isLocal ? (execution as any).finishedAt : new Date((execution as Execution).finishedAt!))
    : null;

  const status = (execution as any).status;
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;
  const [expanded, setExpanded] = useState(status === "running");

  const logs: any[] = (execution as any).logs || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected ? "ring-2 ring-[var(--accent-blue)]/50" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Status icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.bg} border border-[var(--border-default)] ${config.glow} transition-all duration-300 group-hover:scale-105 shrink-0`}>
          <StatusIcon className={`w-5 h-5 ${config.text} ${status === "running" ? "animate-spin" : ""}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {(execution as any).workflowName}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {startedAt.toLocaleString()}
          </p>
        </div>

        {/* Status badge */}
        <span className={`text-xs font-bold px-3 py-1 rounded-lg uppercase ${config.badgeClass} shrink-0`}>
          {config.label}
        </span>

        {/* Duration */}
        {finishedAt && (
          <span className="text-xs text-[var(--text-muted)] tabular-nums px-2.5 py-1 rounded-lg border border-[var(--border-default)] shrink-0"
            style={{ background: "var(--bg-card)" }}>
            {formatDuration(startedAt, finishedAt)}
          </span>
        )}
        {status === "running" && (
          <span className="text-xs text-[var(--accent-blue)] px-2.5 py-1 rounded-lg bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 animate-pulse shrink-0">
            Live
          </span>
        )}

        {/* Expand logs */}
        {logs.length > 0 && (
          <motion.button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="p-1.5 rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            style={{ background: "var(--bg-card)" }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Inline log panel */}
      <AnimatePresence>
        {expanded && logs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="rounded-xl border border-[var(--border-default)] overflow-hidden" style={{ background: "var(--log-panel-bg)" }}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border-default)]" style={{ background: "var(--log-panel-header)" }}>
                  <Terminal className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Execution Logs</span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-auto">{logs.length} entries</span>
                </div>
                <div className="p-3 space-y-1 font-mono text-[11px] max-h-56 overflow-y-auto">
                  {isLocal ? logs.map((log: LogEntry, i: number) => {
                    const ls = LOG_LEVEL_STYLES[log.level];
                    return (
                      <div key={i} className="flex items-start gap-2 py-0.5">
                        <span className="text-[var(--text-muted)] tabular-nums shrink-0">[{formatTime(log.timestamp)}]</span>
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${ls.dot}`} />
                        <span className={`${ls.text} break-all`}>{log.message}</span>
                      </div>
                    );
                  }) : logs.map((log: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span className="text-[var(--accent-purple)] text-[10px] bg-[var(--accent-purple)]/10 px-1.5 rounded shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[var(--text-secondary)] break-all">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function ExecutionsPage() {
  const localExecutions = useExecutions();
  const [backendExecutions, setBackendExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<LocalExecution | Execution | null>(null);

  const loadBackendExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await executionApi.list();
    if (error) setError(error);
    else if (data) setBackendExecutions(data.reverse());
    setLoading(false);
  }, []);

  useEffect(() => { loadBackendExecutions(); }, [loadBackendExecutions]);

  const hasRunning = localExecutions.some((ex) => ex.status === "running");

  const allCount = localExecutions.length + backendExecutions.length;
  const successCount =
    localExecutions.filter((e) => e.status === "success").length +
    backendExecutions.filter((e) => e.status === "success").length;
  const failedCount =
    localExecutions.filter((e) => e.status === "failed").length +
    backendExecutions.filter((e) => e.status === "failed").length;
  const runningCount = localExecutions.filter((e) => e.status === "running").length;

  const hasPanelOpen = selectedExecution !== null;

  return (
    <DashboardLayout>
      <div className={`flex h-[calc(100vh-56px)] transition-all duration-300`}>
        {/* Main list area */}
        <div className={`flex-1 overflow-y-auto ${hasPanelOpen ? "pr-80" : ""} transition-all duration-300`}>
          <div className="p-6 max-w-4xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Executions</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Monitor workflow execution history and live logs
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={loadBackendExecutions}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all duration-200"
                style={{ background: "var(--bg-card)" }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </motion.button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Total", value: allCount, icon: PlayCircle, color: "text-[var(--accent-blue)]", bg: "from-[var(--accent-blue)] to-indigo-500" },
                { label: "Running", value: runningCount, icon: Loader2, color: "text-[var(--accent-blue)]", bg: "from-[var(--accent-blue)] to-cyan-500" },
                { label: "Successful", value: successCount, icon: CheckCircle, color: "text-[var(--accent-green)]", bg: "from-[var(--accent-green)] to-emerald-500" },
                { label: "Failed", value: failedCount, icon: XCircle, color: "text-[var(--accent-red)]", bg: "from-[var(--accent-red)] to-rose-500" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center opacity-80`}>
                        <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Running banner */}
            <AnimatePresence>
              {hasRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20">
                    <Loader2 className="w-4 h-4 text-[var(--accent-blue)] animate-spin" />
                    <span className="text-sm text-[var(--accent-blue)] font-medium">
                      {runningCount} workflow{runningCount !== 1 ? "s" : ""} executing — logs updating live
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[var(--accent-blue)] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] animate-pulse" />
                      LIVE
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            {localExecutions.length === 0 && loading ? (
              <div className="flex items-center justify-center h-48">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full"
                />
              </div>
            ) : localExecutions.length === 0 && backendExecutions.length === 0 && !error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 rounded-2xl border border-[var(--border-default)] flex items-center justify-center mx-auto mb-5"
                  style={{ background: "var(--bg-card)" }}>
                  <PlayCircle className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No executions yet</h2>
                <p className="text-sm text-[var(--text-secondary)]">Run a workflow to see execution history and live logs</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* Local (live) executions */}
                {localExecutions.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <Terminal className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">This Session</span>
                      <div className="flex-1 h-px bg-[var(--border-default)]" />
                    </div>
                    {localExecutions.map((execution) => (
                      <ExecutionCard
                        key={execution.id}
                        execution={execution}
                        isLocal
                        isSelected={selectedExecution === execution}
                        onClick={() => setSelectedExecution(selectedExecution === execution ? null : execution)}
                      />
                    ))}
                  </>
                )}

                {/* Backend executions */}
                {backendExecutions.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-1 mt-6">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Previous Executions</span>
                      <div className="flex-1 h-px bg-[var(--border-default)]" />
                    </div>
                    {backendExecutions.map((execution) => (
                      <ExecutionCard
                        key={execution.id}
                        execution={execution}
                        isLocal={false}
                        isSelected={selectedExecution === execution}
                        onClick={() => setSelectedExecution(selectedExecution === execution ? null : execution)}
                      />
                    ))}
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 text-sm mt-4">
                    <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] shrink-0" />
                    <span className="text-[var(--accent-amber)]">Could not load server executions: {error}</span>
                    <button onClick={loadBackendExecutions} className="ml-auto text-[var(--accent-blue)] hover:underline text-sm font-medium">Retry</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel */}
        <AnimatePresence>
          {selectedExecution && (
            <ExecutionDetailPanel
              execution={selectedExecution}
              onClose={() => setSelectedExecution(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}