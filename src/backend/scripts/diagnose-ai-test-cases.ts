import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { readExpectedEvaluationData } from '../src/modules/ai/evaluation/eval-utils';
import { VALIDATION_STATUSES } from '../src/modules/learning/learning-data.schema';
import { AiTestCaseEntity } from '../src/modules/learning/ai-test-case/ai-test-case.entity';

type RecordLike = Record<string, any>;

type CaseIssue = {
  id: string;
  reason: string;
  details?: string;
  validationStatus?: string;
  sourceLearningItemId?: string;
  availableExpectedFields?: string[];
};

type CaseAnalysis = {
  total: number;
  evaluatorEvaluable: number;
  strictEvaluable: number;
  skipped: number;
  reasonCounts: Record<string, number>;
  validationStatusCounts: Record<string, number>;
  rootFieldCounts: Record<string, number>;
  expectedFieldCounts: Record<string, number>;
  unusedFieldCounts: Record<string, number>;
  topIssues: CaseIssue[];
  migrationCandidates: {
    sourceLearningItemIdPresent: number;
    sourceLearningItemIdMatchesTheoryId: number;
    sourceLearningItemIdMatchesLearningItem: number;
    casesWithLessonTheoryCandidates: number;
    casesWithoutLessonTheoryCandidates: number;
    lessonCandidateDistribution: Record<string, number>;
  };
};

const WORKSPACE_ROOT = resolve(process.cwd(), '..', '..', '..');
const DEFAULT_SPLIT_DIR = join(
  WORKSPACE_ROOT,
  'data',
  'structured',
  'generated',
  'split-preview',
);
const DEFAULT_ALL_IN_ONE = join(
  WORKSPACE_ROOT,
  'data',
  'structured',
  'generated',
  'all-in-one.with-cleaned-preview.learning-data.json',
);
const REPORT_PATH = join(process.cwd(), 'reports', 'ai-test-cases-diagnostic.md');

async function main() {
  const splitAiTestCases = await readJsonArray(
    join(DEFAULT_SPLIT_DIR, 'ai-test-cases.json'),
  );
  const splitTheoryChunks = await readJsonArray(
    join(DEFAULT_SPLIT_DIR, 'theory-chunks.json'),
  );
  const splitLearningItems = await readJsonArray(
    join(DEFAULT_SPLIT_DIR, 'learning-items.json'),
  );
  const allInOne = await readJsonObject(DEFAULT_ALL_IN_ONE);
  const allInOneAiTestCases = Array.isArray(allInOne.aiTestCases)
    ? allInOne.aiTestCases
    : [];
  const allInOneTheoryChunks = Array.isArray(allInOne.theoryChunks)
    ? allInOne.theoryChunks
    : [];

  const db = await readDbSnapshot();
  const analysisSource = db.aiTestCases.length > 0 ? db.aiTestCases : splitAiTestCases;
  const analysis = analyzeCases(
    analysisSource,
    db.theoryChunkIds.size > 0 ? db.theoryChunkIds : idSet(splitTheoryChunks),
    splitLearningItems,
    splitTheoryChunks,
  );

  const report = buildReport({
    analysis,
    db,
    splitAiTestCases,
    splitTheoryChunks,
    splitLearningItems,
    allInOneAiTestCases,
    allInOneTheoryChunks,
  });

  await mkdir(join(process.cwd(), 'reports'), { recursive: true });
  await writeFile(REPORT_PATH, report, 'utf8');

  console.log(
    JSON.stringify(
      {
        reportPath: REPORT_PATH,
        totalAiTestCases: analysis.total,
        evaluatorEvaluable: analysis.evaluatorEvaluable,
        skipped: analysis.skipped,
        reasonCounts: analysis.reasonCounts,
      },
      null,
      2,
    ),
  );
}

async function readDbSnapshot() {
  const result = {
    available: false,
    error: undefined as string | undefined,
    aiTestCases: [] as RecordLike[],
    theoryChunkIds: new Set<string>(),
    theoryChunksTotal: 0,
    theoryChunksWithEmbedding: 0,
  };

  let app: Awaited<ReturnType<typeof NestFactory.createApplicationContext>> | undefined;
  try {
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });
    const dataSource = app.get(DataSource);
    const testCaseRepo = dataSource.getRepository(AiTestCaseEntity);
    result.aiTestCases = await testCaseRepo.find({ order: { id: 'ASC' } });
    const theoryRows = (await dataSource.query(`
      SELECT id, embedding IS NOT NULL AS "hasEmbedding"
      FROM theory_chunks
      ORDER BY id ASC
    `)) as Array<{ id: string; hasEmbedding: boolean }>;
    result.theoryChunksTotal = theoryRows.length;
    result.theoryChunksWithEmbedding = theoryRows.filter(
      (row) => row.hasEmbedding,
    ).length;
    result.theoryChunkIds = new Set(theoryRows.map((row) => row.id));
    result.available = true;
  } catch (error) {
    result.error = errorToString(error);
  } finally {
    await app?.close();
  }

  return result;
}

