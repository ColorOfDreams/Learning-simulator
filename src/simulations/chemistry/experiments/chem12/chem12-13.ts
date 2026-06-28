import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-13',
    setup: [
      { type: 'beaker', id: 'cell', x: 0, z: 0.3, r: 1.25, h: 2.2 },
      { type: 'zinc_copper_strips', id: 'strips' },
      { type: 'switch', id: 'switch', x: 4.2, z: 1.9 },
      { type: 'bottle', id: 'electrolyte', label: 'Dung dịch\nđiện li', color: 0xf5f9ff, op: 0.3, fs: 30 }
    ],
    steps: [
      { text: 'Rót dung dịch điện li vào cốc chứa hai thanh Zn và Cu.', type: 'pour', src: 'electrolyte', dst: 'cell', pour: { level: 0.5, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Quan sát: khí H₂ ban đầu thoát ra ở thanh Zn.', type: 'wait', id: 'cell', fx: 'zn_bubbles' },
      { text: 'Nhấp công tắc để nối mạch Zn-Cu.', type: 'click', id: 'switch', fx: 'galvanic_cell' },
      { text: 'Quan sát dòng electron và dấu hiệu ăn mòn điện hóa.', type: 'wait', id: 'cell', fx: 'galvanic_cell' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
