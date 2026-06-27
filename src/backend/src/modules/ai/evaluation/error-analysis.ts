export type RagErrorType =
  | 'no_expected_chunks'
  | 'no_retrieved_chunks'
  | 'expected_not_in_top5'
  | 'relevant_found_but_rank_low'
  | 'topic_filter_mismatch_possible'
  | 'keyword_vector_disagreement'
  | 'unknown_error';

export type AnswerErrorType =
  | 'numeric_wrong'
  | 'missing_required_concepts'
  | 'answer_empty'
  | 'low_groundedness'
  | 'hallucination'
  | 'unclear_answer'
  | 'judge_failed'
  | 'unknown_error';

export type ErrorAnalysisRow<T extends string = string> = {
  errorType: T;
  count: number;
  suggestedFix: string;
};

export type RagErrorAnalysisCase = {
  expected_chunk_ids?: string[];
  retrieved_chunk_ids?: string[];
  topic?: string;
  metrics?: {
    skipped?: boolean;
    hitAt5?: number;
    recallAt5?: number;
    reciprocalRank?: number;
    firstRelevantRank?: number;
    skipReason?: string;
  };
  top_chunks?: {
    id?: string;
    topic?: string;
    vectorScore?: number;
    keywordScore?: number;
  }[];
  skipped_reason?: string;
  error?: string;
};

export type AnswerErrorAnalysisCase = {
  ai_answer?: string;
  metrics?: {
    numericCorrect?: boolean | null;
    conceptCoverage?: number | null;
    missingConcepts?: string[];
    ruleBasedScore?: number;
  };
  judge_scores?: {
    groundedness?: number;
    clarity?: number;
  };
  hallucination?: boolean;
  judge_error?: string;
  skipped_reason?: string;
  error?: string;
};

const RAG_SUGGESTED_FIXES: Record<RagErrorType, string> = {
  no_expected_chunks: 'Add gold relevant_chunk_ids to the eval case',
  no_retrieved_chunks: 'Check retriever query, filters, embeddings, and index availability',
  expected_not_in_top5: 'Improve embedding/chunk metadata/hybrid weights',
  relevant_found_but_rank_low: 'Tune reranking, hybrid weights, or increase topK',
  topic_filter_mismatch_possible: 'Check topic/subject/grade filters and chunk metadata',
  keyword_vector_disagreement: 'Tune hybrid scoring or normalize vector/keyword scores',
  unknown_error: 'Inspect case error and script logs',
};

const ANSWER_SUGGESTED_FIXES: Record<AnswerErrorType, string> = {
  numeric_wrong: 'Improve calculation prompt and numeric extraction checks',
  missing_required_concepts: 'Improve prompt answer format and required concept coverage',
  answer_empty: 'Check AI method fallback and answer extraction',
  low_groundedness: 'Require answer to cite and use retrieved context',
  hallucination: 'Constrain answer to references and reject unsupported claims',
  unclear_answer: 'Improve answer structure and wording requirements',
  judge_failed: 'Check judge model env and JSON-only parsing',
  unknown_error: 'Inspect case error and script logs',
};

export function classifyRagError(
  item: RagErrorAnalysisCase,
): RagErrorType | null {
  const expectedIds = item.expected_chunk_ids ?? [];
  const retrievedIds = item.retrieved_chunk_ids ?? [];
  const topChunks = item.top_chunks ?? [];

  if (item.error) {
    return 'unknown_error';
  }

  if (
    expectedIds.length === 0 ||
    includesText(item.skipped_reason, 'expected') ||
    includesText(item.metrics?.skipReason, 'expected')
  ) {
    return 'no_expected_chunks';
  }

  if (retrievedIds.length === 0) {
    return 'no_retrieved_chunks';
  }

  if (hasTopicMismatch(item.topic, topChunks)) {
    return 'topic_filter_mismatch_possible';
  }

  if (hasKeywordVectorDisagreement(topChunks)) {
    return 'keyword_vector_disagreement';
  }

  if ((item.metrics?.hitAt5 ?? 0) === 0) {
    return 'expected_not_in_top5';
  }

  if (
    (item.metrics?.firstRelevantRank ?? 1) > 3 ||
    (item.metrics?.reciprocalRank ?? 1) < 0.5 ||
    (item.metrics?.recallAt5 ?? 1) < 1
  ) {
    return 'relevant_found_but_rank_low';
  }

  return null;
}

export function classifyAnswerError(
  item: AnswerErrorAnalysisCase,
): AnswerErrorType | null {
  const answerText = item.ai_answer?.trim() ?? '';

  if (includesText(item.skipped_reason, 'expected answer')) {
    return null;
  }

  if (!answerText) {
    return 'answer_empty';
  }

  if (item.hallucination === true) {
    return 'hallucination';
  }

  if (item.judge_error) {
    return 'judge_failed';
  }

  if (item.error) {
    return 'unknown_error';
  }

  if ((item.judge_scores?.groundedness ?? 5) < 3) {
    return 'low_groundedness';
  }

  if ((item.judge_scores?.clarity ?? 5) < 3) {
    return 'unclear_answer';
  }

  if (item.metrics?.numericCorrect === false) {
    return 'numeric_wrong';
  }

  if (
    (item.metrics?.missingConcepts?.length ?? 0) > 0 ||
    (item.metrics?.conceptCoverage ?? 1) < 1
  ) {
    return 'missing_required_concepts';
  }

  return null;
}

export function buildRagErrorAnalysis(
  cases: RagErrorAnalysisCase[],
): ErrorAnalysisRow<RagErrorType>[] {
  return buildErrorAnalysisRows(
    cases.map(classifyRagError),
    RAG_SUGGESTED_FIXES,
  );
}

export function buildAnswerErrorAnalysis(
  cases: AnswerErrorAnalysisCase[],
): ErrorAnalysisRow<AnswerErrorType>[] {
  return buildErrorAnalysisRows(
    cases.map(classifyAnswerError),
    ANSWER_SUGGESTED_FIXES,
  );
}

function buildErrorAnalysisRows<T extends string>(
  types: (T | null)[],
  suggestedFixes: Record<T, string>,
): ErrorAnalysisRow<T>[] {
  const counts = new Map<T, number>();

  for (const type of types) {
    if (!type) {
      continue;
    }

    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([errorType, count]) => ({
      errorType,
      count,
      suggestedFix: suggestedFixes[errorType],
    }));
}

function hasTopicMismatch(
  expectedTopic: string | undefined,
  topChunks: RagErrorAnalysisCase['top_chunks'],
) {
  const normalizedExpectedTopic = normalizeText(expectedTopic ?? '');
  const chunkTopics = (topChunks ?? [])
    .map((chunk) => normalizeText(chunk.topic ?? ''))
    .filter(Boolean);

  return (
    Boolean(normalizedExpectedTopic) &&
    chunkTopics.length > 0 &&
    chunkTopics.every((topic) => !topic.includes(normalizedExpectedTopic))
  );
}

function hasKeywordVectorDisagreement(
  topChunks: RagErrorAnalysisCase['top_chunks'],
) {
  const scoredChunks = (topChunks ?? []).filter(
    (chunk) =>
      typeof chunk.vectorScore === 'number' &&
      typeof chunk.keywordScore === 'number',
  );

  if (scoredChunks.length === 0) {
    return false;
  }

  return scoredChunks.some(
    (chunk) =>
      Math.abs(Number(chunk.vectorScore) - Number(chunk.keywordScore)) >= 0.35,
  );
}

function includesText(value: string | undefined, needle: string) {
  return normalizeText(value ?? '').includes(normalizeText(needle));
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}
