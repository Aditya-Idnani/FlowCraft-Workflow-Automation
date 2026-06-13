"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  PlayCircle,
  FileText,
  Calendar,
  Layers,
  Plug,
  Settings,
  LogOut,
  ChevronUp,
  Zap,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/executions", label: "Executions", icon: PlayCircle },
  { href: "/logs", label: "Logs", icon: FileText },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/connections", label: "Connections", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || user?.email?.split("@")[0] || "User";
  const initials = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className={`fixed left-0 top-0 h-screen w-56 flex flex-col border-r border-[var(--border-default)] z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--bg-sidebar)" }}
      >
        {/* Ambient glow */}
      <div className="animate-float-slow absolute top-0 left-0 w-40 h-40 bg-[var(--accent-purple)] rounded-full blur-[100px] opacity-20 pointer-events-none" />
      <div className="animate-float-reverse absolute bottom-20 left-5 w-28 h-28 bg-[var(--accent-blue)] rounded-full blur-[80px] opacity-15 pointer-events-none" />

      {/* Logo */}
      <div className="relative px-5 py-5 border-b border-[var(--border-default)]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          >
            <img src="/favicon.ico" alt="FlowCraft Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
          </motion.div>
          <div>
            <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">FlowCraft</span>
            <p className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">Workflow Automation</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--sidebar-hover-bg)] ml-auto">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 relative overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover-bg)]"
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl border"
                      style={{
                        background: "var(--sidebar-active-bg)",
                        borderColor: "var(--sidebar-active-border)",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${
                      isActive ? "text-[var(--accent-blue)]" : ""
                    }`}
                    style={{ width: 18, height: 18 }}
                  />
                  <span className="relative text-sm font-medium">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-dot"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Pro Plan Badge */}
      <div className="mx-3 mb-3">
        <div className="rounded-xl p-3 border border-[var(--accent-purple)]/25"
          style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(99,102,241,0.08))" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-[var(--accent-purple)]">Pro Plan</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] mb-2.5 leading-relaxed">
            You are on Pro Plan<br />Unlimited workflows
          </p>
          <button className="w-full py-1.5 rounded-lg text-[10px] font-semibold text-white bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] hover:opacity-90 transition-opacity">
            Manage Plan
          </button>
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-[var(--border-default)] px-3 py-3">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--sidebar-hover-bg)] transition-all duration-200"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_12px_var(--glow-purple)] overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">
              {firstName}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <motion.div animate={{ rotate: userMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </motion.div>
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex items-center gap-2 px-1">
                <ThemeToggle />
                <Link
                  href="/profile"
                  className="flex-1 py-2 text-xs text-center text-[var(--text-secondary)] rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 py-2 px-3 text-xs text-[var(--accent-red)] rounded-lg hover:bg-[var(--accent-red)]/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
    </>
  );
}
