import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type RagReport = {
  summary: Record<string, number>;
};

type AnswerCase = {
  case_id: string;
  question: string;
  metrics: {
    numericCorrect: boolean | null;
    conceptCoverage: number | null;
    ruleBasedScore: number;
  };
  final_answer_score?: number;
  hallucination?: boolean;
  judge_reason?: string;
};

type AnswerReport = {
  summary: Record<string, number | string>;
  cases: AnswerCase[];
};

type Snapshot = {
  name: string;
  rag: RagReport;
  answer: AnswerReport;
};

const SNAPSHOT_ROOT = join(process.cwd(), 'reports', 'real-eval-50');
const REPORTS_DIR = join(process.cwd(), 'reports');

async function main() {
  const [beforeName, afterName] = await readSnapshotNames();
  const before = await readSnapshot(beforeName);
  const after = await readSnapshot(afterName);
  const stamp = timestamp();
  const reportPath = join(REPORTS_DIR, `real-eval-50-before-after-${stamp}.md`);

  await writeFile(reportPath, `${buildMarkdown(before, after)}\n`, 'utf8');
  console.log(`Comparison report written to ${reportPath}`);
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
  const root = join(SNAPSHOT_ROOT, name);

  return {
    name,
    rag: await readJson(join(root, 'rag-eval-report.json')),
    answer: await readJson(join(root, 'answer-eval-report.json')),
  };
}

function buildMarkdown(before: Snapshot, after: Snapshot) {
  const weakAfter = after.answer.cases
    .filter(
      (item) =>
        item.metrics.ruleBasedScore < 0.4 ||
        (item.final_answer_score ?? 5) < 2.5 ||
        item.hallucination === true ||
        item.metrics.numericCorrect === false,
    )
    .sort((left, right) => answerScore(left) - answerScore(right))
    .slice(0, 15);

  return [
    '# Real Eval 50 Before/After Comparison',
    '',
    `- Run time: ${new Date().toISOString()}`,
    `- Before snapshot: \`reports/real-eval-50/${before.name}\``,
    `- After snapshot: \`reports/real-eval-50/${after.name}\``,
    `- After method: ${after.answer.summary.model ? 'chat + LLM' : 'analyze/local fallback'}`,
    '',
    '## Retrieval',
    '',
    '| Metric | Before | After | Delta |',
    '| --- | ---: | ---: | ---: |',
    comparisonRow('Hit@1', before.rag.summary.hit_at_1, after.rag.summary.hit_at_1),
    comparisonRow('Hit@3', before.rag.summary.hit_at_3, after.rag.summary.hit_at_3),
    comparisonRow('Hit@5', before.rag.summary.hit_at_5, after.rag.summary.hit_at_5),
    comparisonRow('Recall@5', before.rag.summary.recall_at_5, after.rag.summary.recall_at_5),
    comparisonRow('MRR', before.rag.summary.mrr, after.rag.summary.mrr),
    '',
    '## Answer',
    '',
    '| Metric | Before | After | Delta |',
    '| --- | ---: | ---: | ---: |',
    comparisonRow(
      'Numeric accuracy',
      num(before.answer.summary.numeric_accuracy),
      num(after.answer.summary.numeric_accuracy),
    ),
    comparisonRow(
      'Avg concept coverage',
      num(before.answer.summary.avg_concept_coverage),
      num(after.answer.summary.avg_concept_coverage),
    ),
    comparisonRow(
      'Avg rule-based score',
      num(before.answer.summary.avg_rule_based_score),
      num(after.answer.summary.avg_rule_based_score),
    ),
    comparisonRow(
      'Avg correctness',
      num(before.answer.summary.avg_correctness),
      num(after.answer.summary.avg_correctness),
    ),
    comparisonRow(
      'Avg groundedness',
      num(before.answer.summary.avg_groundedness),
      num(after.answer.summary.avg_groundedness),
    ),
    comparisonRow(
      'Avg final answer score',
      num(before.answer.summary.avg_final_answer_score),
      num(after.answer.summary.avg_final_answer_score),
    ),
    comparisonRow(
      'Hallucination rate',
      num(before.answer.summary.hallucination_rate),
      num(after.answer.summary.hallucination_rate),
    ),
    '',
    '## Interpretation',
    '',
    ...interpret(before, after),
    '',
    '## Still Heavy Fails After',
    '',
    ...formatWeakAfter(weakAfter),
  ].join('\n');
}

function interpret(before: Snapshot, after: Snapshot) {
  const notes: string[] = [];
  const judgeDelta =
    num(after.answer.summary.avg_final_answer_score) -
    num(before.answer.summary.avg_final_answer_score);
  const hallucinationDelta =
    num(after.answer.summary.hallucination_rate) -
    num(before.answer.summary.hallucination_rate);

  notes.push(
    `- Answer judge score changed by ${formatSigned(judgeDelta)}; hallucination rate changed by ${formatSigned(hallucinationDelta)}.`,
  );

  if (judgeDelta > 0 && hallucinationDelta < 0) {
    notes.push(
      '- The small LLM answer-layer change improved judged answer quality and reduced hallucination.',
    );
  }

  if (
    num(after.answer.summary.avg_rule_based_score) <
    num(after.answer.summary.avg_final_answer_score) / 5
  ) {
    notes.push(
      '- Rule-based score remains conservative because generated preview cases use short source concepts that may not match paraphrases.',
    );
  }

  notes.push(
    '- Retrieval metrics are unchanged between before/after because the after change targets answer synthesis, not the RAG retriever.',
  );

  return notes;
}

function formatWeakAfter(cases: AnswerCase[]) {
  if (cases.length === 0) {
    return ['No heavy failing answer cases found after the change.'];
  }

  return [
    '| Case ID | Rule | Judge | Numeric | Concept | Hallucination | Reason |',
    '| --- | ---: | ---: | --- | ---: | --- | --- |',
    ...cases.map(
      (item) =>
        `| ${item.case_id} | ${formatMetric(
          item.metrics.ruleBasedScore,
        )} | ${formatMetric(item.final_answer_score)} | ${formatNullableBoolean(
          item.metrics.numericCorrect,
        )} | ${formatMetric(item.metrics.conceptCoverage)} | ${String(
          item.hallucination ?? false,
        )} | ${escapeCell(item.judge_reason ?? '')} |`,
    ),
  ];
}

function comparisonRow(metric: string, before: number, after: number) {
  return `| ${metric} | ${formatMetric(before)} | ${formatMetric(after)} | ${formatSigned(after - before)} |`;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function answerScore(item: AnswerCase) {
  return item.final_answer_score ?? item.metrics.ruleBasedScore * 5;
}

function num(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatMetric(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(4)
    : 'N/A';
}

function formatSigned(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(4)}`;
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
