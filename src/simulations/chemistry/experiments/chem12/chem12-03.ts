import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-03',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'naoh', label: 'NaOH 10%', color: 0xf5f9ff, op: 0.3 },
      { type: 'bottle', id: 'cuso4', label: 'CuSO₄ 5%', color: 0x2e86de, op: 0.85, cap: 0x2a5a9a },
      { type: 'bottle', id: 'glucose', label: 'Glucose 5%', color: 0xf5f9ff, op: 0.3, cap: 0x4a8a5a },
      { type: 'lampstand', x: 4.5, z: -0.4 }
    ],
    steps: [
      { text: 'Rót 1 ml dung dịch NaOH 10% vào ống nghiệm.', type: 'pour', src: 'naoh', dst: 'tube', pour: { level: 0.18, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Nhỏ vài giọt CuSO₄ 5% tạo kết tủa xanh Cu(OH)₂.', type: 'pour', src: 'cuso4', dst: 'tube', pour: { level: 0.26, color: 0x9fc8e8, opacity: 0.7 }, fx: 'precip_blue' },
      { text: 'Thêm 2 ml dung dịch glucose 5%.', type: 'pour', src: 'glucose', dst: 'tube', pour: { level: 0.42 } },
      { text: 'Lắc đều: kết tủa tan tạo phức xanh lam.', type: 'shake', id: 'tube', fx: 'dissolve_blue' },
      { text: 'Kéo ống nghiệm sang giá đỡ phía trên đèn cồn.', type: 'move', src: 'tube', dst: 'stand', moveOffset: { y: 0, rotZ: 0 } },
      { text: 'Đun nóng nhẹ dung dịch.', type: 'click', id: 'lamp', fx: 'boil_tube' },
      { text: 'Quan sát kết tủa đỏ gạch Cu₂O.', type: 'wait', id: 'tube', fx: 'precip_red' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
