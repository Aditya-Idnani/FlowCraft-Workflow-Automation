"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, PlayCircle, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/executions", label: "Executions", icon: PlayCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-screen w-64 flex flex-col glass-card !rounded-none border-r border-[var(--border-active)]"
    >
      {/* Ambient glow */}
      <div className="animate-float-slow absolute top-0 left-0 w-40 h-40 bg-[var(--accent-purple)] rounded-full blur-[100px] opacity-30 pointer-events-none" />
      <div className="animate-float-reverse absolute bottom-20 left-10 w-32 h-32 bg-[var(--accent-blue)] rounded-full blur-[80px] opacity-20 pointer-events-none" />

      {/* Logo */}
      <div className="relative p-6 border-b border-[var(--border-default)]">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-[0_0_20px_var(--glow-blue)] group-hover:shadow-[0_0_35px_var(--glow-purple)] transition-shadow duration-300"
          >
            <span className="text-white font-bold text-sm">FC</span>
          </motion.div>
          <span className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors duration-200">FlowCraft</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.08, duration: 0.35 }}
              >
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300
                    ${isActive
                      ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)] shadow-[0_0_25px_var(--glow-blue)] border border-[var(--border-active)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent"
                    }
                  `}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent-blue)]/15 to-[var(--accent-purple)]/10 pointer-events-none"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <Icon className={`relative w-5 h-5 transition-all duration-200 ${isActive ? "text-[var(--accent-blue)]" : ""}`} />
                  <span className="relative font-medium">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="sidebar-dot"
                      className="absolute right-3 w-2 h-2 rounded-full bg-[var(--accent-blue)] animate-pulse-glow"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* User section + Theme toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="p-4 border-t border-[var(--border-default)]"
      >
        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl glass hover:bg-[var(--bg-card-hover)] transition-all duration-200 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_20px_var(--glow-purple)] overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2 px-4 mt-2 justify-between">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/15 transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.aside>
  );
}
