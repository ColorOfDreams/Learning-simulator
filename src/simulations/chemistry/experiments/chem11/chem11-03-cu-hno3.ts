import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-03',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'hno3', label: 'HNO₃ đặc', color: 0xeef0d8, op: 0.55, cap: 0xc24a3a },
      { type: 'dish_chips', id: 'cu', label: 'Mảnh đồng (Cu)', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Thả mảnh đồng vào ống nghiệm.', type: 'drop', src: 'cu', dst: 'tube', dropOffset: { y: 0.42, z: 0.18, scale: 0.9 } },
      { text: 'Rót HNO₃ đặc vào ống. Làm trong tủ hút, lùi lại quan sát!', type: 'pour', src: 'hno3', dst: 'tube', pour: { level: 0.5, color: 0xeef0d8, opacity: 0.5 }, fx: 'cu_hno3_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
