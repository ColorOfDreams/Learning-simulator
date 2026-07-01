import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-14',
    setup: [
      { type: 'tube', id: 'tube', label: 'Ong nghiem' },
      { type: 'bottle', id: 'co2', label: 'CO2\n(khi)', color: 0xb0d0b0, op: 0.25, cap: 0x889988 },
      { type: 'bottle', id: 'lime', label: 'Nuoc voi\nCa(OH)2', color: 0xf8f8ff, op: 0.3 },
      { type: 'rack', x: -2.2, z: 0.5, n: 1 }
    ],
    steps: [
      { text: 'Rot nuoc voi trong Ca(OH)2 vao ong nghiem.', type: 'pour', src: 'lime', dst: 'tube', pour: { level: 0.4, color: 0xf8f8ff, opacity: 0.25 } },
      { text: 'Suc khi CO2 vao ong nghiem - nuoc voi trong van duc do ket tua CaCO3!', type: 'pour', src: 'co2', dst: 'tube', pour: { level: 0.5, color: 0xb0d0b0, opacity: 0.2 }, fx: 'precip_white' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
