import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'GeometryTriangle', tenDungCu: 'Tam giác', monHoc: 'toan-hoc', lop: 11,
  chuong: 'chuong-2-hinh-hoc', chuDe: 'hinh-hoc-phang', loai: 'hien-thi', nhan: 'Tam giác',
  component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then(m => ({ default: m.TamGiac }))),
  kichThuocVaCham: [1.0,0.05,1.0], viTriY: 0.05, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
