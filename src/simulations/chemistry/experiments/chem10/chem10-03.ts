import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-03',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'hcl', label: 'HCl 1M', color: 0xeef2e6, op: 0.5, cap: 0x8a6a3a },
      { type: 'dish_chips', id: 'zn', label: 'Mảnh kẽm (Zn)', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Rót dung dịch HCl 1M vào ống nghiệm.', type: 'pour', src: 'hcl', dst: 'tube', pour: { level: 0.5, color: 0xeaf0e4, opacity: 0.5 } },
      { text: 'Thả mảnh kẽm vào ống — bọt khí H₂ thoát ra, kẽm tan dần.', type: 'drop', src: 'zn', dst: 'tube', dropOffset: { y: 0.16, z: 0 }, fx: 'zn_dissolve' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
