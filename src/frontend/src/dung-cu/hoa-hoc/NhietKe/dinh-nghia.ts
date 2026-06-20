import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Thermometer', tenDungCu: 'Nhiệt kế', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-3-phan-ung-hoa-hoc', chuDe: 'phan-ung-hoa-hoc', loai: 'do-luong', nhan: 'Nhiệt kế',
  component: lazy(() => import('./NhietKe')), kichThuocVaCham: [0.05, 0.6, 0.05], viTriY: 0.05, coDinh: true,
  thuocTinh: [{ khoa: 'nhietDo', nhan: 'Nhiệt độ (°C)', loai: 'so', macDinh: 25, nhoNhat: -10, lonNhat: 110, buoc: 1 }],
  thoiGianThuc: (tt: Record<string, any>) => ({
    nhan: 'Nhiệt độ',
    giaTri: `${((tt?.nhietDo || tt?.temperature || 25) as number).toFixed(0)}°C`,
    mau: (tt?.nhietDo || tt?.temperature || 25) > 100 ? '#ef4444' : (tt?.nhietDo || tt?.temperature || 25) > 50 ? '#f59e0b' : '#22c55e',
  }),
};
export default dinhNghia;
