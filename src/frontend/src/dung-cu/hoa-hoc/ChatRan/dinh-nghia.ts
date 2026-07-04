import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'ChemicalSolid', tenDungCu: 'Lọ chứa chất rắn', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-3-phan-ung-hoa-hoc', chuDe: 'phan-ung-hoa-hoc', loai: 'vat-ran', nhan: 'Chất rắn',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.ChatRan }))),
  kichThuocVaCham: [0.15,0.15,0.15], viTriY: 0.1, coDinh: false, 
  thuocTinh: [
    { khoa: 'khoiLuong', nhan: 'Khối lượng (g)', loai: 'so', macDinh: 100, nhoNhat: 0, lonNhat: 500, buoc: 1 }
  ],
};
export default dinhNghia;
