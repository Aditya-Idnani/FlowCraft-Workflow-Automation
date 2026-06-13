"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { workflowApi, executionApi, type Workflow, type Execution } from "@/lib/api";
import { DashboardLayout } from "@/components/layout";
import {
  GitBranch, PlayCircle, CheckCircle, XCircle, Clock, ArrowRight,
  Plus, Upload, LayoutTemplate, BookOpen, ChevronRight, MoreHorizontal,
  TrendingUp, Timer, Activity, MoreVertical, ShoppingBag, Users, Zap, Loader2
} from "lucide-react";
import { DEMO_TEMPLATES } from "@/lib/demo-templates";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag,
  Users,
  Zap,
};

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ── Mini Sparkline / Line Chart ───────────────────────
function ExecutionsChart({ data }: { data: number[] }) {
  const width = 540;
  const height = 160;
  const pad = { top: 12, right: 12, bottom: 24, left: 32 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data, 1);

  const points = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * chartW,
    y: pad.top + (1 - v / maxVal) * chartH,
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const fillPath =
    path +
    ` L ${points[points.length - 1].x},${pad.top + chartH} L ${points[0].x},${pad.top + chartH} Z`;

  const days = ["May 12", "May 13", "May 14", "May 15", "May 16", "May 17", "May 18"];

  return (
    <div className="relative w-full" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 20, 40, 60, 80].map((v) => {
          const y = pad.top + (1 - v / maxVal) * chartH;
          if (v > maxVal) return null;
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y}
                stroke="var(--chart-grid)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={pad.left - 6} y={y + 4} fontSize="9" fill="var(--text-muted)" textAnchor="end">{v}</text>
            </g>
          );
        })}

        {/* Fill */}
        <path d={fillPath} fill="url(#chartFill)" />

        {/* Line */}
        <path d={path} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* X axis labels */}
        {days.map((day, i) => {
          const x = pad.left + (i / (days.length - 1)) * chartW;
          return (
            <text key={day} x={x} y={height - 4} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{day}</text>
          );
        })}

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#7c3aed" stroke="var(--bg-primary)" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}

