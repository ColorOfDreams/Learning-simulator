import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-05',
    setup: [
      { type: 'beaker', id: 'beaker', x: 0, z: 0.3, r: 1.05, h: 2.1 },
      { type: 'bottle', id: 'cao', label: 'Vôi sống\n(CaO)', color: 0xeae6dc, op: 1.0, cap: 0x9a8a6a, powder: true, fs: 34 },
      { type: 'bottle', id: 'water', label: 'Nước (H₂O)', color: 0xdde9f2, op: 0.45 }
    ],
    steps: [
      { text: 'Cho vôi sống (CaO) vào cốc thủy tinh.', type: 'pour', src: 'cao', dst: 'beaker', pour: { level: 0.3, color: 0xeae6dc, opacity: 1.0 } },
      { text: 'Rót nước vào cốc — phản ứng tỏa nhiệt mạnh, hỗn hợp sôi sục!', type: 'pour', src: 'water', dst: 'beaker', pour: { level: 0.55, color: 0xe6ecea, opacity: 0.85 }, fx: 'quicklime_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
