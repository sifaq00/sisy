"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Search,
  RotateCw,
  FolderOpen,
  Check,
  Circle,
  Play,
  Square,
  Trash2,
  Link2,
  Pencil,
} from "lucide-react";
import { Task } from "@/lib/types";

interface TaskTableProps {
  loading: boolean;
  filteredTasks: Task[];
  selectedTaskId: number | null;
  setSelectedTaskId: (id: number | null) => void;
  handleToggleDone: (task: Task) => void;
  handleStartTimer: (task: Task) => void;
  handleDeleteTask: (id: number) => void;
  activeTimerTaskId: number | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddModal: () => void;
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

export default function TaskTable({
  loading,
  filteredTasks,
  selectedTaskId,
  setSelectedTaskId,
  handleToggleDone,
  handleStartTimer,
  handleDeleteTask,
  activeTimerTaskId,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
}: TaskTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[#57534A] flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-[#C9662A]" />
          <span>Tasks ({filteredTasks.length})</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C867A]" />
          <input
            type="text"
            placeholder="Filter tasks… /"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-[#FFFDF7] border border-[#E2D9C6] rounded-xl pl-8 pr-3 py-1.5 w-64 focus:outline-none focus:border-[#C9662A] shadow-2xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs font-mono text-[#8C867A] flex items-center justify-center gap-2 bg-[#FFFDF7] rounded-2xl border border-[#E2D9C6]">
          <RotateCw className="w-4 h-4 animate-spin text-[#C9662A]" />
          Loading workspace tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDF7] rounded-2xl border border-dashed border-[#E2D9C6] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E9E1CF]/60 flex items-center justify-center mx-auto text-[#8C867A]">
            <FolderOpen className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-serif text-[#211F1A]">Workspace is clean</h3>
            <p className="text-xs font-mono text-[#8C867A] mt-0.5">
              No tasks found. Create your first task to start scheduling!
            </p>
          </div>
          <div>
            <button
              onClick={onOpenAddModal}
              className="s-pill text-xs py-2 px-4 shadow-xs hover:shadow-md inline-flex items-center gap-1.5"
            >
              <span>+ Create new task</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[780px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2D9C6] bg-[#F5F0E4]/60 font-mono text-[10px] text-[#8C867A] uppercase tracking-wider">
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-2 w-16">PRI</th>
                  <th className="py-3 px-2 w-24">ID</th>
                  <th className="py-3 px-3">TASK</th>
                  <th className="py-3 px-2 w-28">STATUS</th>
                  <th className="py-3 px-2 w-24">PLANNED</th>
                  <th className="py-3 px-2 w-24">ACTUAL</th>
                  <th className="py-3 px-2 w-28">DUE</th>
                  <th className="py-3 px-4 w-16 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9C6]/60">
                <AnimatePresence>
                  {filteredTasks.map((task) => {
                    const isDone = task.status === "COMPLETED";
                    const isSelected = task.id === selectedTaskId;
                    const isOver =
                      (task.actual_duration_hours || 0) > (task.estimated_duration || 0) &&
                      (task.estimated_duration || 0) > 0;
                    const deadlineDate = task.deadline
                      ? new Date(task.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`cursor-pointer transition-colors group ${
                          isSelected ? "bg-[#E9E1CF]/70" : "hover:bg-[#E9E1CF]/30"
                        }`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleDone(task)}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              isDone
                                ? "bg-[#5A684B] border-[#5A684B] text-white"
                                : "border-[#E2D9C6] hover:border-[#5A684B]"
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        </td>

                        <td className="py-3 px-2 font-mono">
                          <span
                            className={`text-xs font-bold ${
                              task.priority >= 5
                                ? "text-[#C9662A]"
                                : task.priority === 4
                                ? "text-[#5A684B]"
                                : "text-[#8C867A]"
                            }`}
                          >
                            {String(task.priority || 3).padStart(2, "0")}
                          </span>
                        </td>

                        <td className="py-3 px-2 font-mono text-[#8C867A] text-[11px]">
                          SY-{String(task.id).padStart(4, "0")}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-[#211F1A] flex items-center gap-2">
                            <span className={isDone ? "line-through text-[#8C867A]" : ""}>
                              {task.name}
                            </span>
                            {task.depends_on && task.depends_on.length > 0 && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#3D6B78]/10 text-[#3D6B78] font-mono text-[10px] font-medium shrink-0 border border-[#3D6B78]/20"
                                title={`Blocked by prerequisite task SY-${task.depends_on.map((d) => String(d).padStart(4, "0")).join(", SY-")}`}
                              >
                                <Link2 className="w-2.5 h-2.5 shrink-0" />
                                <span>{task.depends_on.length}</span>
                              </span>
                            )}
                            {task.tags &&
                              task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E9E1CF] text-[#57534A]"
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        </td>

                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                              task.status === "IN_PROGRESS"
                                ? "bg-[#C9662A]/15 text-[#C9662A]"
                                : task.status === "COMPLETED"
                                ? "bg-[#5A684B]/15 text-[#5A684B]"
                                : "bg-[#8C867A]/15 text-[#57534A]"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {task.status}
                          </span>
                        </td>

                        <td className="py-3 px-2 font-mono text-[#57534A]">
                          {formatDuration(task.estimated_duration)}
                        </td>

                        <td className="py-3 px-2 font-mono">
                          <span className={isOver ? "text-[#B83A2E] font-bold" : "text-[#57534A]"}>
                            {formatDuration(task.actual_duration_hours)}
                          </span>
                        </td>

                        <td className="py-3 px-2 font-mono text-[#8C867A] text-[11px]">
                          {deadlineDate}
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartTimer(task)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-2xs ${
                                activeTimerTaskId === task.id
                                  ? "bg-[#C9662A] text-white shadow-md ring-2 ring-[#C9662A]/30 animate-pulse"
                                  : "bg-[#EFE8D8]/70 border border-[#E2D9C6] text-[#57534A] hover:bg-[#C9662A] hover:text-white hover:border-[#C9662A]"
                              }`}
                              title={activeTimerTaskId === task.id ? "Stop active timer" : "Start timer on this task"}
                            >
                              {activeTimerTaskId === task.id ? (
                                <Square className="w-2.5 h-2.5 fill-current rounded-xs" />
                              ) : (
                                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setSelectedTaskId(task.id)}
                              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                                selectedTaskId === task.id
                                  ? "bg-[#211F1A] text-white border-[#211F1A]"
                                  : "bg-[#FFFDF7] border-[#E2D9C6] text-[#57534A] hover:bg-[#E9E1CF] hover:text-[#211F1A]"
                              }`}
                              title="Edit task & notes"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="w-7 h-7 rounded-full border border-transparent flex items-center justify-center text-[#8C867A] hover:text-[#B83A2E] hover:bg-[#B83A2E]/10 hover:border-[#B83A2E]/20 transition-all"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
