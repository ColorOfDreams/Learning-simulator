import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Phenolphtalein', tenDungCu: 'Phenolphtalein', monHoc: 'hoa-hoc', lop: 11,
  chuong: 'chuong-1-axit-bazo', chuDe: 'axit-bazo', loai: 'chat-long', nhan: 'PP',
  component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then(m => ({ default: m.ChatLong }))),
  kichThuocVaCham: [0.15,0.15,0.15], viTriY: 0.2, coDinh: false,
  thuocTinh: [
    { khoa: 'kyHieu', nhan: 'Ky hieu', loai: 'thong-tin', macDinh: 'phenolphtalein' },
    { khoa: 'chemicalLevel', nhan: 'Muc chat long (%)', loai: 'so', macDinh: 100, nhoNhat: 0, lonNhat: 100, buoc: 10 },
  ],
};
export default dinhNghia;
