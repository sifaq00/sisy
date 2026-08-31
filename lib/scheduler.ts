import { Task, ScheduledBlock } from "./types";

const COLORS = [
  "#C9662A", // Sisy Orange
  "#5A684B", // Sisy Olive
  "#3D6B78", // Sisy Teal
  "#8A5A36", // Warm Brown
  "#6B5B95", // Purple Slate
  "#887456", // Sandstone
  "#A3485E", // Dusty Rose
  "#4A6984", // Steel Blue
];

/**
 * Topological sort for tasks respecting dependencies (DAG).
 */
function topologicalSort(tasks: Task[]): Task[] {
  const taskMap = new Map<number, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  // Sort candidate roots by highest priority (P5 -> P1) first
  const sortedCandidates = [...tasks].sort((a, b) => (b.priority || 3) - (a.priority || 3));

  const visited = new Set<number>();
  const visiting = new Set<number>();
  const result: Task[] = [];

  function visit(task: Task) {
    if (visiting.has(task.id)) {
      // Circular dependency fallback
      return;
    }
    if (!visited.has(task.id)) {
      visiting.add(task.id);
      if (task.depends_on && task.depends_on.length > 0) {
        for (const depId of task.depends_on) {
          const depTask = taskMap.get(depId);
          if (depTask) {
            visit(depTask);
          }
        }
      }
      visiting.delete(task.id);
      visited.add(task.id);
      result.push(task);
    }
  }

  for (const task of sortedCandidates) {
    if (!visited.has(task.id)) {
      visit(task);
    }
  }

  return result;
}

/**
 * Optimizes schedule mirroring Motion's optimization strategies.
 * Working hours: 09:00 (9.0) to 18:00 (18.0).
 */
export function optimizeSchedule(tasks: Task[], algorithm = "greedy"): ScheduledBlock[] {
  const activeTasks = tasks.filter(
    (t) => (t.status === "TODO" || t.status === "IN_PROGRESS") && !t.is_archived
  );

  let sorted: Task[] = [];

  if (algorithm === "dependency") {
    // 1. Dependency-Aware DAG Order
    sorted = topologicalSort(activeTasks);
  } else if (algorithm === "deadline") {
    // 2. Earliest Deadline First (EDF)
    sorted = [...activeTasks].sort((a, b) => {
      const deadA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const deadB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      if (deadA !== deadB) return deadA - deadB;
      return (b.priority || 3) - (a.priority || 3);
    });
  } else if (algorithm === "sjf") {
    // 3. Shortest Job First (SJF)
    sorted = [...activeTasks].sort(
      (a, b) => (a.estimated_duration || 1) - (b.estimated_duration || 1)
    );
  } else if (algorithm === "balanced") {
    // 4. Balanced Distribution (P4/P5 alternating with P3/P2)
    const high = activeTasks.filter((t) => (t.priority || 3) >= 4);
    const normal = activeTasks.filter((t) => (t.priority || 3) < 4);
    sorted = [];
    const maxLen = Math.max(high.length, normal.length);
    for (let i = 0; i < maxLen; i++) {
      if (high[i]) sorted.push(high[i]);
      if (normal[i]) sorted.push(normal[i]);
    }
  } else {
    // 5. Default: Greedy Priority (In-Progress > Priority > Duration)
    sorted = [...activeTasks].sort((a, b) => {
      if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1;
      if (b.status === "IN_PROGRESS" && a.status !== "IN_PROGRESS") return 1;
      const pDiff = (b.priority || 3) - (a.priority || 3);
      if (pDiff !== 0) return pDiff;
      return (a.estimated_duration || 1) - (b.estimated_duration || 1);
    });
  }

  // Ensure dependencies are not violated even in non-dependency sorts
  const taskFinishHourMap = new Map<number, number>();
  const blocks: ScheduledBlock[] = [];
  let currentHour = 8.0; // 08:00 AM (Working day start)
  const endOfDay = 19.0; // 07:00 PM (Working day end)

  for (let i = 0; i < sorted.length; i++) {
    const task = sorted[i];
    const duration = Math.max(Math.min(task.estimated_duration || 1.0, 4.0), 0.5);

    // If task has dependencies, start after all prerequisites finish
    let earliestStart = currentHour;
    if (task.depends_on && task.depends_on.length > 0) {
      for (const depId of task.depends_on) {
        const depFinish = taskFinishHourMap.get(depId);
        if (depFinish !== undefined && depFinish > earliestStart) {
          earliestStart = depFinish;
        }
      }
    }

    if (earliestStart + duration > endOfDay) {
      // Exceeds today's schedule capacity
      continue;
    }

    blocks.push({
      taskId: task.id,
      name: task.name,
      startHour: Number(earliestStart.toFixed(2)),
      durationHours: duration,
      color: COLORS[i % COLORS.length],
      status: task.status,
      priority: task.priority,
    });

    const finishHour = earliestStart + duration;
    taskFinishHourMap.set(task.id, finishHour);
    currentHour = Math.max(currentHour, finishHour);
  }

  return blocks;
}
