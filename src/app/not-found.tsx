import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="glass p-12 text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-zinc-500">404</span>
        </div>
        <h1 className="text-lg font-medium text-zinc-200 mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          요청하신 페이지가 존재하지 않거나 삭제되었습니다.
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          &larr; 홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
