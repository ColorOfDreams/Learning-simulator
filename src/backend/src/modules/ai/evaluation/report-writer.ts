import { buildRagErrorAnalysis } from './error-analysis';

type RagEvalMetrics = {
  skipped?: boolean;
  hitAt1?: number;
  hitAt3?: number;
  hitAt5?: number;
  recallAt5?: number;
  precisionAt5?: number;
  reciprocalRank?: number;
  firstRelevantRank?: number;
  skipReason?: string;
};

type RagEvalCase = {
  case_id?: string;
  question?: string;
  subject?: string;
  grade?: number;
  topic?: string;
  expected_chunk_ids?: string[];
  retrieved_chunk_ids?: string[];
  top_chunks?: {
    id?: string;
    title?: string;
    topic?: string;
    source?: string;
    score?: number;
    vectorScore?: number;
    keywordScore?: number;
    retrievalType?: string;
  }[];
  metrics?: RagEvalMetrics;
  skipped_reason?: string;
  error?: string;
};

export type RagEvalSummaryInput = {
  generated_at?: string;
  diagnostics?: {
    vectorEnabled?: boolean;
    embeddingConfigured?: boolean;
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
  cases: RagEvalCase[];
};

type BenchmarkRow = {
  metric: string;
  value: number;
  benchmark: string;
  status: 'pass' | 'warn' | 'fail' | 'track';
};

export function buildRagEvalMarkdownSummary(report: RagEvalSummaryInput) {
  const failedCases = report.cases.filter((item) => Boolean(item.error));
  const weakCases = findWeakCases(report.cases);
  const benchmarkRows = buildBenchmarkRows(report);
  const errorAnalysisRows = buildRagErrorAnalysis(report.cases);

  return [
    '# AI/RAG Retrieval Evaluation Summary',
    '',
    `- Run time: ${report.generated_at ?? new Date().toISOString()}`,
    '',
    '## Cases',
    '',
    `- Total: ${report.summary.total_cases}`,
    `- Evaluated: ${report.summary.evaluated_cases}`,
    `- Skipped: ${report.summary.skipped_cases}`,
    `- Failed: ${failedCases.length}`,
    '',
    '## Vector Retrieval Diagnostics',
    '',
    ...formatVectorDiagnostics(report),
    '',
    '## Before vs After RAG Comparison',
    '',
    ...formatBeforeAfterComparison(report),
    '',
    '## Metrics',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Hit@1 | ${formatMetric(report.summary.hit_at_1)} |`,
    `| Hit@3 | ${formatMetric(report.summary.hit_at_3)} |`,
    `| Hit@5 | ${formatMetric(report.summary.hit_at_5)} |`,
    `| Recall@5 | ${formatMetric(report.summary.recall_at_5)} |`,
    `| Precision@5 | ${formatMetric(report.summary.precision_at_5)} |`,
    `| MRR | ${formatMetric(report.summary.mrr)} |`,
    '',
    '## Benchmark Comparison',
    '',
    '| Metric | Score | Benchmark | Status |',
    '| --- | ---: | --- | --- |',
    ...benchmarkRows.map(
      (item) =>
        `| ${item.metric} | ${formatMetric(item.value)} | ${escapeCell(
          item.benchmark,
        )} | ${formatStatus(item.status)} |`,
    ),
    '',
    '## Automatic Notes',
    '',
    ...buildAutomaticNotes(report),
    '',
    '## Error Analysis',
    '',
    ...formatErrorAnalysisRows(errorAnalysisRows),
    '',
    '## Top 10 Weak Or Failed Cases',
    '',
    weakCases.length > 0
      ? '| Case ID | Question | Expected IDs | Retrieved IDs | Reason |'
      : 'No weak or failed cases found.',
    weakCases.length > 0 ? '| --- | --- | --- | --- | --- |' : '',
    ...weakCases.map(
      (item) =>
        `| ${escapeCell(item.case_id ?? 'unknown')} | ${escapeCell(
          truncate(item.question ?? ''),
        )} | ${escapeCell(formatIds(item.expected_chunk_ids))} | ${escapeCell(
          formatIds(item.retrieved_chunk_ids),
        )} | ${escapeCell(getWeakCaseReason(item))} |`,
    ),
    '',
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n');
}

function formatBeforeAfterComparison(report: RagEvalSummaryInput) {
  const summary = report.summary;
  const hasBaseline = summary.baseline_hit_at_1 !== undefined;

  if (!hasBaseline) {
    return ['No keyword-only baseline metrics found in this report.'];
  }

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

  return `| ${metric} | ${formatMaybeMetric(before)} | ${formatMetric(
    after,
  )} | ${formatSignedMetric(delta)} |`;
}

function formatVectorDiagnostics(report: RagEvalSummaryInput) {
  const diagnostics = report.diagnostics;

  if (!diagnostics) {
    return ['Vector diagnostics unavailable.'];
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

function buildBenchmarkRows(report: RagEvalSummaryInput): BenchmarkRow[] {
  const hitAt5 = report.summary.hit_at_5;
  const recallAt5 = report.summary.recall_at_5;
  const mrr = report.summary.mrr;

  return [
    {
      metric: 'Hit@1',
      value: report.summary.hit_at_1,
      benchmark: 'Tracking only; no fixed threshold yet',
      status: 'track',
    },
    {
      metric: 'Hit@3',
      value: report.summary.hit_at_3,
      benchmark: 'Tracking only; no fixed threshold yet',
      status: 'track',
    },
    {
      metric: 'Hit@5',
      value: hitAt5,
      benchmark: '>= 0.85 good; 0.75-0.85 acceptable; < 0.75 needs improvement',
      status: hitAt5 >= 0.85 ? 'pass' : hitAt5 >= 0.75 ? 'warn' : 'fail',
    },
    {
      metric: 'Recall@5',
      value: recallAt5,
      benchmark: '>= 0.65 required to reduce missing-context risk',
      status: recallAt5 >= 0.65 ? 'pass' : 'fail',
    },
    {
      metric: 'Precision@5',
      value: report.summary.precision_at_5,
      benchmark: 'Tracking only; affected by number of gold chunks',
      status: 'track',
    },
    {
      metric: 'MRR',
      value: mrr,
      benchmark: '>= 0.50 required for acceptable ranking quality',
      status: mrr >= 0.5 ? 'pass' : 'fail',
    },
  ];
}

function buildAutomaticNotes(report: RagEvalSummaryInput) {
  const notes: string[] = [];
  const hitAt5 = report.summary.hit_at_5;

  if (hitAt5 >= 0.85) {
    notes.push('- Hit@5: good.');
  } else if (hitAt5 >= 0.75) {
    notes.push('- Hit@5: acceptable.');
  } else {
    notes.push('- Hit@5: needs improvement.');
  }

  if (report.summary.mrr < 0.5) {
    notes.push('- MRR < 0.5: ranking quality is not good enough.');
  }

  if (report.summary.recall_at_5 < 0.65) {
    notes.push('- Recall@5 < 0.65: retrieved context may be incomplete.');
  }

  return notes;
}

function formatErrorAnalysisRows(
  rows: ReturnType<typeof buildRagErrorAnalysis>,
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

function findWeakCases(cases: RagEvalCase[]) {
  return cases
    .filter((item) => Boolean(getWeakCaseReason(item)))
    .sort((left, right) => weakCasePriority(left) - weakCasePriority(right))
    .slice(0, 10);
}

function weakCasePriority(item: RagEvalCase) {
  if (item.error) {
    return 0;
  }
  if (item.metrics?.skipped) {
    return 1;
  }
  if ((item.metrics?.hitAt5 ?? 0) === 0) {
    return 2;
  }
  if ((item.metrics?.recallAt5 ?? 1) < 0.65) {
    return 3;
  }
  if ((item.metrics?.reciprocalRank ?? 1) < 0.5) {
    return 4;
  }
  return 5;
}

function getWeakCaseReason(item: RagEvalCase) {
  if (item.error) {
    return `Failed: ${item.error}`;
  }
  if (item.metrics?.skipped) {
    return item.skipped_reason ?? item.metrics.skipReason ?? 'Skipped';
  }
  if ((item.metrics?.hitAt5 ?? 0) === 0) {
    return 'No expected chunk retrieved in top 5';
  }
  if ((item.metrics?.recallAt5 ?? 1) < 0.65) {
    return 'Low Recall@5';
  }
  if ((item.metrics?.reciprocalRank ?? 1) < 0.5) {
    return 'Relevant chunk ranked too low';
  }
  return '';
}

function formatMetric(value: number) {
  return Number.isFinite(value) ? value.toFixed(4) : '0.0000';
}

function formatMaybeMetric(value: number | undefined) {
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

function formatBoolean(value: boolean | undefined) {
  return value === undefined ? 'N/A' : value ? 'true' : 'false';
}

function formatStatus(status: BenchmarkRow['status']) {
  const labels: Record<BenchmarkRow['status'], string> = {
    pass: 'PASS',
    warn: 'WARN',
    fail: 'FAIL',
    track: 'TRACK',
  };

  return labels[status];
}

function formatIds(ids?: string[]) {
  return ids && ids.length > 0 ? ids.join(', ') : '-';
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
