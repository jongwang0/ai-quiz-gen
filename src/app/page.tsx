"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InputCard from "@/components/InputCard";
import PromptEditor from "@/components/PromptEditor";
import QuizPage from "@/components/QuizPage";
import { PROMPT_SECTIONS } from "@/lib/prompts";
import type { Question } from "@/types";

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // 프롬프트 섹션별 상태
  const [questionCount, setQuestionCount] = useState<string>(PROMPT_SECTIONS.questionCount.defaultValue);
  const [rules, setRules] = useState<string>(PROMPT_SECTIONS.rules.defaultValue);

  const isPromptModified =
    questionCount !== PROMPT_SECTIONS.questionCount.defaultValue ||
    rules !== PROMPT_SECTIONS.rules.defaultValue;

  const buildPrompt = () => {
    if (!isPromptModified) return undefined;

    return `당신은 전문 시험 문제 출제자입니다. 제공된 자료(텍스트 또는 이미지)를 바탕으로 CBT(컴퓨터 기반 시험) 형식의 문제를 생성하세요.

생성할 문제 수:
${questionCount}

아래 JSON 형식으로만 응답하세요:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A"
    },
    {
      "type": "short_answer",
      "question": "...",
      "answer": "..."
    },
    {
      "type": "essay",
      "question": "...",
      "guidelines": "..."
    }
  ]
}

규칙:
${rules.split("\n").map((r) => `- ${r}`).join("\n")}
- JSON 객체만 반환하세요 (마크다운 포맷 없이)`;
  };

  const resetPrompt = () => {
    setQuestionCount(PROMPT_SECTIONS.questionCount.defaultValue);
    setRules(PROMPT_SECTIONS.rules.defaultValue);
  };

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
          prompt_used: isPromptModified ? buildPrompt() : null,
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

  const [batchProgress, setBatchProgress] = useState("");

  const BATCH_SIZE = 10; // 이미지 배치 크기

  const handleGenerate = async (data: { text?: string; images?: string[] }) => {
    setIsLoading(true);
    setQuestions([]);
    setSessionId(null);
    setShowQuiz(false);
    setBatchProgress("");

    try {
      const customPrompt = buildPrompt();

      // 텍스트 모드 또는 이미지 10장 이하: 단일 호출
      if (data.text || !data.images || data.images.length <= BATCH_SIZE) {
        const body: Record<string, unknown> = {};
        if (data.text) body.text = data.text;
        if (data.images && data.images.length > 0) body.images = data.images;
        if (customPrompt) body.prompt = customPrompt;

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.error || "생성에 실패했습니다");
        }

        const result = await res.json();
        setQuestions(result.questions);
        setShowQuiz(true);

        const sourceType = data.images ? "image" : "text";
        const sourceText = data.text || null;
        saveSession(sourceType, sourceText, result.questions);
        return;
      }

      // 이미지 배치 처리 (10장씩)
      const allImages = data.images;
      const batches: string[][] = [];
      for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
        batches.push(allImages.slice(i, i + BATCH_SIZE));
      }

      const allQuestions: Question[] = [];
      for (let i = 0; i < batches.length; i++) {
        setBatchProgress(`배치 ${i + 1}/${batches.length} 처리 중... (${allQuestions.length}문제 생성됨)`);

        const body: Record<string, unknown> = { images: batches[i] };
        if (customPrompt) body.prompt = customPrompt;

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errMsg = errorData?.error || "생성 실패";
          // 배치 실패 시 이미 생성된 문제가 있으면 계속 진행
          if (allQuestions.length > 0) {
            console.warn(`배치 ${i + 1} 실패: ${errMsg}, 기존 문제로 계속 진행`);
            continue;
          }
          throw new Error(errMsg);
        }

        const result = await res.json();
        allQuestions.push(...result.questions);
      }

      if (allQuestions.length === 0) {
        throw new Error("문제를 생성하지 못했습니다");
      }

      setBatchProgress("");
      setQuestions(allQuestions);
      setShowQuiz(true);
      saveSession("image", null, allQuestions);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setIsLoading(false);
      setBatchProgress("");
    }
  };

  // 문제 풀이 화면
  if (showQuiz && questions.length > 0) {
    return (
      <main className="max-w-6xl mx-auto px-6 pb-12">
        <Header />
        <QuizPage
          questions={questions}
          sessionId={sessionId}
          onBack={() => setShowQuiz(false)}
        />
      </main>
    );
  }

  // 입력 화면
  return (
    <main className="max-w-6xl mx-auto px-6 pb-12">
      <Header />
      <PromptEditor
        questionCount={questionCount}
        rules={rules}
        onChangeQuestionCount={setQuestionCount}
        onChangeRules={setRules}
        isModified={isPromptModified}
        onReset={resetPrompt}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputCard onGenerate={handleGenerate} isLoading={isLoading} />
        <div className="glass p-6 h-full flex flex-col">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            생성된 문제
          </h2>
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <div className="text-center">
                <svg className="w-8 h-8 animate-spin text-zinc-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-zinc-500 text-sm">
                  {batchProgress || "AI가 문제를 생성하고 있습니다..."}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <p className="text-zinc-500 text-sm">텍스트를 입력하고 문제를 생성해보세요</p>
                <p className="text-zinc-600 text-xs mt-1">생성 후 문제 풀이 화면으로 전환됩니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
