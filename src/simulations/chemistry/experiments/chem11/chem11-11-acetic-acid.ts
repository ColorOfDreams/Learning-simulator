import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-11',
    setup: [
      { type: 'rack', x: -2.0, z: 0.5, n: 2 },
      { type: 'tube', id: 'tube1', label: 'Ống 1: + quỳ' },
      { type: 'tube', id: 'tube2', label: 'Ống 2: + đá vôi' },
      { type: 'bottle', id: 'acid', label: 'CH₃COOH', color: 0xeef2e6, op: 0.5, cap: 0x8a4a4a },
      { type: 'dish_marble', id: 'marble', label: 'Đá vôi CaCO₃', x: -4.8, z: 1.7 }
    ],
    steps: [
      { text: 'Rót acetic acid vào ống 1 (đã nhỏ sẵn quỳ tím) — quỳ hóa đỏ.', type: 'pour', src: 'acid', dst: 'tube1', pour: { level: 0.45, color: 0xf5f9ff, opacity: 0.3 }, fx: 'acid_litmus' },
      { text: 'Thả viên đá vôi vào ống 2.', type: 'drop', src: 'marble', dst: 'tube2', dropOffset: { y: 0.42, z: 0.18, scale: 0.9 } },
      { text: 'Rót acetic acid vào ống 2 — sủi bọt khí CO₂!', type: 'pour', src: 'acid', dst: 'tube2', pour: { level: 0.5, color: 0xf5f9ff, opacity: 0.3 }, fx: 'acid_caco3' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
