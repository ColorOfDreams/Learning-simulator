import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'RoundFlask',
	tenDungCu: 'Bình cầu',
	monHoc: 'hoa-hoc',
	lop: 11,
	chuong: 'chuong-3-phan-ung-hoa-hoc',
	chuDe: 'phan-ung-hoa-hoc',
	loai: 'thuy-tinh',
	nhan: 'Bình cầu',
	component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then((m) => ({ default: m.BinhCau }))),
	kichThuocVaCham: [0.35, 0.5, 0.35],
	viTriY: 0.4,
	coDinh: false,
	thuocTinh: [],
};
export default dinhNghia;
