"use client";

import { useEffect, useState, use } from "react";
import Header from "@/components/Header";
import OutputCard from "@/components/OutputCard";
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
    <main className="max-w-3xl mx-auto px-6 pb-12">
      <Header />
      {error ? (
        <div className="glass p-8 text-center">
          <p className="text-zinc-400">{error}</p>
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 mt-4 inline-block transition-colors">
            &larr; 홈으로 돌아가기
          </a>
        </div>
      ) : (
        <>
          {session && (
            <p className="text-xs text-zinc-600 mb-4">
              {new Date(session.created_at).toLocaleString("ko-KR")} 에 생성됨
            </p>
          )}
          <OutputCard
            questions={session?.questions || []}
            isLoading={isLoading}
          />
        </>
      )}
    </main>
  );
}
