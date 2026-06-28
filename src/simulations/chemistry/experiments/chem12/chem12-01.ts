import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-01',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'ancol', label: 'C₂H₅OH', color: 0xe8f0f8, op: 0.55 },
      { type: 'bottle', id: 'axit', label: 'CH₃COOH', color: 0xeef2e6, op: 0.55, cap: 0x8a4a4a },
      { type: 'bottle', id: 'h2so4', label: 'H₂SO₄ đặc', color: 0xf0ead0, op: 0.6, cap: 0xc24a3a },
      { type: 'lampstand', x: 4.5, z: -0.4 }
    ],
    steps: [
      { text: 'Rót 1 ml ethanol (C₂H₅OH) vào ống nghiệm.', type: 'pour', src: 'ancol', dst: 'tube', pour: { level: 0.2, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Rót tiếp 1 ml acetic acid (CH₃COOH).', type: 'pour', src: 'axit', dst: 'tube', pour: { level: 0.38, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Nhỏ vài giọt H₂SO₄ đặc làm xúc tác.', type: 'pour', src: 'h2so4', dst: 'tube', pour: { level: 0.44, color: 0xeeeacc, opacity: 0.6 }, fx: 'tube_bubbles' },
      { text: 'Kéo ống nghiệm sang giá đỡ phía trên đèn cồn.', type: 'move', src: 'tube', dst: 'stand', moveOffset: { y: 0, rotZ: 0 } },
      { text: 'Nhấp vào đèn cồn để châm lửa, đun nóng nhẹ hỗn hợp.', type: 'click', id: 'lamp', fx: 'boil_tube' },
      { text: 'Quan sát: lớp chất lỏng mùi thơm nổi lên trên.', type: 'wait', id: 'tube', fx: 'ester_layer' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
