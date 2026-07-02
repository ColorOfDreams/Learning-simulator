import type { DungCu } from '@/services/DungCu/typing';
import { lazy } from 'react';

const dinhNghia: DungCu.IRecord = {
	maDungCu: 'SimplePendulum',
	tenDungCu: 'Con lắc đơn',
	monHoc: 'vat-ly',
	lop: 11,
	chuong: 'chuong-1-dao-dong',
	chuDe: 'con-lac-don',
	loai: 'dao-dong',
	nhan: 'Con lắc đơn',

	component: lazy(() => import('./ConLacDon')),
	kichThuocVaCham: (tt: Record<string, any>) => [0.5, ((tt?.chieuDai || tt?.length || 2) as number) / 2, 0.5],
	viTriY: 1.5,
	coDinh: true,

	diemSnap: (tt: Record<string, any>) => [
		{
			id: 'neo',
			viTri: [0, ((tt?.chieuDai || tt?.length || 2) as number) / 2, 0],
			loai: 'neo',
			nhan: 'Điểm neo',
			ketNoiDen: ['kep'],
		},
	],

	thuocTinh: [
		{ khoa: 'chieuDai', nhan: 'Chiều dài (m)', loai: 'so', macDinh: 2, nhoNhat: 0.1, lonNhat: 10, buoc: 0.1 },
		{ khoa: 'khoiLuong', nhan: 'Khối lượng (kg)', loai: 'so', macDinh: 1, nhoNhat: 0.01, lonNhat: 100, buoc: 0.1 },
		{ khoa: 'mauSac', nhan: 'Màu sắc', loai: 'mau', macDinh: '#ef4444' },
	],

	thoiGianThuc: (tt: Record<string, any>, dangChay: boolean) =>
		dangChay
			? {
					nhan: 'Chu kì T',
					giaTri: `${(2 * Math.PI * Math.sqrt(((tt?.chieuDai || tt?.length || 2) as number) / 9.81)).toFixed(2)}s`,
				}
			: null,
};

export default dinhNghia;
