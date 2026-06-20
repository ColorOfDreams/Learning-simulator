import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'PeriodicTable', tenDungCu: 'Bảng tuần hoàn', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-2-bang-tuan-hoan', chuDe: 'bang-tuan-hoan', loai: 'hien-thi', nhan: 'Bảng tuần hoàn',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.BangTuanHoan }))),
  kichThuocVaCham: [1.5,1.0,0.05], viTriY: 1.5, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
