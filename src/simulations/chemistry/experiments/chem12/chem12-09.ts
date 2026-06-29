import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-09',
    setup: [
      { type: 'rack', x: -2.2, z: 0.5, n: 1 },
      { type: 'tube', id: 'tube', label: 'NaOH' },
      { type: 'bottle', id: 'naoh', label: 'NaOH', color: 0xf5f9ff, op: 0.3 },
      { type: 'dish_chips', id: 'al', label: 'Nhôm (Al)', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Rót dung dịch NaOH vào ống nghiệm.', type: 'pour', src: 'naoh', dst: 'tube', pour: { level: 0.5, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Thả vài mảnh nhôm vào ống nghiệm.', type: 'drop', src: 'al', dst: 'tube', dropOffset: { y: 0.42, z: 0.18, scale: 0.9 } },
      { text: 'Quan sát nhôm tan dần, sủi bọt khí H₂.', type: 'wait', id: 'tube', fx: 'al_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
