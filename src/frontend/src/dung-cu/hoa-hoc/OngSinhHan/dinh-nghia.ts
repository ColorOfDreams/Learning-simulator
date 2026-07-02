import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'Condenser',
	tenDungCu: 'Ống sinh hàn',
	monHoc: 'hoa-hoc',
	lop: 11,
	chuong: 'chuong-3-phan-ung-hoa-hoc',
	chuDe: 'phan-ung-hoa-hoc',
	loai: 'thuy-tinh',
	nhan: 'Ống sinh hàn',
	component: lazy(() => import('@/dung-cu/hoa-hoc/dung-cu-hoa-hoc').then((m) => ({ default: m.OngSinhHan }))),
	kichThuocVaCham: [0.08, 0.6, 0.08],
	viTriY: 0.3,
	coDinh: true,
	thuocTinh: [],
};
export default dinhNghia;
