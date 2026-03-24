"use client";

/**
 * 펭귄 도트 마스코트 - 브랜드 아이덴티티
 * 픽셀아트 스타일의 귀여운 펭귄
 */
export default function PenguinDot({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* 머리 윗부분 (검정) */}
      <rect x="5" y="1" width="6" height="1" fill="#3f3f46" />
      <rect x="4" y="2" width="8" height="1" fill="#3f3f46" />
      <rect x="3" y="3" width="10" height="1" fill="#3f3f46" />

      {/* 눈 줄 */}
      <rect x="3" y="4" width="2" height="1" fill="#3f3f46" />
      <rect x="5" y="4" width="1" height="1" fill="#e4e4e7" /> {/* 왼쪽 눈 흰자 */}
      <rect x="6" y="4" width="1" height="1" fill="#18181b" /> {/* 왼쪽 눈동자 */}
      <rect x="7" y="4" width="2" height="1" fill="#3f3f46" />
      <rect x="9" y="4" width="1" height="1" fill="#e4e4e7" /> {/* 오른쪽 눈 흰자 */}
      <rect x="10" y="4" width="1" height="1" fill="#18181b" /> {/* 오른쪽 눈동자 */}
      <rect x="11" y="4" width="2" height="1" fill="#3f3f46" />

      {/* 부리 줄 */}
      <rect x="3" y="5" width="3" height="1" fill="#3f3f46" />
      <rect x="6" y="5" width="1" height="1" fill="#f59e0b" /> {/* 부리 왼 */}
      <rect x="7" y="5" width="2" height="1" fill="#f97316" /> {/* 부리 중 */}
      <rect x="9" y="5" width="1" height="1" fill="#f59e0b" /> {/* 부리 오 */}
      <rect x="10" y="5" width="3" height="1" fill="#3f3f46" />

      {/* 몸통 (배 흰색 + 옆 검정) */}
      <rect x="3" y="6" width="2" height="1" fill="#3f3f46" />
      <rect x="5" y="6" width="6" height="1" fill="#d4d4d8" />
      <rect x="11" y="6" width="2" height="1" fill="#3f3f46" />

      <rect x="2" y="7" width="2" height="1" fill="#3f3f46" />
      <rect x="4" y="7" width="8" height="1" fill="#e4e4e7" />
      <rect x="12" y="7" width="2" height="1" fill="#3f3f46" />

      <rect x="2" y="8" width="2" height="1" fill="#3f3f46" />
      <rect x="4" y="8" width="8" height="1" fill="#e4e4e7" />
      <rect x="12" y="8" width="2" height="1" fill="#3f3f46" />

      <rect x="2" y="9" width="2" height="1" fill="#3f3f46" />
      <rect x="4" y="9" width="8" height="1" fill="#d4d4d8" />
      <rect x="12" y="9" width="2" height="1" fill="#3f3f46" />

      <rect x="3" y="10" width="2" height="1" fill="#3f3f46" />
      <rect x="5" y="10" width="6" height="1" fill="#d4d4d8" />
      <rect x="11" y="10" width="2" height="1" fill="#3f3f46" />

      {/* 하단 몸통 */}
      <rect x="4" y="11" width="8" height="1" fill="#3f3f46" />

      {/* 발 */}
      <rect x="4" y="12" width="2" height="1" fill="#f97316" />
      <rect x="10" y="12" width="2" height="1" fill="#f97316" />
    </svg>
  );
}

/**
 * 펭귄 로딩 애니메이션 - 문제 생성 중 표시
 */
export function PenguinLoading({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* 펭귄 3마리가 통통 뛰는 애니메이션 */}
        <div className="flex items-end gap-2">
          <div className="animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }}>
            <PenguinDot size={32} />
          </div>
          <div className="animate-bounce" style={{ animationDelay: "200ms", animationDuration: "0.8s" }}>
            <PenguinDot size={28} />
          </div>
          <div className="animate-bounce" style={{ animationDelay: "400ms", animationDuration: "0.8s" }}>
            <PenguinDot size={24} />
          </div>
        </div>
      </div>
      {message && (
        <p className="text-zinc-500 text-xs">{message}</p>
      )}
      {/* 로딩 도트 */}
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: "300ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" style={{ animationDelay: "600ms" }} />
      </div>
    </div>
  );
}
