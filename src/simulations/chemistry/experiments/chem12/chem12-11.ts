import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-11',
    setup: [
      { type: 'rack', x: -2.0, z: 0.5, n: 2 },
      { type: 'tube', id: 'tube', label: 'FeSO₄' },
      { type: 'tube', id: 'tube2', label: 'FeCl₃' },
      { type: 'bottle', id: 'feso4', label: 'FeSO₄', color: 0xcfe5d3, op: 0.65 },
      { type: 'bottle', id: 'fecl3', label: 'FeCl₃', color: 0xd9b56a, op: 0.75, cap: 0x9a5a18 },
      { type: 'bottle', id: 'naoh', label: 'NaOH', color: 0xf5f9ff, op: 0.3 }
    ],
    steps: [
      { text: 'Rót dung dịch FeSO₄ vào ống 1.', type: 'pour', src: 'feso4', dst: 'tube', pour: { level: 0.45, color: 0xcfe5d3, opacity: 0.65 } },
      { text: 'Rót dung dịch FeCl₃ vào ống 2.', type: 'pour', src: 'fecl3', dst: 'tube2', pour: { level: 0.45, color: 0xd9b56a, opacity: 0.75 } },
      { text: 'Nhỏ NaOH vào ống 1: tạo Fe(OH)₂ xanh trắng.', type: 'pour', src: 'naoh', dst: 'tube', pour: { level: 0.55 }, fx: 'feoh2_ppt' },
      { text: 'Nhỏ NaOH vào ống 2: tạo Fe(OH)₃ nâu đỏ.', type: 'pour', src: 'naoh', dst: 'tube2', pour: { level: 0.55 }, fx: 'feoh3_ppt' },
      { text: 'Để ngoài không khí: Fe(OH)₂ chuyển dần thành nâu đỏ.', type: 'wait', id: 'tube', fx: 'feoh2_oxidize' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
