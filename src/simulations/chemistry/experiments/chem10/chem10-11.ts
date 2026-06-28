import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-11',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'dye', label: 'Dung dịch\nmàu', color: 0x9a3bd0, op: 0.85, cap: 0x6a1a9a, fs: 32 },
      { type: 'bottle', id: 'cl2w', label: 'Nước\nchlora', color: 0xf5f9ff, op: 0.3, cap: 0x6a8a3a, fs: 32 }
    ],
    steps: [
      { text: 'Rót dung dịch màu vào ống nghiệm.', type: 'pour', src: 'dye', dst: 'tube', pour: { level: 0.45, color: 0x9a3bd0, opacity: 0.85 } },
      { text: 'Rót nước chlorine vào — dung dịch mất màu do HClO oxy hóa!', type: 'pour', src: 'cl2w', dst: 'tube', pour: { level: 0.55 }, fx: 'chlorine_decolor' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
