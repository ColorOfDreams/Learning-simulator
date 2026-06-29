import { lazy } from 'react';
import type { DungCu } from '@/services/DungCu/typing';

const dinhNghia: DungCu.IRecord = {
  maDungCu: 'SpringPendulum',
  tenDungCu: 'Con lắc lò xo',
  monHoc: 'vat-ly', lop: 11,
  chuong: 'chuong-1-dao-dong', chuDe: 'con-lac-lo-xo',
  loai: 'dao-dong', nhan: 'Con lắc lò xo',

  component: lazy(() => import('./ConLacLoXo')),
  kichThuocVaCham: (tt: Record<string, any>) => {
    const m = (tt?.khoiLuong || tt?.mass || 1) as number;
    const k = (tt?.doCung || tt?.stiffness || 50) as number;
    const l = (2 + (m * 9.8) / k) / 2;
    return [0.5, l, 0.5];
  },
  viTriY: 1.5,
  coDinh: true,

  diemSnap: (tt: Record<string, any>) => {
    const m = (tt?.khoiLuong || tt?.mass || 1) as number;
    const k = (tt?.doCung || tt?.stiffness || 50) as number;
    const l = 2 + (m * 9.8) / k;
    return [{ id: 'neo', viTri: [0, l / 2, 0], loai: 'neo', nhan: 'Điểm neo', ketNoiDen: ['kep'] }];
  },

  thuocTinh: [
    { khoa: 'khoiLuong', nhan: 'Khối lượng (kg)', loai: 'so', macDinh: 1, nhoNhat: 0.01, lonNhat: 100, buoc: 0.1 },
    { khoa: 'doCung', nhan: 'Độ cứng (N/m)', loai: 'so', macDinh: 50, nhoNhat: 1, lonNhat: 1000, buoc: 1 },
    { khoa: 'mauSac', nhan: 'Màu sắc', loai: 'mau', macDinh: '#3b82f6' },
  ],

  thoiGianThuc: (tt: Record<string, any>, dangChay: boolean) => dangChay ? {
    nhan: 'Chu kì T',
    giaTri: `${(2 * Math.PI * Math.sqrt(((tt?.khoiLuong || tt?.mass || 1) as number) / ((tt?.doCung || tt?.stiffness || 50) as number))).toFixed(2)}s`,
  } : null,
};

export default dinhNghia;
