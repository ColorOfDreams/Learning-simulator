import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'TestTube',
	tenDungCu: 'Ống nghiệm',
	monHoc: 'hoa-hoc',
	lop: 11,
	chuong: 'chuong-3-phan-ung-hoa-hoc',
	chuDe: 'phan-ung-hoa-hoc',
	loai: 'thuy-tinh',
	nhan: 'Ống nghiệm',
	component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then((m) => ({ default: m.OngNghiem }))),
	kichThuocVaCham: [0.1, 0.6, 0.1],
	viTriY: 0.2,
	coDinh: false,
	thuocTinh: [],
};
export default dinhNghia;
