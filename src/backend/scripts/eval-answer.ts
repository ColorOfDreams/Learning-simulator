import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AiService } from '../src/modules/ai/ai.service';
import {
  isAnswerJudgeEnabled,
  judgeAnswerWithLlm,
} from '../src/modules/ai/evaluation/answer-judge';
import { computeRuleBasedAnswerMetrics } from '../src/modules/ai/evaluation/answer-metrics';
import { buildAnswerErrorAnalysis } from '../src/modules/ai/evaluation/error-analysis';
import { readExpectedEvaluationData } from '../src/modules/ai/evaluation/eval-utils';
import { AiTestCaseEntity } from '../src/modules/learning/ai-test-case/ai-test-case.entity';
import type {
  AnswerJudgeReference,
  AnswerJudgeScores,
} from '../src/modules/ai/evaluation/answer-judge';
import type { ExpectedEvaluationAnswer } from '../src/modules/ai/evaluation/eval-types';
import type { RuleBasedAnswerMetrics } from '../src/modules/ai/evaluation/answer-metrics';

type EvalSource = 'database' | 'smoke' | 'file';
type EvalAiMethod = 'analyze' | 'chat';

type AnswerEvalInputCase = {
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

type AnswerEvalCaseReport = {
  case_id: string;
  question: string;
  subject?: string;
  grade?: number;
  topic?: string;
  chapter?: string;
  lessonId?: string;
  questionType?: string;
  expected_answer?: ExpectedEvaluationAnswer;
  ai_answer: string;
  metrics: RuleBasedAnswerMetrics;
  judge_scores?: Omit<AnswerJudgeScores, 'reason' | 'hallucination'>;
  final_answer_score?: number;
  judge_reason?: string;
  hallucination?: boolean;
  judge_error?: string;
  used_reference_ids?: string[];
  confidence?: string;
  output_metadata?: {
    llmEnabled?: boolean;
    model?: string;
    retrievalTopK?: number;
    promptTokensApprox?: number;
    latencyMs?: number;
    parseFallback?: boolean;
    error?: string;
  };
  skipped_reason?: string;
  error?: string;
};

type AnswerEvalReport = {
  generated_at: string;
  source: EvalSource;
  ai_method: EvalAiMethod;
  llm_enabled: boolean;
  llm_answer_enabled: boolean;
  llm_answer_configured: boolean;
  llm_judge_enabled: boolean;
  llm_judge_configured: boolean;
  llm_base_url?: string;
  llm_model?: string;
  judge_base_url?: string;
  judge_model?: string;
  summary: {
    total_cases: number;
    evaluated_cases: number;
    skipped_cases: number;
    numeric_cases: number;
    conceptual_cases: number;
    mixed_cases: number;
    numeric_accuracy: number;
    avg_concept_coverage: number;
    avg_rule_based_score: number;
    avg_correctness: number;
    avg_groundedness: number;
    avg_completeness: number;
    avg_clarity: number;
    avg_citation_usage: number;
    avg_final_answer_score: number;
    hallucination_rate: number;
    avg_latency_ms: number;
    model?: string;
    skip_reasons: Record<string, number>;
    by_subject: Record<string, AnswerEvalGroupSummary>;
    by_question_type: Record<string, AnswerEvalGroupSummary>;
  };
  cases: AnswerEvalCaseReport[];
};

type AnswerEvalGroupSummary = {
  total_cases: number;
  evaluated_cases: number;
  skipped_cases: number;
  numeric_cases: number;
  conceptual_cases: number;
  mixed_cases: number;
  numeric_accuracy: number;
  avg_concept_coverage: number;
  avg_rule_based_score: number;
  avg_correctness: number;
  avg_groundedness: number;
  avg_completeness: number;
  avg_clarity: number;
  avg_citation_usage: number;
  avg_final_answer_score: number;
  hallucination_rate: number;
};

configureLlmForEval();

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const aiService = app.get(AiService);
    const evalSource = readEvalSource();
    const aiMethod = readEvalAiMethod();
    const testCases = limitCases(await loadEvalCases(app, evalSource));
    const caseReports: AnswerEvalCaseReport[] = [];

    for (const testCase of testCases) {
      caseReports.push(await evaluateCase(testCase, aiService, aiMethod));
    }

    const report = buildReport(caseReports, evalSource, aiMethod);
    const reportsDir = join(process.cwd(), 'reports');
    const reportPath = join(reportsDir, 'answer-eval-report.json');
    const summaryPath = join(reportsDir, 'answer-eval-summary.md');
    const samplesPath = join(reportsDir, 'llm-answer-samples.md');

    await mkdir(reportsDir, { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    await writeFile(summaryPath, `${buildMarkdownSummary(report)}\n`, 'utf8');
    await writeFile(samplesPath, `${buildSamplesMarkdown(report)}\n`, 'utf8');

    console.log(JSON.stringify(report.summary, null, 2));
    console.log(`Answer eval source: ${evalSource}`);
    console.log(`Answer eval method: ${aiMethod}`);
    console.log(`LLM answer enabled: ${report.llm_answer_enabled}`);
    console.log(`LLM answer configured: ${report.llm_answer_configured}`);
    console.log(`LLM judge enabled: ${report.llm_judge_enabled}`);
    console.log(`LLM judge configured: ${report.llm_judge_configured}`);
    console.log(`Answer eval report written to ${reportPath}`);
    console.log(`Answer eval summary written to ${summaryPath}`);
    console.log(`LLM answer samples written to ${samplesPath}`);
  } finally {
    await app.close();
  }
}

async function evaluateCase(
  testCase: AnswerEvalInputCase | AiTestCaseEntity,
  aiService: AiService,
  aiMethod: EvalAiMethod,
): Promise<AnswerEvalCaseReport> {
  const caseId = readCaseId(testCase);
  const question = readQuestion(testCase);
  const metadata = {
    subject: readSubject(testCase),
    grade: readGrade(testCase),
    topic: readTopic(testCase),
    chapter: readChapter(testCase),
    lessonId: readLessonId(testCase),
    questionType: readQuestionType(testCase),
  };
  const expected = readExpectedEvaluationData(testCase);
  const expectedAnswer = expected?.answer;

  if (!expectedAnswer) {
    return buildSkippedCaseReport(
      caseId,
      question,
      metadata,
      'No expected answer data',
    );
  }

  if (!question) {
    return buildSkippedCaseReport(
      caseId,
      question,
      metadata,
      'No question/input text',
      expectedAnswer,
    );
  }

  try {
    const output =
      aiMethod === 'chat'
        ? await aiService.chat({
            message: question,
            subject: metadata.subject,
            grade: metadata.grade,
          })
        : await aiService.analyze({
            message: question,
            subject: metadata.subject,
            grade: metadata.grade,
          });
    const aiAnswer = extractAnswerText(output);
    const metrics = computeRuleBasedAnswerMetrics(aiAnswer, expectedAnswer);
    const judgeResult = await judgeAnswerWithLlm({
      question,
      references: extractReferences(output),
      expectedAnswer,
      aiAnswer,
    });
    const judgeFields =
      judgeResult.enabled && judgeResult.configured && 'scores' in judgeResult
        ? {
            judge_scores: {
              correctness: judgeResult.scores.correctness,
              groundedness: judgeResult.scores.groundedness,
              completeness: judgeResult.scores.completeness,
              clarity: judgeResult.scores.clarity,
              citationUsage: judgeResult.scores.citationUsage,
            },
            final_answer_score: judgeResult.finalAnswerScore,
            judge_reason: judgeResult.scores.reason,
            hallucination: judgeResult.scores.hallucination,
          }
        : judgeResult.error
          ? { judge_error: judgeResult.error }
          : {};

    return {
      case_id: caseId,
      question,
      ...compactCaseMetadata(metadata),
      expected_answer: expectedAnswer,
      ai_answer: aiAnswer,
      metrics,
      ...extractOutputDiagnostics(output),
      ...judgeFields,
    };
  } catch (error) {
    return buildSkippedCaseReport(
      caseId,
      question,
      metadata,
      'Case evaluation failed',
      expectedAnswer,
      error,
    );
  }
}

async function loadEvalCases(
  app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>>,
  evalSource: EvalSource,
): Promise<Array<AnswerEvalInputCase | AiTestCaseEntity>> {
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

async function readSmokeCases(): Promise<AnswerEvalInputCase[]> {
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
    join(process.cwd(), '../../data/eval/answer-smoke-cases.json'),
    join(process.cwd(), '../../data/eval/rag-smoke-cases.json'),
    join(process.cwd(), '../../../data/eval/answer-smoke-cases.json'),
    join(process.cwd(), '../../../data/eval/rag-smoke-cases.json'),
    join(process.cwd(), 'data/eval/answer-smoke-cases.json'),
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
  caseReports: AnswerEvalCaseReport[],
  source: EvalSource,
  aiMethod: EvalAiMethod,
): AnswerEvalReport {
  const evaluatedCases = caseReports.filter((item) => !item.skipped_reason);
  const numericCases = evaluatedCases.filter(
    (item) =>
      item.metrics.numericCorrect !== null &&
      (item.expected_answer?.type === 'numeric' ||
        item.expected_answer?.type === 'mixed' ||
        item.expected_answer?.value !== undefined),
  );
  const conceptCheckCases = evaluatedCases.filter(
    (item) => item.metrics.conceptCoverage !== null,
  );
  const conceptualCases = evaluatedCases.filter(
    (item) =>
      (item.expected_answer?.type ?? inferExpectedAnswerType(item)) ===
      'conceptual',
  );
  const mixedCases = evaluatedCases.filter(
    (item) => (item.expected_answer?.type ?? inferExpectedAnswerType(item)) === 'mixed',
  );
  const judgedCases = evaluatedCases.filter((item) => item.judge_scores);
  const hallucinationCases = judgedCases.filter(
    (item) => item.hallucination === true,
  );
  const latencyCases = evaluatedCases.filter(
    (item) => typeof item.output_metadata?.latencyMs === 'number',
  );
  const model = evaluatedCases.find((item) => item.output_metadata?.model)
    ?.output_metadata?.model;

  return {
    generated_at: new Date().toISOString(),
    source,
    ai_method: aiMethod,
    llm_enabled: isLlmEnabledForEval(),
    llm_answer_enabled: isLlmEnabledForEval(),
    llm_answer_configured: isLlmConfiguredForEval(),
    llm_judge_enabled: isAnswerJudgeEnabled(),
    llm_judge_configured: isAnswerJudgeConfiguredForEval(),
    llm_base_url: readLlmBaseUrl(),
    llm_model: readLlmModel(),
    judge_base_url: readJudgeBaseUrl(),
    judge_model: readJudgeModel(),
    summary: {
      total_cases: caseReports.length,
      evaluated_cases: evaluatedCases.length,
      skipped_cases: caseReports.length - evaluatedCases.length,
      numeric_cases: numericCases.length,
      conceptual_cases: conceptualCases.length,
      mixed_cases: mixedCases.length,
      numeric_accuracy: average(numericCases, (item) =>
        item.metrics.numericCorrect ? 1 : 0,
      ),
      avg_concept_coverage: average(
        conceptCheckCases,
        (item) => item.metrics.conceptCoverage ?? 0,
      ),
      avg_rule_based_score: average(
        evaluatedCases,
        (item) => item.metrics.ruleBasedScore,
      ),
      avg_correctness: average(
        judgedCases,
        (item) => item.judge_scores?.correctness ?? 0,
      ),
      avg_groundedness: average(
        judgedCases,
        (item) => item.judge_scores?.groundedness ?? 0,
      ),
      avg_completeness: average(
        judgedCases,
        (item) => item.judge_scores?.completeness ?? 0,
      ),
      avg_clarity: average(
        judgedCases,
        (item) => item.judge_scores?.clarity ?? 0,
      ),
      avg_citation_usage: average(
        judgedCases,
        (item) => item.judge_scores?.citationUsage ?? 0,
      ),
      avg_final_answer_score: average(
        judgedCases,
        (item) => item.final_answer_score ?? 0,
      ),
      hallucination_rate:
        judgedCases.length === 0 ? 0 : hallucinationCases.length / judgedCases.length,
      avg_latency_ms: average(
        latencyCases,
        (item) => item.output_metadata?.latencyMs ?? 0,
      ),
      ...(model ? { model } : {}),
      skip_reasons: countAnswerSkipReasons(caseReports),
      by_subject: buildAnswerGroupSummaries(caseReports, (item) => item.subject),
      by_question_type: buildAnswerGroupSummaries(
        caseReports,
        (item) => item.questionType,
      ),
    },
    cases: caseReports,
  };
}

function buildAnswerGroupSummaries(
  caseReports: AnswerEvalCaseReport[],
  getKey: (item: AnswerEvalCaseReport) => string | undefined,
): Record<string, AnswerEvalGroupSummary> {
  const groups = new Map<string, AnswerEvalCaseReport[]>();

  for (const item of caseReports) {
    const key = normalizeGroupKey(getKey(item));
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, items]) => [key, summarizeAnswerGroup(items)]),
  );
}

