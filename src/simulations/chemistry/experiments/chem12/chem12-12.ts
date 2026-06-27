import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-12',
    setup: [
      { type: 'electrolysis_cell', id: 'cell', x: 0, z: 0.3 },
      { type: 'power_supply', id: 'power', x: 4.4, z: -0.3 },
      { type: 'bottle', id: 'cuso4', label: 'CuSO₄', color: 0x2e86de, op: 0.85, cap: 0x2a5a9a }
    ],
    steps: [
      { text: 'Rót dung dịch CuSO₄ vào bình điện phân.', type: 'pour', src: 'cuso4', dst: 'cell', pour: { level: 0.55, color: 0x2e86de, opacity: 0.85 } },
      { text: 'Nhấp nguồn điện DC để bắt đầu điện phân.', type: 'click', id: 'power', fx: 'electrolysis_start' },
      { text: 'Quan sát đồng bám ở cathode và bọt khí ở electrode.', type: 'wait', id: 'cell', fx: 'basin_sparkle' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
