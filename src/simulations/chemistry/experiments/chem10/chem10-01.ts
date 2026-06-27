import type { ChemExperimentDef } from '../types';

const experiment = {
    id: 'CHEM10-01',
    setup: [
      { type: 'rutherford_screen',  x: 0,    z: 0.4 },
      { type: 'rutherford_holder',  id: 'holder', x: 0,    z: 0.4 },
      { type: 'dish_foil',          id: 'foil',   x: -2.3, y: 3.86, z: -3.05, label: 'Lá vàng (Au)' },
      { type: 'rutherford_source',  id: 'source', x: -5.3, z: 0.4 },
      { type: 'rutherford_scope',   id: 'scope',  x: 5.1,  z: 2.3 }
    ],
    steps: [
      { text: 'Kéo lá vàng cực mỏng vào giá đỡ ở tâm màn huỳnh quang.', type: 'drop', src: 'foil', dst: 'holder', dropOffset: { y: 0.8, z: 0 } },
      { text: 'Nhấp vào nguồn phóng xạ để mở khe chiếu chùm hạt alpha (α).', type: 'click', id: 'source', fx: 'rutherford_beam' },
      { text: 'Nhấp vào kính hiển vi để phân tích kết quả và xây dựng mô hình nguyên tử.', type: 'click', id: 'scope', fx: 'atom_model' }
    ]
  } satisfies ChemExperimentDef;

export default experiment;
