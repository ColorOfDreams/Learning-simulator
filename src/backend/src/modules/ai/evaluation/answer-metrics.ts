import type { ExpectedEvaluationAnswer } from './eval-types';

export type ExtractedNumberWithUnit = {
  value: number;
  raw: string;
  unit?: string;
  index: number;
};

export type RequiredConceptMetrics = {
  conceptCoverage: number;
  matchedConcepts: string[];
  missingConcepts: string[];
};

export type RuleBasedAnswerMetrics = {
  numericCorrect: boolean | null;
  conceptCoverage: number | null;
  matchedConcepts: string[];
  missingConcepts: string[];
  ruleBasedScore: number;
};

type ConceptRequirement = {
  label: string;
  anyOf: string[];
};

const DEFAULT_NUMERIC_TOLERANCE = 1e-6;
const NUMBER_PATTERN =
  /[-+]?(?:\d{1,3}(?:[.\s]\d{3})+|\d+)(?:[,.]\d+)?/g;

export function extractNumbersWithUnits(
  answerText: unknown,
): ExtractedNumberWithUnit[] {
  const text = typeof answerText === 'string' ? answerText : '';
  const numbers: ExtractedNumberWithUnit[] = [];

  for (const match of text.matchAll(NUMBER_PATTERN)) {
    const raw = match[0];
    const index = match.index ?? 0;
    const value = parseLocalizedNumber(raw);

    if (!Number.isFinite(value)) {
      continue;
    }

    const unit = readNearbyUnit(text, index + raw.length);

    numbers.push({
      value,
      raw,
      ...(unit ? { unit } : {}),
      index,
    });
  }

  return numbers;
}

export function checkNumericAnswer(
  answerText: unknown,
  expected: ExpectedEvaluationAnswer | null | undefined,
): boolean | null {
  const expectedValue = toFiniteNumber(expected?.value);

  if (expectedValue === undefined) {
    return null;
  }

  const tolerance =
    typeof expected?.tolerance === 'number' && expected.tolerance >= 0
      ? expected.tolerance
      : DEFAULT_NUMERIC_TOLERANCE;
  const numbers = extractNumbersWithUnits(answerText);
  const text = typeof answerText === 'string' ? answerText : '';

  return numbers.some((number) => {
    const valueMatches = Math.abs(number.value - expectedValue) <= tolerance;

    if (!valueMatches) {
      return false;
    }

    return expected?.unit ? unitMatches(text, number, expected.unit) : true;
  });
}

export function checkRequiredConcepts(
  answerText: unknown,
  requiredConcepts: readonly unknown[] | null | undefined,
): RequiredConceptMetrics {
  const concepts = normalizeConceptList(requiredConcepts);

  if (concepts.length === 0) {
    return {
      conceptCoverage: 0,
      matchedConcepts: [],
      missingConcepts: [],
    };
  }

  const normalizedAnswer = normalizeTextForMatch(
    typeof answerText === 'string' ? answerText : '',
  );
  const matchedConcepts = concepts.filter((concept) =>
    concept.anyOf.some((alias) =>
      normalizedAnswer.includes(normalizeTextForMatch(alias)),
    ),
  );
  const missingConcepts = concepts.filter(
    (concept) => !matchedConcepts.includes(concept),
  );

  return {
    conceptCoverage: matchedConcepts.length / concepts.length,
    matchedConcepts: matchedConcepts.map((concept) => concept.label),
    missingConcepts: missingConcepts.map((concept) => concept.label),
  };
}

export function computeRuleBasedAnswerMetrics(
  answerText: unknown,
  expected: ExpectedEvaluationAnswer | null | undefined,
): RuleBasedAnswerMetrics {
  if (!expected || typeof expected !== 'object') {
    return emptyRuleBasedMetrics();
  }

  const type = expected.type ?? inferAnswerType(expected);
  const requiredConcepts =
    expected.required_concepts ?? expected.requiredConcepts ?? [];
  const conceptMetrics = checkRequiredConcepts(answerText, requiredConcepts);
  const hasConcepts = normalizeConceptList(requiredConcepts).length > 0;
  const numericCorrect =
    type === 'conceptual' ? null : checkNumericAnswer(answerText, expected);
  const conceptCoverage = hasConcepts ? conceptMetrics.conceptCoverage : null;
  const ruleBasedScore = computeScore({
    type,
    numericCorrect,
    conceptCoverage,
  });

  return {
    numericCorrect,
    conceptCoverage,
    matchedConcepts: conceptMetrics.matchedConcepts,
    missingConcepts: conceptMetrics.missingConcepts,
    ruleBasedScore,
  };
}

