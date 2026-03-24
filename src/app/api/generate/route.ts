import { NextRequest, NextResponse } from "next/server";
import { generateQuestions } from "@/lib/openrouter";
import { DEFAULT_PROMPT } from "@/lib/prompts";

// --- Rate Limiting (in-memory) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;          // 최대 요청 수 (배치 처리 지원)
const RATE_WINDOW = 60 * 1000;  // 1분 윈도우

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

// --- 제한 상수 ---
const MAX_TEXT_LENGTH = 10000;    // 텍스트 최대 10,000자
const MAX_IMAGES = 10;            // 배치당 이미지 최대 10장
const MAX_IMAGE_SIZE = 2_000_000; // base64 문자열 최대 ~1.5MB 원본 (압축 후)

export async function POST(request: NextRequest) {
  try {
    // Rate Limit 체크
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 1분 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { text, images, prompt } = body;

    // 입력 검증
    if (!text && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: "텍스트 또는 이미지를 입력해주세요" },
        { status: 400 }
      );
    }

    if (text && text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `텍스트는 ${MAX_TEXT_LENGTH.toLocaleString()}자 이하로 입력해주세요` },
        { status: 400 }
      );
    }

    if (images && images.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `이미지는 최대 ${MAX_IMAGES}장까지 가능합니다` },
        { status: 400 }
      );
    }

    // 이미지 크기 검증
    if (images) {
      for (const img of images) {
        if (typeof img !== "string" || img.length > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: "이미지 크기가 너무 큽니다 (최대 1.5MB)" },
            { status: 400 }
          );
        }
      }
    }

    // 프롬프트 길이 제한
    const systemPrompt = prompt && prompt.length < 5000 ? prompt : DEFAULT_PROMPT;

    const questions = await generateQuestions({
      text,
      images,
      systemPrompt,
    });

    // image_url 필드를 실제 이미지 데이터로 매핑
    if (images && images.length > 0) {
      for (const q of questions) {
        if (q.image_url) {
          const match = q.image_url.match(/image_(\d+)/);
          if (match) {
            const idx = parseInt(match[1], 10) - 1;
            if (idx >= 0 && idx < images.length) {
              q.image_url = images[idx];
            } else {
              q.image_url = undefined;
            }
          } else {
            q.image_url = undefined;
          }
        }
      }
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Generate error:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