// ── Donut Chart ────────────────────────────────────────
function DonutChart({ success, failed, running, total }: {
  success: number; failed: number; running: number; total: number;
}) {
  const r = 56;
  const cx = 80;
  const cy = 80;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: success, color: "#22c55e", label: "Success" },
    { value: failed, color: "#ef4444", label: "Failed" },
    { value: running, color: "#f59e0b", label: "Running" },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circ;
    const gap = circ - dash;
    const result = { ...seg, dashArray: `${dash} ${gap}`, dashOffset: -offset };
    offset += dash;
    return result;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-default)" strokeWidth="14" />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth="14"
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
              transform="rotate(-90, 80, 80)"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[var(--text-primary)]">{total}</span>
          <span className="text-xs text-[var(--text-muted)]">Total</span>
        </div>
      </div>

      <div className="space-y-2.5 flex-1 w-full">
        {[
          { label: "Success", count: success, pct: total > 0 ? ((success / total) * 100).toFixed(1) : "0.0", color: "bg-[var(--accent-green)]" },
          { label: "Failed", count: failed, pct: total > 0 ? ((failed / total) * 100).toFixed(1) : "0.0", color: "bg-[var(--accent-red)]" },
          { label: "Running", count: running, pct: total > 0 ? ((running / total) * 100).toFixed(1) : "0.0", color: "bg-[var(--accent-yellow)]" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-sm ${item.color} shrink-0`} />
            <span className="text-sm text-[var(--text-secondary)] flex-1">{item.label}</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{item.count}</span>
            <span className="text-xs text-[var(--text-muted)] w-14 text-right">({item.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────
function StatCard({
  title, value, subtitle, pct, pctUp, iconBg, icon: Icon,
}: {
  title: string; value: string; subtitle?: string;
  pct: string; pctUp: boolean; iconBg: string; icon: React.ElementType;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      className="relative group glass-card rounded-2xl p-5 overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">{title}</p>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-[var(--stat-icon-shadow)] group-hover:scale-110 transition-transform duration-300 shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-[var(--text-primary)] mb-1 tracking-tight">{value}</p>
      <div className="flex items-center gap-1.5">
        <TrendingUp className={`w-3.5 h-3.5 ${pctUp ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`} />
        <span className={`text-xs font-semibold ${pctUp ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>{pct}</span>
        <span className="text-xs text-[var(--text-muted)]">from last month</span>
      </div>
    </motion.div>
  );
}

// ── Workflow Row ───────────────────────────────────────
const statusBadge: Record<string, string> = {
  active: "badge-success",
  paused: "badge-paused",
  inactive: "badge-inactive",
};

const workflowIcons: Record<string, string> = {
  "Email": "📧",
  "Data": "🗄️",
  "User": "👥",
  "Backup": "🔧",
  "Analytics": "📊",
};

function getWfIcon(name: string) {
  for (const [key, emoji] of Object.entries(workflowIcons)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return "⚡";
}

const MOCK_WORKFLOWS = [
  { id: "1", name: "Email Notification System", schedule: "Every hour", status: "active", updatedAt: "2h ago" },
  { id: "2", name: "Data Sync Pipeline", schedule: "Daily at 9:00 AM", status: "active", updatedAt: "5h ago" },
  { id: "3", name: "User Onboarding Flow", schedule: "Every Monday", status: "paused", updatedAt: "1d ago" },
  { id: "4", name: "Backup & Cleanup", schedule: "Daily at 2:00 AM", status: "active", updatedAt: "2d ago" },
  { id: "5", name: "Analytics Report Generator", schedule: "Weekly on Sunday", status: "inactive", updatedAt: "3d ago" },
];

const MOCK_ACTIVITY = [
  { id: "1", msg: "Workflow \"Email Notification\" executed", time: "2 minutes ago", status: "success" },
  { id: "2", msg: "Workflow \"Data Sync Pipeline\" failed", time: "15 minutes ago", status: "failed" },
  { id: "3", msg: "New workflow \"User Onboarding Flow\" created", time: "1 hour ago", status: "info" },
  { id: "4", msg: "Workflow \"Backup & Cleanup\" executed", time: "2 hours ago", status: "success" },
  { id: "5", msg: "Workflow \"Analytics Report\" executed", time: "3 hours ago", status: "success" },
];

const MOCK_DEMO_WORKFLOWS = [
  {
    id: "demo-1",
    name: "E-commerce Order Fulfillment",
    description: "Automatically process Shopify orders, generate invoices in Xero, and notify customers via Slack.",
    useCase: "Retail & E-commerce",
    icon: ShoppingBag,
    color: "var(--accent-blue)"
  },
  {
    id: "demo-2",
    name: "Employee Onboarding",
    description: "Create Google Workspace accounts, send welcome emails, and assign training tasks in Asana.",
    useCase: "HR & Operations",
    icon: Users,
    color: "var(--accent-purple)"
  },
  {
    id: "demo-3",
    name: "Lead Enrichment Pipeline",
    description: "Enrich new Salesforce leads with Clearbit data and route them to sales reps via Teams.",
    useCase: "Sales & Marketing",
    icon: Zap,
    color: "var(--accent-green)"
  }
];


// ── Main Dashboard ─────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartRange] = useState("Last 7 days");

  const handleUseTemplate = async (template: typeof DEMO_TEMPLATES[0] & { nodes?: any, edges?: any }) => {
    setLoadingTemplate(template.id);
    try {
      const { data, error } = await workflowApi.create({
        name: template.name,
        nodes: template.nodes,
        edges: template.edges,
      });

      if (data && data.id) {
        router.push(`/workflows/${data.id}`);
      } else {
        alert("Failed to create workflow template: " + error);
        setLoadingTemplate(null);
      }
    } catch (err) {
      alert("Error generating template.");
      setLoadingTemplate(null);
    }
  };

  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "Aditya";

  useEffect(() => {
    async function loadData() {
      const [workflowsRes, executionsRes] = await Promise.all([
        workflowApi.list(),
        executionApi.list(),
      ]);
      if (workflowsRes.data) setWorkflows(workflowsRes.data);
      if (executionsRes.data) setExecutions(executionsRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Compute stats from real + mock data
  const totalWorkflows = workflows.length || 24;
  const totalExecutions = executions.length || 156;
  const successCount = executions.filter((e) => e.status === "success").length || 145;
  const failedCount = executions.filter((e) => e.status === "failed").length || 8;
  const runningCount = executions.filter((e) => e.status === "running").length || 3;
  const successRate = totalExecutions > 0 ? ((successCount / totalExecutions) * 100).toFixed(1) : "98.7";

  // Chart data — mock 7-day data
  const chartData = [30, 45, 55, 42, 68, 55, 72];

  // Display workflows (real data or mock)
  const displayWorkflows = workflows.length > 0
    ? workflows.slice(0, 5).map((w) => ({ ...w, schedule: "Scheduled", updatedAt: "Recently" }))
    : MOCK_WORKFLOWS;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px]">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Here&apos;s what&apos;s happening with your workflows today.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.1 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/workflows"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_24px_var(--glow-blue)] hover:shadow-[0_0_36px_var(--glow-purple)] hover:opacity-90 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </Link>
          </motion.div>
        </div>

        {/* ── Stat Cards Row ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Workflows"
            value={String(totalWorkflows)}
            pct="12%"
            pctUp
            iconBg="bg-gradient-to-br from-[var(--accent-blue)] to-indigo-500"
            icon={GitBranch}
          />
          <StatCard
            title="Executions"
            value={String(totalExecutions)}
            pct="18%"
            pctUp
            iconBg="bg-gradient-to-br from-[var(--accent-purple)] to-violet-500"
            icon={PlayCircle}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            pct="2.3%"
            pctUp
            iconBg="bg-gradient-to-br from-[var(--accent-green)] to-emerald-500"
            icon={Activity}
          />
          <StatCard
            title="Time Saved"
            value="42.5h"
            pct="25%"
            pctUp
            iconBg="bg-gradient-to-br from-[var(--accent-amber)] to-orange-500"
            icon={Timer}
          />
        </div>

        {/* ── Middle row: Chart + Quick Actions ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Executions Overview Chart */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Executions Overview</h2>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)] text-xs text-[var(--text-secondary)] cursor-pointer hover:border-[var(--border-hover)] transition-colors"
                style={{ background: "var(--bg-card)" }}>
                {chartRange}
                <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
            </div>
            <ExecutionsChart data={chartData} />
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: Plus, label: "Create New Workflow", sub: "Start from scratch", color: "text-[var(--accent-blue)]", bg: "bg-[var(--accent-blue)]/12" },
                { icon: Upload, label: "Import Workflow", sub: "Import from JSON file", color: "text-[var(--accent-purple)]", bg: "bg-[var(--accent-purple)]/12" },
                { icon: LayoutTemplate, label: "Browse Templates", sub: "Use pre-built templates", color: "text-[var(--accent-green)]", bg: "bg-[var(--accent-green)]/12" },
                { icon: BookOpen, label: "View Documentation", sub: "Learn how to use FlowCraft", color: "text-[var(--accent-amber)]", bg: "bg-[var(--accent-amber)]/12" },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                    whileHover={{ x: 2 }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--sidebar-hover-bg)] transition-all duration-200 group text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{action.label}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{action.sub}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Workflows Table + Donut + Activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Workflows */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Workflows</h2>
              <Link href="/workflows" className="text-xs text-[var(--accent-blue)] hover:underline font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-1">
              {displayWorkflows.map((wf, i) => {
                const status = (wf as any).status || "active";
                const badgeClass = statusBadge[status] || "badge-inactive";
                const updatedAt = (wf as any).updatedAt || "Recently";
                return (
                  <motion.div
                    key={wf.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="grid items-center gap-2 px-2 py-2.5 rounded-xl hover:bg-[var(--sidebar-hover-bg)] transition-colors group"
                    style={{ gridTemplateColumns: "32px 1fr auto auto auto" }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 border border-[var(--border-default)] flex items-center justify-center text-sm shrink-0">
                      {getWfIcon(wf.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{wf.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        {(wf as any).schedule || "Scheduled"}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${badgeClass} shrink-0`}>
                      {status}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0 hidden sm:block">
                      Updated {updatedAt}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[var(--border-default)] transition-all shrink-0">
                      <MoreHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Executions by Status Donut */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Executions by Status</h2>
            </div>
            <DonutChart
              success={successCount}
              failed={failedCount}
              running={runningCount}
              total={totalExecutions}
            />
          </div>
        </div>

        {/* ── Bottom-2 row: Recent Activity ── */}
        <div className="mt-4 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h2>
            <Link href="/executions" className="text-xs text-[var(--accent-blue)] hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
            {MOCK_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-2.5"
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  item.status === "success" ? "bg-[var(--accent-green)]/15" :
                  item.status === "failed" ? "bg-[var(--accent-red)]/15" :
                  "bg-[var(--accent-blue)]/15"
                }`}>
                  {item.status === "success" ? (
                    <CheckCircle className="w-3 h-3 text-[var(--accent-green)]" />
                  ) : item.status === "failed" ? (
                    <XCircle className="w-3 h-3 text-[var(--accent-red)]" />
                  ) : (
                    <Clock className="w-3 h-3 text-[var(--accent-blue)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-secondary)] leading-snug">{item.msg}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Bottom-3 row: Demo Workflows ── */}
        <div className="mt-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Demo Workflows</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">See how companies use FlowCraft</p>
            </div>
            <Link href="/templates" className="text-xs text-[var(--accent-blue)] hover:underline font-medium">
              Browse all templates
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_TEMPLATES.map((template, i) => {
              const Icon = iconMap[template.icon] || LayoutTemplate;
              const isLoading = loadingTemplate === template.id;
              return (
                <motion.div
                  key={template.id}
                  onClick={() => !isLoading && handleUseTemplate(template)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className={`glass-card rounded-2xl p-5 group relative overflow-hidden transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-[var(--accent-blue)]/50'}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-semibold tracking-wider text-[var(--text-secondary)] uppercase bg-[var(--bg-card)] px-2 py-1 rounded-md border border-[var(--border-default)]">
                      Template
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-default)] bg-[var(--bg-primary)] group-hover:scale-110 transition-transform shadow-sm"
                      style={{ color: template.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 relative z-10">
                    {template.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 relative z-10 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center text-xs font-semibold text-[var(--accent-blue)] group-hover:gap-2 transition-all relative z-10">
                    {isLoading ? (
                      <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</span>
                    ) : (
                      <>Try it out <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" /></>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
