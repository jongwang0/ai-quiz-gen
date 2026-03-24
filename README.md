# AI Quiz Generator

텍스트 또는 이미지를 입력하면 AI가 CBT(컴퓨터 기반 시험) 형식의 문제를 자동 생성하는 웹 애플리케이션입니다.

**배포 URL:** [ai-quiz-gen-mocha.vercel.app](https://ai-quiz-gen-mocha.vercel.app)

## 주요 기능

- **텍스트/이미지 입력** — 교재, 강의 노트 등을 텍스트로 붙여넣거나 이미지로 업로드
- **이미지 다중 선택** — 여러 이미지 동시 선택 또는 폴더 단위 불러오기
- **AI 문제 생성** — 객관식, 주관식, 서술형 문제를 자동 생성
- **프롬프트 커스터마이즈** — 문제 수, 출제 규칙을 자유롭게 수정
- **문제 풀이 모드** — 생성된 문제를 직접 풀 수 있는 전용 화면
- **자동 채점** — 풀이 완료 후 정답과 사용자 답을 비교 표시
- **공유** — 생성된 문제 세트를 링크로 공유

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| AI | OpenRouter API (Claude Opus 4.6) |
| 데이터베이스 | Supabase (PostgreSQL) |
| 배포 | Vercel |
| 디자인 | Glassmorphism + Monochrome |

## 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일에 실제 키 입력

# 개발 서버 실행
npm run dev
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `OPENROUTER_API_KEY` | OpenRouter API 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── [sessionId]/page.tsx  # 공유 세션 페이지
│   └── api/
│       ├── generate/route.ts # AI 문제 생성 API
│       └── sessions/route.ts # 세션 저장/로드 API
├── components/
│   ├── Header.tsx            # 앱 헤더
│   ├── InputCard.tsx         # 입력 카드 (텍스트/이미지)
│   ├── PromptEditor.tsx      # 프롬프트 편집기
│   └── QuizPage.tsx          # 문제 풀이 페이지
├── lib/
│   ├── openrouter.ts         # OpenRouter API 래퍼
│   ├── prompts.ts            # 기본 시스템 프롬프트
│   └── supabase.ts           # Supabase 클라이언트
└── types/
    └── index.ts              # TypeScript 타입 정의
```
