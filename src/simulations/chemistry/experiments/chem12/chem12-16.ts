import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM12-16',
    setup: [
      { type: 'tube', id: 'tube', label: 'Trang guong' },
      { type: 'bottle', id: 'glucose', label: 'Glucozo\n1%', color: 0xf0f8ff, op: 0.2, cap: 0x88aacc },
      { type: 'bottle', id: 'agno3', label: 'AgNO3\n1%', color: 0xf8fafc, op: 0.25, cap: 0x888888 },
      { type: 'bottle', id: 'nh3', label: 'NH3\n2M', color: 0xe6f0ea, op: 0.3, cap: 0x669966 },
      { type: 'lampstand', x: 0, z: 1.5, y: 0 },
      { type: 'rack', x: -2.2, z: 0.5, n: 1 }
    ],
    steps: [
      { text: 'Rot AgNO3 vao ong, them tung giot NH3 cho den khi ket tua vua tan → tao thuoc thu Tollens.', type: 'pour', src: 'agno3', dst: 'tube', pour: { level: 0.2, color: 0xf8fafc, opacity: 0.25 } },
      { text: 'Rot glucozo vao ong Tollens. Dun cach thuy nhe nang — bac ket tinh bam thanh guong sang!', type: 'pour', src: 'glucose', dst: 'tube', pour: { level: 0.4, color: 0xe8f0f8, opacity: 0.25 }, fx: 'silver_mirror' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
