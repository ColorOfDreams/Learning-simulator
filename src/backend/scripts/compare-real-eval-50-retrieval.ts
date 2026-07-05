import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type EvalCase = {
  id: string;
  subject?: string;
  grade?: number;
  questionType?: string;
};

type RagCase = {
  case_id: string;
  question: string;
  subject?: string;
  grade?: number;
  questionType?: string;
  expected_chunk_ids: string[];
  retrieved_chunk_ids: string[];
  metrics: {
    hitAt1: number;
    hitAt3: number;
    hitAt5: number;
    recallAt5: number;
    reciprocalRank: number;
    skipped?: boolean;
  };
};

type RagReport = {
  generated_at: string;
  summary: Record<string, number>;
  cases: RagCase[];
};

type Snapshot = {
  name: string;
  rag: RagReport;
};

type Metrics = {
  cases: number;
  hitAt1: number;
  hitAt3: number;
  hitAt5: number;
  recallAt5: number;
  mrr: number;
};

const SNAPSHOT_ROOT = join(process.cwd(), 'reports', 'real-eval-50');
const REPORTS_DIR = join(process.cwd(), 'reports');
const EVAL_FILE = join(
  process.cwd(),
  '..',
  '..',
  '..',
  'data',
  'eval',
  'real-eval-50.preview.json',
);

async function main() {
  const [beforeName, afterName] = await readSnapshotNames();
  const before = await readSnapshot(beforeName);
  const after = await readSnapshot(afterName);
  const evalCases = await readJson<EvalCase[]>(EVAL_FILE);
  const metadataById = new Map(evalCases.map((item) => [item.id, item]));
  const stamp = timestamp();
  const reportPath = join(
    REPORTS_DIR,
    `real-eval-50-retrieval-before-after-${stamp}.md`,
  );

  await writeFile(
    reportPath,
    `${buildMarkdown(before, after, metadataById)}\n`,
    'utf8',
  );
  console.log(`Retrieval comparison report written to ${reportPath}`);
}

