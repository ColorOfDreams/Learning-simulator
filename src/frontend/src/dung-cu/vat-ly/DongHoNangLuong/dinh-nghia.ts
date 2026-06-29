import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'EnergyMeter', tenDungCu: 'Đồng hồ năng lượng', monHoc: 'vat-ly', lop: 11,
  chuong: 'chuong-1-dao-dong', chuDe: 'dao-dong-dieu-hoa', loai: 'hien-thi', nhan: 'Đồng hồ năng lượng',
  component: lazy(() => import('./DongHoNangLuong')), kichThuocVaCham: [0.3, 0.2, 0.05], viTriY: 0.05, coDinh: true, thuocTinh: [],
};
export default dinhNghia;
