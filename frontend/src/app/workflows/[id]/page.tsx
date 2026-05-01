"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { workflowApi, scheduleApi, type Workflow, type ScheduleInfo } from "@/lib/api";
import { DashboardLayout } from "@/components/layout";
import { ArrowLeft, Plus, Play, Layers, Circle, Trash2, Link2, Clock } from "lucide-react";
import {
  motion,
  AnimatePresence,
  PageTransition,
  FadeIn,
  listItemVariants,
} from "@/components/motion";
import WorkflowCanvas from "@/components/workflow/WorkflowCanvas";
import NodeConfigPanel, { type SelectedNodeInfo } from "@/components/workflow/NodeConfigPanel";
import type { NodeStatus } from "@/components/workflow/CustomNode";
import type { Edge } from "@xyflow/react";
import { useExecutionLogStore } from "@/context/ExecutionLogContext";
import SchedulePanel from "@/components/workflow/SchedulePanel";

export default function WorkflowBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [newStepName, setNewStepName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [addingStep, setAddingStep] = useState(false);

  // Node execution status map: stepId -> NodeStatus
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>(
    {}
  );
  // Track current edges from canvas (auto + user-drawn)
  const currentEdgesRef = useRef<Edge[]>([]);
  const currentNodesRef = useRef<Node[]>([]);
  const executionDone = useRef(false);
  // Track node data (nodeType + config) from canvas
  const nodeDataMapRef = useRef<Record<string, any>>({});
  const [savingCanvas, setSavingCanvas] = useState(false);

  // Execution log store
  const executionLogStore = useExecutionLogStore();

  // Config panel state
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [nodeDataUpdates, setNodeDataUpdates] = useState<{ nodeId: string; data: any } | null>(null);

  // Load workflow
  useEffect(() => {
    async function loadWorkflow() {
      setLoading(true);
      setError(null);

      const { data, error } = await workflowApi.get(workflowId);

      if (error) {
        setError(error);
      } else if (data) {
        setWorkflow(data);
      }

      setLoading(false);
    }

    loadWorkflow();
  }, [workflowId]);

  // Add step
  const handleAddStep = async () => {
    if (!newStepName.trim()) return;

    setAddingStep(true);
    const { data, error } = await workflowApi.addStep(workflowId, newStepName);
    setAddingStep(false);

    if (error) {
      alert(`Error: ${error}`);
      return;
    }

    if (data) {
      setWorkflow(data);
      setNewStepName("");
      setNodeStatuses({});
    }
  };

  // Remove step
  const handleRemoveStep = async (stepId: string) => {
    const { data, error } = await workflowApi.removeStep(workflowId, stepId);

    if (error) {
      alert(`Error: ${error}`);
      return;
    }

    if (data) {
      setWorkflow(data);
      setNodeStatuses((prev) => {
        const next = { ...prev };
        delete next[stepId];
        return next;
      });
    }
  };

  // Track edges from canvas
  const handleEdgesUpdate = useCallback((edges: Edge[]) => {
    currentEdgesRef.current = edges;
  }, []);

  // Track nodes from canvas
  const handleNodesUpdate = useCallback((nodes: Node[]) => {
    currentNodesRef.current = nodes;
  }, []);

  // Track node data from canvas
  const handleNodeDataChange = useCallback((dataMap: Record<string, any>) => {
    nodeDataMapRef.current = dataMap;
  }, []);

  // ── Save Canvas ─────────────────────────────────────
  const handleSaveCanvas = async () => {
    if (!workflow) return;
    setSavingCanvas(true);
    try {
      const apiNodes = currentNodesRef.current.map(n => ({
        id: n.id,
        position: n.position,
        data: n.data
      }));
      await workflowApi.saveCanvas(workflowId as string, apiNodes, currentEdgesRef.current);
      // alert("Canvas layout saved successfully!");
    } catch (err) {
      alert("Failed to save layout");
      console.error(err);
    }
    setSavingCanvas(false);
  };

  // ── Config panel handlers ───────────────────────────
  const handleNodeClick = useCallback((nodeId: string, nodeData: any) => {
    setSelectedNode({
      id: nodeId,
      label: nodeData.label ?? "",
      nodeType: nodeData.nodeType ?? "action.log",
      config: nodeData.config ?? {},
    });
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: { label?: string; nodeType?: string; config?: Record<string, any> }) => {
    // Update panel state immediately
    setSelectedNode((prev) => {
      if (!prev || prev.id !== nodeId) return prev;
      return {
        ...prev,
        ...updates,
      };
    });
    // Push update to canvas
    const newData: any = {};
    if (updates.label !== undefined) newData.label = updates.label;
    if (updates.nodeType !== undefined) newData.nodeType = updates.nodeType;
    if (updates.config !== undefined) newData.config = updates.config;
    setNodeDataUpdates({ nodeId, data: newData });
  }, []);

  // ── BFS-based graph execution ───────────────────────
  const MAX_RETRIES = 3;

  const handleExecuteWorkflow = useCallback(async () => {
    if (!workflow || workflow.steps.length === 0) return;

    setExecuting(true);
    executionDone.current = false;
    setNodeStatuses({});

    // Start a new execution in the log store
    const execId = executionLogStore.startExecution(workflowId, workflow.name);

    // Track if any node permanently failed
    let workflowFailed = false;

    // Build adjacency list from current edges
    const edges = currentEdgesRef.current;
    const adjacency: Record<string, string[]> = {};
    const hasIncoming = new Set<string>();

    for (const step of workflow.steps) {
      adjacency[step.id] = [];
    }

    for (const edge of edges) {
      if (adjacency[edge.source]) {
        adjacency[edge.source].push(edge.target);
      }
      hasIncoming.add(edge.target);
    }

    // Find start nodes (no incoming edges)
    let startNodes = workflow.steps
      .filter((s) => !hasIncoming.has(s.id))
      .map((s) => s.id);

    // Fallback: if no clear start, use first step
    if (startNodes.length === 0) {
      startNodes = [workflow.steps[0].id];
    }

    // ── Type-aware node execution (single attempt) ───
    // Throws on failure so the retry wrapper can catch it.
    async function executeNodeOnce(nodeId: string, execId: string) {
      const nodeData = nodeDataMapRef.current[nodeId];
      const nodeType: string = nodeData?.nodeType ?? "action.log";
      const config = nodeData?.config ?? {};

      switch (nodeType) {
        case "trigger.start":
          console.log(`[FlowCraft] ▶ Trigger started: ${nodeData?.label ?? nodeId}`);
          executionLogStore.addLog(execId, `▶ Trigger started: ${nodeData?.label ?? nodeId}`);
          await new Promise((resolve) => setTimeout(resolve, 300));
          break;

        case "action.log":
          console.log(`[FlowCraft] 📝 Log: ${config.message ?? "(no message)"}`);
          executionLogStore.addLog(execId, `📝 Log: ${config.message ?? "(no message)"}`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          break;

        case "action.delay": {
          const delayMs = Number(config.time) || 1000;
          console.log(`[FlowCraft] ⏱ Delay: ${delayMs}ms`);
          executionLogStore.addLog(execId, `⏱ Waiting ${delayMs}ms…`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          executionLogStore.addLog(execId, `⏱ Delay complete`);
          break;
        }

        case "action.telegram": {
          const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"; // ← Replace with your bot token
          const chatId = config.chatId;
          const message = config.message || "Hello from FlowCraft";

          if (!chatId) {
            console.warn(`[FlowCraft] ⚠ Telegram: No chat ID configured, skipping send.`);
            executionLogStore.addLog(execId, `⚠ Telegram: No chat ID configured, skipping`, "warn");
            break;
          }

          console.log(`[FlowCraft] 📨 Telegram: Sending to chat ${chatId}…`);
          const res = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "HTML",
              }),
            }
          );
          const result = await res.json();
          if (!result.ok) {
            // Throw so the retry system catches it
            throw new Error(`Telegram API error: ${result.description}`);
          }
          console.log(`[FlowCraft] ✅ Telegram: Message sent successfully`);
          executionLogStore.addLog(execId, `✅ Telegram: Message sent successfully`, "success");
          break;
        }

        default:
          console.log(`[FlowCraft] ⚡ Executing: ${nodeData?.label ?? nodeId}`);
          executionLogStore.addLog(execId, `⚡ Executing: ${nodeData?.label ?? nodeId}`);
          await new Promise((resolve) => setTimeout(resolve, 800));
          break;
      }
    }

    // ── Retry wrapper ────────────────────────────────
    // Returns true if the node eventually succeeded, false if permanently failed.
    async function executeNodeWithRetries(nodeId: string): Promise<boolean> {
      const nodeData = nodeDataMapRef.current[nodeId];
      const nodeType: string = nodeData?.nodeType ?? "action.log";
      const nodeName = nodeData?.label ?? nodeId;

      // Set running
      setNodeStatuses((prev) => ({ ...prev, [nodeId]: "running" }));
      executionLogStore.addLog(execId, `Running: ${nodeName} (${nodeType})`);

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await executeNodeOnce(nodeId, execId);

          // ✅ Success
          setNodeStatuses((prev) => ({ ...prev, [nodeId]: "success" }));
          if (attempt > 1) {
            executionLogStore.addLog(execId, `✓ ${nodeName} succeeded on retry ${attempt - 1}/${MAX_RETRIES}`, "success");
          } else {
            executionLogStore.addLog(execId, `✓ ${nodeName} completed`, "success");
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
          return true;
        } catch (err: any) {
          const errorMsg = err?.message ?? String(err);
          console.error(`[FlowCraft] ❌ ${nodeName} failed (attempt ${attempt}/${MAX_RETRIES}):`, errorMsg);
          executionLogStore.addLog(execId, `❌ ${nodeName} failed: ${errorMsg}`, "error");

          if (attempt < MAX_RETRIES) {
            executionLogStore.addLog(execId, `🔄 Retry ${attempt}/${MAX_RETRIES} for ${nodeName}…`, "warn");
            // Brief pause before retry
            await new Promise((resolve) => setTimeout(resolve, 600));
          }
        }
      }

      // ❌ All retries exhausted — permanently failed
      setNodeStatuses((prev) => ({ ...prev, [nodeId]: "failed" }));
      executionLogStore.addLog(
        execId,
        `💀 ${nodeName} failed after ${MAX_RETRIES} attempts — skipping downstream nodes`,
        "error"
      );
      return false;
    }

    // BFS traversal
    const visited = new Set<string>();
    const failed = new Set<string>(); // Track failed nodes to skip downstream
    const queue = [...startNodes];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      // Check if any upstream node (source of an edge targeting this node) failed
      const hasFailedUpstream = edges.some(
        (e) => e.target === nodeId && failed.has(e.source)
      );

      if (hasFailedUpstream) {
        // Skip — mark as failed without executing
        setNodeStatuses((prev) => ({ ...prev, [nodeId]: "failed" }));
        const nodeName = nodeDataMapRef.current[nodeId]?.label ?? nodeId;
        executionLogStore.addLog(execId, `⏭ Skipped ${nodeName} (upstream node failed)`, "warn");
        failed.add(nodeId);
        workflowFailed = true;

        // Still enqueue neighbors so they get marked as skipped too
        const neighbors = adjacency[nodeId] || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) queue.push(neighbor);
        }
        continue;
      }

      const success = await executeNodeWithRetries(nodeId);

      if (!success) {
        failed.add(nodeId);
        workflowFailed = true;
      }

      // Enqueue neighbors
      const neighbors = adjacency[nodeId] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    // Execute any nodes not reached by BFS (disconnected nodes)
    for (const step of workflow.steps) {
      if (!visited.has(step.id)) {
        const success = await executeNodeWithRetries(step.id);
        if (!success) workflowFailed = true;
      }
    }

    // Call backend API
    const { data, error } = await workflowApi.execute(workflowId);

    setExecuting(false);
    executionDone.current = true;

    if (error || workflowFailed) {
      executionLogStore.finishExecution(execId, "failed");
      if (error) {
        alert(`Execution failed: ${error}`);
      }
      return;
    }

    executionLogStore.finishExecution(execId, "success");
  }, [workflow, workflowId, executionLogStore]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !workflow) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div className="p-8">
            <p className="text-[var(--accent-red)] mb-4">
              {error || "Workflow not found"}
            </p>
            <button
              onClick={() => router.push("/workflows")}
              className="flex items-center gap-2 text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workflows
            </button>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  const mainContent = (
    <DashboardLayout>
      <PageTransition>
        <div className="p-8 max-w-7xl">
          {/* Header */}
          <FadeIn>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/workflows")}
                  className="p-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    {workflow.name}
                  </h1>
                  <p className="text-sm text-[var(--text-muted)]">
                    {workflow.steps.length} step
                    {workflow.steps.length !== 1 ? "s" : ""} configured
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveCanvas}
                  disabled={savingCanvas || workflow.steps.length === 0}
                  className="px-5 py-3 rounded-xl text-sm font-medium border border-[var(--border-default)] text-[var(--text-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingCanvas ? "Saving..." : "Save Canvas"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExecuteWorkflow}
                  disabled={executing || workflow.steps.length === 0}
                  className={`flex items-center gap-2 bg-gradient-to-r from-[var(--accent-green)] to-emerald-500 px-6 py-3 rounded-xl text-white font-medium shadow-[0_0_30px_var(--glow-green)] hover:shadow-[0_0_50px_var(--glow-green)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${executing ? "animate-pulse-glow" : ""}`}
                >
                  <Play
                    className={`w-5 h-5 ${executing ? "animate-pulse" : ""}`}
                  />
                  {executing ? "Executing..." : "Execute"}
                </motion.button>
              </div>
            </div>
          </FadeIn>

          {/* Visual Workflow Canvas */}
          <FadeIn delay={0.1}>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-purple)]/15 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[var(--accent-blue)]" />
                </div>
                Workflow Builder
              </h2>

              {workflow.steps.length === 0 ? (
                <div
                  className="rounded-2xl border-2 border-dashed border-[var(--border-default)] overflow-hidden"
                  style={{
                    height: "500px",
                    background: "var(--canvas-bg)",
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-4">
                      <Circle className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-[var(--text-secondary)] mb-2">
                      No steps configured
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Add your first step to build the workflow
                    </p>
                  </div>
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
            </div>
          </FadeIn>

          {/* Bottom panel: Add step + Schedule + Steps list */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Add Step Panel */}
            <FadeIn delay={0.2}>
              <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_50px_var(--glow-blue)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)]/15 to-[var(--accent-cyan)]/15 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[var(--accent-purple)]" />
                  </div>
                  Add Step
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={newStepName}
                    onChange={(e) => setNewStepName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
                    placeholder="e.g., Send email notification"
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_20px_var(--glow-blue)] transition-all duration-200"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddStep}
                    disabled={addingStep || !newStepName.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] px-6 py-3 rounded-xl text-white font-medium shadow-[0_0_25px_var(--glow-blue)] hover:shadow-[0_0_40px_var(--glow-purple)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Plus className="w-5 h-5" />
                    {addingStep ? "Adding..." : "Add Step"}
                  </motion.button>
                </div>

                {/* Quick tips */}
                <div className="mt-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]">
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                    💡 Quick tips
                  </p>
                  <ul className="text-xs text-[var(--text-muted)] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent-purple)]">•</span>
                      Drag nodes to rearrange freely
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent-purple)]">•</span>
                      Drag from handles to connect nodes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent-purple)]">•</span>
                      Execute follows graph connections
                    </li>
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* Schedule Panel */}
            <FadeIn delay={0.25}>
              <SchedulePanel
                workflowId={workflowId}
                workflowName={workflow.name}
              />
            </FadeIn>

            {/* Steps List (compact) */}
            <FadeIn delay={0.3} className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_50px_var(--glow-blue)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-purple)]/15 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-[var(--accent-blue)]" />
                  </div>
                  Steps
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    ({workflow.steps.length})
                  </span>
                </h2>

                {workflow.steps.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] py-4">
                    No steps yet. Add one to get started.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    <AnimatePresence mode="popLayout">
                      {workflow.steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          layout
                          variants={listItemVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] transition-all duration-200"
                        >
                          {/* Step index badge */}
                          <div
                            className={`
                              w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                              transition-all duration-300
                              ${
                                nodeStatuses[step.id] === "success"
                                  ? "bg-[var(--accent-green)]/20 text-[var(--accent-green)]"
                                  : nodeStatuses[step.id] === "failed"
                                    ? "bg-[var(--accent-red)]/20 text-[var(--accent-red)]"
                                    : nodeStatuses[step.id] === "running"
                                      ? "bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] animate-pulse"
                                      : "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                              }
                            `}
                          >
                            {nodeStatuses[step.id] === "success"
                              ? "✓"
                              : nodeStatuses[step.id] === "failed"
                                ? "✕"
                                : index + 1}
                          </div>

                          <span className="flex-1 text-sm text-[var(--text-primary)] font-medium truncate">
                            {step.name}
                          </span>

                          {/* Status badge pill */}
                          {nodeStatuses[step.id] && nodeStatuses[step.id] !== "idle" && (
                            <span
                              className={`
                                text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0
                                transition-all duration-300
                                ${nodeStatuses[step.id] === "success"
                                  ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)] shadow-[0_0_8px_var(--glow-green)]"
                                  : nodeStatuses[step.id] === "failed"
                                    ? "bg-[var(--accent-red)]/15 text-[var(--accent-red)] shadow-[0_0_8px_var(--glow-red)]"
                                    : "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] shadow-[0_0_8px_var(--glow-blue)] animate-pulse"
                                }
                              `}
                            >
                              {nodeStatuses[step.id]}
                            </span>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveStep(step.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/15 transition-all duration-200"
                            title="Remove step"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );

  return (
    <>
      {mainContent}
      <NodeConfigPanel
        node={selectedNode}
        onClose={handleClosePanel}
        onUpdate={handleNodeUpdate}
      />
    </>
  );
}