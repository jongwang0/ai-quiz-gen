"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="glass p-12 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-lg font-medium text-zinc-200 mb-2">
          오류가 발생했습니다
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          잠시 후 다시 시도해주세요.
        </p>
        <button onClick={reset} className="btn-primary text-sm">
          다시 시도
        </button>
      </div>
    </main>
  );
}
