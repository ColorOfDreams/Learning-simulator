import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'StatisticsChart', tenDungCu: 'Biểu đồ thống kê', monHoc: 'toan-hoc', lop: 11,
  chuong: 'chuong-1-dai-so', chuDe: 'dai-so', loai: 'hien-thi', nhan: 'Biểu đồ thống kê',
  component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then(m => ({ default: m.BieuDoThongKe }))),
  kichThuocVaCham: [1.0,0.05,1.0], viTriY: 0.05, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
