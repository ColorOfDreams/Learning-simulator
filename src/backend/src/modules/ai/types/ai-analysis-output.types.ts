export type AiIntent =
  | 'solve'
  | 'simulate'
  | 'solve_and_simulate'
  | 'explain'
  | 'generate_problem'
  | 'chat';

export type AiGivenValue = {
  key: string;
  value: number | string;
  unit?: string;
  label: string;
};

export type AiAnswer = {
  short_answer: string;
  steps: string[];
};

export type AiSimulation = {
  simulation_id: string;
  title: string;
  parameters: AiGivenValue[];
};

export type AiRenderBlock =
  | { type: 'answer_card' }
  | { type: 'formula_card' }
  | { type: 'simulation_card' }
  | { type: 'theory_card' };

export type AiReference = {
  id: string;
  title: string;
  text: string;
  topic?: string;
  source?: string;
  metadata?: object;
  score?: number;
  vectorScore?: number;
  keywordScore?: number;
  retrievalType?: 'vector' | 'keyword' | 'hybrid';
};

export type AiAnalysisOutput = {
  intent: AiIntent;
  subject: string;
  topic: string;
  confidence: number;
  analysis: {
    concepts: string[];
    skills: string[];
    given: AiGivenValue[];
    target: string[];
    pattern_id?: string;
  };
  answer: AiAnswer;
  simulation?: AiSimulation;
  render_blocks: AiRenderBlock[];
  references: AiReference[];
};
