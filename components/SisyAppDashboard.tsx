"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Sparkles } from "lucide-react";

import AppHeader from "./app/AppHeader";
import MetricCards from "./app/MetricCards";
import Sidebar from "./app/Sidebar";
import ScheduleStrip from "./app/ScheduleStrip";
import TaskTable from "./app/TaskTable";
import GanttView from "./app/GanttView";
import TimeTrackerView from "./app/TimeTrackerView";
import TaskDetailDrawer from "./app/TaskDetailDrawer";
import NewTaskModal from "./app/NewTaskModal";
import CommandPalette from "./app/CommandPalette";
import AuditLogModal, { AuditItem } from "./app/AuditLogModal";

import {
  supabase,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  getLocalCachedTasks,
  saveLocalCachedTasks,
  getOrCreateUserId,
} from "@/lib/supabase";
import { Task, TaskStatus } from "@/lib/types";
import { optimizeSchedule } from "@/lib/scheduler";

interface SisyAppDashboardProps {
  initialTab?: "tasks" | "gantt" | "time";
}

export default function SisyAppDashboard({ initialTab = "tasks" }: SisyAppDashboardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(true);
  const [tab, setTab] = useState<"tasks" | "gantt" | "time">(initialTab);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [algo, setAlgo] = useState("greedy");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([
    { id: "1", time: "12:41", message: "SY-0001 status → done", color: "#5A684B" },
    { id: "2", time: "12:38", message: "timer stopped · 1h 52m", color: "#6E685C" },
    { id: "3", time: "11:02", message: "priority 8 → 10", color: "#C9662A" },
    { id: "4", time: "09:14", message: "SY-0004 created", color: "#6E685C" },
  ]);

  const addAuditLog = (message: string, color = "#6E685C") => {
    const d = new Date();
    const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setAuditLogs((prev) => [{ id: String(Date.now()), time: timeStr, message, color }, ...prev]);
  };

  // Broadcast channel for instantaneous cross-tab synchronization
  const broadcastSync = (type: string, payload: unknown) => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const bc = new BroadcastChannel("sisy_workspace_realtime");
      bc.postMessage({ type, payload });
      bc.close();
    } catch {
      // Ignored if unsupported
    }
  };

  // New task form state
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(3);
  const [newTaskEstimate, setNewTaskEstimate] = useState("2.0");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskDependsOn, setNewTaskDependsOn] = useState<number[]>([]);
  const [newTaskTags, setNewTaskTags] = useState("work");

  // Timer state for in-progress tasks
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (nextTab: "tasks" | "gantt" | "time") => {
    setTab(nextTab);
    if (typeof window !== "undefined") {
      const targetPath = nextTab === "tasks" ? "/app" : `/app/${nextTab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
    }
  };

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load from local storage immediately, then reconcile with Supabase
  const loadTasks = async () => {
    const cached = getLocalCachedTasks();
    if (cached.length > 0) {
      setTasks(cached);
      setLoading(false);
    }

    try {
      const data = await fetchTasks();
      if (data.length > 0) {
        setTasks(data);
        saveLocalCachedTasks(data);
      }
      setConnected(true);
    } catch (err) {
      console.warn("Using local cache mode:", err);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    // Cross-tab Broadcast Channel listener
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("sisy_workspace_realtime");
      bc.onmessage = (event) => {
        if (event.data?.type === "TASKS_UPDATED") {
          const fresh = getLocalCachedTasks();
          if (fresh.length > 0) setTasks(fresh);
        }
      };
    }

    // Realtime Supabase Subscription
    const userId = getOrCreateUserId();
    const channel = supabase
      .channel(`realtime-tasks-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => {
              const updated = [payload.new as Task, ...prev.filter((t) => t.id !== (payload.new as Task).id)];
              saveLocalCachedTasks(updated);
              return updated;
            });
            addAuditLog(`SY-${String((payload.new as Task).id).padStart(4, "0")} created`, "#C9662A");
          } else if (payload.eventType === "UPDATE") {
            const updatedTask = payload.new as Task;
            setTasks((prev) => {
              const updated = prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
              saveLocalCachedTasks(updated);
              return updated;
            });
            addAuditLog(
              `SY-${String(updatedTask.id).padStart(4, "0")} status → ${updatedTask.status.toLowerCase()}`,
              updatedTask.status === "COMPLETED" ? "#5A684B" : "#C9662A"
            );
          } else if (payload.eventType === "DELETE") {
            const oldTask = payload.old as Task;
            setTasks((prev) => {
              const updated = prev.filter((t) => t.id !== oldTask.id);
              saveLocalCachedTasks(updated);
              return updated;
            });
            addAuditLog(`SY-${String(oldTask.id).padStart(4, "0")} deleted`, "#B23A34");
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
      if (bc) bc.close();
    };
  }, []);

  // Global Keyboard Shortcuts (⌘K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdkOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsCmdkOpen(false);
        setIsAddModalOpen(false);
        setIsAuditModalOpen(false);
        setSelectedTaskId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Timer Interval
  useEffect(() => {
    if (!activeTimerTaskId) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerTaskId]);

  // Actions
  const handleToggleDone = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    const updatedTask: Task = { ...task, status: nextStatus, actual_end: nextStatus === "COMPLETED" ? new Date().toISOString() : null };
    
    // Instant optimistic state & local cache update
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === task.id ? updatedTask : t));
      saveLocalCachedTasks(next);
      return next;
    });

    broadcastSync("TASKS_UPDATED", null);
    addAuditLog(
      `SY-${String(task.id).padStart(4, "0")} status → ${nextStatus.toLowerCase()}`,
      nextStatus === "COMPLETED" ? "#5A684B" : "#6E685C"
    );

    try {
      await updateTask(task.id, {
        status: nextStatus,
        actual_end: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
      });
      showToast(`SY-${String(task.id).padStart(4, "0")} ditandai ${nextStatus}`);
    } catch {
      // Preserved in local cache
    }
  };

  const handleStartTimer = (task: Task) => {
    if (activeTimerTaskId === task.id) {
      const addedHours = timerSeconds / 3600;
      const newDuration = (task.actual_duration_hours || 0) + addedHours;
      const updatedTask = { ...task, actual_duration_hours: Number(newDuration.toFixed(2)) };

      setTasks((prev) => {
        const next = prev.map((t) => (t.id === task.id ? updatedTask : t));
        saveLocalCachedTasks(next);
        return next;
      });

      broadcastSync("TASKS_UPDATED", null);
      updateTask(task.id, { actual_duration_hours: Number(newDuration.toFixed(2)) });
      setActiveTimerTaskId(null);
      addAuditLog(
        `timer stopped · ${Math.round(timerSeconds / 60)}m logged on SY-${String(task.id).padStart(4, "0")}`,
        "#6E685C"
      );
      setTimerSeconds(0);
      showToast(`Timer stopped: +${Math.round(timerSeconds / 60)}m logged`);
    } else {
      setActiveTimerTaskId(task.id);
      setTimerSeconds(0);
      const updatedTask = { ...task, status: "IN_PROGRESS" as TaskStatus, actual_start: new Date().toISOString() };
      
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === task.id ? updatedTask : t));
        saveLocalCachedTasks(next);
        return next;
      });

      broadcastSync("TASKS_UPDATED", null);
      updateTask(task.id, { status: "IN_PROGRESS", actual_start: new Date().toISOString() });
      addAuditLog(`timer started on SY-${String(task.id).padStart(4, "0")}`, "#C9662A");
      showToast(`Timer active on SY-${String(task.id).padStart(4, "0")}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const tagsArray = newTaskTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const created = await createTask({
        name: newTaskName.trim(),
        priority: newTaskPriority,
        estimated_duration: Number(newTaskEstimate) || 1.0,
        deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
        depends_on: newTaskDependsOn,
        status: "TODO",
        tags: tagsArray,
        notes: "## Task Notes\n- [ ] Requirements gathering\n- [ ] Implementation\n- [ ] Verification",
      });

      setTasks((prev) => {
        const next = [created, ...prev.filter((t) => t.id !== created.id)];
        saveLocalCachedTasks(next);
        return next;
      });

      broadcastSync("TASKS_UPDATED", null);
      addAuditLog(`SY-${String(created.id).padStart(4, "0")} created`, "#6E685C");
      setNewTaskName("");
      setNewTaskDeadline("");
      setNewTaskDependsOn([]);
      setIsAddModalOpen(false);
      showToast(`Created task SY-${String(created.id).padStart(4, "0")}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to create new task");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveLocalCachedTasks(next);
      return next;
    });

    broadcastSync("TASKS_UPDATED", null);
    if (selectedTaskId === id) setSelectedTaskId(null);
    addAuditLog(`SY-${String(id).padStart(4, "0")} deleted`, "#B23A34");
    try {
      await deleteTask(id);
      showToast(`Task SY-${String(id).padStart(4, "0")} deleted`);
    } catch {
      // Deleted in local cache
    }
  };

  const triggerOptimize = () => {
    setIsOptimizing(true);
    addAuditLog(`optimized schedule with ${algo} algorithm`, "#C9662A");
    setTimeout(() => {
      setIsOptimizing(false);
      showToast(`Schedule optimized using ${algo} algorithm`);
    }, 500);
  };

  // Optimizer calculation
  const scheduledBlocks = useMemo(() => {
    return optimizeSchedule(tasks, algo);
  }, [tasks, algo]);

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    const list = tasks.filter((t) => {
      const matchesTag = !filterTag || (t.tags && t.tags.includes(filterTag));
      const matchesStatus =
        filterStatus === "ALL" ||
        (filterStatus === "ACTIVE" && t.status !== "COMPLETED") ||
        (filterStatus === "DONE" && t.status === "COMPLETED");
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(t.id).includes(searchQuery);
      return matchesTag && matchesStatus && matchesSearch;
    });

    return list.sort((a, b) => {
      const pDiff = (b.priority || 3) - (a.priority || 3);
      if (pDiff !== 0) return pDiff;
      return a.id - b.id;
    });
  }, [tasks, filterTag, filterStatus, searchQuery]);

  // Metrics
  const totalPlannedHours = useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.estimated_duration || 0), 0);
  }, [tasks]);

  const totalActualHours = useMemo(() => {
    return tasks.reduce((acc, t) => acc + (t.actual_duration_hours || 0), 0);
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.status === "COMPLETED").length;
  }, [tasks]);

  const activeCount = useMemo(() => {
    return tasks.filter((t) => t.status === "IN_PROGRESS").length;
  }, [tasks]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [tasks]);

  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const nowMarkerLeft = useMemo(() => {
    const d = currentDate || new Date();
    const currentH = d.getHours() + d.getMinutes() / 60;
    if (currentH < 8) return 0;
    if (currentH > 19) return 100;
    return ((currentH - 8) / 11) * 100;
  }, [currentDate]);

  const todayFormatted = useMemo(() => {
    const d = currentDate || new Date();
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }, [currentDate]);

  return (
    <div className="h-screen bg-[#F5F0E4] text-[#211F1A] flex flex-col font-sans selection:bg-[#C9662A]/20 overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 bg-[#211F1A] text-[#F5F0E4] px-4 py-3 rounded-2xl shadow-2xl text-xs font-mono border border-[#E2D9C6]/40 flex items-center gap-2.5"
          >
            <Sparkles className="w-4 h-4 text-[#C9662A] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <AppHeader
        tab={tab}
        onTabChange={handleTabChange}
        connected={connected}
        onOpenCmdk={() => setIsCmdkOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Metric Stats Banner */}
      <MetricCards
        activeCount={activeCount}
        queuedCount={tasks.length - completedCount - activeCount}
        completedCount={completedCount}
        totalActualHours={totalActualHours}
        totalPlannedHours={totalPlannedHours}
      />

      {/* Main Workspace Layout */}
      <div className="max-w-[1400px] w-full mx-auto flex-1 flex px-6 pb-6 gap-6 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          tasks={tasks}
          completedCount={completedCount}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterTag={filterTag}
          setFilterTag={setFilterTag}
          allTags={allTags}
        />

        {/* Center Workspace */}
        <main className="flex-1 flex flex-col gap-6 overflow-y-auto min-w-0 h-full pr-1 custom-scrollbar">
          {/* Top Section: ScheduleStrip & Optimizer */}
          <ScheduleStrip
            todayFormatted={todayFormatted}
            algo={algo}
            setAlgo={setAlgo}
            triggerOptimize={triggerOptimize}
            isOptimizing={isOptimizing}
            nowMarkerLeft={nowMarkerLeft}
            scheduledBlocks={scheduledBlocks}
            tasks={tasks}
            setSelectedTaskId={setSelectedTaskId}
          />

          {/* Tab Views */}
          <div className="flex-1 min-h-[300px]">
            {tab === "tasks" && (
              <div key="tasks-tab" className="animate-in fade-in duration-150">
                <TaskTable
                  loading={loading}
                  filteredTasks={filteredTasks}
                  selectedTaskId={selectedTaskId}
                  setSelectedTaskId={setSelectedTaskId}
                  handleToggleDone={handleToggleDone}
                  handleStartTimer={handleStartTimer}
                  handleDeleteTask={handleDeleteTask}
                  activeTimerTaskId={activeTimerTaskId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                />
              </div>
            )}

            {tab === "gantt" && (
              <div key="gantt-tab" className="animate-in fade-in duration-150">
                <GanttView tasks={tasks} />
              </div>
            )}

            {tab === "time" && (
              <div key="time-tab" className="animate-in fade-in duration-150">
                <TimeTrackerView tasks={tasks} />
              </div>
            )}
          </div>
        </main>

        {/* Right Drawer: Task Detail & Markdown Notes */}
        <TaskDetailDrawer
          selectedTask={selectedTask}
          tasks={tasks}
          onClose={() => setSelectedTaskId(null)}
          setTasks={setTasks}
          updateTask={updateTask}
          handleToggleDone={handleToggleDone}
          handleStartTimer={handleStartTimer}
          handleDeleteTask={handleDeleteTask}
          activeTimerTaskId={activeTimerTaskId}
        />
      </div>

      {/* Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
      />

      {/* New Task Modal */}
      <NewTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTask}
        newTaskName={newTaskName}
        setNewTaskName={setNewTaskName}
        newTaskPriority={newTaskPriority}
        setNewTaskPriority={setNewTaskPriority}
        newTaskEstimate={newTaskEstimate}
        setNewTaskEstimate={setNewTaskEstimate}
        newTaskDeadline={newTaskDeadline}
        setNewTaskDeadline={setNewTaskDeadline}
        newTaskDependsOn={newTaskDependsOn}
        setNewTaskDependsOn={setNewTaskDependsOn}
        newTaskTags={newTaskTags}
        setNewTaskTags={setNewTaskTags}
        tasks={tasks}
      />

      {/* Command Palette (⌘K) Modal */}
      <CommandPalette
        isOpen={isCmdkOpen}
        onClose={() => setIsCmdkOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredTasks={filteredTasks}
        setSelectedTaskId={setSelectedTaskId}
        handleTabChange={handleTabChange}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        triggerOptimize={triggerOptimize}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />
    </div>
  );
}
