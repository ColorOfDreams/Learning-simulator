import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-15',
    setup: [
      { type: 'beaker', id: 'beaker', x: 0, z: 0.3, r: 1.05, h: 2.1 },
      { type: 'bottle', id: 'hcl', label: 'HCl 2M', color: 0xf5f9ff, op: 0.3, cap: 0x8a6a3a },
      { type: 'dish_chips', id: 'mg', label: 'Day Mg', x: -4.8, z: 1.7, color: 0x8AFF00 },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 }
    ],
    steps: [
      { text: 'Rot dung dich HCl 2M vao coc thuy tinh.', type: 'pour', src: 'hcl', dst: 'beaker', pour: { level: 0.35, color: 0xf5f9ff, opacity: 0.3 } },
      { text: 'Tha day Magie vao coc axit. Mg tan nhanh, sui bot khi H2 manh liet, toa nhiet!', type: 'drop', src: 'mg', dst: 'beaker', dropOffset: { y: 0.12, z: 0 }, fx: 'zn_bubbles' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