function analyzeCases(
  cases: RecordLike[],
  theoryChunkIds: Set<string>,
  learningItems: RecordLike[],
  theoryChunks: RecordLike[],
): CaseAnalysis {
  const reasonCounts: Record<string, number> = {};
  const validationStatusCounts: Record<string, number> = {};
  const rootFieldCounts: Record<string, number> = {};
  const expectedFieldCounts: Record<string, number> = {};
  const unusedFieldCounts: Record<string, number> = {};
  const topIssues: CaseIssue[] = [];
  const learningItemById = new Map(
    learningItems
      .filter((item) => typeof item.id === 'string')
      .map((item) => [item.id, item]),
  );

  let evaluatorEvaluable = 0;
  let strictEvaluable = 0;
  let sourceLearningItemIdPresent = 0;
  let sourceLearningItemIdMatchesTheoryId = 0;
  let sourceLearningItemIdMatchesLearningItem = 0;
  let casesWithLessonTheoryCandidates = 0;
  let casesWithoutLessonTheoryCandidates = 0;
  const lessonCandidateDistribution: Record<string, number> = {};

  for (const testCase of cases) {
    Object.keys(testCase).forEach((field) => increment(rootFieldCounts, field));
    Object.keys(asRecord(testCase.expected) ?? {}).forEach((field) => {
      increment(expectedFieldCounts, field);
    });
    collectUnusedFields(testCase, unusedFieldCounts);

    const validationStatus = stringValue(testCase.validationStatus) ?? 'null';
    increment(validationStatusCounts, validationStatus);

    const question = readQuestion(testCase);
    const expected = readExpectedEvaluationData(testCase);
    const expectedChunkIds = expected?.relevant_chunk_ids ?? [];
    const missingExpectedIds = expectedChunkIds.filter(
      (id) => !theoryChunkIds.has(id),
    );

    const sourceLearningItemId = stringValue(testCase.sourceLearningItemId);
    if (sourceLearningItemId) {
      sourceLearningItemIdPresent += 1;
      if (theoryChunkIds.has(sourceLearningItemId)) {
        sourceLearningItemIdMatchesTheoryId += 1;
      }
      const learningItem = learningItemById.get(sourceLearningItemId);
      if (learningItem) {
        sourceLearningItemIdMatchesLearningItem += 1;
        const candidates = findLessonTheoryCandidates(learningItem, theoryChunks);
        increment(lessonCandidateDistribution, String(candidates.length));
        if (candidates.length > 0) {
          casesWithLessonTheoryCandidates += 1;
        } else {
          casesWithoutLessonTheoryCandidates += 1;
        }
      }
    }

    const issue = classifyCaseIssue(
      testCase,
      question,
      expected,
      expectedChunkIds,
      missingExpectedIds,
    );

    if (!issue) {
      evaluatorEvaluable += 1;
      if (missingExpectedIds.length === 0) {
        strictEvaluable += 1;
      }
      continue;
    }

    increment(reasonCounts, issue.reason);
    if (topIssues.length < 20) {
      topIssues.push({
        ...issue,
        validationStatus,
        sourceLearningItemId,
        availableExpectedFields: Object.keys(asRecord(testCase.expected) ?? {}),
      });
    }
  }

  return {
    total: cases.length,
    evaluatorEvaluable,
    strictEvaluable,
    skipped: cases.length - evaluatorEvaluable,
    reasonCounts,
    validationStatusCounts,
    rootFieldCounts,
    expectedFieldCounts,
    unusedFieldCounts,
    topIssues,
    migrationCandidates: {
      sourceLearningItemIdPresent,
      sourceLearningItemIdMatchesTheoryId,
      sourceLearningItemIdMatchesLearningItem,
      casesWithLessonTheoryCandidates,
      casesWithoutLessonTheoryCandidates,
      lessonCandidateDistribution,
    },
  };
}

