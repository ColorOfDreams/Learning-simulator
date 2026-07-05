import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { RagRetrievalService } from '../src/modules/ai/rag-retrieval.service';
import { readExpectedEvaluationData } from '../src/modules/ai/evaluation/eval-utils';
import { buildRagEvalMarkdownSummary } from '../src/modules/ai/evaluation/report-writer';
import {
  calculateMeanReciprocalRank,
  calculateRetrievalCaseMetrics,
} from '../src/modules/ai/evaluation/retrieval-metrics';
import type { RagReference } from '../src/modules/ai/rag-retrieval.service';
import type { RagVectorDiagnostics } from '../src/modules/ai/rag-retrieval.service';
import type { RetrievalCaseMetrics } from '../src/modules/ai/evaluation/retrieval-metrics';
import { AiTestCaseEntity } from '../src/modules/learning/ai-test-case/ai-test-case.entity';

type RagEvalCaseReport = {
  case_id: string;
  question: string;
  subject?: string;
  grade?: number;
  topic?: string;
  chapter?: string;
  lessonId?: string;
  questionType?: string;
  expected_chunk_ids: string[];
  baseline_retrieved_chunk_ids?: string[];
  baseline_top_chunks?: RetrievedChunkReport[];
  baseline_metrics?: RetrievalCaseMetrics;
  retrieved_chunk_ids: string[];
  top_chunks: RetrievedChunkReport[];
  metrics: RetrievalCaseMetrics;
  skipped_reason?: string;
  error?: string;
};

type RetrievedChunkReport = {
  id: string;
  title?: string;
  topic?: string;
  source?: string;
  excerpt?: string;
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
  retrievalType?: 'vector' | 'keyword' | 'hybrid';
};

type RagEvalReport = {
  generated_at: string;
  diagnostics?: RagEvalDiagnostics;
  summary: {
    total_cases: number;
    evaluated_cases: number;
    skipped_cases: number;
    baseline_hit_at_1?: number;
    baseline_hit_at_3?: number;
    baseline_hit_at_5?: number;
    baseline_recall_at_5?: number;
    baseline_precision_at_5?: number;
    baseline_mrr?: number;
    hit_at_1: number;
    hit_at_3: number;
    hit_at_5: number;
    recall_at_5: number;
    precision_at_5: number;
    mrr: number;
    delta_hit_at_1?: number;
    delta_hit_at_3?: number;
    delta_hit_at_5?: number;
    delta_recall_at_5?: number;
    delta_precision_at_5?: number;
    delta_mrr?: number;
    skip_reasons: Record<string, number>;
    by_subject: Record<string, RagEvalGroupSummary>;
    by_question_type: Record<string, RagEvalGroupSummary>;
  };
  cases: RagEvalCaseReport[];
};

type RagEvalGroupSummary = {
  total_cases: number;
  evaluated_cases: number;
  skipped_cases: number;
  hit_at_1: number;
  hit_at_3: number;
  hit_at_5: number;
  recall_at_5: number;
  precision_at_5: number;
  mrr: number;
};

type RagEvalDiagnostics = RagVectorDiagnostics & {
  casesWithHybridResults: number;
  casesWithVectorResults: number;
  casesFallbackKeywordOnly: number;
};

type EvalSource = 'database' | 'smoke' | 'file';

type RagEvalInputCase = {
  id?: unknown;
  caseId?: unknown;
  case_id?: unknown;
  input?: unknown;
  question?: unknown;
  message?: unknown;
  prompt?: unknown;
  subject?: unknown;
  grade?: unknown;
  topic?: unknown;
  chapter?: unknown;
  lessonId?: unknown;
  lesson_id?: unknown;
  questionType?: unknown;
  expected?: unknown;
  expectedOutput?: unknown;
  metadata?: unknown;
};

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const ragRetrievalService = app.get(RagRetrievalService);
    const evalSource = readEvalSource();
    const vectorDiagnostics = await safeReadVectorDiagnostics(
      ragRetrievalService,
    );
    printVectorDiagnostics(vectorDiagnostics);
    const testCases = await loadEvalCases(app, evalSource);
    const caseReports: RagEvalCaseReport[] = [];

    for (const testCase of testCases) {
      caseReports.push(await evaluateCase(testCase, ragRetrievalService));
    }

    const report = buildReport(caseReports, vectorDiagnostics);
    const reportsDir = join(process.cwd(), 'reports');
    const reportPath = join(reportsDir, 'rag-eval-report.json');
    const summaryPath = join(reportsDir, 'rag-eval-summary.md');
    const markdownSummary = buildRagEvalMarkdownSummary(report);

    await mkdir(reportsDir, { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    await writeFile(summaryPath, `${markdownSummary}\n`, 'utf8');

    console.log(JSON.stringify(report.summary, null, 2));
    console.log(JSON.stringify(report.diagnostics, null, 2));
    console.log(`RAG eval source: ${evalSource}`);
    console.log(`RAG eval report written to ${reportPath}`);
    console.log(`RAG eval summary written to ${summaryPath}`);
  } finally {
    await app.close();
  }
}

