"use client";

import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, CheckCircle, Play, ChevronRight, Menu, X } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ── Custom SVG Icons ───────────────────────────────────
function IconZap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="zap-g" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M13 2L4.5 13H11L10 22L19.5 11H13L13 2Z" fill="url(#zap-g)" />
    </svg>
  );
}

function IconSchedule({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs><linearGradient id="sch-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a855f7" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
      <rect x="3" y="4" width="18" height="18" rx="4" fill="url(#sch-g)" opacity="0.15" />
      <rect x="3" y="4" width="18" height="18" rx="4" stroke="url(#sch-g)" strokeWidth="1.5" />
      <path d="M8 2V6M16 2V6M3 10H21" stroke="url(#sch-g)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="15" r="2" fill="url(#sch-g)" />
    </svg>
  );
}

function IconIntegration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs><linearGradient id="int-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#22d3ee" /><stop offset="1" stopColor="#6366f1" /></linearGradient></defs>
      <circle cx="5" cy="12" r="3" fill="url(#int-g)" />
      <circle cx="19" cy="6" r="3" fill="url(#int-g)" opacity="0.7" />
      <circle cx="19" cy="18" r="3" fill="url(#int-g)" opacity="0.5" />
      <path d="M8 12H16M8 12L16 6M8 12L16 18" stroke="url(#int-g)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconVisual({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs><linearGradient id="vis-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#22c55e" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
      <rect x="2" y="8" width="8" height="8" rx="2" fill="url(#vis-g)" />
      <rect x="14" y="4" width="8" height="8" rx="2" fill="url(#vis-g)" opacity="0.7" />
      <rect x="14" y="14" width="8" height="6" rx="2" fill="url(#vis-g)" opacity="0.5" />
      <path d="M10 12H14M10 12L14 8M10 12L14 17" stroke="url(#vis-g)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSecurity({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs><linearGradient id="sec-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
      <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="url(#sec-g)" opacity="0.15" />
      <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="url(#sec-g)" strokeWidth="1.5" />
      <path d="M9 12L11 14L15 10" stroke="url(#sec-g)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAnalytics({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs><linearGradient id="ana-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#22c55e" /></linearGradient></defs>
      <rect x="3" y="3" width="18" height="18" rx="3" fill="url(#ana-g)" opacity="0.08" stroke="url(#ana-g)" strokeWidth="1.2" />
      <path d="M7 16L10 12L13 14L17 9" stroke="url(#ana-g)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="9" r="1.5" fill="url(#ana-g)" />
    </svg>
  );
}

function IconAI({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs><linearGradient id="ai-g" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a855f7" /><stop offset="1" stopColor="#f97316" /></linearGradient></defs>
      <path d="M12 2C12 2 14 6 18 8C14 10 12 14 12 14C12 14 10 10 6 8C10 6 12 2 12 2Z" fill="url(#ai-g)" />
      <path d="M5 16C5 16 6.5 18 8.5 19C6.5 20 5 22 5 22C5 22 3.5 20 1.5 19C3.5 18 5 16 5 16Z" fill="url(#ai-g)" opacity="0.6" />
      <path d="M19 14C19 14 20 16 21.5 17C20 18 19 20 19 20C19 20 18 18 16.5 17C18 16 19 14 19 14Z" fill="url(#ai-g)" opacity="0.4" />
    </svg>
  );
}

