import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type PreviewCase = {
  id: string;
  question: string;
  subject?: string;
  grade?: number;
  questionType?: string;
  expectedChunkIds?: string[];
  sourceChunkExcerpt?: string;
  expected?: {
    relevant_chunk_ids?: string[];
  };
};

type DiagnosticCase = {
  testCaseId: string;
  subject?: string;
  grade?: number;
  questionType?: string;
  question: string;
  expectedChunkIds: string[];
  retrievedTop10ChunkIds: string[];
  bestGoldRank: number | null;
  metrics: {
    hitAt1: number;
    hitAt3: number;
    hitAt5: number;
    recallAt5: number;
    reciprocalRank: number;
  };
  top10Chunks: Array<{
    rank: number;
    id: string;
    subject?: string;
    grade?: number;
    chapter?: string;
    lessonId?: string;
    lessonTitle?: string;
    sectionOrTitle?: string;
    validationStatus?: string;
    scoreBreakdown?: {
      score?: number;
      finalScore?: number;
      vectorScore?: number;
      keywordScore?: number;
    };
    excerpt: string;
  }>;
  errorClassification: string[];
  goldLabelReviewFlags: string[];
};

type DiagnosticReport = {
  generatedAt: string;
  evalFile: string;
  cases: DiagnosticCase[];
};

type GoldReviewDecision =
  | {
      action: 'keep_gold';
      candidateChunkIds?: string[];
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
  question: string;
  subject?: string;
  grade?: number;
  questionType?: string;
  currentExpectedChunkIds: string[];
  currentExpectedChunkExcerpt: string;
  bestGoldRank: number | null;
  metrics: DiagnosticCase['metrics'];
  errorClassification: string[];
  goldLabelReviewFlags: string[];
  top10RetrievedChunks: DiagnosticCase['top10Chunks'];
  recommendation: GoldReviewDecision['action'];
  suggestedDecision: GoldReviewDecision;
  humanDecision: null | GoldReviewDecision;
};

type GoldReviewReport = {
  generatedAt: string;
  sourceDiagnostics: string;
  sourcePreview: string;
  mode: 'auto-suggest';
  summary: {
    reviewCaseCount: number;
    failHitAt5Count: number;
    possibleBadGoldLabelCount: number;
    goldNotInTop10Count: number;
    formulaLowRankCount: number;
  };
  items: GoldReviewItem[];
};

const EVAL_DIR = join(process.cwd(), '..', '..', '..', 'data', 'eval');
const REPORTS_DIR = join(process.cwd(), 'reports');
const PREVIEW_PATH = join(EVAL_DIR, 'real-eval-50.preview.json');
const REVIEW_JSON_PATH = join(EVAL_DIR, 'real-eval-50.gold-review.json');
const REVIEW_MD_PATH = join(EVAL_DIR, 'real-eval-50.gold-review.md');
const TODO_MD_PATH = join(EVAL_DIR, 'real-eval-50.manual-review.todo.md');

