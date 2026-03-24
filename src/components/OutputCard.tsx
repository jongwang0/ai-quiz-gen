"use client";

import type { Question } from "@/types";

interface OutputCardProps {
  questions: Question[];
  isLoading: boolean;
  sessionId?: string | null;
}

export default function OutputCard({ questions, isLoading, sessionId }: OutputCardProps) {
  const handleShare = async () => {
    if (!sessionId) return;
    const url = `${window.location.origin}/${sessionId}`;
    await navigator.clipboard.writeText(url);
    alert("공유 링크가 복사되었습니다!");
  };

  if (isLoading) {
    return (
      <div className="glass p-6 h-full flex flex-col">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          생성된 문제
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 animate-spin text-zinc-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-zinc-500 text-sm">AI가 문제를 생성하고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="glass p-6 h-full flex flex-col">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          생성된 문제
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">텍스트를 입력하고 문제를 생성해보세요</p>
            <p className="text-zinc-600 text-xs mt-1">객관식, 주관식, 서술형 문제가 생성됩니다</p>
          </div>
        </div>
      </div>
    );
  }

  const multipleChoice = questions.filter((q) => q.type === "multiple_choice");
  const shortAnswer = questions.filter((q) => q.type === "short_answer");
  const essay = questions.filter((q) => q.type === "essay");

  return (
    <div className="glass p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          생성된 문제
        </h2>
        <div className="flex items-center gap-3">
          {sessionId && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              공유
            </button>
          )}
          <span className="text-xs text-zinc-600">{questions.length}문제</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {multipleChoice.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              객관식
            </h3>
            <div className="space-y-3">
              {multipleChoice.map((q, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-sm text-zinc-200 mb-3">
                    <span className="text-zinc-500 mr-2">{i + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-1.5 ml-4">
                    {q.type === "multiple_choice" &&
                      q.options.map((opt, j) => (
                        <div
                          key={j}
                          className={`text-xs px-3 py-2 rounded-lg ${
                            opt.startsWith(q.answer)
                              ? "bg-white/10 text-zinc-200 border border-white/15"
                              : "text-zinc-400"
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {shortAnswer.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              주관식
            </h3>
            <div className="space-y-3">
              {shortAnswer.map((q, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-sm text-zinc-200 mb-2">
                    <span className="text-zinc-500 mr-2">{i + 1}.</span>
                    {q.question}
                  </p>
                  {q.type === "short_answer" && (
                    <p className="text-xs text-zinc-500 ml-4 mt-2 border-l border-white/10 pl-3">
                      모범답안: {q.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {essay.length > 0 && (
          <section>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              서술형
            </h3>
            <div className="space-y-3">
              {essay.map((q, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-sm text-zinc-200 mb-2">
                    <span className="text-zinc-500 mr-2">{i + 1}.</span>
                    {q.question}
                  </p>
                  {q.type === "essay" && (
                    <p className="text-xs text-zinc-500 ml-4 mt-2 border-l border-white/10 pl-3">
                      채점 가이드: {q.guidelines}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
