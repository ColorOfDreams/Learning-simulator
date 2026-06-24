export function toPgVector(vector: number[]): string {
  if (vector.length === 0 || !vector.every((value) => Number.isFinite(value))) {
    throw new Error('A pgvector value must contain finite numeric values.');
  }

  return `[${vector.join(',')}]`;
}
