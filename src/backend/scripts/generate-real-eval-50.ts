import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type TheoryChunk = {
  id: string;
  subject: string;
  grade?: number;
  topic?: string;
  chapter?: string;
  lessonId?: string;
  type?: string;
  title?: string;
  text: string;
};

type EvalQuestionType =
  | 'definition'
  | 'formula'
  | 'concept'
  | 'calculation'
  | 'phenomenon/experiment'
  | 'comparison'
  | 'cross-topic-noise';

type EvalCase = {
  id: string;
  question: string;
  subject: string;
  grade?: number;
  topic?: string;
  chapter?: string;
  lessonId?: string;
  questionType: EvalQuestionType;
  expectedChunkIds: string[];
  expectedConcepts: string[];
  expectedNumericAnswer?: {
    value: number;
    unit?: string;
    tolerance?: number;
  };
  validationStatus: 'needs_review';
  sourceChunkExcerpt: string;
  expected: {
    relevant_chunk_ids: string[];
    answer: {
      type: 'conceptual' | 'numeric' | 'mixed';
      value?: number;
      unit?: string;
      tolerance?: number;
      reference_answer?: string;
      required_concepts: { label: string; anyOf: string[] }[];
    };
  };
};

const WORKSPACE_ROOT = join(process.cwd(), '..', '..', '..');
const SPLIT_PREVIEW_PATH = join(
  WORKSPACE_ROOT,
  'data',
  'structured',
  'generated',
  'split-preview',
  'theory-chunks.json',
);
const SMOKE_CASES_PATH = join(
  process.cwd(),
  '..',
  '..',
  'data',
  'eval',
  'rag-smoke-cases.json',
);
const OUTPUT_DIR = join(WORKSPACE_ROOT, 'data', 'eval');
const OUTPUT_JSON = join(OUTPUT_DIR, 'real-eval-50.preview.json');
const OUTPUT_REVIEW = join(OUTPUT_DIR, 'real-eval-50.review.md');

const GENERATED_PLAN: Array<{
  subject: 'physics' | 'chemistry' | 'math';
  count: number;
  types: EvalQuestionType[];
}> = [
  {
    subject: 'physics',
    count: 15,
    types: [
      'definition',
      'formula',
      'concept',
      'calculation',
      'phenomenon/experiment',
      'comparison',
      'cross-topic-noise',
      'formula',
      'concept',
      'definition',
      'calculation',
      'phenomenon/experiment',
      'comparison',
      'formula',
      'concept',
    ],
  },
  {
    subject: 'chemistry',
    count: 15,
    types: [
      'definition',
      'formula',
      'concept',
      'comparison',
      'cross-topic-noise',
      'definition',
      'formula',
      'concept',
      'phenomenon/experiment',
      'comparison',
      'definition',
      'formula',
      'concept',
      'calculation',
      'cross-topic-noise',
    ],
  },
  {
    subject: 'math',
    count: 10,
    types: [
      'definition',
      'formula',
      'concept',
      'calculation',
      'comparison',
      'cross-topic-noise',
      'formula',
      'concept',
      'definition',
      'formula',
    ],
  },
];

async function main() {
  const chunks = JSON.parse(await readFile(SPLIT_PREVIEW_PATH, 'utf8')) as TheoryChunk[];
  const smokeCases = normalizeSmokeCases(
    JSON.parse(await readFile(SMOKE_CASES_PATH, 'utf8')) as EvalCase[],
    chunks,
  );
  const selectedIds = new Set(smokeCases.flatMap((item) => item.expectedChunkIds));
  const generated: EvalCase[] = [];

  for (const plan of GENERATED_PLAN) {
    const subjectChunks = chunks
      .filter((chunk) => chunk.subject === plan.subject)
      .filter((chunk) => !selectedIds.has(chunk.id))
      .filter(isUsableChunk)
      .sort(compareChunks);

    for (let index = 0; index < plan.count; index += 1) {
      const questionType = plan.types[index];
      const chunk = pickChunk(subjectChunks, questionType, generated, selectedIds);
      if (!chunk) {
        throw new Error(`Unable to pick ${plan.subject} chunk for ${questionType}`);
      }

      selectedIds.add(chunk.id);
      generated.push(buildGeneratedCase(chunk, questionType, index + 1));
    }
  }

  const cases = [...smokeCases, ...generated];
  validateCases(cases);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_JSON, `${JSON.stringify(cases, null, 2)}\n`, 'utf8');
  await writeFile(OUTPUT_REVIEW, `${buildReviewMarkdown(cases)}\n`, 'utf8');

  console.log(`Wrote ${cases.length} eval cases to ${OUTPUT_JSON}`);
  console.log(`Wrote review report to ${OUTPUT_REVIEW}`);
  console.log(JSON.stringify(counts(cases), null, 2));
}

