"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Play, Square, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Task, TaskStatus } from "@/lib/types";

interface TaskDetailDrawerProps {
  selectedTask: Task | null;
  tasks: Task[];
  onClose: () => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<Task>;
  handleToggleDone: (task: Task) => void;
  handleStartTimer: (task: Task) => void;
  handleDeleteTask: (id: number) => void;
  activeTimerTaskId: number | null;
}

export default function TaskDetailDrawer({
  selectedTask,
  tasks,
  onClose,
  setTasks,
  updateTask,
  handleToggleDone,
  handleStartTimer,
  handleDeleteTask,
  activeTimerTaskId,
}: TaskDetailDrawerProps) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced auto-sync to backend/cache
  const triggerAutoSave = (taskId: number, updates: Partial<Task>) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      updateTask(taskId, updates);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {selectedTask && (
        <motion.aside
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-88 border border-[#E2D9C6] bg-[#FFFDF7] rounded-2xl p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-xl"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2D9C6] pb-3">
              <span className="text-[10px] font-mono text-[#8C867A] uppercase font-bold tracking-wider">
                SY-{String(selectedTask.id).padStart(4, "0")} Detail
              </span>
              <button
                onClick={onClose}
                className="text-[#8C867A] hover:text-[#211F1A] p-1.5 rounded-lg hover:bg-[#E9E1CF] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#8C867A] uppercase block mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={selectedTask.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setTasks((prev) =>
                    prev.map((t) => (t.id === selectedTask.id ? { ...t, name: val } : t))
                  );
                  triggerAutoSave(selectedTask.id, { name: val });
                }}
                onBlur={() => updateTask(selectedTask.id, { name: selectedTask.name })}
                className="font-serif font-bold text-lg text-[#211F1A] w-full bg-transparent border-b border-transparent focus:border-[#C9662A] focus:outline-none pb-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#8C867A] font-mono text-[10px] uppercase block mb-1">
                  Status
                </span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => {
                    const next = e.target.value as TaskStatus;
                    updateTask(selectedTask.id, { status: next });
                    setTasks((prev) =>
                      prev.map((t) => (t.id === selectedTask.id ? { ...t, status: next } : t))
                    );
                  }}
                  className="font-mono bg-[#E9E1CF] px-3 py-1.5 rounded-xl text-xs w-full focus:outline-none"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
              </div>

              <div>
                <span className="text-[#8C867A] font-mono text-[10px] uppercase block mb-1">
                  Priority
                </span>
                <select
                  value={selectedTask.priority}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    updateTask(selectedTask.id, { priority: p });
                    setTasks((prev) =>
                      prev.map((t) => (t.id === selectedTask.id ? { ...t, priority: p } : t))
                    );
                  }}
                  className="font-mono bg-[#E9E1CF] px-3 py-1.5 rounded-xl text-xs w-full focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      Priority {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[#8C867A] font-mono text-[10px] uppercase block mb-1">
                  Planned (Hours)
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="2.5"
                  value={selectedTask.estimated_duration ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(",", ".");
                    const num = parseFloat(raw);
                    const est = isNaN(num) ? 0 : num;
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === selectedTask.id ? { ...t, estimated_duration: est } : t
                      )
                    );
                    triggerAutoSave(selectedTask.id, { estimated_duration: est });
                  }}
                  onBlur={() =>
                    updateTask(selectedTask.id, {
                      estimated_duration: Number(selectedTask.estimated_duration) || 1,
                    })
                  }
                  className="w-full font-mono bg-[#E9E1CF] px-3 py-1.5 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[#8C867A] font-mono text-[10px] uppercase block mb-1">
                  Deadline / Due
                </span>
                <input
                  type="date"
                  value={selectedTask.deadline ? selectedTask.deadline.split("T")[0] : ""}
                  onChange={(e) => {
                    const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                    setTasks((prev) =>
                      prev.map((t) => (t.id === selectedTask.id ? { ...t, deadline: val } : t))
                    );
                    updateTask(selectedTask.id, { deadline: val });
                  }}
                  className="w-full font-mono bg-[#E9E1CF] px-2 py-1.5 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Depends On Task (Prerequisite) Selector with Cycle Prevention */}
            <div className="border-t border-[#E2D9C6] pt-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#8C867A] uppercase block">
                  Depends On Task (Prerequisite)
                </span>
                {selectedTask.depends_on && selectedTask.depends_on.length > 0 && (
                  <span className="text-[9px] font-mono text-[#5A684B]">DAG Linked</span>
                )}
              </div>
              <select
                value={selectedTask.depends_on?.[0] || ""}
                onChange={(e) => {
                  const targetDepId = e.target.value ? Number(e.target.value) : null;
                  if (!targetDepId) {
                    setTasks((prev) =>
                      prev.map((t) => (t.id === selectedTask.id ? { ...t, depends_on: [] } : t))
                    );
                    updateTask(selectedTask.id, { depends_on: [] });
                    return;
                  }

                  // Circular Dependency Check: Does targetDepId already depend on selectedTask.id?
                  const checkCausesCycle = (startId: number, lookForId: number): boolean => {
                    const visited = new Set<number>();
                    const queue = [startId];
                    while (queue.length > 0) {
                      const curr = queue.shift()!;
                      if (curr === lookForId) return true;
                      if (!visited.has(curr)) {
                        visited.add(curr);
                        const tObj = tasks.find((t) => t.id === curr);
                        if (tObj && tObj.depends_on) {
                          queue.push(...tObj.depends_on);
                        }
                      }
                    }
                    return false;
                  };

                  if (checkCausesCycle(targetDepId, selectedTask.id)) {
                    alert(
                      `⚠️ Circular Dependency Prevented:\n\nTask SY-${String(targetDepId).padStart(4, "0")} already depends on this task (directly or indirectly). Choosing this would create an infinite scheduling loop.`
                    );
                    return;
                  }

                  const val = [targetDepId];
                  setTasks((prev) =>
                    prev.map((t) => (t.id === selectedTask.id ? { ...t, depends_on: val } : t))
                  );
                  updateTask(selectedTask.id, { depends_on: val });
                }}
                className="w-full font-mono bg-[#E9E1CF] px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
              >
                <option value="">None (Independent Task)</option>
                {tasks
                  .filter((t) => t.id !== selectedTask.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      SY-{String(t.id).padStart(4, "0")}: {t.name.slice(0, 32)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Markdown Notes */}
            <div className="space-y-2 border-t border-[#E2D9C6] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8C867A] uppercase flex items-center gap-1.5 font-bold">
                  <FileText className="w-3.5 h-3.5 text-[#C9662A]" />
                  Markdown Notes
                </span>
                <span className="text-[9px] font-mono text-[#5A684B]">Live auto-saved</span>
              </div>

              <textarea
                rows={6}
                value={selectedTask.notes || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setTasks((prev) =>
                    prev.map((t) => (t.id === selectedTask.id ? { ...t, notes: val } : t))
                  );
                  triggerAutoSave(selectedTask.id, { notes: val });
                }}
                onBlur={() => updateTask(selectedTask.id, { notes: selectedTask.notes })}
                placeholder="Write markdown notes here..."
                className="w-full font-mono text-xs bg-[#EFE8D8]/50 border border-[#E2D9C6] rounded-xl p-3 focus:outline-none focus:border-[#C9662A]"
              />

              <div className="bg-[#EFE8D8]/30 p-3.5 rounded-xl border border-[#E2D9C6] text-xs prose prose-sm max-w-none text-[#57534A]">
                <div className="text-[9px] font-mono text-[#8C867A] uppercase mb-1">Preview:</div>
                <ReactMarkdown>{selectedTask.notes || "*No notes recorded yet.*"}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => handleStartTimer(selectedTask)}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs ${
                activeTimerTaskId === selectedTask.id
                  ? "bg-[#C9662A] text-white ring-2 ring-[#C9662A]/30 animate-pulse"
                  : "bg-[#211F1A] text-[#F5F0E4] hover:bg-[#C9662A]"
              }`}
            >
              {activeTimerTaskId === selectedTask.id ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop active timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  <span>Start live stopwatch timer</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleToggleDone(selectedTask)}
              className="w-full py-2 text-xs font-medium rounded-xl transition border border-[#E2D9C6] hover:bg-[#E9E1CF] flex items-center justify-center gap-1.5 text-[#57534A]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{selectedTask.status === "COMPLETED" ? "Reopen task" : "Mark as completed"}</span>
            </button>

            <button
              onClick={() => handleDeleteTask(selectedTask.id)}
              className="w-full py-1.5 text-xs text-[#8C867A] hover:text-[#B83A2E] hover:bg-[#B83A2E]/10 rounded-xl transition"
            >
              Delete task
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
