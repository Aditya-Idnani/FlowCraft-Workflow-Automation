"use client";

import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Background ambient glows with floating animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="animate-float absolute top-[5%] right-[15%] w-[600px] h-[600px] bg-[var(--accent-purple)] rounded-full blur-[180px] opacity-[0.12]" />
        <div className="animate-float-slow absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-[var(--accent-blue)] rounded-full blur-[160px] opacity-[0.1]" />
        <div className="animate-float-reverse absolute top-[50%] right-[0%] w-[400px] h-[400px] bg-[var(--accent-cyan)] rounded-full blur-[140px] opacity-[0.08]" />
        <div className="animate-float absolute top-[30%] left-[30%] w-[300px] h-[300px] bg-[var(--accent-purple)] rounded-full blur-[120px] opacity-[0.06]" />
      </div>

      <Sidebar />
      <main className="ml-64 min-h-screen relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
