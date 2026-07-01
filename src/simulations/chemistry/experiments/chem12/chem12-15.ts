import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-15',
    setup: [
      { type: 'tube', id: 'tube', label: 'Phan ung este hoa' },
      { type: 'bottle', id: 'etoh', label: 'C2H5OH\n(ruou etylic)', color: 0xf8fafc, op: 0.25, cap: 0x66aa44 },
      { type: 'bottle', id: 'ch3cooh', label: 'CH3COOH\n(axit axetic)', color: 0xf8fafc, op: 0.25, cap: 0xcc6644 },
      { type: 'bottle', id: 'h2so4', label: 'H2SO4 dac\n(xuc tac)', color: 0xf0e8c0, op: 0.3, cap: 0xaa2222 },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 },
      { type: 'rack', x: -2.2, z: 0.5, n: 1 }
    ],
    steps: [
      { text: 'Rot C2H5OH vao ong nghiem.', type: 'pour', src: 'etoh', dst: 'tube', pour: { level: 0.25, color: 0xf8fafc, opacity: 0.25 } },
      { text: 'Rot CH3COOH vao ong, them vai giot H2SO4 dac lam xuc tac.', type: 'pour', src: 'ch3cooh', dst: 'tube', pour: { level: 0.5, color: 0xf8fafc, opacity: 0.3 } },
      { text: 'Nho H2SO4 dac — dun nhe. Phan ung este hoa tao CH3COOC2H5 co mui thom!', type: 'pour', src: 'h2so4', dst: 'tube', pour: { level: 0.52, color: 0xfff8e0, opacity: 0.28 }, fx: 'ester_layer' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
