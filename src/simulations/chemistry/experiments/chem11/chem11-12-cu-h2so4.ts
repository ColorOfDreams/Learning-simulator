import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-12',
    setup: [
      { type: 'tube', id: 'tube1', label: 'ONG 1: H2SO4 loang' },
      { type: 'tube', id: 'tube2', label: 'ONG 2: H2SO4 dac', x: 1.5 },
      { type: 'bottle', id: 'h2so4_dil', label: 'H2SO4\nloang', color: 0xf8fafc, op: 0.3, cap: 0x8a6a3a },
      { type: 'bottle', id: 'h2so4_conc', label: 'H2SO4\ndac', color: 0xf0e8c0, op: 0.35, cap: 0xaa2222, x: 1.5 },
      { type: 'dish_chips', id: 'cu', label: 'Manh dong (Cu)', x: -4.8, z: 1.7, color: 0xC88033 },
      { type: 'lampstand', x: 1.8, z: 1.5, y: 0 },
      { type: 'rack', x: -2.2, z: 0.5, n: 2 }
    ],
    steps: [
      { text: 'Rot H2SO4 loang vao ong 1 — dong KHONG phan ung o nhiet do thuong.', type: 'pour', src: 'h2so4_dil', dst: 'tube1', pour: { level: 0.35, color: 0xf8fafc, opacity: 0.3 } },
      { text: 'Rot H2SO4 dac vao ong 2.', type: 'pour', src: 'h2so4_conc', dst: 'tube2', pour: { level: 0.35, color: 0xf0e8c0, opacity: 0.35 } },
      { text: 'Tha manh Cu vao ong 1 — khong hien tuong (Cu khong tac dung H2SO4 loang).', type: 'drop', src: 'cu', dst: 'tube1', dropOffset: { y: 0.15, z: 0 } },
      { text: 'Tha manh Cu vao ong 2, dun nong nhe. Cu tan, bot khi SO2 mui hac, dung dich chuyen xanh!', type: 'drop', src: 'cu', dst: 'tube2', dropOffset: { y: 0.15, z: 0 }, fx: 'cu_hno3_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
