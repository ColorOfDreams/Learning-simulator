import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-07',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'AgNO₃/NH₃' },
      { type: 'bottle', id: 'tollens', label: 'AgNO₃\n/NH₃', color: 0xdde9f2, op: 0.45, fs: 32, cap: 0x8a8a92 },
      { type: 'bottle', id: 'c2h2', label: 'Khí C₂H₂', color: 0xdde9f2, op: 0.35, cap: 0x6a8a3a }
    ],
    steps: [
      { text: 'Rót dung dịch AgNO₃ trong NH₃ vào ống nghiệm.', type: 'pour', src: 'tollens', dst: 'tube', pour: { level: 0.45, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Sục khí acetylene vào ống — kết tủa vàng nhạt xuất hiện!', type: 'pour', src: 'c2h2', dst: 'tube', pour: { level: 0.5 }, fx: 'acetylene_ppt' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
