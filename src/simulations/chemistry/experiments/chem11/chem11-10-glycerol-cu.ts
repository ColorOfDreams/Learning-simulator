import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-10',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'Ống nghiệm' },
      { type: 'bottle', id: 'naoh', label: 'NaOH', color: 0xf5f9ff, op: 0.3 },
      { type: 'bottle', id: 'cuso4', label: 'CuSO₄', color: 0x2e86de, op: 0.85, cap: 0x2a5a9a },
      { type: 'bottle', id: 'gly', label: 'Glycerol', color: 0xf5f9ff, op: 0.3, cap: 0x4a8a5a }
    ],
    steps: [
      { text: 'Rót dung dịch NaOH vào ống nghiệm.', type: 'pour', src: 'naoh', dst: 'tube', pour: { level: 0.2, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Nhỏ CuSO₄ vào — xuất hiện kết tủa xanh Cu(OH)₂.', type: 'pour', src: 'cuso4', dst: 'tube', pour: { level: 0.28, color: 0x9fc8e8, opacity: 0.7 }, fx: 'gly_precip' },
      { text: 'Thêm glycerol vào ống.', type: 'pour', src: 'gly', dst: 'tube', pour: { level: 0.42 } },
      { text: 'Nhấp vào ống nghiệm để lắc đều — kết tủa tan tạo dung dịch xanh lam thẫm!', type: 'shake', id: 'tube', fx: 'gly_dissolve' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