function normalizeSmokeCases(rawCases: EvalCase[], chunks: TheoryChunk[]): EvalCase[] {
  const chunksById = new Map(chunks.map((chunk) => [chunk.id, chunk]));

  return rawCases.map((rawCase, index) => {
    const expectedChunkIds =
      rawCase.expectedChunkIds ??
      rawCase.expected?.relevant_chunk_ids ??
      [];
    const sourceChunk = chunksById.get(expectedChunkIds[0]);
    const answer = rawCase.expected.answer;
    const expectedNumericAnswer =
      typeof answer.value === 'number'
        ? {
            value: answer.value,
            ...(answer.unit ? { unit: answer.unit } : {}),
            ...(typeof answer.tolerance === 'number'
              ? { tolerance: answer.tolerance }
              : {}),
          }
        : undefined;

    return {
      ...rawCase,
      id: rawCase.id ?? `REAL_EVAL50_PHY_SMOKE_${String(index + 1).padStart(3, '0')}`,
      questionType: inferSmokeQuestionType(rawCase, answer),
      expectedChunkIds,
      expectedConcepts: conceptLabels(answer.required_concepts),
      ...(expectedNumericAnswer ? { expectedNumericAnswer } : {}),
      validationStatus: 'needs_review',
      sourceChunkExcerpt:
        rawCase.sourceChunkExcerpt ?? truncate(sourceChunk?.text ?? '', 700),
      expected: {
        relevant_chunk_ids: expectedChunkIds,
        answer,
      },
    };
  });
}

function buildGeneratedCase(
  chunk: TheoryChunk,
  questionType: EvalQuestionType,
  sequence: number,
): EvalCase {
  const subjectCode = chunk.subject.slice(0, 4).toUpperCase();
  const concepts = extractConcepts(chunk);
  const requiredConcepts = concepts.map((concept) => ({
    label: concept,
    anyOf: [concept],
  }));
  const referenceAnswer = truncate(firstInformativeText(chunk.text), 500);

  return {
    id: `REAL_EVAL50_${subjectCode}_${String(sequence).padStart(3, '0')}`,
    question: buildQuestion(chunk, questionType),
    subject: chunk.subject,
    ...(typeof chunk.grade === 'number' ? { grade: chunk.grade } : {}),
    ...(chunk.topic ? { topic: chunk.topic } : {}),
    ...(chunk.chapter ? { chapter: chunk.chapter } : {}),
    ...(chunk.lessonId ? { lessonId: chunk.lessonId } : {}),
    questionType,
    expectedChunkIds: [chunk.id],
    expectedConcepts: concepts,
    validationStatus: 'needs_review',
    sourceChunkExcerpt: truncate(chunk.text, 900),
    expected: {
      relevant_chunk_ids: [chunk.id],
      answer: {
        type: 'conceptual',
        reference_answer: referenceAnswer,
        required_concepts: requiredConcepts,
      },
    },
  };
}

