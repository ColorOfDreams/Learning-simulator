import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DataSource, In } from 'typeorm';
import { AppModule } from '../src/app.module';
import {
  RagReference,
  RagRetrievalService,
} from '../src/modules/ai/rag-retrieval.service';
import { calculateRetrievalCaseMetrics } from '../src/modules/ai/evaluation/retrieval-metrics';
import { readExpectedEvaluationData } from '../src/modules/ai/evaluation/eval-utils';
import { TheoryChunkEntity } from '../src/modules/learning/theory-chunk/theory-chunk.entity';

type EvalCase = {
  id?: unknown;
  caseId?: unknown;
  case_id?: unknown;
  question?: unknown;
  input?: unknown;
  message?: unknown;
  prompt?: unknown;
  subject?: unknown;
  grade?: unknown;
  topic?: unknown;
  chapter?: unknown;
  lessonId?: unknown;
  lesson_id?: unknown;
  questionType?: unknown;
  validationStatus?: unknown;
  expectedChunkIds?: unknown;
  expected?: unknown;
};

type ChunkMetadata = {
  id: string;
  subject?: string;
  grade?: number;
  chapter?: string;
  lessonId?: string;
  lessonTitle?: string;
  topic?: string;
  title?: string;
  validationStatus?: string;
  type?: string;
  metadata?: unknown;
  keywords?: string[];
  text?: string;
};

type RetrievedChunkDiagnostic = {
  rank: number;
  id: string;
  subject?: string;
  grade?: number;
  chapter?: string;
  lessonId?: string;
  lessonTitle?: string;
  sectionOrTitle?: string;
  validationStatus?: string;
  scoreBreakdown: ScoreBreakdown;
  retrievalType?: string;
  excerpt: string;
};

type ScoreBreakdown = {
  score?: number;
  finalScore?: number;
  vectorScore?: number;
  keywordScore?: number;
  conceptScore?: number;
  conceptBoost?: number;
  titleBoost?: number;
  metadataBoost?: number;
  formulaBoost?: number;
  textBoost?: number;
  topicBoost?: number;
  subjectBoost?: number;
  gradeBoost?: number;
  chapterBoost?: number;
  lessonBoost?: number;
  sectionBoost?: number;
  validationBoost?: number;
};

type GoldLabelReviewFlag =
  | 'expected_subject_mismatch'
  | 'expected_grade_mismatch'
  | 'expected_chunk_too_short_or_noisy'
  | 'expected_chunk_missing_question_keywords'
  | 'candidate_may_be_better_than_gold';

type CaseDiagnostic = {
  testCaseId: string;
  subject?: string;
  grade?: number;
  questionType?: string;
  topic?: string;
  chapter?: string;
  lessonId?: string;
  question: string;
  expectedChunkIds: string[];
  retrievedTop10ChunkIds: string[];
  bestGoldRank: number | null;
  metrics: {
    hitAt1: number;
    hitAt3: number;
    hitAt5: number;
    recallAt5: number;
    precisionAt5: number;
    reciprocalRank: number;
  };
  top10Chunks: RetrievedChunkDiagnostic[];
  errorClassification: string[];
  goldLabelReviewFlags: GoldLabelReviewFlag[];
};

type GroupMetrics = {
  cases: number;
  hitAt1: number;
  hitAt3: number;
  hitAt5: number;
  recallAt5: number;
  mrr: number;
  goldNotInTop10: number;
};

type DiagnosticReport = {
  generatedAt: string;
  evalFile: string;
  summary: {
    totalCases: number;
    metricsOverall: GroupMetrics;
    metricsBySubject: Record<string, GroupMetrics>;
    metricsByGrade: Record<string, GroupMetrics>;
    metricsByQuestionType: Record<string, GroupMetrics>;
    top1SubjectMismatchCount: number;
    top1NeedsReviewCount: number;
    goldNotInTop10Count: number;
    possibleBadGoldLabelCount: number;
  };
  worst15Cases: CaseDiagnostic[];
  cases: CaseDiagnostic[];
};

