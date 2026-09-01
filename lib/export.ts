import { Task } from "./types";
import { supabase } from "./supabase";

export function exportWorkspaceJSON(tasks: Task[], address: string) {
  const exportData = {
    app: "sisy",
    version: "2.0.0",
    wallet: address,
    exported_at: new Date().toISOString(),
    task_count: tasks.length,
    tasks: tasks,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sisy-workspace-${address.slice(0, 6) || "export"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportWorkspaceCSV(tasks: Task[], address: string) {
  const headers = [
    "id",
    "name",
    "priority",
    "status",
    "estimated_duration_hours",
    "deadline",
    "tags",
    "depends_on",
    "created_at",
  ];

  const rows = tasks.map((t) => [
    t.id,
    `"${(t.name || "").replace(/"/g, '""')}"`,
    t.priority || 3,
    t.status,
    t.estimated_duration || 1,
    t.deadline || "",
    `"${(t.tags || []).join(";")}"`,
    `"${(t.depends_on || []).join(";")}"`,
    t.created_at || "",
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n"
  );
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sisy-tasks-${address.slice(0, 6) || "export"}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function purgeAccountWorkspace(
  address: string,
  onSuccess: () => void
) {
  if (!address) return;
  const confirmed = window.confirm(
    "⚠️ ARE YOU SURE YOU WANT TO PURGE YOUR WORKSPACE?\n\nThis will permanently delete all your tasks and time tracking logs from the cloud database. This action cannot be undone."
  );
  if (!confirmed) return;

  try {
    await supabase.from("tasks").delete().eq("user_id", address);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sisy_tasks_v1");
      localStorage.removeItem("sisy_user_id");
      localStorage.removeItem("sisy_wallet_address");
      localStorage.removeItem("sisy_wallet_name");
      localStorage.removeItem("sisy_wallet_icon");
      localStorage.removeItem("sisy_wallet_chain");
    }
    onSuccess();
  } catch (err) {
    console.error("Failed to purge workspace:", err);
    alert("Failed to delete workspace data. Please check connection.");
  }
}
