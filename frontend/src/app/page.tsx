"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Zap,
  Calendar,
  Eye,
  ArrowRight,
  CheckCircle,
  Play,
  Link2,
  Send,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// ── Easing ────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ── Top‑level Nav ─────────────────────────────────────
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass border-b border-[var(--border-default)]"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-[0_0_20px_var(--glow-blue)] group-hover:shadow-[0_0_30px_var(--glow-purple)] transition-shadow duration-300"
        >
          <span className="text-white font-bold text-sm">FC</span>
        </motion.div>
        <span className="text-xl font-semibold text-[var(--text-primary)]">FlowCraft</span>
      </Link>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/workflows", label: "Workflows" },
          { href: "/executions", label: "Executions" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 font-medium"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white shadow-[0_0_20px_var(--glow-blue)] hover:shadow-[0_0_30px_var(--glow-purple)] transition-all duration-300"
        >
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}

// ── Animated Demo Workflow ─────────────────────────────
const demoNodes = [
  { label: "Trigger", icon: Play, color: "from-[var(--accent-blue)] to-indigo-600", delay: 0 },
  { label: "Delay", icon: Calendar, color: "from-[var(--accent-purple)] to-violet-600", delay: 0.15 },
  { label: "Telegram", icon: Send, color: "from-[var(--accent-cyan)] to-sky-600", delay: 0.3 },
  { label: "Done", icon: CheckCircle, color: "from-[var(--accent-green)] to-emerald-600", delay: 0.45 },
];

