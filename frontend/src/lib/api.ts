// API configuration and utilities
import { supabase } from "./supabase";

function resolveApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const fallback = "http://localhost:5050/api";

  if (!raw) {
    return fallback;
  }

  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

// Shared types
export type Step = {
  id: string;
  name: string;
  position?: number;
  positionX?: number;
  positionY?: number;
  nodeType?: string;
  config?: any;
};

export type ApiEdge = {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
};

export type Workflow = {
  id: string;
  name: string;
  steps: Step[];
  edges?: ApiEdge[];
  createdAt?: string;
  schedule?: ScheduleInfo | null;
};

export type ScheduleInfo = {
  preset: string;
  label: string;
  cronExpr: string;
  nextRun: string | null;
  lastRun: string | null;
  lastStatus: string | null;
  scheduledAt: string;
};

export type Execution = {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "running" | "success" | "failed";
  startedAt: string;
  finishedAt?: string;
  logs: string[];
  error?: string;
};

export type ApiError = {
  error: string;
};

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };
    if (userId) {
      headers["x-user-id"] = userId;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      return { data: null, error: data.error || "Request failed" };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: "Network error. Please try again." };
  }
}

// Workflow API
export const workflowApi = {
  list: () => apiFetch<Workflow[]>("/workflows"),

  get: (id: string) => apiFetch<Workflow>(`/workflows/${id}`),

  create: (data: { name: string; nodes?: any[]; edges?: any[] }) =>
    apiFetch<Workflow>("/workflows", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, name: string) =>
    apiFetch<Workflow>(`/workflows/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/workflows/${id}`, { method: "DELETE" }),

  addStep: (workflowId: string, stepName: string) =>
    apiFetch<Workflow>(`/workflows/${workflowId}/steps`, {
      method: "POST",
      body: JSON.stringify({ name: stepName }),
    }),

  removeStep: (workflowId: string, stepId: string) =>
    apiFetch<Workflow>(`/workflows/${workflowId}/steps/${stepId}`, {
      method: "DELETE",
    }),

  saveCanvas: (id: string, nodes: any[], edges: any[]) =>
    apiFetch<Workflow>(`/workflows/${id}/canvas`, {
      method: "PUT",
      body: JSON.stringify({ nodes, edges }),
    }),

  execute: (id: string) =>
    apiFetch<{ message: string; executionId: string; status: string }>(
      `/workflows/${id}/execute`,
      { method: "POST" }
    ),
};

// Execution API
export const executionApi = {
  list: () => apiFetch<Execution[]>("/workflows/executions"),
};

// Schedule API
export const scheduleApi = {
  get: (workflowId: string) =>
    apiFetch<{ scheduled: boolean; schedule: ScheduleInfo | null }>(
      `/workflows/${workflowId}/schedule`
    ),

  set: (workflowId: string, preset: string) =>
    apiFetch<{ message: string; schedule: ScheduleInfo }>(
      `/workflows/${workflowId}/schedule`,
      {
        method: "POST",
        body: JSON.stringify({ preset }),
      }
    ),

  remove: (workflowId: string) =>
    apiFetch<{ message: string }>(
      `/workflows/${workflowId}/schedule`,
      { method: "DELETE" }
    ),

  presets: () =>
    apiFetch<{ id: string; label: string; cron: string }[]>(
      `/workflows/schedules/presets`
    ),
};
