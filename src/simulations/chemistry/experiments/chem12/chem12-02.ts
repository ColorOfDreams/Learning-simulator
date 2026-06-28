import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-02',
    setup: [
      { type: 'beaker', id: 'beaker', x: 0, z: 0.3, r: 1.05, h: 2.1 },
      { type: 'bottle', id: 'oil', label: 'Dầu ăn', color: 0xe9c63f, op: 0.85, cap: 0xd6a92a },
      { type: 'bottle', id: 'naoh', label: 'NaOH 40%', color: 0xf5f9ff, op: 0.3 },
      { type: 'bottle', id: 'nacl', label: 'NaCl\nbão hòa', color: 0xe6eef4, op: 0.55, fs: 34, cap: 0x4a8a5a },
      { type: 'lampstand', x: 4.5, z: -0.4 }
    ],
    steps: [
      { text: 'Rót dầu ăn (chất béo) vào cốc thủy tinh.', type: 'pour', src: 'oil', dst: 'beaker', pour: { level: 0.25, color: 0xe9c63f, opacity: 0.85 } },
      { text: 'Thêm dung dịch NaOH 40% vào cốc.', type: 'pour', src: 'naoh', dst: 'beaker', pour: { level: 0.45, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Nhấp vào đèn cồn để đun nóng hỗn hợp.', type: 'click', id: 'lamp', fx: 'boil_beaker' },
      { text: 'Kéo cốc để khuấy/quan sát hỗn hợp đang xà phòng hóa.', type: 'shake', id: 'beaker', fx: 'boil_beaker' },
      { text: 'Rót thêm dung dịch NaCl bão hòa nóng rồi để nguội.', type: 'pour', src: 'nacl', dst: 'beaker', pour: { level: 0.62, color: 0xd8cfa0, opacity: 0.75 } },
      { text: 'Quan sát: xà phòng rắn màu trắng nổi lên trên.', type: 'wait', id: 'beaker', fx: 'soap_layer' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
