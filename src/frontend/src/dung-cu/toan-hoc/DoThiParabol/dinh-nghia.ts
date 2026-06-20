import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'ParabolaGraph', tenDungCu: 'Đồ thị Parabol', monHoc: 'toan-hoc', lop: 11,
  chuong: 'chuong-1-dai-so', chuDe: 'dai-so', loai: 'hien-thi', nhan: 'Đồ thị Parabol',
  component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then(m => ({ default: m.DoThiParabol }))),
  kichThuocVaCham: [1.0,0.05,1.0], viTriY: 0.05, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
