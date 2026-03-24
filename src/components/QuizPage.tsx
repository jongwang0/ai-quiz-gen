"use client";

import { useState, useMemo, useCallback } from "react";
import type { Question } from "@/types";

interface QuizPageProps {
  questions: Question[];
  sessionId?: string | null;
  onBack?: () => void;
}

const ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 10;

/** 참고 이미지 썸네일 + 클릭 확대 */
function QuestionImage({ src, onClickImage }: {
  src: string;
  onClickImage: (src: string) => void;
}) {
  return (
    <div className="mb-4 ml-4">
      <img
        src={src}
        alt="문제 참고 이미지"
        className="max-w-[300px] max-h-48 rounded-lg border border-white/10 object-contain bg-black/20 cursor-zoom-in hover:border-white/25 hover:shadow-lg transition-all"
        onClick={() => onClickImage(src)}
      />
      <p className="text-[10px] text-zinc-600 mt-1 ml-1">클릭하여 확대</p>
    </div>
  );
}

/** 이미지 라이트박스 모달 */
function ImageLightbox({ src, onClose }: {
  src: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="확대 이미지"
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl border border-white/20 shadow-2xl"
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function QuizPage({ questions, sessionId, onBack }: QuizPageProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string } | null>(null);

  const openLightbox = useCallback((src: string) => {
    setLightbox({ src });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
  const pageQuestions = questions.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // 페이지네이션에 보여줄 페이지 번호 범위 계산
  const visiblePageRange = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    let start = Math.max(0, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
    const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES);
    if (end - start < MAX_VISIBLE_PAGES) {
      start = Math.max(0, end - MAX_VISIBLE_PAGES);
    }
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const allAnswered = useMemo(() => {
    return questions.every((_, i) => answers[i] !== undefined && answers[i].trim() !== "");
  }, [answers, questions]);

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    questions.forEach((q, i) => {
      const userAnswer = (answers[i] || "").trim();
      if (q.type === "multiple_choice") {
        const userLetter = userAnswer.charAt(0).toUpperCase();
        if (userLetter === q.answer.charAt(0).toUpperCase()) correct++;
      }
    });
    return { correct, total: questions.filter((q) => q.type === "multiple_choice").length };
  }, [submitted, answers, questions]);

  const handleSelect = (questionIndex: number, value: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setCurrentPage(0);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentPage(0);
  };

  const handleShare = async () => {
    if (!sessionId) return;
    const url = `${window.location.origin}/${sessionId}`;
    await navigator.clipboard.writeText(url);
    alert("공유 링크가 복사되었습니다!");
  };

  const getGlobalIndex = (localIndex: number) =>
    currentPage * ITEMS_PER_PAGE + localIndex;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            돌아가기
          </button>
        ) : (
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            나도 문제 만들기
          </a>
        )}

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
          <span className="text-xs text-zinc-600">
            총 {questions.length}문제
          </span>
        </div>
      </div>

      {/* 채점 결과 */}
      {submitted && score && (
        <div className="glass p-5 mb-6 flex items-center justify-between animate-scale-in">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-1">채점 결과</h3>
            <p className="text-xs text-zinc-500">
              객관식 {score.correct}/{score.total} 정답
              {score.total > 0 && (
                <span className="ml-2 text-zinc-400">
                  ({Math.round((score.correct / score.total) * 100)}%)
                </span>
              )}
              <span className="ml-3 text-zinc-600">
                * 주관식·서술형은 모범답안과 비교하여 확인하세요
              </span>
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="btn-primary text-xs px-4 py-2"
          >
            다시 풀기
          </button>
        </div>
      )}

      {/* 문제 목록 */}
      <div className="space-y-4">
        {pageQuestions.map((q, localIdx) => {
          const globalIdx = getGlobalIndex(localIdx);
          return (
            <div key={globalIdx} className="glass p-5 animate-slide-up glass-hover" style={{ animationDelay: `${localIdx * 0.05}s` }}>
              {/* 문제 유형 뱃지 */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  q.type === "multiple_choice"
                    ? "bg-zinc-700/50 text-zinc-300"
                    : q.type === "short_answer"
                    ? "bg-zinc-700/30 text-zinc-400"
                    : "bg-zinc-800/50 text-zinc-500"
                }`}>
                  {q.type === "multiple_choice" ? "객관식" : q.type === "short_answer" ? "주관식" : "서술형"}
                </span>
              </div>

              {/* 문제 */}
              <p className="text-sm text-zinc-200 mb-4">
                <span className="text-zinc-500 mr-2 font-medium">{globalIdx + 1}.</span>
                {q.question}
              </p>

              {/* 이미지가 있는 문제 */}
              {q.image_url && q.image_url.startsWith("data:") && (
                <QuestionImage
                  src={q.image_url}
                  onClickImage={openLightbox}
                />
              )}

              {/* 객관식 선택지 */}
              {q.type === "multiple_choice" && (
                <div className="space-y-2 ml-4">
                  {q.options.map((opt, j) => {
                    const isSelected = answers[globalIdx] === opt;
                    const optionLetter = opt.charAt(0).toUpperCase();
                    const isCorrect = optionLetter === q.answer.charAt(0).toUpperCase();

                    let className = "text-xs px-3 py-2.5 rounded-lg cursor-pointer transition-all border ";
                    if (submitted) {
                      if (isCorrect) {
                        className += "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
                      } else if (isSelected && !isCorrect) {
                        className += "bg-red-500/15 text-red-300 border-red-500/30";
                      } else {
                        className += "text-zinc-500 border-transparent";
                      }
                    } else if (isSelected) {
                      className += "bg-white/10 text-zinc-200 border-white/20";
                    } else {
                      className += "text-zinc-400 border-transparent hover:bg-white/5 hover:border-white/10";
                    }

                    return (
                      <div
                        key={j}
                        className={className}
                        onClick={() => handleSelect(globalIdx, opt)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? submitted
                                ? isCorrect
                                  ? "border-emerald-400 bg-emerald-400"
                                  : "border-red-400 bg-red-400"
                                : "border-white/40 bg-white/20"
                              : submitted && isCorrect
                              ? "border-emerald-400 bg-emerald-400"
                              : "border-white/20"
                          }`}>
                            {(isSelected || (submitted && isCorrect)) && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </div>
                    );
                  })}
                  {submitted && answers[globalIdx] && (
                    <p className="text-xs text-zinc-600 mt-2 ml-6">
                      내 답: {answers[globalIdx]?.split(". ").slice(0, 1)}
                      {" → "}
                      정답: {q.answer}
                    </p>
                  )}
                </div>
              )}

              {/* 주관식 입력 */}
              {q.type === "short_answer" && (
                <div className="ml-4">
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/25 transition-all disabled:opacity-60"
                    placeholder="답을 입력하세요..."
                    value={answers[globalIdx] || ""}
                    onChange={(e) => handleSelect(globalIdx, e.target.value)}
                    disabled={submitted}
                  />
                  {submitted && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-zinc-500">
                        <span className="text-zinc-400">내 답:</span> {answers[globalIdx] || "(미입력)"}
                      </p>
                      <p className="text-xs text-emerald-400/70 border-l border-emerald-500/30 pl-3">
                        모범답안: {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 서술형 입력 */}
              {q.type === "essay" && (
                <div className="ml-4">
                  <textarea
                    className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-white/25 transition-all disabled:opacity-60"
                    placeholder="답을 작성하세요..."
                    value={answers[globalIdx] || ""}
                    onChange={(e) => handleSelect(globalIdx, e.target.value)}
                    disabled={submitted}
                  />
                  {submitted && (
                    <div className="mt-2">
                      <p className="text-xs text-emerald-400/70 border-l border-emerald-500/30 pl-3">
                        채점 기준: {q.guidelines}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 네비게이션 */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          이전
        </button>

        <div className="flex items-center gap-1">
          {/* 첫 페이지로 */}
          {visiblePageRange[0] > 0 && (
            <>
              <button
                onClick={() => setCurrentPage(0)}
                className="w-8 h-8 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
              >
                1
              </button>
              {visiblePageRange[0] > 1 && (
                <span className="text-zinc-600 text-xs px-1">...</span>
              )}
            </>
          )}

          {visiblePageRange.map((i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                i === currentPage
                  ? "bg-white/10 text-zinc-200 border border-white/20"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* 마지막 페이지로 */}
          {visiblePageRange[visiblePageRange.length - 1] < totalPages - 1 && (
            <>
              {visiblePageRange[visiblePageRange.length - 1] < totalPages - 2 && (
                <span className="text-zinc-600 text-xs px-1">...</span>
              )}
              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                className="w-8 h-8 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentPage === totalPages - 1 && !submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {allAnswered ? "채점하기" : `미답변 ${questions.length - Object.keys(answers).length}개`}
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              다음
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 페이지 인덱스 텍스트 */}
      <p className="text-center text-xs text-zinc-600 mt-3">
        {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, questions.length)}번 / 총 {questions.length}문제
      </p>

      {/* 이미지 라이트박스 */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
