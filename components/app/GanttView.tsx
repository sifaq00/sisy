"use client";

import { motion } from "framer-motion";
import { BarChart3, FolderOpen, Calendar, Clock, Link2, CheckCircle2 } from "lucide-react";
import { Task } from "@/lib/types";

interface GanttViewProps {
  tasks: Task[];
}

const formatDuration = (hours?: number) => {
  if (!hours || hours <= 0) return "1h";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const BAR_COLORS = [
  "#C9662A", // Terracotta
  "#5A684B", // Olive Green
  "#3D6B78", // Slate Blue
  "#A3485E", // Dusty Rose
  "#6B5B95", // Indigo Muted
  "#B565A7", // Orchid Muted
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function GanttView({ tasks }: GanttViewProps) {
  return (
    <div className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2D9C6] pb-4">
        <div>
          <h3 className="font-serif font-bold text-base flex items-center gap-2 text-[#211F1A]">
            <BarChart3 className="w-4 h-4 text-[#C9662A]" />
            Multi-Day Gantt Schedule View
          </h3>
          <p className="text-xs text-[#8C867A] mt-0.5">Timeline workload distribution and sprint progression</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#57534A] bg-[#E9E1CF] px-3 py-1 rounded-full flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[#8C867A]" />
            7-Day Sprint Horizon
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E2D9C6] rounded-2xl">
          <FolderOpen className="w-8 h-8 text-[#8C867A] mx-auto mb-2 opacity-40" />
          <p className="text-xs font-mono text-[#57534A]">No tasks to display in Gantt</p>
          <p className="text-[11px] text-[#8C867A] mt-1">Create tasks to visualize dependencies and timelines</p>
        </div>
      ) : (
        <div className="space-y-6 pt-1">
          {/* Day Grid Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-[#8C867A] pb-2 border-b border-[#E2D9C6]/60">
            {DAYS.map((day, dIdx) => (
              <div key={day} className="py-1 px-1 rounded-lg bg-[#EFE8D8]/40 font-medium">
                {day}
                <span className="text-[9px] text-[#8C867A]/70 block">Day {dIdx + 1}</span>
              </div>
            ))}
          </div>

          {/* Task Rows */}
          <div className="space-y-4">
            {tasks.map((task, index) => {
              const color = BAR_COLORS[index % BAR_COLORS.length];
              const durationHours = task.estimated_duration || 1.5;
              
              // Calculate horizontal position across 7 days (0% to 100%)
              const startDayOffset = (index * 13) % 55;
              const widthPct = Math.min(Math.max((durationHours / 14) * 100, 18), 45);
              const isCompleted = task.status === "COMPLETED";

              return (
                <div key={task.id} className="space-y-1.5 group">
                  {/* Task Metadata Row: 2-line safe flex layout */}
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-[10px] text-[#8C867A] bg-[#EFE8D8] px-1.5 py-0.5 rounded shrink-0 font-bold">
                        SY-{String(task.id).padStart(4, "0")}
                      </span>
                      
                      <span
                        className={`font-medium text-[#211F1A] text-xs truncate max-w-[420px] ${
                          isCompleted ? "line-through text-[#8C867A]" : ""
                        }`}
                        title={task.name}
                      >
                        {task.name}
                      </span>

                      {task.depends_on && task.depends_on.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-[#3D6B78]/10 text-[#3D6B78] shrink-0">
                          <Link2 className="w-2.5 h-2.5" />
                          SY-{String(task.depends_on[0]).padStart(4, "0")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-right text-[11px] font-mono text-[#8C867A]">
                      <span className="flex items-center gap-1 text-[#57534A]">
                        <Clock className="w-3 h-3 text-[#8C867A]" />
                        {formatDuration(task.estimated_duration)}
                      </span>
                      {isCompleted && (
                        <span className="text-[#5A684B] flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gantt Timeline Bar Track */}
                  <div className="bg-[#EFE8D8]/50 h-8 rounded-xl relative overflow-hidden p-1 border border-[#E2D9C6]/60">
                    {/* Background Grid Lines for 7 Days */}
                    <div className="absolute inset-0 grid grid-cols-7 pointer-events-none divide-x divide-[#E2D9C6]/40" />

                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${widthPct}%`, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.04 }}
                      className="absolute top-1 bottom-1 rounded-lg text-white text-[11px] font-medium flex items-center px-3 shadow-xs overflow-hidden cursor-pointer select-none transition-all hover:brightness-105"
                      style={{
                        left: `${startDayOffset}%`,
                        backgroundColor: color,
                        opacity: isCompleted ? 0.6 : 1,
                      }}
                      title={`${task.name} (Duration: ${formatDuration(task.estimated_duration)})`}
                    >
                      <span className="truncate whitespace-nowrap block w-full leading-none">
                        {task.name}
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
