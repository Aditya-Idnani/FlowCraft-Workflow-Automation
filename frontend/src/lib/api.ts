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

    const headers = new Headers(options?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (userId) {
      headers.set("x-user-id", userId);
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

const MOCK_WORKFLOWS: Workflow[] = [
  { id: "wf1", name: "User Onboarding", steps: [{ id: "s1", name: "Webhook", position: { x: 100, y: 100 }, data: { label: "Webhook", nodeType: "trigger.webhook" } } as any, { id: "s2", name: "Send Email", position: { x: 400, y: 100 }, data: { label: "Send Email", nodeType: "action.email" } } as any], edges: [{ id: "e1", source: "s1", target: "s2" }], createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "wf2", name: "Daily Sales Report", steps: [{ id: "s3", name: "Schedule", position: { x: 100, y: 100 }, data: { label: "Schedule", nodeType: "trigger.schedule" } } as any, { id: "s4", name: "Query DB", position: { x: 400, y: 100 }, data: { label: "Query DB", nodeType: "action.db" } } as any, { id: "s5", name: "Slack Msg", position: { x: 700, y: 100 }, data: { label: "Slack Msg", nodeType: "action.slack" } } as any], edges: [{ id: "e2", source: "s3", target: "s4" }, { id: "e3", source: "s4", target: "s5" }], schedule: { preset: "daily", label: "Every day at 9 AM", cronExpr: "0 9 * * *", nextRun: new Date(Date.now() + 3600000).toISOString(), lastRun: new Date(Date.now() - 86400000).toISOString(), lastStatus: "success", scheduledAt: new Date(Date.now() - 864000000).toISOString() } },
  { id: "wf3", name: "Lead Sync", steps: [{ id: "s6", name: "Salesforce", position: { x: 100, y: 100 }, data: { label: "Salesforce", nodeType: "trigger.webhook" } } as any, { id: "s7", name: "Hubspot", position: { x: 400, y: 100 }, data: { label: "Hubspot", nodeType: "action.http" } } as any], edges: [{ id: "e4", source: "s6", target: "s7" }], createdAt: new Date(Date.now() - 172800000).toISOString() }
];

const MOCK_EXECUTIONS: Execution[] = [
  { id: "ex1", workflowId: "wf1", workflowName: "User Onboarding", status: "success", startedAt: new Date(Date.now() - 3600000).toISOString(), finishedAt: new Date(Date.now() - 3598000).toISOString(), logs: ["Started execution", "Webhook received", "Email sent successfully"] },
  { id: "ex2", workflowId: "wf2", workflowName: "Daily Sales Report", status: "failed", startedAt: new Date(Date.now() - 86400000).toISOString(), finishedAt: new Date(Date.now() - 86395000).toISOString(), logs: ["Started execution", "Query DB timeout"], error: "Database timeout" },
  { id: "ex3", workflowId: "wf3", workflowName: "Lead Sync", status: "running", startedAt: new Date(Date.now() - 60000).toISOString(), logs: ["Started execution", "Fetching leads from Salesforce..."] }
];

// Workflow API
export const workflowApi = {
  list: async () => ({ data: MOCK_WORKFLOWS, error: null as string | null }),

  get: async (id: string) => ({ data: MOCK_WORKFLOWS.find(w => w.id === id) || null, error: null as string | null }),

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
  list: async () => ({ data: MOCK_EXECUTIONS, error: null as string | null }),
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
