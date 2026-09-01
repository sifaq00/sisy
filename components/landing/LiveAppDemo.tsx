"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Zap,
  BarChart3,
  Clock,
  Play,
  Square,
  Check,
  Plus,
  Sparkles,
  Link2,
  ArrowRight,
  RotateCw,
  FolderOpen,
} from "lucide-react";
import { Reveal } from "./Reveal";

interface DemoTask {
  id: number;
  name: string;
  priority: number;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  estimated_duration: number;
  actual_duration_hours: number;
  depends_on?: number[];
  tags: string[];
}

const INITIAL_DEMO_TASKS: DemoTask[] = [
  {
    id: 1,
    name: "Draft Q4 Product Roadmap & Feature Specs",
    priority: 5,
    status: "IN_PROGRESS",
    estimated_duration: 2.5,
    actual_duration_hours: 1.2,
    tags: ["core", "strategy"],
  },
  {
    id: 2,
    name: "Implement Solana Web3 Wallet Authentication",
    priority: 5,
    status: "TODO",
    estimated_duration: 3.0,
    actual_duration_hours: 0,
    depends_on: [1],
    tags: ["solana", "auth"],
  },
  {
    id: 3,
    name: "Build DAG Topological Schedule Engine",
    priority: 4,
    status: "TODO",
    estimated_duration: 1.5,
    actual_duration_hours: 0,
    depends_on: [2],
    tags: ["optimizer", "algo"],
  },
  {
    id: 4,
    name: "Design Warm Editorial Theme & Design Tokens",
    priority: 3,
    status: "COMPLETED",
    estimated_duration: 1.0,
    actual_duration_hours: 0.9,
    tags: ["ui", "design"],
  },
  {
    id: 5,
    name: "Optimize Supabase Realtime WebSocket Subscriptions",
    priority: 4,
    status: "TODO",
    estimated_duration: 2.0,
    actual_duration_hours: 0,
    tags: ["realtime", "cloud"],
  },
];

const ALGORITHMS = [
  { id: "greedy", label: "Greedy Priority", desc: "Urgency & In-Progress first" },
  { id: "dag", label: "DAG Critical Path", desc: "Prerequisites before dependents" },
  { id: "edf", label: "Earliest Deadline", desc: "Closest due dates first" },
  { id: "sjf", label: "Shortest Job First", desc: "Quick wins executed first" },
  { id: "balanced", label: "Balanced Workload", desc: "Alternates heavy & light tasks" },
];

