import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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
  retrievalType?: string;
};

type RagCase = {
  case_id: string;
  question: string;
  expected_chunk_ids: string[];
  retrieved_chunk_ids: string[];
  top_chunks?: RetrievedChunkReport[];
  metrics: {
    hitAt1: number;
    hitAt3: number;
    hitAt5: number;
    recallAt5: number;
    precisionAt5: number;
    reciprocalRank: number;
    firstRelevantRank?: number;
    matchedChunkIds?: string[];
    skipped?: boolean;
  };
  skipped_reason?: string;
  error?: string;
};

type RagReport = {
  generated_at: string;
  summary: Record<string, number>;
  cases: RagCase[];
};

type AnswerCase = {
  case_id: string;
  question: string;
  expected_answer?: {
    type?: string;
    value?: unknown;
    unit?: string;
    tolerance?: number;
    reference_answer?: string;
    required_concepts?: unknown[];
    requiredConcepts?: unknown[];
  };
  ai_answer: string;
  metrics: {
    numericCorrect: boolean | null;
    conceptCoverage: number | null;
    matchedConcepts: string[];
    missingConcepts: string[];
    ruleBasedScore: number;
  };
  judge_scores?: {
    correctness: number;
    groundedness: number;
    completeness: number;
    clarity: number;
    citationUsage: number;
  };
  final_answer_score?: number;
  judge_reason?: string;
  hallucination?: boolean;
  used_reference_ids?: string[];
  confidence?: string;
  skipped_reason?: string;
  error?: string;
};

type AnswerReport = {
  generated_at: string;
  summary: Record<string, number | string>;
  cases: AnswerCase[];
};

type DiagnosticCase = {
  testCaseId: string;
  question: string;
  expectedChunkIds: string[];
  retrievedTopChunkIds: string[];
  goldRank: number | null;
  retrievedChunks: RetrievedChunkReport[];
  generatedAnswer?: string;
  expectedAnswer?: AnswerCase['expected_answer'];
  ruleBasedScore?: number;
  numericCorrect?: boolean | null;
  conceptCoverage?: number | null;
  missingConcepts?: string[];
  llmJudgeScore?: number;
  llmJudgeReason?: string;
  hallucination?: boolean;
  errorTypes: string[];
  recommendation: string;
};

type DiagnosticReport = {
  generatedAt: string;
  ragReportGeneratedAt?: string;
  answerReportGeneratedAt?: string;
  summary: {
    totalCases: number;
    retrievalMisses: number;
    goldLowRank: number;
    contextOkAnswerFailed: number;
    numericErrors: number;
    hallucinations: number;
    insufficientGoldLabels: number;
    answerDominantFailures: number;
    retrievalDominantFailures: number;
  };
  cases: DiagnosticCase[];
};

const REPORTS_DIR = join(process.cwd(), 'reports');

