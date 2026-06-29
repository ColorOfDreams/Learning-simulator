import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-05',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Tinh bột' },
      { type: 'bottle', id: 'starch', label: 'Hồ\ntinh bột', color: 0xFAFAFA, op: 0.9, fs: 32 },
      { type: 'bottle', id: 'iodine', label: 'Iodine', color: 0x8B4513, op: 0.85, cap: 0x6a3a1a },
      { type: 'lampstand', x: 4.5, z: -0.4 }
    ],
    steps: [
      { text: 'Rót hồ tinh bột vào ống nghiệm.', type: 'pour', src: 'starch', dst: 'tube', pour: { level: 0.45, color: 0xFAFAFA, opacity: 0.9 } },
      { text: 'Nhỏ iodine: dung dịch chuyển xanh tím.', type: 'pour', src: 'iodine', dst: 'tube', pour: { level: 0.5, color: 0x8B4513, opacity: 0.85 } },
      { text: 'Kéo ống nghiệm sang giá đỡ phía trên đèn cồn.', type: 'move', src: 'tube', dst: 'stand', moveOffset: { y: 0, rotZ: 0 } },
      { text: 'Đun nóng: màu xanh tím nhạt dần.', type: 'click', id: 'lamp', fx: 'starch_fade' },
      { text: 'Để nguội: màu xanh tím xuất hiện lại.', type: 'wait', id: 'tube', fx: 'starch_cool' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
