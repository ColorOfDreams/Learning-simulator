import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-02',
    setup: [
      { type: 'lampstand', x: 0, z: -0.2 },
      { type: 'bottle', id: 'nacl_s',  label: 'NaCl(aq)',  color: 0xf0f4f8, op: 0.60 },
      { type: 'bottle', id: 'kcl_s',   label: 'KCl(aq)',   color: 0xf0f0f4, op: 0.60, cap: 0x6a4ab8 },
      { type: 'bottle', id: 'cuso4_s', label: 'CuSO₄(aq)', color: 0x2e86de, op: 0.75, cap: 0x2a5a9a },
      { type: 'bottle', id: 'cacl2_s', label: 'CaCl₂(aq)', color: 0xeef2ec, op: 0.55, cap: 0x8a5a3a },
      { type: 'wire_loop', id: 'wire', label: 'Que Pt', x: 3.5, z: 0.5 }
    ],
    steps: [
      { text: 'Nhấp vào đèn cồn để châm lửa.', type: 'click', id: 'lamp' },
      { text: 'Kéo que Pt vào bình NaCl để nhúng vào dung dịch — que sẽ tự hơ lên ngọn lửa.', type: 'move', src: 'wire', dst: 'nacl_s',  moveOffset: { dx: 0, y: -2.5 }, fx: 'flame_test_yellow' },
      { text: 'Kéo que Pt vào bình KCl để nhúng vào dung dịch.', type: 'move', src: 'wire', dst: 'kcl_s',   moveOffset: { dx: 0, y: -2.5 }, fx: 'flame_test_purple' },
      { text: 'Kéo que Pt vào bình CuSO₄ để nhúng vào dung dịch.', type: 'move', src: 'wire', dst: 'cuso4_s', moveOffset: { dx: 0, y: -2.5 }, fx: 'flame_test_cyan' },
      { text: 'Kéo que Pt vào bình CaCl₂ để nhúng vào dung dịch.', type: 'move', src: 'wire', dst: 'cacl2_s', moveOffset: { dx: 0, y: -2.5 }, fx: 'flame_test_red' },
    ]
  } satisfies ChemExperimentDef;

export default experiment;
