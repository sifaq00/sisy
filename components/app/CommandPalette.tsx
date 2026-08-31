"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, Zap, BarChart3, Clock, History } from "lucide-react";
import { Task } from "@/lib/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredTasks: Task[];
  setSelectedTaskId: (id: number) => void;
  handleTabChange: (tab: "tasks" | "gantt" | "time") => void;
  onOpenAddModal: () => void;
  triggerOptimize: () => void;
  onOpenAudit: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredTasks,
  setSelectedTaskId,
  handleTabChange,
  onOpenAddModal,
  triggerOptimize,
  onOpenAudit,
}: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 bg-[#211F1A]/50 backdrop-blur-xs z-50 flex items-start justify-center pt-24 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-3.5 border-b border-[#E2D9C6] flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#8C867A]" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search tasks…"
                className="w-full bg-transparent border-none text-sm focus:outline-none text-[#211F1A]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[#E9E1CF] text-[#8C867A] hover:text-[#211F1A] transition"
                title="Close Search (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 max-h-80 overflow-y-auto space-y-1">
              <div className="text-[10px] font-mono text-[#8C867A] px-3 py-1 uppercase">
                Commands (from Mockup)
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#E9E1CF] flex items-center justify-between transition group"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#C9662A]" />
                  Add task
                </span>
                <kbd className="text-[10px] font-mono bg-[#E9E1CF] px-2 py-0.5 rounded border border-[#E2D9C6]">
                  A
                </kbd>
              </button>

              <button
                onClick={() => {
                  onClose();
                  triggerOptimize();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#E9E1CF] flex items-center justify-between transition group"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#C9662A]" />
                  Optimize schedule
                </span>
                <kbd className="text-[10px] font-mono bg-[#E9E1CF] px-2 py-0.5 rounded border border-[#E2D9C6]">
                  O
                </kbd>
              </button>

              <button
                onClick={() => {
                  handleTabChange("gantt");
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#E9E1CF] flex items-center justify-between transition group"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-[#3D6B78]" />
                  Open gantt view
                </span>
                <kbd className="text-[10px] font-mono bg-[#E9E1CF] px-2 py-0.5 rounded border border-[#E2D9C6]">
                  G
                </kbd>
              </button>

              <button
                onClick={() => {
                  handleTabChange("time");
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#E9E1CF] flex items-center justify-between transition group"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#5A684B]" />
                  Start timer on active task
                </span>
                <kbd className="text-[10px] font-mono bg-[#E9E1CF] px-2 py-0.5 rounded border border-[#E2D9C6]">
                  T
                </kbd>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAudit();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#E9E1CF] flex items-center justify-between transition group"
              >
                <span className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-[#6E685C]" />
                  Show audit log
                </span>
                <kbd className="text-[10px] font-mono bg-[#E9E1CF] px-2 py-0.5 rounded border border-[#E2D9C6]">
                  L
                </kbd>
              </button>

              <div className="text-[10px] font-mono text-[#8C867A] px-3 py-1 uppercase mt-2">
                Matching Tasks ({filteredTasks.length})
              </div>
              {filteredTasks.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#E9E1CF] flex items-center justify-between transition group"
                >
                  <span className="truncate font-medium">{task.name}</span>
                  <span className="text-[10px] font-mono text-[#C9662A] ml-2 shrink-0">
                    SY-{String(task.id).padStart(4, "0")}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-[#EFE8D8]/50 px-4 py-2 border-t border-[#E2D9C6] text-[10px] font-mono text-[#8C867A] flex justify-between items-center">
              <span>sisy 1.0.0 · connected</span>
              <span className="text-[#5A684B]">api-key ok</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
