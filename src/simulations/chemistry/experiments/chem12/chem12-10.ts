import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-10',
    setup: [
      { type: 'tray_sand', x: 1.5, z: 1.1 },
      { type: 'crucible', id: 'crucible', x: 0, z: 0.3 },
      { type: 'bottle', id: 'fe2o3', label: 'Bột Fe₂O₃', color: 0x8a3b22, op: 1, powder: true, fs: 30, cap: 0x6a2a18 },
      { type: 'bottle', id: 'alpowder', label: 'Bột Al', color: 0xb8bcc4, op: 1, powder: true, fs: 34, cap: 0x7a8088 },
      { type: 'dish_mg', id: 'mg', label: 'Dải Mg mồi', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Đổ bột Fe₂O₃ màu nâu đỏ vào chén sứ.', type: 'pour', src: 'fe2o3', dst: 'crucible', pour: { level: 0.45, color: 0x8a3b22, opacity: 1 } },
      { text: 'Đổ tiếp bột Al và trộn đều hỗn hợp tecmit.', type: 'pour', src: 'alpowder', dst: 'crucible', pour: { level: 0.8, color: 0x77564a, opacity: 1 } },
      { text: 'Cắm dải Mg làm mồi vào giữa hỗn hợp.', type: 'drop', src: 'mg', dst: 'crucible', dropOffset: { y: 0.55, rotZ: 0.12, scale: 0.9 } },
      { text: 'Nhấp vào chén sứ để châm lửa dải Mg.', type: 'click', id: 'crucible', fx: 'thermite_ignite' },
      { text: 'Quan sát sắt nóng chảy sáng rực chảy xuống khay cát.', type: 'wait', id: 'crucible' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
