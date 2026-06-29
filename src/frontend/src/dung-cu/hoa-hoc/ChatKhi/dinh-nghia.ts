import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'ChemicalGas', tenDungCu: 'Chất khí', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-3-phan-ung-hoa-hoc', chuDe: 'phan-ung-hoa-hoc', loai: 'chat-khi', nhan: 'Chất khí',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.ChatKhi }))),
  kichThuocVaCham: [0.15,0.15,0.15], viTriY: 0.5, coDinh: false, 
  thuocTinh: [
    { khoa: 'theTich', nhan: 'Thể tích (ml)', loai: 'so', macDinh: 100, nhoNhat: 0, lonNhat: 500, buoc: 1 }
  ],
};
export default dinhNghia;
