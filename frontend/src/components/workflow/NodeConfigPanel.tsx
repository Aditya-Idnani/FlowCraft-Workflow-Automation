"use client";

import { X, Settings2 } from "lucide-react";
import { getNodeType, NODE_TYPE_REGISTRY } from "./nodeTypes";

export type SelectedNodeInfo = {
  id: string;
  label: string;
  nodeType: string;
  config: Record<string, any>;
};

type NodeConfigPanelProps = {
  node: SelectedNodeInfo | null;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: { label?: string; nodeType?: string; config?: Record<string, any> }) => void;
};

export default function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  if (!node) return null;

  const typeInfo = getNodeType(node.nodeType);

  const handleTypeChange = (newTypeId: string) => {
    const newType = getNodeType(newTypeId);
    onUpdate(node.id, {
      nodeType: newTypeId,
      config: { ...newType.defaultConfig },
    });
  };

  const handleConfigChange = (key: string, value: string | number) => {
    onUpdate(node.id, {
      config: { ...node.config, [key]: value },
    });
  };

  const handleLabelChange = (newLabel: string) => {
    onUpdate(node.id, { label: newLabel });
  };

  const TypeIcon = typeInfo.icon;

  return (
    <div
      className="fixed top-0 right-0 h-full w-[380px] z-50 flex flex-col border-l border-[var(--border-default)]"
      style={{
        background: "var(--bg-secondary)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.2)",
        animation: "slideInRight 0.25s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-purple)]/15 flex items-center justify-center">
            <Settings2 className="w-4.5 h-4.5 text-[var(--accent-blue)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Node Config</h3>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{typeInfo.label}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Step Name */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
            Step Name
          </label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_12px_var(--glow-blue)] outline-none transition-all duration-200"
          />
        </div>

        {/* Node Type Selector */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
            Node Type
          </label>
          <div className="space-y-1.5">
            {NODE_TYPE_REGISTRY.filter(t => !t.placeholder).map((t) => {
              const Icon = t.icon;
              const isSelected = t.id === node.nodeType;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30 text-[var(--accent-blue)]"
                      : "bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{t.label}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block truncate">{t.description}</span>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Config Fields */}
        {typeInfo.configFields.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              Configuration
            </label>
            <div className="space-y-3">
              {typeInfo.configFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={String(node.config[field.key] ?? field.defaultValue ?? "")}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_12px_var(--glow-blue)] outline-none transition-all duration-200 resize-none"
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={String(node.config[field.key] ?? field.defaultValue ?? "")}
                      onChange={(e) =>
                        handleConfigChange(
                          field.key,
                          field.type === "number" ? Number(e.target.value) : e.target.value
                        )
                      }
                      placeholder={field.placeholder}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_12px_var(--glow-blue)] outline-none transition-all duration-200"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live preview badge */}
        <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]">
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
            <span className="text-xs font-medium text-[var(--text-secondary)]">Preview</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {node.nodeType === "trigger.start" && "This node starts the workflow execution."}
            {node.nodeType === "action.log" && `Will log: "${node.config.message || "(empty)"}"`}
            {node.nodeType === "action.delay" && `Will wait ${node.config.time || 1000}ms before continuing.`}
            {node.nodeType === "action.telegram" && `Will send "${node.config.message || "(empty)"}" to chat ${node.config.chatId || "(no chat ID)"}`}
            {node.nodeType === "trigger.webhook" && `Listening at: ${node.config.webhookUrl || "/api/webhook"}`}
            {!["trigger.start", "action.log", "action.delay", "action.telegram", "trigger.webhook"].includes(node.nodeType) && `Type: ${typeInfo.label}`}
          </p>
        </div>
      </div>
    </div>
  );
}
