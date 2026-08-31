"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, CheckCircle } from "lucide-react";
import { Task, ScheduledBlock } from "@/lib/types";

interface ScheduleStripProps {
  todayFormatted: string;
  algo: string;
  setAlgo: (algo: string) => void;
  triggerOptimize: () => void;
  isOptimizing: boolean;
  nowMarkerLeft: number;
  scheduledBlocks: ScheduledBlock[];
  tasks: Task[];
  setSelectedTaskId: (id: number) => void;
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

export default function ScheduleStrip({
  todayFormatted,
  algo,
  setAlgo,
  triggerOptimize,
  isOptimizing,
  nowMarkerLeft,
  scheduledBlocks,
  tasks,
  setSelectedTaskId,
}: ScheduleStripProps) {
  return (
    <section className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-mono text-[#8C867A] tracking-widest uppercase font-semibold">
            {todayFormatted} · OPTIMIZED TIMELINE
          </div>
          <h1 className="text-xl font-bold font-serif text-[#211F1A] mt-0.5">
            Today&apos;s Focus
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
            className="text-xs font-mono bg-[#E9E1CF] border border-[#E2D9C6] rounded-xl px-3 py-2 text-[#211F1A] focus:outline-none cursor-pointer"
          >
            <option value="greedy">Greedy Priority (Default)</option>
            <option value="dependency">Dependency Critical Path (DAG)</option>
            <option value="deadline">Earliest Deadline First (EDF)</option>
            <option value="sjf">Shortest Job First (SJF)</option>
            <option value="balanced">Balanced Distribution</option>
          </select>

          <button
            onClick={triggerOptimize}
            disabled={isOptimizing}
            className="s-pill text-xs py-2 px-3.5 shadow-sm"
          >
            <Zap className={`w-3.5 h-3.5 text-[#C9662A] ${isOptimizing ? "animate-spin" : ""}`} />
            <span>{isOptimizing ? "Optimizing…" : "Optimize"}</span>
          </button>
        </div>
      </div>

      {/* 8:00 - 19:00 Timeline Track */}
      <div className="overflow-x-auto custom-scrollbar pt-2 pb-1">
        <div className="min-w-[620px]">
          {/* Hour markers */}
          <div className="flex justify-between text-[9.5px] font-mono text-[#8C867A] mb-1.5 px-1 select-none">
          <span>08:00</span>
          <span>10:00</span>
          <span>12:00</span>
          <span>14:00</span>
          <span>16:00</span>
          <span>18:00</span>
          <span>19:00</span>
        </div>

        {/* Timeline Canvas */}
        <div className="relative h-14 bg-[#E9E1CF]/40 border border-[#E2D9C6] rounded-xl overflow-hidden p-1">
          {/* Vertical grid lines */}
          {[0, 18.18, 36.36, 54.54, 72.72, 90.9, 100].map((pos, idx) => (
            <span
              key={idx}
              className="absolute top-0 bottom-0 border-l border-[#E2D9C6]/60 pointer-events-none"
              style={{ left: `${pos}%` }}
            />
          ))}

          {/* NOW Indicator */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: `${nowMarkerLeft}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-[#C9662A] -mt-1 shadow-xs" />
            <div className="w-0.5 h-full bg-[#C9662A]" />
          </div>

          {/* Empty state message */}
          {scheduledBlocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-mono text-[#8C867A] pointer-events-none">
              No active tasks scheduled · Click + New Task to start
            </div>
          )}

          {/* Task Blocks */}
          <AnimatePresence>
            {scheduledBlocks.map((block) => {
              if (!block || !block.taskId) return null;
              const fullTask = tasks.find((t) => t && t.id === block.taskId);
              const isCompleted = fullTask?.status === "COMPLETED" || block.status === "COMPLETED";
              const isInProgress = fullTask?.status === "IN_PROGRESS" || block.status === "IN_PROGRESS";

              const leftPct = Math.max(0, Math.min(100, ((block.startHour - 8) / 11) * 100));
              const widthPct = Math.max(4, Math.min(100 - leftPct, (block.durationHours / 11) * 100));

              return (
                <motion.div
                  key={block.taskId}
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  onClick={() => setSelectedTaskId(block.taskId)}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                  className={`absolute top-1 bottom-1 rounded-lg border px-2.5 flex flex-col justify-center cursor-pointer transition-shadow shadow-xs hover:shadow-md select-none ${
                    isCompleted
                      ? "bg-[#5A684B]/15 border-[#5A684B]/40 text-[#5A684B]"
                      : isInProgress
                      ? "bg-[#C9662A] text-white border-[#C9662A]"
                      : "bg-[#FFFDF7] border-[#E2D9C6] text-[#211F1A] hover:border-[#C9662A]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 overflow-hidden">
                    <span className="text-[10.5px] font-medium truncate font-sans">
                      {block.name}
                    </span>
                    <span className="text-[9px] font-mono shrink-0 opacity-80">
                      {formatDuration(block.durationHours)}
                    </span>
                  </div>

                  {/* Micro state icon */}
                  <div className="flex items-center gap-1 text-[8.5px] font-mono mt-0.5 opacity-85">
                    {isCompleted ? (
                      <span className="flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Done
                      </span>
                    ) : isInProgress ? (
                      <span className="flex items-center gap-0.5">
                        <Play className="w-2.5 h-2.5 fill-current" /> Active
                      </span>
                    ) : (
                      <span>P{block.priority || 3}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </section>
  );
}
