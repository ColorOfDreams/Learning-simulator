export type LearningParameter = {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
};

export type LearningTarget = {
  key: string;
  label: string;
};

export type SolutionStep = {
  step: number;
  content: string;
};

export type LearningAnswer = {
  short: string;
  steps: SolutionStep[];
  finalValues?: LearningParameter[];
};

export type LearningDifficulty =
  | 'recognition'
  | 'understanding'
  | 'application'
  | 'high_application';
