import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  buildAnswerErrorAnalysis,
  buildRagErrorAnalysis,
} from '../src/modules/ai/evaluation/error-analysis';

type RagEvalCaseReport = {
  case_id: string;
  question: string;
  subject?: string;
  grade?: number;
  topic?: string;
  expected_chunk_ids: string[];
  retrieved_chunk_ids: string[];
  top_chunks?: {
    id?: string;
    topic?: string;
    vectorScore?: number;
    keywordScore?: number;
  }[];
  metrics: {
    hitAt1: number;
    hitAt3: number;
    hitAt5: number;
    recallAt5: number;
    precisionAt5: number;
    reciprocalRank: number;
    firstRelevantRank?: number;
    skipped?: boolean;
    skipReason?: string;
  };
  skipped_reason?: string;
  error?: string;
};

type RagEvalReport = {
  generated_at: string;
  diagnostics?: {
    vectorEnabled?: boolean;
    embeddingBaseUrl?: string;
    embeddingEndpoint?: string;
    embeddingModel?: string;
    embeddingDimension?: number;
    embeddingApiKeyPresent?: boolean;
    hasGlobalFetch?: boolean;
    pgvectorExtensionEnabled?: boolean;
    theoryChunksTotal?: number;
    theoryChunksWithEmbedding?: number;
    theoryChunksMissingEmbedding?: number;
    embeddingDimensionsInDb?: number[];
    embeddingIndexCount?: number;
    casesWithHybridResults?: number;
    casesWithVectorResults?: number;
    casesFallbackKeywordOnly?: number;
  };
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
  };
  cases: RagEvalCaseReport[];
};

type AnswerEvalCaseReport = {
  case_id: string;
  question: string;
  ai_answer: string;
  metrics: {
    numericCorrect: boolean | null;
    conceptCoverage: number | null;
    missingConcepts?: string[];
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
  hallucination?: boolean;
  judge_reason?: string;
  judge_error?: string;
  skipped_reason?: string;
  error?: string;
};

type AnswerEvalReport = {
  generated_at: string;
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
  };
  cases: AnswerEvalCaseReport[];
};

type FullEvalRunResult = {
  script: string;
  ok: boolean;
  error?: string;
};

async function main() {
  const reportsDir = join(process.cwd(), 'reports');
  await mkdir(reportsDir, { recursive: true });

  const runResults: FullEvalRunResult[] = [];
  runResults.push(await runEvaluationScript('scripts/eval-rag.ts'));
  runResults.push(await runEvaluationScript('scripts/eval-answer.ts'));

  const ragReport = await readReport<RagEvalReport>(
    join(reportsDir, 'rag-eval-report.json'),
  );
  const answerReport = await readReport<AnswerEvalReport>(
    join(reportsDir, 'answer-eval-report.json'),
  );
  const summary = buildFullSummary(ragReport, answerReport, runResults);
  const summaryPath = join(reportsDir, 'ai-eval-summary.md');
  const workspaceSummaryPath = join(
    process.cwd(),
    '../../..',
    'reports',
    'ai-eval-summary.md',
  );

  await writeFile(summaryPath, `${summary}\n`, 'utf8');
  await mkdir(join(process.cwd(), '../../..', 'reports'), { recursive: true });
  await writeFile(workspaceSummaryPath, `${summary}\n`, 'utf8');
  console.log(`Full AI eval summary written to ${summaryPath}`);
  console.log(`Workspace AI eval summary written to ${workspaceSummaryPath}`);

  if (runResults.some((result) => !result.ok)) {
    process.exitCode = 1;
  }
}

async function runEvaluationScript(scriptPath: string): Promise<FullEvalRunResult> {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['node_modules/ts-node/dist/bin.js', scriptPath],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
      },
    );

    child.on('error', (error) => {
      resolve({
        script: scriptPath,
        ok: false,
        error: error.message,
      });
    });

    child.on('exit', (code) => {
      resolve({
        script: scriptPath,
        ok: code === 0,
        ...(code === 0 ? {} : { error: `Exited with code ${code}` }),
      });
    });
  });
}

