import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'DongSunfat', tenDungCu: 'Đồng (II) sunfat (CuSO4)', monHoc: 'hoa-hoc', lop: 10,
  chuong: 'chuong-3-phan-ung-hoa-hoc', chuDe: 'phan-ung-hoa-hoc', loai: 'chat-long', nhan: 'CuSO4',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.ChatLong }))),
  kichThuocVaCham: [0.15,0.15,0.15], viTriY: 0.2, coDinh: false,
  thuocTinh: [
    { khoa: 'kyHieu', nhan: 'Ky hieu', loai: 'thong-tin', macDinh: 'CuSO4' },
    { khoa: 'chemicalLevel', nhan: 'Muc chat long (%)', loai: 'so', macDinh: 100, nhoNhat: 0, lonNhat: 100, buoc: 10 },
  ],
};
export default dinhNghia;
