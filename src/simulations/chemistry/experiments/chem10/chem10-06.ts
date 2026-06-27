import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-06',
    setup: [
      { type: 'beaker', id: 'beaker', x: 0, z: 0.3, r: 1.05, h: 2.1 },
      { type: 'bottle', id: 'baoh2', label: 'Ba(OH)₂\n·8H₂O', color: 0xf2f4f6, op: 1.0, cap: 0x6a7a8a, powder: true, fs: 32 },
      { type: 'bottle', id: 'nh4cl', label: 'NH₄Cl', color: 0xeaeef2, op: 0.95, cap: 0x7a8a7a, powder: true }
    ],
    steps: [
      { text: 'Cho tinh thể Ba(OH)₂·8H₂O vào cốc thủy tinh.', type: 'pour', src: 'baoh2', dst: 'beaker', pour: { level: 0.3, color: 0xf2f4f6, opacity: 1.0 } },
      { text: 'Thêm tinh thể NH₄Cl — phản ứng thu nhiệt, cốc lạnh đi, mùi NH₃ hắc!', type: 'pour', src: 'nh4cl', dst: 'beaker', pour: { level: 0.5, color: 0xeaeef2, opacity: 0.95 }, fx: 'endotherm_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
