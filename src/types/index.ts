export interface MultipleChoiceQuestion {
  type: "multiple_choice";
  question: string;
  options: string[];
  answer: string;
  image_url?: string;  // 이미지 기반 문제용
}

export interface ShortAnswerQuestion {
  type: "short_answer";
  question: string;
  answer: string;
  image_url?: string;
}

export interface EssayQuestion {
  type: "essay";
  question: string;
  guidelines: string;
  image_url?: string;
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion | EssayQuestion;

export interface GenerateRequest {
  text?: string;
  images?: string[];
  prompt?: string;
}

export interface GenerateResponse {
  questions: Question[];
}
