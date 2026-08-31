"use client";

import { motion } from "framer-motion";
import { Clock, FolderOpen } from "lucide-react";
import { Task } from "@/lib/types";

interface TimeTrackerViewProps {
  tasks: Task[];
}

const formatDuration = (hours?: number) => {
  if (!hours || hours <= 0) return "—";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export default function TimeTrackerView({ tasks }: TimeTrackerViewProps) {
  return (
    <div className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-[#E2D9C6] pb-3">
        <h3 className="font-serif font-bold text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#C9662A]" />
          Planned vs Actual Time Tracking Ratio
        </h3>
        <p className="text-xs text-[#8C867A] mt-0.5">Track estimate accuracy and overtime variance</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E2D9C6] rounded-2xl">
          <FolderOpen className="w-8 h-8 text-[#8C867A] mx-auto mb-2 opacity-40" />
          <p className="text-xs font-mono text-[#57534A]">No time tracking logs yet</p>
          <p className="text-[11px] text-[#8C867A] mt-1">Start a task timer in the table to record actual work duration</p>
        </div>
      ) : (
        <div className="space-y-5 pt-1">
          {tasks.map((task) => {
            const planned = task.estimated_duration || 1;
            const actual = task.actual_duration_hours || 0;
            const ratio = Math.min((actual / planned) * 100, 100);
            const isOverdue = actual > planned;
            return (
              <div
                key={task.id}
                className="space-y-1.5 bg-[#F5F0E4]/40 p-3.5 rounded-2xl border border-[#E2D9C6]/60"
              >
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-[#211F1A]">{task.name}</span>
                  <span className={isOverdue ? "text-[#B83A2E] font-bold" : "text-[#5A684B]"}>
                    {formatDuration(actual)} / {formatDuration(planned)} (
                    {Math.round((actual / planned) * 100)}%)
                  </span>
                </div>
                <div className="h-3 bg-[#EFE8D8] rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio || (actual > 0 ? 10 : 0)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      isOverdue ? "bg-[#B83A2E]" : "bg-[#5A684B]"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
