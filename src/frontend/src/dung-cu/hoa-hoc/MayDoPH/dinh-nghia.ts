import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'pHMeter', tenDungCu: 'Máy đo pH', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-1-axit-bazo', chuDe: 'axit-bazo', loai: 'do-luong', nhan: 'Máy đo pH',
  component: lazy(() => import('./MayDoPH')), kichThuocVaCham: [0.3, 0.25, 0.1], viTriY: 0.05, coDinh: true, thuocTinh: [],
  thoiGianThuc: (tt: Record<string, any>) => ({ nhan: 'pH', giaTri: ((tt?.doPH || tt?.pH || 7) as number).toFixed(1), mau: (tt?.doPH || tt?.pH || 7) < 6 ? '#ef4444' : (tt?.doPH || tt?.pH || 7) > 8 ? '#3b82f6' : '#22c55e' }),
};
export default dinhNghia;
