"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Sun, Moon, ChevronDown, User, Settings, LogOut, Menu } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 lg:left-56 right-0 h-14 flex items-center justify-between px-4 lg:px-6 z-30 border-b border-[var(--border-default)]"
      style={{
        background: "var(--bg-topbar)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-2 lg:gap-4 flex-1 max-w-sm">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div
          className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-200 ${
            searchFocused
              ? "border-[var(--accent-blue)]/50 shadow-[0_0_0_3px_var(--glow-blue)]"
              : "border-[var(--border-default)]"
          }`}
          style={{ background: "var(--bg-card)" }}
        >
          <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          <input
            type="text"
            placeholder="Search workflows, executions..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none min-w-0"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded-md border border-[var(--border-default)] font-mono leading-none">
            <span>⌘</span><span>K</span>
          </kbd>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="relative p-2 rounded-xl border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
          style={{ background: "var(--bg-card)" }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 20 }}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[var(--accent-yellow)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--accent-purple)]" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-xl border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
          style={{ background: "var(--bg-card)" }}
        >
          <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
          {/* notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] shadow-[0_0_4px_var(--glow-red)]" />
        </motion.button>

        {/* Profile dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-all duration-200"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_10px_var(--glow-purple)] overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">{initials}</span>
              )}
            </div>
            <motion.div
              animate={{ rotate: profileOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[var(--border-default)] overflow-hidden z-50"
                  style={{
                    background: "var(--bg-sidebar)",
                    boxShadow: "var(--glass-shadow)",
                  }}
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-[var(--border-default)]">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {user?.name || user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>

                  <div className="p-1.5">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover-bg)] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover-bg)] transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  <div className="p-1.5 border-t border-[var(--border-default)]">
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