async function main() {
  const evalFile = resolveEvalFile();
  const testCases = await readJson<EvalCase[]>(evalFile);
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const ragRetrievalService = app.get(RagRetrievalService);
    const chunkRepository = app.get(DataSource).getRepository(TheoryChunkEntity);
    const cases: CaseDiagnostic[] = [];

    for (const testCase of testCases) {
      const question = readQuestion(testCase);
      const references = question
        ? await ragRetrievalService.retrieveTheoryChunks({
            message: question,
            subject: readSubject(testCase),
            grade: readGrade(testCase),
            topic: readTopic(testCase),
            chapter: readChapter(testCase),
            lessonId: readLessonId(testCase),
            questionType: readQuestionType(testCase),
            topK: 10,
          })
        : [];
      const expectedChunkIds = readExpectedChunkIds(testCase);
      const allChunkIds = [
        ...new Set([...expectedChunkIds, ...references.map((item) => item.id)]),
      ];
      const chunks = allChunkIds.length
        ? await chunkRepository.find({ where: { id: In(allChunkIds) } })
        : [];
      const chunksById = new Map<string, ChunkMetadata>(
        chunks.map((chunk) => [chunk.id, chunk]),
      );

      cases.push(buildCaseDiagnostic(testCase, references, chunksById));
    }

    const report = buildReport(cases, evalFile);
    const stamp = timestamp();
    const reportsDir = join(process.cwd(), 'reports');
    const jsonPath = join(
      reportsDir,
      `real-eval-50-retrieval-diagnostics-${stamp}.json`,
    );
    const mdPath = join(
      reportsDir,
      `real-eval-50-retrieval-diagnostics-${stamp}.md`,
    );

    await mkdir(reportsDir, { recursive: true });
    await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    await writeFile(mdPath, `${buildMarkdown(report, jsonPath)}\n`, 'utf8');

    console.log(`Retrieval diagnostics JSON written to ${jsonPath}`);
    console.log(`Retrieval diagnostics markdown written to ${mdPath}`);
    console.log(JSON.stringify(report.summary, null, 2));
  } finally {
    await app.close();
  }
}

function buildCaseDiagnostic(
  testCase: EvalCase,
  references: RagReference[],
  chunksById: Map<string, ChunkMetadata>,
): CaseDiagnostic {
  const expectedChunkIds = readExpectedChunkIds(testCase);
  const retrievedTop10ChunkIds = references.map((item) => item.id);
  const metrics = calculateRetrievalCaseMetrics(
    expectedChunkIds,
    retrievedTop10ChunkIds,
  );
  const bestGoldRank = metrics.firstRelevantRank ?? null;
  const top10Chunks = references.map((reference, index) =>
    toChunkDiagnostic(index + 1, reference, chunksById.get(reference.id)),
  );
  const goldLabelReviewFlags = classifyGoldLabelIssues(
    testCase,
    references,
    chunksById,
  );
  const errorClassification = classifyRetrievalErrors(
    testCase,
    top10Chunks,
    bestGoldRank,
    expectedChunkIds,
    goldLabelReviewFlags,
  );

  return {
    testCaseId: readCaseId(testCase),
    ...(readSubject(testCase) ? { subject: readSubject(testCase) } : {}),
    ...(readGrade(testCase) !== undefined ? { grade: readGrade(testCase) } : {}),
    ...(readQuestionType(testCase)
      ? { questionType: readQuestionType(testCase) }
      : {}),
    ...(readTopic(testCase) ? { topic: readTopic(testCase) } : {}),
    ...(readChapter(testCase) ? { chapter: readChapter(testCase) } : {}),
    ...(readLessonId(testCase) ? { lessonId: readLessonId(testCase) } : {}),
    question: readQuestion(testCase),
    expectedChunkIds,
    retrievedTop10ChunkIds,
    bestGoldRank,
    metrics: {
      hitAt1: metrics.hitAt1,
      hitAt3: metrics.hitAt3,
      hitAt5: metrics.hitAt5,
      recallAt5: metrics.recallAt5,
      precisionAt5: metrics.precisionAt5,
      reciprocalRank: metrics.reciprocalRank,
    },
    top10Chunks,
    errorClassification,
    goldLabelReviewFlags,
  };
}

