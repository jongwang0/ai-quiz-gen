"use client";

import PenguinDot from "@/components/PenguinDot";

export default function Header() {
  return (
    <header className="w-full py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto px-6">
        <a href="/" className="flex items-center gap-3 group w-fit">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/15 group-hover:scale-105 transition-all duration-300">
            <PenguinDot size={28} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
              AI Quiz Generator
            </h1>
            <p className="text-sm text-zinc-500">
              텍스트 또는 이미지로 CBT 문제를 생성하세요
            </p>
          </div>
        </a>
      </div>
    </header>
  );
}
