import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-15',
    setup: [
      { type: 'tube', id: 'tube', label: 'Ong nghiem' },
      { type: 'bottle', id: 'k2cr2o7', label: 'K2Cr2O7\n0.1M', color: 0xe8912a, op: 0.4, cap: 0xcc6622 },
      { type: 'bottle', id: 'hcl', label: 'HCl dam dac', color: 0xf8fafc, op: 0.3, cap: 0xaa2222 },
      { type: 'rack', x: -2.2, z: 0.5, n: 1 }
    ],
    steps: [
      { text: 'Rot dung dich K2Cr2O7 (mau cam) vao ong nghiem.', type: 'pour', src: 'k2cr2o7', dst: 'tube', pour: { level: 0.3, color: 0xe8912a, opacity: 0.4 } },
      { text: 'Them HCl dam dac — dd chuyen tu cam sang xanh luc, sinh khi Cl2 vang luc!', type: 'pour', src: 'hcl', dst: 'tube', pour: { level: 0.5, color: 0x3c9e3c, opacity: 0.45 }, fx: 'tube_bubbles' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
