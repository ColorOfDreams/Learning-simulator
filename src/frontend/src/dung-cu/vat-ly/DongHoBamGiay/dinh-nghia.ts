import type { DungCu } from '@/services/DungCu/typing';
import { lazy } from 'react';

const dinhNghia: DungCu.IRecord = {
	maDungCu: 'Stopwatch',
	tenDungCu: 'Đồng hồ bấm giờ',
	monHoc: 'vat-ly',
	lop: 11,
	chuong: 'chuong-1-dao-dong',
	chuDe: 'dao-dong-dieu-hoa',
	loai: 'do-luong',
	nhan: 'Đồng hồ bấm giờ',

	component: lazy(() => import('./DongHoBamGiay')),
	kichThuocVaCham: [0.15, 0.1, 0.25],
	viTriY: 0.1,
	coDinh: true,

	thuocTinh: [],

	dieuKhien: [
		{
			id: 'bat-tat',
			loai: 'bat-tat',
			nhan: 'Start/Stop',
			viTri: [0.08, -0.05, 0.26],
			kichThuoc: 0.025,
			hanhDong: { loai: 'dat-thuoc-tinh', khoa: 'dangChay', giaTriBat: true, giaTriTat: false },
		},
		{
			id: 'lap',
			loai: 'nut',
			nhan: 'Lap',
			viTri: [0.16, -0.05, 0.26],
			kichThuoc: 0.02,
			hanhDong: { loai: 'tuy-chinh' },
		},
		{
			id: 'reset',
			loai: 'nut',
			nhan: 'Reset',
			viTri: [0.0, -0.05, 0.26],
			kichThuoc: 0.02,
			hanhDong: { loai: 'tuy-chinh' },
		},
	],

	thoiGianThuc: (tt: Record<string, any>) => ({
		nhan: 'Thời gian',
		giaTri: `${((tt?.thoiGian || tt?.elapsed || 0) as number).toFixed(1)}s`,
	}),
};

export default dinhNghia;
