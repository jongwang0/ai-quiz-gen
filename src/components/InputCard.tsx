"use client";

import { useState, useRef } from "react";

type InputMode = "text" | "image";

interface InputCardProps {
  onGenerate: (data: { text?: string; image?: string }) => void;
  isLoading: boolean;
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

export default function InputCard({ onGenerate, isLoading }: InputCardProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (mode === "text" && text.trim()) {
      onGenerate({ text: text.trim() });
    } else if (mode === "image" && imageData) {
      onGenerate({ image: imageData });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("이미지 크기는 4MB 이하여야 합니다");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageData(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageData(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canGenerate =
    (mode === "text" && text.trim().length > 0) ||
    (mode === "image" && imageData !== null);

  return (
    <div className="glass p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          입력 소스
        </h2>
        <div className="flex gap-1">
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              mode === "text"
                ? "bg-white/10 text-zinc-300 border border-white/20"
                : "text-zinc-500 border border-transparent hover:border-white/10"
            }`}
            onClick={() => setMode("text")}
          >
            텍스트
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              mode === "image"
                ? "bg-white/10 text-zinc-300 border border-white/20"
                : "text-zinc-500 border border-transparent hover:border-white/10"
            }`}
            onClick={() => setMode("image")}
          >
            이미지
          </button>
        </div>
      </div>

      {mode === "text" ? (
        <textarea
          className="flex-1 min-h-[300px] w-full bg-white/5 border border-white/10 rounded-xl p-4 text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all"
          placeholder={"문제를 생성할 텍스트를 입력하세요...\n\n예: 교과서 내용, 강의 노트, 위키피디아 문서 등"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <div className="flex-1 min-h-[300px] flex flex-col">
          {imagePreview ? (
            <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10">
              <img
                src={imagePreview}
                alt="업로드된 이미지"
                className="w-full h-full object-contain bg-black/20"
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">클릭하여 이미지 업로드</p>
              <p className="text-xs text-zinc-600 mt-1">PNG, JPG, WEBP (최대 4MB)</p>
            </label>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {mode === "text" && text.length > 0 ? `${text.length}자` : ""}
          {mode === "image" && imageData ? "이미지 준비됨" : ""}
        </span>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              생성 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              문제 생성
            </>
          )}
        </button>
      </div>
    </div>
  );
}
