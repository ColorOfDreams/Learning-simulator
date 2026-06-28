export type EvaluationAnswerType = 'numeric' | 'conceptual' | 'mixed';

export type ExpectedConceptRequirement =
  | string
  | {
      label: string;
      anyOf: string[];
    };

export type ExpectedEvaluationAnswer = {
  type?: EvaluationAnswerType;
  value?: number | string | boolean | Record<string, unknown> | null;
  unit?: string;
  tolerance?: number;
  required_concepts?: ExpectedConceptRequirement[];
  requiredConcepts?: ExpectedConceptRequirement[];
  [key: string]: unknown;
};

export type ExpectedEvaluationData = {
  intent?: string;
  topic?: string;
  pattern_id?: string;
  patternId?: string;
  simulation_template_id?: string;
  simulationId?: string;
  relevant_chunk_ids?: string[];
  relevantChunkIds?: string[];
  answer?: ExpectedEvaluationAnswer;
  [key: string]: unknown;
};

export type ExpectedEvaluationSource =
  | 'expected'
  | 'expectedOutput'
  | 'metadata.expected'
  | 'metadata.evaluation';

export type ResolvedExpectedEvaluationData = ExpectedEvaluationData & {
  pattern_id?: string;
  simulation_template_id?: string;
  relevant_chunk_ids?: string[];
  answer?: ExpectedEvaluationAnswer;
  sourcePath: ExpectedEvaluationSource;
  raw: ExpectedEvaluationData;
};

export type AiEvaluationTestCaseLike = {
  expected?: unknown;
  expectedOutput?: unknown;
  metadata?: unknown;
  [key: string]: unknown;
};
