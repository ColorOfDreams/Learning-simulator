import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-17',
    setup: [
      { type: 'tube', id: 'tube', label: 'Glucozo + Cu(OH)2' },
      { type: 'bottle', id: 'glucose', label: 'Glucozo\n1%', color: 0xf0f8ff, op: 0.2, cap: 0x88aacc },
      { type: 'bottle', id: 'cuso4', label: 'CuSO4\n5%', color: 0x2563eb, op: 0.35, cap: 0x3355aa },
      { type: 'bottle', id: 'naoh', label: 'NaOH\n10%', color: 0xf8fafc, op: 0.3, cap: 0x4488cc },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 },
      { type: 'rack', x: -2.2, z: 0.5, n: 1 }
    ],
    steps: [
      { text: 'Rot CuSO4 vao ong, them NaOH → ket tua Cu(OH)2 xanh lam.', type: 'pour', src: 'cuso4', dst: 'tube', pour: { level: 0.15, color: 0x2563eb, opacity: 0.35 } },
      { text: 'Rot glucozo vao ong. Lac deu — Cu(OH)2 tan tao phuc xanh tham.', type: 'pour', src: 'glucose', dst: 'tube', pour: { level: 0.3, color: 0x1a3f8a, opacity: 0.4 }, fx: 'gly_precip' },
      { text: 'Dun nong nhe — xuat hien ket tua DO GACH Cu2O!', type: 'wait', fx: 'precip_red' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
