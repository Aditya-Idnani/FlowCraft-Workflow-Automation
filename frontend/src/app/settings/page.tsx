"use client";

import { DashboardLayout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, User, Bell, Shield, Info, Palette, Save, Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Tab = "profile" | "preferences" | "about";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--accent-purple)]/20 to-fuchsia-500/20 border border-[var(--border-default)]">
              <Settings className="w-6 h-6 text-[var(--accent-purple)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          </div>
          <p className="text-[var(--text-secondary)]">Manage your account settings and preferences.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            {[
              { id: "profile", label: "My Profile", icon: User },
              { id: "preferences", label: "Preferences", icon: Palette },
              { id: "about", label: "About FlowCraft", icon: Info },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.id
                    ? "bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border border-[var(--accent-purple)]/20"
                    : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-primary)] border border-transparent"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content Pane */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="glass-card rounded-2xl p-6 sm:p-8"
              >
                {tab === "profile" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">Profile Information</h2>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <button className="px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)] hover:bg-[var(--sidebar-hover-bg)] text-sm font-semibold text-[var(--text-primary)] transition-all">
                          Change Avatar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                        <input type="text" defaultValue={user?.name || ""} className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-purple)]/50 focus:outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                        <input type="email" defaultValue={user?.email || ""} disabled className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-default)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-muted)] cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[var(--border-default)] flex justify-end">
                      <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent-purple)] hover:bg-fuchsia-600 text-white text-sm font-semibold transition-all">
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {tab === "preferences" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">App Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">Email Notifications</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Receive alerts when workflows fail.</p>
                        </div>
                        <div className="w-10 h-6 bg-[var(--accent-purple)] rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)]">
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">Auto-Save Workflows</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Automatically save changes in the builder.</p>
                        </div>
                        <div className="w-10 h-6 bg-[var(--accent-purple)] rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "about" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 border-b border-[var(--border-default)] pb-4">About FlowCraft</h2>
                    
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)]/10 via-[var(--accent-blue)]/10 to-transparent border border-[var(--border-default)] mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] m-0">FlowCraft v1.0.0</h3>
                            <p className="text-xs font-semibold text-[var(--accent-purple)] m-0 uppercase tracking-wider">Visual Workflow Automation</p>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed m-0">
                          FlowCraft is a powerful, node-based visual automation platform designed to make connecting apps and orchestrating data pipelines as intuitive as possible.
                        </p>
                      </div>

                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Inspiration & Design</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        FlowCraft draws deep inspiration from industry leaders like <strong>Zapier</strong> and <strong>n8n</strong>. 
                        While Zapier pioneered the concept of "trigger-action" workflows with an accessible linear UI, and n8n brought advanced, fair-code branching and node-based visual orchestration to developers, FlowCraft attempts to marry the best of both worlds.
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        Our goal is to provide the infinite canvas flexibility of n8n—allowing complex branching and parallel execution—while maintaining a beautiful, modern, and highly accessible user interface that feels as approachable as Zapier. 
                        Built with cutting-edge web technologies like React Flow, TailwindCSS, and framer-motion, we emphasize a sleek, glassmorphic aesthetic that feels truly next-generation.
                      </p>

                      <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-[var(--border-default)]">
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Architecture</span>
                          <span className="text-sm font-medium text-[var(--text-primary)]">Next.js 14 / React 18</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Canvas Engine</span>
                          <span className="text-sm font-medium text-[var(--text-primary)]">React Flow</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Styling</span>
                          <span className="text-sm font-medium text-[var(--text-primary)]">TailwindCSS / Framer Motion</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1">Database</span>
                          <span className="text-sm font-medium text-[var(--text-primary)]">PostgreSQL (Neon)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
