"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { executionApi, type Execution } from "@/lib/api";
import { useExecutions, type LocalExecution, type LogEntry } from "@/context/ExecutionLogContext";
import { DashboardLayout } from "@/components/layout";
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  Terminal,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  PageTransition,
  FadeIn,
  staggerContainer,
  staggerItem,
} from "@/components/motion";

// ── Helpers ─────────────────────────────────────────
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Log level colors ────────────────────────────────
const LOG_LEVEL_STYLES: Record<LogEntry["level"], { dot: string; text: string }> = {
  info: {
    dot: "bg-[var(--accent-blue)]",
    text: "text-[var(--text-secondary)]",
  },
  success: {
    dot: "bg-[var(--accent-green)]",
    text: "text-[var(--accent-green)]",
  },
  error: {
    dot: "bg-[var(--accent-red)]",
    text: "text-[var(--accent-red)]",
  },
  warn: {
    dot: "bg-[var(--accent-amber)]",
    text: "text-[var(--accent-amber)]",
  },
};

// ── Status config helper ────────────────────────────
function getStatusConfig(status: string) {
  switch (status) {
    case "success":
      return {
        icon: CheckCircle,
        bg: "bg-[var(--accent-green)]/15",
        text: "text-[var(--accent-green)]",
        glow: "shadow-[0_0_25px_rgba(34,197,94,0.4)]",
        hoverGlow: "group-hover:shadow-[0_0_35px_rgba(34,197,94,0.6)]",
        border: "border-[var(--accent-green)]/30",
        label: "Success",
      };
    case "failed":
      return {
        icon: XCircle,
        bg: "bg-[var(--accent-red)]/15",
        text: "text-[var(--accent-red)]",
        glow: "shadow-[0_0_25px_rgba(239,68,68,0.4)]",
        hoverGlow: "group-hover:shadow-[0_0_35px_rgba(239,68,68,0.6)]",
        border: "border-[var(--accent-red)]/30",
        label: "Failed",
      };
    default:
      return {
        icon: Loader2,
        bg: "bg-[var(--accent-blue)]/15",
        text: "text-[var(--accent-blue)]",
        glow: "shadow-[0_0_25px_rgba(99,102,241,0.4)]",
        hoverGlow: "group-hover:shadow-[0_0_35px_rgba(99,102,241,0.6)]",
        border: "border-[var(--accent-blue)]/30",
        label: "Running",
      };
  }
}

