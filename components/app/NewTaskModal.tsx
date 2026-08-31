"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Task } from "@/lib/types";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  newTaskPriority: number;
  setNewTaskPriority: (p: number) => void;
  newTaskEstimate: number | string;
  setNewTaskEstimate: (est: string) => void;
  newTaskDeadline: string;
  setNewTaskDeadline: (dl: string) => void;
  newTaskDependsOn: number[];
  setNewTaskDependsOn: (deps: number[]) => void;
  newTaskTags: string;
  setNewTaskTags: (tags: string) => void;
  tasks: Task[];
}

export default function NewTaskModal({
  isOpen,
  onClose,
  onSubmit,
  newTaskName,
  setNewTaskName,
  newTaskPriority,
  setNewTaskPriority,
  newTaskEstimate,
  setNewTaskEstimate,
  newTaskDeadline,
  setNewTaskDeadline,
  newTaskDependsOn,
  setNewTaskDependsOn,
  newTaskTags,
  setNewTaskTags,
  tasks,
}: NewTaskModalProps) {
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
          className="fixed inset-0 bg-[#211F1A]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <motion.form
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            onSubmit={onSubmit}
            className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-[#E2D9C6] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#211F1A] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C9662A]" />
                Create New Task
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-[#8C867A] hover:text-[#211F1A] p-1.5 rounded-lg hover:bg-[#E9E1CF] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-[#8C867A] text-[10px] uppercase mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design quarterly product roadmap..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full bg-[#EFE8D8]/60 border border-[#E2D9C6] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#C9662A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[#8C867A] text-[10px] uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                    className="w-full bg-[#EFE8D8]/60 border border-[#E2D9C6] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value={5}>P5 (Urgent/Core)</option>
                    <option value={4}>P4 (High)</option>
                    <option value={3}>P3 (Normal)</option>
                    <option value={2}>P2 (Low)</option>
                    <option value={1}>P1 (Optional)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[#8C867A] text-[10px] uppercase mb-1">
                    Est. Duration (Hours)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="2.5"
                    value={newTaskEstimate}
                    onChange={(e) => {
                      const val = e.target.value.replace(",", ".");
                      setNewTaskEstimate(val);
                    }}
                    className="w-full bg-[#EFE8D8]/60 border border-[#E2D9C6] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[#8C867A] text-[10px] uppercase mb-1">
                    Deadline / Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full bg-[#EFE8D8]/60 border border-[#E2D9C6] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[#8C867A] text-[10px] uppercase mb-1">
                    Depends On Task
                  </label>
                  <select
                    value={newTaskDependsOn[0] || ""}
                    onChange={(e) => {
                      const val = e.target.value ? [Number(e.target.value)] : [];
                      setNewTaskDependsOn(val);
                    }}
                    className="w-full bg-[#EFE8D8]/60 border border-[#E2D9C6] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="">None (Independent)</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        SY-{t.id}: {t.name.slice(0, 20)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[#8C867A] text-[10px] uppercase mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="work, frontend, design"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                  className="w-full bg-[#EFE8D8]/60 border border-[#E2D9C6] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57534A] hover:bg-[#E9E1CF] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="s-pill text-xs py-2 px-5 shadow-sm"
              >
                Create Task
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
