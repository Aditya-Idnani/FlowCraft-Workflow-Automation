"use client";

import { DashboardLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { Link2, Search, Plus, Settings2, Globe, Mail, MessageSquare, Database, CheckCircle } from "lucide-react";
import { useState } from "react";

const MOCK_CONNECTIONS = [
  { id: "c1", name: "Slack", category: "Communication", desc: "Send messages and notifications to Slack channels.", connected: true, icon: MessageSquare, color: "#eab308", bg: "from-yellow-500 to-amber-600" },
  { id: "c2", name: "Gmail", category: "Email", desc: "Send, read, and manage emails via Google Workspace.", connected: true, icon: Mail, color: "#ef4444", bg: "from-red-500 to-rose-600" },
  { id: "c3", name: "Salesforce", category: "CRM", desc: "Manage leads, opportunities, and accounts.", connected: false, icon: Database, color: "#3b82f6", bg: "from-blue-500 to-indigo-600" },
  { id: "c4", name: "Shopify", category: "E-Commerce", desc: "Automate order processing and inventory management.", connected: false, icon: Globe, color: "#22c55e", bg: "from-green-500 to-emerald-600" },
  { id: "c5", name: "PostgreSQL", category: "Database", desc: "Directly query and update your Postgres databases.", connected: true, icon: Database, color: "#6366f1", bg: "from-indigo-500 to-violet-600" },
  { id: "c6", name: "Custom Webhook", category: "Developer Tools", desc: "Receive real-time HTTP payloads from any app.", connected: true, icon: Globe, color: "#a855f7", bg: "from-purple-500 to-fuchsia-600" },
];

export default function ConnectionsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_CONNECTIONS.filter((c) => {
    if (filter === "connected" && !c.connected) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--accent-green)]/20 to-emerald-500/20 border border-[var(--border-default)]">
                <Link2 className="w-6 h-6 text-[var(--accent-green)]" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Connections</h1>
            </div>
            <p className="text-[var(--text-secondary)]">Manage authenticated accounts and third-party API integrations.</p>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]/50 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-default)]">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "all" ? "bg-[var(--bg-sidebar)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              All Apps
            </button>
            <button
              onClick={() => setFilter("connected")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === "connected" ? "bg-[var(--bg-sidebar)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
            >
              Connected
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((conn, i) => {
            const Icon = conn.icon;
            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 flex flex-col hover:ring-2 hover:ring-[var(--accent-green)]/30 transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${conn.bg} opacity-[0.03] rounded-bl-full pointer-events-none`} />
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[var(--border-default)] bg-[var(--bg-primary)] shadow-sm" style={{ color: conn.color }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {conn.connected ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20 text-[10px] font-bold text-[var(--accent-green)] uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3" /> Connected
                    </div>
                  ) : (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-default)] hover:border-[var(--border-hover)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Connect
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 relative z-10">{conn.name}</h3>
                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 relative z-10">{conn.category}</span>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 relative z-10">{conn.desc}</p>
                
                {conn.connected && (
                  <div className="mt-5 pt-4 border-t border-[var(--border-default)] flex items-center justify-between relative z-10">
                    <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)] animate-pulse" /> Active
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
