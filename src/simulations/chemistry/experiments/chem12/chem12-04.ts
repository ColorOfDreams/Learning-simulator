import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-04',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'agno3', label: 'AgNO₃ 1%', color: 0xdde9f2, op: 0.5, cap: 0x8a8a92 },
      { type: 'bottle', id: 'nh3', label: 'NH₃ 5%', color: 0xe6f0ea, op: 0.45 },
      { type: 'bottle', id: 'glucose', label: 'Glucose 5%', color: 0xeaf2f0, op: 0.5, cap: 0x4a8a5a },
      { type: 'bath', x: 4.6, z: 0.3 }
    ],
    steps: [
      { text: 'Rót dung dịch AgNO₃ vào ống nghiệm.', type: 'pour', src: 'agno3', dst: 'tube', pour: { level: 0.25, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Nhỏ NH₃ đến khi kết tủa tan, tạo thuốc thử Tollens.', type: 'pour', src: 'nh3', dst: 'tube', pour: { level: 0.38, color: 0xe2ecf2, opacity: 0.45 }, fx: 'precip_nh3_tan' },
      { text: 'Thêm dung dịch glucose.', type: 'pour', src: 'glucose', dst: 'tube', pour: { level: 0.55, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Đun cách thủy ống nghiệm.', type: 'move', src: 'tube', dst: 'bath', moveOffset: { y: 0.25 } },
      { text: 'Quan sát lớp bạc sáng bám trên thành ống nghiệm.', type: 'wait', id: 'tube', fx: 'silver_mirror' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
