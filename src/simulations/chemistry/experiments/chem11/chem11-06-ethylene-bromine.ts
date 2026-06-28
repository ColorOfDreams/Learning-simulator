import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-06',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Nước bromine' },
      { type: 'bottle', id: 'brom', label: 'Nước\nbromine', color: 0xCC5500, op: 0.8, fs: 32, cap: 0x9a5a18 },
      { type: 'bottle', id: 'c2h4', label: 'Khí C₂H₄', color: 0xdde9f2, op: 0.35, cap: 0x6a8a3a }
    ],
    steps: [
      { text: 'Rót nước bromine màu vàng cam vào ống nghiệm.', type: 'pour', src: 'brom', dst: 'tube', pour: { level: 0.5, color: 0xCC5500, opacity: 0.8 } },
      { text: 'Sục khí ethylene vào ống — màu vàng cam nhạt dần rồi mất hẳn!', type: 'pour', src: 'c2h4', dst: 'tube', pour: { level: 0.52 }, fx: 'ethylene_bleach' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
