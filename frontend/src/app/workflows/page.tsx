"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { workflowApi, type Workflow } from "@/lib/api";
import { DashboardLayout } from "@/components/layout";
import { Plus, GitBranch, ArrowRight, Layers, X, Clock } from "lucide-react";
import {
  motion,
  AnimatePresence,
  PageTransition,
  FadeIn,
  staggerContainer,
  staggerItem,
  modalOverlayVariants,
  modalContentVariants,
} from "@/components/motion";

function WorkflowCard({
  workflow,
  onClick,
}: {
  workflow: Workflow;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      onClick={onClick}
      className="group cursor-pointer glass-card rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)]/10 via-transparent to-[var(--accent-purple)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--accent-purple)] rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Glass Icon with glow */}
        <div
          className="
            w-14 h-14 rounded-xl 
            bg-gradient-to-br from-[var(--accent-blue)]/15 to-[var(--accent-purple)]/15 
            border border-[var(--border-active)]
            backdrop-blur-md
            flex items-center justify-center mb-5 
            shadow-[0_0_20px_rgba(99,102,241,0.25)]
            transition-all duration-300
            group-hover:scale-110
            group-hover:border-[var(--accent-blue)]/50 
            group-hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]
          "
        >
          <GitBranch className="w-7 h-7 text-[var(--accent-blue)] group-hover:text-[var(--accent-purple)] transition-colors duration-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
        </div>

        {/* Name */}
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-cyan)] transition-colors duration-200">
          {workflow.name}
        </h3>

        {/* Steps count with icon */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <div className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>{workflow.steps.length} step{workflow.steps.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Schedule indicator */}
        {workflow.schedule && (
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--accent-amber)]">
            <Clock className="w-3 h-3" />
            <span>{workflow.schedule.label}</span>
            {workflow.schedule.nextRun && (
              <span className="text-[var(--text-muted)]">
                · next {new Date(workflow.schedule.nextRun).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}

        {/* Arrow indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
          <div className="p-2 rounded-lg bg-[var(--accent-purple)]/20 border border-[var(--border-default)] backdrop-blur-sm">
            <ArrowRight className="w-4 h-4 text-[var(--accent-purple)]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkflowsPage() {
  const router = useRouter();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load workflows
  useEffect(() => {
    async function loadWorkflows() {
      setLoading(true);
      setError(null);

      const { data, error } = await workflowApi.list();

      if (error) {
        setError(error);
      } else if (data) {
        setWorkflows(data);
      }

      setLoading(false);
    }

    loadWorkflows();
  }, []);

  // Create workflow
  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;

    setCreating(true);
    const { data, error } = await workflowApi.create(newWorkflowName);
    setCreating(false);

    if (error) {
      alert(`Error: ${error}`);
      return;
    }

    if (data) {
      setWorkflows((prev) => [...prev, data]);
      setShowCreateModal(false);
      setNewWorkflowName("");
      router.push(`/workflows/${data.id}`);
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-8 max-w-5xl mx-auto text-[var(--text-primary)]">
          {/* Header */}
          <FadeIn>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-3xl font-semibold mb-6 tracking-tight">Workflows</h1>
                <p className="text-[var(--text-secondary)]">
                  Create and manage your automation workflows
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] px-6 py-3 rounded-xl text-white font-medium shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                New Workflow
              </motion.button>
            </div>
          </FadeIn>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-2 border-[var(--accent-purple)] border-t-transparent rounded-full"
              />
            </div>
          ) : error ? (
            <FadeIn>
              <div className="text-center py-16">
                <p className="text-[var(--accent-red)] mb-3">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-colors"
                >
                  Try again
                </button>
              </div>
            </FadeIn>
          ) : workflows.length === 0 ? (
            <FadeIn>
              <div className="text-center py-24">
                <div className="w-24 h-24 rounded-2xl bg-[var(--bg-glass)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <GitBranch className="w-12 h-12 text-[var(--text-muted)]" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No workflows yet</h2>
                <p className="text-[var(--text-secondary)] mb-8">Create your first workflow to get started</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 mx-auto bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] px-6 py-3 rounded-xl text-white font-medium shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Create Workflow
                </motion.button>
              </div>
            </FadeIn>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {workflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onClick={() => router.push(`/workflows/${workflow.id}`)}
                />
              ))}
            </motion.div>
          )}

          {/* Create Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  variants={modalOverlayVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowCreateModal(false)}
                />

                {/* Modal */}
                <motion.div
                  variants={modalContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative w-full max-w-md glass-card rounded-2xl p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)]"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Create New Workflow</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6">Give your workflow a descriptive name</p>

                  <input
                    type="text"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateWorkflow()}
                    placeholder="e.g., Email Automation"
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all duration-200"
                  />

                  <div className="flex gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateWorkflow}
                      disabled={creating || !newWorkflowName.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2.5 rounded-lg text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? "Creating..." : "Create"}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}