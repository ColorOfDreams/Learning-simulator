import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-07',
    setup: [
      { type: 'rack', x: -2.0, z: 0.5, n: 2 },
      { type: 'tube', id: 'tube1', label: 'Ống 1: đặc' },
      { type: 'tube', id: 'tube2', label: 'Ống 2: loãng' },
      { type: 'bottle', id: 'conc', label: 'Na₂S₂O₃\nđặc', color: 0xe6eef4, op: 0.6, fs: 32 },
      { type: 'bottle', id: 'dil', label: 'Na₂S₂O₃\nloãng', color: 0xeef3f6, op: 0.5, fs: 32 },
      { type: 'bottle', id: 'h2so4r', label: 'H₂SO₄', color: 0xf0ead0, op: 0.6, cap: 0xc24a3a }
    ],
    steps: [
      { text: 'Rót Na₂S₂O₃ đặc vào ống 1.', type: 'pour', src: 'conc', dst: 'tube1', pour: { level: 0.45, color: 0xe6eef4, opacity: 0.6 } },
      { text: 'Rót Na₂S₂O₃ loãng vào ống 2.', type: 'pour', src: 'dil', dst: 'tube2', pour: { level: 0.45, color: 0xeef3f6, opacity: 0.5 } },
      { text: 'Rót H₂SO₄ vào ống 1.', type: 'pour', src: 'h2so4r', dst: 'tube1', pour: { level: 0.55, color: 0xeeeacc, opacity: 0.6 } },
      { text: 'Rót H₂SO₄ vào ống 2 — ống đặc vẩn đục trước!', type: 'pour', src: 'h2so4r', dst: 'tube2', pour: { level: 0.55, color: 0xeeeacc, opacity: 0.6 }, fx: 'rate_conc_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
