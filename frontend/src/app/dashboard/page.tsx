"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { workflowApi, executionApi, type Workflow, type Execution } from "@/lib/api";
import { DashboardLayout } from "@/components/layout";
import { GitBranch, PlayCircle, CheckCircle, XCircle, Clock, ArrowRight, Sparkles } from "lucide-react";
import {
  motion,
  PageTransition,
  FadeIn,
  staggerContainer,
  staggerItem,
} from "@/components/motion";

function StatsCard({
  title,
  value,
  icon: Icon,
  accentColor,
  glowColor,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  accentColor: string;
  glowColor: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      className="group relative glass-card rounded-2xl p-6"
    >
      {/* Subtle glow on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)] mb-2">{title}</p>
          <p className="text-4xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
        {/* Glass icon wrapper with hover glow */}
        <div
          className={`
            w-14 h-14 rounded-xl ${accentColor} 
            flex items-center justify-center 
            border border-[var(--border-default)]
            backdrop-blur-md
            shadow-[0_0_20px_rgba(99,102,241,0.2)]
            transition-all duration-300
            group-hover:scale-110
            group-hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]
          `}
        >
          <Icon className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
      </div>
    </motion.div>
  );
}

function ExecutionItem({ execution, index }: { execution: Execution; index: number }) {
  const getStatusConfig = () => {
    switch (execution.status) {
      case "success":
        return {
          icon: CheckCircle,
          bg: "bg-[var(--accent-green)]/15",
          text: "text-[var(--accent-green)]",
          glow: "shadow-[0_0_20px_rgba(34,197,94,0.4)]",
          hoverGlow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]",
        };
      case "failed":
        return {
          icon: XCircle,
          bg: "bg-[var(--accent-red)]/15",
          text: "text-[var(--accent-red)]",
          glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
          hoverGlow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]",
        };
      default:
        return {
          icon: Clock,
          bg: "bg-[var(--accent-yellow)]/15",
          text: "text-[var(--accent-yellow)]",
          glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
          hoverGlow: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]",
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group flex items-center gap-4 p-4 rounded-xl glass hover:border-[var(--border-hover)] transition-all duration-300"
    >
      {/* Glass icon with glow */}
      <div
        className={`
          w-11 h-11 rounded-xl 
          flex items-center justify-center 
          ${config.bg} 
          border border-[var(--border-default)]
          backdrop-blur-md
          ${config.glow}
          ${config.hoverGlow}
          transition-all duration-300
          group-hover:scale-110
          group-hover:border-[var(--border-hover)]
        `}
      >
        <StatusIcon className={`w-5 h-5 ${config.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)] truncate">{execution.workflowName}</p>
        <p className="text-sm text-[var(--text-secondary)]">
          {new Date(execution.startedAt).toLocaleString()}
        </p>
      </div>
      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${config.bg} ${config.text} border border-[var(--border-default)]`}>
        {execution.status}
      </span>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

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

  const successCount = executions.filter((e) => e.status === "success").length;
  const failedCount = executions.filter((e) => e.status === "failed").length;
  const recentExecutions = executions.slice(-5).reverse();

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-8 max-w-7xl">
          {/* Header */}
          <FadeIn delay={0.05}>
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
                </h1>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  <Sparkles className="w-6 h-6 text-[var(--accent-purple)]" />
                </motion.div>
              </div>
              <p className="text-[var(--text-secondary)]">
                Here&apos;s an overview of your workflow automation
              </p>
            </div>
          </FadeIn>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
              >
                <StatsCard
                  title="Total Workflows"
                  value={workflows.length}
                  icon={GitBranch}
                  accentColor="bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)]"
                  glowColor="shadow-[inset_0_0_40px_rgba(99,102,241,0.15)]"
                />
                <StatsCard
                  title="Total Executions"
                  value={executions.length}
                  icon={PlayCircle}
                  accentColor="bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)]"
                  glowColor="shadow-[inset_0_0_40px_rgba(168,85,247,0.12)]"
                />
                <StatsCard
                  title="Successful"
                  value={successCount}
                  icon={CheckCircle}
                  accentColor="bg-gradient-to-br from-[var(--accent-green)] to-emerald-400"
                  glowColor="shadow-[inset_0_0_40px_rgba(34,197,94,0.12)]"
                />
                <StatsCard
                  title="Failed"
                  value={failedCount}
                  icon={XCircle}
                  accentColor="bg-gradient-to-br from-[var(--accent-red)] to-orange-500"
                  glowColor="shadow-[inset_0_0_40px_rgba(239,68,68,0.1)]"
                />
              </motion.div>

              {/* Recent Executions */}
              <FadeIn delay={0.35}>
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent Executions</h2>
                    <Link
                      href="/executions"
                      className="group flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors duration-200"
                    >
                      View all
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>

                  {recentExecutions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <PlayCircle className="w-8 h-8 text-[var(--text-muted)]" />
                      </div>
                      <p className="text-[var(--text-primary)] mb-1">No executions yet</p>
                      <p className="text-sm text-[var(--text-secondary)]">Run a workflow to see history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentExecutions.map((execution, i) => (
                        <ExecutionItem key={execution.id} execution={execution} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Quick Actions */}
              <FadeIn delay={0.45}>
                <div className="mt-8 flex gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      href="/workflows"
                      className="group flex items-center gap-3 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] px-6 py-3 rounded-xl text-white font-medium shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
                    >
                      <GitBranch className="w-5 h-5" />
                      View Workflows
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </motion.div>
                </div>
              </FadeIn>
            </>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}