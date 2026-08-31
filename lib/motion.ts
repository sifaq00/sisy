/**
 * lib/motion.ts
 * Typed client for Motion backend API endpoints
 * Matches docs/API.md specification
 */

import { Task, TaskStatus } from "./types";
import { fetchTasks, createTask, updateTask, deleteTask } from "./supabase";

export interface MotionTaskResponse {
  id: number;
  name: string;
  status: TaskStatus;
  priority: number;
  deadline?: string | null;
  estimated_duration: number;
  planned_start?: string | null;
  planned_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  actual_duration_hours?: number;
  notes?: string;
  tags?: string[];
  depends_on?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface MotionOptimizeRequest {
  algorithm?: string;
  tasks?: Task[];
}

export interface MotionOptimizeResponse {
  algorithm: string;
  scheduled_blocks: {
    taskId: number;
    name: string;
    startHour: number;
    durationHours: number;
    color: string;
    status: string;
    priority: number;
  }[];
}

/**
 * Fetch tasks from proxy or direct DB
 */
export async function getTasks(): Promise<Task[]> {
  try {
    const res = await fetch("/api/tasks");
    if (res.ok) {
      const data = await res.json();
      if (data.tasks) return data.tasks;
    }
  } catch {
    // Fallback to direct client
  }
  return fetchTasks();
}

/**
 * Create a new task via Motion API
 */
export async function createMotionTask(taskData: Partial<Task>): Promise<Task> {
  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.task) return data.task;
    }
  } catch {
    // Fallback
  }
  return createTask(taskData);
}

/**
 * Update task via Motion API
 */
export async function updateMotionTask(id: number, updates: Partial<Task>): Promise<Task> {
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.task) return data.task;
    }
  } catch {
    // Fallback
  }
  return updateTask(id, updates);
}

/**
 * Delete task via Motion API
 */
export async function deleteMotionTask(id: number): Promise<void> {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) return;
  } catch {
    // Fallback
  }
  return deleteTask(id);
}