function classifyCaseIssue(
  testCase: RecordLike,
  question: string,
  expected: ReturnType<typeof readExpectedEvaluationData>,
  expectedChunkIds: string[],
  missingExpectedIds: string[],
): CaseIssue | null {
  const id = readCaseId(testCase);

  if (!question) {
    return { id, reason: 'missing question' };
  }

  if (!expected) {
    return {
      id,
      reason: 'missing expected object',
      details:
        'Evaluator only scans expected, expectedOutput, metadata.expected, metadata.evaluation.',
    };
  }

  if (!hasAnyExpectedChunkField(expected.raw)) {
    return {
      id,
      reason: 'missing expected chunk ids',
      details:
        'Expected object exists, but it has neither relevant_chunk_ids nor relevantChunkIds.',
    };
  }

  if (expectedChunkIds.length === 0) {
    return {
      id,
      reason: 'expected chunk ids empty',
      details: `Gold label source: ${expected.sourcePath}.`,
    };
  }

  if (missingExpectedIds.length > 0) {
    return {
      id,
      reason: 'expected chunk id not found in theoryChunks',
      details: missingExpectedIds.slice(0, 5).join(', '),
    };
  }

  return null;
}

function buildReport(input: {
  analysis: CaseAnalysis;
  db: Awaited<ReturnType<typeof readDbSnapshot>>;
  splitAiTestCases: RecordLike[];
  splitTheoryChunks: RecordLike[];
  splitLearningItems: RecordLike[];
  allInOneAiTestCases: RecordLike[];
  allInOneTheoryChunks: RecordLike[];
}) {
  const { analysis, db } = input;
  const lines: string[] = [
    '# AI Test Cases Diagnostic',
    '',
    `- Generated at: ${new Date().toISOString()}`,
    `- Eval source inspected: ${db.aiTestCases.length > 0 ? 'database' : 'split preview file'}`,
    `- Report path: \`reports/ai-test-cases-diagnostic.md\``,
    '',
    '## Evaluator Contract',
    '',
    '- `eval-rag.ts` loads DB cases by default unless `EVAL_SOURCE=smoke`.',
    '- It reads the question from `input`, `question`, `message`, or `prompt`.',
    '- It resolves expected data from `expected`, `expectedOutput`, `metadata.expected`, then `metadata.evaluation`.',
    '- Retrieval gold labels are read only from `relevant_chunk_ids` or `relevantChunkIds` inside that expected object.',
    '- The normalized value is exposed as `expected.relevant_chunk_ids`; if its length is 0, retrieval metrics mark the case skipped with `No expected relevant chunk ids`.',
    '- `validationStatus` is not filtered by the retrieval evaluator. All statuses returned by the repository are included.',
    '',
    '## Dataset Counts',
    '',
    '| Source | aiTestCases | theoryChunks | embeddings |',
    '| --- | ---: | ---: | ---: |',
    `| DB dev | ${db.available ? db.aiTestCases.length : 'N/A'} | ${db.available ? db.theoryChunksTotal : 'N/A'} | ${db.available ? db.theoryChunksWithEmbedding : 'N/A'} |`,
    `| split preview | ${input.splitAiTestCases.length} | ${input.splitTheoryChunks.length} | N/A |`,
    `| all-in-one preview | ${input.allInOneAiTestCases.length} | ${input.allInOneTheoryChunks.length} | N/A |`,
  ];

  if (db.error) {
    lines.push('', `DB read warning: ${db.error}`);
  }

  lines.push(
    '',
    '## Evaluation Readiness',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    `| Total aiTestCases inspected | ${analysis.total} |`,
    `| Evaluator-evaluable cases | ${analysis.evaluatorEvaluable} |`,
    `| Strictly evaluable cases with existing theory chunk ids | ${analysis.strictEvaluable} |`,
    `| Cases skipped by current evaluator contract | ${analysis.skipped} |`,
    '',
    '## Skip Reasons',
    '',
    ...formatCountTable(analysis.reasonCounts, 'Reason'),
    '',
    '## Validation Status',
    '',
    ...formatCountTable(analysis.validationStatusCounts, 'validationStatus'),
    '',
    'Evaluator note: validationStatus does not cause skip in retrieval eval.',
    '',
    '## Fields Present',
    '',
    'Root fields:',
    '',
    ...formatCountTable(analysis.rootFieldCounts, 'Field'),
    '',
    '`expected` fields:',
    '',
    ...formatCountTable(analysis.expectedFieldCounts, 'Field'),
    '',
    'Fields present but not used as retrieval gold labels:',
    '',
    ...formatCountTable(analysis.unusedFieldCounts, 'Field'),
    '',
    '## Top 20 Problem Cases',
    '',
    '| Case id | Reason | validationStatus | sourceLearningItemId | expected fields | Details |',
    '| --- | --- | --- | --- | --- | --- |',
  );

  for (const issue of analysis.topIssues) {
    lines.push(
      `| ${escapeCell(issue.id)} | ${escapeCell(issue.reason)} | ${escapeCell(issue.validationStatus ?? '')} | ${escapeCell(issue.sourceLearningItemId ?? '')} | ${escapeCell((issue.availableExpectedFields ?? []).join(', '))} | ${escapeCell(issue.details ?? '')} |`,
    );
  }

  lines.push(
    '',
    '## Migration Signal',
    '',
    '| Signal | Count |',
    '| --- | ---: |',
    `| sourceLearningItemId present | ${analysis.migrationCandidates.sourceLearningItemIdPresent} |`,
    `| sourceLearningItemId directly matches theory chunk id | ${analysis.migrationCandidates.sourceLearningItemIdMatchesTheoryId} |`,
    `| sourceLearningItemId matches learning item id | ${analysis.migrationCandidates.sourceLearningItemIdMatchesLearningItem} |`,
    `| Cases with lesson-level theory chunk candidates | ${analysis.migrationCandidates.casesWithLessonTheoryCandidates} |`,
    `| Cases without lesson-level theory chunk candidates | ${analysis.migrationCandidates.casesWithoutLessonTheoryCandidates} |`,
    '',
    'Lesson-level candidate count distribution from `sourceLearningItemId -> learningItem -> subject/grade/lessonId -> theoryChunks`:',
    '',
    ...formatCountTable(
      analysis.migrationCandidates.lessonCandidateDistribution,
      'Candidate chunks per case',
    ),
    '',
    '## Recommendation',
    '',
    '- The current failure is data-labeling, not embedding and not RAG runtime.',
    '- Do not change the evaluator just to accept unrelated field names; the current contract is explicit and already supports snake_case and camelCase under expected data.',
    '- Safe preview migration: add `expected.relevant_chunk_ids` to aiTestCases in a generated preview file only.',
    '- Prefer curated gold labels. If bootstrapping is needed, use `sourceLearningItemId -> learningItem -> lessonId` to propose candidate theory chunks, then keep only 1-3 human-reviewed relevant chunk ids per case.',
    '- Recommended next eval set size: start with 30 curated cases covering physics/math/chemistry and common topics; after metrics are stable, expand to 60-100. The current 125 cases can be kept, but they need gold chunk labels before retrieval metrics are meaningful.',
  );

  return `${lines.join('\n')}\n`;
}

