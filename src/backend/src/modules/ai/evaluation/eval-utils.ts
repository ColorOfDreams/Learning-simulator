import type {
  AiEvaluationTestCaseLike,
  ExpectedConceptRequirement,
  ExpectedEvaluationAnswer,
  ExpectedEvaluationData,
  ExpectedEvaluationSource,
  ResolvedExpectedEvaluationData,
} from './eval-types';

type Candidate = {
  source: ExpectedEvaluationSource;
  value: unknown;
};

export function readExpectedEvaluationData(
  testCase: unknown,
): ResolvedExpectedEvaluationData | null {
  if (!isRecord(testCase)) {
    return null;
  }

  const typedTestCase = testCase as AiEvaluationTestCaseLike;
  const metadata = isRecord(typedTestCase.metadata)
    ? typedTestCase.metadata
    : undefined;
  const candidates: Candidate[] = [
    { source: 'expected', value: typedTestCase.expected },
    { source: 'expectedOutput', value: typedTestCase.expectedOutput },
    { source: 'metadata.expected', value: metadata?.expected },
    { source: 'metadata.evaluation', value: metadata?.evaluation },
  ];

  for (const candidate of candidates) {
    if (!isRecord(candidate.value)) {
      continue;
    }

    return normalizeExpectedEvaluationData(
      candidate.value as ExpectedEvaluationData,
      candidate.source,
    );
  }

  return null;
}

function normalizeExpectedEvaluationData(
  raw: ExpectedEvaluationData,
  source: ExpectedEvaluationSource,
): ResolvedExpectedEvaluationData {
  const answer = normalizeAnswer(raw.answer);
  const normalized: ResolvedExpectedEvaluationData = {
    ...raw,
    sourcePath: source,
    raw,
  };

  const patternId = asString(raw.pattern_id) ?? asString(raw.patternId);
  if (patternId) {
    normalized.pattern_id = patternId;
  }

  const simulationTemplateId =
    asString(raw.simulation_template_id) ?? asString(raw.simulationId);
  if (simulationTemplateId) {
    normalized.simulation_template_id = simulationTemplateId;
  }

  const relevantChunkIds =
    asStringArray(raw.relevant_chunk_ids) ?? asStringArray(raw.relevantChunkIds);
  if (relevantChunkIds) {
    normalized.relevant_chunk_ids = relevantChunkIds;
  }

  if (answer) {
    normalized.answer = answer;
  }

  return normalized;
}

function normalizeAnswer(value: unknown): ExpectedEvaluationAnswer | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const answer = { ...(value as ExpectedEvaluationAnswer) };
  const requiredConcepts =
    asConceptArray(answer.required_concepts) ??
    asConceptArray(answer.requiredConcepts);

  if (requiredConcepts) {
    answer.required_concepts = requiredConcepts;
  }

  return answer;
}

function asString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function asConceptArray(value: unknown): ExpectedConceptRequirement[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isExpectedConceptRequirement);
}

function isExpectedConceptRequirement(
  value: unknown,
): value is ExpectedConceptRequirement {
  if (typeof value === 'string') {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.label === 'string' &&
    Array.isArray(value.anyOf) &&
    value.anyOf.every((item) => typeof item === 'string')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
