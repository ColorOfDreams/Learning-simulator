import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'Vector2D',
	tenDungCu: 'Vector 2D',
	monHoc: 'toan-hoc',
	lop: 11,
	chuong: 'chuong-2-hinh-hoc',
	chuDe: 'hinh-hoc-phang',
	loai: 'hien-thi',
	nhan: 'Vector 2D',
	component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then((m) => ({ default: m.Vector2D }))),
	kichThuocVaCham: [0.5, 0.05, 0.5],
	viTriY: 0.05,
	coDinh: true,
	thuocTinh: [],
};
export default dinhNghia;
