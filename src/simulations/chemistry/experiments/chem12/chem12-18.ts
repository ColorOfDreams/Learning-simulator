import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-18',
    setup: [
      { type: 'crucible', id: 'crucible', x: 0, z: 0.3, r: 0.9, h: 1.5 },
      { type: 'dish_chips', id: 'al', label: 'Bot nhom (Al)', x: -4.8, z: 1.5, color: 0xBFA6A6 },
      { type: 'bottle', id: 'fe2o3', label: 'Bot Fe2O3', color: 0x8b4513, op: 0.9, cap: 0x663311, powder: true },
      { type: 'dish_chips', id: 'mgribbon', label: 'Day Mg\n(moi nhiet)', x: -5.2, z: 2.0, color: 0x8AFF00 },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 }
    ],
    steps: [
      { text: 'Tron bot Al va Fe2O3 theo ti le 1:1 vao chau chiu nhiet.', type: 'pour', src: 'al', dst: 'crucible', pour: { level: 0.2, color: 0xBFA6A6, opacity: 0.9 } },
      { text: 'Them bot Fe2O3 vao hon hop.', type: 'pour', src: 'fe2o3', dst: 'crucible', pour: { level: 0.35, color: 0x8b4513, opacity: 0.85 } },
      { text: 'Cam day Mg vao hon hop lam moi nhiet. Dot day Mg — PHAN UNG NHIET NHOM BUNG NO! Sat nong chay chay ra!', type: 'drop', src: 'mgribbon', dst: 'crucible', dropOffset: { y: -0.05, z: 0 }, fx: 'thermite_ignite' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
