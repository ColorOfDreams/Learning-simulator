import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-14',
    setup: [
      { type: 'tube', id: 'tube', label: 'Ong nghiem' },
      { type: 'bottle', id: 'naoh', label: 'NaOH 2M', color: 0xf8fafc, op: 0.3, cap: 0x4488cc },
      { type: 'dish_chips', id: 'al', label: 'Bot nhom (Al)', x: -4.8, z: 1.7, color: 0xBFA6A6 },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 },
      { type: 'rack', x: -2.2, z: 0.5, n: 1 }
    ],
    steps: [
      { text: 'Rot dung dich NaOH 2M vao ong nghiem.', type: 'pour', src: 'naoh', dst: 'tube', pour: { level: 0.35, color: 0xf8fafc, opacity: 0.3 } },
      { text: 'Cho bot nhom vao ong — Al tan, sui bot khi H2. Al luong tinh, tan trong kiem!', type: 'drop', src: 'al', dst: 'tube', dropOffset: { y: 0.14, z: 0 }, fx: 'al_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
