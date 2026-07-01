import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-16',
    setup: [
      { type: 'tube', id: 'tube', label: 'Dieu che O2' },
      { type: 'bottle', id: 'kclo3', label: 'KClO3\n+ MnO2', color: 0xf0f0f0, op: 0.8, cap: 0x222222, powder: true },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 },
      { type: 'rack', x: -2.2, z: 0.5, n: 1 }
    ],
    steps: [
      { text: 'Cho hon hop KClO3 va MnO2 (xuc tac) vao ong nghiem.', type: 'pour', src: 'kclo3', dst: 'tube', pour: { level: 0.3, color: 0xf0f0f0, opacity: 0.8 } },
      { text: 'Dun nong manh — KClO3 nhiet phan, sinh O2! Dua que dom con than hong vao mieng ong → que dom BUNG CHAY SANG!', type: 'wait', fx: 'rate_cat_burst' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
