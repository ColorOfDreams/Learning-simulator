import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-10',
    setup: [
      { type: 'rack', x: -3.0, z: 0.5, n: 3 },
      { type: 'tube', id: 'tube1', label: 'Ống 1: NaCl' },
      { type: 'tube', id: 'tube2', label: 'Ống 2: NaBr' },
      { type: 'tube', id: 'tube3', label: 'Ống 3: NaI' },
      { type: 'bottle', id: 'nacls', label: 'NaCl', color: 0xe2ecf2, op: 0.45 },
      { type: 'bottle', id: 'nabrs', label: 'NaBr', color: 0xe2ecf2, op: 0.45, cap: 0x6a5a9a },
      { type: 'bottle', id: 'nais', label: 'NaI', color: 0xe2ecf2, op: 0.45, cap: 0x4a8a5a },
      { type: 'bottle', id: 'agno3', label: 'AgNO₃', color: 0xdde9f2, op: 0.5, cap: 0xb0a040 }
    ],
    steps: [
      { text: 'Rót dung dịch NaCl vào ống 1.', type: 'pour', src: 'nacls', dst: 'tube1', pour: { level: 0.4, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Rót dung dịch NaBr vào ống 2.', type: 'pour', src: 'nabrs', dst: 'tube2', pour: { level: 0.4, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Rót dung dịch NaI vào ống 3.', type: 'pour', src: 'nais', dst: 'tube3', pour: { level: 0.4, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Nhỏ AgNO₃ vào ống 1 — xuất hiện kết tủa trắng AgCl!', type: 'pour', src: 'agno3', dst: 'tube1', pour: { level: 0.48 }, fx: 'halide_white' },
      { text: 'Nhỏ AgNO₃ vào ống 2 — kết tủa vàng nhạt AgBr!', type: 'pour', src: 'agno3', dst: 'tube2', pour: { level: 0.48 }, fx: 'halide_pale_yellow' },
      { text: 'Nhỏ AgNO₃ vào ống 3 — kết tủa vàng đậm AgI!', type: 'pour', src: 'agno3', dst: 'tube3', pour: { level: 0.48 }, fx: 'halide_yellow' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
