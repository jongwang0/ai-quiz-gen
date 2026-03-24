import type { Question } from "@/types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterMessage {
  role: "system" | "user";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export async function generateQuestions(params: {
  text?: string;
  image?: string;
  systemPrompt: string;
}): Promise<Question[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const messages: OpenRouterMessage[] = [
    { role: "system", content: params.systemPrompt },
  ];

  if (params.image) {
    messages.push({
      role: "user",
      content: [
        { type: "image_url", image_url: { url: params.image } },
        { type: "text", text: "Generate questions from this image." },
      ],
    });
  } else if (params.text) {
    messages.push({ role: "user", content: params.text });
  } else {
    throw new Error("Either text or image must be provided");
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
      model: "anthropic/claude-opus-4-6",
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in API response");
  }

  // Strip markdown code fences if present
  const jsonStr = content.replace(/^```(?:json)?\n?/gm, "").replace(/\n?```$/gm, "").trim();

  const parsed = JSON.parse(jsonStr);
  return parsed.questions;
}
