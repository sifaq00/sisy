export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export interface Task {
  id: number;
  user_id?: string;
  name: string;
  status: TaskStatus;
  priority: number;
  deadline: string | null;
  estimated_duration: number;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  actual_duration_hours: number;
  notes: string;
  tags: string[];
  depends_on: number[];
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledBlock {
  taskId: number;
  name: string;
  startHour: number; // e.g. 9.5 for 9:30
  durationHours: number; // e.g. 2.0
  color: string;
  status: TaskStatus;
  priority: number;
}
