import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-14',
    setup: [
      { type: 'tube', id: 'tube1', label: 'Al2O3 + HCl' },
      { type: 'tube', id: 'tube2', label: 'Al2O3 + NaOH', x: 1.5 },
      { type: 'bottle', id: 'hcl', label: 'HCl 2M', color: 0xf8fafc, op: 0.3, cap: 0x8a6a3a },
      { type: 'bottle', id: 'naoh', label: 'NaOH 2M', color: 0xf8fafc, op: 0.3, cap: 0x4488cc },
      { type: 'dish_chips', id: 'al2o3', label: 'Bot Al2O3', x: -4.8, z: 1.7, color: 0xf0f0f0 },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 },
      { type: 'rack', x: -2.2, z: 0.5, n: 2 }
    ],
    steps: [
      { text: 'Rot HCl vao ong 1, NaOH vao ong 2.', type: 'pour', src: 'hcl', dst: 'tube1', pour: { level: 0.3, color: 0xf8fafc, opacity: 0.3 } },
      { text: '', type: 'pour', src: 'naoh', dst: 'tube2', pour: { level: 0.3, color: 0xf8fafc, opacity: 0.3 } },
      { text: 'Cho Al2O3 vao ong 1 — Al2O3 tan trong axit. Dun nong nhe de phan ung nhanh hon.', type: 'drop', src: 'al2o3', dst: 'tube1', dropOffset: { y: 0.14, z: 0 } },
      { text: 'Cho Al2O3 vao ong 2 — Al2O3 tan trong kiem! Al2O3 LA OXIT LUONG TINH.', type: 'drop', src: 'al2o3', dst: 'tube2', dropOffset: { y: 0.14, z: 0 }, fx: 'boil_tube' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
