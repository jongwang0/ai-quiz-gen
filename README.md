# AI Quiz Generator

텍스트 또는 이미지를 입력하면 AI가 CBT(컴퓨터 기반 시험) 형식의 문제를 자동 생성하는 웹 애플리케이션입니다.

**배포 URL:** [ai-quiz-gen-mocha.vercel.app](https://ai-quiz-gen-mocha.vercel.app)

## 주요 기능

- **텍스트/이미지 입력** — 교재, 강의 노트 등을 텍스트로 붙여넣거나 이미지로 업로드
- **대량 이미지 업로드** — 최대 200장, 자동 압축 + 배치 처리로 대량 이미지 지원
- **AI 문제 생성** — 객관식, 주관식, 서술형 문제를 자동 생성 (순서 무작위)
- **프롬프트 커스터마이즈** — 문제 수, 출제 규칙을 자유롭게 수정
- **문제 풀이 모드** — 생성된 문제를 직접 풀 수 있는 전용 화면 (5문제씩 페이지네이션)
- **자동 채점** — 풀이 완료 후 정답과 사용자 답을 비교 표시
- **공유** — 생성된 문제 세트를 링크로 공유

## 비용

모든 서비스가 **무료 티어**로 운영됩니다:

| 서비스 | 플랜 | 비용 |
|--------|------|------|
| AI 모델 | Gemini 2.0 Flash (OpenRouter 무료) | $0 |
| 데이터베이스 | Supabase Free | $0 |
| 호스팅 | Vercel Hobby | $0 |
| **합계** | | **$0/월** |

## 보안

- API Rate Limiting: 분당 30회 제한 (배치 처리 지원)
- 텍스트 입력: 최대 10,000자
- 이미지: 최대 200장 (클라이언트 자동 압축, 10장씩 배치 처리)
- Supabase RLS: INSERT/SELECT만 허용 (수정/삭제 불가)
- API 키는 서버 사이드에서만 사용

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| AI | OpenRouter API (Gemini 2.0 Flash - 무료) |
| 데이터베이스 | Supabase (PostgreSQL) |
| 배포 | Vercel |
| 디자인 | Glassmorphism + Monochrome |

## 로컬 개발

```bash
npm install
cp .env.local.example .env.local
# .env.local 파일에 실제 키 입력
npm run dev
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `OPENROUTER_API_KEY` | OpenRouter API 키 (무료 모델 사용 가능) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 페이지
│   ├── [sessionId]/page.tsx  # 공유 세션 페이지
│   └── api/
│       ├── generate/route.ts # AI 문제 생성 API (Rate Limited)
│       └── sessions/route.ts # 세션 저장/로드 API
├── components/
│   ├── Header.tsx            # 앱 헤더
│   ├── InputCard.tsx         # 입력 카드 (텍스트/이미지)
│   ├── PromptEditor.tsx      # 프롬프트 편집기
│   └── QuizPage.tsx          # 문제 풀이 + 채점 페이지
├── lib/
│   ├── imageCompress.ts      # 클라이언트 이미지 압축
│   ├── openrouter.ts         # OpenRouter API 래퍼
│   ├── prompts.ts            # 기본 시스템 프롬프트
│   └── supabase.ts           # Supabase 클라이언트
└── types/
    └── index.ts              # TypeScript 타입 정의
```

## 문제 세트 공유 방법

1. 텍스트/이미지를 입력하고 **문제 생성** 클릭
2. 문제가 생성되면 자동으로 Supabase에 저장됨
3. 문제 풀이 화면 우측 상단의 **공유** 버튼 클릭 → 링크 복사
4. 복사된 링크를 다른 사람에게 전달

## 저장된 데이터 확인

Supabase 대시보드에서 확인:
1. [supabase.com/dashboard](https://supabase.com/dashboard) 접속
2. `ai-quiz-gen` 프로젝트 선택
3. 좌측 메뉴 **Table Editor** → `sessions` 테이블
4. 각 세션의 `questions` 컬럼에서 문제 내용 확인 가능
