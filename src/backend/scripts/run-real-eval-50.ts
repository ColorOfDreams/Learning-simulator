import { spawn } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

type EvalCase = {
  id: string;
  subject: string;
  questionType?: string;
};

type RagReport = {
  summary: Record<string, number>;
  cases: Array<{
    case_id: string;
    metrics: {
      hitAt5: number;
      recallAt5: number;
      reciprocalRank: number;
      skipped?: boolean;
    };
  }>;
};

type AnswerReport = {
  summary: Record<string, number | string>;
  cases: Array<{
    case_id: string;
    metrics: {
      numericCorrect: boolean | null;
      conceptCoverage: number | null;
      ruleBasedScore: number;
    };
    final_answer_score?: number;
    hallucination?: boolean;
    judge_reason?: string;
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
];

async function main() {
  const reportsDir = join(process.cwd(), 'reports');
  const evalFile = join(process.cwd(), '..', '..', '..', 'data', 'eval', 'real-eval-50.preview.json');
  const env = {
    ...process.env,
    EVAL_CASES_PATH: evalFile,
    EVAL_TOP_K: process.env.EVAL_TOP_K ?? '10',
    EVAL_USE_LLM: process.env.EVAL_USE_LLM ?? 'true',
    EVAL_AI_METHOD:
      process.env.EVAL_AI_METHOD ?? process.env.ANSWER_AI_METHOD ?? 'chat',
    ANSWER_JUDGE_ENABLED: process.env.ANSWER_JUDGE_ENABLED ?? 'true',
  };

  if (process.argv.includes('--help')) {
    console.log('Usage: npm run eval:real-50 [-- --report-only]');
    return;
  }

  if (!process.argv.includes('--report-only')) {
    await runTsNode('scripts/eval-full-ai.ts', env);
  }

  const cases = await readJson<EvalCase[]>(evalFile);
  const ragReport = await readJson<RagReport>(join(reportsDir, 'rag-eval-report.json'));
  const answerReport = await readJson<AnswerReport>(
    join(reportsDir, 'answer-eval-report.json'),
  );
  const stamp = timestamp();
  const summary = buildSummary(cases, ragReport, answerReport, evalFile);
  const summaryPath = join(reportsDir, `real-eval-50-summary-${stamp}.md`);
  const latestPath = join(reportsDir, 'real-eval-50-summary-latest.md');
  const snapshotDir = join(reportsDir, 'real-eval-50', stamp);

  await mkdir(reportsDir, { recursive: true });
  await writeFile(summaryPath, `${summary}\n`, 'utf8');
  await writeFile(latestPath, `${summary}\n`, 'utf8');
  await mkdir(snapshotDir, { recursive: true });
  await copyFile(summaryPath, join(snapshotDir, basename(summaryPath)));

  for (const fileName of REPORT_FILES) {
    try {
      await copyFile(join(reportsDir, fileName), join(snapshotDir, basename(fileName)));
    } catch {
      // Optional report may be absent if a sub-step failed.
    }
  }

  console.log(`Real eval 50 summary written to ${summaryPath}`);
  console.log(`Latest summary written to ${latestPath}`);
  console.log(`Snapshot written to ${snapshotDir}`);
}

function buildSummary(
  cases: EvalCase[],
  ragReport: RagReport,
  answerReport: AnswerReport,
  evalFile: string,
) {
  const judgeEnabled = answerReport.cases.some(
    (item) => item.final_answer_score !== undefined,
  );
  const weakAnswer = answerReport.cases
    .filter(
      (item) =>
        !item.skipped_reason &&
        (item.metrics.ruleBasedScore < 0.7 ||
          (item.final_answer_score ?? 5) < 3.5),
    )
    .slice(0, 12);
  const weakRetrieval = ragReport.cases
    .filter((item) => !item.metrics.skipped && item.metrics.hitAt5 === 0)
    .slice(0, 12);

  return [
    '# Real Eval 50 Summary',
    '',
    `- Run time: ${new Date().toISOString()}`,
    `- Eval file: \`${evalFile}\``,
    `- Total preview cases: ${cases.length}`,
    `- Cases by subject: ${formatCounts(countBy(cases, (item) => item.subject))}`,
    `- Cases by type: ${formatCounts(countBy(cases, (item) => item.questionType ?? 'unknown'))}`,
    '',
    '## Retrieval Metrics',
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Evaluated | ${formatCount(ragReport.summary.evaluated_cases)} / ${formatCount(ragReport.summary.total_cases)} |`,
    `| Skipped | ${formatCount(ragReport.summary.skipped_cases)} |`,
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
    `| Evaluated | ${formatCount(answerReport.summary.evaluated_cases)} / ${formatCount(answerReport.summary.total_cases)} |`,
    `| Skipped | ${formatCount(answerReport.summary.skipped_cases)} |`,
    `| Numeric accuracy | ${formatMetric(answerReport.summary.numeric_accuracy)} |`,
    `| Avg concept coverage | ${formatMetric(answerReport.summary.avg_concept_coverage)} |`,
    `| Avg rule-based score | ${formatMetric(answerReport.summary.avg_rule_based_score)} |`,
    `| Avg final answer score | ${formatMetricIf(answerReport.summary.avg_final_answer_score, judgeEnabled)} |`,
    `| Hallucination rate | ${formatMetricIf(answerReport.summary.hallucination_rate, judgeEnabled)} |`,
    `| Model | ${answerReport.summary.model ?? 'N/A'} |`,
    '',
    '## Weak Retrieval Cases',
    '',
    ...formatWeakRetrieval(weakRetrieval),
    '',
    '## Weak Answer Cases',
    '',
    ...formatWeakAnswer(weakAnswer),
  ].join('\n');
}

function formatWeakRetrieval(cases: RagReport['cases']) {
  if (cases.length === 0) {
    return ['No Hit@5 retrieval misses found.'];
  }

  return [
    '| Case ID | Hit@5 | Recall@5 | MRR contribution |',
    '| --- | ---: | ---: | ---: |',
    ...cases.map(
      (item) =>
        `| ${item.case_id} | ${formatMetric(item.metrics.hitAt5)} | ${formatMetric(
          item.metrics.recallAt5,
        )} | ${formatMetric(item.metrics.reciprocalRank)} |`,
    ),
  ];
}

function formatWeakAnswer(cases: AnswerReport['cases']) {
  if (cases.length === 0) {
    return ['No weak answer cases found.'];
  }

  return [
    '| Case ID | Rule score | Judge score | Numeric | Concept coverage | Reason |',
    '| --- | ---: | ---: | --- | ---: | --- |',
    ...cases.map(
      (item) =>
        `| ${item.case_id} | ${formatMetric(
          item.metrics.ruleBasedScore,
        )} | ${formatMetric(item.final_answer_score)} | ${formatNullableBoolean(
          item.metrics.numericCorrect,
        )} | ${formatMetric(item.metrics.conceptCoverage)} | ${escapeCell(
          item.judge_reason ?? item.skipped_reason ?? '',
        )} |`,
    ),
  ];
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

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts: Record<string, number> = {};

  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function formatCounts(counts: Record<string, number>) {
  return Object.entries(counts)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
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

function formatNullableBoolean(value: boolean | null) {
  if (value === null) {
    return 'N/A';
  }

  return value ? 'pass' : 'fail';
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