function buildQuestion(chunk: TheoryChunk, questionType: EvalQuestionType) {
  const title = cleanTitle(chunk.title ?? chunk.topic ?? chunk.id);

  switch (questionType) {
    case 'definition':
      return `Theo học liệu, ${title} là gì?`;
    case 'formula':
      return `Nêu công thức hoặc quan hệ chính được trình bày trong mục ${title}.`;
    case 'concept':
      return `Trình bày ý chính của mục ${title}.`;
    case 'calculation':
      return `Trong mục ${title}, bài hoặc công thức đang yêu cầu xác định đại lượng nào và dựa trên quan hệ nào?`;
    case 'phenomenon/experiment':
      return `Mô tả hiện tượng hoặc thí nghiệm được nêu trong mục ${title}.`;
    case 'comparison':
      return `So sánh các khái niệm hoặc đại lượng chính được nêu trong mục ${title}.`;
    case 'cross-topic-noise':
      return `Bỏ qua các từ gây nhiễu như dao động, acid, phương trình bậc hai; theo đúng mục ${title}, nội dung chính là gì?`;
  }
}

function pickChunk(
  chunks: TheoryChunk[],
  questionType: EvalQuestionType,
  generated: EvalCase[],
  selectedIds: Set<string>,
) {
  const preferredTypes = preferredChunkTypes(questionType);
  const usedTopics = new Set(generated.map((item) => `${item.subject}:${item.topic}`));

  return (
    chunks.find(
      (chunk) =>
        !selectedIds.has(chunk.id) &&
        preferredTypes.includes(chunk.type ?? '') &&
        !usedTopics.has(`${chunk.subject}:${chunk.topic}`),
    ) ??
    chunks.find(
      (chunk) =>
        !selectedIds.has(chunk.id) &&
        preferredTypes.includes(chunk.type ?? ''),
    ) ??
    chunks.find((chunk) => !selectedIds.has(chunk.id))
  );
}

function preferredChunkTypes(questionType: EvalQuestionType) {
  switch (questionType) {
    case 'definition':
      return ['definition', 'concept', 'explanation'];
    case 'formula':
      return ['formula', 'explanation', 'definition'];
    case 'concept':
      return ['concept', 'explanation', 'definition'];
    case 'calculation':
      return ['exercise', 'worked_example', 'formula', 'explanation'];
    case 'phenomenon/experiment':
      return ['experiment', 'explanation', 'figure_description'];
    case 'comparison':
      return ['explanation', 'definition', 'formula'];
    case 'cross-topic-noise':
      return ['definition', 'formula', 'explanation', 'concept'];
  }
}

function extractConcepts(chunk: TheoryChunk) {
  const candidates = [
    ...extractBoldPhrases(chunk.text),
    cleanTitle(chunk.title ?? ''),
    ...extractFormulaLines(chunk.text),
    ...firstSentencePhrases(chunk.text),
  ]
    .map(cleanConcept)
    .filter((value) => value.length >= 3 && value.length <= 90)
    .filter((value) => !isGenericTitle(value));

  return [...new Set(candidates)].slice(0, 3);
}

function extractBoldPhrases(text: string) {
  return [...text.matchAll(/\*\*([^*]{3,90})\*\*/g)].map((match) => match[1]);
}

function extractFormulaLines(text: string) {
  const formulas: string[] = [];
  for (const block of text.matchAll(/\$\$([\s\S]*?)\$\$/g)) {
    const formula = block[1].replace(/\\tag\{[^}]+\}/g, '').trim();
    if (formula) {
      formulas.push(formula);
    }
  }

  return formulas;
}

function firstSentencePhrases(text: string) {
  const first = firstInformativeText(text);
  const sentence = first.split(/[.!?。]\s+/)[0] ?? first;

  return sentence
    .split(/[,;:()\n-]+/)
    .map((part) => part.trim())
    .filter((part) => part.split(/\s+/).length >= 2)
    .slice(0, 3);
}

function firstInformativeText(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^>\s*/, '').trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('!['))
    .filter((line) => !line.startsWith('---'))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsableChunk(chunk: TheoryChunk) {
  const text = firstInformativeText(chunk.text);

  return (
    Boolean(chunk.id && chunk.subject && chunk.text) &&
    text.length >= 120 &&
    !isGenericTitle(cleanTitle(chunk.title ?? '')) &&
    !text.includes('Cần bổ sung') &&
    !text.includes('Cần đối chiếu') &&
    !text.includes('ảnh gốc')
  );
}

function compareChunks(left: TheoryChunk, right: TheoryChunk) {
  const scoreDelta = chunkQualityScore(right) - chunkQualityScore(left);

  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return left.id.localeCompare(right.id);
}

