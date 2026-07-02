import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'CoordinatePlane',
	tenDungCu: 'Mặt phẳng tọa độ',
	monHoc: 'toan-hoc',
	lop: 11,
	chuong: 'chuong-2-hinh-hoc',
	chuDe: 'hinh-hoc-phang',
	loai: 'hien-thi',
	nhan: 'Mặt phẳng tọa độ',
	component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then((m) => ({ default: m.MatPhangToaDo }))),
	kichThuocVaCham: [1.5, 0.05, 1.5],
	viTriY: 0.05,
	coDinh: true,
	thuocTinh: [],
};
export default dinhNghia;
