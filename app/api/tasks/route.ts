import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getWalletFromHeaders(request: Request): string | null {
  const wallet = request.headers.get("x-wallet-address") || request.headers.get("authorization")?.replace("Bearer ", "");
  if (!wallet || wallet.trim().length < 8) return null;
  return wallet.trim();
}

export async function GET(request: Request) {
  const wallet = getWalletFromHeaders(request);
  if (!wallet) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Wallet connection required to access workspace API.",
      },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", wallet)
      .order("priority", { ascending: false })
      .order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, tasks: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const wallet = getWalletFromHeaders(request);
  if (!wallet) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Wallet connection required to access workspace API.",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ ...body, user_id: wallet }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, task: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
