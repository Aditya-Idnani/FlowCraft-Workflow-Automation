"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode, { type NodeStatus } from "./CustomNode";
import { getNodeType } from "./nodeTypes";

type Step = {
  id: string;
  name: string;
};

type WorkflowCanvasProps = {
  steps: Step[];
  nodeStatuses: Record<string, NodeStatus>;
  onEdgesUpdate?: (edges: Edge[]) => void;
  onNodesUpdate?: (nodes: Node[]) => void;
  onNodeDataChange?: (nodeDataMap: Record<string, any>) => void;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
  nodeDataUpdates?: { nodeId: string; data: any } | null;
  initialEdges?: any[];
};

const nodeTypes = { workflowNode: CustomNode };

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  animated: false,
  style: {
    strokeWidth: 2,
    stroke: "var(--canvas-edge)",
  },
};

/* ── Helper: build nodes from steps ─────────────────── */
function buildNodesFromSteps(
  steps: any[],
  statuses: Record<string, NodeStatus>
): Node[] {
  return steps.map((step, index) => {
    const nodeType = step.nodeType || (index === 0 ? "trigger.start" : "action.log");
    const typeInfo = getNodeType(nodeType);
    
    let posX = step.positionX;
    let posY = step.positionY;
    
    // Treat (0,0) or null as "not set", and fallback to index * 300 to prevent overlap
    if ((posX == null && posY == null) || (posX === 0 && posY === 0)) {
      posX = index * 300;
      posY = 120;
    } else {
      posX = posX ?? index * 300;
      posY = posY ?? 120;
    }

    return {
      id: step.id,
      type: "workflowNode",
      position: { x: posX, y: posY },
      data: {
        label: step.name,
        stepIndex: index,
        status: statuses[step.id] ?? "idle",
        nodeType,
        config: step.config ?? { ...typeInfo.defaultConfig },
      },
      draggable: true,
    };
  });
}

/* ── Helper: build linear edges from steps ────────────── */
/* ── Helper: build edges from backend or default ────────────── */
function buildInitialEdges(steps: any[], initialEdges?: any[]): Edge[] {
  if (initialEdges && initialEdges.length > 0) {
    return initialEdges.map(e => ({
      ...e,
      type: "smoothstep",
      style: { strokeWidth: 2, stroke: "var(--canvas-edge)" },
    }));
  }
  return steps.slice(0, -1).map((step, index) => {
    const nextStep = steps[index + 1];
    return {
      id: `e-${step.id}-${nextStep.id}`,
      source: step.id,
      sourceHandle: "right",
      target: nextStep.id,
      targetHandle: "left",
      type: "smoothstep",
      style: { strokeWidth: 2, stroke: "var(--canvas-edge)" },
    };
  });
}

