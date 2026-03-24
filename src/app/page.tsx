"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InputCard from "@/components/InputCard";
import OutputCard from "@/components/OutputCard";
import PromptEditor from "@/components/PromptEditor";
import { DEFAULT_PROMPT } from "@/lib/prompts";
import type { Question } from "@/types";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const saveSession = async (
    sourceType: "text" | "image",
    sourceText: string | null,
    generatedQuestions: Question[]
  ) => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: sourceType,
          source_text: sourceText,
          prompt_used: customPrompt !== DEFAULT_PROMPT ? customPrompt : null,
          questions: generatedQuestions,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.id);
      }
    } catch {
      // 저장 실패해도 문제 표시에는 영향 없음
    }
  };

  const handleGenerate = async (data: { text?: string; image?: string }) => {
    setIsLoading(true);
    setQuestions([]);
    setSessionId(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          prompt: customPrompt !== DEFAULT_PROMPT ? customPrompt : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "생성에 실패했습니다");
      }

      const result = await res.json();
      setQuestions(result.questions);

      // 자동 저장
      const sourceType = data.image ? "image" : "text";
      const sourceText = data.text || null;
      saveSession(sourceType, sourceText, result.questions);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 pb-12">
      <Header />
      <PromptEditor value={customPrompt} onChange={setCustomPrompt} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputCard onGenerate={handleGenerate} isLoading={isLoading} />
        <OutputCard questions={questions} isLoading={isLoading} sessionId={sessionId} />
      </div>
    </main>
  );
}
