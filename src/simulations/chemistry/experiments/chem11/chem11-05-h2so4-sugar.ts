import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-05',
    setup: [
      { type: 'beaker', id: 'beaker', x: 0, z: 0.3, r: 1.0, h: 2.4 },
      { type: 'bottle', id: 'sugar', label: 'Đường\n(saccharose)', color: 0xf4f4ee, op: 1.0, powder: true, fs: 30, cap: 0xd6c25a },
      { type: 'bottle', id: 'h2so4', label: 'H₂SO₄ đặc', color: 0xf0ead0, op: 0.6, cap: 0xc24a3a }
    ],
    steps: [
      { text: 'Cho đường trắng vào cốc.', type: 'pour', src: 'sugar', dst: 'beaker', pour: { level: 0.3, color: 0xf4f4ee, opacity: 1.0 } },
      { text: 'Rót H₂SO₄ đặc vào cốc, lùi lại quan sát!', type: 'pour', src: 'h2so4', dst: 'beaker', pour: { level: 0.38, color: 0xe8dcae, opacity: 0.8 }, fx: 'sugar_carbon' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
