import { spawn } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

type RagReport = {
  summary: Record<string, number>;
  cases: Array<{
    case_id: string;
    question: string;
    expected_chunk_ids: string[];
    retrieved_chunk_ids: string[];
    metrics: {
      hitAt1: number;
      hitAt3: number;
      hitAt5: number;
      recallAt5: number;
      precisionAt5: number;
      reciprocalRank: number;
      skipped?: boolean;
    };
    skipped_reason?: string;
  }>;
};

type AnswerReport = {
  summary: Record<string, number | string>;
  cases: Array<{
    case_id: string;
    question: string;
    expected_answer?: {
      type?: string;
      value?: unknown;
      unit?: string;
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
    final_answer_score?: number;
    judge_reason?: string;
    hallucination?: boolean;
    judge_scores?: Record<string, number>;
    skipped_reason?: string;
  }>;
};

const REPORT_FILES = [
  'rag-eval-report.json',
  'rag-eval-summary.md',
  'answer-eval-report.json',
  'answer-eval-summary.md',
  'llm-answer-samples.md',
  'ai-eval-summary.md',
  'real-smoke-eval-report.md',
];

async function main() {
  const reportsDir = join(process.cwd(), 'reports');
  const smokeFile = join(process.cwd(), '..', '..', 'data', 'eval', 'rag-smoke-cases.json');
  const env = {
    ...process.env,
    EVAL_SOURCE: 'smoke',
    EVAL_SMOKE_FILE: smokeFile,
  };

  if (process.argv.includes('--help')) {
    console.log('Usage: npm run eval:real-smoke [-- --report-only]');
    return;
  }

  if (!process.argv.includes('--report-only')) {
    await runTsNode('scripts/eval-full-ai.ts', env);
  }

  const ragReport = await readJson<RagReport>(join(reportsDir, 'rag-eval-report.json'));
  const answerReport = await readJson<AnswerReport>(
    join(reportsDir, 'answer-eval-report.json'),
  );
  const markdown = buildRealSmokeReport(ragReport, answerReport, smokeFile);
  const reportPath = join(reportsDir, 'real-smoke-eval-report.md');
  const timestampDir = join(reportsDir, 'real-smoke-eval', timestamp());

  await writeFile(reportPath, `${markdown}\n`, 'utf8');
  await mkdir(timestampDir, { recursive: true });

  for (const fileName of REPORT_FILES) {
    try {
      await copyFile(join(reportsDir, fileName), join(timestampDir, basename(fileName)));
    } catch {
      // Some optional reports may be absent when a sub-step fails.
    }
  }

  console.log(`Real smoke eval report written to ${reportPath}`);
  console.log(`Snapshot written to ${timestampDir}`);
}

function runTsNode(script: string, env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['node_modules/ts-node/dist/bin.js', script],
      {
        cwd: process.cwd(),
        env,
        stdio: 'inherit',
      },
    );

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${script} exited with code ${code}`));
    });
  });
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function buildRealSmokeReport(
  ragReport: RagReport,
  answerReport: AnswerReport,
  smokeFile: string,
) {
  const answerById = new Map(answerReport.cases.map((item) => [item.case_id, item]));
  const judgeEnabled = answerReport.cases.some(
    (item) => item.final_answer_score !== undefined || item.judge_scores,
  );
  const weakRows = ragReport.cases
    .map((ragCase) => ({
      ragCase,
      answerCase: answerById.get(ragCase.case_id),
    }))
    .filter(
      ({ ragCase, answerCase }) =>
        ragCase.metrics.skipped ||
        ragCase.metrics.hitAt5 === 0 ||
        (answerCase?.metrics.ruleBasedScore ?? 0) < 0.7,
    )
    .slice(0, 10);

  return [
    '# Real Smoke Eval Report',
    '',
    `- Run time: ${new Date().toISOString()}`,
    `- Eval file: \`${smokeFile}\``,
    `- Retrieval cases: ${formatCount(ragReport.summary.total_cases)}, evaluated ${formatCount(ragReport.summary.evaluated_cases)}, skipped ${formatCount(ragReport.summary.skipped_cases)}`,
    `- Answer cases: ${formatCount(answerReport.summary.total_cases)}, evaluated ${formatCount(answerReport.summary.evaluated_cases)}, skipped ${formatCount(answerReport.summary.skipped_cases)}`,
    '',
    '## Retrieval Metrics',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Hit@1 | ${formatMetric(ragReport.summary.hit_at_1)} |`,
    `| Hit@3 | ${formatMetric(ragReport.summary.hit_at_3)} |`,
    `| Hit@5 | ${formatMetric(ragReport.summary.hit_at_5)} |`,
    `| Recall@5 | ${formatMetric(ragReport.summary.recall_at_5)} |`,
    `| Precision@5 | ${formatMetric(ragReport.summary.precision_at_5)} |`,
    `| MRR | ${formatMetric(ragReport.summary.mrr)} |`,
    '',
    '## Answer Metrics',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Numeric accuracy | ${formatMetric(answerReport.summary.numeric_accuracy)} |`,
    `| Avg concept coverage | ${formatMetric(answerReport.summary.avg_concept_coverage)} |`,
    `| Avg rule-based score | ${formatMetric(answerReport.summary.avg_rule_based_score)} |`,
    `| Avg correctness | ${formatMetricIf(answerReport.summary.avg_correctness, judgeEnabled)} |`,
    `| Avg groundedness | ${formatMetricIf(answerReport.summary.avg_groundedness, judgeEnabled)} |`,
    `| Avg completeness | ${formatMetricIf(answerReport.summary.avg_completeness, judgeEnabled)} |`,
    `| Avg clarity | ${formatMetricIf(answerReport.summary.avg_clarity, judgeEnabled)} |`,
    `| Avg citation usage | ${formatMetricIf(answerReport.summary.avg_citation_usage, judgeEnabled)} |`,
    `| Avg final answer score | ${formatMetricIf(answerReport.summary.avg_final_answer_score, judgeEnabled)} |`,
    `| Hallucination rate | ${formatMetricIf(answerReport.summary.hallucination_rate, judgeEnabled)} |`,
    '',
    judgeEnabled
      ? ''
      : 'LLM judge was not enabled, so correctness/groundedness/completeness/clarity/citation/hallucination are reported as N/A.',
    '',
    '## Answer Comparison',
    '',
    '| Case | Expected | AI answer | Numeric | Concept coverage | Missing concepts | Rule score |',
    '| --- | --- | --- | --- | ---: | --- | ---: |',
    ...answerReport.cases.map((item) => answerComparisonRow(item)),
    '',
    '## Weak Cases',
    '',
    weakRows.length > 0
      ? '| Case | Retrieval issue | Answer issue |'
      : 'No weak cases found.',
    weakRows.length > 0 ? '| --- | --- | --- |' : '',
    ...weakRows.map(({ ragCase, answerCase }) => {
      const retrievalIssue = ragCase.metrics.skipped
        ? ragCase.skipped_reason ?? 'Skipped'
        : ragCase.metrics.hitAt5 === 0
          ? 'No expected chunk in top 5'
          : '-';
      const answerIssue =
        (answerCase?.metrics.ruleBasedScore ?? 1) < 0.7
          ? `Rule score ${formatMetric(answerCase?.metrics.ruleBasedScore)}`
          : '-';
      return `| ${escapeCell(ragCase.case_id)} | ${escapeCell(
        retrievalIssue,
      )} | ${escapeCell(answerIssue)} |`;
    }),
    '',
  ]
    .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
    .join('\n');
}

