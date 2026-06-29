import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Ruler', tenDungCu: 'Thước đo', monHoc: 'vat-ly', lop: 11,
  chuong: 'chuong-1-dao-dong', chuDe: 'dao-dong-dieu-hoa', loai: 'do-luong', nhan: 'Thước đo',
  component: lazy(() => import('./ThuocDo')), kichThuocVaCham: [0.5, 0.05, 0.05], viTriY: 0.05, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