async function main() {
  const ragReport = await readJson<RagReport>(
    process.env.RAG_REPORT_PATH ?? join(REPORTS_DIR, 'rag-eval-report.json'),
  );
  const answerReport = await readJson<AnswerReport>(
    process.env.ANSWER_REPORT_PATH ?? join(REPORTS_DIR, 'answer-eval-report.json'),
  );
  const diagnostics = buildDiagnostics(ragReport, answerReport);
  const stamp = timestamp();
  const jsonPath = join(REPORTS_DIR, `real-smoke-diagnostics-${stamp}.json`);
  const mdPath = join(REPORTS_DIR, `real-smoke-diagnostics-${stamp}.md`);

  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(diagnostics, null, 2)}\n`, 'utf8');
  await writeFile(mdPath, `${buildMarkdown(diagnostics, jsonPath)}\n`, 'utf8');

  console.log(`Diagnostic JSON written to ${jsonPath}`);
  console.log(`Diagnostic markdown written to ${mdPath}`);
  console.log(JSON.stringify(diagnostics.summary, null, 2));
}

function buildDiagnostics(
  ragReport: RagReport,
  answerReport: AnswerReport,
): DiagnosticReport {
  const answerById = new Map(answerReport.cases.map((item) => [item.case_id, item]));
  const cases = ragReport.cases.map((ragCase) =>
    buildDiagnosticCase(ragCase, answerById.get(ragCase.case_id)),
  );
  const summary = {
    totalCases: cases.length,
    retrievalMisses: countType(cases, 'retrieval_miss'),
    goldLowRank: countType(cases, 'gold_low_rank'),
    contextOkAnswerFailed: countType(cases, 'context_ok_answer_failed'),
    numericErrors: countType(cases, 'numeric_error'),
    hallucinations: countType(cases, 'hallucination'),
    insufficientGoldLabels: countType(cases, 'insufficient_gold_label'),
    answerDominantFailures: cases.filter(isAnswerDominant).length,
    retrievalDominantFailures: cases.filter(isRetrievalDominant).length,
  };

  return {
    generatedAt: new Date().toISOString(),
    ragReportGeneratedAt: ragReport.generated_at,
    answerReportGeneratedAt: answerReport.generated_at,
    summary,
    cases,
  };
}

function buildDiagnosticCase(ragCase: RagCase, answerCase?: AnswerCase): DiagnosticCase {
  const retrievedTopChunkIds = ragCase.retrieved_chunk_ids ?? [];
  const goldRank = firstGoldRank(
    ragCase.expected_chunk_ids ?? [],
    retrievedTopChunkIds,
  );
  const errorTypes = classifyErrors(ragCase, answerCase, goldRank);

  return {
    testCaseId: ragCase.case_id,
    question: ragCase.question,
    expectedChunkIds: ragCase.expected_chunk_ids ?? [],
    retrievedTopChunkIds,
    goldRank,
    retrievedChunks: (ragCase.top_chunks ?? []).slice(0, 10),
    ...(answerCase?.ai_answer ? { generatedAnswer: answerCase.ai_answer } : {}),
    ...(answerCase?.expected_answer
      ? { expectedAnswer: answerCase.expected_answer }
      : {}),
    ...(answerCase
      ? {
          ruleBasedScore: answerCase.metrics.ruleBasedScore,
          numericCorrect: answerCase.metrics.numericCorrect,
          conceptCoverage: answerCase.metrics.conceptCoverage,
          missingConcepts: answerCase.metrics.missingConcepts,
        }
      : {}),
    ...(answerCase?.final_answer_score !== undefined
      ? { llmJudgeScore: answerCase.final_answer_score }
      : {}),
    ...(answerCase?.judge_reason
      ? { llmJudgeReason: answerCase.judge_reason }
      : {}),
    ...(answerCase?.hallucination !== undefined
      ? { hallucination: answerCase.hallucination }
      : {}),
    errorTypes,
    recommendation: recommendation(errorTypes, goldRank),
  };
}

function classifyErrors(
  ragCase: RagCase,
  answerCase: AnswerCase | undefined,
  goldRank: number | null,
) {
  const errors: string[] = [];
  const expectedIds = ragCase.expected_chunk_ids ?? [];
  const answerScore = answerCase?.metrics.ruleBasedScore ?? 1;

  if (expectedIds.length === 0) {
    errors.push('insufficient_gold_label');
  }
  if (goldRank === null && expectedIds.length > 0) {
    errors.push('retrieval_miss');
  }
  if (goldRank !== null && goldRank > 5) {
    errors.push('gold_low_rank');
  }
  if (goldRank !== null && goldRank <= 5 && answerScore < 0.7) {
    errors.push('context_ok_answer_failed');
  }
  if (isFormulaLike(ragCase.question, answerCase) && answerScore < 0.7) {
    errors.push('formula_error');
  }
  if (answerCase?.metrics.numericCorrect === false) {
    errors.push('numeric_error');
  }
  if (answerCase?.hallucination === true) {
    errors.push('hallucination');
  }
  if (answerCase?.skipped_reason || answerCase?.error || ragCase.error) {
    errors.push('case_execution_error');
  }

  return [...new Set(errors)];
}

function recommendation(errorTypes: string[], goldRank: number | null) {
  if (errorTypes.includes('retrieval_miss')) {
    return 'Inspect query terms, subject/grade/topic filters, and whether the gold chunk is too narrow.';
  }
  if (errorTypes.includes('gold_low_rank')) {
    return `Relevant chunk appears at rank ${goldRank}; consider small rerank/topK tuning before changing runtime broadly.`;
  }
  if (errorTypes.includes('hallucination')) {
    return 'Constrain answer generation to retrieved references and require explicit missing-data acknowledgement.';
  }
  if (errorTypes.includes('numeric_error') || errorTypes.includes('formula_error')) {
    return 'Use a calculation-oriented answer prompt: formula from context, substitution, calculation, unit, then final answer.';
  }
  if (errorTypes.includes('context_ok_answer_failed')) {
    return 'Retrieval context is available; improve answer synthesis/context selection rather than retrieval.';
  }
  if (errorTypes.includes('insufficient_gold_label')) {
    return 'Review gold labels before interpreting this case.';
  }

  return 'No major issue detected.';
}

function buildMarkdown(report: DiagnosticReport, jsonPath: string) {
  return [
    '# Real Smoke Diagnostics',
    '',
    `- Run time: ${report.generatedAt}`,
    `- JSON: \`${jsonPath}\``,
    `- RAG report time: ${report.ragReportGeneratedAt ?? 'N/A'}`,
    `- Answer report time: ${report.answerReportGeneratedAt ?? 'N/A'}`,
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Total cases | ${report.summary.totalCases} |`,
    `| Retrieval misses | ${report.summary.retrievalMisses} |`,
    `| Gold low rank | ${report.summary.goldLowRank} |`,
    `| Context ok but answer failed | ${report.summary.contextOkAnswerFailed} |`,
    `| Numeric errors | ${report.summary.numericErrors} |`,
    `| Hallucinations | ${report.summary.hallucinations} |`,
    `| Insufficient gold labels | ${report.summary.insufficientGoldLabels} |`,
    `| Answer-dominant failures | ${report.summary.answerDominantFailures} |`,
    `| Retrieval-dominant failures | ${report.summary.retrievalDominantFailures} |`,
    '',
    '## Conclusion',
    '',
    dominantConclusion(report),
    '',
    '## Cases',
    '',
    ...report.cases.flatMap(formatCase),
  ].join('\n');
}

function formatCase(item: DiagnosticCase) {
  return [
    `### ${item.testCaseId}`,
    '',
    `- Question: ${item.question}`,
    `- Expected chunks: ${item.expectedChunkIds.join(', ') || 'N/A'}`,
    `- Retrieved top chunks: ${item.retrievedTopChunkIds.join(', ') || 'N/A'}`,
    `- Gold rank: ${item.goldRank ?? 'not found'}`,
    `- Error types: ${item.errorTypes.join(', ') || 'none'}`,
    `- Rule score: ${formatMetric(item.ruleBasedScore)}`,
    `- Numeric correct: ${formatBoolean(item.numericCorrect)}`,
    `- Concept coverage: ${formatMetric(item.conceptCoverage)}`,
    `- LLM judge score: ${formatMetric(item.llmJudgeScore)}`,
    `- Hallucination: ${formatBoolean(item.hallucination)}`,
    `- Recommendation: ${item.recommendation}`,
    '',
    'Expected answer/concepts:',
    '',
    '```json',
    JSON.stringify(item.expectedAnswer ?? {}, null, 2),
    '```',
    '',
    'Generated answer:',
    '',
    '```text',
    truncate(item.generatedAnswer ?? '', 1200),
    '```',
    '',
    'Retrieved chunks:',
    '',
    ...item.retrievedChunks.slice(0, 10).flatMap((chunk, index) => [
      `${index + 1}. ${chunk.id} - ${chunk.title ?? ''}`,
      `   topic=${chunk.topic ?? 'N/A'} score=${formatMetric(chunk.finalScore ?? chunk.score)} type=${chunk.retrievalType ?? 'N/A'}`,
      `   ${truncate(chunk.excerpt ?? '', 500)}`,
    ]),
    '',
  ];
}

