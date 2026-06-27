import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-08',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'CuSO₄' },
      { type: 'bottle', id: 'cuso4', label: 'CuSO₄', color: 0x2e86de, op: 0.85, cap: 0x2a5a9a },
      { type: 'dish_nail', id: 'nail', label: 'Đinh sắt', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Rót dung dịch CuSO₄ màu xanh vào ống nghiệm.', type: 'pour', src: 'cuso4', dst: 'tube', pour: { level: 0.55, color: 0x2e86de, opacity: 0.85 } },
      { text: 'Thả đinh sắt sạch vào dung dịch CuSO₄.', type: 'drop', src: 'nail', dst: 'tube', dropOffset: { x: -0.05, y: 1.05, z: 0.02, rotZ: 0.12, scale: 0.58 } },
      { text: 'Quan sát đồng đỏ bám lên đinh, dung dịch nhạt màu.', type: 'wait', id: 'tube', fx: 'nail_coat' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
