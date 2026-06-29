import {
  calculateMeanReciprocalRank,
  calculateRetrievalCaseMetrics,
  normalizeChunkIds,
} from './retrieval-metrics';

describe('retrieval metrics', () => {
  it('calculates hit, recall, precision, and reciprocal rank', () => {
    const metrics = calculateRetrievalCaseMetrics(
      ['chunk-a', 'chunk-b'],
      ['other-1', 'other-2', 'chunk-b', 'other-3', 'other-4'],
    );

    expect(metrics).toEqual({
      skipped: false,
      hitAt1: 0,
      hitAt3: 1,
      hitAt5: 1,
      recallAt5: 0.5,
      precisionAt5: 0.2,
      reciprocalRank: 1 / 3,
      matchedChunkIds: ['chunk-b'],
      firstRelevantRank: 3,
    });
  });

  it('marks cases without expected relevant chunks as skipped', () => {
    const metrics = calculateRetrievalCaseMetrics([], ['chunk-a']);

    expect(metrics.skipped).toBe(true);
    expect(metrics.reciprocalRank).toBe(0);
    expect(metrics.matchedChunkIds).toEqual([]);
  });

  it('handles empty retrieved chunks without crashing', () => {
    const metrics = calculateRetrievalCaseMetrics(['chunk-a'], []);

    expect(metrics.skipped).toBe(false);
    expect(metrics.hitAt5).toBe(0);
    expect(metrics.recallAt5).toBe(0);
    expect(metrics.precisionAt5).toBe(0);
    expect(metrics.reciprocalRank).toBe(0);
  });

  it('normalizes ids by trimming strings and removing duplicates', () => {
    expect(normalizeChunkIds([' chunk-a ', 'chunk-a', '', null])).toEqual([
      'chunk-a',
    ]);
  });

  it('averages reciprocal rank over non-skipped cases', () => {
    const metrics = [
      calculateRetrievalCaseMetrics(['chunk-a'], ['chunk-a']),
      calculateRetrievalCaseMetrics(['chunk-b'], ['x', 'chunk-b']),
      calculateRetrievalCaseMetrics([], ['chunk-c']),
    ];

    expect(calculateMeanReciprocalRank(metrics)).toBe(0.75);
  });
});
