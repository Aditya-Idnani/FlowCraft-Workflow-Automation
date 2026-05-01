"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className="relative p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)] transition-all duration-200 group"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 20 }}
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-[var(--accent-yellow)] group-hover:drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--accent-purple)] group-hover:drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
        )}
      </motion.div>
    </motion.button>
  );
}
