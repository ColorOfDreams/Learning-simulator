import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'Mortar',
	tenDungCu: 'Cối chày',
	monHoc: 'hoa-hoc',
	lop: 11,
	chuong: 'chuong-3-phan-ung-hoa-hoc',
	chuDe: 'phan-ung-hoa-hoc',
	loai: 'co-dinh',
	nhan: 'Cối chày',
	component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then((m) => ({ default: m.CoiChay }))),
	kichThuocVaCham: [0.2, 0.15, 0.2],
	viTriY: 0.05,
	coDinh: false,
	thuocTinh: [],
};
export default dinhNghia;