function classifyRetrievalErrors(
  testCase: EvalCase,
  top10Chunks: RetrievedChunkDiagnostic[],
  bestGoldRank: number | null,
  expectedChunkIds: string[],
  goldLabelReviewFlags: GoldLabelReviewFlag[],
) {
  const classes: string[] = [];
  const top1 = top10Chunks[0];
  const subject = readSubject(testCase);
  const grade = readGrade(testCase);

  if (bestGoldRank === 1) {
    classes.push('success_top1');
  }
  if (bestGoldRank !== null && bestGoldRank <= 3) {
    classes.push('success_top3');
  }
  if (bestGoldRank !== null && bestGoldRank <= 5) {
    classes.push('success_top5');
  }
  if (bestGoldRank !== null && bestGoldRank > 5) {
    classes.push('gold_low_rank');
  }
  if (bestGoldRank === null && expectedChunkIds.length > 0) {
    classes.push('gold_not_in_top10');
  }
  if (top1?.subject && subject && top1.subject !== subject) {
    classes.push('subject_mismatch');
  }
  if (top1?.grade !== undefined && grade !== undefined && top1.grade !== grade) {
    classes.push('grade_mismatch');
  }
  if (isFormulaLike(readQuestion(testCase), readQuestionType(testCase))) {
    const top5HasFormula = top10Chunks
      .slice(0, 5)
      .some((chunk) => hasFormulaOrSymbol(chunk.excerpt));
    if (!top5HasFormula) {
      classes.push('formula_symbol_mismatch');
    }
  }
  if (top1 && isNoisyChunk(top1.excerpt)) {
    classes.push('chunk_noise');
  }
  if (goldLabelReviewFlags.length > 0) {
    classes.push('possible_bad_gold_label');
  }

  return [...new Set(classes)];
}

function classifyGoldLabelIssues(
  testCase: EvalCase,
  references: RagReference[],
  chunksById: Map<string, ChunkMetadata>,
): GoldLabelReviewFlag[] {
  const flags: GoldLabelReviewFlag[] = [];
  const expectedChunkIds = readExpectedChunkIds(testCase);
  const subject = readSubject(testCase);
  const grade = readGrade(testCase);
  const question = readQuestion(testCase);
  const top1Id = references[0]?.id;

  for (const id of expectedChunkIds) {
    const chunk = chunksById.get(id);
    if (!chunk) {
      continue;
    }
    if (subject && chunk.subject && chunk.subject !== subject) {
      flags.push('expected_subject_mismatch');
    }
    if (grade !== undefined && chunk.grade !== undefined && chunk.grade !== grade) {
      flags.push('expected_grade_mismatch');
    }
    if (isNoisyChunk(chunk.text ?? '')) {
      flags.push('expected_chunk_too_short_or_noisy');
    }
    if (!containsEnoughQuestionKeywords(question, chunk.text ?? '')) {
      flags.push('expected_chunk_missing_question_keywords');
    }
  }

  if (
    top1Id &&
    expectedChunkIds.length > 0 &&
    !expectedChunkIds.includes(top1Id) &&
    topCandidateLooksBetter(testCase, references[0], chunksById)
  ) {
    flags.push('candidate_may_be_better_than_gold');
  }

  return [...new Set(flags)];
}

function topCandidateLooksBetter(
  testCase: EvalCase,
  reference: RagReference | undefined,
  chunksById: Map<string, ChunkMetadata>,
) {
  if (!reference) {
    return false;
  }

  const chunk = chunksById.get(reference.id);
  const subject = readSubject(testCase);
  const grade = readGrade(testCase);
  const lessonId = readLessonId(testCase);
  const chapter = readChapter(testCase);
  const question = readQuestion(testCase);
  const sameSubject = !subject || chunk?.subject === subject;
  const sameGrade = grade === undefined || chunk?.grade === grade;
  const sameLesson = lessonId && chunk?.lessonId === lessonId;
  const sameChapter = chapter && chunk?.chapter === chapter;
  const goodKeywordOverlap = containsEnoughQuestionKeywords(
    question,
    [chunk?.title, chunk?.lessonTitle, chunk?.text].filter(Boolean).join(' '),
  );

  return Boolean(
    sameSubject &&
      sameGrade &&
      (sameLesson || sameChapter || goodKeywordOverlap) &&
      (reference.finalScore ?? reference.score ?? 0) >= 0.5,
  );
}

function toChunkDiagnostic(
  rank: number,
  reference: RagReference,
  chunk?: ChunkMetadata,
): RetrievedChunkDiagnostic {
  return {
    rank,
    id: reference.id,
    ...(chunk?.subject ? { subject: chunk.subject } : {}),
    ...(chunk?.grade !== undefined ? { grade: chunk.grade } : {}),
    ...(chunk?.chapter ? { chapter: chunk.chapter } : {}),
    ...(chunk?.lessonId ? { lessonId: chunk.lessonId } : {}),
    ...(chunk?.lessonTitle ? { lessonTitle: chunk.lessonTitle } : {}),
    sectionOrTitle: chunk?.title ?? reference.title,
    ...(chunk?.validationStatus
      ? { validationStatus: chunk.validationStatus }
      : {}),
    scoreBreakdown: {
      score: reference.score,
      finalScore: reference.finalScore,
      vectorScore: reference.vectorScore,
      keywordScore: reference.keywordScore,
      conceptScore: reference.conceptScore,
      conceptBoost: reference.conceptBoost,
      titleBoost: reference.titleBoost,
      metadataBoost: reference.metadataBoost,
      formulaBoost: reference.formulaBoost,
      textBoost: reference.textBoost,
      topicBoost: reference.topicBoost,
      subjectBoost: reference.subjectBoost,
      gradeBoost: reference.gradeBoost,
      chapterBoost: reference.chapterBoost,
      lessonBoost: reference.lessonBoost,
      sectionBoost: reference.sectionBoost,
      validationBoost: reference.validationBoost,
    },
    retrievalType: reference.retrievalType,
    excerpt: truncate(chunk?.text ?? reference.text, 420),
  };
}

