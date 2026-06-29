import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Pipette', tenDungCu: 'Pipet', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-1-axit-bazo', chuDe: 'axit-bazo', loai: 'thuy-tinh', nhan: 'Pipet',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.Pipet }))),
  kichThuocVaCham: [0.04,0.8,0.04], viTriY: 0.05, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
