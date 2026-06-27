export type RetrievalCaseMetrics = {
  skipped: boolean;
  hitAt1: 0 | 1;
  hitAt3: 0 | 1;
  hitAt5: 0 | 1;
  recallAt5: number;
  precisionAt5: number;
  reciprocalRank: number;
  matchedChunkIds: string[];
  firstRelevantRank?: number;
  skipReason?: string;
};

const TOP_K = 5;

export function calculateRetrievalCaseMetrics(
  expectedRelevantChunkIds: readonly unknown[],
  retrievedChunkIds: readonly unknown[],
): RetrievalCaseMetrics {
  const expectedIds = normalizeChunkIds(expectedRelevantChunkIds);
  const retrievedIds = normalizeChunkIds(retrievedChunkIds);

  if (expectedIds.length === 0) {
    return {
      skipped: true,
      hitAt1: 0,
      hitAt3: 0,
      hitAt5: 0,
      recallAt5: 0,
      precisionAt5: 0,
      reciprocalRank: 0,
      matchedChunkIds: [],
      skipReason: 'No expected relevant chunk ids',
    };
  }

  const expectedSet = new Set(expectedIds);
  const top5 = retrievedIds.slice(0, TOP_K);
  const matchedChunkIds = top5.filter((id) => expectedSet.has(id));
  const firstRelevantIndex = retrievedIds.findIndex((id) =>
    expectedSet.has(id),
  );
  const firstRelevantRank =
    firstRelevantIndex >= 0 ? firstRelevantIndex + 1 : undefined;

  return {
    skipped: false,
    hitAt1: hitAtK(expectedSet, retrievedIds, 1),
    hitAt3: hitAtK(expectedSet, retrievedIds, 3),
    hitAt5: hitAtK(expectedSet, retrievedIds, TOP_K),
    recallAt5: matchedChunkIds.length / expectedIds.length,
    precisionAt5: matchedChunkIds.length / TOP_K,
    reciprocalRank: firstRelevantRank ? 1 / firstRelevantRank : 0,
    matchedChunkIds,
    ...(firstRelevantRank ? { firstRelevantRank } : {}),
  };
}

export function calculateMeanReciprocalRank(
  metrics: readonly RetrievalCaseMetrics[],
) {
  const evaluatedCases = metrics.filter((metric) => !metric.skipped);

  if (evaluatedCases.length === 0) {
    return 0;
  }

  return (
    evaluatedCases.reduce(
      (sum, metric) => sum + metric.reciprocalRank,
      0,
    ) / evaluatedCases.length
  );
}

export function normalizeChunkIds(values: readonly unknown[]) {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values ?? []) {
    const id = String(value ?? '').trim();

    if (!id || seen.has(id)) {
      continue;
    }

    normalized.push(id);
    seen.add(id);
  }

  return normalized;
}

function hitAtK(
  expectedSet: ReadonlySet<string>,
  retrievedIds: readonly string[],
  k: number,
): 0 | 1 {
  return retrievedIds.slice(0, k).some((id) => expectedSet.has(id)) ? 1 : 0;
}
