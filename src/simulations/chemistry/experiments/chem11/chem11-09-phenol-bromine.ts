import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-09',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Dung dịch phenol' },
      { type: 'bottle', id: 'phenol', label: 'Phenol', color: 0xdde9f2, op: 0.45 },
      { type: 'bottle', id: 'brom', label: 'Nước\nbromine', color: 0xe88a2a, op: 0.8, fs: 32, cap: 0x9a5a18 }
    ],
    steps: [
      { text: 'Rót dung dịch phenol vào ống nghiệm.', type: 'pour', src: 'phenol', dst: 'tube', pour: { level: 0.45, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Nhỏ nước bromine vào — kết tủa trắng xuất hiện ngay, nước brom mất màu!', type: 'pour', src: 'brom', dst: 'tube', pour: { level: 0.52 }, fx: 'phenol_ppt' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