async function evaluateCase(
  testCase: RagEvalInputCase | AiTestCaseEntity,
  ragRetrievalService: RagRetrievalService,
): Promise<RagEvalCaseReport> {
  const caseId = readCaseId(testCase);
  const question = readQuestion(testCase);
  const subject = readSubject(testCase);
  const grade = readGrade(testCase);
  const topic = readTopic(testCase);
  const chapter = readChapter(testCase);
  const lessonId = readLessonId(testCase);
  const questionType = readQuestionType(testCase);
  const expected = readExpectedEvaluationData(testCase);
  const expectedChunkIds = expected?.relevant_chunk_ids ?? [];

  if (expectedChunkIds.length === 0) {
    const metrics = calculateRetrievalCaseMetrics([], []);

    return {
      case_id: caseId,
      question,
      ...(subject ? { subject } : {}),
      ...(grade !== undefined ? { grade } : {}),
      ...(topic ? { topic } : {}),
      ...(chapter ? { chapter } : {}),
      ...(lessonId ? { lessonId } : {}),
      ...(questionType ? { questionType } : {}),
      expected_chunk_ids: [],
      retrieved_chunk_ids: [],
      top_chunks: [],
      metrics,
      skipped_reason: metrics.skipReason,
    };
  }

  if (!question) {
    return buildSkippedCaseReport(
      caseId,
      question,
      { subject, grade, topic, chapter, lessonId, questionType },
      expectedChunkIds,
      'No question/input text',
    );
  }

  try {
    const topK = readEvalTopK();
    const references = await ragRetrievalService.retrieveTheoryChunks({
      message: question,
      subject,
      grade,
      topic,
      chapter,
      lessonId,
      questionType,
      topK,
      disableVector: false,
    });
    const baselineReferences = await ragRetrievalService.retrieveTheoryChunks({
      message: question,
      subject,
      grade,
      topic,
      chapter,
      lessonId,
      questionType,
      topK,
      disableVector: true,
    });
    const retrievedChunkIds = references.map((reference) => reference.id);
    const baselineRetrievedChunkIds = baselineReferences.map(
      (reference) => reference.id,
    );
    const metrics = calculateRetrievalCaseMetrics(
      expectedChunkIds,
      retrievedChunkIds,
    );
    const baselineMetrics = calculateRetrievalCaseMetrics(
      expectedChunkIds,
      baselineRetrievedChunkIds,
    );

    return {
      case_id: caseId,
      question,
      ...(subject ? { subject } : {}),
      ...(grade !== undefined ? { grade } : {}),
      ...(topic ? { topic } : {}),
      ...(chapter ? { chapter } : {}),
      ...(lessonId ? { lessonId } : {}),
      ...(questionType ? { questionType } : {}),
      expected_chunk_ids: expectedChunkIds,
      baseline_retrieved_chunk_ids: baselineRetrievedChunkIds,
      baseline_top_chunks: baselineReferences.map(toRetrievedChunkReport),
      baseline_metrics: baselineMetrics,
      retrieved_chunk_ids: retrievedChunkIds,
      top_chunks: references.map(toRetrievedChunkReport),
      metrics,
      ...(metrics.skipped ? { skipped_reason: metrics.skipReason } : {}),
    };
  } catch (error) {
    return buildSkippedCaseReport(
      caseId,
      question,
      { subject, grade, topic, chapter, lessonId, questionType },
      expectedChunkIds,
      'Case evaluation failed',
      error,
    );
  }
}

async function loadEvalCases(
  app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>,
  evalSource: EvalSource,
) {
  if (evalSource === 'smoke' || evalSource === 'file') {
    return readSmokeCases();
  }

  const dataSource = app.get(DataSource);
  const testCaseRepo = dataSource.getRepository(AiTestCaseEntity);

  return testCaseRepo.find({
    order: {
      id: 'ASC',
    },
  });
}