// ── Navbar ─────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[var(--border-default)]"
      style={{
        background: "var(--bg-topbar)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-[0_0_18px_var(--glow-blue)]"
        >
          <IconZap className="w-4 h-4" />
        </motion.div>
        <div>
          <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">FlowCraft</span>
          <p className="text-[9px] text-[var(--text-muted)] leading-none mt-0.5">Workflow Automation</p>
        </div>
      </Link>

      {/* Desktop Nav links */}
      <div className="hidden md:flex items-center gap-6">
        {[
          { href: "#features", label: "Features" },
          { href: "#workflows", label: "Workflows" },
          { href: "#companies", label: "Use Cases" },
          { href: "/dashboard", label: "Dashboard" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 font-medium"
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        {/* Profile placeholder on landing */}
        <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_var(--glow-purple)] cursor-pointer">
          A
        </div>
        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_18px_var(--glow-blue)] hover:shadow-[0_0_28px_var(--glow-purple)] transition-all duration-300"
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-[var(--bg-sidebar)] border-b border-[var(--border-default)] md:hidden overflow-hidden"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div className="flex flex-col px-4 py-4 space-y-4">
              {[
                { href: "#features", label: "Features" },
                { href: "#workflows", label: "Workflows" },
                { href: "#companies", label: "Use Cases" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[var(--text-primary)] font-medium px-2 py-2 rounded-lg hover:bg-[var(--bg-card-hover)]"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Animated mini workflow ─────────────────────────────
const miniNodes = [
  { label: "Webhook", color: "from-[#6366f1] to-[#8b5cf6]", emoji: "🔗" },
  { label: "Filter", color: "from-[#a855f7] to-[#ec4899]", emoji: "⚡" },
  { label: "Slack", color: "from-[#22d3ee] to-[#06b6d4]", emoji: "💬" },
  { label: "Email", color: "from-[#22c55e] to-[#16a34a]", emoji: "📧" },
];

function MiniWorkflow() {
  return (
    <div className="flex items-center gap-0 justify-center flex-wrap gap-y-4">
      {miniNodes.map((node, i) => (
        <div key={node.label} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease }}
            whileHover={{ y: -5, scale: 1.05 }}
            className="relative"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${node.color} blur-[14px]`}
            />
            <div className="relative glass-card rounded-2xl px-4 py-3 flex flex-col items-center gap-1.5 min-w-[88px]">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center text-lg`}>
                {node.emoji}
              </div>
              <span className="text-[11px] font-semibold text-[var(--text-primary)]">{node.label}</span>
            </div>
          </motion.div>
          {i < miniNodes.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.9 + i * 0.12, duration: 0.3 }}
              className="flex items-center mx-1.5"
            >
              <div className="w-6 h-px bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]" />
              <ArrowRight className="w-3 h-3 text-[var(--accent-purple)] -ml-1" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Feature Card ───────────────────────────────────────
function FeatureCard({
  icon: IconComponent, title, description, gradient, delay,
}: {
  icon: React.ElementType; title: string; description: string;
  gradient: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.6, ease }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group glass-card rounded-3xl p-7 relative overflow-hidden cursor-default transition-all duration-300"
    >
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-8 transition-opacity duration-500 pointer-events-none`} />
      <div className="w-12 h-12 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        <IconComponent className="w-full h-full" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Demo Workflow Card ─────────────────────────────────
const demoWorkflows = [
  {
    id: "lead",
    title: "Lead Nurturing Automation",
    subtitle: "Marketing · CRM",
    description: "Automatically qualify leads, enrich data, and send personalized emails — all triggered by a webhook.",
    nodes: [
      { icon: "🔗", label: "Webhook", color: "bg-[#6366f1]/20 text-[#6366f1]" },
      { icon: "⚙️", label: "Parse Data", color: "bg-[#a855f7]/20 text-[#a855f7]" },
      { icon: "🔍", label: "Check Lead", color: "bg-[#22d3ee]/20 text-[#22d3ee]" },
      { icon: "✨", label: "Enrich", color: "bg-[#f59e0b]/20 text-[#f59e0b]" },
      { icon: "📧", label: "Send Email", color: "bg-[#22c55e]/20 text-[#22c55e]" },
      { icon: "💬", label: "Slack", color: "bg-[#6366f1]/20 text-[#6366f1]" },
    ],
    badge: "Marketing",
    badgeColor: "bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/25",
    stats: [{ label: "Leads/day", val: "2.4k" }, { label: "Open rate", val: "68%" }, { label: "Time saved", val: "14h" }],
  },
  {
    id: "ecomm",
    title: "E-Commerce Order Processing",
    subtitle: "E-commerce · Ops",
    description: "Process orders, update inventory, send confirmation emails, and notify fulfilment teams automatically.",
    nodes: [
      { icon: "💳", label: "Payment", color: "bg-[#22c55e]/20 text-[#22c55e]" },
      { icon: "📦", label: "Inventory", color: "bg-[#f59e0b]/20 text-[#f59e0b]" },
      { icon: "📧", label: "Confirm", color: "bg-[#22d3ee]/20 text-[#22d3ee]" },
      { icon: "🚚", label: "Fulfil", color: "bg-[#a855f7]/20 text-[#a855f7]" },
      { icon: "📊", label: "Analytics", color: "bg-[#6366f1]/20 text-[#6366f1]" },
    ],
    badge: "E-Commerce",
    badgeColor: "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/25",
    stats: [{ label: "Orders/day", val: "8k" }, { label: "Accuracy", val: "99.8%" }, { label: "Time saved", val: "32h" }],
  },
  {
    id: "devops",
    title: "Daily Report Generator",
    subtitle: "DevOps · Analytics",
    description: "Scheduled daily data fetching, transformation, and delivery to Slack and email dashboards.",
    nodes: [
      { icon: "⏱️", label: "Schedule", color: "bg-[#f59e0b]/20 text-[#f59e0b]" },
      { icon: "📡", label: "Fetch Data", color: "bg-[#6366f1]/20 text-[#6366f1]" },
      { icon: "⚙️", label: "Transform", color: "bg-[#a855f7]/20 text-[#a855f7]" },
      { icon: "💬", label: "Slack", color: "bg-[#22d3ee]/20 text-[#22d3ee]" },
      { icon: "📧", label: "Email", color: "bg-[#22c55e]/20 text-[#22c55e]" },
    ],
    badge: "DevOps",
    badgeColor: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/25",
    stats: [{ label: "Reports/day", val: "12" }, { label: "Data sources", val: "8" }, { label: "Time saved", val: "6h" }],
  },
];

function DemoWorkflowCard({ workflow, delay }: { workflow: typeof demoWorkflows[0]; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.6, ease }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group glass-card rounded-3xl p-6 relative overflow-hidden cursor-default"
    >
      {/* Hover glow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--accent-blue)]/5 to-[var(--accent-purple)]/5 pointer-events-none"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${workflow.badgeColor} uppercase tracking-wide`}>
              {workflow.badge}
            </span>
            <h3 className="text-base font-bold text-[var(--text-primary)] mt-2 mb-0.5">{workflow.title}</h3>
            <p className="text-xs text-[var(--text-muted)]">{workflow.subtitle}</p>
          </div>
        </div>

        {/* Node pills */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {workflow.nodes.map((node, i) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.1 + i * 0.05 }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${node.color} border border-current/20`}
            >
              <span>{node.icon}</span>
              <span>{node.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          {workflow.description}
        </p>

        {/* Stats */}
        <div className="flex gap-4 pt-4 border-t border-[var(--border-default)]">
          {workflow.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-base font-bold text-[var(--text-primary)]">{stat.val}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Companies / Use Cases ──────────────────────────────
const companyUseCases = [
  {
    industry: "Marketing Teams",
    emoji: "📣",
    color: "from-[#6366f1]/20 to-[#a855f7]/10",
    border: "border-[#6366f1]/20",
    items: ["Lead scoring & routing", "Email drip campaigns", "Social post scheduling", "CRM data sync"],
  },
  {
    industry: "E-Commerce",
    emoji: "🛒",
    color: "from-[#22c55e]/20 to-[#22d3ee]/10",
    border: "border-[#22c55e]/20",
    items: ["Order processing pipelines", "Inventory alerts", "Customer re-engagement", "Fraud detection"],
  },
  {
    industry: "DevOps & Engineering",
    emoji: "⚙️",
    color: "from-[#f59e0b]/20 to-[#f97316]/10",
    border: "border-[#f59e0b]/20",
    items: ["Deploy notifications", "Daily report generation", "Error alerting to Slack", "Database backup jobs"],
  },
  {
    industry: "HR & Operations",
    emoji: "👥",
    color: "from-[#ec4899]/20 to-[#a855f7]/10",
    border: "border-[#ec4899]/20",
    items: ["Employee onboarding flows", "Leave approval chains", "Performance review reminders", "Payroll sync"],
  },
];

// ── Company Logo Placeholders ──────────────────────────
const logos = ["Stripe", "Notion", "Linear", "Vercel", "Figma", "Supabase"];

// ── Main Landing Page ─────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float absolute top-[5%] right-[10%] w-[700px] h-[700px] bg-[var(--accent-purple)] rounded-full blur-[200px] opacity-[0.08]" />
        <div className="animate-float-slow absolute bottom-[10%] left-[5%] w-[600px] h-[600px] bg-[var(--accent-blue)] rounded-full blur-[180px] opacity-[0.06]" />
        <div className="animate-float-reverse absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[var(--accent-amber)] rounded-full blur-[160px] opacity-[0.04]" />
      </div>

      <Navbar />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[var(--border-default)] mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
            Visual Workflow Automation Platform
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-[0.95] relative"
        >
          <span className="text-[var(--text-primary)]">Build Powerful</span>
          <br />
          <span className="bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-cyan)] bg-clip-text text-transparent">
            Workflows
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-[var(--accent-purple)] blur-[120px] opacity-[0.12] -z-10 rounded-full" />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease }}
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-10 font-medium"
        >
          Drag-and-drop visual automation for teams. Connect apps, schedule jobs, and orchestrate complex workflows — no code required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease }}
          className="flex flex-col sm:flex-row gap-3 items-center mb-16"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_36px_var(--glow-blue)] hover:shadow-[0_0_56px_var(--glow-purple)] transition-all duration-300"
            >
              Start Automating Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#workflows"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold glass border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-all duration-300"
            >
              <Play className="w-4 h-4 text-[var(--accent-purple)]" />
              See Demo Workflows
            </Link>
          </motion.div>
        </motion.div>

        {/* Mini workflow demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.6, ease }}
          className="w-full max-w-2xl glass-card rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03] rounded-3xl"
            style={{ backgroundImage: "radial-gradient(var(--canvas-dot) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-purple)] rounded-full blur-[80px] opacity-[0.1]" />
          <MiniWorkflow />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex justify-center mt-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
              <span className="text-xs font-semibold text-[var(--accent-green)]">Workflow executed successfully in 2.3s</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-9 rounded-full border-2 border-[var(--border-hover)] flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── TRUSTED BY ─────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-[var(--border-default)]">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-8"
          >
            Trusted by engineering and operations teams at
          </motion.p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {logos.map((logo, i) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="text-lg font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-200 cursor-default"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO WORKFLOWS ─────────────────────────────────── */}
      <section id="workflows" className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent-purple)] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20">
              <IconZap className="w-3.5 h-3.5" />
              Real-world templates
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
              Popular Workflow Templates
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              Get started in minutes with production-ready automation templates used by thousands of teams.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {demoWorkflows.map((wf, i) => (
              <DemoWorkflowCard key={wf.id} workflow={wf} delay={i * 0.1} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-colors"
            >
              Browse all 50+ templates
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── HOW COMPANIES USE IT ────────────────────────────── */}
      <section id="companies" className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent-green)] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20">
              <IconVisual className="w-3.5 h-3.5" />
              Industry use cases
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
              How Teams Use FlowCraft
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              From startups to enterprise — FlowCraft powers automation across every industry.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {companyUseCases.map((uc, i) => (
              <motion.div
                key={uc.industry}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`glass-card rounded-3xl p-6 relative overflow-hidden cursor-default border ${uc.border}`}
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${uc.color} pointer-events-none`} />
                <div className="relative z-10">
                  <div className="text-3xl mb-3">{uc.emoji}</div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">{uc.industry}</h3>
                  <ul className="space-y-2">
                    {uc.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0 mt-0.5" />
                        <span className="text-xs text-[var(--text-secondary)] leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
              Everything you need
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">A complete automation platform, built for modern teams.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={IconZap} title="Instant Automation" description="Trigger workflows from webhooks, schedules, or events. Zero latency execution with real-time feedback." gradient="from-[#6366f1] to-[#a855f7]" delay={0} />
            <FeatureCard icon={IconSchedule} title="Smart Scheduling" description="Cron expressions, natural language schedules, and timezone-aware triggers built in." gradient="from-[#a855f7] to-[#22d3ee]" delay={0.08} />
            <FeatureCard icon={IconIntegration} title="100+ Integrations" description="Connect Slack, email, HTTP, databases, and more with pre-built action nodes." gradient="from-[#22d3ee] to-[#6366f1]" delay={0.16} />
            <FeatureCard icon={IconVisual} title="Visual Canvas" description="Drag-and-drop node editor with real-time execution highlighting and live log streaming." gradient="from-[#22c55e] to-[#22d3ee]" delay={0.24} />
            <FeatureCard icon={IconAnalytics} title="Deep Analytics" description="Execution dashboards, success rates, duration trends, and performance insights." gradient="from-[#6366f1] to-[#22c55e]" delay={0.32} />
            <FeatureCard icon={IconAI} title="AI-Assisted" description="Let AI suggest workflow improvements, auto-generate node configs, and predict failures." gradient="from-[#a855f7] to-[#f97316]" delay={0.40} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
              Get running in 3 steps
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">From idea to production automation in minutes.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16.7%] right-[16.7%] h-px bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-cyan)] opacity-25" />
            {[
              { n: "1", title: "Create a Workflow", desc: "Name your automation and open the visual canvas builder.", delay: 0 },
              { n: "2", title: "Connect Nodes", desc: "Drag triggers, conditions, and actions. Wire them together visually.", delay: 0.1 },
              { n: "3", title: "Run Automatically", desc: "Set a schedule or trigger manually. Watch execution logs in real time.", delay: 0.2 },
            ].map((step) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay, duration: 0.5, ease }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center mb-5 shadow-[0_0_28px_var(--glow-blue)] text-white font-extrabold text-xl z-10"
                >
                  {step.n}
                </motion.div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-[220px] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="glass-card rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[var(--accent-purple)] rounded-full blur-[90px] opacity-[0.15]" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[var(--accent-blue)] rounded-full blur-[90px] opacity-[0.12]" />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_36px_var(--glow-blue)] mb-5 mx-auto"
              >
                <IconZap className="w-7 h-7" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-5 tracking-tight">
                Ready to automate everything?
              </h2>
              <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-xl mx-auto">
                Join thousands of teams saving hours every week with FlowCraft.
              </p>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_48px_var(--glow-blue)] hover:shadow-[0_0_72px_var(--glow-purple)] transition-all duration-300"
                >
                  Launch FlowCraft — It&apos;s Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-[var(--border-default)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
              <IconZap className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">FlowCraft</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">© 2026 FlowCraft · Built with ♥ for automation</p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Docs"].map((link) => (
              <a key={link} href="#" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}