async function readSnapshotNames() {
  const explicitBefore = process.env.BEFORE_REAL_EVAL_50_RUN;
  const explicitAfter = process.env.AFTER_REAL_EVAL_50_RUN;

  if (explicitBefore && explicitAfter) {
    return [explicitBefore, explicitAfter] as const;
  }

  const entries = (await readdir(SNAPSHOT_ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (entries.length < 2) {
    throw new Error('Need at least two real-eval-50 snapshots to compare.');
  }

  return [entries[entries.length - 2], entries[entries.length - 1]] as const;
}

async function readSnapshot(name: string): Promise<Snapshot> {
  return {
    name,
    rag: await readJson(join(SNAPSHOT_ROOT, name, 'rag-eval-report.json')),
  };
}

function buildMarkdown(
  before: Snapshot,
  after: Snapshot,
  metadataById: Map<string, EvalCase>,
) {
  const beforeCases = enrichCases(before.rag.cases, metadataById);
  const afterCases = enrichCases(after.rag.cases, metadataById);
  const improved = afterCases
    .filter((item) => {
      const previous = beforeCases.find((beforeCase) => beforeCase.case_id === item.case_id);
      return previous && previous.metrics.hitAt5 === 0 && item.metrics.hitAt5 === 1;
    })
    .map((item) => item.case_id);
  const regressed = afterCases
    .filter((item) => {
      const previous = beforeCases.find((beforeCase) => beforeCase.case_id === item.case_id);
      return previous && previous.metrics.hitAt5 === 1 && item.metrics.hitAt5 === 0;
    })
    .map((item) => item.case_id);
  const worstAfter = afterCases
    .filter((item) => !item.metrics.skipped && item.metrics.hitAt5 === 0)
    .sort((left, right) => left.metrics.reciprocalRank - right.metrics.reciprocalRank)
    .slice(0, 15);

  return [
    '# Real Eval 50 Retrieval Before/After',
    '',
    `- Run time: ${new Date().toISOString()}`,
    `- Before snapshot: \`reports/real-eval-50/${before.name}\``,
    `- After snapshot: \`reports/real-eval-50/${after.name}\``,
    `- Scope: retrieval/rerank only; answer metrics are intentionally excluded.`,
    '',
    '## Overall',
    '',
    '| Metric | Before | After | Delta |',
    '| --- | ---: | ---: | ---: |',
    comparisonRow('Hit@1', before.rag.summary.hit_at_1, after.rag.summary.hit_at_1),
    comparisonRow('Hit@3', before.rag.summary.hit_at_3, after.rag.summary.hit_at_3),
    comparisonRow('Hit@5', before.rag.summary.hit_at_5, after.rag.summary.hit_at_5),
    comparisonRow('Recall@5', before.rag.summary.recall_at_5, after.rag.summary.recall_at_5),
    comparisonRow('MRR', before.rag.summary.mrr, after.rag.summary.mrr),
    '',
    '## By Subject',
    '',
    formatGroupComparison(
      groupBy(beforeCases, (item) => item.subject ?? 'unknown'),
      groupBy(afterCases, (item) => item.subject ?? 'unknown'),
    ),
    '',
    '## By Question Type',
    '',
    formatGroupComparison(
      groupBy(beforeCases, (item) => item.questionType ?? 'unknown'),
      groupBy(afterCases, (item) => item.questionType ?? 'unknown'),
    ),
    '',
    '## Hit@5 Movement',
    '',
    `- Fixed Hit@5 misses: ${improved.join(', ') || 'none'}`,
    `- New Hit@5 regressions: ${regressed.join(', ') || 'none'}`,
    '',
    '## Worst Cases Still Failing',
    '',
    ...formatWorstCases(worstAfter),
  ].join('\n');
}

function enrichCases(cases: RagCase[], metadataById: Map<string, EvalCase>) {
  return cases.map((item) => {
    const metadata = metadataById.get(item.case_id);

    return {
      ...item,
      subject: item.subject ?? metadata?.subject,
      grade: item.grade ?? metadata?.grade,
      questionType: item.questionType ?? metadata?.questionType,
    };
  });
}

function groupBy(cases: RagCase[], getKey: (item: RagCase) => string) {
  const groups: Record<string, RagCase[]> = {};

  for (const item of cases.filter((caseItem) => !caseItem.metrics.skipped)) {
    const key = getKey(item);
    groups[key] = groups[key] ?? [];
    groups[key].push(item);
  }

  return Object.fromEntries(
    Object.entries(groups).map(([key, items]) => [key, metrics(items)]),
  );
}

function metrics(cases: RagCase[]): Metrics {
  return {
    cases: cases.length,
    hitAt1: average(cases, (item) => item.metrics.hitAt1),
    hitAt3: average(cases, (item) => item.metrics.hitAt3),
    hitAt5: average(cases, (item) => item.metrics.hitAt5),
    recallAt5: average(cases, (item) => item.metrics.recallAt5),
    mrr: average(cases, (item) => item.metrics.reciprocalRank),
  };
}

function formatGroupComparison(
  before: Record<string, Metrics>,
  after: Record<string, Metrics>,
) {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();

  return [
    '| Group | Cases | Hit@1 | Hit@3 | Hit@5 | Recall@5 | MRR |',
    '| --- | ---: | --- | --- | --- | --- | --- |',
    ...keys.map((key) => {
      const beforeMetrics = before[key];
      const afterMetrics = after[key];

      return `| ${escapeCell(key)} | ${afterMetrics?.cases ?? beforeMetrics?.cases ?? 0} | ${metricPair(beforeMetrics?.hitAt1, afterMetrics?.hitAt1)} | ${metricPair(beforeMetrics?.hitAt3, afterMetrics?.hitAt3)} | ${metricPair(beforeMetrics?.hitAt5, afterMetrics?.hitAt5)} | ${metricPair(beforeMetrics?.recallAt5, afterMetrics?.recallAt5)} | ${metricPair(beforeMetrics?.mrr, afterMetrics?.mrr)} |`;
    }),
  ].join('\n');
}

function formatWorstCases(cases: RagCase[]) {
  if (cases.length === 0) {
    return ['No Hit@5 failures remain.'];
  }

  return [
    '| Case | Subject | Grade | Type | RR | Expected | Retrieved top5 |',
    '| --- | --- | ---: | --- | ---: | --- | --- |',
    ...cases.map(
      (item) =>
        `| ${item.case_id} | ${item.subject ?? 'N/A'} | ${item.grade ?? 'N/A'} | ${item.questionType ?? 'N/A'} | ${formatMetric(item.metrics.reciprocalRank)} | ${escapeCell(item.expected_chunk_ids.join(', '))} | ${escapeCell(item.retrieved_chunk_ids.slice(0, 5).join(', '))} |`,
    ),
  ];
}

function comparisonRow(metric: string, before: unknown, after: unknown) {
  const beforeValue = num(before);
  const afterValue = num(after);

  return `| ${metric} | ${formatMetric(beforeValue)} | ${formatMetric(afterValue)} | ${formatSigned(afterValue - beforeValue)} |`;
}

function metricPair(before: number | undefined, after: number | undefined) {
  if (before === undefined || after === undefined) {
    return 'N/A';
  }

  return `${formatMetric(before)} -> ${formatMetric(after)} (${formatSigned(after - before)})`;
}

function average<T>(items: T[], getValue: (item: T) => number) {
  if (items.length === 0) {
    return 0;
  }

  return items.reduce((sum, item) => sum + getValue(item), 0) / items.length;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function num(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatMetric(value: number) {
  return Number.isFinite(value) ? value.toFixed(4) : 'N/A';
}

function formatSigned(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(4)}`;
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
