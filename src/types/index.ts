export interface ImageCrop {
  top: number;    // % (0-100)
  left: number;   // % (0-100)
  width: number;  // % (0-100)
  height: number; // % (0-100)
}

export interface MultipleChoiceQuestion {
  type: "multiple_choice";
  question: string;
  options: string[];
  answer: string;
  image_url?: string;
  image_crop?: ImageCrop;
}

export interface ShortAnswerQuestion {
  type: "short_answer";
  question: string;
  answer: string;
  image_url?: string;
  image_crop?: ImageCrop;
}

export interface EssayQuestion {
  type: "essay";
  question: string;
  guidelines: string;
  image_url?: string;
  image_crop?: ImageCrop;
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
