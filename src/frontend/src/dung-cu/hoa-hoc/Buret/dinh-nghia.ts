import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Burette', tenDungCu: 'Buret', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-1-axit-bazo', chuDe: 'axit-bazo', loai: 'thuy-tinh', nhan: 'Buret',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.Buret }))),
  kichThuocVaCham: [0.06,1.5,0.06], viTriY: 1.5, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
