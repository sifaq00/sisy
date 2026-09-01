import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getWalletFromHeaders(request: Request): string | null {
  const wallet = request.headers.get("x-wallet-address") || request.headers.get("authorization")?.replace("Bearer ", "");
  if (!wallet || wallet.trim().length < 8) return null;
  return wallet.trim();
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const id = Number(params.id);
    const body = await request.json();

    const { data, error } = await supabase
      .from("tasks")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", wallet)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, task: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const id = Number(params.id);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", wallet);

    if (error) throw error;
    return NextResponse.json({ success: true, message: `Task ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete task" },
      { status: 500 }
    );
  }
}
