import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/openrouter";
import { DEFAULT_PROMPT } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, image, prompt } = body;

    if (!text && !image) {
      return NextResponse.json(
        { error: "텍스트 또는 이미지를 입력해주세요" },
        { status: 400 }
      );
    }

    const questions = await generateQuestions({
      text,
      image,
      systemPrompt: prompt || DEFAULT_PROMPT,
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