export default function WorkflowCanvas({
  steps,
  nodeStatuses,
  onEdgesUpdate,
  onNodesUpdate,
  onNodeDataChange,
  onNodeClick,
  nodeDataUpdates,
  initialEdges,
}: WorkflowCanvasProps) {
  // ── Track which step IDs we initialized with ──────
  const initializedStepIdsRef = useRef<string>("");

  // ── React Flow controlled state ───────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // ── Keep a ref to latest edges for parent to read ─
  const edgesRef = useRef<Edge[]>([]);
  edgesRef.current = edges;

  // ── Keep a ref to latest nodes for parent to read ─
  const nodesRef = useRef<Node[]>([]);
  nodesRef.current = nodes;

  // ──────────────────────────────────────────────────
  // INIT: Only run when the *set* of step IDs changes
  // (i.e., step added/removed). NOT on status changes.
  // ──────────────────────────────────────────────────
  useEffect(() => {
    const currentIds = steps.map((s) => s.id).join(",");
    if (currentIds === initializedStepIdsRef.current) {
      if (nodes.length !== steps.length) {
         // handle edge case where initialization failed previously
      } else {
        return; // No change in step set 
      }
    }
    initializedStepIdsRef.current = currentIds;

    // Build fresh nodes + generic edges or loaded edges
    let freshNodes = buildNodesFromSteps(steps, nodeStatuses);
    const freshEdges = buildInitialEdges(steps, initialEdges);

    // Merge with current positions to keep untracked dragged states
    if (nodesRef.current.length > 0) {
      const existingMap = new Map(nodesRef.current.map(n => [n.id, n]));
      let maxX = Math.max(...nodesRef.current.map(n => n.position.x), 0);
      
      freshNodes = freshNodes.map(fn => {
        const existing = existingMap.get(fn.id);
        if (existing) {
          fn.position = existing.position; // Preserve manually dragged position
        } else {
          // New node: place it after the last node
          maxX += 300;
          fn.position = { x: maxX, y: 120 };
        }
        return fn;
      });
    }

    setNodes(freshNodes);
    setEdges(freshEdges);
    onEdgesUpdate?.(freshEdges);
    onNodesUpdate?.(freshNodes);

    // Emit initial node data map to parent
    const dataMap: Record<string, any> = {};
    for (const n of freshNodes) {
      dataMap[n.id] = n.data;
    }
    onNodeDataChange?.(dataMap);
  }, [steps, nodeStatuses, setNodes, setEdges, onEdgesUpdate, onNodesUpdate, onNodeDataChange, initialEdges]);

  // ──────────────────────────────────────────────────
  // STATUS SYNC: Update node data when statuses change
  // WITHOUT touching positions or edges
  // ──────────────────────────────────────────────────
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const stepIdx = steps.findIndex((s) => s.id === node.id);
        const newStatus = nodeStatuses[node.id] ?? "idle";

        // Only update if data actually changed
        if (
          node.data.status === newStatus &&
          node.data.stepIndex === stepIdx
        ) {
          return node;
        }

        return {
          ...node,
          data: {
            ...node.data,
            status: newStatus,
            stepIndex: stepIdx >= 0 ? stepIdx : node.data.stepIndex,
          },
        };
      })
    );
  }, [nodeStatuses, steps, setNodes]);

  // ──────────────────────────────────────────────────
  // EDGE STYLING: Apply glow/animation based on status
  // This creates styled copies for display WITHOUT
  // modifying the underlying edge state.
  // ──────────────────────────────────────────────────
  const getStyledEdges = useCallback((): Edge[] => {
    return edges.map((edge) => {
      const sourceStatus = nodeStatuses[edge.source] ?? "idle";
      const targetStatus = nodeStatuses[edge.target] ?? "idle";
      const isActive = sourceStatus === "success";
      const isRunning = targetStatus === "running";
      const isFailed = sourceStatus === "failed" || targetStatus === "failed";

      return {
        ...edge,
        animated: isRunning,
        style: {
          ...edge.style,
          stroke: isFailed
            ? "var(--accent-red)"
            : isActive
              ? "var(--canvas-edge-active)"
              : isRunning
                ? "var(--canvas-edge-running)"
                : "var(--canvas-edge)",
          strokeWidth: isActive || isRunning || isFailed ? 3 : 2,
          filter: isFailed
            ? "drop-shadow(0 0 6px var(--glow-red))"
            : isActive
              ? "drop-shadow(0 0 6px var(--glow-green))"
              : isRunning
                ? "drop-shadow(0 0 6px var(--glow-blue))"
                : "none",
          transition:
            "stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease",
        },
      };
    });
  }, [edges, nodeStatuses]);

  // ──────────────────────────────────────────────────
  // CONNECTION: When user draws a new edge
  // ──────────────────────────────────────────────────
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        // Prevent duplicate edges
        const exists = eds.some(
          (e) =>
            e.source === connection.source &&
            e.target === connection.target &&
            e.sourceHandle === connection.sourceHandle &&
            e.targetHandle === connection.targetHandle
        );
        if (exists) return eds;

        const newEdges = addEdge(
          {
            ...connection,
            type: "smoothstep",
            id: `user-${connection.source}-${connection.sourceHandle ?? "r"}-${connection.target}-${connection.targetHandle ?? "l"}-${Date.now()}`,
            style: { strokeWidth: 2, stroke: "var(--canvas-edge)" },
          },
          eds
        );
        onEdgesUpdate?.(newEdges);
        return newEdges;
      });
    },
    [setEdges, onEdgesUpdate]
  );

  // ──────────────────────────────────────────────────
  // EDGE CHANGE: Keep parent in sync when edges are
  // deleted/modified via React Flow UI
  // ──────────────────────────────────────────────────
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      requestAnimationFrame(() => {
        onEdgesUpdate?.(edgesRef.current);
      });
    },
    [onEdgesChange, onEdgesUpdate]
  );
  
  // ──────────────────────────────────────────────────
  // NODE CHANGE: Track positions
  // ──────────────────────────────────────────────────
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      requestAnimationFrame(() => {
        onNodesUpdate?.(nodesRef.current);
      });
    },
    [onNodesChange, onNodesUpdate]
  );

  // ──────────────────────────────────────────────────
  // NODE DATA UPDATE: Apply changes from config panel
  // ──────────────────────────────────────────────────
  useEffect(() => {
    if (!nodeDataUpdates) return;
    const { nodeId, data: newData } = nodeDataUpdates;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n;
        const updated = { ...n, data: { ...n.data, ...newData } };
        return updated;
      })
    );
    // Also sync the parent's nodeDataMap
    requestAnimationFrame(() => {
      const dataMap: Record<string, any> = {};
      for (const n of nodes) {
        dataMap[n.id] = n.id === nodeId ? { ...n.data, ...newData } : n.data;
      }
      onNodeDataChange?.(dataMap);
    });
  }, [nodeDataUpdates, setNodes]); // intentionally minimal deps to avoid loops

  // ──────────────────────────────────────────────────
  // NODE CLICK: Fire callback to parent
  // ──────────────────────────────────────────────────
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id, node.data);
    },
    [onNodeClick]
  );

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-default)]"
      style={{
        height: "500px",
        background: "var(--canvas-bg)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "var(--glass-shadow), var(--glass-inset)",
      }}
    >
      {/* Ambient decorative blobs */}
      <div className="glow-blob absolute -top-20 -left-20 w-48 h-48 bg-[var(--accent-purple)] animate-float-slow" />
      <div className="glow-blob absolute -bottom-16 -right-16 w-40 h-40 bg-[var(--accent-blue)] animate-float-reverse" />

      <ReactFlow
        nodes={nodes}
        edges={getStyledEdges()}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.5, maxZoom: 1.5 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2.5}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        panOnDrag
        zoomOnScroll
        selectNodesOnDrag={false}
        className="workflow-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--canvas-dot)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{ width: 140, height: 90 }}
        />
      </ReactFlow>
    </div>
  );
}
