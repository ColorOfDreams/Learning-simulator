import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Spring', tenDungCu: 'Lò xo', monHoc: 'vat-ly', lop: 11,
  chuong: 'chuong-1-dao-dong', chuDe: 'dao-dong-dieu-hoa', loai: 'dao-dong', nhan: 'Lò xo',
  component: lazy(() => import('./LoXo')),
  kichThuocVaCham: (tt) => [0.3, ((tt?.chieuDai || tt?.length || 2) as number) / 2, 0.3],
  viTriY: 1.5, coDinh: true,
  thuocTinh: [{ khoa: 'chieuDai', nhan: 'Chiều dài (m)', loai: 'so', macDinh: 2, nhoNhat: 0.1, lonNhat: 5, buoc: 0.1 }],
};
export default dinhNghia;
