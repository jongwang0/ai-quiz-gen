import type { Question } from "@/types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// 무료 모델 (비용 $0) - Vision 지원
const MODEL = "google/gemini-2.0-flash-exp:free";

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

interface OpenRouterMessage {
  role: "system" | "user";
  content: string | ContentPart[];
}

export async function generateQuestions(params: {
  text?: string;
  images?: string[];
  systemPrompt: string;
}): Promise<Question[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const messages: OpenRouterMessage[] = [
    { role: "system", content: params.systemPrompt },
  ];

  if (params.images && params.images.length > 0) {
    // 다중 이미지: 모든 이미지를 하나의 메시지에 포함
    const contentParts: ContentPart[] = [];
    for (const img of params.images) {
      contentParts.push({ type: "image_url", image_url: { url: img } });
    }
    contentParts.push({
      type: "text",
      text: `위 ${params.images.length}장의 이미지 모두를 분석하여 문제를 생성하세요. 모든 이미지의 내용을 골고루 반영해야 합니다.`,
    });
    messages.push({ role: "user", content: contentParts });
  } else if (params.text) {
    messages.push({ role: "user", content: params.text });
  } else {
    throw new Error("Either text or images must be provided");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AI Quiz Generator",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API 오류 (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("API 응답이 비어있습니다");
  }

  // Strip markdown code fences if present
  const jsonStr = content.replace(/^```(?:json)?\n?/gm, "").replace(/\n?```$/gm, "").trim();

  const parsed = JSON.parse(jsonStr);

  // 문제 순서 셔플
  const questions: Question[] = parsed.questions;
  return shuffleArray(questions);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
