import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-09',
    setup: [
      { type: 'rack', x: -2.0, z: 0.5, n: 2 },
      { type: 'tube', id: 'tube1', label: 'Ống 1: đá vôi' },
      { type: 'tube', id: 'tube2', label: 'Ống 2: bột' },
      { type: 'dish_marble', id: 'stone', label: 'Đá vôi cục\nCaCO₃', x: -4.8, z: 1.7 },
      { type: 'bottle', id: 'caco3p', label: 'Bột CaCO₃', color: 0xeceae2, op: 1.0, cap: 0x9a8a6a, powder: true },
      { type: 'bottle', id: 'hcl2', label: 'HCl 1M', color: 0xeef2e6, op: 0.5, cap: 0x8a6a3a }
    ],
    steps: [
      { text: 'Thả đá vôi cục vào ống 1.', type: 'drop', src: 'stone', dst: 'tube1', dropOffset: { y: 0.42, z: 0.18, scale: 0.9 } },
      { text: 'Rót bột CaCO₃ vào ống 2.', type: 'pour', src: 'caco3p', dst: 'tube2', pour: { level: 0.2, color: 0xeceae2, opacity: 1.0 } },
      { text: 'Rót HCl vào ống 1 (đá vôi).', type: 'pour', src: 'hcl2', dst: 'tube1', pour: { level: 0.55, color: 0xeaf0e4, opacity: 0.5 } },
      { text: 'Rót HCl vào ống 2 (bột) — bột sủi bọt mạnh hơn nhiều!', type: 'pour', src: 'hcl2', dst: 'tube2', pour: { level: 0.55, color: 0xeaf0e4, opacity: 0.5 }, fx: 'rate_surface_react' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