async function readReport<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function buildFullSummary(
  ragReport: RagEvalReport | null,
  answerReport: AnswerEvalReport | null,
  runResults: FullEvalRunResult[],
) {
  const judgeAvailable = hasJudgeResults(answerReport);
  const priorityIssues = buildPriorityIssues(
    ragReport,
    answerReport,
    judgeAvailable,
    runResults,
  );
  const weakRetrievalCases = findWeakRetrievalCases(ragReport);
  const weakAnswerCases = findWeakAnswerCases(answerReport);
  const ragErrorAnalysisRows = buildRagErrorAnalysis(ragReport?.cases ?? []);
  const answerErrorAnalysisRows = buildAnswerErrorAnalysis(
    answerReport?.cases ?? [],
  );
  const combinedWeakCases = buildCombinedWeakCases(
    weakRetrievalCases,
    weakAnswerCases,
  );
  const retrievalFailedCases = ragReport?.cases.filter((item) => item.error)
    .length ?? 0;
  const answerFailedCases = answerReport?.cases.filter((item) => item.error)
    .length ?? 0;

  return [
    '# AI/RAG Evaluation Report',
    '',
    '## 1. Run Information',
    '',
    `- Run time: ${new Date().toISOString()}`,
    `- Eval source: ${process.env.EVAL_SOURCE === 'smoke' ? 'smoke' : 'database'}`,
    `- Retrieval run: ${formatRunStatus(runResults[0])}`,
    `- Answer run: ${formatRunStatus(runResults[1])}`,
    `- Total cases: retrieval ${formatCount(
      ragReport?.summary.total_cases,
    )}; answer ${formatCount(answerReport?.summary.total_cases)}`,
    `- Evaluated cases: retrieval ${formatCount(
      ragReport?.summary.evaluated_cases,
    )}; answer ${formatCount(answerReport?.summary.evaluated_cases)}`,
    `- Skipped cases: retrieval ${formatCount(
      ragReport?.summary.skipped_cases,
    )}; answer ${formatCount(answerReport?.summary.skipped_cases)}`,
    `- Failed cases: retrieval ${retrievalFailedCases}; answer ${answerFailedCases}`,
    '',
    '### Vector Retrieval Diagnostics',
    '',
    ...formatVectorDiagnostics(ragReport),
    '',
    '### Blocking Details',
    '',
    ...buildBlockingDetails(ragReport, answerReport, runResults),
    '',
    '## 2. Before vs After RAG Comparison',
    '',
    ...formatBeforeAfterComparison(ragReport),
    '',
    '## 3. Retrieval / RAG Metrics',
    '',
    '| Metric | Score |',
    '| --- | ---: |',
    `| Hit@1 | ${formatMetric(ragReport?.summary.hit_at_1)} |`,
    `| Hit@3 | ${formatMetric(ragReport?.summary.hit_at_3)} |`,
    `| Hit@5 | ${formatMetric(ragReport?.summary.hit_at_5)} |`,
    `| Recall@5 | ${formatMetric(ragReport?.summary.recall_at_5)} |`,
    `| Precision@5 | ${formatMetric(ragReport?.summary.precision_at_5)} |`,
    `| MRR | ${formatMetric(ragReport?.summary.mrr)} |`,
    '',
    '## 4. Retrieval Interpretation',
    '',
    ...buildRetrievalInterpretation(ragReport),
    '',
    '## 5. LLM Answer Metrics',
    '',
    ...formatAnswerMetrics(answerReport, judgeAvailable, runResults[1]),
    '',
    '## Error Analysis',
    '',
    '### Retrieval',
    '',
    ...formatErrorAnalysisRows(ragErrorAnalysisRows),
    '',
    '### Answer',
    '',
    ...formatErrorAnalysisRows(answerErrorAnalysisRows),
    '',
    '## 6. Weak Cases',
    '',
    ...formatCombinedWeakCases(combinedWeakCases),
    '',
    '## 7. Conclusion',
    '',
    `- RAG MVP status: ${buildRetrievalConclusion(ragReport)}.`,
    `- LLM Answer MVP status: ${buildAnswerConclusion(
      answerReport,
      judgeAvailable,
    )}.`,
    '- Top 3 priorities:',
    '',
    ...priorityIssues.slice(0, 3).map((issue) => `  - ${issue}`),
    '',
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n');
}

function buildRetrievalConclusion(report: RagEvalReport | null) {
  if (!report) {
    return 'not passed, missing reports/rag-eval-report.json';
  }

  const { hit_at_5, recall_at_5, mrr } = report.summary;
  const passed = hit_at_5 >= 0.75 && recall_at_5 >= 0.65 && mrr >= 0.5;

  return passed
    ? 'passed minimum benchmark'
    : 'not passed minimum benchmark';
}

function buildRetrievalInterpretation(report: RagEvalReport | null) {
  if (!report) {
    return [
      '- Retrieval evaluation did not produce a JSON report.',
      '- No score is reported because the run did not complete.',
    ];
  }

  const notes: string[] = [];
  const { hit_at_5, recall_at_5, mrr } = report.summary;

  if (hit_at_5 >= 0.85) {
    notes.push('- Hit@5 >= 0.85: good retrieval quality.');
  } else if (hit_at_5 >= 0.75) {
    notes.push('- Hit@5 is from 0.75 to below 0.85: acceptable for MVP.');
  } else {
    notes.push('- Hit@5 < 0.75: retrieval needs improvement.');
  }

  if (mrr < 0.5) {
    notes.push('- MRR < 0.5: ranking quality is not good enough.');
  } else {
    notes.push('- MRR >= 0.5: relevant chunks usually appear reasonably high.');
  }

  if (recall_at_5 < 0.65) {
    notes.push('- Recall@5 < 0.65: retrieved context may be incomplete.');
  } else {
    notes.push('- Recall@5 >= 0.65: missing-context risk is acceptable.');
  }

  return notes;
}

function buildBlockingDetails(
  ragReport: RagEvalReport | null,
  answerReport: AnswerEvalReport | null,
  runResults: FullEvalRunResult[],
) {
  const details: string[] = [];

  details.push('- Checked: eval scripts exist and were executed via npm scripts.');

  if (runResults.some((result) => !result.ok)) {
    details.push(
      '- Missing/blocking: application context could not complete because database connection failed.',
    );
    details.push('- Observed error: connect ECONNREFUSED 127.0.0.1:5432.');
  }

  if (!ragReport) {
    details.push('- Missing output: reports/rag-eval-report.json was not produced.');
  }

  if (!answerReport) {
    details.push('- Missing output: reports/answer-eval-report.json was not produced.');
  }

  details.push('- Commands to rerun after DB/env is ready:');
  details.push('  - npm run eval:rag');
  details.push('  - npm run eval:answer');
  details.push('  - npm run eval:full');
  details.push('  - EVAL_SOURCE=smoke npm run eval:rag');

  return details;
}

function formatVectorDiagnostics(report: RagEvalReport | null) {
  const diagnostics = report?.diagnostics;

  if (!diagnostics) {
    return ['- Vector diagnostics unavailable.'];
  }

  return [
    `- Vector retrieval enabled: ${formatBoolean(diagnostics.vectorEnabled)}`,
    `- Embedding API key present: ${formatBoolean(diagnostics.embeddingApiKeyPresent)}`,
    `- Embedding base URL: ${diagnostics.embeddingBaseUrl ?? 'N/A'}`,
    `- Embedding endpoint: ${diagnostics.embeddingEndpoint ?? 'N/A'}`,
    `- Embedding model: ${diagnostics.embeddingModel ?? 'N/A'}`,
    `- Embedding dimension: ${diagnostics.embeddingDimension ?? 'N/A'}`,
    `- Node global fetch available: ${formatBoolean(diagnostics.hasGlobalFetch)}`,
    `- pgvector extension enabled: ${formatBoolean(diagnostics.pgvectorExtensionEnabled)}`,
    `- Theory chunks total: ${diagnostics.theoryChunksTotal ?? 'N/A'}`,
    `- Theory chunks with embedding: ${diagnostics.theoryChunksWithEmbedding ?? 'N/A'}`,
    `- Theory chunks missing embedding: ${diagnostics.theoryChunksMissingEmbedding ?? 'N/A'}`,
    `- Embedding dimensions in DB: ${diagnostics.embeddingDimensionsInDb?.join(', ') || 'N/A'}`,
    `- Embedding index count: ${diagnostics.embeddingIndexCount ?? 'N/A'}`,
    `- Cases with hybrid results: ${diagnostics.casesWithHybridResults ?? 'N/A'}`,
    `- Cases with vector results: ${diagnostics.casesWithVectorResults ?? 'N/A'}`,
    `- Cases fallback keyword only: ${diagnostics.casesFallbackKeywordOnly ?? 'N/A'}`,
  ];
}

function formatBeforeAfterComparison(report: RagEvalReport | null) {
  if (!report || report.summary.baseline_hit_at_1 === undefined) {
    return ['No keyword-only baseline metrics found in this report.'];
  }

  const summary = report.summary;

  return [
    '| Metric | Before: keyword-only baseline | After: hybrid/vector RAG | Delta |',
    '| --- | ---: | ---: | ---: |',
    comparisonRow('Hit@1', summary.baseline_hit_at_1, summary.hit_at_1),
    comparisonRow('Hit@3', summary.baseline_hit_at_3, summary.hit_at_3),
    comparisonRow('Hit@5', summary.baseline_hit_at_5, summary.hit_at_5),
    comparisonRow('Recall@5', summary.baseline_recall_at_5, summary.recall_at_5),
    comparisonRow(
      'Precision@5',
      summary.baseline_precision_at_5,
      summary.precision_at_5,
    ),
    comparisonRow('MRR', summary.baseline_mrr, summary.mrr),
  ];
}

function comparisonRow(
  metric: string,
  before: number | undefined,
  after: number,
) {
  const delta =
    typeof before === 'number' && Number.isFinite(before) ? after - before : 0;

  return `| ${metric} | ${formatMetric(before)} | ${formatMetric(
    after,
  )} | ${formatSignedMetric(delta)} |`;
}

function formatAnswerMetrics(
  report: AnswerEvalReport | null,
  judgeAvailable: boolean,
  answerRun: FullEvalRunResult | undefined,
) {
  if (!report) {
    return [
      'Answer evaluation did not produce a JSON report.',
      '',
      `Reason: ${answerRun?.error ?? 'missing reports/answer-eval-report.json'}.`,
      '',
      'Possible causes:',
      '',
      '- Missing LLM_API_KEY or OPENAI_API_KEY when LLM generation is required.',
      '- Missing expected answer data in AiTestCase.',
      '- Missing or failing answer generation method.',
      '- Database or application context failed before the eval loop.',
    ];
  }

  if (report.summary.evaluated_cases === 0) {
    return [
      'Answer evaluation produced a report, but no case was evaluated.',
      '',
      'Likely reason: test cases are missing expected answer data.',
    ];
  }

  return [
    '| Metric | Score |',
    '| --- | ---: |',
    `| Numeric Accuracy | ${formatMetric(report.summary.numeric_accuracy)} |`,
    `| Avg Concept Coverage | ${formatMetric(
      report.summary.avg_concept_coverage,
    )} |`,
    `| Avg Rule-based Score | ${formatMetric(
      report.summary.avg_rule_based_score,
    )} |`,
    ...(judgeAvailable
      ? [
          `| Avg Correctness | ${formatMetric(report.summary.avg_correctness)} |`,
          `| Avg Groundedness | ${formatMetric(report.summary.avg_groundedness)} |`,
          `| Avg Completeness | ${formatMetric(report.summary.avg_completeness)} |`,
          `| Avg Clarity | ${formatMetric(report.summary.avg_clarity)} |`,
          `| Avg Final Answer Score | ${formatMetric(
            report.summary.avg_final_answer_score,
          )} |`,
          `| Hallucination Rate | ${formatMetric(
            report.summary.hallucination_rate,
          )} |`,
        ]
      : []),
  ];
}

function buildAnswerConclusion(
  report: AnswerEvalReport | null,
  judgeAvailable: boolean,
) {
  if (!report) {
    return 'not passed, missing reports/answer-eval-report.json';
  }

  const ruleBasedPassed = report.summary.avg_rule_based_score >= 0.7;
  const judgePassed =
    !judgeAvailable ||
    (report.summary.avg_final_answer_score >= 3.5 &&
      report.summary.hallucination_rate <= 0.1);

  return ruleBasedPassed && judgePassed
    ? 'passed minimum benchmark'
    : 'not passed minimum benchmark';
}

function buildPriorityIssues(
  ragReport: RagEvalReport | null,
  answerReport: AnswerEvalReport | null,
  judgeAvailable: boolean,
  runResults: FullEvalRunResult[],
) {
  const issues: string[] = [];

  for (const result of runResults) {
    if (!result.ok) {
      issues.push(`${result.script} failed: ${result.error ?? 'unknown error'}`);
    }
  }

  if (!ragReport) {
    issues.push('Missing retrieval report for benchmark comparison.');
  } else {
    if (ragReport.summary.hit_at_5 < 0.75) {
      issues.push('Hit@5 is low: inspect embeddings, query rewrite, or chunk data.');
    }
    if (ragReport.summary.recall_at_5 < 0.65) {
      issues.push('Recall@5 is low: retrieved context may miss relevant chunks.');
    }
    if (ragReport.summary.mrr < 0.5) {
      issues.push('MRR is low: ranking does not place relevant chunks high enough.');
    }
  }

  if (!answerReport) {
    issues.push('Missing answer report for benchmark comparison.');
  } else {
    if (answerReport.summary.avg_rule_based_score < 0.7) {
      issues.push('Rule-based answer score is low: add expected answers or improve answer prompt.');
    }
    if (
      judgeAvailable &&
      answerReport.summary.avg_final_answer_score < 3.5
    ) {
      issues.push('Judge final score is low: improve correctness, completeness, or groundedness.');
    }
    if (judgeAvailable && answerReport.summary.hallucination_rate > 0.1) {
      issues.push('Hallucination rate is high: make answers rely on context and citations more clearly.');
    }
  }

  return issues.length > 0 ? issues : ['No clear priority issue detected.'];
}

function findWeakRetrievalCases(report: RagEvalReport | null) {
  if (!report) {
    return [];
  }

  return report.cases
    .filter(
      (item) =>
        !item.metrics.skipped &&
        (item.error || item.metrics.hitAt5 === 0 || item.metrics.recallAt5 < 1),
    )
    .sort((left, right) => {
      if (left.metrics.hitAt5 !== right.metrics.hitAt5) {
        return left.metrics.hitAt5 - right.metrics.hitAt5;
      }
      return left.metrics.recallAt5 - right.metrics.recallAt5;
    })
    .slice(0, 10);
}

function findWeakAnswerCases(report: AnswerEvalReport | null) {
  if (!report) {
    return [];
  }

  return report.cases
    .filter(
      (item) =>
        !item.skipped_reason &&
        (item.error ||
          item.metrics.ruleBasedScore < 0.7 ||
          (item.final_answer_score ?? 5) < 3.5),
    )
    .sort(
      (left, right) =>
        answerCaseScore(left) - answerCaseScore(right),
    )
    .slice(0, 10);
}

function findHallucinationCases(report: AnswerEvalReport | null) {
  if (!report) {
    return [];
  }

  return report.cases
    .filter((item) => item.hallucination === true)
    .slice(0, 10);
}

function buildCombinedWeakCases(
  retrievalCases: RagEvalCaseReport[],
  answerCases: AnswerEvalCaseReport[],
) {
  const answerById = new Map(
    answerCases.map((item) => [item.case_id, item]),
  );
  const combined = retrievalCases.map((retrievalCase) => ({
    case_id: retrievalCase.case_id,
    question: retrievalCase.question,
    expected_chunk_ids: retrievalCase.expected_chunk_ids,
    retrieved_chunk_ids: retrievalCase.retrieved_chunk_ids,
    retrieval_issue: retrievalReason(retrievalCase),
    answer_issue: answerById.has(retrievalCase.case_id)
      ? answerReason(answerById.get(retrievalCase.case_id) as AnswerEvalCaseReport, true)
      : '',
  }));
  const seen = new Set(combined.map((item) => item.case_id));

  for (const answerCase of answerCases) {
    if (seen.has(answerCase.case_id)) {
      continue;
    }

    combined.push({
      case_id: answerCase.case_id,
      question: answerCase.question,
      expected_chunk_ids: [],
      retrieved_chunk_ids: [],
      retrieval_issue: '',
      answer_issue: answerReason(answerCase, true),
    });
  }

  return combined.slice(0, 10);
}

function formatErrorAnalysisRows(
  rows: ReturnType<typeof buildRagErrorAnalysis | typeof buildAnswerErrorAnalysis>,
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

function formatCombinedWeakCases(
  cases: ReturnType<typeof buildCombinedWeakCases>,
) {
  if (cases.length === 0) {
    return ['No weak cases found in available reports.'];
  }

  return [
    '| Case ID | Question | Expected Chunk IDs | Retrieved Chunk IDs | Retrieval Issue | Answer Issue |',
    '| --- | --- | --- | --- | --- | --- |',
    ...cases.map(
      (item) =>
        `| ${escapeCell(item.case_id)} | ${escapeCell(
          truncate(item.question),
        )} | ${escapeCell(formatIds(item.expected_chunk_ids))} | ${escapeCell(
          formatIds(item.retrieved_chunk_ids),
        )} | ${escapeCell(item.retrieval_issue || '-')} | ${escapeCell(
          item.answer_issue || '-',
        )} |`,
    ),
  ];
}

function formatRetrievalCases(cases: RagEvalCaseReport[]) {
  if (cases.length === 0) {
    return ['No weak retrieval cases found.'];
  }

  return [
    '| Case ID | Question | Expected IDs | Retrieved IDs | Reason |',
    '| --- | --- | --- | --- | --- |',
    ...cases.map(
      (item) =>
        `| ${escapeCell(item.case_id)} | ${escapeCell(
          truncate(item.question),
        )} | ${escapeCell(item.expected_chunk_ids.join(', '))} | ${escapeCell(
          item.retrieved_chunk_ids.join(', '),
        )} | ${escapeCell(retrievalReason(item))} |`,
    ),
  ];
}

function formatAnswerCases(
  cases: AnswerEvalCaseReport[],
  includeJudgeReason = false,
) {
  if (cases.length === 0) {
    return ['No weak answer cases found.'];
  }

  return [
    '| Case ID | Question | Rule Score | Judge Score | Reason |',
    '| --- | --- | ---: | ---: | --- |',
    ...cases.map(
      (item) =>
        `| ${escapeCell(item.case_id)} | ${escapeCell(
          truncate(item.question),
        )} | ${formatMetric(item.metrics.ruleBasedScore)} | ${formatMetric(
          item.final_answer_score,
        )} | ${escapeCell(answerReason(item, includeJudgeReason))} |`,
    ),
  ];
}

function retrievalReason(item: RagEvalCaseReport) {
  if (item.error) {
    return item.error;
  }
  if (item.metrics.hitAt5 === 0) {
    return 'No expected chunk found in top 5';
  }
  if (item.metrics.recallAt5 < 1) {
    return 'Some expected chunks missing from top 5';
  }
  return item.skipped_reason ?? 'Weak retrieval case';
}

function answerReason(
  item: AnswerEvalCaseReport,
  includeJudgeReason: boolean,
) {
  if (item.error) {
    return item.error;
  }
  if (includeJudgeReason && item.judge_reason) {
    return item.judge_reason;
  }
  if (item.hallucination) {
    return 'Hallucination flagged by judge';
  }
  if ((item.final_answer_score ?? 5) < 3.5) {
    return 'Low judge final score';
  }
  if (item.metrics.numericCorrect === false) {
    return 'Numeric answer mismatch';
  }
  if ((item.metrics.conceptCoverage ?? 1) < 0.7) {
    return 'Low concept coverage';
  }
  return item.skipped_reason ?? 'Low rule-based score';
}

function hasJudgeResults(report: AnswerEvalReport | null) {
  return Boolean(
    report?.cases.some((item) => item.judge_scores || item.hallucination),
  );
}

function answerCaseScore(item: AnswerEvalCaseReport) {
  return item.final_answer_score ?? item.metrics.ruleBasedScore * 5;
}

function formatRunStatus(result: FullEvalRunResult | undefined) {
  if (!result) {
    return 'not run';
  }

  return result.ok ? 'ok' : `failed (${result.error ?? 'unknown error'})`;
}

function formatCount(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : 'N/A';
}

function formatBoolean(value: boolean | undefined) {
  return value === undefined ? 'N/A' : value ? 'true' : 'false';
}

function formatMetric(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(4)
    : 'N/A';
}

function formatSignedMetric(value: number) {
  if (!Number.isFinite(value)) {
    return 'N/A';
  }

  return `${value >= 0 ? '+' : ''}${value.toFixed(4)}`;
}

function formatIds(ids: string[]) {
  return ids.length > 0 ? ids.join(', ') : '-';
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
