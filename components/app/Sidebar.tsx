"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, Tag, Flame, Circle, Command } from "lucide-react";
import { Task } from "@/lib/types";

interface SidebarProps {
  tasks: Task[];
  completedCount: number;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterTag: string | null;
  setFilterTag: (tag: string | null) => void;
  allTags: string[];
}

export default function Sidebar({
  tasks,
  completedCount,
  filterStatus,
  setFilterStatus,
  filterTag,
  setFilterTag,
  allTags,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-[#FFFDF7] border border-[#E2D9C6] rounded-2xl p-4 hidden md:flex flex-col shrink-0 shadow-sm sticky top-6 self-start">
      <div className="space-y-6 flex-1">
        <div>
          <div className="text-[10px] font-mono text-[#8C867A] tracking-wider uppercase mb-2.5 flex items-center gap-1.5 font-semibold">
            <SlidersHorizontal className="w-3 h-3" />
            Status View
          </div>
          <div className="space-y-1">
            {[
              { id: "ALL", label: "All Tasks", count: tasks.length },
              { id: "ACTIVE", label: "In Progress", count: tasks.length - completedCount },
              { id: "DONE", label: "Completed", count: completedCount },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className="relative w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between"
              >
                {filterStatus === s.id && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 bg-[#211F1A] rounded-xl shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    filterStatus === s.id ? "text-[#F5F0E4] font-semibold" : "text-[#57534A]"
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`relative z-10 text-[10px] font-mono ${
                    filterStatus === s.id ? "text-[#E9E1CF]" : "text-[#8C867A]"
                  }`}
                >
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-[#8C867A] tracking-wider uppercase mb-2.5 flex items-center gap-1.5 font-semibold">
            <Tag className="w-3 h-3" />
            Tags
          </div>
          <div className="space-y-1 max-h-44 overflow-y-auto overscroll-contain custom-scrollbar pr-1" data-lenis-prevent="true">
            <button
              onClick={() => setFilterTag(null)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                filterTag === null ? "bg-[#E9E1CF] text-[#211F1A] font-semibold" : "text-[#57534A] hover:bg-[#E9E1CF]/40"
              }`}
            >
              <span>All Tags</span>
              <span className="text-[10px] font-mono text-[#8C867A]">{tasks.length}</span>
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                  filterTag === tag
                    ? "bg-[#E9E1CF] text-[#C9662A] font-semibold"
                    : "text-[#57534A] hover:bg-[#E9E1CF]/40"
                }`}
              >
                <span>#{tag}</span>
                <span className="text-[10px] text-[#8C867A]">
                  {tasks.filter((t) => t.tags?.includes(tag)).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-[#8C867A] tracking-wider uppercase mb-2 font-semibold">Priority Levels</div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#C9662A] bg-[#C9662A]/10 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5" /> P5 (Urgent / Core)
            </div>
            <div className="flex items-center gap-2 text-[#5A684B] bg-[#5A684B]/10 px-2.5 py-1 rounded-lg">
              <Circle className="w-2.5 h-2.5 fill-current" /> P4 (High)
            </div>
            <div className="flex items-center gap-2 text-[#3D6B78] bg-[#3D6B78]/10 px-2.5 py-1 rounded-lg">
              <Circle className="w-2.5 h-2.5 fill-current" /> P3 (Normal)
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[#E2D9C6] pt-3 mt-6 space-y-2 text-[11px] font-mono text-[#8C867A]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> Shortcuts
          </span>
          <span className="text-[10px] bg-[#E9E1CF] px-1.5 py-0.5 rounded text-[#57534A]">⌘K</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span>sisy v1.0</span>
          <span className="text-[#5A684B]">Cloud Synced</span>
        </div>
      </div>
    </aside>
  );
}