function dominantConclusion(report: DiagnosticReport) {
  if (report.summary.answerDominantFailures > report.summary.retrievalDominantFailures) {
    return `Primary failure mode is answer generation: ${report.summary.answerDominantFailures} answer-dominant cases vs ${report.summary.retrievalDominantFailures} retrieval-dominant cases.`;
  }
  if (report.summary.retrievalDominantFailures > report.summary.answerDominantFailures) {
    return `Primary failure mode is retrieval: ${report.summary.retrievalDominantFailures} retrieval-dominant cases vs ${report.summary.answerDominantFailures} answer-dominant cases.`;
  }

  return 'Retrieval and answer failures are balanced or inconclusive.';
}

function firstGoldRank(expectedIds: string[], retrievedIds: string[]) {
  const expected = new Set(expectedIds);
  const index = retrievedIds.findIndex((id) => expected.has(id));

  return index >= 0 ? index + 1 : null;
}

function isAnswerDominant(item: DiagnosticCase) {
  return (
    item.errorTypes.includes('context_ok_answer_failed') ||
    item.errorTypes.includes('numeric_error') ||
    item.errorTypes.includes('formula_error') ||
    item.errorTypes.includes('hallucination')
  );
}

function isRetrievalDominant(item: DiagnosticCase) {
  return (
    item.errorTypes.includes('retrieval_miss') ||
    item.errorTypes.includes('gold_low_rank')
  );
}

function isFormulaLike(question: string, answerCase?: AnswerCase) {
  const text = [
    question,
    answerCase?.expected_answer?.reference_answer ?? '',
    ...(answerCase?.metrics.missingConcepts ?? []),
  ]
    .join(' ')
    .toLowerCase();

  return /công thức|phương trình|tính|=|omega|lambda|π|ω|λ/.test(text);
}

function countType(cases: DiagnosticCase[], type: string) {
  return cases.filter((item) => item.errorTypes.includes(type)).length;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
}

function formatMetric(value: number | undefined | null) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(4)
    : 'N/A';
}

function formatBoolean(value: boolean | undefined | null) {
  if (value === undefined || value === null) {
    return 'N/A';
  }

  return value ? 'true' : 'false';
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
