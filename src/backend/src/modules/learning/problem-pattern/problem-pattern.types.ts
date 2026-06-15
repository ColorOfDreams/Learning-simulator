export type ProblemDifficultyLevel =
  | 'recognition'
  | 'understanding'
  | 'application'
  | 'high_application';

export type ProblemPatternLevel = {
  level: ProblemDifficultyLevel;
  description: string;
  generationInstruction: string;
};

export type ProblemPatternExample = {
  level: ProblemDifficultyLevel;
  question: string;
  answer?: string;
};

export type ProblemPatternMetadata = {
  formulaKeys?: string[];
  conceptKeys?: string[];
  skillKeys?: string[];
  tags?: string[];
};