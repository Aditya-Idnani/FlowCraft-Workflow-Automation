import {
  Webhook,
  Terminal,
  Timer,
  Send,
  Mail,
  Play,
  type LucideIcon,
} from "lucide-react";

// ── Config field definition ──────────────────────────
export type ConfigFieldType = "text" | "number" | "textarea";

export type ConfigField = {
  key: string;
  label: string;
  type: ConfigFieldType;
  placeholder?: string;
  defaultValue?: string | number;
};

// ── Node type categories ─────────────────────────────
export type NodeCategory = "trigger" | "action";

// ── Node type definition ─────────────────────────────
export type WorkflowNodeType = {
  id: string;
  label: string;
  category: NodeCategory;
  icon: LucideIcon;
  color: "blue" | "purple" | "yellow" | "cyan";
  description: string;
  defaultConfig: Record<string, any>;
  configFields: ConfigField[];
  placeholder?: boolean; // true = "coming soon"
};

// ── Registry ─────────────────────────────────────────
export const NODE_TYPE_REGISTRY: WorkflowNodeType[] = [
  {
    id: "trigger.start",
    label: "Start Trigger",
    category: "trigger",
    icon: Play,
    color: "blue",
    description: "Begins the workflow execution",
    defaultConfig: {},
    configFields: [],
  },
  {
    id: "trigger.webhook",
    label: "Webhook Trigger",
    category: "trigger",
    icon: Webhook,
    color: "blue",
    description: "Starts the workflow when a webhook is received",
    defaultConfig: {
      webhookUrl: "/api/webhook/trigger",
    },
    configFields: [
      {
        key: "webhookUrl",
        label: "Webhook URL",
        type: "text",
        placeholder: "/api/webhook/trigger",
      },
    ],
  },
  {
    id: "action.log",
    label: "Log Message",
    category: "action",
    icon: Terminal,
    color: "purple",
    description: "Logs a message to the console",
    defaultConfig: {
      message: "Hello",
    },
    configFields: [
      {
        key: "message",
        label: "Message",
        type: "textarea",
        placeholder: "Enter log message…",
      },
    ],
  },
  {
    id: "action.delay",
    label: "Delay",
    category: "action",
    icon: Timer,
    color: "yellow",
    description: "Pauses execution for a specified time",
    defaultConfig: {
      time: 1000,
    },
    configFields: [
      {
        key: "time",
        label: "Delay (ms)",
        type: "number",
        placeholder: "1000",
        defaultValue: 1000,
      },
    ],
  },
  {
    id: "action.telegram",
    label: "Send Telegram",
    category: "action",
    icon: Send,
    color: "cyan",
    description: "Sends a message via Telegram bot",
    defaultConfig: {
      chatId: "",
      message: "Hello from FlowCraft",
    },
    configFields: [
      {
        key: "chatId",
        label: "Chat ID",
        type: "text",
        placeholder: "e.g., 123456789",
      },
      {
        key: "message",
        label: "Message",
        type: "textarea",
        placeholder: "Message to send…",
      },
    ],
  },
  {
    id: "action.email",
    label: "Send Email",
    category: "action",
    icon: Mail,
    color: "purple",
    description: "Sends an email notification",
    defaultConfig: {
      to: "",
      subject: "",
      body: "",
    },
    configFields: [
      {
        key: "to",
        label: "To",
        type: "text",
        placeholder: "recipient@example.com",
      },
      {
        key: "subject",
        label: "Subject",
        type: "text",
        placeholder: "Email subject…",
      },
      {
        key: "body",
        label: "Body",
        type: "textarea",
        placeholder: "Email body…",
      },
    ],
    placeholder: true,
  },
];

// ── Lookup helpers ───────────────────────────────────
export function getNodeType(typeId: string): WorkflowNodeType {
  return (
    NODE_TYPE_REGISTRY.find((t) => t.id === typeId) ?? NODE_TYPE_REGISTRY[1] // fallback to action.log
  );
}

export function getNodeTypesByCategory(
  category: NodeCategory
): WorkflowNodeType[] {
  return NODE_TYPE_REGISTRY.filter((t) => t.category === category);
}

// ── Color mapping to CSS variables ───────────────────
export const NODE_COLOR_MAP: Record<
  string,
  {
    accent: string;
    glow: string;
    bgFrom: string;
    bgTo: string;
  }
> = {
  blue: {
    accent: "var(--accent-blue)",
    glow: "var(--glow-blue)",
    bgFrom: "rgba(99,102,241,0.15)",
    bgTo: "rgba(99,102,241,0.05)",
  },
  purple: {
    accent: "var(--accent-purple)",
    glow: "var(--glow-purple)",
    bgFrom: "rgba(168,85,247,0.15)",
    bgTo: "rgba(168,85,247,0.05)",
  },
  yellow: {
    accent: "var(--accent-amber)",
    glow: "var(--glow-amber)",
    bgFrom: "rgba(245,158,11,0.15)",
    bgTo: "rgba(245,158,11,0.05)",
  },
  cyan: {
    accent: "var(--accent-cyan)",
    glow: "var(--glow-cyan)",
    bgFrom: "rgba(34,211,238,0.15)",
    bgTo: "rgba(34,211,238,0.05)",
  },
};
