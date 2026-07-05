import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type EvalCase = {
  id: string;
  question?: string;
  expectedChunkIds?: string[];
  expected?: {
    relevant_chunk_ids?: string[];
    [key: string]: unknown;
  };
  reviewStatus?: string;
  [key: string]: unknown;
};

type HumanDecision =
  | {
      action: 'keep_gold';
      rationale?: string;
    }
  | {
      action: 'replace_gold_with_candidate';
      candidateChunkIds: string[];
      rationale?: string;
    }
  | {
      action: 'add_candidate_as_additional_gold';
      candidateChunkIds: string[];
      rationale?: string;
    }
  | {
      action: 'rewrite_question';
      rewrittenQuestion: string;
      rationale?: string;
    }
  | {
      action: 'drop_case';
      rationale?: string;
    };

type GoldReviewItem = {
  caseId: string;
  humanDecision: null | HumanDecision;
};

type GoldReviewReport = {
  items: GoldReviewItem[];
};

type ApplySummary = {
  generatedAt: string;
  inputPreview: string;
  inputReview: string;
  outputReviewed: string;
  totalPreviewCases: number;
  totalReviewedCases: number;
  humanDecisionCount: number;
  keptGold: number;
  replacedGold: number;
  addedGold: number;
  rewroteQuestion: number;
  droppedCases: number;
  unchangedNoDecision: number;
  appliedCaseIds: string[];
};

const EVAL_DIR = join(process.cwd(), '..', '..', '..', 'data', 'eval');
const PREVIEW_PATH =
  process.env.REAL_EVAL_PREVIEW_PATH ??
  join(EVAL_DIR, 'real-eval-50.preview.json');
const REVIEW_PATH =
  process.env.REAL_EVAL_GOLD_REVIEW_PATH ??
  join(EVAL_DIR, 'real-eval-50.gold-review.json');
const REVIEWED_PATH =
  process.env.REAL_EVAL_REVIEWED_PATH ??
  join(EVAL_DIR, 'real-eval-50.reviewed.json');
const APPLY_REPORT_PATH = join(EVAL_DIR, 'real-eval-50.reviewed.apply-report.md');

async function main() {
  const previewCases = await readJson<EvalCase[]>(PREVIEW_PATH);
  const review = await readJson<GoldReviewReport>(REVIEW_PATH);
  const decisionsById = new Map(
    review.items
      .filter((item) => isHumanDecision(item.humanDecision))
      .map((item) => [item.caseId, item.humanDecision as HumanDecision]),
  );
  const outputCases: EvalCase[] = [];
  const summary: ApplySummary = {
    generatedAt: new Date().toISOString(),
    inputPreview: PREVIEW_PATH,
    inputReview: REVIEW_PATH,
    outputReviewed: REVIEWED_PATH,
    totalPreviewCases: previewCases.length,
    totalReviewedCases: 0,
    humanDecisionCount: decisionsById.size,
    keptGold: 0,
    replacedGold: 0,
    addedGold: 0,
    rewroteQuestion: 0,
    droppedCases: 0,
    unchangedNoDecision: 0,
    appliedCaseIds: [],
  };

  for (const testCase of previewCases) {
    const decision = decisionsById.get(testCase.id);

    if (!decision) {
      summary.unchangedNoDecision += 1;
      outputCases.push(testCase);
      continue;
    }

    summary.appliedCaseIds.push(testCase.id);

    if (decision.action === 'drop_case') {
      summary.droppedCases += 1;
      continue;
    }

    const nextCase = structuredClone(testCase);

    if (decision.action === 'keep_gold') {
      summary.keptGold += 1;
      nextCase.reviewStatus = 'gold_reviewed_keep';
    } else if (decision.action === 'replace_gold_with_candidate') {
      summary.replacedGold += 1;
      setExpectedChunkIds(nextCase, decision.candidateChunkIds);
      nextCase.reviewStatus = 'gold_reviewed_replaced';
    } else if (decision.action === 'add_candidate_as_additional_gold') {
      summary.addedGold += 1;
      setExpectedChunkIds(nextCase, [
        ...readExpectedChunkIds(nextCase),
        ...decision.candidateChunkIds,
      ]);
      nextCase.reviewStatus = 'gold_reviewed_added';
    } else if (decision.action === 'rewrite_question') {
      summary.rewroteQuestion += 1;
      nextCase.question = decision.rewrittenQuestion;
      nextCase.reviewStatus = 'gold_reviewed_rewritten_question';
    }

    outputCases.push(nextCase);
  }

  summary.totalReviewedCases = outputCases.length;

  await mkdir(EVAL_DIR, { recursive: true });
  await writeFile(REVIEWED_PATH, `${JSON.stringify(outputCases, null, 2)}\n`, 'utf8');
  await writeFile(APPLY_REPORT_PATH, `${buildApplyMarkdown(summary)}\n`, 'utf8');

  console.log(`Reviewed eval written to ${REVIEWED_PATH}`);
  console.log(`Apply report written to ${APPLY_REPORT_PATH}`);
  console.log(JSON.stringify(summary, null, 2));
}

function setExpectedChunkIds(testCase: EvalCase, chunkIds: string[]) {
  const normalized = normalizeChunkIds(chunkIds);
  testCase.expectedChunkIds = normalized;
  testCase.expected = {
    ...(testCase.expected ?? {}),
    relevant_chunk_ids: normalized,
  };
}

function readExpectedChunkIds(testCase: EvalCase) {
  return normalizeChunkIds(
    testCase.expected?.relevant_chunk_ids ?? testCase.expectedChunkIds ?? [],
  );
}

function normalizeChunkIds(values: unknown[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values) {
    const id = typeof value === 'string' ? value.trim() : '';
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    normalized.push(id);
  }

  return normalized;
}

function isHumanDecision(value: unknown): value is HumanDecision {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const decision = value as Record<string, unknown>;
  if (decision.action === 'keep_gold' || decision.action === 'drop_case') {
    return true;
  }
  if (
    (decision.action === 'replace_gold_with_candidate' ||
      decision.action === 'add_candidate_as_additional_gold') &&
    Array.isArray(decision.candidateChunkIds) &&
    decision.candidateChunkIds.every((item) => typeof item === 'string')
  ) {
    return true;
  }
  if (
    decision.action === 'rewrite_question' &&
    typeof decision.rewrittenQuestion === 'string' &&
    decision.rewrittenQuestion.trim()
  ) {
    return true;
  }

  return false;
}

function buildApplyMarkdown(summary: ApplySummary) {
  return [
    '# Real Eval 50 Gold Review Apply Report',
    '',
    `- Run time: ${summary.generatedAt}`,
    `- Preview: \`${summary.inputPreview}\``,
    `- Gold review: \`${summary.inputReview}\``,
    `- Reviewed output: \`${summary.outputReviewed}\``,
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Preview cases | ${summary.totalPreviewCases} |`,
    `| Reviewed cases | ${summary.totalReviewedCases} |`,
    `| Human decisions | ${summary.humanDecisionCount} |`,
    `| Keep gold | ${summary.keptGold} |`,
    `| Replace gold | ${summary.replacedGold} |`,
    `| Add gold | ${summary.addedGold} |`,
    `| Rewrite question | ${summary.rewroteQuestion} |`,
    `| Drop case | ${summary.droppedCases} |`,
    `| No decision, unchanged | ${summary.unchangedNoDecision} |`,
    '',
    '## Applied Cases',
    '',
    summary.appliedCaseIds.length > 0
      ? summary.appliedCaseIds.map((id) => `- ${id}`).join('\n')
      : 'No human decisions were present, so no gold labels were changed.',
  ].join('\n');
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
