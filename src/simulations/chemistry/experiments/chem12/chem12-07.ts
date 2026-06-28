import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-07',
    setup: [
      { type: 'basin', id: 'basin', x: 0, z: 0.3 },
      { type: 'bottle', id: 'water', label: 'Nước +\nphenolphthalein', color: 0xf5f9ff, op: 0.3, fs: 28 },
      { type: 'dish_sodium', id: 'na', label: 'Mẩu sodium (Na)', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Rót nước có phenolphthalein vào chậu thủy tinh.', type: 'pour', src: 'water', dst: 'basin', pour: { level: 0.45, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Thả mẩu sodium nhỏ vào chậu nước.', type: 'drop', src: 'na', dst: 'basin', dropOffset: { x: -0.35, y: 0.86, z: 0, attach: false } },
      { text: 'Quan sát Na chạy trên mặt nước, sủi khí H₂.', type: 'wait', id: 'basin', fx: 'na_dance' },
      { text: 'Dung dịch chuyển màu hồng do tạo NaOH.', type: 'wait', id: 'basin', fx: 'basin_sparkle' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