async function readSmokeCases(): Promise<RagEvalInputCase[]> {
  const smokeFilePath = await resolveSmokeFilePath();
  const raw = await readFile(smokeFilePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`Smoke eval file must contain an array: ${smokeFilePath}`);
  }

  return parsed.filter(isRecord);
}

async function resolveSmokeFilePath() {
  const envPath =
    process.env.EVAL_CASES_PATH?.trim() ?? process.env.EVAL_SMOKE_FILE?.trim();
  const candidates = [
    ...(envPath ? resolveEvalPathCandidates(envPath) : []),
    join(process.cwd(), '../../data/eval/rag-smoke-cases.json'),
    join(process.cwd(), '../../../data/eval/rag-smoke-cases.json'),
    join(process.cwd(), 'data/eval/rag-smoke-cases.json'),
  ];

  for (const candidate of candidates) {
    try {
      await readFile(candidate, 'utf8');
      return candidate;
    } catch {
      // Try the next conventional location.
    }
  }

  throw new Error(
    `Cannot find smoke eval file. Tried: ${candidates.join(', ')}`,
  );
}

function buildReport(
  caseReports: RagEvalCaseReport[],
  vectorDiagnostics?: RagVectorDiagnostics,
): RagEvalReport {
  const evaluatedCases = caseReports.filter((item) => !item.metrics.skipped);
  const skippedCases = caseReports.length - evaluatedCases.length;
  const baselineMetrics = evaluatedCases
    .map((item) => item.baseline_metrics)
    .filter(
      (item): item is RetrievalCaseMetrics =>
        Boolean(item) && item?.skipped === false,
    );
  const baselineSummary = {
    hit_at_1: average(baselineMetrics, (item) => item.hitAt1),
    hit_at_3: average(baselineMetrics, (item) => item.hitAt3),
    hit_at_5: average(baselineMetrics, (item) => item.hitAt5),
    recall_at_5: average(baselineMetrics, (item) => item.recallAt5),
    precision_at_5: average(baselineMetrics, (item) => item.precisionAt5),
    mrr: calculateMeanReciprocalRank(baselineMetrics),
  };
  const afterSummary = {
    hit_at_1: average(evaluatedCases, (item) => item.metrics.hitAt1),
    hit_at_3: average(evaluatedCases, (item) => item.metrics.hitAt3),
    hit_at_5: average(evaluatedCases, (item) => item.metrics.hitAt5),
    recall_at_5: average(evaluatedCases, (item) => item.metrics.recallAt5),
    precision_at_5: average(
      evaluatedCases,
      (item) => item.metrics.precisionAt5,
    ),
    mrr: calculateMeanReciprocalRank(evaluatedCases.map((item) => item.metrics)),
  };

  return {
    generated_at: new Date().toISOString(),
    ...(vectorDiagnostics
      ? { diagnostics: buildEvalDiagnostics(caseReports, vectorDiagnostics) }
      : {}),
    summary: {
      total_cases: caseReports.length,
      evaluated_cases: evaluatedCases.length,
      skipped_cases: skippedCases,
      baseline_hit_at_1: baselineSummary.hit_at_1,
      baseline_hit_at_3: baselineSummary.hit_at_3,
      baseline_hit_at_5: baselineSummary.hit_at_5,
      baseline_recall_at_5: baselineSummary.recall_at_5,
      baseline_precision_at_5: baselineSummary.precision_at_5,
      baseline_mrr: baselineSummary.mrr,
      hit_at_1: afterSummary.hit_at_1,
      hit_at_3: afterSummary.hit_at_3,
      hit_at_5: afterSummary.hit_at_5,
      recall_at_5: afterSummary.recall_at_5,
      precision_at_5: afterSummary.precision_at_5,
      mrr: afterSummary.mrr,
      delta_hit_at_1: afterSummary.hit_at_1 - baselineSummary.hit_at_1,
      delta_hit_at_3: afterSummary.hit_at_3 - baselineSummary.hit_at_3,
      delta_hit_at_5: afterSummary.hit_at_5 - baselineSummary.hit_at_5,
      delta_recall_at_5:
        afterSummary.recall_at_5 - baselineSummary.recall_at_5,
      delta_precision_at_5:
        afterSummary.precision_at_5 - baselineSummary.precision_at_5,
      delta_mrr: afterSummary.mrr - baselineSummary.mrr,
      skip_reasons: countSkipReasons(caseReports),
      by_subject: buildRagGroupSummaries(caseReports, (item) => item.subject),
      by_question_type: buildRagGroupSummaries(
        caseReports,
        (item) => item.questionType,
      ),
    },
    cases: caseReports,
  };
}