function summarizeAnswerGroup(items: AnswerEvalCaseReport[]): AnswerEvalGroupSummary {
  const evaluatedCases = items.filter((item) => !item.skipped_reason);
  const numericCases = evaluatedCases.filter(
    (item) =>
      item.metrics.numericCorrect !== null &&
      (item.expected_answer?.type === 'numeric' ||
        item.expected_answer?.type === 'mixed' ||
        item.expected_answer?.value !== undefined),
  );
  const conceptCheckCases = evaluatedCases.filter(
    (item) => item.metrics.conceptCoverage !== null,
  );
  const conceptualCases = evaluatedCases.filter(
    (item) =>
      (item.expected_answer?.type ?? inferExpectedAnswerType(item)) ===
      'conceptual',
  );
  const mixedCases = evaluatedCases.filter(
    (item) => (item.expected_answer?.type ?? inferExpectedAnswerType(item)) === 'mixed',
  );
  const judgedCases = evaluatedCases.filter((item) => item.judge_scores);
  const hallucinationCases = judgedCases.filter(
    (item) => item.hallucination === true,
  );

  return {
    total_cases: items.length,
    evaluated_cases: evaluatedCases.length,
    skipped_cases: items.length - evaluatedCases.length,
    numeric_cases: numericCases.length,
    conceptual_cases: conceptualCases.length,
    mixed_cases: mixedCases.length,
    numeric_accuracy: average(numericCases, (item) =>
      item.metrics.numericCorrect ? 1 : 0,
    ),
    avg_concept_coverage: average(
      conceptCheckCases,
      (item) => item.metrics.conceptCoverage ?? 0,
    ),
    avg_rule_based_score: average(
      evaluatedCases,
      (item) => item.metrics.ruleBasedScore,
    ),
    avg_correctness: average(
      judgedCases,
      (item) => item.judge_scores?.correctness ?? 0,
    ),
    avg_groundedness: average(
      judgedCases,
      (item) => item.judge_scores?.groundedness ?? 0,
    ),
    avg_completeness: average(
      judgedCases,
      (item) => item.judge_scores?.completeness ?? 0,
    ),
    avg_clarity: average(
      judgedCases,
      (item) => item.judge_scores?.clarity ?? 0,
    ),
    avg_citation_usage: average(
      judgedCases,
      (item) => item.judge_scores?.citationUsage ?? 0,
    ),
    avg_final_answer_score: average(
      judgedCases,
      (item) => item.final_answer_score ?? 0,
    ),
    hallucination_rate:
      judgedCases.length === 0 ? 0 : hallucinationCases.length / judgedCases.length,
  };
}

