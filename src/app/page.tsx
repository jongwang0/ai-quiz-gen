"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InputCard from "@/components/InputCard";
import PromptEditor from "@/components/PromptEditor";
import QuizPage from "@/components/QuizPage";
import PenguinDot, { PenguinLoading } from "@/components/PenguinDot";
import { PROMPT_SECTIONS } from "@/lib/prompts";
import type { Question } from "@/types";

/** 프롬프트에서 사용자가 요청한 총 문제 수 파싱 */
function parseTotalFromPrompt(promptText: string): number | null {
  // "객관식 60문제" or "60문제" 패턴
  const matches = [...promptText.matchAll(/(\d+)\s*문제/g)];
  if (matches.length === 0) return null;
  return matches.reduce((sum, m) => sum + parseInt(m[1], 10), 0);
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");

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

  const BATCH_SIZE = 10;

  const handleGenerate = async (data: { text?: string; images?: string[] }) => {
    setIsLoading(true);
    setQuestions([]);
    setSessionId(null);
    setShowQuiz(false);
    setBatchProgress("");

    try {
      const customPrompt = buildPrompt();

      // 사용자가 요청한 총 문제 수 파싱
      const promptSource = customPrompt || questionCount;
      const requestedTotal = parseTotalFromPrompt(promptSource);

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
      // 모든 이미지를 한 번에 보내되, 배치별로 나눠서 API 호출
      // 단, 요청한 문제 수에 도달하면 조기 종료
      const allImages = data.images;
      const batches: string[][] = [];
      for (let i = 0; i < allImages.length; i += BATCH_SIZE) {
        batches.push(allImages.slice(i, i + BATCH_SIZE));
      }

      // 배치당 생성할 문제 수 계산
      let perBatchPrompt = customPrompt;
      if (requestedTotal && batches.length > 1) {
        // 사용자가 요청한 문제 수를 배치 수로 나눠서 각 배치에 할당
        const perBatch = Math.ceil(requestedTotal / batches.length);
        // questionCount 부분만 배치 단위로 교체
        const batchQuestionCount = questionCount.replace(
          /(\d+)(\s*문제)/g,
          (_, num, suffix) => {
            const original = parseInt(num, 10);
            const scaled = Math.max(1, Math.ceil((original / requestedTotal) * perBatch * batches.length / batches.length));
            return `${scaled}${suffix}`;
          }
        );
        perBatchPrompt = `당신은 전문 시험 문제 출제자입니다. 제공된 자료(텍스트 또는 이미지)를 바탕으로 CBT(컴퓨터 기반 시험) 형식의 문제를 생성하세요.

생성할 문제 수:
${batchQuestionCount}

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
- JSON 객체만 반환하세요 (마크다운 포맷 없이)
- 정확히 지정된 문제 수만큼만 생성하세요. 그 이상 생성하지 마세요.`;
      }

      const allQuestions: Question[] = [];
      for (let i = 0; i < batches.length; i++) {
        // 이미 충분한 문제가 생성되었으면 조기 종료
        if (requestedTotal && allQuestions.length >= requestedTotal) break;

        setBatchProgress(`배치 ${i + 1}/${batches.length} 처리 중... (${allQuestions.length}문제 생성됨)`);

        const body: Record<string, unknown> = { images: batches[i] };
        if (perBatchPrompt) body.prompt = perBatchPrompt;

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errMsg = errorData?.error || "생성 실패";
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

      // 요청한 총 문제 수로 잘라내기
      const finalQuestions = requestedTotal
        ? allQuestions.slice(0, requestedTotal)
        : allQuestions;

      setBatchProgress("");
      setQuestions(finalQuestions);
      setShowQuiz(true);
      saveSession("image", null, finalQuestions);
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
      <div className="animate-slide-up stagger-1">
        <PromptEditor
          questionCount={questionCount}
          rules={rules}
          onChangeQuestionCount={setQuestionCount}
          onChangeRules={setRules}
          isModified={isPromptModified}
          onReset={resetPrompt}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="animate-slide-up stagger-2">
          <InputCard onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="glass p-6 h-full flex flex-col animate-slide-up stagger-3 glass-hover">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            생성된 문제
          </h2>
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <PenguinLoading message={batchProgress || undefined} />
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 opacity-40">
                  <PenguinDot size={48} />
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
