"use client";

import { DashboardLayout } from "@/components/layout";
import { motion } from "framer-motion";
import { Plus, LayoutTemplate, ArrowRight, ShoppingBag, Users, Zap, Loader2 } from "lucide-react";
import { DEMO_TEMPLATES } from "@/lib/demo-templates";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { workflowApi } from "@/lib/api";

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag,
  Users,
  Zap,
};

export default function TemplatesPage() {
  const router = useRouter();
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  const handleUseTemplate = async (template: typeof DEMO_TEMPLATES[0]) => {
    setLoadingTemplate(template.id);
    try {
      const { data, error } = await workflowApi.create({
        name: template.name,
        nodes: template.nodes,
        edges: template.edges,
      });

      if (data && data.id) {
        router.push(`/workflows/${data.id}`);
      } else {
        alert("Failed to create workflow template: " + error);
        setLoadingTemplate(null);
      }
    } catch (err) {
      alert("Error generating template.");
      setLoadingTemplate(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 border border-[var(--border-default)]">
              <LayoutTemplate className="w-6 h-6 text-[var(--accent-blue)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Templates</h1>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Start quickly with pre-built workflows designed for common use cases. 
            Customize them to fit your exact needs or use them as inspiration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_TEMPLATES.map((template, i) => {
            const Icon = iconMap[template.icon] || LayoutTemplate;
            const isLoading = loadingTemplate === template.id;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card rounded-2xl overflow-hidden hover:ring-2 hover:ring-[var(--accent-blue)]/50 transition-all duration-300 flex flex-col"
              >
                <div className={`h-24 w-full bg-gradient-to-br ${template.bg} opacity-80 relative overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <Icon className="w-10 h-10 text-white drop-shadow-md" />
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-blue)] transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1 line-clamp-3">
                    {template.description}
                  </p>
                  
                  <button
                    onClick={() => handleUseTemplate(template)}
                    disabled={loadingTemplate !== null}
                    className="w-full py-2.5 rounded-xl border border-[var(--border-default)] flex items-center justify-center gap-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--sidebar-hover-bg)] hover:border-[var(--border-hover)] transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-blue)]" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] transition-colors" />
                        Use Template
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