export default function LiveAppDemo() {
  const [activeTab, setActiveTab] = useState<"tasks" | "optimizer" | "gantt" | "time">("tasks");
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_DEMO_TASKS);
  const [selectedAlgo, setSelectedAlgo] = useState("greedy");
  const [activeTimerId, setActiveTimerId] = useState<number | null>(1);
  const [timerSeconds, setTimerSeconds] = useState(4320); // 1h 12m
  const [newTaskInput, setNewTaskInput] = useState("");

  // Live stopwatch tick
  useEffect(() => {
    if (!activeTimerId) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerId]);

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const toggleTaskDone = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "COMPLETED" ? "TODO" : "COMPLETED" }
          : t
      )
    );
  };

  const handleAddDemoTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: DemoTask = {
      id: tasks.length + 1,
      name: newTaskInput.trim(),
      priority: 4,
      status: "TODO",
      estimated_duration: 1.5,
      actual_duration_hours: 0,
      tags: ["demo"],
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskInput("");
  };

  // Re-sort tasks based on selected demo algorithm
  const sortedTasks = [...tasks].sort((a, b) => {
    if (selectedAlgo === "dag") {
      // Prioritize dependencies
      const aIsDep = a.depends_on && a.depends_on.length > 0;
      const bIsDep = b.depends_on && b.depends_on.length > 0;
      if (!aIsDep && bIsDep) return -1;
      if (aIsDep && !bIsDep) return 1;
      return b.priority - a.priority;
    }
    if (selectedAlgo === "sjf") {
      return a.estimated_duration - b.estimated_duration;
    }
    if (selectedAlgo === "balanced") {
      return (a.id % 2) - (b.id % 2);
    }
    // Greedy
    if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1;
    if (b.status === "IN_PROGRESS" && a.status !== "IN_PROGRESS") return 1;
    return b.priority - a.priority;
  });

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <section className="s-proof s-container py-16" id="demo">
      <Reveal>
        <div className="s-eyebrow text-center mb-2">LIVE APP DEMO</div>
        <h2 className="s-h2 text-center mb-3">Interactive Workspace Preview</h2>
        <p className="text-center text-xs md:text-sm text-[#57534A] max-w-xl mx-auto mb-10 leading-relaxed font-sans">
          Test task interactions, reorder with 5 schedule optimization algorithms, and start the live stopwatch below.
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div className="bg-[#FFFDF7] border border-[#E2D9C6] rounded-3xl shadow-2xl overflow-hidden font-sans max-w-4xl mx-auto">
          {/* Top Browser Frame */}
          <div className="bg-[#EFE8D8]/70 border-b border-[#E2D9C6] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 items-center">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              </div>
              <span className="text-[11px] font-mono text-[#8C867A] ml-2 hidden sm:inline">
                https://sisy.app/workspace/demo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#5A684B] bg-[#5A684B]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5A684B] animate-pulse" />
                <span>Demo Wallet: 8vB7...8aZ</span>
              </span>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="border-b border-[#E2D9C6] bg-[#F5F0E4]/50 px-4 pt-2.5 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1.5">
              {[
                { id: "tasks", label: "Tasks Table", icon: ListTodo },
                { id: "optimizer", label: "Optimizer (5 Algos)", icon: Zap },
                { id: "gantt", label: "Gantt Timeline", icon: BarChart3 },
                { id: "time", label: "Stopwatch & Heatmap", icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#FFFDF7] text-[#211F1A] border-t border-x border-[#E2D9C6] shadow-xs"
                        : "text-[#57534A] hover:text-[#211F1A]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#C9662A]" : "text-[#8C867A]"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] font-mono text-[#8C867A] hidden md:block">
              <span>{completedCount}/{tasks.length} Completed</span>
            </div>
          </div>

          {/* Tab 1: Tasks Table */}
          {activeTab === "tasks" && (
            <div className="p-5 space-y-4">
              {/* Quick Add Demo Input */}
              <form onSubmit={handleAddDemoTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a new task and press Enter to test addition…"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  className="flex-1 bg-[#EFE8D8]/50 border border-[#E2D9C6] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#C9662A]"
                />
                <button
                  type="submit"
                  className="bg-[#211F1A] text-[#F5F0E4] hover:bg-[#C9662A] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </form>

              {/* Tasks List */}
              <div className="border border-[#E2D9C6] rounded-2xl overflow-hidden divide-y divide-[#E2D9C6]/60">
                <AnimatePresence>
                  {tasks.map((task) => {
                    const isDone = task.status === "COMPLETED";
                    const isTimerRunning = activeTimerId === task.id;

                    return (
                      <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 px-4 flex items-center justify-between gap-3 text-xs transition-colors ${
                          isDone ? "bg-[#EFE8D8]/30 opacity-70" : "hover:bg-[#EFE8D8]/40"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => toggleTaskDone(task.id)}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isDone
                                ? "bg-[#5A684B] border-[#5A684B] text-white"
                                : "border-[#E2D9C6] hover:border-[#5A684B]"
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <span className="font-mono text-[10px] font-bold text-[#8C867A] shrink-0">
                            P{task.priority}
                          </span>

                          <span className="font-mono text-[10px] text-[#8C867A] shrink-0">
                            SY-{String(task.id).padStart(4, "0")}
                          </span>

                          <span
                            className={`font-medium text-[#211F1A] truncate cursor-pointer ${
                              isDone ? "line-through text-[#8C867A]" : ""
                            }`}
                            onClick={() => toggleTaskDone(task.id)}
                          >
                            {task.name}
                          </span>

                          {task.depends_on && task.depends_on.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#3D6B78]/10 text-[#3D6B78] shrink-0">
                              <Link2 className="w-2.5 h-2.5" />
                              Prereq: SY-{String(task.depends_on[0]).padStart(4, "0")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                          <span className="text-[#8C867A]">{task.estimated_duration}h</span>

                          {/* Timer Button */}
                          <button
                            onClick={() => setActiveTimerId(isTimerRunning ? null : task.id)}
                            className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                              isTimerRunning
                                ? "bg-[#C9662A] text-white font-bold animate-pulse"
                                : "bg-[#EFE8D8] text-[#57534A] hover:bg-[#E9E1CF]"
                            }`}
                          >
                            {isTimerRunning ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-current" />
                                <span>{formatTimer(timerSeconds)}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-2.5 h-2.5 fill-current text-[#C9662A]" />
                                <span>Start</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Tab 2: 5 Optimizer Algorithms */}
          {activeTab === "optimizer" && (
            <div className="p-5 space-y-5">
              <div>
                <div className="text-[10px] font-mono text-[#8C867A] uppercase mb-2 font-semibold">
                  Select Scheduling Algorithm:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ALGORITHMS.map((algo) => {
                    const isSel = selectedAlgo === algo.id;
                    return (
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgo(algo.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#211F1A] text-white border-[#211F1A] shadow-xs"
                            : "bg-[#EFE8D8]/50 border-[#E2D9C6] text-[#57534A] hover:bg-[#E9E1CF]"
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{algo.label}</div>
                        <div className={`text-[9.5px] mt-0.5 ${isSel ? "text-zinc-300" : "text-[#8C867A]"}`}>
                          {algo.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optimized Order Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C867A]">
                  <span>Computed Schedule Order (Auto-Recalculated)</span>
                  <span className="text-[#5A684B] font-bold">0ms instant preview</span>
                </div>
                <div className="space-y-1.5 border border-[#E2D9C6] p-3 rounded-2xl bg-[#F5F0E4]/30">
                  <AnimatePresence>
                    {sortedTasks.map((t, idx) => (
                      <motion.div
                        layout
                        key={t.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="flex items-center justify-between bg-white border border-[#E2D9C6] p-2 px-3 rounded-xl text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-[#EFE8D8] text-[#C9662A] font-bold flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-[#211F1A]">SY-{String(t.id).padStart(4, "0")}</span>
                          <span className="text-[#57534A] truncate font-sans font-medium">{t.name}</span>
                        </div>
                        <span className="text-[10px] bg-[#EFE8D8] px-2 py-0.5 rounded text-[#8C867A] shrink-0 font-mono">
                          {t.estimated_duration}h
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Gantt Timeline */}
          {activeTab === "gantt" && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[#8C867A] border-b border-[#E2D9C6] pb-2">
                {["Mon (D1)", "Tue (D2)", "Wed (D3)", "Thu (D4)", "Fri (D5)", "Sat (D6)", "Sun (D7)"].map((d) => (
                  <div key={d} className="bg-[#EFE8D8]/40 py-1 rounded">
                    {d}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {tasks.slice(0, 4).map((task, i) => {
                  const colors = ["#C9662A", "#5A684B", "#3D6B78", "#A3485E"];
                  const leftOffsets = [5, 25, 45, 10];
                  const widths = [35, 30, 40, 25];

                  return (
                    <div key={task.id} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#57534A]">
                        <span className="font-semibold truncate max-w-[320px]">{task.name}</span>
                        <span>{task.estimated_duration}h</span>
                      </div>
                      <div className="bg-[#EFE8D8]/50 h-7 rounded-xl relative overflow-hidden p-0.5 border border-[#E2D9C6]/60">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widths[i]}%` }}
                          style={{
                            left: `${leftOffsets[i]}%`,
                            backgroundColor: colors[i],
                          }}
                          className="absolute top-1 bottom-1 rounded-lg text-white text-[10px] flex items-center px-2.5 shadow-xs truncate whitespace-nowrap font-medium"
                        >
                          {task.name}
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Stopwatch & Heatmap */}
          {activeTab === "time" && (
            <div className="p-5 space-y-4">
              <div className="bg-[#211F1A] text-[#F5F0E4] p-5 rounded-2xl flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#C9662A] font-bold">
                    Active Working Session
                  </div>
                  <div className="text-sm font-semibold mt-0.5">
                    Draft Q4 Product Roadmap & Feature Specs
                  </div>
                </div>
                <div className="font-mono text-2xl font-bold text-[#F5F0E4] tracking-wider">
                  {formatTimer(timerSeconds)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono text-[#8C867A] uppercase font-semibold">
                  Estimate Accuracy (Planned vs Actual):
                </div>
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="bg-[#EFE8D8]/40 p-3 rounded-xl border border-[#E2D9C6]/60 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-[#211F1A]">{task.name}</span>
                      <span className="text-[#5A684B]">
                        {task.actual_duration_hours}h / {task.estimated_duration}h
                      </span>
                    </div>
                    <div className="h-2 bg-[#E9E1CF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5A684B] rounded-full"
                        style={{ width: `${Math.min((task.actual_duration_hours / task.estimated_duration) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Callout Frame */}
          <div className="bg-[#EFE8D8]/60 border-t border-[#E2D9C6] p-4 px-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#57534A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9662A]" />
              <span>Ready to optimize your actual project workload?</span>
            </div>
            <Link href="/app">
              <button className="s-pill text-xs py-2 px-4 shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-1.5">
                <span>Launch App with Solana Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
