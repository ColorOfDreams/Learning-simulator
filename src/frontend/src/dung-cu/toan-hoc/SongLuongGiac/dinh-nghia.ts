import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'TrigWave', tenDungCu: 'Sóng lượng giác', monHoc: 'toan-hoc', lop: 11,
  chuong: 'chuong-3-luong-giac', chuDe: 'luong-giac', loai: 'hien-thi', nhan: 'Sóng lượng giác',
  component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then(m => ({ default: m.SongLuongGiac }))),
  kichThuocVaCham: [1.0,0.05,1.0], viTriY: 0.05, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