function buildRagGroupSummaries(
  caseReports: RagEvalCaseReport[],
  getKey: (item: RagEvalCaseReport) => string | undefined,
): Record<string, RagEvalGroupSummary> {
  const groups = new Map<string, RagEvalCaseReport[]>();

  for (const item of caseReports) {
    const key = normalizeGroupKey(getKey(item));
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, items]) => [key, summarizeRagGroup(items)]),
  );
}

function summarizeRagGroup(items: RagEvalCaseReport[]): RagEvalGroupSummary {
  const evaluatedCases = items.filter((item) => !item.metrics.skipped);

  return {
    total_cases: items.length,
    evaluated_cases: evaluatedCases.length,
    skipped_cases: items.length - evaluatedCases.length,
    hit_at_1: average(evaluatedCases, (item) => item.metrics.hitAt1),
    hit_at_3: average(evaluatedCases, (item) => item.metrics.hitAt3),
    hit_at_5: average(evaluatedCases, (item) => item.metrics.hitAt5),
    recall_at_5: average(evaluatedCases, (item) => item.metrics.recallAt5),
    precision_at_5: average(
      evaluatedCases,
      (item) => item.metrics.precisionAt5,
    ),
    mrr: calculateMeanReciprocalRank(evaluatedCases.map((item) => item.metrics)),
  };
}

