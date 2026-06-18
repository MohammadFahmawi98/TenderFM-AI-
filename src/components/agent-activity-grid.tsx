"use client";

import { motion } from "framer-motion";
import type { TenderAgent } from "@/lib/agents";

const statusTone = {
  ready: "text-[#10B981]",
  running: "text-[#00E5FF]",
  waiting: "text-[#94A3B8]",
  review: "text-[#F59E0B]",
};

export function AgentActivityGrid({ agents }: { agents: TenderAgent[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {agents.map((agent, index) => (
        <motion.article
          key={agent.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.28 }}
          className="rounded-lg border border-white/[0.06] bg-[#111827] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{agent.shortName}</p>
              <p className={`mt-1 text-xs font-medium uppercase tracking-[0.16em] ${statusTone[agent.status]}`}>
                {agent.status}
              </p>
            </div>
            <motion.span
              className="mt-1 h-2.5 w-2.5 rounded-full bg-[#00E5FF]"
              animate={{ opacity: agent.status === "running" ? [0.35, 1, 0.35] : 0.7, scale: agent.status === "running" ? [1, 1.35, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#050816]">
            <motion.div
              className="h-full rounded-full bg-[#3B82F6]"
              initial={{ width: 0 }}
              animate={{ width: `${agent.progress}%` }}
              transition={{ delay: 0.15 + index * 0.03, duration: 0.6 }}
            />
          </div>
          <p className="mt-4 line-clamp-3 text-xs leading-5 text-[#94A3B8]">{agent.currentTask}</p>
          <p className="mt-4 text-xs text-[#F8FAFC]">{agent.deliverables[0]}</p>
        </motion.article>
      ))}
    </div>
  );
}
