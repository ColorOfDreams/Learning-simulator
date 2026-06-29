import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-12',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'nabr', label: 'NaBr', color: 0xe2ecf2, op: 0.45, cap: 0x6a5a9a },
      { type: 'bottle', id: 'cl2w2', label: 'Nước\nchlora', color: 0xf5f9ff, op: 0.3, cap: 0x6a8a3a, fs: 32 }
    ],
    steps: [
      { text: 'Rót dung dịch NaBr vào ống nghiệm.', type: 'pour', src: 'nabr', dst: 'tube', pour: { level: 0.45, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Rót nước chlorine vào — Cl₂ đẩy Br₂ ra, dung dịch chuyển cam!', type: 'pour', src: 'cl2w2', dst: 'tube', pour: { level: 0.55 }, fx: 'halogen_orange' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
