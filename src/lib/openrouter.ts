import type { Question } from "@/types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// 무료 모델 (비용 $0) - Vision 지원
const MODEL = "google/gemini-2.0-flash-001";

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
      text: `위 ${params.images.length}장의 이미지를 분석하여 문제를 생성하세요. 이미지의 텍스트 내용을 읽고 그 내용을 바탕으로 문제를 만드세요. 모든 이미지의 내용을 골고루 반영해야 합니다.`,
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
      response_format: { type: "json_object" },
      max_tokens: 16384,
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

  const parsed = parseJsonSafe(content);

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new Error("AI가 올바른 형식의 문제를 생성하지 못했습니다. 다시 시도해주세요.");
  }

  // 문제 순서 셔플
  const questions: Question[] = parsed.questions;
  return shuffleArray(questions);
}

/**
 * JSON 파싱 (마크다운 코드 블록 제거 + 잘린 JSON 복구)
 */
function parseJsonSafe(raw: string): { questions: Question[] } {
  // 마크다운 코드 블록 제거
  let str = raw.replace(/^```(?:json)?\n?/gm, "").replace(/\n?```$/gm, "").trim();

  // 1차 시도: 그대로 파싱
  try {
    return JSON.parse(str);
  } catch {
    // 파싱 실패 시 복구 시도
  }

  // 2차 시도: 잘린 JSON 복구 - 닫히지 않은 괄호 닫기
  try {
    // 마지막 완전한 객체까지만 자르기
    const lastComplete = str.lastIndexOf("}");
    if (lastComplete > 0) {
      str = str.substring(0, lastComplete + 1);
      // 닫히지 않은 배열/객체 괄호 추가
      const opens = (str.match(/\[/g) || []).length;
      const closes = (str.match(/\]/g) || []).length;
      for (let i = 0; i < opens - closes; i++) str += "]";
      const openBraces = (str.match(/\{/g) || []).length;
      const closeBraces = (str.match(/\}/g) || []).length;
      for (let i = 0; i < openBraces - closeBraces; i++) str += "}";
      return JSON.parse(str);
    }
  } catch {
    // 복구 실패
  }

  // 3차 시도: 개별 문제 객체를 하나씩 추출
  try {
    const questions: Question[] = [];
    // "type": "..." 패턴이 나오는 위치를 찾아 각 문제 객체를 추출
    const typePattern = /"type"\s*:\s*"(multiple_choice|short_answer|essay)"/g;
    let typeMatch;
    while ((typeMatch = typePattern.exec(raw)) !== null) {
      // 이 type 앞의 { 찾기
      let braceStart = raw.lastIndexOf("{", typeMatch.index);
      if (braceStart === -1) continue;
      // 중괄호 매칭으로 객체 끝 찾기
      let depth = 0;
      let end = -1;
      for (let i = braceStart; i < raw.length; i++) {
        if (raw[i] === "{") depth++;
        else if (raw[i] === "}") {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (end === -1) continue;
      try {
        const obj = JSON.parse(raw.substring(braceStart, end + 1));
        if (obj.type && obj.question) questions.push(obj);
      } catch {
        // 개별 객체 파싱 실패, 건너뛰기
      }
    }
    if (questions.length > 0) {
      return { questions };
    }
  } catch {
    // 추출 실패
  }

  throw new Error("AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.");
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
