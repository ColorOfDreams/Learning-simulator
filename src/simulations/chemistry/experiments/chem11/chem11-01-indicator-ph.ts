import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM11-01',
    setup: [
      { type: 'rack', x: -2.4, z: 0.5, n: 3 },
      { type: 'tube', id: 'tube1', label: 'HCl (acid)' },
      { type: 'tube', id: 'tube2', label: 'Nước cất' },
      { type: 'tube', id: 'tube3', label: 'NaOH (base)' },
      { type: 'bottle', id: 'hcl', label: 'HCl', color: 0xdde9f2, op: 0.45, cap: 0xc2a23a },
      { type: 'bottle', id: 'water', label: 'Nước cất', color: 0xdde9f2, op: 0.4 },
      { type: 'bottle', id: 'naoh', label: 'NaOH', color: 0xdde9f2, op: 0.45 },
      { type: 'bottle', id: 'ind', label: 'Chỉ thị\nvạn năng', color: 0xcde0b8, op: 0.7, fs: 32, cap: 0x6a8a3a }
    ],
    steps: [
      { text: 'Rót dung dịch HCl vào ống 1.', type: 'pour', src: 'hcl', dst: 'tube1', pour: { level: 0.45, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Rót nước cất vào ống 2.', type: 'pour', src: 'water', dst: 'tube2', pour: { level: 0.45, color: 0xe2ecf2, opacity: 0.4 } },
      { text: 'Rót dung dịch NaOH vào ống 3.', type: 'pour', src: 'naoh', dst: 'tube3', pour: { level: 0.45, color: 0xe2ecf2, opacity: 0.45 } },
      { text: 'Nhỏ chất chỉ thị vào ống 1 — môi trường acid hóa đỏ.', type: 'pour', src: 'ind', dst: 'tube1', pour: { level: 0.5 }, fx: 'ind_acid' },
      { text: 'Nhỏ chất chỉ thị vào ống 2 — môi trường trung tính màu lục.', type: 'pour', src: 'ind', dst: 'tube2', pour: { level: 0.5 }, fx: 'ind_neutral' },
      { text: 'Nhỏ chất chỉ thị vào ống 3 — môi trường base hóa xanh tím.', type: 'pour', src: 'ind', dst: 'tube3', pour: { level: 0.5 }, fx: 'ind_base' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
