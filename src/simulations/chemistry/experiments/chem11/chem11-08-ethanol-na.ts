import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-08',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ethanol khan' },
      { type: 'bottle', id: 'etoh', label: 'C₂H₅OH\nkhan', color: 0xe8f0f8, op: 0.5, fs: 32 },
      { type: 'dish_sodium', id: 'na', label: 'Mẩu sodium (Na)', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Rót ethanol khan vào ống nghiệm.', type: 'pour', src: 'etoh', dst: 'tube', pour: { level: 0.5, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Thả mẩu sodium nhỏ vào ống nghiệm.', type: 'drop', src: 'na', dst: 'tube', dropOffset: { y: 0.48, z: 0.16 } },
      { text: 'Quan sát: bọt khí H₂ thoát ra đều, mẩu Na tan dần.', type: 'wait', id: 'tube', fx: 'etoh_na_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
