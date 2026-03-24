export const PROMPT_SECTIONS = {
  questionCount: {
    label: "문제 수 설정",
    description: "각 유형별 생성할 문제 수를 지정합니다",
    defaultValue: `객관식 5문제 (각 4개 선택지, 정답 표시)
주관식 3문제 (모범답안 포함)
서술형 2문제 (채점 기준 포함)`,
  },
  rules: {
    label: "출제 규칙",
    description: "문제 생성 시 적용할 규칙을 지정합니다",
    defaultValue: `단순 암기가 아닌 이해도를 측정하는 문제를 출제하세요
객관식 오답 선택지는 그럴듯하게 만드세요
주관식은 간결하고 명확한 답을 제시하세요
서술형은 좋은 답안의 기준을 설명하세요
자료와 동일한 언어로 문제를 생성하세요
이미지 속 그래프/도표/다이어그램/참고 이미지가 있으면 해당 이미지를 참조하는 문제를 출제하세요`,
  },
} as const;

/** questionCount 텍스트에서 각 유형별 문제 수 파싱 */
function parseQuestionCounts(countText: string): { mc: number; sa: number; essay: number } {
  const mcMatch = countText.match(/객관식\s*(\d+)\s*문제/);
  const saMatch = countText.match(/주관식\s*(\d+)\s*문제/);
  const essayMatch = countText.match(/서술형\s*(\d+)\s*문제/);
  return {
    mc: mcMatch ? parseInt(mcMatch[1], 10) : 0,
    sa: saMatch ? parseInt(saMatch[1], 10) : 0,
    essay: essayMatch ? parseInt(essayMatch[1], 10) : 0,
  };
}

/** 유형별 문제 수에 따라 JSON 스키마 예시를 동적 생성 */
function buildJsonSchema(counts: { mc: number; sa: number; essay: number }): string {
  const examples: string[] = [];

  if (counts.mc > 0) {
    examples.push(`    {
      "type": "multiple_choice",
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A",
      "image_url": null,
      "image_crop": null
    }`);
  }

  if (counts.sa > 0) {
    examples.push(`    {
      "type": "short_answer",
      "question": "...",
      "answer": "...",
      "image_url": null,
      "image_crop": null
    }`);
  }

  if (counts.essay > 0) {
    examples.push(`    {
      "type": "essay",
      "question": "...",
      "guidelines": "...",
      "image_url": null,
      "image_crop": null
    }`);
  }

  return `{
  "questions": [
${examples.join(",\n")}
  ]
}`;
}

/** 0문제인 유형에 대한 금지 규칙 생성 */
function buildExclusionRules(counts: { mc: number; sa: number; essay: number }): string {
  const rules: string[] = [];
  if (counts.mc === 0) rules.push('- 객관식(multiple_choice) 문제를 절대 생성하지 마세요. type이 "multiple_choice"인 문제가 하나라도 있으면 안 됩니다');
  if (counts.sa === 0) rules.push('- 주관식(short_answer) 문제를 절대 생성하지 마세요. type이 "short_answer"인 문제가 하나라도 있으면 안 됩니다');
  if (counts.essay === 0) rules.push('- 서술형(essay) 문제를 절대 생성하지 마세요. type이 "essay"인 문제가 하나라도 있으면 안 됩니다');
  return rules.join("\n");
}

/** 프롬프트 빌드 */
export function buildPromptFromSections(questionCount: string, rulesText: string): string {
  const counts = parseQuestionCounts(questionCount);
  const schema = buildJsonSchema(counts);
  const exclusionRules = buildExclusionRules(counts);

  return `당신은 전문 시험 문제 출제자입니다. 제공된 자료(텍스트 또는 이미지)를 바탕으로 CBT(컴퓨터 기반 시험) 형식의 문제를 생성하세요.

생성할 문제 수:
${questionCount}

중요: 위에서 0문제로 지정된 유형은 절대 생성하지 마세요. 지정된 유형과 개수를 정확히 지켜야 합니다.

아래 JSON 형식으로만 응답하세요:
${schema}

규칙:
${rulesText.split("\n").map((r) => `- ${r}`).join("\n")}
${exclusionRules}
- 문제 순서를 무작위로 섞어서 출제하세요 (자료의 순서대로 출제하지 마세요)
- 여러 이미지가 제공된 경우 모든 이미지의 내용을 골고루 반영하세요
- 이미지 속에 그래프, 도표, 다이어그램, 참고 이미지 등 문제 출제에 활용할 수 있는 시각 자료가 있다면 반드시 해당 이미지를 참조하는 문제를 출제하세요. image_url에 "image_1" 형태로, image_crop에 해당 시각 자료의 위치를 백분율(%)로 지정하세요: {"top": 0~100, "left": 0~100, "width": 0~100, "height": 0~100}. 예: 이미지 상단 절반만 참조하려면 {"top": 0, "left": 0, "width": 100, "height": 50}. 문제 텍스트에는 "다음 이미지를 보고" 또는 "[이미지 참조]"를 포함하세요
- 정확히 지정된 문제 수만큼만 생성하세요. 그 이상 생성하지 마세요
- JSON 객체만 반환하세요 (마크다운 포맷 없이)`;
}

export const DEFAULT_PROMPT = buildPromptFromSections(
  PROMPT_SECTIONS.questionCount.defaultValue,
  PROMPT_SECTIONS.rules.defaultValue
);
