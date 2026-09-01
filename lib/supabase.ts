import { createClient } from "@supabase/supabase-js";
import { Task } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ryzftouhyyixnamqkwqa.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5emZ0b3VoeXlpeG5hbXFrd3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwOTk1OTgsImV4cCI6MjEwMjY3NTU5OH0.LRd7B6MMwXmlzqRO8G8ouTTEhzqIz5uDGsCs2f1W5pQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_STORAGE_KEY = "sisy_tasks_v1";

/**
 * Returns or generates a persistent private workspace User ID per browser session/device.
 */
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "default_user";
  try {
    const wallet = localStorage.getItem("sisy_wallet_address");
    if (wallet && wallet.trim().length > 6) {
      return wallet.trim();
    }
    let userId = localStorage.getItem("sisy_user_id");
    if (!userId) {
      userId = "usr_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem("sisy_user_id", userId);
    }
    return userId;
  } catch {
    return "default_user";
  }
}

export function getLocalCachedTasks(targetUserId?: string): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const userId = targetUserId || getOrCreateUserId();
    const key = `sisy_tasks_${userId}`;
    let raw = localStorage.getItem(key);
    if (!raw) {
      // Fallback to legacy generic key
      raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    }
    if (!raw) return [];
    const tasks: Task[] = JSON.parse(raw);
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    const valid = tasks.filter((t) => {
      const createdTime = t.created_at ? new Date(t.created_at).getTime() : now;
      if (now - createdTime > SEVEN_DAYS) return false;
      if (t.status === "COMPLETED") {
        const updateTime = t.updated_at ? new Date(t.updated_at).getTime() : createdTime;
        if (now - updateTime > THREE_DAYS) return false;
      }
      return true;
    });
    return valid;
  } catch {
    return [];
  }
}

export function saveLocalCachedTasks(tasks: Task[], targetUserId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const userId = targetUserId || getOrCreateUserId();
    const key = `sisy_tasks_${userId}`;
    localStorage.setItem(key, JSON.stringify(tasks));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Local cache save error:", e);
  }
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const userId = getOrCreateUserId();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: false })
      .order("id", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      saveLocalCachedTasks(data);
      return data;
    }
    return getLocalCachedTasks();
  } catch (err) {
    console.warn("Supabase fetch failed, loading local fallback:", err);
    return getLocalCachedTasks();
  }
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const userId = getOrCreateUserId();
  const tempId = Date.now();
  const optimisticTask: Task = {
    id: tempId,
    user_id: userId,
    name: task.name || "Untitled Task",
    status: task.status || "TODO",
    priority: task.priority || 3,
    estimated_duration: task.estimated_duration || 1.0,
    actual_duration_hours: task.actual_duration_hours || 0,
    deadline: task.deadline || null,
    planned_start: task.planned_start || null,
    planned_end: task.planned_end || null,
    actual_start: task.actual_start || null,
    actual_end: task.actual_end || null,
    depends_on: task.depends_on || [],
    tags: task.tags || [],
    notes: task.notes || "",
    created_at: task.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...task, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data || optimisticTask;
  } catch (err) {
    console.warn("Supabase insert error, saved locally:", err);
    const cached = getLocalCachedTasks();
    saveLocalCachedTasks([optimisticTask, ...cached]);
    return optimisticTask;
  }
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const cached = getLocalCachedTasks();
  const target = cached.find((t) => t.id === id);
  const updatedObj: Task = target
    ? { ...target, ...updates, updated_at: new Date().toISOString() }
    : ({ id, ...updates } as Task);

  const updatedCache = cached.map((t) => (t.id === id ? updatedObj : t));
  saveLocalCachedTasks(updatedCache);

  try {
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data || updatedObj;
  } catch (err) {
    console.warn("Supabase update error, preserved locally:", err);
    return updatedObj;
  }
}

export async function deleteTask(id: number): Promise<void> {
  const cached = getLocalCachedTasks();
  saveLocalCachedTasks(cached.filter((t) => t.id !== id));

  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    console.warn("Supabase delete error, removed locally:", err);
  }
}
