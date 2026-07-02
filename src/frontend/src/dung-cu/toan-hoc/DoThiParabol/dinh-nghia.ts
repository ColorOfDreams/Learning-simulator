import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'ParabolaGraph',
	tenDungCu: 'Đồ thị Parabol',
	monHoc: 'toan-hoc',
	lop: 11,
	chuong: 'chuong-1-dai-so',
	chuDe: 'dai-so',
	loai: 'hien-thi',
	nhan: 'Đồ thị Parabol',
	component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then((m) => ({ default: m.DoThiParabol }))),
	kichThuocVaCham: [3.0, 2.0, 0.2],
	viTriY: 1.5,
	coDinh: true,
	thuocTinh: [
		{ khoa: 'a', nhan: 'Hệ số a', loai: 'so', macDinh: 1, nhoNhat: -5, lonNhat: 5, buoc: 0.1 },
		{ khoa: 'b', nhan: 'Hệ số b', loai: 'so', macDinh: 0, nhoNhat: -5, lonNhat: 5, buoc: 0.1 },
		{ khoa: 'c', nhan: 'Hệ số c', loai: 'so', macDinh: 0, nhoNhat: -5, lonNhat: 5, buoc: 0.1 },
	],
};
export default dinhNghia;
