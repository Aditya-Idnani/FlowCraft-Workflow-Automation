"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { getNodeType } from "./nodeTypes";

export type NodeStatus = "idle" | "running" | "success" | "failed";

export type CustomNodeData = {
  label: string;
  stepIndex: number;
  status: NodeStatus;
  nodeType?: string;
  config?: Record<string, any>;
};

function WorkflowNodeComponent({ data, selected }: NodeProps) {
  const { label, stepIndex, status, nodeType } = data as unknown as CustomNodeData;
  const typeInfo = nodeType ? getNodeType(nodeType) : null;
  const TypeIcon = typeInfo?.icon;

  const statusIcon = {
    idle: TypeIcon ? <TypeIcon className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />,
    running: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    success: <CheckCircle2 className="w-3.5 h-3.5" />,
    failed: <XCircle className="w-3.5 h-3.5" />,
  };

  const statusLabel = {
    idle: typeInfo ? typeInfo.label : `Step ${stepIndex + 1}`,
    running: "Running…",
    success: "Completed",
    failed: "Failed",
  };

  const handleBaseClass =
    "!w-3.5 !h-3.5 !rounded-full !border-2 transition-transform hover:!scale-[1.4]";

  return (
    <>
      {/* ── 4 handles: Left, Right, Top, Bottom ───── */}
      {/* Left = target (input) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={`${handleBaseClass} !bg-[var(--accent-purple)] !border-[var(--accent-purple)]/50 !-left-[7px]`}
        style={{ top: "50%" }}
      />
      {/* Top = target (input) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={`${handleBaseClass} !bg-[var(--accent-purple)] !border-[var(--accent-purple)]/50 !-top-[7px]`}
        style={{ left: "50%" }}
      />

      {/* Right = source (output) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={`${handleBaseClass} !bg-[var(--accent-blue)] !border-[var(--accent-blue)]/50 !-right-[7px]`}
        style={{ top: "50%" }}
      />
      {/* Bottom = source (output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={`${handleBaseClass} !bg-[var(--accent-blue)] !border-[var(--accent-blue)]/50 !-bottom-[7px]`}
        style={{ left: "50%" }}
      />

      {/* ── Node body ─────────────────────────────── */}
      <div
        className={`
          group relative px-5 py-4 min-w-[200px] rounded-2xl
          transition-all duration-300 ease-out
          cursor-grab active:cursor-grabbing

          ${status === "idle" ? `
            bg-gradient-to-br from-[var(--node-idle-bg)] to-[var(--node-idle-bg-end)]
            border border-[var(--node-idle-border)]
            shadow-[var(--glass-shadow)]
            hover:border-[var(--border-active)]
            hover:shadow-[var(--glass-shadow),0_0_20px_var(--glow-blue)]
          ` : ""}

          ${status === "running" ? `
            bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/12
            border-2 border-[var(--accent-blue)]/60
            shadow-[0_0_30px_var(--glow-blue),0_0_60px_rgba(99,102,241,0.1)]
            scale-[1.04]
          ` : ""}

          ${status === "success" ? `
            bg-gradient-to-br from-[var(--accent-green)]/15 to-[var(--accent-green)]/5
            border-2 border-[var(--accent-green)]/50
            shadow-[0_0_25px_var(--glow-green),0_0_50px_rgba(34,197,94,0.08)]
          ` : ""}

          ${status === "failed" ? `
            bg-gradient-to-br from-[var(--accent-red)]/20 to-[var(--accent-red)]/8
            border-2 border-[var(--accent-red)]/60
            shadow-[0_0_30px_var(--glow-red),0_0_60px_rgba(239,68,68,0.1)]
          ` : ""}

          ${selected ? "ring-2 ring-[var(--accent-blue)]/40" : ""}
        `}
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
        }}
      >
        {/* Running pulse ring */}
        {status === "running" && (
          <div
            className="absolute inset-0 rounded-2xl border border-[var(--accent-blue)]/40 animate-ping pointer-events-none"
            style={{ animationDuration: "1.8s" }}
          />
        )}

        {/* Header row: icon + name */}
        <div className="flex items-center gap-3">
          {/* Icon badge */}
          <div
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              transition-all duration-300 shrink-0
              ${status === "idle"
                ? "bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-purple)]/15 text-[var(--accent-blue)]"
                : ""
              }
              ${status === "running"
                ? "bg-gradient-to-br from-[var(--accent-blue)]/25 to-[var(--accent-purple)]/25 text-[var(--accent-blue)]"
                : ""
              }
              ${status === "success"
                ? "bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-green)]/10 text-[var(--accent-green)]"
                : ""
              }
              ${status === "failed"
                ? "bg-gradient-to-br from-[var(--accent-red)]/25 to-[var(--accent-red)]/10 text-[var(--accent-red)]"
                : ""
              }
            `}
          >
            {statusIcon[status]}
          </div>

          {/* Label + subtitle */}
          <div className="flex flex-col min-w-0">
            <span
              className={`
                text-sm font-semibold truncate transition-colors duration-300
                ${status === "idle" ? "text-[var(--text-primary)]" : ""}
                ${status === "running" ? "text-[var(--accent-blue)]" : ""}
                ${status === "success" ? "text-[var(--accent-green)]" : ""}
                ${status === "failed" ? "text-[var(--accent-red)]" : ""}
              `}
            >
              {label}
            </span>
            <span
              className={`
                text-[10px] font-medium uppercase tracking-wider transition-colors duration-300
                ${status === "idle" ? "text-[var(--text-muted)]" : ""}
                ${status === "running" ? "text-[var(--accent-blue)]/70" : ""}
                ${status === "success" ? "text-[var(--accent-green)]/70" : ""}
                ${status === "failed" ? "text-[var(--accent-red)]/70" : ""}
              `}
            >
              {statusLabel[status]}
            </span>
          </div>
        </div>

        {/* Status indicator dot */}
        <div
          className={`
            absolute top-3 right-3 w-2.5 h-2.5 rounded-full transition-all duration-300
            ${status === "idle" ? "bg-[var(--text-muted)]/30" : ""}
            ${status === "running" ? "bg-[var(--accent-blue)] animate-pulse shadow-[0_0_8px_var(--accent-blue)]" : ""}
            ${status === "success" ? "bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]" : ""}
            ${status === "failed" ? "bg-[var(--accent-red)] animate-pulse shadow-[0_0_8px_var(--accent-red)]" : ""}
          `}
        />
      </div>
    </>
  );
}

export default memo(WorkflowNodeComponent);
