"use client";

import { motion } from "framer-motion";
import { BarChart3, FolderOpen } from "lucide-react";
import { Task } from "@/lib/types";

interface GanttViewProps {
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

export default function GanttView({ tasks }: GanttViewProps) {
  return (
    <div className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2D9C6] pb-3">
        <div>
          <h3 className="font-serif font-bold text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#C9662A]" />
            Multi-Day Gantt Schedule View
          </h3>
          <p className="text-xs text-[#8C867A] mt-0.5">Timeline workload distribution across days</p>
        </div>
        <span className="text-xs font-mono text-[#8C867A] bg-[#E9E1CF] px-3 py-1 rounded-full">
          Current Sprint
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E2D9C6] rounded-2xl">
          <FolderOpen className="w-8 h-8 text-[#8C867A] mx-auto mb-2 opacity-40" />
          <p className="text-xs font-mono text-[#57534A]">No tasks to display in Gantt</p>
          <p className="text-[11px] text-[#8C867A] mt-1">Create tasks to visualize dependencies and timelines</p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {tasks.slice(0, 10).map((task, index) => {
            const offset = (index * 11) % 65;
            const width = Math.min(Math.max((task.estimated_duration || 2) * 9, 20), 45);
            return (
              <div key={task.id} className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-[11px] text-[#57534A]">
                  <span className="font-semibold">{task.name}</span>
                  <span>
                    SY-{task.id} · {formatDuration(task.estimated_duration)}
                  </span>
                </div>
                <div className="bg-[#EFE8D8] h-7 rounded-xl relative overflow-hidden p-0.5 border border-[#E2D9C6]/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.5, delay: index * 0.04 }}
                    className="absolute top-1 bottom-1 rounded-lg text-white text-[10px] flex items-center px-3 shadow-xs"
                    style={{
                      left: `${offset}%`,
                      backgroundColor:
                        index % 3 === 0
                          ? "#C9662A"
                          : index % 3 === 1
                          ? "#5A684B"
                          : "#3D6B78",
                    }}
                  >
                    <span>{task.name}</span>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
