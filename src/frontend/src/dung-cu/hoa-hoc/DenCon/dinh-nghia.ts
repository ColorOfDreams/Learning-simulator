import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'BunsenBurner', tenDungCu: 'Đèn cồn', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-3-phan-ung-hoa-hoc', chuDe: 'phan-ung-hoa-hoc', loai: 'co-dinh', nhan: 'Đèn cồn',
  component: lazy(() => import('./DenCon')), kichThuocVaCham: [0.3, 0.9, 0.3], viTriY: 0.1, coDinh: false,
  thuocTinh: [
    { khoa: 'batDen', nhan: 'Bật đèn', loai: 'bat-tat', macDinh: false },
    { khoa: 'kichThuocLua', nhan: 'Mức lửa', loai: 'so', macDinh: 1, nhoNhat: 0.5, lonNhat: 3, buoc: 0.1 },
  ],
};
export default dinhNghia;
