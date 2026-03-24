"use client";

import { useState } from "react";
import { PROMPT_SECTIONS } from "@/lib/prompts";

interface PromptEditorProps {
  questionCount: string;
  rules: string;
  onChangeQuestionCount: (value: string) => void;
  onChangeRules: (value: string) => void;
  isModified: boolean;
  onReset: () => void;
}

export default function PromptEditor({
  questionCount,
  rules,
  onChangeQuestionCount,
  onChangeRules,
  isModified,
  onReset,
}: PromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors group"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <span>AI 프롬프트 설정</span>
        {isModified && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">수정됨</span>
        )}
      </button>

      {isOpen && (
        <div className="mt-3 glass p-5 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              문제 생성 조건을 자유롭게 수정할 수 있습니다
            </p>
            {isModified && (
              <button
                onClick={onReset}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                기본값 복원
              </button>
            )}
          </div>

          {/* 문제 수 설정 */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              {PROMPT_SECTIONS.questionCount.label}
            </label>
            <p className="text-xs text-zinc-600 mb-2">{PROMPT_SECTIONS.questionCount.description}</p>
            <textarea
              className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all leading-relaxed"
              value={questionCount}
              onChange={(e) => onChangeQuestionCount(e.target.value)}
              placeholder="예: 객관식 10문제, 주관식 5문제"
            />
          </div>

          {/* 출제 규칙 */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              {PROMPT_SECTIONS.rules.label}
            </label>
            <p className="text-xs text-zinc-600 mb-2">{PROMPT_SECTIONS.rules.description}</p>
            <textarea
              className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all leading-relaxed"
              value={rules}
              onChange={(e) => onChangeRules(e.target.value)}
              placeholder="예: 난이도를 높게 설정하세요"
            />
          </div>
        </div>
      )}
    </div>
  );
}
