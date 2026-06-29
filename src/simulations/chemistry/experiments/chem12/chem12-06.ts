import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-06',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Protein' },
      { type: 'bottle', id: 'protein', label: 'Protein', color: 0xF5F5F0, op: 0.85 },
      { type: 'bottle', id: 'naoh', label: 'NaOH', color: 0xf5f9ff, op: 0.3 },
      { type: 'bottle', id: 'cuso4', label: 'CuSO₄', color: 0x2e86de, op: 0.85, cap: 0x2a5a9a }
    ],
    steps: [
      { text: 'Rót dung dịch protein vào ống nghiệm.', type: 'pour', src: 'protein', dst: 'tube', pour: { level: 0.4, color: 0xF5F5F0, opacity: 0.85 } },
      { text: 'Thêm dung dịch NaOH.', type: 'pour', src: 'naoh', dst: 'tube', pour: { level: 0.5, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Nhỏ vài giọt CuSO₄.', type: 'pour', src: 'cuso4', dst: 'tube', pour: { level: 0.55 } },
      { text: 'Lắc đều: xuất hiện màu tím biuret.', type: 'shake', id: 'tube', fx: 'biuret_violet' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
