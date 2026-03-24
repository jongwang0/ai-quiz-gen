"use client";

import { useEffect, useState, use } from "react";
import Header from "@/components/Header";
import QuizPage from "@/components/QuizPage";
import { PenguinLoading } from "@/components/PenguinDot";
import type { Question } from "@/types";

interface SessionData {
  id: string;
  source_type: string;
  source_text: string | null;
  questions: Question[];
  created_at: string;
}

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/sessions?id=${sessionId}`);
        if (!res.ok) throw new Error("세션을 찾을 수 없습니다");
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  return (
    <main className="max-w-6xl mx-auto px-6 pb-12">
      <Header />
      {isLoading ? (
        <div className="glass p-12 flex items-center justify-center animate-fade-in">
          <PenguinLoading message="문제를 불러오는 중..." />
        </div>
      ) : error ? (
        <div className="glass p-8 text-center animate-fade-in">
          <p className="text-zinc-400 mb-4">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 btn-primary text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            직접 문제 만들기
          </a>
        </div>
      ) : session ? (
        <>
          <p className="text-xs text-zinc-600 mb-4 animate-fade-in">
            {new Date(session.created_at).toLocaleString("ko-KR")} 에 생성됨
          </p>
          <QuizPage
            questions={session.questions}
            sessionId={session.id}
          />
        </>
      ) : null}
    </main>
  );
}
