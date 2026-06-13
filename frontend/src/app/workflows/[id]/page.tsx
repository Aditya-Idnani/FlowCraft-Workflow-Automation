"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { workflowApi, scheduleApi, type Workflow, type ScheduleInfo } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowLeft, Play, Settings2, MoreHorizontal, Pencil, ChevronRight, Home,
  Zap, Clock, Mail, Webhook, Database, Hash, AlertCircle, Plus, Minus,
  Sun, Moon, CheckCircle, XCircle, Activity, Loader2, X, RefreshCw,
  ChevronDown, MessageSquare, Globe, Cpu, Timer, Menu, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import NodeConfigPanel from "@/components/workflow/NodeConfigPanel";
import type { NodeStatus } from "@/components/workflow/CustomNode";
import type { Edge, Node } from "@xyflow/react";
import { useExecutionLogStore } from "@/context/ExecutionLogContext";
import { useRouter as useNextRouter } from "next/navigation";

type WorkflowNodeConfig = Record<string, string | number | boolean | null | undefined>;
type WorkflowNodeData = {
  label: string; stepIndex: number; status: NodeStatus;
  nodeType?: string; config?: WorkflowNodeConfig;
};
type WorkflowSelectedNode = { id: string; label: string; nodeType: string; config: WorkflowNodeConfig; };

// ── Node Palette Types ─────────────────────────────────
const TRIGGER_NODES = [
  { type: "trigger.webhook", label: "Webhook", desc: "Listen for HTTP requests", icon: Globe, color: "#6366f1" },
  { type: "trigger.schedule", label: "Schedule", desc: "Run on a defined schedule", icon: Clock, color: "#22c55e" },
  { type: "trigger.form", label: "Form Trigger", desc: "Form submission received", icon: Hash, color: "#6366f1" },
  { type: "trigger.email", label: "Email Trigger", desc: "New email received", icon: Mail, color: "#a855f7" },
  { type: "trigger.db", label: "Database Trigger", desc: "Database event occurs", icon: Database, color: "#f97316" },
];
const ACTION_NODES = [
  { type: "action.email", label: "Send Email", desc: "Send an email", icon: Mail, color: "#6366f1" },
  { type: "action.slack", label: "Slack Message", desc: "Send message to Slack", icon: MessageSquare, color: "#22c55e" },
  { type: "action.http", label: "HTTP Request", desc: "Make HTTP request", icon: Globe, color: "#6366f1" },
  { type: "action.db", label: "Database", desc: "Insert or update data", icon: Database, color: "#f97316" },
  { type: "action.delay", label: "Delay", desc: "Wait for a specific time", icon: Timer, color: "#ef4444" },
  { type: "action.condition", label: "Condition", desc: "Add conditional logic", icon: Cpu, color: "#a855f7" },
];

// ── Execution Detail Panel ─────────────────────────────
type PanelTab = "details" | "logs" | "results";

const MOCK_FLOW_NODES = [
  { name: "Webhook", time: "0.45s", icon: Globe, color: "#6366f1" },
  { name: "Parse Data", time: "0.32s", icon: Hash, color: "#6366f1" },
  { name: "Check Lead", time: "0.15s", icon: Cpu, color: "#a855f7" },
  { name: "Enrich Lead", time: "1.23s", icon: Zap, color: "#22c55e" },
  { name: "Send Email", time: "0.68s", icon: Mail, color: "#6366f1" },
  { name: "Wait 2 Days", time: "2d 0h", icon: Timer, color: "#f59e0b" },
  { name: "Follow Up Email", time: "0.75s", icon: Mail, color: "#6366f1" },
  { name: "Slack Notification", time: "0.38s", icon: MessageSquare, color: "#22c55e" },
  { name: "Update Status", time: "0.22s", icon: CheckCircle, color: "#22c55e" },
];

