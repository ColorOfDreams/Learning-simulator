import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-02',
    setup: [
      { type: 'beaker', id: 'beaker', x: 0, z: 0.3, r: 1.0, h: 2.0 },
      { type: 'bottle', id: 'hcl', label: 'HCl', color: 0xf5f9ff, op: 0.3, cap: 0xc2a23a },
      { type: 'bottle', id: 'pp', label: 'Phenol-\nphthalein', color: 0xf5f9ff, op: 0.3, fs: 30, cap: 0xc05a8a },
      { type: 'bottle', id: 'naoh', label: 'NaOH', color: 0xf5f9ff, op: 0.3 }
    ],
    steps: [
      { text: 'Rót dung dịch HCl cần chuẩn độ vào bình.', type: 'pour', src: 'hcl', dst: 'beaker', pour: { level: 0.45, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Nhỏ vài giọt phenolphthalein (dung dịch vẫn không màu).', type: 'pour', src: 'pp', dst: 'beaker', pour: { level: 0.5 } },
      { text: 'Nhỏ từ từ NaOH đến khi dung dịch chuyển hồng nhạt bền.', type: 'pour', src: 'naoh', dst: 'beaker', pour: { level: 0.62 }, fx: 'titration_end' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
