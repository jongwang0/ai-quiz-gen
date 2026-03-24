import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_type, source_text, prompt_used, questions } = body;

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        source_type,
        source_text,
        prompt_used,
        questions,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json(
      { error: "세션 저장에 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Session load error:", error);
    return NextResponse.json(
      { error: "세션을 찾을 수 없습니다" },
      { status: 404 }
    );
  }
}
