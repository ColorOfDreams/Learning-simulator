import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'TrigWave',
	tenDungCu: 'Sóng lượng giác',
	monHoc: 'toan-hoc',
	lop: 11,
	chuong: 'chuong-3-luong-giac',
	chuDe: 'luong-giac',
	loai: 'hien-thi',
	nhan: 'Sóng lượng giác',
	component: lazy(() => import('@/dung-cu/toan-hoc/dung-cu-toan-hoc').then((m) => ({ default: m.SongLuongGiac }))),
	kichThuocVaCham: [3.0, 2.0, 0.2],
	viTriY: 1.5,
	coDinh: true,
	thuocTinh: [
		{ khoa: 'A', nhan: 'Biên độ (A)', loai: 'so', macDinh: 1, nhoNhat: 0.5, lonNhat: 3, buoc: 0.1 },
		{ khoa: 'omega', nhan: 'Tần số góc (ω)', loai: 'so', macDinh: 1, nhoNhat: 0.1, lonNhat: 5, buoc: 0.1 },
		{ khoa: 'phi', nhan: 'Pha ban đầu (φ)', loai: 'so', macDinh: 0, nhoNhat: -3.14, lonNhat: 3.14, buoc: 0.1 },
	],
};
export default dinhNghia;
