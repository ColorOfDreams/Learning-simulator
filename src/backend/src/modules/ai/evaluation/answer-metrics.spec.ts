import {
  checkNumericAnswer,
  checkRequiredConcepts,
  computeRuleBasedAnswerMetrics,
  extractNumbersWithUnits,
} from './answer-metrics';

describe('answer metrics', () => {
  it('extracts localized decimal numbers', () => {
    expect(extractNumbersWithUnits('Chu ki T = 0,5 s.')[0]).toMatchObject({
      value: 0.5,
      raw: '0,5',
      unit: 's',
    });
  });

  it('checks numeric answers with tolerance and unit', () => {
    expect(
      checkNumericAnswer('T = 0,50 s', {
        type: 'numeric',
        value: 0.5,
        unit: 's',
        tolerance: 0.01,
      }),
    ).toBe(true);
  });

  it('computes required concept coverage with accent-insensitive matching', () => {
    expect(
      checkRequiredConcepts('Bien do la li do cuc dai tinh tu vi tri can bang.', [
        'biên độ',
        'li độ cực đại',
        'vị trí cân bằng',
      ]),
    ).toEqual({
      conceptCoverage: 1,
      matchedConcepts: ['biên độ', 'li độ cực đại', 'vị trí cân bằng'],
      missingConcepts: [],
    });
  });

  it('computes mixed rule-based metrics', () => {
    expect(
      computeRuleBasedAnswerMetrics('omega = 4pi nen T = 0,5 s.', {
        type: 'mixed',
        value: 0.5,
        unit: 's',
        tolerance: 0.01,
        required_concepts: ['omega = 4pi', 'T = 2pi/omega'],
      }),
    ).toMatchObject({
      numericCorrect: true,
      conceptCoverage: 0.5,
      matchedConcepts: ['omega = 4pi'],
      missingConcepts: ['T = 2pi/omega'],
      ruleBasedScore: 0.75,
    });
  });

  it('does not crash when expected is missing', () => {
    expect(computeRuleBasedAnswerMetrics('anything', undefined)).toEqual({
      numericCorrect: null,
      conceptCoverage: null,
      matchedConcepts: [],
      missingConcepts: [],
      ruleBasedScore: 0,
    });
  });
});
