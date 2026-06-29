import { lazy } from 'react';
import type { DungCu } from '@/services/DungCu/typing';

const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Stand', tenDungCu: 'Giá đỡ tĩnh',
  monHoc: 'vat-ly', lop: 11,
  chuong: 'chuong-1-dao-dong', chuDe: 'dao-dong-dieu-hoa',
  loai: 'co-dinh', nhan: 'Giá đỡ tĩnh',

  component: lazy(() => import('./GiaDo')),
  kichThuocVaCham: [1, 2.5, 1],
  viTriY: 1.9,
  coDinh: true,

  diemSnap: () => [{ id: 'kep', viTri: [1.6, 2.0, 0], loai: 'clamp', nhan: 'Kẹp', ketNoiDen: ['anchor', 'spring_top', 'dashpot_top'] }],
  thuocTinh: [],
};

export default dinhNghia;
