import { lazy } from 'react';
import type { DungCu } from '@/services/DungCu/typing';

const dinhNghia: DungCu.IRecord = {
  maDungCu: 'Dashpot', tenDungCu: 'Bộ giảm chấn', monHoc: 'vat-ly', lop: 11,
  chuong: 'chuong-1-dao-dong', chuDe: 'dao-dong-tat-dan', loai: 'dao-dong', nhan: 'Bộ giảm chấn',
  component: lazy(() => import('./BoGiamChan')), kichThuocVaCham: [0.3, 1.0, 0.3], viTriY: 0.5, coDinh: true,
  thuocTinh: [
    { khoa: 'heSoTatDan', nhan: 'Hệ số tắt dần β', loai: 'so', macDinh: 0.5, nhoNhat: 0, lonNhat: 5, buoc: 0.1 },
  ],
};
export default dinhNghia;