function buildReport(cases: CaseDiagnostic[], evalFile: string): DiagnosticReport {
  const worst15Cases = [...cases]
    .sort((left, right) => worstCaseScore(right) - worstCaseScore(left))
    .slice(0, 15);

  return {
    generatedAt: new Date().toISOString(),
    evalFile,
    summary: {
      totalCases: cases.length,
      metricsOverall: groupMetrics(cases),
      metricsBySubject: groupByMetrics(cases, (item) => item.subject ?? 'unknown'),
      metricsByGrade: groupByMetrics(cases, (item) =>
        item.grade === undefined ? 'unknown' : String(item.grade),
      ),
      metricsByQuestionType: groupByMetrics(
        cases,
        (item) => item.questionType ?? 'unknown',
      ),
      top1SubjectMismatchCount: cases.filter((item) =>
        item.errorClassification.includes('subject_mismatch'),
      ).length,
      top1NeedsReviewCount: cases.filter(
        (item) => item.top10Chunks[0]?.validationStatus === 'needs_review',
      ).length,
      goldNotInTop10Count: cases.filter((item) =>
        item.errorClassification.includes('gold_not_in_top10'),
      ).length,
      possibleBadGoldLabelCount: cases.filter((item) =>
        item.errorClassification.includes('possible_bad_gold_label'),
      ).length,
    },
    worst15Cases,
    cases,
  };
}

function groupByMetrics(
  cases: CaseDiagnostic[],
  getKey: (item: CaseDiagnostic) => string,
) {
  const groups: Record<string, CaseDiagnostic[]> = {};

  for (const item of cases) {
    const key = getKey(item);
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
  }

  return Object.fromEntries(
    Object.entries(groups)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, items]) => [key, groupMetrics(items)]),
  );
}

function groupMetrics(cases: CaseDiagnostic[]): GroupMetrics {
  return {
    cases: cases.length,
    hitAt1: average(cases, (item) => item.metrics.hitAt1),
    hitAt3: average(cases, (item) => item.metrics.hitAt3),
    hitAt5: average(cases, (item) => item.metrics.hitAt5),
    recallAt5: average(cases, (item) => item.metrics.recallAt5),
    mrr: average(cases, (item) => item.metrics.reciprocalRank),
    goldNotInTop10: cases.filter((item) => item.bestGoldRank === null).length,
  };
}

function buildMarkdown(report: DiagnosticReport, jsonPath: string) {
  return [
    '# Real Eval 50 Retrieval Diagnostics',
    '',
    `- Run time: ${report.generatedAt}`,
    `- Eval file: \`${report.evalFile}\``,
    `- JSON: \`${jsonPath}\``,
    '',
    '## Overall Metrics',
    '',
    formatMetricsTable({ overall: report.summary.metricsOverall }),
    '',
    '## Metrics By Subject',
    '',
    formatMetricsTable(report.summary.metricsBySubject),
    '',
    '## Metrics By Grade',
    '',
    formatMetricsTable(report.summary.metricsByGrade),
    '',
    '## Metrics By Question Type',
    '',
    formatMetricsTable(report.summary.metricsByQuestionType),
    '',
    '## Aggregate Counts',
    '',
    '| Count | Value |',
    '| --- | ---: |',
    `| Top1 subject mismatch | ${report.summary.top1SubjectMismatchCount} |`,
    `| Top1 needs_review | ${report.summary.top1NeedsReviewCount} |`,
    `| Gold not in top10 | ${report.summary.goldNotInTop10Count} |`,
    `| Possible bad gold label | ${report.summary.possibleBadGoldLabelCount} |`,
    '',
    '## Worst 15 Cases',
    '',
    ...formatWorstCases(report.worst15Cases),
    '',
    '## Case Details',
    '',
    ...report.cases.flatMap(formatCase),
  ].join('\n');
}