function answerComparisonRow(item: AnswerReport['cases'][number]) {
  const expected = formatExpectedAnswer(item.expected_answer);
  const numeric =
    item.metrics.numericCorrect === null
      ? 'N/A'
      : item.metrics.numericCorrect
        ? 'pass'
        : 'fail';

  return `| ${escapeCell(item.case_id)} | ${escapeCell(expected)} | ${escapeCell(
    truncate(item.ai_answer, 260),
  )} | ${numeric} | ${formatMaybeMetric(
    item.metrics.conceptCoverage,
  )} | ${escapeCell(item.metrics.missingConcepts.join(', ') || '-')} | ${formatMetric(
    item.metrics.ruleBasedScore,
  )} |`;
}

function formatExpectedAnswer(expected: AnswerReport['cases'][number]['expected_answer']) {
  if (!expected) {
    return 'N/A';
  }

  const numeric =
    expected.value !== undefined
      ? `value=${String(expected.value)}${expected.unit ? ` ${expected.unit}` : ''}`
      : '';
  const reference =
    typeof expected.reference_answer === 'string'
      ? expected.reference_answer
      : '';

  return [numeric, reference].filter(Boolean).join(' | ') || expected.type || 'N/A';
}

function formatCount(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : 'N/A';
}

function formatMetric(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(4)
    : 'N/A';
}

function formatMetricIf(value: unknown, applicable: boolean) {
  return applicable ? formatMetric(value) : 'N/A';
}

function formatMaybeMetric(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(4)
    : 'N/A';
}

function truncate(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
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