function DemoWorkflow() {
  return (
    <div className="flex items-center gap-0 justify-center flex-wrap gap-y-4">
      {demoNodes.map((node, i) => {
        const Icon = node.icon;
        return (
          <div key={node.label} className="flex items-center">
            {/* Node card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8 + node.delay, duration: 0.5, ease }}
              whileHover={{ y: -6, scale: 1.05 }}
              className="relative group"
            >
              {/* Glow pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: node.delay }}
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${node.color} blur-[12px] opacity-40`}
              />
              <div
                className="relative glass-card rounded-2xl px-5 py-4 flex flex-col items-center gap-2 min-w-[96px] cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{node.label}</span>
              </div>
            </motion.div>

            {/* Arrow connector */}
            {i < demoNodes.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.1 + node.delay, duration: 0.4 }}
                className="flex items-center mx-2"
              >
                <div className="w-8 h-px bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)]" />
                <ArrowRight className="w-3 h-3 text-[var(--accent-purple)] -ml-1" />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Feature Card ──────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.7, ease }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group glass-card rounded-3xl p-8 relative overflow-hidden cursor-default transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]"
    >
      {/* Hover glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
      />
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{title}</h3>
      <p className="text-base text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Step Card ─────────────────────────────────────────
function StepCard({
  number,
  title,
  description,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.55, ease }}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 4 }}
        className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center mb-6 shadow-[0_0_30px_var(--glow-blue)] relative text-white font-extrabold text-2xl z-10"
      >
        <div className="absolute inset-0 rounded-3xl bg-white/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity" />
        {number}
      </motion.div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{title}</h3>
      <p className="text-base text-[var(--text-secondary)] max-w-[240px] leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Main Landing Page ─────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float absolute top-[5%] right-[10%] w-[700px] h-[700px] bg-[var(--accent-purple)] rounded-full blur-[200px] opacity-[0.10]" />
        <div className="animate-float-slow absolute bottom-[10%] left-[5%] w-[600px] h-[600px] bg-[var(--accent-blue)] rounded-full blur-[180px] opacity-[0.08]" />
        <div className="animate-float-reverse absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-[var(--accent-cyan)] rounded-full blur-[160px] opacity-[0.06]" />
      </div>

      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
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
            Visual Workflow Automation
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease }}
          className="text-7xl md:text-9xl font-extrabold tracking-tighter mb-8 leading-[0.9]"
        >
          <span className="text-[var(--text-primary)] relative z-10">Flow</span>
          <span
            className="bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-cyan)] bg-clip-text text-transparent relative z-10"
          >
            Craft
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-[var(--accent-purple)] blur-[120px] opacity-20 -z-10 rounded-full" />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease }}
          className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl leading-relaxed mb-12 font-medium"
        >
          Build visual workflows, automate repetitive tasks, and schedule actions effortlessly — no code required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_40px_var(--glow-blue)] hover:shadow-[0_0_60px_var(--glow-purple)] transition-all duration-300 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/workflows"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold glass border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] shadow-sm hover:shadow-md transition-all duration-300 text-lg"
            >
              <GitBranch className="w-5 h-5" />
              View Workflows
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-[var(--border-hover)] flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── VISUAL DEMO ───────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-5 tracking-tight">
              See it in action
            </h2>
            <p className="text-[var(--text-secondary)] text-xl">
              Visual node-based workflows — drag, connect, execute.
            </p>
          </motion.div>

          {/* Demo canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
            className="glass-card rounded-3xl p-10 md:p-14 relative overflow-hidden"
          >
            {/* Subtle grid bg */}
            <div
              className="absolute inset-0 opacity-[0.04] rounded-3xl"
              style={{
                backgroundImage: "radial-gradient(var(--canvas-dot) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-purple)] rounded-full blur-[100px] opacity-[0.12]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-blue)] rounded-full blur-[100px] opacity-[0.10]" />

            <div className="relative z-10">
              <DemoWorkflow />

              {/* Floating status label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="flex justify-center mt-8"
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/30"
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                  <span className="text-xs font-semibold text-[var(--accent-green)]">
                    Workflow executed successfully in 1.5s
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-5 tracking-tight">
              Everything you need
            </h2>
            <p className="text-[var(--text-secondary)] text-xl">
              A complete automation platform in your browser.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={Zap}
              title="Organize Tasks"
              description="Group actions into named steps. Stay organized and focused."
              gradient="from-[var(--accent-blue)] to-indigo-600"
              delay={0}
            />
            <FeatureCard
              icon={Calendar}
              title="Schedule Workflows"
              description="Run workflows every minute, hourly, daily, or weekly automatically."
              gradient="from-[var(--accent-purple)] to-violet-600"
              delay={0.08}
            />
            <FeatureCard
              icon={MessageSquare}
              title="Real Integrations"
              description="Send Telegram messages, trigger HTTP calls, and more built-in actions."
              gradient="from-[var(--accent-cyan)] to-sky-600"
              delay={0.16}
            />
            <FeatureCard
              icon={Eye}
              title="Visual Builder"
              description="Drag-and-drop node canvas with live execution feedback."
              gradient="from-[var(--accent-green)] to-emerald-600"
              delay={0.24}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-5 tracking-tight">
              How it works
            </h2>
            <p className="text-[var(--text-secondary)] text-xl">Get up and running in minutes.</p>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-7 left-[16.7%] right-[16.7%] h-px bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-cyan)] opacity-30"
            />

            <StepCard
              number="1"
              title="Create a Workflow"
              description="Name your workflow and open the visual canvas builder."
              delay={0}
            />
            <StepCard
              number="2"
              title="Connect Nodes"
              description="Drag triggers, actions, and integrations onto the canvas and wire them up."
              delay={0.1}
            />
            <StepCard
              number="3"
              title="Run Automatically"
              description="Set a schedule or trigger manually. Watch execution logs in real time."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="relative py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
            className="glass-card rounded-3xl p-14 relative overflow-hidden"
          >
            {/* Glow blobs */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-[var(--accent-purple)] rounded-full blur-[100px] opacity-[0.18]" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[var(--accent-blue)] rounded-full blur-[100px] opacity-[0.14]" />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_40px_var(--glow-blue)] mb-6 mx-auto"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] mb-6 tracking-tight">
                Ready to automate your work?
              </h2>
              <p className="text-[var(--text-secondary)] text-xl mb-12 max-w-2xl mx-auto">
                Join FlowCraft and start building powerful workflows today.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 px-12 py-6 rounded-2xl font-bold text-white text-xl bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] shadow-[0_0_50px_var(--glow-blue)] hover:shadow-[0_0_80px_var(--glow-purple)] transition-all duration-300"
                >
                  Launch FlowCraft
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-[var(--border-default)] text-center">
        <p className="text-sm text-[var(--text-muted)]">
          © 2026 FlowCraft · Built with ♥ for automation
        </p>
      </footer>
    </div>
  );
}