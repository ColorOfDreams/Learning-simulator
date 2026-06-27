import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-04',
    setup: [
      { type: 'lampstand', x: 4.5, z: -0.4 },
      { type: 'dish_mg', id: 'mg', label: 'Dây magnesium (Mg)', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Nhấp vào đèn cồn để châm lửa.', type: 'click', id: 'lamp' },
      { text: 'Kéo dây Mg vào ngọn lửa — Mg bốc cháy với ánh sáng trắng chói.', type: 'move', src: 'mg', dst: 'stand', moveOffset: { dx: 0, y: -0.5 }, fx: 'mg_burn_flash' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