function countAnswerSkipReasons(caseReports: AnswerEvalCaseReport[]) {
  const counts: Record<string, number> = {};

  for (const item of caseReports) {
    const reason = item.skipped_reason ?? (item.error ? item.error : '');

    if (!reason) {
      continue;
    }

    counts[reason] = (counts[reason] ?? 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function compactCaseMetadata(metadata: {
  subject?: string;
  grade?: number;
  topic?: string;
  chapter?: string;
  lessonId?: string;
  questionType?: string;
}) {
  return {
    ...(metadata.subject ? { subject: metadata.subject } : {}),
    ...(metadata.grade !== undefined ? { grade: metadata.grade } : {}),
    ...(metadata.topic ? { topic: metadata.topic } : {}),
    ...(metadata.chapter ? { chapter: metadata.chapter } : {}),
    ...(metadata.lessonId ? { lessonId: metadata.lessonId } : {}),
    ...(metadata.questionType ? { questionType: metadata.questionType } : {}),
  };
}

function normalizeGroupKey(value: string | undefined) {
  return value && value.trim() ? value.trim() : 'unknown';
}

function buildMarkdownSummary(report: AnswerEvalReport) {
  const failedCases = report.cases.filter((item) => Boolean(item.error));
  const errorAnalysisRows = buildAnswerErrorAnalysis(report.cases);
  const weakCases = report.cases
    .filter((item) => Boolean(item.error) || item.metrics.ruleBasedScore < 0.7)
    .slice(0, 10);
  const hasEvaluatedCases = report.summary.evaluated_cases > 0;
  const hasNumericCases = report.summary.numeric_cases > 0;
  const hasConceptChecks =
    report.summary.conceptual_cases > 0 || report.summary.mixed_cases > 0;
  const hasJudgeResults = report.cases.some(
    (item) => item.judge_scores || item.hallucination !== undefined,
  );

  return [
    '# AI/RAG Answer Evaluation Summary',
    '',
    `- Run time: ${report.generated_at}`,
    `- Source: ${report.source}`,
    `- AI method: ${report.ai_method}`,
    `- LLM answer enabled: ${report.llm_answer_enabled}`,
    `- LLM answer configured: ${report.llm_answer_configured}`,
    `- LLM judge enabled: ${report.llm_judge_enabled}`,
    `- LLM judge configured: ${report.llm_judge_configured}`,
    `- LLM base URL: ${report.llm_base_url ?? 'N/A'}`,
    `- LLM model: ${report.llm_model ?? 'N/A'}`,
    `- Judge base URL: ${report.judge_base_url ?? 'N/A'}`,
    `- Judge model: ${report.judge_model ?? 'N/A'}`,
    `- Model: ${report.summary.model ?? 'N/A'}`,
    `- Avg latency: ${formatMetricIf(
      report.summary.avg_latency_ms,
      report.summary.evaluated_cases > 0 && report.summary.avg_latency_ms > 0,
    )} ms`,
    `- Answer judge enabled: ${isAnswerJudgeEnabled()}`,
    ...(report.ai_method !== 'chat' || !report.llm_answer_enabled
      ? [
          '',
          '> WARNING: Answer evaluation is not running full LLM chat generation. Metrics may reflect local/analyze fallback.',
        ]
      : []),
    ...(report.llm_judge_enabled && !report.llm_judge_configured
      ? [
          '',
          '> WARNING: Answer judge is enabled but no judge API key is configured.',
        ]
      : []),
    '',
    '## Cases',
    '',
    `- Total: ${report.summary.total_cases}`,
    `- Evaluated: ${report.summary.evaluated_cases}`,
    `- Skipped: ${report.summary.skipped_cases}`,
    `- Failed: ${failedCases.length}`,
    `- Numeric cases: ${report.summary.numeric_cases}`,
    `- Conceptual cases: ${report.summary.conceptual_cases}`,
    `- Mixed cases: ${report.summary.mixed_cases}`,
    '',
    '## Metrics',
    '',
    ...(hasEvaluatedCases
      ? []
      : [
          'Answer evaluation chưa được thực hiện thực chất vì không có case nào đủ expected.answer. Các chỉ số dưới đây không phải là điểm 0 của AI.',
          '',
        ]),
    '| Metric | Value |',
    '| --- | ---: |',
    `| Numeric accuracy | ${formatMetricIf(
      report.summary.numeric_accuracy,
      hasEvaluatedCases && hasNumericCases,
    )} |`,
    `| Avg concept coverage | ${formatMetricIf(
      report.summary.avg_concept_coverage,
      hasEvaluatedCases && hasConceptChecks,
    )} |`,
    `| Avg rule-based score | ${formatMetricIf(
      report.summary.avg_rule_based_score,
      hasEvaluatedCases,
    )} |`,
    `| Avg correctness | ${formatMetricIf(
      report.summary.avg_correctness,
      hasEvaluatedCases && hasJudgeResults,
    )} |`,
    `| Avg groundedness | ${formatMetricIf(
      report.summary.avg_groundedness,
      hasEvaluatedCases && hasJudgeResults,
    )} |`,
    `| Avg completeness | ${formatMetricIf(
      report.summary.avg_completeness,
      hasEvaluatedCases && hasJudgeResults,
    )} |`,
    `| Avg clarity | ${formatMetricIf(
      report.summary.avg_clarity,
      hasEvaluatedCases && hasJudgeResults,
    )} |`,
    `| Avg citation usage | ${formatMetricIf(
      report.summary.avg_citation_usage,
      hasEvaluatedCases && hasJudgeResults,
    )} |`,
    `| Avg final answer score | ${formatMetricIf(
      report.summary.avg_final_answer_score,
      hasEvaluatedCases && hasJudgeResults,
    )} |`,
    `| Hallucination rate | ${formatMetricIf(
      report.summary.hallucination_rate,
      hasEvaluatedCases && hasJudgeResults,
    )} |`,
    '',
    '## Metrics By Subject',
    '',
    ...formatAnswerGroupMetrics(report.summary.by_subject, hasJudgeResults),
    '',
    '## Metrics By Question Type',
    '',
    ...formatAnswerGroupMetrics(
      report.summary.by_question_type,
      hasJudgeResults,
    ),
    '',
    '## Skip Reasons',
    '',
    ...formatSkipReasons(report.summary.skip_reasons),
    '',
    '## Error Analysis',
    '',
    ...formatErrorAnalysisRows(errorAnalysisRows),
    '',
    '## Top 10 Weak Or Failed Cases',
    '',
    weakCases.length > 0
      ? '| Case ID | Question | Score | Reason |'
      : 'No weak or failed cases found.',
    weakCases.length > 0 ? '| --- | --- | ---: | --- |' : '',
    ...weakCases.map(
      (item) =>
        `| ${escapeCell(item.case_id)} | ${escapeCell(
          truncate(item.question),
        )} | ${formatCaseScore(item)} | ${escapeCell(
          item.error ?? item.skipped_reason ?? weakReason(item),
        )} |`,
    ),
    '',
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n');
}

function formatErrorAnalysisRows(
  rows: ReturnType<typeof buildAnswerErrorAnalysis>,
) {
  if (rows.length === 0) {
    return ['No error patterns detected.'];
  }

  return [
    '| Error Type | Count | Suggested Fix |',
    '| --- | ---: | --- |',
    ...rows.map(
      (item) =>
        `| ${item.errorType} | ${item.count} | ${escapeCell(
          item.suggestedFix,
        )} |`,
    ),
  ];
}

function formatAnswerGroupMetrics(
  groups: Record<string, AnswerEvalGroupSummary>,
  hasJudgeResults: boolean,
) {
  if (!groups || Object.keys(groups).length === 0) {
    return ['No grouped metrics found.'];
  }

  return [
    '| Group | Total | Evaluated | Skipped | Numeric | Conceptual | Mixed | Numeric Accuracy | Concept Coverage | Rule Score | Final Score | Hallucination Rate |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...Object.entries(groups).map(
      ([group, item]) =>
        `| ${escapeCell(group)} | ${item.total_cases} | ${
          item.evaluated_cases
        } | ${item.skipped_cases} | ${item.numeric_cases} | ${
          item.conceptual_cases
        } | ${item.mixed_cases} | ${formatMetricIf(
          item.numeric_accuracy,
          item.numeric_cases > 0,
        )} | ${formatMetricIf(
          item.avg_concept_coverage,
          item.conceptual_cases + item.mixed_cases > 0,
        )} | ${formatMetricIf(
          item.avg_rule_based_score,
          item.evaluated_cases > 0,
        )} | ${formatMetricIf(
          item.avg_final_answer_score,
          hasJudgeResults,
        )} | ${formatMetricIf(item.hallucination_rate, hasJudgeResults)} |`,
    ),
  ];
}

function formatSkipReasons(reasons: Record<string, number>) {
  if (!reasons || Object.keys(reasons).length === 0) {
    return ['No skipped cases.'];
  }

  return [
    '| Reason | Count |',
    '| --- | ---: |',
    ...Object.entries(reasons).map(
      ([reason, count]) => `| ${escapeCell(reason)} | ${count} |`,
    ),
  ];
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
  reason: string,
  expectedAnswer?: ExpectedEvaluationAnswer,
  error?: unknown,
): AnswerEvalCaseReport {
  return {
    case_id: caseId,
    question,
    ...compactCaseMetadata(metadata),
    ...(expectedAnswer ? { expected_answer: expectedAnswer } : {}),
    ai_answer: '',
    metrics: {
      numericCorrect: null,
      conceptCoverage: null,
      matchedConcepts: [],
      missingConcepts: [],
      ruleBasedScore: 0,
    },
    skipped_reason: reason,
    ...(error ? { error: errorToString(error) } : {}),
  };
}

function extractAnswerText(output: unknown) {
  if (typeof output === 'string') {
    return output.trim();
  }

  if (!isRecord(output)) {
    return '';
  }

  const answer = output.answer;
  const topLevelSteps = Array.isArray(output.steps)
    ? output.steps.filter((item): item is string => typeof item === 'string')
    : [];
  const topLevelFormulae = Array.isArray(output.formulae)
    ? output.formulae.filter((item): item is string => typeof item === 'string')
    : [];
  const simulationHint =
    typeof output.simulation_hint === 'string' ? output.simulation_hint : '';

  if (typeof answer === 'string') {
    return [answer, ...topLevelSteps, ...topLevelFormulae, simulationHint]
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  if (isRecord(answer)) {
    const shortAnswer =
      typeof answer.short_answer === 'string' ? answer.short_answer : '';
    const steps = Array.isArray(answer.steps)
      ? answer.steps.filter((item): item is string => typeof item === 'string')
      : [];

    return [
      shortAnswer,
      ...steps,
      ...topLevelSteps,
      ...topLevelFormulae,
      simulationHint,
    ]
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  return '';
}

function extractOutputDiagnostics(output: unknown) {
  if (!isRecord(output)) {
    return {};
  }

  const metadata = isRecord(output.metadata) ? output.metadata : undefined;

  return {
    ...(Array.isArray(output.used_reference_ids)
      ? {
          used_reference_ids: output.used_reference_ids.filter(
            (item): item is string => typeof item === 'string',
          ),
        }
      : {}),
    ...(typeof output.confidence === 'string'
      ? { confidence: output.confidence }
      : {}),
    ...(metadata
      ? {
          output_metadata: {
            ...(typeof metadata.llmEnabled === 'boolean'
              ? { llmEnabled: metadata.llmEnabled }
              : {}),
            ...(typeof metadata.model === 'string'
              ? { model: metadata.model }
              : {}),
            ...(typeof metadata.retrievalTopK === 'number'
              ? { retrievalTopK: metadata.retrievalTopK }
              : {}),
            ...(typeof metadata.promptTokensApprox === 'number'
              ? { promptTokensApprox: metadata.promptTokensApprox }
              : {}),
            ...(typeof metadata.latencyMs === 'number'
              ? { latencyMs: metadata.latencyMs }
              : {}),
            ...(typeof metadata.parseFallback === 'boolean'
              ? { parseFallback: metadata.parseFallback }
              : {}),
            ...(typeof metadata.error === 'string'
              ? { error: metadata.error }
              : {}),
          },
        }
      : {}),
  };
}

function extractReferences(output: unknown): AnswerJudgeReference[] {
  if (!isRecord(output) || !Array.isArray(output.references)) {
    return [];
  }

  return output.references
    .filter(isRecord)
    .slice(0, 5)
    .map((reference) => ({
      id: typeof reference.id === 'string' ? reference.id : undefined,
      title: typeof reference.title === 'string' ? reference.title : undefined,
      topic: typeof reference.topic === 'string' ? reference.topic : undefined,
      source: typeof reference.source === 'string' ? reference.source : undefined,
      text: typeof reference.text === 'string' ? truncate(reference.text, 800) : undefined,
    }));
}

function configureLlmForEval() {
  const sharedApiKey =
    process.env.LLM_API_KEY ??
    process.env.OPENAI_API_KEY ??
    process.env.ANSWER_JUDGE_API_KEY ??
    process.env.EMBEDDING_API_KEY;

  if (!process.env.LLM_API_KEY && sharedApiKey) {
    process.env.LLM_API_KEY = sharedApiKey;
  }

  if (process.env.ANSWER_JUDGE_ENABLED === undefined && isLlmEnabledForEval()) {
    process.env.ANSWER_JUDGE_ENABLED = 'true';
  }
}

function isLlmEnabledForEval() {
  const explicit =
    process.env.EVAL_USE_LLM === 'true' || readEvalAiMethod() === 'chat';
  const hasKey = Boolean(
      process.env.LLM_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANSWER_JUDGE_API_KEY ||
      process.env.EMBEDDING_API_KEY,
  );

  return explicit && hasKey;
}

function isLlmConfiguredForEval() {
  return Boolean(
    process.env.LLM_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANSWER_JUDGE_API_KEY ||
      process.env.EMBEDDING_API_KEY,
  );
}

function isAnswerJudgeConfiguredForEval() {
  return Boolean(
    process.env.ANSWER_JUDGE_API_KEY ||
      process.env.LLM_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.EMBEDDING_API_KEY,
  );
}

function readLlmBaseUrl() {
  return process.env.LLM_BASE_URL ?? 'https://api.openai.com/v1';
}

function readLlmModel() {
  return process.env.LLM_MODEL ?? 'gpt-4o-mini';
}

function readJudgeBaseUrl() {
  return (
    process.env.ANSWER_JUDGE_BASE_URL ??
    process.env.LLM_BASE_URL ??
    'https://api.openai.com/v1'
  );
}

function readJudgeModel() {
  return (
    process.env.ANSWER_JUDGE_MODEL ??
    process.env.LLM_MODEL ??
    'gpt-4o-mini'
  );
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

function readEvalSource(): EvalSource {
  if (process.env.EVAL_CASES_PATH?.trim()) {
    return 'file';
  }

  return process.env.EVAL_SOURCE === 'smoke' ? 'smoke' : 'database';
}

function resolveEvalPathCandidates(path: string) {
  return [
    path,
    join(process.cwd(), path),
    join(process.cwd(), '..', '..', path),
    join(process.cwd(), '..', '..', '..', path),
  ];
}

function readEvalAiMethod(): EvalAiMethod {
  return process.env.ANSWER_AI_METHOD === 'chat' ||
    process.env.EVAL_AI_METHOD === 'chat'
    ? 'chat'
    : 'analyze';
}

function limitCases<T>(items: T[]) {
  const maxCases = Number(process.env.EVAL_MAX_CASES);

  return Number.isFinite(maxCases) && maxCases > 0
    ? items.slice(0, maxCases)
    : items;
}

function average<T>(items: T[], getValue: (item: T) => number) {
  if (items.length === 0) {
    return 0;
  }

  return items.reduce((sum, item) => sum + getValue(item), 0) / items.length;
}

function buildSamplesMarkdown(report: AnswerEvalReport) {
  const evaluated = report.cases.filter((item) => !item.skipped_reason);
  const good = [...evaluated]
    .sort((left, right) => right.metrics.ruleBasedScore - left.metrics.ruleBasedScore)
    .slice(0, 5);
  const weak = [...evaluated]
    .sort((left, right) => left.metrics.ruleBasedScore - right.metrics.ruleBasedScore)
    .slice(0, 5);

  return [
    '# LLM Answer Samples',
    '',
    `- Run time: ${report.generated_at}`,
    `- AI method: ${report.ai_method}`,
    `- LLM enabled: ${report.llm_enabled}`,
    `- Model: ${report.summary.model ?? 'N/A'}`,
    '',
    '## Best Samples',
    '',
    ...formatSampleBlocks(good),
    '',
    '## Weakest Samples',
    '',
    ...formatSampleBlocks(weak),
    '',
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n');
}

function formatSampleBlocks(cases: AnswerEvalCaseReport[]) {
  if (cases.length === 0) {
    return ['No evaluated answer samples available.'];
  }

  return cases.flatMap((item) => [
    `### ${item.case_id} - score ${formatMetric(item.metrics.ruleBasedScore)}`,
    '',
    `Question: ${item.question}`,
    '',
    'Expected:',
    '',
    formatExpectedAnswer(item.expected_answer),
    '',
    'Metrics:',
    '',
    `- Numeric correct: ${formatNullableBoolean(item.metrics.numericCorrect)}`,
    `- Concept coverage: ${formatMetricIf(
      item.metrics.conceptCoverage ?? 0,
      item.metrics.conceptCoverage !== null,
    )}`,
    `- Matched concepts: ${item.metrics.matchedConcepts.join(', ') || 'N/A'}`,
    `- Missing concepts: ${item.metrics.missingConcepts.join(', ') || 'N/A'}`,
    `- Rule-based score: ${formatMetric(item.metrics.ruleBasedScore)}`,
    ...(item.final_answer_score !== undefined
      ? [`- Judge final score: ${formatMetric(item.final_answer_score)}`]
      : []),
    ...(item.judge_reason ? [`- Judge reason: ${item.judge_reason}`] : []),
    '',
    `Confidence: ${item.confidence ?? 'N/A'}`,
    `Used references: ${(item.used_reference_ids ?? []).join(', ') || 'N/A'}`,
    '',
    'Answer:',
    '',
    truncate(item.ai_answer, 1200),
    '',
  ]);
}

function formatExpectedAnswer(expected: ExpectedEvaluationAnswer | undefined) {
  if (!expected) {
    return 'N/A';
  }

  const reference =
    typeof expected.reference_answer === 'string'
      ? expected.reference_answer
      : undefined;
  const numeric =
    expected.value !== undefined
      ? `value=${String(expected.value)}${expected.unit ? ` ${expected.unit}` : ''}`
      : undefined;
  const concepts = expected.required_concepts ?? expected.requiredConcepts ?? [];
  const conceptText = Array.isArray(concepts)
    ? concepts
        .map((item) =>
          typeof item === 'string'
            ? item
            : item && typeof item === 'object' && 'label' in item
              ? String(item.label)
              : '',
        )
        .filter(Boolean)
        .join(', ')
    : '';

  return [
    reference ? `Reference answer: ${reference}` : '',
    numeric ? `Expected numeric: ${numeric}` : '',
    conceptText ? `Required concepts: ${conceptText}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function formatNullableBoolean(value: boolean | null) {
  if (value === null) {
    return 'N/A';
  }

  return value ? 'pass' : 'fail';
}

function inferExpectedAnswerType(item: AnswerEvalCaseReport) {
  const expectedAnswer = item.expected_answer;

  if (
    expectedAnswer?.value !== undefined &&
    item.metrics.conceptCoverage !== null
  ) {
    return 'mixed';
  }

  if (expectedAnswer?.value !== undefined) {
    return 'numeric';
  }

  return 'conceptual';
}

function weakReason(item: AnswerEvalCaseReport) {
  if (item.metrics.numericCorrect === false) {
    return 'Numeric answer mismatch';
  }
  if ((item.metrics.conceptCoverage ?? 1) < 0.7) {
    return 'Low concept coverage';
  }
  return 'Low rule-based score';
}

function formatMetric(value: number) {
  return Number.isFinite(value) ? value.toFixed(4) : '0.0000';
}

function formatMetricIf(value: number, applicable: boolean) {
  return applicable ? formatMetric(value) : 'N/A';
}

function formatCaseScore(item: AnswerEvalCaseReport) {
  if (item.skipped_reason) {
    return 'N/A';
  }

  return formatMetric(item.metrics.ruleBasedScore);
}

function truncate(value: string, maxLength = 140) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function escapeCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function errorToString(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