function formatMetricsTable(groups: Record<string, GroupMetrics>) {
  return [
    '| Group | Cases | Hit@1 | Hit@3 | Hit@5 | Recall@5 | MRR | Gold not top10 |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...Object.entries(groups).map(
      ([key, metrics]) =>
        `| ${escapeCell(key)} | ${metrics.cases} | ${formatMetric(
          metrics.hitAt1,
        )} | ${formatMetric(metrics.hitAt3)} | ${formatMetric(
          metrics.hitAt5,
        )} | ${formatMetric(metrics.recallAt5)} | ${formatMetric(
          metrics.mrr,
        )} | ${metrics.goldNotInTop10} |`,
    ),
  ].join('\n');
}

function formatWorstCases(cases: CaseDiagnostic[]) {
  if (cases.length === 0) {
    return ['No cases found.'];
  }

  return [
    '| Case | Subject | Grade | Type | Best gold rank | Top1 | Classes | Gold label flags |',
    '| --- | --- | ---: | --- | ---: | --- | --- | --- |',
    ...cases.map(
      (item) =>
        `| ${escapeCell(item.testCaseId)} | ${item.subject ?? 'N/A'} | ${
          item.grade ?? 'N/A'
        } | ${item.questionType ?? 'N/A'} | ${item.bestGoldRank ?? 'N/A'} | ${
          item.retrievedTop10ChunkIds[0] ?? 'N/A'
        } | ${escapeCell(item.errorClassification.join(', ') || 'none')} | ${escapeCell(
          item.goldLabelReviewFlags.join(', ') || 'none',
        )} |`,
    ),
  ];
}

function formatCase(item: CaseDiagnostic) {
  return [
    `### ${item.testCaseId}`,
    '',
    `- Subject/grade/type: ${item.subject ?? 'N/A'} / ${
      item.grade ?? 'N/A'
    } / ${item.questionType ?? 'N/A'}`,
    `- Topic/chapter/lesson: ${item.topic ?? 'N/A'} / ${
      item.chapter ?? 'N/A'
    } / ${item.lessonId ?? 'N/A'}`,
    `- Question: ${item.question}`,
    `- Expected chunks: ${item.expectedChunkIds.join(', ') || 'N/A'}`,
    `- Retrieved top10: ${item.retrievedTop10ChunkIds.join(', ') || 'N/A'}`,
    `- Best gold rank: ${item.bestGoldRank ?? 'not found in top10'}`,
    `- Error classification: ${item.errorClassification.join(', ') || 'none'}`,
    `- Gold label review flags: ${item.goldLabelReviewFlags.join(', ') || 'none'}`,
    '',
    '| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section/title | Status | Score | Breakdown | Excerpt |',
    '| ---: | --- | --- | ---: | --- | --- | --- | --- | ---: | --- | --- |',
    ...item.top10Chunks.map(
      (chunk) =>
        `| ${chunk.rank} | ${chunk.id} | ${chunk.subject ?? 'N/A'} | ${
          chunk.grade ?? 'N/A'
        } | ${chunk.chapter ?? 'N/A'} | ${chunk.lessonId ?? 'N/A'} | ${escapeCell(
          chunk.sectionOrTitle ?? '',
        )} | ${chunk.validationStatus ?? 'N/A'} | ${formatMetric(
          chunk.scoreBreakdown.finalScore ?? chunk.scoreBreakdown.score,
        )} | ${escapeCell(formatScoreBreakdown(chunk.scoreBreakdown))} | ${escapeCell(
          chunk.excerpt,
        )} |`,
    ),
    '',
  ];
}

function formatScoreBreakdown(score: ScoreBreakdown) {
  return Object.entries(score)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
    .map(([key, value]) => `${key}=${formatMetric(value as number)}`)
    .join(', ');
}

function worstCaseScore(item: CaseDiagnostic) {
  let score = 0;
  if (item.bestGoldRank === null) {
    score += 100;
  } else {
    score += item.bestGoldRank;
  }
  if (item.errorClassification.includes('subject_mismatch')) {
    score += 30;
  }
  if (item.errorClassification.includes('grade_mismatch')) {
    score += 20;
  }
  if (item.errorClassification.includes('formula_symbol_mismatch')) {
    score += 10;
  }
  if (item.errorClassification.includes('possible_bad_gold_label')) {
    score += 5;
  }
  return score;
}