function chunkQualityScore(chunk: TheoryChunk) {
  const typeScore: Record<string, number> = {
    definition: 9,
    formula: 8,
    concept: 8,
    explanation: 7,
    experiment: 6,
    worked_example: 5,
    exercise: 4,
    note: 3,
    figure_description: 2,
  };

  return (typeScore[chunk.type ?? ''] ?? 1) + Math.min(4, chunk.text.length / 600);
}

function validateCases(cases: EvalCase[]) {
  if (cases.length !== 50) {
    throw new Error(`Expected 50 cases, got ${cases.length}`);
  }

  for (const item of cases) {
    if (!item.expectedChunkIds.length) {
      throw new Error(`${item.id} has no expectedChunkIds`);
    }
    if (item.validationStatus !== 'needs_review') {
      throw new Error(`${item.id} must be needs_review`);
    }
    if (!item.expected.relevant_chunk_ids.length) {
      throw new Error(`${item.id} has no evaluator gold labels`);
    }
    if (!item.expected.answer.required_concepts.length) {
      throw new Error(`${item.id} has no expected concepts`);
    }
  }
}

function buildReviewMarkdown(cases: EvalCase[]) {
  return [
    '# Real Eval 50 Gold Label Review',
    '',
    '- Generated from existing theory chunks only.',
    '- All cases are preview metadata and marked `needs_review`.',
    '- Check each box only after a human confirms the question and gold chunk are appropriate.',
    '',
    ...cases.flatMap((item) => [
      `## [ ] ${item.id}`,
      '',
      `- Subject: ${item.subject}`,
      `- Grade: ${item.grade ?? 'N/A'}`,
      `- Topic: ${item.topic ?? 'N/A'}`,
      `- Question type: ${item.questionType}`,
      `- Question: ${item.question}`,
      `- Expected chunk IDs: ${item.expectedChunkIds.join(', ')}`,
      `- Expected concepts: ${item.expectedConcepts.join('; ')}`,
      item.expectedNumericAnswer
        ? `- Expected numeric: ${item.expectedNumericAnswer.value} ${item.expectedNumericAnswer.unit ?? ''}`
        : '- Expected numeric: N/A',
      '',
      'Source excerpt:',
      '',
      '```text',
      item.sourceChunkExcerpt,
      '```',
      '',
      'Reviewer notes:',
      '',
      '- ',
      '',
    ]),
  ].join('\n');
}

function counts(cases: EvalCase[]) {
  const bySubject: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const item of cases) {
    bySubject[item.subject] = (bySubject[item.subject] ?? 0) + 1;
    byType[item.questionType] = (byType[item.questionType] ?? 0) + 1;
  }

  return { bySubject, byType };
}

function inferSmokeQuestionType(
  item: EvalCase,
  answer: EvalCase['expected']['answer'],
): EvalQuestionType {
  const question = normalize(item.question);

  if (answer.value !== undefined || question.includes('tinh')) {
    return 'calculation';
  }
  if (question.includes('cong thuc') || question.includes('phuong trinh')) {
    return 'formula';
  }
  if (question.includes('dieu kien') || question.includes('so sanh')) {
    return 'comparison';
  }

  return 'concept';
}

function conceptLabels(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (typeof value === 'string') {
        return value;
      }
      if (value && typeof value === 'object' && 'label' in value) {
        return String((value as { label: unknown }).label);
      }
      return '';
    })
    .map(cleanConcept)
    .filter(Boolean);
}

function isGenericTitle(value: string) {
  const normalized = normalize(value);

  return (
    !normalized ||
    [
      'muc tieu',
      'mo dau',
      'cau hoi',
      'em da hoc',
      'em co the',
      'hinh',
      'noi dung hinh',
    ].some((generic) => normalized === generic || normalized.startsWith(`${generic} `))
  );
}

function cleanTitle(value: string) {
  return value.replace(/\s+/g, ' ').replace(/^[0-9IVX.]+\s*/, '').trim();
}

function cleanConcept(value: string) {
  return value
    .replace(/[`*_>#|]/g, '')
    .replace(/\$+/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
