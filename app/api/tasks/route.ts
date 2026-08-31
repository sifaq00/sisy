import { NextResponse } from "next/server";
import { fetchTasks, createTask } from "@/lib/supabase";

export async function GET() {
  try {
    const tasks = await fetchTasks();
    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = await createTask(body);
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