function countSkipReasons(caseReports: RagEvalCaseReport[]) {
  const counts: Record<string, number> = {};

  for (const item of caseReports) {
    const reason =
      item.skipped_reason ?? item.metrics.skipReason ?? (item.error ? item.error : '');

    if (!reason) {
      continue;
    }

    counts[reason] = (counts[reason] ?? 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function normalizeGroupKey(value: string | undefined) {
  return value && value.trim() ? value.trim() : 'unknown';
}

async function safeReadVectorDiagnostics(
  ragRetrievalService: RagRetrievalService,
): Promise<RagVectorDiagnostics | undefined> {
  try {
    return await ragRetrievalService.getVectorDiagnostics();
  } catch (error) {
    console.warn(`Unable to read vector diagnostics: ${errorToString(error)}`);
    return undefined;
  }
}

function buildEvalDiagnostics(
  caseReports: RagEvalCaseReport[],
  vectorDiagnostics: RagVectorDiagnostics,
): RagEvalDiagnostics {
  const evaluatedCases = caseReports.filter((item) => !item.metrics.skipped);

  return {
    ...vectorDiagnostics,
    casesWithHybridResults: evaluatedCases.filter((item) =>
      item.top_chunks.some((chunk) => chunk.retrievalType === 'hybrid'),
    ).length,
    casesWithVectorResults: evaluatedCases.filter((item) =>
      item.top_chunks.some(
        (chunk) =>
          chunk.retrievalType === 'vector' ||
          chunk.retrievalType === 'hybrid' ||
          chunk.vectorScore !== undefined,
      ),
    ).length,
    casesFallbackKeywordOnly: evaluatedCases.filter(
      (item) =>
        item.top_chunks.length > 0 &&
        item.top_chunks.every((chunk) => chunk.retrievalType === 'keyword'),
    ).length,
  };
}

function printVectorDiagnostics(diagnostics: RagVectorDiagnostics | undefined) {
  if (!diagnostics) {
    console.warn('Vector retrieval diagnostics unavailable.');
    return;
  }

  console.log(
    JSON.stringify(
      {
        vectorRetrievalEnabled: diagnostics.vectorEnabled,
        embeddingBaseUrl: diagnostics.embeddingBaseUrl,
        embeddingEndpoint: diagnostics.embeddingEndpoint,
        embeddingModel: diagnostics.embeddingModel,
        embeddingDimension: diagnostics.embeddingDimension,
        embeddingApiKeyPresent: diagnostics.embeddingApiKeyPresent,
        hasGlobalFetch: diagnostics.hasGlobalFetch,
        pgvectorExtensionEnabled: diagnostics.pgvectorExtensionEnabled,
        theoryChunksTotal: diagnostics.theoryChunksTotal,
        theoryChunksWithEmbedding: diagnostics.theoryChunksWithEmbedding,
        theoryChunksMissingEmbedding: diagnostics.theoryChunksMissingEmbedding,
        embeddingDimensionsInDb: diagnostics.embeddingDimensionsInDb,
        embeddingIndexCount: diagnostics.embeddingIndexCount,
      },
      null,
      2,
    ),
  );
}

function buildSkippedCaseReport(
  caseId: string,
  question: string,
  metadata: {
    subject?: string;
    grade?: number;
    topic?: string;
    chapter?: string;
    lessonId?: string;
    questionType?: string;
  },
  expectedChunkIds: string[],
  reason: string,
  error?: unknown,
): RagEvalCaseReport {
  return {
    case_id: caseId,
    question,
    ...(metadata.subject ? { subject: metadata.subject } : {}),
    ...(metadata.grade !== undefined ? { grade: metadata.grade } : {}),
    ...(metadata.topic ? { topic: metadata.topic } : {}),
    ...(metadata.chapter ? { chapter: metadata.chapter } : {}),
    ...(metadata.lessonId ? { lessonId: metadata.lessonId } : {}),
    ...(metadata.questionType ? { questionType: metadata.questionType } : {}),
    expected_chunk_ids: expectedChunkIds,
    retrieved_chunk_ids: [],
    top_chunks: [],
    metrics: {
      skipped: true,
      hitAt1: 0,
      hitAt3: 0,
      hitAt5: 0,
      recallAt5: 0,
      precisionAt5: 0,
      reciprocalRank: 0,
      matchedChunkIds: [],
      skipReason: reason,
    },
    skipped_reason: reason,
    ...(error ? { error: errorToString(error) } : {}),
  };
}

function readQuestion(testCase: unknown) {
  if (!isRecord(testCase)) {
    return '';
  }

  const value =
    testCase.input ?? testCase.question ?? testCase.message ?? testCase.prompt;

  return typeof value === 'string' ? value.trim() : '';
}

function readSubject(testCase: unknown) {
  if (!isRecord(testCase)) {
    return undefined;
  }

  return typeof testCase.subject === 'string' && testCase.subject.trim()
    ? testCase.subject
    : undefined;
}

function readGrade(testCase: unknown) {
  if (!isRecord(testCase)) {
    return undefined;
  }

  return typeof testCase.grade === 'number' && Number.isFinite(testCase.grade)
    ? testCase.grade
    : undefined;
}

function readTopic(testCase: unknown) {
  if (!isRecord(testCase)) {
    return undefined;
  }

  return typeof testCase.topic === 'string' && testCase.topic.trim()
    ? testCase.topic
    : undefined;
}

function readChapter(testCase: unknown) {
  if (!isRecord(testCase)) {
    return undefined;
  }

  return typeof testCase.chapter === 'string' && testCase.chapter.trim()
    ? testCase.chapter
    : undefined;
}

function readLessonId(testCase: unknown) {
  if (!isRecord(testCase)) {
    return undefined;
  }

  const value = testCase.lessonId ?? testCase.lesson_id;

  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readQuestionType(testCase: unknown) {
  if (!isRecord(testCase)) {
    return undefined;
  }

  return typeof testCase.questionType === 'string' && testCase.questionType.trim()
    ? testCase.questionType
    : undefined;
}

function readCaseId(testCase: unknown) {
  if (!isRecord(testCase)) {
    return 'unknown';
  }

  const value = testCase.id ?? testCase.caseId ?? testCase.case_id;

  return typeof value === 'string' && value.trim() ? value : 'unknown';
}

function toRetrievedChunkReport(reference: RagReference): RetrievedChunkReport {
  return {
    id: reference.id,
    title: reference.title,
    topic: reference.topic,
    source: reference.source,
    excerpt: truncate(reference.text, 700),
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
    retrievalType: reference.retrievalType,
  };
}

function average<T>(items: T[], getValue: (item: T) => number) {
  if (items.length === 0) {
    return 0;
  }

  return items.reduce((sum, item) => sum + getValue(item), 0) / items.length;
}

function errorToString(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function readEvalSource(): EvalSource {
  if (process.env.EVAL_CASES_PATH?.trim()) {
    return 'file';
  }

  return process.env.EVAL_SOURCE === 'smoke' ? 'smoke' : 'database';
}

function readEvalTopK() {
  const parsed = Number.parseInt(process.env.EVAL_TOP_K ?? '', 10);

  return Number.isInteger(parsed) ? Math.max(1, Math.min(10, parsed)) : 5;
}

function resolveEvalPathCandidates(path: string) {
  return [
    path,
    join(process.cwd(), path),
    join(process.cwd(), '..', '..', path),
    join(process.cwd(), '..', '..', '..', path),
  ];
}

function truncate(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
