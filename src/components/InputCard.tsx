"use client";

import { useState, useRef } from "react";

type InputMode = "text" | "image";

interface InputCardProps {
  onGenerate: (data: { text?: string; images?: string[] }) => void;
  isLoading: boolean;
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

export default function InputCard({ onGenerate, isLoading }: InputCardProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (mode === "text" && text.trim()) {
      onGenerate({ text: text.trim() });
    } else if (mode === "image" && images.length > 0) {
      onGenerate({ images });
    }
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_SIZE
    );

    const skipped = Array.from(files).length - imageFiles.length;
    if (skipped > 0) {
      alert(`${skipped}개 파일이 건너뛰어졌습니다 (이미지가 아니거나 4MB 초과)`);
    }

    if (imageFiles.length === 0) return;

    // 최대 5장 제한
    const currentCount = images.length;
    const maxAdd = 5 - currentCount;
    if (maxAdd <= 0) {
      alert("이미지는 최대 5장까지 선택할 수 있습니다");
      return;
    }
    const filesToProcess = imageFiles.slice(0, maxAdd);
    if (filesToProcess.length < imageFiles.length) {
      alert(`최대 5장 제한으로 ${filesToProcess.length}장만 추가됩니다`);
    }

    const promises = filesToProcess.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(promises).then((results) => {
      setImages((prev) => [...prev, ...results]);
      setCurrentIndex(0);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const clearImages = () => {
    setImages([]);
    setCurrentIndex(0);
  };

  const removeCurrentImage = () => {
    setImages((prev) => prev.filter((_, i) => i !== currentIndex));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const canGenerate =
    (mode === "text" && text.trim().length > 0) ||
    (mode === "image" && images.length > 0);

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
          {images.length > 0 ? (
            <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10">
              <img
                src={images[currentIndex]}
                alt={`이미지 ${currentIndex + 1}`}
                className="w-full h-full object-contain bg-black/20"
              />

              {/* 인덱스 표시 */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 text-xs text-zinc-300">
                {currentIndex + 1} / {images.length}
              </div>

              {/* 컨트롤 버튼 */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button
                  onClick={removeCurrentImage}
                  className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
                  title="현재 이미지 삭제"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
                <button
                  onClick={clearImages}
                  className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
                  title="전체 삭제"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 좌우 화살표 */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))}
                    disabled={currentIndex === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}

              {/* 이미지 추가 버튼 */}
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 text-xs text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
                >
                  + 추가
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex gap-2">
              {/* 파일 선택 */}
              <label className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-400">이미지 선택</p>
                <p className="text-xs text-zinc-600 mt-1">여러 장 선택 가능</p>
              </label>

              {/* 폴더 선택 */}
              <label className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                <input
                  ref={folderInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                  {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
                />
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-400">폴더 선택</p>
                <p className="text-xs text-zinc-600 mt-1">폴더 내 이미지 전체</p>
              </label>
            </div>
          )}

          {/* 숨겨진 추가용 파일 인풋 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {mode === "text" && text.length > 0 ? `${text.length}자` : ""}
          {mode === "image" && images.length > 0 ? `${images.length}장 선택됨` : ""}
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
