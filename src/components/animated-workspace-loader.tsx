"use client";

import { motion } from "framer-motion";
import { Bot, Building2, CheckCircle2, FileText, PackageCheck, Users } from "lucide-react";

const loaderSteps = [
  { label: "Workspace", icon: Building2 },
  { label: "Team", icon: Users },
  { label: "Files", icon: FileText },
  { label: "Agents", icon: Bot },
  { label: "Review", icon: CheckCircle2 },
  { label: "Export", icon: PackageCheck },
];

export function AnimatedWorkspaceLoader({ title = "Loading workspace" }: { title?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#162033] bg-[#0B1220] p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00E5FF]">TenderFlow is preparing</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
            Loading workspace structure, team permissions, AI agents, documents, approvals, and export gates.
          </p>
        </div>

        <div className="relative h-20 w-full max-w-md">
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-8 top-9 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10 flex h-full items-center justify-between">
            {loaderSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  className="group flex flex-col items-center gap-2"
                  animate={{
                    y: [0, -5, 0],
                    opacity: [0.58, 1, 0.58],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.13,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#1E293B] bg-[#050816] shadow-[0_0_24px_rgba(0,229,255,0.08)]">
                    <Icon className="h-4 w-4 text-[#00E5FF]" />
                  </div>
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B] sm:block">{step.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <motion.div
            key={item}
            className="h-20 rounded-md border border-[#162033] bg-[#050816]"
            animate={{ opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}
