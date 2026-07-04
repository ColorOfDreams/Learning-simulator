import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-13',
    setup: [
      { type: 'basin', id: 'basin', x: 0, z: 0.3, r: 1.2, h: 1.5 },
      { type: 'bottle', id: 'h2o', label: 'Nước cất\n(H2O)', color: 0x38bdf8, op: 0.4 },
      { type: 'dish_chips', id: 'na', label: 'Natri kim loại (Na)', x: -4.8, z: 1.5, color: 0xAB5CF2 },
      { type: 'bottle', id: 'pp', label: 'Phenol-\nphthalein', color: 0xffcccc, op: 0.35, cap: 0xcc4444 }
    ],
    steps: [
      { text: 'Rot nuoc cat vao chau thuy tinh.', type: 'pour', src: 'h2o', dst: 'basin', pour: { level: 0.4, color: 0x38bdf8, opacity: 0.35 } },
      { text: 'Nho vai giot phenolphthalein vao nuoc.', type: 'pour', src: 'pp', dst: 'basin', pour: { level: 0.42, color: 0xffcccc, opacity: 0.3 } },
      { text: 'Dung panh gap manh Na tha vao chau nuoc. Na chay tren mat nuoc, sui bot khi H2, dung dich chuyen hong!', type: 'drop', src: 'na', dst: 'basin', dropOffset: { y: -0.08, z: 0 }, fx: 'naDance' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
