export interface MultipleChoiceQuestion {
  type: "multiple_choice";
  question: string;
  options: string[];
  answer: string;
}

export interface ShortAnswerQuestion {
  type: "short_answer";
  question: string;
  answer: string;
}

export interface EssayQuestion {
  type: "essay";
  question: string;
  guidelines: string;
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion | EssayQuestion;

export interface GenerateRequest {
  text?: string;
  image?: string;
  prompt?: string;
}

export interface GenerateResponse {
  questions: Question[];
}