async function main() {
  const diagnosticsPath = await resolveDiagnosticsPath();
  const diagnostics = await readJson<DiagnosticReport>(diagnosticsPath);
  const previewCases = await readJson<PreviewCase[]>(PREVIEW_PATH);
  const previewById = new Map(previewCases.map((item) => [item.id, item]));
  const items = diagnostics.cases
    .filter(shouldReviewCase)
    .sort((left, right) => severityScore(right) - severityScore(left))
    .map((item) => buildReviewItem(item, previewById.get(item.testCaseId)));
  const report: GoldReviewReport = {
    generatedAt: new Date().toISOString(),
    sourceDiagnostics: diagnosticsPath,
    sourcePreview: PREVIEW_PATH,
    mode: 'auto-suggest',
    summary: {
      reviewCaseCount: items.length,
      failHitAt5Count: items.filter((item) => item.metrics.hitAt5 === 0).length,
      possibleBadGoldLabelCount: items.filter((item) =>
        item.goldLabelReviewFlags.length > 0,
      ).length,
      goldNotInTop10Count: items.filter((item) =>
        item.errorClassification.includes('gold_not_in_top10'),
      ).length,
      formulaLowRankCount: items.filter(
        (item) =>
          item.questionType === 'formula' &&
          (item.bestGoldRank === null || item.bestGoldRank > 3),
      ).length,
    },
    items,
  };

  await mkdir(EVAL_DIR, { recursive: true });
  await writeFile(REVIEW_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(REVIEW_MD_PATH, `${buildReviewMarkdown(report)}\n`, 'utf8');
  await writeFile(TODO_MD_PATH, `${buildTodoMarkdown(report)}\n`, 'utf8');

  console.log(`Gold review JSON written to ${REVIEW_JSON_PATH}`);
  console.log(`Gold review markdown written to ${REVIEW_MD_PATH}`);
  console.log(`Manual review todo written to ${TODO_MD_PATH}`);
  console.log(JSON.stringify(report.summary, null, 2));
}

async function resolveDiagnosticsPath() {
  const explicit = process.env.REAL_EVAL_RETRIEVAL_DIAGNOSTICS?.trim();
  if (explicit) {
    return explicit;
  }

  const entries = (await readdir(REPORTS_DIR, { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isFile() &&
        /^real-eval-50-retrieval-diagnostics-\d+T\d+\.json$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort();

  if (entries.length === 0) {
    throw new Error('No real-eval-50 retrieval diagnostics JSON found.');
  }

  return join(REPORTS_DIR, entries[entries.length - 1]);
}

function shouldReviewCase(item: DiagnosticCase) {
  return (
    item.metrics.hitAt5 === 0 ||
    item.goldLabelReviewFlags.length > 0 ||
    item.goldLabelReviewFlags.includes('expected_chunk_missing_question_keywords') ||
    item.errorClassification.includes('gold_not_in_top10') ||
    (item.questionType === 'formula' &&
      (item.bestGoldRank === null || item.bestGoldRank > 3)) ||
    item.bestGoldRank === null ||
    item.bestGoldRank > 5 ||
    item.metrics.reciprocalRank < 0.25
  );
}

function buildReviewItem(
  diagnostic: DiagnosticCase,
  preview: PreviewCase | undefined,
): GoldReviewItem {
  const suggestedDecision = suggestDecision(diagnostic);

  return {
    caseId: diagnostic.testCaseId,
    question: diagnostic.question,
    subject: diagnostic.subject ?? preview?.subject,
    grade: diagnostic.grade ?? preview?.grade,
    questionType: diagnostic.questionType ?? preview?.questionType,
    currentExpectedChunkIds: diagnostic.expectedChunkIds,
    currentExpectedChunkExcerpt: preview?.sourceChunkExcerpt
      ? truncate(preview.sourceChunkExcerpt, 900)
      : expectedExcerptFromTop10(diagnostic),
    bestGoldRank: diagnostic.bestGoldRank,
    metrics: diagnostic.metrics,
    errorClassification: diagnostic.errorClassification,
    goldLabelReviewFlags: diagnostic.goldLabelReviewFlags,
    top10RetrievedChunks: diagnostic.top10Chunks,
    recommendation: suggestedDecision.action,
    suggestedDecision,
    humanDecision: null,
  };
}

function suggestDecision(diagnostic: DiagnosticCase): GoldReviewDecision {
  const topCandidate = diagnostic.top10Chunks[0];
  const goldMissingKeywords = diagnostic.goldLabelReviewFlags.includes(
    'expected_chunk_missing_question_keywords',
  );
  const candidateMayBeBetter = diagnostic.goldLabelReviewFlags.includes(
    'candidate_may_be_better_than_gold',
  );

  if (!topCandidate) {
    return {
      action: 'drop_case',
      rationale: 'No retrieved candidates are available for review.',
    };
  }

  if (diagnostic.errorClassification.includes('gold_not_in_top10')) {
    return {
      action: goldMissingKeywords
        ? 'rewrite_question'
        : 'add_candidate_as_additional_gold',
      ...(goldMissingKeywords
        ? {
            rewrittenQuestion: diagnostic.question,
            rationale:
              'Gold chunk is not in top10 and does not match question keywords; question may be too ambiguous for a stable gold label.',
          }
        : {
            candidateChunkIds: [topCandidate.id],
            rationale:
              'Gold chunk is not in top10; top retrieved candidate should be checked as additional gold.',
          }),
    } as GoldReviewDecision;
  }

  if (candidateMayBeBetter && diagnostic.bestGoldRank && diagnostic.bestGoldRank > 5) {
    return {
      action: 'add_candidate_as_additional_gold',
      candidateChunkIds: [topCandidate.id],
      rationale:
        'Retrieved top candidate appears relevant while current gold is ranked low.',
    };
  }

  if (goldMissingKeywords) {
    return {
      action: 'rewrite_question',
      rewrittenQuestion: diagnostic.question,
      rationale:
        'Current expected chunk does not contain enough question keywords; review whether the query wording is too section-generic.',
    };
  }

  return {
    action: 'keep_gold',
    candidateChunkIds: [],
    rationale:
      'Current gold is plausible; keep unless a human reviewer prefers a nearby candidate.',
  };
}

function buildReviewMarkdown(report: GoldReviewReport) {
  return [
    '# Real Eval 50 Gold Label Review',
    '',
    `- Run time: ${report.generatedAt}`,
    `- Diagnostics: \`${report.sourceDiagnostics}\``,
    `- Preview file: \`${report.sourcePreview}\``,
    '- Mode: auto-suggest only; no decision has been applied.',
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Review cases | ${report.summary.reviewCaseCount} |`,
    `| Fail Hit@5 | ${report.summary.failHitAt5Count} |`,
    `| Possible bad gold label | ${report.summary.possibleBadGoldLabelCount} |`,
    `| Gold not in top10 | ${report.summary.goldNotInTop10Count} |`,
    `| Formula low rank | ${report.summary.formulaLowRankCount} |`,
    '',
    '## Cases',
    '',
    ...report.items.flatMap(formatReviewItem),
  ].join('\n');
}

function buildTodoMarkdown(report: GoldReviewReport) {
  const priority = report.items
    .filter((item) => item.metrics.hitAt5 === 0)
    .concat(report.items.filter((item) => item.metrics.hitAt5 !== 0))
    .filter(uniqueByCaseId)
    .slice(0, 15);

  return [
    '# Real Eval 50 Manual Review TODO',
    '',
    `- Run time: ${new Date().toISOString()}`,
    '- Fill `humanDecision` in `data/eval/real-eval-50.gold-review.json`, then run `npm run apply:real-eval-50-gold-review` from `src/backend`.',
    '- Allowed actions: `keep_gold`, `replace_gold_with_candidate`, `add_candidate_as_additional_gold`, `rewrite_question`, `drop_case`.',
    '',
    '## Priority Cases',
    '',
    '| Priority | Case | Subject | Grade | Type | Gold rank | Recommendation | Why |',
    '| ---: | --- | --- | ---: | --- | ---: | --- | --- |',
    ...priority.map(
      (item, index) =>
        `| ${index + 1} | ${item.caseId} | ${item.subject ?? 'N/A'} | ${
          item.grade ?? 'N/A'
        } | ${item.questionType ?? 'N/A'} | ${
          item.bestGoldRank ?? 'N/A'
        } | ${item.recommendation} | ${escapeCell(
          [...item.errorClassification, ...item.goldLabelReviewFlags].join(', '),
        )} |`,
    ),
    '',
    '## Decision Template',
    '',
    '```json',
    JSON.stringify(
      {
        humanDecision: {
          action: 'add_candidate_as_additional_gold',
          candidateChunkIds: ['CHUNK_ID_TO_ADD'],
          rationale: 'short human reason',
        },
      },
      null,
      2,
    ),
    '```',
  ].join('\n');
}

function formatReviewItem(item: GoldReviewItem) {
  return [
    `### ${item.caseId}`,
    '',
    `- Subject/grade/type: ${item.subject ?? 'N/A'} / ${
      item.grade ?? 'N/A'
    } / ${item.questionType ?? 'N/A'}`,
    `- Question: ${item.question}`,
    `- Current expected chunks: ${item.currentExpectedChunkIds.join(', ') || 'N/A'}`,
    `- Best gold rank: ${item.bestGoldRank ?? 'not in top10'}`,
    `- Error classification: ${item.errorClassification.join(', ') || 'none'}`,
    `- Gold label flags: ${item.goldLabelReviewFlags.join(', ') || 'none'}`,
    `- Recommendation: ${item.recommendation}`,
    `- Human decision: _empty_`,
    '',
    'Current expected chunk excerpt:',
    '',
    '```text',
    item.currentExpectedChunkExcerpt || 'N/A',
    '```',
    '',
    '| Rank | Chunk | Subject | Grade | Chapter | Lesson | Section | Score | Excerpt |',
    '| ---: | --- | --- | ---: | --- | --- | --- | ---: | --- |',
    ...item.top10RetrievedChunks.map(
      (chunk) =>
        `| ${chunk.rank} | ${chunk.id} | ${chunk.subject ?? 'N/A'} | ${
          chunk.grade ?? 'N/A'
        } | ${chunk.chapter ?? 'N/A'} | ${chunk.lessonId ?? 'N/A'} | ${escapeCell(
          chunk.sectionOrTitle ?? '',
        )} | ${formatMetric(
          chunk.scoreBreakdown?.finalScore ?? chunk.scoreBreakdown?.score,
        )} | ${escapeCell(truncate(chunk.excerpt, 260))} |`,
    ),
    '',
  ];
}

function severityScore(item: DiagnosticCase) {
  let score = 0;
  if (item.metrics.hitAt5 === 0) {
    score += 100;
  }
  if (item.errorClassification.includes('gold_not_in_top10')) {
    score += 40;
  }
  if (item.bestGoldRank === null) {
    score += 30;
  } else {
    score += Math.max(0, item.bestGoldRank - 3) * 5;
  }
  if (item.questionType === 'formula') {
    score += 15;
  }
  score += item.goldLabelReviewFlags.length * 4;
  score += Math.max(0, 0.25 - item.metrics.reciprocalRank) * 20;

  return score;
}

function expectedExcerptFromTop10(diagnostic: DiagnosticCase) {
  const expected = new Set(diagnostic.expectedChunkIds);
  const found = diagnostic.top10Chunks.find((chunk) => expected.has(chunk.id));

  return found?.excerpt ?? '';
}

function uniqueByCaseId(item: GoldReviewItem, index: number, items: GoldReviewItem[]) {
  return items.findIndex((candidate) => candidate.caseId === item.caseId) === index;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function formatMetric(value: unknown) {
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
