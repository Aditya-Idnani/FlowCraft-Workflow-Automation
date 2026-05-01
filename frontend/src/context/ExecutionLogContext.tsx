"use client";

import { createContext, useContext, useCallback, useRef, useSyncExternalStore } from "react";

// ── Types ───────────────────────────────────────────
export type LogEntry = {
  timestamp: Date;
  message: string;
  level: "info" | "success" | "error" | "warn";
};

export type LocalExecution = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "running" | "success" | "failed";
  startedAt: Date;
  finishedAt?: Date;
  logs: LogEntry[];
};

type ExecutionLogStore = {
  /** Start a new execution — returns its ID */
  startExecution: (workflowId: string, workflowName: string) => string;
  /** Append a log entry to a running execution */
  addLog: (executionId: string, message: string, level?: LogEntry["level"]) => void;
  /** Mark execution as completed */
  finishExecution: (executionId: string, status: "success" | "failed") => void;
  /** Get all executions (most recent first) */
  getExecutions: () => LocalExecution[];
  /** Get a single execution */
  getExecution: (executionId: string) => LocalExecution | undefined;
  /** Subscribe to changes */
  subscribe: (listener: () => void) => () => void;
};

// ── Store implementation (external to React for useSyncExternalStore) ──
function createExecutionLogStore(): ExecutionLogStore {
  let executions: LocalExecution[] = [];
  const listeners = new Set<() => void>();

  function emit() {
    for (const listener of listeners) listener();
  }

  return {
    startExecution(workflowId, workflowName) {
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const execution: LocalExecution = {
        id,
        workflowId,
        workflowName,
        status: "running",
        startedAt: new Date(),
        logs: [
          {
            timestamp: new Date(),
            message: `Workflow "${workflowName}" started`,
            level: "info",
          },
        ],
      };
      executions = [execution, ...executions];
      emit();
      return id;
    },

    addLog(executionId, message, level = "info") {
      executions = executions.map((ex) =>
        ex.id === executionId
          ? {
              ...ex,
              logs: [...ex.logs, { timestamp: new Date(), message, level }],
            }
          : ex
      );
      emit();
    },

    finishExecution(executionId, status) {
      executions = executions.map((ex) =>
        ex.id === executionId
          ? {
              ...ex,
              status,
              finishedAt: new Date(),
              logs: [
                ...ex.logs,
                {
                  timestamp: new Date(),
                  message: status === "success" ? "Workflow completed successfully" : "Workflow failed",
                  level: status === "success" ? "success" : "error",
                },
              ],
            }
          : ex
      );
      emit();
    },

    getExecutions() {
      return executions;
    },

    getExecution(executionId) {
      return executions.find((ex) => ex.id === executionId);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// ── Singleton store ─────────────────────────────────
const store = createExecutionLogStore();

// ── Context ─────────────────────────────────────────
const ExecutionLogContext = createContext<ExecutionLogStore>(store);

export function ExecutionLogProvider({ children }: { children: React.ReactNode }) {
  return (
    <ExecutionLogContext.Provider value={store}>
      {children}
    </ExecutionLogContext.Provider>
  );
}

// ── Hooks ───────────────────────────────────────────
export function useExecutionLogStore() {
  return useContext(ExecutionLogContext);
}

/** Reactive hook that re-renders when executions change */
export function useExecutions(): LocalExecution[] {
  const ctx = useContext(ExecutionLogContext);
  return useSyncExternalStore(
    ctx.subscribe,
    ctx.getExecutions,
    ctx.getExecutions
  );
}

/** Reactive hook for a single execution */
export function useExecution(executionId: string | null): LocalExecution | undefined {
  const ctx = useContext(ExecutionLogContext);
  const getSnapshot = useCallback(
    () => (executionId ? ctx.getExecution(executionId) : undefined),
    [ctx, executionId]
  );
  return useSyncExternalStore(ctx.subscribe, getSnapshot, getSnapshot);
}
