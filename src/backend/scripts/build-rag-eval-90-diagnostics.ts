import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

type JsonRecord = Record<string, any>;

type ChunkMeta = {
  id: string;
  subject?: string;
  grade?: number;
  chapter?: string;
  lessonId?: string;
  lessonTitle?: string;
  topic?: string;
  title?: string;
  type?: string;
  validationStatus?: string;
  sourceType?: string;
  chunkType?: string;
  textLength: number;
  excerpt: string;
  inPreview: boolean;
};

type RetrievedChunk = ChunkMeta & {
  rank: number;
  score?: number;
  finalScore?: number;
  vectorScore?: number;
  keywordScore?: number;
  conceptScore?: number;
  conceptBoost?: number;
  titleBoost?: number;
  metadataBoost?: number;
  formulaBoost?: number;
  textBoost?: number;
  topicBoost?: number;
  subjectBoost?: number;
  gradeBoost?: number;
  chapterBoost?: number;
  lessonBoost?: number;
  sectionBoost?: number;
  validationBoost?: number;
  retrievalType?: string;
};

async function main() {
  const root = resolve(process.cwd(), '../../..');
  const reportsDir = join(root, 'reports');
  const timestamp = timestampForFile();
  const previewPath =
    process.env.PREVIEW_DATASET_PATH ??
    join(
      root,
      'data/structured/generated/all-in-one.with-cleaned-and-math-synthetic-preview.learning-data.json',
    );
  const evalPath =
    process.env.EVAL_CASES_PATH ?? join(root, 'data/eval/rag-eval-90.preview.json');
  const ragReportPath =
    process.env.RAG_REPORT_PATH ?? join(process.cwd(), 'reports/rag-eval-report.json');

  const preview = await readJson(previewPath);
  const evalCases = await readJson(evalPath);
  const ragReport = await readJson(ragReportPath);
  const previewChunks = buildPreviewChunkMap(preview);
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const dbChunks = await readDbChunkMap(dataSource);
    const staleRows = [...dbChunks.values()].filter((chunk) => !previewChunks.has(chunk.id));
    const analyses = buildCaseAnalyses(
      Array.isArray(evalCases) ? evalCases : [],
      Array.isArray(ragReport.cases) ? ragReport.cases : [],
      previewChunks,
      dbChunks,
    );
    const diagnostics = {
      generated_at: new Date().toISOString(),
      inputs: {
        previewPath,
        evalPath,
        ragReportPath,
        topChunksPerCase: Math.max(
          0,
          ...analyses.map((item) => item.topRetrievedChunks.length),
        ),
      },
      summary: buildSummary(analyses),
      benchmarkBalanceAnalysis: buildBenchmarkBalanceAnalysis(
        Array.isArray(evalCases) ? evalCases : [],
        previewChunks,
      ),
      staleDb: buildStaleSummary(staleRows, analyses),
      cases: analyses,
    };
    const staleReport = buildStaleReport(staleRows, analyses);
    const goldReview = buildGoldReview(analyses);

    await mkdir(reportsDir, { recursive: true });
    await mkdir(join(root, 'data/eval'), { recursive: true });
    await writeFile(
      join(reportsDir, `rag-eval-90-diagnostics-${timestamp}.json`),
      `${JSON.stringify(diagnostics, null, 2)}\n`,
      'utf8',
    );
    await writeFile(
      join(reportsDir, `rag-eval-90-diagnostics-${timestamp}.md`),
      `${buildDiagnosticsMarkdown(diagnostics)}\n`,
      'utf8',
    );
    await writeFile(
      join(reportsDir, 'stale-db-theory-chunks-report.md'),
      `${staleReport}\n`,
      'utf8',
    );
    await writeFile(
      join(root, 'data/eval/rag-eval-90-phys-chem-gold-review.json'),
      `${JSON.stringify(goldReview, null, 2)}\n`,
      'utf8',
    );
    await writeFile(
      join(root, 'data/eval/rag-eval-90-phys-chem-gold-review.md'),
      `${buildGoldReviewMarkdown(goldReview)}\n`,
      'utf8',
    );

    console.log(
      JSON.stringify(
        {
          diagnostics: `reports/rag-eval-90-diagnostics-${timestamp}.md`,
          diagnosticsJson: `reports/rag-eval-90-diagnostics-${timestamp}.json`,
          staleReport: 'reports/stale-db-theory-chunks-report.md',
          goldReview: 'data/eval/rag-eval-90-phys-chem-gold-review.md',
          summary: diagnostics.summary,
          staleDb: diagnostics.staleDb,
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}

function buildCaseAnalyses(
  evalCases: JsonRecord[],
  reportCases: JsonRecord[],
  previewChunks: Map<string, ChunkMeta>,
  dbChunks: Map<string, ChunkMeta>,
) {
  const evalById = new Map(evalCases.map((item) => [readCaseId(item), item]));

  return reportCases.map((reportCase) => {
    const evalCase = evalById.get(String(reportCase.case_id)) ?? {};
    const expectedIds = readExpectedIds(evalCase, reportCase);
    const expectedChunks = expectedIds.map((id) => chunkMeta(id, previewChunks, dbChunks));
    const topRetrievedChunks = (reportCase.top_chunks ?? [])
      .filter(isRecord)
      .slice(0, 10)
      .map((chunk: JsonRecord, index: number) => ({
        ...chunkMeta(String(chunk.id), previewChunks, dbChunks),
        rank: index + 1,
        score: asNumber(chunk.score),
        finalScore: asNumber(chunk.finalScore),
        vectorScore: asNumber(chunk.vectorScore),
        keywordScore: asNumber(chunk.keywordScore),
        conceptScore: asNumber(chunk.conceptScore),
        conceptBoost: asNumber(chunk.conceptBoost),
        titleBoost: asNumber(chunk.titleBoost),
        metadataBoost: asNumber(chunk.metadataBoost),
        formulaBoost: asNumber(chunk.formulaBoost),
        textBoost: asNumber(chunk.textBoost),
        topicBoost: asNumber(chunk.topicBoost),
        subjectBoost: asNumber(chunk.subjectBoost),
        gradeBoost: asNumber(chunk.gradeBoost),
        chapterBoost: asNumber(chunk.chapterBoost),
        lessonBoost: asNumber(chunk.lessonBoost),
        sectionBoost: asNumber(chunk.sectionBoost),
        validationBoost: asNumber(chunk.validationBoost),
        retrievalType: asString(chunk.retrievalType),
      })) as RetrievedChunk[];
    const goldBestRank = bestRank(expectedIds, topRetrievedChunks);
    const question = String(reportCase.question ?? evalCase.question ?? '');
    const expectedKeywordRatio = expectedChunks.length
      ? Math.max(
          ...expectedChunks.map((chunk) =>
            keyTermCoverage(question, [chunk.title, chunk.topic, chunk.excerpt].join(' ')),
          ),
        )
      : 0;
    const failureTypes = classifyFailure({
      caseRecord: reportCase,
      evalCase,
      expectedChunks,
      topRetrievedChunks,
      goldBestRank,
      expectedKeywordRatio,
    });

    return {
      caseId: String(reportCase.case_id),
      subject: asString(reportCase.subject ?? evalCase.subject),
      grade: asNumber(reportCase.grade ?? evalCase.grade),
      chapter: asString(reportCase.chapter ?? evalCase.chapter),
      lessonId: asString(reportCase.lessonId ?? evalCase.lessonId),
      lesson: asString(evalCase.lesson ?? reportCase.lessonId),
      questionType: asString(reportCase.questionType ?? evalCase.questionType),
      question,
      expectedChunkIds: expectedIds,
      expectedChunks,
      topRetrievedChunks,
      goldBestRank,
      expectedKeywordRatio,
      failureTypes,
      metrics: reportCase.metrics ?? {},
    };
  });
}

function classifyFailure(input: {
  caseRecord: JsonRecord;
  evalCase: JsonRecord;
  expectedChunks: ChunkMeta[];
  topRetrievedChunks: RetrievedChunk[];
  goldBestRank: number | null;
  expectedKeywordRatio: number;
}) {
  const expected = input.expectedChunks[0];
  const top1 = input.topRetrievedChunks[0];
  const subject = asString(input.caseRecord.subject ?? input.evalCase.subject);
  const grade = asNumber(input.caseRecord.grade ?? input.evalCase.grade);
  const chapter = asString(input.caseRecord.chapter ?? input.evalCase.chapter);
  const lessonId = asString(input.caseRecord.lessonId ?? input.evalCase.lessonId);
  const types = new Set<string>();

  if (input.goldBestRank === 1) types.add('success_top1');
  else if (input.goldBestRank !== null && input.goldBestRank <= 3) types.add('success_top3');
  else if (input.goldBestRank !== null && input.goldBestRank <= 5) types.add('success_top5');
  else if (input.goldBestRank !== null && input.goldBestRank <= 10) types.add('gold_low_rank');
  else types.add('gold_not_in_top10');

  if (top1?.subject && subject && top1.subject !== subject) types.add('subject_mismatch');
  if (top1?.grade && grade !== undefined && top1.grade !== grade) types.add('grade_mismatch');
  if (top1?.chapter && chapter && top1.chapter !== chapter) types.add('chapter_mismatch');
  if (top1?.lessonId && lessonId && top1.lessonId !== lessonId) types.add('lesson_mismatch');
  if (input.expectedChunks.some((chunk) => chunk.textLength < 200)) {
    types.add('expected_chunk_too_short');
  }
  if (input.expectedKeywordRatio < 0.2) {
    types.add('expected_chunk_missing_question_keywords');
  }
  if (
    top1?.sourceType === 'synthetic_curriculum_summary' &&
    expected?.sourceType !== 'synthetic_curriculum_summary'
  ) {
    types.add('synthetic_bias');
  }
  if (input.topRetrievedChunks.some((chunk) => !chunk.inPreview)) {
    types.add('stale_db_candidate');
  }
  if (
    input.expectedChunks.some(
      (chunk) => !chunk.chapter || !chunk.lessonId || !chunk.sourceType,
    )
  ) {
    types.add('metadata_missing');
  }
  if (
    !types.has('success_top1') &&
    top1 &&
    expected &&
    keyTermCoverage(input.caseRecord.question ?? '', top1.excerpt) >
      input.expectedKeywordRatio + 0.25
  ) {
    types.add('possible_bad_gold_label');
  }

  return [...types];
}

function buildSummary(cases: JsonRecord[]) {
  return {
    overall: metricsFor(cases),
    bySubject: groupMetrics(cases, (item) => item.subject ?? 'unknown'),
    byQuestionType: groupMetrics(cases, (item) => item.questionType ?? 'unknown'),
    bySourceType: groupMetrics(cases, (item) => item.expectedChunks?.[0]?.sourceType ?? 'unknown'),
    failureTypeCounts: countFlat(cases.flatMap((item) => item.failureTypes ?? [])),
    subjectMismatchTop1Count: cases.filter((item) =>
      item.failureTypes?.includes('subject_mismatch'),
    ).length,
    staleDbTop10CaseCount: cases.filter((item) =>
      item.failureTypes?.includes('stale_db_candidate'),
    ).length,
    needsReviewTop1Count: cases.filter(
      (item) => item.topRetrievedChunks?.[0]?.validationStatus === 'needs_review',
    ).length,
    syntheticTop1Count: cases.filter(
      (item) => item.topRetrievedChunks?.[0]?.sourceType === 'synthetic_curriculum_summary',
    ).length,
    expectedTooExactOrNarrowCount: cases.filter(
      (item) =>
        item.failureTypes?.includes('expected_chunk_too_short') ||
        item.failureTypes?.includes('expected_chunk_missing_question_keywords'),
    ).length,
  };
}

function metricsFor(cases: JsonRecord[]) {
  const total = cases.length;
  const hitAt1 = cases.filter((item) => item.goldBestRank === 1).length;
  const hitAt3 = cases.filter(
    (item) => item.goldBestRank !== null && item.goldBestRank <= 3,
  ).length;
  const hitAt5 = cases.filter(
    (item) => item.goldBestRank !== null && item.goldBestRank <= 5,
  ).length;
  const hitAt10 = cases.filter(
    (item) => item.goldBestRank !== null && item.goldBestRank <= 10,
  ).length;
  const mrr = total
    ? cases.reduce(
        (sum, item) => sum + (item.goldBestRank ? 1 / item.goldBestRank : 0),
        0,
      ) / total
    : 0;

  return {
    total,
    hitAt1: ratio(hitAt1, total),
    hitAt3: ratio(hitAt3, total),
    hitAt5: ratio(hitAt5, total),
    hitAt10: ratio(hitAt10, total),
    mrr,
  };
}

function groupMetrics(cases: JsonRecord[], keyFn: (item: JsonRecord) => string) {
  const groups = new Map<string, JsonRecord[]>();
  for (const item of cases) {
    const key = keyFn(item) || 'unknown';
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return Object.fromEntries(
    [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, items]) => [key, metricsFor(items)]),
  );
}

function buildBenchmarkBalanceAnalysis(
  evalCases: JsonRecord[],
  chunks: Map<string, ChunkMeta>,
) {
  const rows = evalCases.map((item) => {
    const expectedIds = readExpectedIds(item, {});
    const expected = expectedIds.map((id) => chunks.get(id)).filter(Boolean) as ChunkMeta[];
    const textLengths = expected.map((chunk) => chunk.textLength);
    return {
      subject: asString(item.subject) ?? 'unknown',
      questionType: asString(item.questionType) ?? 'unknown',
      expectedTextLength: textLengths.length
        ? textLengths.reduce((sum, value) => sum + value, 0) / textLengths.length
        : 0,
      missingChapter: expected.some((chunk) => !chunk.chapter),
      missingLesson: expected.some((chunk) => !chunk.lessonId),
      validationStatus: expected[0]?.validationStatus ?? 'unknown',
      sourceType: expected[0]?.sourceType ?? 'unknown',
      keyTermRatio: expected.length
        ? Math.max(
            ...expected.map((chunk) =>
              keyTermCoverage(String(item.question ?? ''), chunk.excerpt),
            ),
          )
        : 0,
    };
  });

  return {
    averageExpectedChunkLengthBySubject: averageBy(rows, 'subject', 'expectedTextLength'),
    missingChapterBySubject: countTruthyBy(rows, 'subject', 'missingChapter'),
    missingLessonBySubject: countTruthyBy(rows, 'subject', 'missingLesson'),
    validationStatusBySubject: nestedCounts(rows, 'subject', 'validationStatus'),
    sourceTypeBySubject: nestedCounts(rows, 'subject', 'sourceType'),
    questionTypeBySubject: nestedCounts(rows, 'subject', 'questionType'),
    expectedChunkContainsKeyTermsRatioBySubject: averageBy(
      rows,
      'subject',
      'keyTermRatio',
    ),
    caveats: [
      'Math metrics are optimistic because Math cases are generated from synthetic curriculum chunks with clean metadata.',
      'Physics/Chemistry cases are generated from cleaned/OCR-derived chunks and may have narrower gold labels or noisier text.',
    ],
  };
}

function buildStaleSummary(staleRows: ChunkMeta[], cases: JsonRecord[]) {
  const staleTop10 = cases.flatMap((item) =>
    (item.topRetrievedChunks ?? []).filter((chunk: RetrievedChunk) => !chunk.inPreview),
  );
  return {
    dbChunksNotInPreview: staleRows.length,
    staleRowsBySubject: countFlat(staleRows.map((item) => item.subject ?? 'unknown')),
    staleRetrievedTop10Count: staleTop10.length,
    casesWithStaleTop10: cases.filter((item) =>
      item.failureTypes?.includes('stale_db_candidate'),
    ).length,
    staleTop10Ids: [...new Set(staleTop10.map((item) => item.id))],
  };
}

function buildGoldReview(cases: JsonRecord[]) {
  return {
    generated_at: new Date().toISOString(),
    criteria: [
      'Physics/Chemistry only',
      'gold not in top10, rank > 5, possible bad gold, missing question keywords, too short, or stale candidate',
    ],
    cases: cases
      .filter((item) => ['physics', 'chemistry'].includes(item.subject))
      .filter((item) =>
        (item.failureTypes ?? []).some((type: string) =>
          [
            'gold_not_in_top10',
            'gold_low_rank',
            'possible_bad_gold_label',
            'expected_chunk_missing_question_keywords',
            'expected_chunk_too_short',
            'stale_db_candidate',
          ].includes(type),
        ),
      )
      .map((item) => ({
        caseId: item.caseId,
        subject: item.subject,
        grade: item.grade,
        questionType: item.questionType,
        question: item.question,
        failureTypes: item.failureTypes,
        currentExpectedChunkIds: item.expectedChunkIds,
        expectedExcerpt: item.expectedChunks?.[0]?.excerpt ?? '',
        top10CandidateChunks: (item.topRetrievedChunks ?? []).map((chunk: RetrievedChunk) => ({
          rank: chunk.rank,
          id: chunk.id,
          score: chunk.finalScore ?? chunk.score,
          subject: chunk.subject,
          grade: chunk.grade,
          chapter: chunk.chapter,
          lessonId: chunk.lessonId,
          title: chunk.title,
          sourceType: chunk.sourceType,
          validationStatus: chunk.validationStatus,
          excerpt: chunk.excerpt,
        })),
        suggestedAction: suggestGoldAction(item),
        humanDecision: '',
      })),
  };
}

function suggestGoldAction(item: JsonRecord) {
  if (item.failureTypes?.includes('possible_bad_gold_label')) {
    return 'needs_human_review';
  }
  if (item.failureTypes?.includes('expected_chunk_missing_question_keywords')) {
    return 'rewrite_question';
  }
  if (item.failureTypes?.includes('expected_chunk_too_short')) {
    return 'add_candidate_as_additional_gold';
  }
  if (item.failureTypes?.includes('gold_not_in_top10')) {
    return 'needs_human_review';
  }
  if (item.failureTypes?.includes('gold_low_rank')) {
    return 'keep_gold';
  }
  return 'needs_human_review';
}

function buildDiagnosticsMarkdown(report: JsonRecord) {
  const lines = [
    '# RAG Eval 90 Diagnostics',
    '',
    `- Generated at: ${report.generated_at}`,
    `- Top chunks per case in report: ${report.inputs.topChunksPerCase}`,
    '',
    '## Overall Metrics',
    '',
    metricsTable({ overall: report.summary.overall }),
    '',
    '## Metrics By Subject',
    '',
    metricsTable(report.summary.bySubject),
    '',
    '## Metrics By Question Type',
    '',
    metricsTable(report.summary.byQuestionType),
    '',
    '## Metrics By Source Type',
    '',
    metricsTable(report.summary.bySourceType),
    '',
    '## Failure Type Counts',
    '',
    countTable(report.summary.failureTypeCounts),
    '',
    '## Benchmark Balance Analysis',
    '',
    '### Average Expected Chunk Length By Subject',
    '',
    simpleTable(report.benchmarkBalanceAnalysis.averageExpectedChunkLengthBySubject),
    '',
    '### Source Type By Subject',
    '',
    nestedTable(report.benchmarkBalanceAnalysis.sourceTypeBySubject),
    '',
    '### Validation Status By Subject',
    '',
    nestedTable(report.benchmarkBalanceAnalysis.validationStatusBySubject),
    '',
    '### Question Type By Subject',
    '',
    nestedTable(report.benchmarkBalanceAnalysis.questionTypeBySubject),
    '',
    '### Key Term Coverage By Subject',
    '',
    simpleTable(report.benchmarkBalanceAnalysis.expectedChunkContainsKeyTermsRatioBySubject),
    '',
    '## Stale DB Status',
    '',
    `- DB chunks not in preview: ${report.staleDb.dbChunksNotInPreview}`,
    `- Stale retrieved top10 count: ${report.staleDb.staleRetrievedTop10Count}`,
    `- Cases with stale top10: ${report.staleDb.casesWithStaleTop10}`,
    '',
    '## Physics Worst 15 Cases',
    '',
    worstCaseTable(report.cases.filter((item: JsonRecord) => item.subject === 'physics').slice(0, 30), 15),
    '',
    '## Chemistry Worst 15 Cases',
    '',
    worstCaseTable(report.cases.filter((item: JsonRecord) => item.subject === 'chemistry').slice(0, 30), 15),
    '',
    '## Math Worst 10 Cases',
    '',
    worstCaseTable(report.cases.filter((item: JsonRecord) => item.subject === 'math').slice(0, 30), 10),
    '',
    '## Caveat',
    '',
    '- Math metrics are optimistic due to synthetic curriculum chunks and source-faithful generated gold labels.',
  ];
  return lines.join('\n');
}

function buildStaleReport(staleRows: ChunkMeta[], cases: JsonRecord[]) {
  const staleSummary = buildStaleSummary(staleRows, cases);
  return [
    '# Stale DB Theory Chunks Report',
    '',
    `- Generated at: ${new Date().toISOString()}`,
    `- DB chunks not in current preview: ${staleSummary.dbChunksNotInPreview}`,
    `- Stale chunks appearing in top10: ${staleSummary.staleRetrievedTop10Count}`,
    `- Cases with stale top10 chunks: ${staleSummary.casesWithStaleTop10}`,
    '',
    '## Stale Rows By Subject',
    '',
    countTable(staleSummary.staleRowsBySubject),
    '',
    '## Stale Top10 IDs',
    '',
    staleSummary.staleTop10Ids.length
      ? staleSummary.staleTop10Ids.map((id: string) => `- ${id}`).join('\n')
      : 'No stale chunks appeared in top10.',
    '',
    '## Recommendation',
    '',
    staleSummary.casesWithStaleTop10 > 0
      ? '- Do not delete automatically. Consider a dev-only cleanup command that removes theory_chunks not present in the preview, or add eval filtering by datasetVersion/source IDs.'
      : '- Stale rows exist only as DB residue and did not affect top10 retrieval in this diagnostics run.',
  ].join('\n');
}

function buildGoldReviewMarkdown(review: JsonRecord) {
  const lines = [
    '# RAG Eval 90 Physics/Chemistry Gold Review',
    '',
    `- Generated at: ${review.generated_at}`,
    `- Cases requiring review: ${review.cases.length}`,
    '',
  ];
  for (const item of review.cases) {
    lines.push(
      `## ${item.caseId}`,
      '',
      `- Subject: ${item.subject}`,
      `- Grade: ${item.grade}`,
      `- Question type: ${item.questionType}`,
      `- Failure types: ${(item.failureTypes ?? []).join(', ')}`,
      `- Suggested action: ${item.suggestedAction}`,
      '- Human decision: ',
      '',
      `Question: ${item.question}`,
      '',
      `Current expected: ${(item.currentExpectedChunkIds ?? []).join(', ')}`,
      '',
      `Expected excerpt: ${item.expectedExcerpt}`,
      '',
      '| Rank | Chunk ID | Score | Source Type | Validation | Excerpt |',
      '| ---: | --- | ---: | --- | --- | --- |',
    );
    for (const chunk of item.top10CandidateChunks ?? []) {
      lines.push(
        `| ${chunk.rank} | ${chunk.id} | ${formatMetric(chunk.score)} | ${chunk.sourceType ?? 'unknown'} | ${chunk.validationStatus ?? 'unknown'} | ${escapeCell(truncate(chunk.excerpt, 220))} |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

async function readDbChunkMap(dataSource: DataSource) {
  const rows = (await dataSource.query(`
    SELECT
      id,
      subject,
      grade,
      chapter,
      lesson_id AS "lessonId",
      lesson_title AS "lessonTitle",
      topic,
      title,
      type,
      text,
      validation_status AS "validationStatus",
      source,
      metadata
    FROM theory_chunks
    WHERE is_active = true
  `)) as JsonRecord[];

  return new Map(rows.map((row) => [String(row.id), dbRowToChunkMeta(row)]));
}

function buildPreviewChunkMap(data: JsonRecord) {
  const chunks = Array.isArray(data.theoryChunks) ? data.theoryChunks : [];
  return new Map(chunks.filter(isRecord).map((chunk) => [String(chunk.id), previewToChunkMeta(chunk)]));
}

function previewToChunkMeta(chunk: JsonRecord): ChunkMeta {
  const text = String(chunk.text ?? '');
  return {
    id: String(chunk.id),
    subject: asString(chunk.subject),
    grade: asNumber(chunk.grade),
    chapter: asString(chunk.chapter),
    lessonId: asString(chunk.lessonId),
    lessonTitle: asString(chunk.lessonTitle),
    topic: asString(chunk.topic),
    title: asString(chunk.title),
    type: asString(chunk.type),
    validationStatus: asString(chunk.validationStatus),
    sourceType: readSourceType(chunk),
    chunkType: asString(chunk.type),
    textLength: text.length,
    excerpt: truncate(text, 500),
    inPreview: true,
  };
}

function dbRowToChunkMeta(row: JsonRecord): ChunkMeta {
  const text = String(row.text ?? '');
  return {
    id: String(row.id),
    subject: asString(row.subject),
    grade: asNumber(row.grade),
    chapter: asString(row.chapter),
    lessonId: asString(row.lessonId),
    lessonTitle: asString(row.lessonTitle),
    topic: asString(row.topic),
    title: asString(row.title),
    type: asString(row.type),
    validationStatus: asString(row.validationStatus),
    sourceType: readSourceType(row),
    chunkType: asString(row.type),
    textLength: text.length,
    excerpt: truncate(text, 500),
    inPreview: false,
  };
}

function chunkMeta(
  id: string,
  previewChunks: Map<string, ChunkMeta>,
  dbChunks: Map<string, ChunkMeta>,
) {
  const preview = previewChunks.get(id);
  if (preview) return preview;
  const db = dbChunks.get(id);
  if (db) return db;
  return {
    id,
    textLength: 0,
    excerpt: '',
    inPreview: false,
  } as ChunkMeta;
}

function readSourceType(row: JsonRecord) {
  const source = isRecord(row.source) ? row.source : undefined;
  const metadata = isRecord(row.metadata) ? row.metadata : undefined;
  return asString(source?.sourceType ?? metadata?.sourceType ?? metadata?.generatedFrom);
}

function readExpectedIds(evalCase: JsonRecord, reportCase: JsonRecord) {
  const expected = isRecord(evalCase.expected) ? evalCase.expected : {};
  const ids =
    evalCase.expectedChunkIds ??
    expected.relevant_chunk_ids ??
    reportCase.expected_chunk_ids ??
    [];
  return Array.isArray(ids) ? ids.map(String).filter(Boolean) : [];
}

function bestRank(expectedIds: string[], retrieved: RetrievedChunk[]) {
  const expectedSet = new Set(expectedIds);
  const found = retrieved.find((chunk) => expectedSet.has(chunk.id));
  return found ? found.rank : null;
}

function keyTermCoverage(question: string, text: string) {
  const tokens = meaningfulTokens(question);
  if (tokens.length === 0) return 0;
  const haystack = normalize(text);
  return tokens.filter((token) => haystack.includes(token)).length / tokens.length;
}

function meaningfulTokens(value: string) {
  const stop = new Set([
    'trong',
    'hay',
    'neu',
    'khai',
    'niem',
    'hoac',
    'dinh',
    'nghia',
    'chinh',
    'lien',
    'quan',
    'den',
    'grade',
    'physics',
    'chemistry',
    'math',
  ]);
  return [...new Set(normalize(value).split(/\s+/).filter((token) => token.length >= 4 && !stop.has(token)))];
}

function normalize(value: string) {
  return decodeMojibake(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeMojibake(value: string) {
  return value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã /g, 'à')
    .replace(/áº¿/g, 'ế')
    .replace(/á»‡/g, 'ệ')
    .replace(/á»/g, 'ọ')
    .replace(/Ä‘/g, 'đ');
}

function worstCaseTable(cases: JsonRecord[], limit: number) {
  const rows = [...cases]
    .sort(
      (left, right) =>
        (right.goldBestRank === null ? 999 : right.goldBestRank) -
        (left.goldBestRank === null ? 999 : left.goldBestRank),
    )
    .slice(0, limit);
  if (rows.length === 0) return 'No cases.';
  return [
    '| Case | Type | Gold Rank | Failure Types | Top1 | Expected |',
    '| --- | --- | ---: | --- | --- | --- |',
    ...rows.map(
      (item) =>
        `| ${item.caseId} | ${item.questionType ?? ''} | ${item.goldBestRank ?? 'not top10'} | ${(item.failureTypes ?? []).join(', ')} | ${item.topRetrievedChunks?.[0]?.id ?? '-'} | ${(item.expectedChunkIds ?? []).join(', ')} |`,
    ),
  ].join('\n');
}

function metricsTable(groups: JsonRecord) {
  return [
    '| Group | Total | Hit@1 | Hit@3 | Hit@5 | Hit@10 | MRR |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...Object.entries(groups).map(
      ([key, value]) =>
        `| ${key} | ${(value as JsonRecord).total} | ${formatMetric((value as JsonRecord).hitAt1)} | ${formatMetric((value as JsonRecord).hitAt3)} | ${formatMetric((value as JsonRecord).hitAt5)} | ${formatMetric((value as JsonRecord).hitAt10)} | ${formatMetric((value as JsonRecord).mrr)} |`,
    ),
  ].join('\n');
}

function countTable(counts: JsonRecord) {
  const entries = Object.entries(counts ?? {});
  if (entries.length === 0) return 'None.';
  return [
    '| Value | Count |',
    '| --- | ---: |',
    ...entries.map(([key, value]) => `| ${key} | ${value} |`),
  ].join('\n');
}

function simpleTable(values: JsonRecord) {
  return [
    '| Group | Value |',
    '| --- | ---: |',
    ...Object.entries(values ?? {}).map(([key, value]) => `| ${key} | ${formatMetric(Number(value))} |`),
  ].join('\n');
}

function nestedTable(values: JsonRecord) {
  return [
    '| Group | Distribution |',
    '| --- | --- |',
    ...Object.entries(values ?? {}).map(
      ([key, inner]) =>
        `| ${key} | ${Object.entries(inner as JsonRecord)
          .map(([innerKey, count]) => `${innerKey}=${count}`)
          .join(', ')} |`,
    ),
  ].join('\n');
}

function averageBy(rows: JsonRecord[], groupKey: string, valueKey: string) {
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = String(row[groupKey] ?? 'unknown');
    groups.set(key, [...(groups.get(key) ?? []), Number(row[valueKey]) || 0]);
  }
  return Object.fromEntries(
    [...groups.entries()].map(([key, values]) => [
      key,
      values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length),
    ]),
  );
}

function countTruthyBy(rows: JsonRecord[], groupKey: string, valueKey: string) {
  const groups = new Map<string, number>();
  for (const row of rows) {
    const key = String(row[groupKey] ?? 'unknown');
    groups.set(key, (groups.get(key) ?? 0) + (row[valueKey] ? 1 : 0));
  }
  return Object.fromEntries([...groups.entries()]);
}

function nestedCounts(rows: JsonRecord[], groupKey: string, valueKey: string) {
  const groups = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const group = String(row[groupKey] ?? 'unknown');
    const value = String(row[valueKey] ?? 'unknown');
    const counts = groups.get(group) ?? {};
    counts[value] = (counts[value] ?? 0) + 1;
    groups.set(group, counts);
  }
  return Object.fromEntries([...groups.entries()]);
}

function countFlat(values: string[]) {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function ratio(count: number, total: number) {
  return total ? count / total : 0;
}

function readCaseId(item: JsonRecord) {
  return String(item.id ?? item.caseId ?? item.case_id ?? 'unknown');
}

async function readJson(path: string) {
  return JSON.parse(await readFile(path, 'utf8')) as JsonRecord;
}

function timestampForFile() {
  return new Date().toISOString().replace(/[:.]/g, '').replace('Z', 'Z');
}

function truncate(value: string, max = 500) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 3).trimEnd()}...`;
}

function formatMetric(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(4) : 'N/A';
}

function escapeCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