function collectUnusedFields(testCase: RecordLike, counts: Record<string, number>) {
  for (const field of Object.keys(testCase)) {
    if (
      !['id', 'input', 'question', 'message', 'prompt', 'expected', 'expectedOutput', 'metadata'].includes(
        field,
      )
    ) {
      increment(counts, `root.${field}`);
    }
  }

  const expected = asRecord(testCase.expected);
  if (!expected) {
    return;
  }

  for (const field of Object.keys(expected)) {
    if (!['relevant_chunk_ids', 'relevantChunkIds'].includes(field)) {
      increment(counts, `expected.${field}`);
    }
  }
}

function findLessonTheoryCandidates(
  learningItem: RecordLike,
  theoryChunks: RecordLike[],
) {
  return theoryChunks.filter(
    (chunk) =>
      chunk.subject === learningItem.subject &&
      chunk.grade === learningItem.grade &&
      chunk.lessonId === learningItem.lessonId,
  );
}

function hasAnyExpectedChunkField(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return false;
  }

  return (
    Array.isArray(record.relevant_chunk_ids) ||
    Array.isArray(record.relevantChunkIds)
  );
}

function readQuestion(testCase: RecordLike) {
  const value =
    testCase.input ?? testCase.question ?? testCase.message ?? testCase.prompt;
  return typeof value === 'string' ? value.trim() : '';
}

function readCaseId(testCase: RecordLike) {
  return stringValue(testCase.id ?? testCase.caseId ?? testCase.case_id) ?? 'unknown';
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asRecord(value: unknown): RecordLike | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as RecordLike)
    : undefined;
}

function idSet(rows: RecordLike[]) {
  return new Set(
    rows
      .map((row) => row.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  );
}

async function readJsonArray(path: string): Promise<RecordLike[]> {
  const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array: ${path}`);
  }
  return parsed.filter((item): item is RecordLike => Boolean(asRecord(item)));
}

async function readJsonObject(path: string): Promise<RecordLike> {
  const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
  const record = asRecord(parsed);
  if (!record) {
    throw new Error(`Expected JSON object: ${path}`);
  }
  return record;
}

function formatCountTable(counts: Record<string, number>, label: string) {
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) {
    return ['No entries.'];
  }

  return [
    `| ${label} | Count |`,
    '| --- | ---: |',
    ...rows.map(([key, value]) => `| ${escapeCell(key)} | ${value} |`),
  ];
}

function increment(counts: Record<string, number>, key: string) {
  counts[key] = (counts[key] ?? 0) + 1;
}

function escapeCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function errorToString(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

void VALIDATION_STATUSES;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