function ExecutionPanel({ executionId, workflowName, status, logs, onClose }: {
  executionId: string;
  workflowName: string;
  status: "success" | "failed" | "running";
  logs: { msg: string; level: string; time: string }[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<PanelTab>("details");
  const startTime = "Jan 15, 2024 10:30:45 AM";
  const duration = "8.42s";

  const statusColor = status === "success" ? "#22c55e" : status === "failed" ? "#ef4444" : "#6366f1";
  const StatusIcon = status === "success" ? CheckCircle : status === "failed" ? XCircle : Loader2;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full border-l border-[var(--border-default)]"
      style={{ width: 320, background: "var(--bg-sidebar)", minWidth: 320 }}
    >
      {/* Panel header */}
      <div className="px-5 pt-5 pb-0 border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">Execution</span>
            <span className="text-sm font-bold text-[var(--accent-blue)]">#{executionId}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${statusColor}20`, color: statusColor }}
            >
              <StatusIcon className="w-3 h-3" />
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

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "details" && (
          <div className="p-5 space-y-5">
            {/* Meta */}
            <div className="space-y-3">
              {[
                { label: "Started", value: startTime },
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
                  { label: "Total Time", value: "8.42s" },
                  { label: "Nodes Executed", value: "8 / 8" },
                  { label: "Success Rate", value: "100%" },
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
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: `${node.color}20` }}
                      >
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

            {/* View Full Logs Button */}
            <button
              onClick={() => setTab("logs")}
              className="w-full py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all"
              style={{ background: "var(--bg-card)" }}
            >
              View Full Logs
            </button>
          </div>
        )}

        {tab === "logs" && (
          <div className="p-5">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] text-center py-8">No logs yet</div>
              ) : logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-mono">
                  <span className="text-[var(--text-muted)] shrink-0">{log.time}</span>
                  <span className={
                    log.level === "error" ? "text-[var(--accent-red)]" :
                    log.level === "success" ? "text-[var(--accent-green)]" :
                    log.level === "warn" ? "text-[var(--accent-amber)]" :
                    "text-[var(--text-secondary)]"
                  }>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "results" && (
          <div className="p-5 text-center">
            <div className="py-8">
              <CheckCircle className="w-10 h-10 text-[var(--accent-green)] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Execution Complete</p>
              <p className="text-xs text-[var(--text-muted)]">All nodes completed successfully</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Node Palette Item ──────────────────────────────────
function PaletteItem({ node, onDragStart }: {
  node: { type: string; label: string; desc: string; icon: React.ElementType; color: string };
  onDragStart: (type: string, label: string) => void;
}) {
  const Icon = node.icon;
  return (
    <div
      draggable
      onDragStart={() => onDragStart(node.type, node.label)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab hover:bg-[var(--sidebar-hover-bg)] transition-colors active:cursor-grabbing group"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        style={{ background: `${node.color}20` }}>
        <Icon className="w-4 h-4" style={{ color: node.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{node.label}</p>
        <p className="text-[10px] text-[var(--text-muted)] truncate leading-tight">{node.desc}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [savingCanvas, setSavingCanvas] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "executions">("builder");
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // Execution panel state
  const [showExecPanel, setShowExecPanel] = useState(false);
  const [execStatus, setExecStatus] = useState<"success" | "failed" | "running">("success");
  const [execLogs, setExecLogs] = useState<{ msg: string; level: string; time: string }[]>([]);
  const [execId] = useState("12543");

  // Node states
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const currentEdgesRef = useRef<Edge[]>([]);
  const currentNodesRef = useRef<Node<WorkflowNodeData>[]>([]);
  const executionDone = useRef(false);
  const nodeDataMapRef = useRef<Record<string, WorkflowNodeData>>({});

  const [selectedNode, setSelectedNode] = useState<WorkflowSelectedNode | null>(null);
  const [nodeDataUpdates, setNodeDataUpdates] = useState<{ nodeId: string; data: Partial<Pick<WorkflowNodeData, "label" | "nodeType" | "config">> } | null>(null);

  const executionLogStore = useExecutionLogStore();

  const initials = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    async function loadWorkflow() {
      setLoading(true);
      const { data, error } = await workflowApi.get(workflowId);
      if (error) setError(error);
      else if (data) setWorkflow(data);
      setLoading(false);
    }
    loadWorkflow();
  }, [workflowId]);

  const handleEdgesUpdate = useCallback((edges: Edge[]) => { currentEdgesRef.current = edges; }, []);
  const handleNodesUpdate = useCallback((nodes: Node<WorkflowNodeData>[]) => { currentNodesRef.current = nodes; }, []);
  const handleNodeDataChange = useCallback((dataMap: Record<string, WorkflowNodeData>) => { nodeDataMapRef.current = dataMap; }, []);

  const handleSaveCanvas = async () => {
    if (!workflow) return;
    setSavingCanvas(true);
    try {
      const apiNodes = currentNodesRef.current.map(n => ({ id: n.id, position: n.position, data: n.data }));
      await workflowApi.saveCanvas(workflowId, apiNodes, currentEdgesRef.current);
      setSavedRecently(true);
      setTimeout(() => setSavedRecently(false), 3000);
    } catch { }
    setSavingCanvas(false);
  };

  const handleNodeClick = useCallback((nodeId: string, nodeData: WorkflowNodeData) => {
    setSelectedNode({ id: nodeId, label: nodeData.label ?? "", nodeType: nodeData.nodeType ?? "action.log", config: nodeData.config ?? {} });
  }, []);
  const handleClosePanel = useCallback(() => setSelectedNode(null), []);
  const handleNodeUpdate = useCallback((nodeId: string, updates: { label?: string; nodeType?: string; config?: WorkflowNodeConfig }) => {
    setSelectedNode(prev => prev && prev.id === nodeId ? { ...prev, ...updates } : prev);
    const newData: Partial<Pick<WorkflowNodeData, "label" | "nodeType" | "config">> = {};
    if (updates.label !== undefined) newData.label = updates.label;
    if (updates.nodeType !== undefined) newData.nodeType = updates.nodeType;
    if (updates.config !== undefined) newData.config = updates.config;
    setNodeDataUpdates({ nodeId, data: newData });
  }, []);

  const MAX_RETRIES = 3;

  const handleExecuteWorkflow = useCallback(async () => {
    if (!workflow || workflow.steps.length === 0) return;
    setExecuting(true);
    setExecStatus("running");
    setShowExecPanel(true);
    executionDone.current = false;
    setNodeStatuses({});
    setExecLogs([]);

    const execStoreId = executionLogStore.startExecution(workflowId, workflow.name);
    let workflowFailed = false;

    const edges = currentEdgesRef.current;
    const adjacency: Record<string, string[]> = {};
    const hasIncoming = new Set<string>();
    for (const step of workflow.steps) adjacency[step.id] = [];
    for (const edge of edges) {
      if (adjacency[edge.source]) adjacency[edge.source].push(edge.target);
      hasIncoming.add(edge.target);
    }
    let startNodes = workflow.steps.filter(s => !hasIncoming.has(s.id)).map(s => s.id);
    if (startNodes.length === 0) startNodes = [workflow.steps[0].id];

    const addLog = (msg: string, level: string = "info") => {
      setExecLogs(prev => [...prev, { msg, level, time: new Date().toLocaleTimeString() }]);
    };

    async function executeNodeOnce(nodeId: string) {
      const nodeData = nodeDataMapRef.current[nodeId];
      const nodeType = nodeData?.nodeType ?? "action.log";
      addLog(`Running: ${nodeData?.label ?? nodeId} (${nodeType})`, "info");
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
    }

    async function executeNodeWithRetries(nodeId: string): Promise<boolean> {
      const nodeData = nodeDataMapRef.current[nodeId];
      const nodeName = nodeData?.label ?? nodeId;
      setNodeStatuses(prev => ({ ...prev, [nodeId]: "running" }));
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await executeNodeOnce(nodeId);
          setNodeStatuses(prev => ({ ...prev, [nodeId]: "success" }));
          addLog(`✓ ${nodeName} completed`, "success");
          await new Promise(resolve => setTimeout(resolve, 150));
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          addLog(`❌ ${nodeName} failed: ${msg}`, "error");
          if (attempt < MAX_RETRIES) {
            addLog(`🔄 Retry ${attempt}/${MAX_RETRIES}…`, "warn");
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        }
      }
      setNodeStatuses(prev => ({ ...prev, [nodeId]: "failed" }));
      return false;
    }

    const visited = new Set<string>();
    const failed = new Set<string>();
    const queue = [...startNodes];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      const hasFailedUpstream = edges.some(e => e.target === nodeId && failed.has(e.source));
      if (hasFailedUpstream) {
        setNodeStatuses(prev => ({ ...prev, [nodeId]: "failed" }));
        failed.add(nodeId);
        workflowFailed = true;
        (adjacency[nodeId] || []).forEach(n => { if (!visited.has(n)) queue.push(n); });
        continue;
      }
      const success = await executeNodeWithRetries(nodeId);
      if (!success) { failed.add(nodeId); workflowFailed = true; }
      (adjacency[nodeId] || []).forEach(n => { if (!visited.has(n)) queue.push(n); });
    }
    for (const step of workflow.steps) {
      if (!visited.has(step.id)) {
        const success = await executeNodeWithRetries(step.id);
        if (!success) workflowFailed = true;
      }
    }

    await workflowApi.execute(workflowId);
    setExecuting(false);
    executionDone.current = true;
    const finalStatus = workflowFailed ? "failed" : "success";
    setExecStatus(finalStatus);
    executionLogStore.finishExecution(execStoreId, finalStatus);
    addLog(workflowFailed ? "Workflow completed with errors" : "✅ Workflow completed successfully", workflowFailed ? "error" : "success");
  }, [workflow, workflowId, executionLogStore]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <p className="text-[var(--accent-red)] mb-4">{error || "Workflow not found"}</p>
          <button onClick={() => router.push("/workflows")} className="text-[var(--accent-blue)] hover:underline text-sm">
            ← Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* ── TOP BAR ──────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between px-4 py-2 sm:h-12 border-b border-[var(--border-default)] shrink-0 z-30 gap-y-2"
        style={{ background: "var(--bg-sidebar)" }}>
        {/* Left: Breadcrumb & Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setMobilePaletteOpen(!mobilePaletteOpen)}
            className="lg:hidden p-1.5 mr-1 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-secondary)]"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => router.push("/workflows")}
            className="hover:text-[var(--text-secondary)] transition-colors"
          >
            My Workflows
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            {workflow.name}
            <button className="hover:text-[var(--accent-blue)] transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
          </span>
        </div>

        {/* Center: Builder / Executions tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border-default)]"
          style={{ background: "var(--bg-card)" }}>
          {(["builder", "executions"] as const).map(t => (
            <button key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === t
                  ? "bg-[var(--accent-blue)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Right: actions */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Saved indicator */}
          {savedRecently && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-[var(--accent-green)]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved</span>
            </motion.div>
          )}
          {!savedRecently && (
            <span className="text-xs text-[var(--text-muted)]">Saved 2m ago</span>
          )}
          <div className="w-px h-4 bg-[var(--border-default)]" />

          {/* Settings */}
          <button className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>

          {/* More */}
          <button className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Publish */}
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--accent-purple)] hover:opacity-90 transition-opacity">
            <Zap className="w-3.5 h-3.5" />
            Publish
          </button>

          {/* Test Workflow */}
          <button
            onClick={handleExecuteWorkflow}
            disabled={executing || workflow.steps.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--sidebar-hover-bg)] transition-all disabled:opacity-50"
            style={{ background: "var(--bg-card)" }}
          >
            {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {executing ? "Running..." : "Test Workflow"}
          </button>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_10px_var(--glow-purple)] overflow-hidden ml-1">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{initials}</span>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN AREA ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Palette Overlay */}
        <AnimatePresence>
          {mobilePaletteOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobilePaletteOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 left-0 bottom-0 w-[260px] flex flex-col border-r border-[var(--border-default)] shrink-0 overflow-hidden z-50 shadow-2xl"
                style={{ background: "var(--bg-sidebar)" }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
                  <span className="font-bold text-[var(--text-primary)]">Nodes</span>
                  <button onClick={() => setMobilePaletteOpen(false)} className="p-1 rounded-lg hover:bg-[var(--sidebar-hover-bg)]">
                    <X className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                </div>
                <div className="px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs text-[var(--text-muted)]"
                    style={{ background: "var(--bg-card)" }}>
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span>Search nodes...</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-4">
                  {/* Triggers section */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Zap className="w-3.5 h-3.5 text-[var(--accent-yellow)]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Triggers</span>
                    </div>
                    {TRIGGER_NODES.map(node => (
                      <PaletteItem key={node.type} node={node}
                        onDragStart={(type, label) => console.log("drag", type, label)} />
                    ))}
                  </div>
                  <div className="mx-3 my-1 border-t border-[var(--border-default)]" />
                  {/* Actions section */}
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Activity className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Actions</span>
                    </div>
                    {ACTION_NODES.map(node => (
                      <PaletteItem key={node.type} node={node}
                        onDragStart={(type, label) => console.log("drag", type, label)} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Left Panel: Node Palette */}
        <div className="hidden lg:flex w-[220px] flex-col border-r border-[var(--border-default)] shrink-0 overflow-hidden"
          style={{ background: "var(--bg-sidebar)" }}>
          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-default)] text-xs text-[var(--text-muted)]"
              style={{ background: "var(--bg-card)" }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <span>Search nodes...</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {/* Triggers section */}
            <div className="mb-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Zap className="w-3.5 h-3.5 text-[var(--accent-yellow)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Triggers</span>
              </div>
              {TRIGGER_NODES.map(node => (
                <PaletteItem key={node.type} node={node}
                  onDragStart={(type, label) => console.log("drag", type, label)} />
              ))}
            </div>

            <div className="mx-3 my-1 border-t border-[var(--border-default)]" />

            {/* Actions section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2">
                <Activity className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Actions</span>
              </div>
              {ACTION_NODES.map(node => (
                <PaletteItem key={node.type} node={node}
                  onDragStart={(type, label) => console.log("drag", type, label)} />
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="mx-2 mb-2 p-3 rounded-xl border border-[var(--accent-purple)]/25"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(99,102,241,0.08))" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-[var(--accent-purple)]">Pro Plan</span>
            </div>
            <div className="text-[9px] text-[var(--text-muted)] mb-2">12,800 / 20,000 tasks</div>
            <div className="w-full h-1 rounded-full bg-[var(--border-default)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)]"
                style={{ width: "64%" }} />
            </div>
          </div>

          {/* User */}
          <div className="px-3 pb-3 pt-2 border-t border-[var(--border-default)] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-[10px] font-bold">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[var(--text-primary)] truncate">{firstName}</p>
              <p className="text-[9px] text-[var(--text-muted)] truncate">{user?.email || "user@example.com"}</p>
            </div>
            <button onClick={() => router.push("/dashboard")} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {workflow.steps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8"
              style={{ background: "var(--canvas-bg)" }}>
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[var(--border-default)] flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--text-secondary)] mb-1">No nodes yet</p>
              <p className="text-xs text-[var(--text-muted)] max-w-xs">
                Drag triggers and actions from the left panel to start building your workflow
              </p>
            </div>
          ) : (
            <WorkflowCanvas
              steps={workflow.steps}
              initialEdges={workflow.edges}
              nodeStatuses={nodeStatuses}
              onEdgesUpdate={handleEdgesUpdate}
              onNodesUpdate={handleNodesUpdate}
              onNodeDataChange={handleNodeDataChange}
              onNodeClick={handleNodeClick}
              nodeDataUpdates={nodeDataUpdates}
            />
          )}

          {/* Canvas controls overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[var(--border-default)] z-10"
            style={{ background: "var(--bg-card)", backdropFilter: "blur(8px)" }}>
            <button className="p-1 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={handleSaveCanvas}
              className="p-1 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] transition-colors">
              <RefreshCw className={`w-4 h-4 ${savingCanvas ? "animate-spin" : ""}`} />
            </button>
            <span className="text-xs text-[var(--text-muted)] px-1 font-mono">100%</span>
            <button className="p-1 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] transition-colors">
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Mini preview */}
          <div className="absolute bottom-4 right-4 w-32 h-20 rounded-xl border border-[var(--border-default)] overflow-hidden z-10 opacity-60 hover:opacity-100 transition-opacity"
            style={{ background: "var(--canvas-bg)" }}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1 p-2 opacity-40">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-5 h-3 rounded bg-[var(--accent-purple)] opacity-60" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Execution Panel */}
        <AnimatePresence>
          {showExecPanel && (
            <div className="relative">
              <button
                onClick={() => setShowExecPanel(false)}
                className="absolute top-3 right-3 z-10 p-1 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <ExecutionPanel
                executionId={execId}
                workflowName={workflow.name}
                status={execStatus}
                logs={execLogs}
                onClose={() => setShowExecPanel(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Node Config Panel (overlay) */}
      <NodeConfigPanel
        node={selectedNode}
        onClose={handleClosePanel}
        onUpdate={handleNodeUpdate}
      />
    </div>
  );
}