export function normalizeTextForMatch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Ä‘/g, 'd')
    .replace(/[πΠ]/g, 'pi')
    .replace(/Ï€/g, 'pi')
    .replace(/[ωΩ]/g, 'omega')
    .replace(/Ï‰/g, 'omega')
    .replace(/[φϕΦ]/g, 'phi')
    .replace(/Ï†|Ï•/g, 'phi')
    .replace(/²/g, '^2')
    .replace(/Â²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/Â³/g, '^3')
    .replace(/√/g, 'sqrt')
    .replace(/_/g, '')
    .replace(/\bchu ky\b/g, 'chu ki')
    .replace(/\s*([=+\-*/^()])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeScore(input: {
  type: 'numeric' | 'conceptual' | 'mixed';
  numericCorrect: boolean | null;
  conceptCoverage: number | null;
}) {
  const numericScore =
    input.numericCorrect === null ? null : input.numericCorrect ? 1 : 0;

  if (input.type === 'numeric') {
    return weightedAverage([
      { value: numericScore, weight: 0.8 },
      { value: input.conceptCoverage, weight: 0.2 },
    ]);
  }

  if (input.type === 'conceptual') {
    return input.conceptCoverage ?? 0;
  }

  return weightedAverage([
    { value: numericScore, weight: 0.5 },
    { value: input.conceptCoverage, weight: 0.5 },
  ]);
}

function weightedAverage(items: { value: number | null; weight: number }[]) {
  const applicable = items.filter((item) => item.value !== null);

  if (applicable.length === 0) {
    return 0;
  }

  const totalWeight = applicable.reduce((sum, item) => sum + item.weight, 0);

  return (
    applicable.reduce(
      (sum, item) => sum + Number(item.value) * item.weight,
      0,
    ) / totalWeight
  );
}

function inferAnswerType(
  expected: ExpectedEvaluationAnswer,
): 'numeric' | 'conceptual' | 'mixed' {
  const hasValue = toFiniteNumber(expected.value) !== undefined;
  const hasConcepts =
    normalizeConceptList(
      expected.required_concepts ?? expected.requiredConcepts,
    ).length > 0;

  if (hasValue && hasConcepts) {
    return 'mixed';
  }

  return hasValue ? 'numeric' : 'conceptual';
}

function emptyRuleBasedMetrics(): RuleBasedAnswerMetrics {
  return {
    numericCorrect: null,
    conceptCoverage: null,
    matchedConcepts: [],
    missingConcepts: [],
    ruleBasedScore: 0,
  };
}

function parseLocalizedNumber(value: string) {
  const compact = value.replace(/\s/g, '');

  if (compact.includes(',') && compact.includes('.')) {
    return Number(compact.replace(/\./g, '').replace(',', '.'));
  }

  if (compact.includes(',')) {
    return Number(compact.replace(',', '.'));
  }

  return Number(compact);
}

function toFiniteNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = parseLocalizedNumber(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readNearbyUnit(text: string, startIndex: number) {
  const trailingText = text.slice(startIndex, startIndex + 20);
  const match = trailingText.match(
    /^\s*(?:\*|x|×|·)?\s*([a-zA-ZµμΩ°%]+(?:\/[a-zA-ZµμΩ°%]+)?(?:\^-?\d+)?)/,
  );

  return match?.[1];
}

function unitMatches(
  answerText: string,
  number: ExtractedNumberWithUnit,
  expectedUnit: string,
) {
  const expectedUnits = unitAliases(expectedUnit);
  const explicitUnit = number.unit ? normalizeUnit(number.unit) : '';

  if (explicitUnit && expectedUnits.includes(explicitUnit)) {
    return true;
  }

  const localWindow = normalizeUnit(
    answerText.slice(number.index, number.index + number.raw.length + 24),
  );

  return expectedUnits.some((unit) => containsUnit(localWindow, unit));
}

function unitAliases(unit: string) {
  const normalized = normalizeUnit(unit);
  const aliases: Record<string, string[]> = {
    s: ['s', 'giay', 'second', 'seconds'],
    hz: ['hz', 'hec', 'hertz'],
    'rad/s': ['rad/s', 'rad s', 'radian/s', 'radian s'],
    cm: ['cm', 'centimet', 'centimeter'],
    m: ['m', 'met', 'meter'],
  };

  return aliases[normalized] ?? [normalized];
}

function normalizeUnit(unit: string) {
  return normalizeTextForMatch(unit)
    .replace(/\/\s+/g, '/')
    .replace(/\s+\//g, '/')
    .replace(/\s+/g, ' ');
}

function containsUnit(value: string, unit: string) {
  if (unit.length === 1) {
    return new RegExp(`(^|[^a-z])${escapeRegExp(unit)}([^a-z]|$)`).test(value);
  }

  return value.includes(unit);
}

function normalizeConceptList(values: readonly unknown[] | null | undefined) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map(readConceptRequirement)
    .filter((value): value is ConceptRequirement => Boolean(value));
}

function readConceptRequirement(value: unknown): ConceptRequirement | undefined {
  if (typeof value === 'string') {
    const label = value.trim();

    return label ? { label, anyOf: [label] } : undefined;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const label =
    typeof record.label === 'string' && record.label.trim()
      ? record.label.trim()
      : undefined;
  const aliases = Array.isArray(record.anyOf)
    ? record.anyOf
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (!label && aliases.length === 0) {
    return undefined;
  }

  return {
    label: label ?? aliases[0],
    anyOf: [...new Set([...(label ? [label] : []), ...aliases])],
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
