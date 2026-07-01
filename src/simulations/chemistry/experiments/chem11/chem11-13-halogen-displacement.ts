import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-13',
    setup: [
      { type: 'tube', id: 'tube1', label: 'Cl2 + NaBr' },
      { type: 'tube', id: 'tube2', label: 'Cl2 + KI', x: 1.5 },
      { type: 'tube', id: 'tube3', label: 'Br2 + NaI', x: 3.0 },
      { type: 'bottle', id: 'nabr', label: 'NaBr', color: 0xf8fafc, op: 0.3, cap: 0x6688cc },
      { type: 'bottle', id: 'ki', label: 'KI', color: 0xf8fafc, op: 0.3, cap: 0x8866cc },
      { type: 'bottle', id: 'nai', label: 'NaI', color: 0xf8fafc, op: 0.3, cap: 0xcc66aa },
      { type: 'bottle', id: 'cl2', label: 'Nuoc Cl2', color: 0xb0ffb0, op: 0.25, cap: 0x44aa44 },
      { type: 'bottle', id: 'br2', label: 'Nuoc Br2', color: 0xc06030, op: 0.3, cap: 0x884422 },
      { type: 'rack', x: -2.2, z: 0.5, n: 3 }
    ],
    steps: [
      { text: 'Rot NaBr vao ong 1, KI vao ong 2, NaI vao ong 3.', type: 'pour', src: 'nabr', dst: 'tube1', pour: { level: 0.3, color: 0xf8fafc, opacity: 0.3 } },
      { text: '', type: 'pour', src: 'ki', dst: 'tube2', pour: { level: 0.3, color: 0xf8fafc, opacity: 0.3 } },
      { text: '', type: 'pour', src: 'nai', dst: 'tube3', pour: { level: 0.3, color: 0xf8fafc, opacity: 0.3 } },
      { text: 'Nho nuoc Cl2 vao ong 1 — dd chuyen vang nau (Br2). Cl2 day duoc Br2.', type: 'pour', src: 'cl2', dst: 'tube1', pour: { level: 0.5, color: 0xc06030, opacity: 0.35 }, fx: 'halogen_orange' },
      { text: 'Nho nuoc Cl2 vao ong 2 — dd chuyen tim nau (I2). Cl2 day duoc I2.', type: 'pour', src: 'cl2', dst: 'tube2', pour: { level: 0.5, color: 0x6a106a, opacity: 0.4 } },
      { text: 'Nho nuoc Br2 vao ong 3 — dd chuyen tim (I2). Br2 day duoc I2.', type: 'pour', src: 'br2', dst: 'tube3', pour: { level: 0.5, color: 0x6a106a, opacity: 0.4 } }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
