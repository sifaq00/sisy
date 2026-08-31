import { NextResponse } from "next/server";
import { fetchTasks } from "@/lib/supabase";
import { optimizeSchedule } from "@/lib/scheduler";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const algo = body.algo || "greedy";
    const tasks = body.tasks || (await fetchTasks());
    const schedule = optimizeSchedule(tasks, algo);
    return NextResponse.json({
      success: true,
      algo,
      scheduled_blocks: schedule,
      total_blocks: schedule.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to optimize schedule" },
      { status: 500 }
    );
  }
}