function readExpectedChunkIds(testCase: EvalCase) {
  const expected = readExpectedEvaluationData(testCase);
  if (expected?.relevant_chunk_ids?.length) {
    return expected.relevant_chunk_ids;
  }

  return Array.isArray(testCase.expectedChunkIds)
    ? testCase.expectedChunkIds.filter(
        (item): item is string => typeof item === 'string' && item.trim() !== '',
      )
    : [];
}

function readQuestion(testCase: EvalCase) {
  const value =
    testCase.question ?? testCase.input ?? testCase.message ?? testCase.prompt;

  return typeof value === 'string' ? value.trim() : '';
}

function readCaseId(testCase: EvalCase) {
  const value = testCase.id ?? testCase.caseId ?? testCase.case_id;

  return typeof value === 'string' && value.trim() ? value : 'unknown';
}

function readSubject(testCase: EvalCase) {
  return typeof testCase.subject === 'string' && testCase.subject.trim()
    ? testCase.subject
    : undefined;
}

function readGrade(testCase: EvalCase) {
  return typeof testCase.grade === 'number' && Number.isFinite(testCase.grade)
    ? testCase.grade
    : undefined;
}

function readTopic(testCase: EvalCase) {
  return typeof testCase.topic === 'string' && testCase.topic.trim()
    ? testCase.topic
    : undefined;
}

function readChapter(testCase: EvalCase) {
  return typeof testCase.chapter === 'string' && testCase.chapter.trim()
    ? testCase.chapter
    : undefined;
}

function readLessonId(testCase: EvalCase) {
  const value = testCase.lessonId ?? testCase.lesson_id;

  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readQuestionType(testCase: EvalCase) {
  return typeof testCase.questionType === 'string' && testCase.questionType.trim()
    ? testCase.questionType
    : undefined;
}

function resolveEvalFile() {
  const envPath = process.env.EVAL_CASES_PATH?.trim();
  const candidates = [
    ...(envPath ? [envPath, join(process.cwd(), envPath)] : []),
    join(process.cwd(), '..', '..', '..', 'data', 'eval', 'real-eval-50.preview.json'),
    join(process.cwd(), 'data', 'eval', 'real-eval-50.preview.json'),
  ];

  return candidates[0];
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function containsEnoughQuestionKeywords(question: string, text: string) {
  const tokens = importantTokens(question);
  if (tokens.length === 0) {
    return true;
  }

  const normalizedText = normalize(text);
  const matches = tokens.filter((token) => normalizedText.includes(token)).length;

  return matches >= Math.min(2, tokens.length) || matches / tokens.length >= 0.35;
}

function importantTokens(value: string) {
  const stopWords = new Set([
    'theo',
    'trong',
    'dung',
    'dung',
    'hay',
    'neu',
    'tinh',
    'mot',
    'cac',
    'cua',
    'voi',
    'duoc',
    'trinh',
    'bay',
    'chinh',
    'noi',
    'dung',
    'muc',
  ]);

  return [
    ...new Set(
      normalize(value)
        .split(/\s+/)
        .filter((token) => token.length >= 3 && !stopWords.has(token))
        .slice(0, 12),
    ),
  ];
}

function isFormulaLike(question: string, questionType?: string) {
  return (
    questionType === 'formula' ||
    questionType === 'calculation' ||
    /[=<>≤≥+\-*/^]|\\frac|\\sqrt|omega|lambda|pi|sin|cos|tan|log/i.test(
      decodeMojibake(question),
    )
  );
}

function hasFormulaOrSymbol(value: string) {
  return /[$=<>≤≥+\-*/^]|\\frac|\\sqrt|\\begin|omega|lambda|pi|sin|cos|tan|log|[πλµωφΩ]/i.test(
    decodeMojibake(value),
  );
}

function isNoisyChunk(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return (
    normalized.length < 80 ||
    /={5,}|�{2,}|\bundefined\b|\bnull\b/i.test(normalized)
  );
}

function average<T>(items: T[], getValue: (item: T) => number) {
  if (items.length === 0) {
    return 0;
  }

  return items.reduce((sum, item) => sum + getValue(item), 0) / items.length;
}

function normalize(value: string) {
  return decodeMojibake(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9/+\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeMojibake(value: string) {
  if (!/[ÃÄÂ]|á[º»]/.test(value)) {
    return value;
  }

  return Buffer.from(value, 'latin1').toString('utf8');
}

function truncate(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatMetric(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(4)
    : 'N/A';
}

function escapeCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
