import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-08',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'h2o2', label: 'H₂O₂ 3%', color: 0xdde9f2, op: 0.45 },
      { type: 'bottle', id: 'mno2', label: 'MnO₂\n(xúc tác)', color: 0x2b2b2f, op: 0.85, cap: 0x1a1a1e, powder: true, fs: 32 }
    ],
    steps: [
      { text: 'Rót dung dịch H₂O₂ 3% vào ống nghiệm — phân hủy chậm, ít bọt.', type: 'pour', src: 'h2o2', dst: 'tube', pour: { level: 0.5, color: 0xe2ecf2, opacity: 0.45 }, fx: 'h2o2_slow' },
      { text: 'Thêm bột MnO₂ — bọt khí O₂ sủi mạnh tức thì! MnO₂ không thay đổi.', type: 'pour', src: 'mno2', dst: 'tube', pour: { level: 0.55, color: 0xc8cfd4, opacity: 0.6 }, fx: 'rate_cat_burst' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
