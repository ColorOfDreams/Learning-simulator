export type TheoryChunkType =
  | 'definition'
  | 'formula'
  | 'explanation'
  | 'example'
  | 'note'
  | 'misconception';

export type TheorySource = {
  sourceType?: 'textbook' | 'workbook' | 'teacher_book' | 'exam' | 'custom';
  sourceName?: string;
  pageStart?: number;
  pageEnd?: number;
  fileName?: string;
};

export type TheoryMetadata = {
  curriculum?: string;
  lesson?: string;
  tags?: string[];
  formulaKeys?: string[];
  conceptKeys?: string[];
};
