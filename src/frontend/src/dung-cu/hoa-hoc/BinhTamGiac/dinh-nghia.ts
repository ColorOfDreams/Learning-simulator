import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'ErlenmeyerFlask', tenDungCu: 'Bình tam giác', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-3-phan-ung-hoa-hoc', chuDe: 'phan-ung-hoa-hoc', loai: 'thuy-tinh', nhan: 'Bình tam giác',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.BinhTamGiac }))),
  kichThuocVaCham: [0.35,0.5,0.35], viTriY: 0.3, coDinh: false, thuocTinh: [],
};
export default dinhNghia;
