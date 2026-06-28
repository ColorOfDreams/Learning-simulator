type MixResult = {
  updatedContents: string[];
  updatedColor: string;
  effect: { type: string; intensity: number; color?: string } | null;
};

const ACID_INDICATORS: Record<string, { acid: string; base: string; neutral: string; indicator: string }> = {
  phenolphtalein: { acid: '#ffffff00', base: '#ff1493', neutral: '#ffffff00', indicator: 'phenolphtalein' },
  'quy-tim': { acid: '#ff4444', base: '#4444ff', neutral: '#9b59b6', indicator: 'quy-tim' },
};

const ACID_LIST = ['HCl', 'H2SO4', 'HNO3', 'CH3COOH', 'H3PO4', 'acid'];
const BASE_LIST = ['NaOH', 'KOH', 'Ca(OH)2', 'NH3', 'NH4OH', 'Na2CO3', 'base'];

// const SALT_COLORS: Record<string, string> = {
//   NaCl: '#ffffff',
//   KCl: '#ffffff',
//   Na2SO4: '#ffffff',
//   NaNO3: '#ffffff',
//   CH3COONa: '#ffffff',
//   CaCl2: '#ffffff',
//   'Ca(NO3)2': '#ffffff',
//   K2SO4: '#ffffff',
// };

function isAcid(chem: string): boolean {
  return ACID_LIST.some((a) => chem.toLowerCase().includes(a.toLowerCase()) || chem === a);
}

function isBase(chem: string): boolean {
  return BASE_LIST.some((b) => chem.toLowerCase().includes(b.toLowerCase()) || chem === b);
}

function isIndicator(chem: string): boolean {
  return Object.keys(ACID_INDICATORS).some((i) => chem.toLowerCase().includes(i));
}

function mixColors(c1: string, c2: string, ratio = 0.5): string {
  const parse = (hex: string): [number, number, number, number] => {
    hex = hex.replace('#', '');
    if (hex.length === 6) {
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), 255];
    }
    if (hex.length === 8) {
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), parseInt(hex.slice(6, 8), 16)];
    }
    return [0, 0, 0, 255];
  };

  const [r1, g1, b1, a1] = parse(c1);
  const [r2, g2, b2, a2] = parse(c2);
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  const a = Math.round(a1 * (1 - ratio) + a2 * ratio);

  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function detectPH(contents: string[]): number {
  let hasAcid = false;
  let hasBase = false;

  for (const c of contents) {
    if (isAcid(c)) hasAcid = true;
    if (isBase(c)) hasBase = true;
  }

  if (hasAcid && hasBase) return 7;
  if (hasAcid) return 2;
  if (hasBase) return 12;
  return 7;
}

function getNeutralizationResult(acid: string, base: string): { salt: string; acidColor: string } {
  if (acid.includes('HCl') && base.includes('NaOH')) return { salt: 'NaCl', acidColor: '#ffffff' };
  if (acid.includes('H2SO4') && base.includes('NaOH')) return { salt: 'Na2SO4', acidColor: '#ffffff' };
  if (acid.includes('HNO3') && base.includes('NaOH')) return { salt: 'NaNO3', acidColor: '#ffffff' };
  if (acid.includes('CH3COOH') && base.includes('NaOH')) return { salt: 'CH3COONa', acidColor: '#ffffff' };
  return { salt: 'muoi', acidColor: '#ffffff' };
}

async function mix(
  currentContents: string[],
  newChemical: string,
  temperature: number,
  currentColor: string,
): Promise<MixResult> {
  const newContents = [...currentContents, newChemical];

  const hasAcid = newContents.some((c) => isAcid(c));
  const hasBase = newContents.some((c) => isBase(c));
  const hasIndicator = newContents.some((c) => isIndicator(c));

  let updatedColor = currentColor;
  let effect: MixResult['effect'] = null;

  // Handle water dilution
  if (newChemical === 'H2O') {
    return {
      updatedContents: newContents,
      updatedColor: currentColor,
      effect: null,
    };
  }

  // Neutralization reaction: acid + base
  if (hasAcid && hasBase) {
    const acid = newContents.find((c) => isAcid(c)) || '';
    const base = newContents.find((c) => isBase(c)) || '';
    const { salt } = getNeutralizationResult(acid, base);

    const filteredContents = newContents.filter((c) => !(isAcid(c) || isBase(c)));
    filteredContents.push(salt);

    updatedColor = '#ffffff';
    effect = {
      type: 'neutralization',
      intensity: 0.8,
      color: '#fbbf24',
    };

    return { updatedContents: filteredContents, updatedColor, effect };
  }

  // Indicator color change
  if (hasIndicator) {
    const ph = detectPH(newContents);
    if (ph < 7) {
      updatedColor = '#ff4444';
      effect = { type: 'colorShift', intensity: 0.6, color: '#ff4444' };
    } else if (ph > 7) {
      updatedColor = '#4444ff';
      effect = { type: 'colorShift', intensity: 0.6, color: '#4444ff' };
    } else {
      updatedColor = '#9b59b6';
    }
    return { updatedContents: newContents, updatedColor, effect };
  }

  // Acid or base added — adjust color toward red/blue
  if (hasAcid) {
    updatedColor = mixColors(currentColor, '#ff6666', 0.4);
    return { updatedContents: newContents, updatedColor, effect };
  }

  if (hasBase) {
    updatedColor = mixColors(currentColor, '#6666ff', 0.4);
    return { updatedContents: newContents, updatedColor, effect };
  }

  // Default: just add the chemical
  updatedColor = mixColors(currentColor, '#00a8ff', 0.3);
  return { updatedContents: newContents, updatedColor, effect };
}

export const ChemicalEngine = {
  mix,
  isAcid,
  isBase,
  isIndicator,
  detectPH,
};