// ── Live Log Panel ──────────────────────────────────
function LiveLogPanel({
  logs,
  status,
}: {
  logs: LogEntry[];
  status: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="px-6 pb-6 pt-0">
      <div className="rounded-xl border border-[var(--border-default)] overflow-hidden" style={{background: 'var(--log-panel-bg)'}}>
        {/* Log header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-default)]" style={{background: 'var(--log-panel-header)'}}>
          <Terminal className="w-4 h-4 text-[var(--accent-purple)]" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Execution Logs
          </span>
          <span className="text-[10px] text-[var(--text-muted)] ml-auto tabular-nums">
            {logs.length} entries
          </span>
          {status === "running" && (
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--accent-blue)] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Log entries */}
        <div
          ref={scrollRef}
          className="max-h-[320px] overflow-y-auto p-4 space-y-1.5 font-mono text-xs"
        >
          {logs.map((log, i) => {
            const levelStyle = LOG_LEVEL_STYLES[log.level];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5), duration: 0.2 }}
                className="flex items-start gap-3 py-1 group/log"
              >
                {/* Timestamp */}
                <span className="text-[var(--text-muted)] tabular-nums shrink-0 select-none">
                  [{formatTime(log.timestamp)}]
                </span>

                {/* Level dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${levelStyle.dot}`}
                />

                {/* Message */}
                <span className={`${levelStyle.text} break-all`}>
                  {log.message}
                </span>
              </motion.div>
            );
          })}

          {/* Running indicator at bottom */}
          {status === "running" && (
            <div className="flex items-center gap-3 py-1 text-[var(--accent-blue)]">
              <span className="text-[var(--text-muted)] tabular-nums shrink-0">
                [{formatTime(new Date())}]
              </span>
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              <span className="animate-pulse">Waiting for next step…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Execution Card ──────────────────────────────────
function LocalExecutionCard({ execution }: { execution: LocalExecution }) {
  const [expanded, setExpanded] = useState(execution.status === "running");
  const config = getStatusConfig(execution.status);
  const StatusIcon = config.icon;

  // Auto-expand when running
  useEffect(() => {
    if (execution.status === "running") setExpanded(true);
  }, [execution.status]);

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className="group glass-card rounded-2xl overflow-hidden"
    >
      {/* Main row */}
      <div
        className="flex items-center gap-5 p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status icon with glow */}
        <div
          className={`
            w-14 h-14 rounded-xl 
            flex items-center justify-center 
            ${config.bg} 
            border border-[var(--border-default)]
            backdrop-blur-md
            ${config.glow}
            ${config.hoverGlow}
            transition-all duration-300
            group-hover:scale-110
            group-hover:border-[var(--border-hover)]
          `}
        >
          <StatusIcon
            className={`w-7 h-7 ${config.text} drop-shadow-[0_0_8px_currentColor] ${
              execution.status === "running" ? "animate-spin" : ""
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-primary)] text-lg truncate">
            {execution.workflowName}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {execution.startedAt.toLocaleString()}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`px-4 py-2 rounded-xl text-sm font-semibold uppercase ${config.bg} ${config.text} border ${config.border} backdrop-blur-sm`}
        >
          {config.label}
        </span>

        {/* Duration */}
        {execution.finishedAt && (
          <span className="text-sm text-[var(--text-muted)] tabular-nums px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)]">
            {formatDuration(execution.startedAt, execution.finishedAt)}
          </span>
        )}

        {/* Running timer */}
        {execution.status === "running" && (
          <span className="text-sm text-[var(--accent-blue)] tabular-nums px-3 py-1 rounded-lg bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 animate-pulse">
            Live
          </span>
        )}

        {/* Expand icon */}
        {execution.logs.length > 0 && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        )}
      </div>

      {/* Live logs */}
      <AnimatePresence>
        {expanded && execution.logs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <LiveLogPanel logs={execution.logs} status={execution.status} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Backend Execution Card (from API) ───────────────
function BackendExecutionCard({ execution }: { execution: Execution }) {
  const [expanded, setExpanded] = useState(false);
  const config = getStatusConfig(execution.status);
  const StatusIcon = config.icon;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className="group glass-card rounded-2xl overflow-hidden"
    >
      {/* Main row */}
      <div
        className="flex items-center gap-5 p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={`
            w-14 h-14 rounded-xl 
            flex items-center justify-center 
            ${config.bg} 
            border border-[var(--border-default)]
            backdrop-blur-md
            ${config.glow}
            ${config.hoverGlow}
            transition-all duration-300
            group-hover:scale-110
          `}
        >
          <StatusIcon
            className={`w-7 h-7 ${config.text} drop-shadow-[0_0_8px_currentColor]`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-primary)] text-lg truncate">
            {execution.workflowName}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {new Date(execution.startedAt).toLocaleString()}
          </p>
        </div>

        <span
          className={`px-4 py-2 rounded-xl text-sm font-semibold uppercase ${config.bg} ${config.text} border ${config.border} backdrop-blur-sm`}
        >
          {config.label}
        </span>

        {execution.finishedAt && (
          <span className="text-sm text-[var(--text-muted)] tabular-nums px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)]">
            {(
              (new Date(execution.finishedAt).getTime() -
                new Date(execution.startedAt).getTime()) /
              1000
            ).toFixed(1)}
            s
          </span>
        )}

        {execution.logs.length > 0 && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        )}
      </div>

      {/* Backend logs (simple) */}
      <AnimatePresence>
        {expanded && execution.logs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0">
              <div className="rounded-xl border border-[var(--border-default)] overflow-hidden" style={{background: 'var(--log-panel-bg)'}}>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-default)]" style={{background: 'var(--log-panel-header)'}}>
                  <Terminal className="w-4 h-4 text-[var(--accent-purple)]" />
                  <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Server Logs
                  </span>
                </div>
                <div className="p-4 space-y-1.5 font-mono text-xs max-h-[240px] overflow-y-auto">
                  {execution.logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="flex items-start gap-3 py-1"
                    >
                      <span className="text-[var(--accent-purple)] font-mono text-xs bg-[var(--accent-purple)]/15 px-2 py-0.5 rounded border border-[var(--accent-purple)]/20 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[var(--text-secondary)]">{log}</span>
                    </motion.div>
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

// ── Main Page ───────────────────────────────────────
export default function ExecutionsPage() {
  // Local (in-memory) executions from the log store
  const localExecutions = useExecutions();

  // Backend executions from the API
  const [backendExecutions, setBackendExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBackendExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await executionApi.list();

    if (error) {
      setError(error);
    } else if (data) {
      setBackendExecutions(data.reverse());
    }

    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadBackendExecutions();
  }, [loadBackendExecutions]);

  // Auto-refresh backend while any local execution is running (every 2s)
  const hasRunning = localExecutions.some((ex) => ex.status === "running");

  useEffect(() => {
    if (!hasRunning) return;
    const interval = setInterval(() => {
      // No-op for backend but triggers re-render due to localExecutions reactivity
    }, 1000);
    return () => clearInterval(interval);
  }, [hasRunning]);

  // Stats
  const allCount = localExecutions.length + backendExecutions.length;
  const successCount =
    localExecutions.filter((e) => e.status === "success").length +
    backendExecutions.filter((e) => e.status === "success").length;
  const failedCount =
    localExecutions.filter((e) => e.status === "failed").length +
    backendExecutions.filter((e) => e.status === "failed").length;
  const runningCount = localExecutions.filter(
    (e) => e.status === "running"
  ).length;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-8 max-w-6xl">
          {/* Header */}
          <FadeIn>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                  Executions
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Monitor your workflow execution history and live logs
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={loadBackendExecutions}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] transition-all duration-200"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </motion.button>
            </div>
          </FadeIn>

          {/* Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-4 gap-5 mb-10"
          >
            {/* Total */}
            <motion.div
              variants={staggerItem}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="group glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-2">Total</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)]">
                    {allCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/25 to-[var(--accent-purple)]/25 border border-[var(--border-default)] backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                  <PlayCircle className="w-6 h-6 text-[var(--accent-blue)]" />
                </div>
              </div>
            </motion.div>

            {/* Running */}
            <motion.div
              variants={staggerItem}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="group glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-2">
                    Running
                  </p>
                  <p className="text-3xl font-bold text-[var(--accent-blue)]">
                    {runningCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-blue)]/15 border border-[var(--border-default)] backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                  <Loader2
                    className={`w-6 h-6 text-[var(--accent-blue)] ${
                      runningCount > 0 ? "animate-spin" : ""
                    }`}
                  />
                </div>
              </div>
            </motion.div>

            {/* Success */}
            <motion.div
              variants={staggerItem}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="group glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-2">
                    Successful
                  </p>
                  <p className="text-3xl font-bold text-[var(--accent-green)]">
                    {successCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-green)]/15 border border-[var(--border-default)] backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                  <CheckCircle className="w-6 h-6 text-[var(--accent-green)]" />
                </div>
              </div>
            </motion.div>

            {/* Failed */}
            <motion.div
              variants={staggerItem}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="group glass-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-2">Failed</p>
                  <p className="text-3xl font-bold text-[var(--accent-red)]">
                    {failedCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-red)]/15 border border-[var(--border-default)] backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  <XCircle className="w-6 h-6 text-[var(--accent-red)]" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Running banner */}
          <AnimatePresence>
            {hasRunning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20">
                  <Loader2 className="w-4 h-4 text-[var(--accent-blue)] animate-spin" />
                  <span className="text-sm text-[var(--accent-blue)] font-medium">
                    {runningCount} workflow{runningCount !== 1 ? "s" : ""}{" "}
                    currently executing — logs updating live
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[var(--accent-blue)] font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] animate-pulse" />
                    LIVE
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {localExecutions.length === 0 && loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-10 h-10 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full"
              />
            </div>
          ) : localExecutions.length === 0 &&
            backendExecutions.length === 0 &&
            !error ? (
            <FadeIn>
              <div className="text-center py-24">
                <div className="w-24 h-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-6">
                  <PlayCircle className="w-12 h-12 text-[var(--text-muted)]" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  No executions yet
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Run a workflow to see execution history and live logs
                </p>
              </div>
            </FadeIn>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-5"
            >
              {/* Local executions (live, from this session) */}
              {localExecutions.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <Terminal className="w-4 h-4 text-[var(--accent-purple)]" />
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      This Session
                    </span>
                    <div className="flex-1 h-px bg-[var(--border-default)]" />
                  </div>
                  {localExecutions.map((execution) => (
                    <LocalExecutionCard
                      key={execution.id}
                      execution={execution}
                    />
                  ))}
                </>
              )}

              {/* Backend executions (from API) */}
              {backendExecutions.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-2 mt-8">
                    <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Previous Executions
                    </span>
                    <div className="flex-1 h-px bg-[var(--border-default)]" />
                  </div>
                  {backendExecutions.map((execution) => (
                    <BackendExecutionCard
                      key={execution.id}
                      execution={execution}
                    />
                  ))}
                </>
              )}

              {/* Error for backend */}
              {error && (
                <FadeIn>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 text-sm">
                    <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] shrink-0" />
                    <span className="text-[var(--accent-amber)]">
                      Could not load server executions: {error}
                    </span>
                    <button
                      onClick={loadBackendExecutions}
                      className="ml-auto text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-colors text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </FadeIn>
              )}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}