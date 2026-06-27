import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-04',
    setup: [
      { type: 'beaker', id: 'jar1', x: -1.6, z: 0.4, r: 0.85, h: 1.8 },
      { type: 'beaker', id: 'jar2', x: 1.6, z: 0.4, r: 0.85, h: 1.8 },
      { type: 'bottle', id: 'nh3', label: 'NH₃ đặc', color: 0xe6f0ea, op: 0.45 },
      { type: 'bottle', id: 'hcl', label: 'HCl đặc', color: 0xeef0d8, op: 0.5, cap: 0xc24a3a }
    ],
    steps: [
      { text: 'Rót dung dịch NH₃ đặc vào lọ thứ nhất.', type: 'pour', src: 'nh3', dst: 'jar1', pour: { level: 0.35, color: 0xe6f0ea, opacity: 0.5 }, fx: 'nh3_vapor' },
      { text: 'Rót dung dịch HCl đặc vào lọ thứ hai.', type: 'pour', src: 'hcl', dst: 'jar2', pour: { level: 0.35, color: 0xeef0d8, opacity: 0.55 }, fx: 'hcl_vapor' },
      { text: 'Đưa miệng hai lọ lại gần nhau — khói trắng xuất hiện giữa hai lọ!', type: 'wait', id: 'jar1', fx: 'smoke_puff' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
