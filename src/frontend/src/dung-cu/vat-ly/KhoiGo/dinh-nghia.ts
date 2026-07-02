import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'WoodenBlock',
	tenDungCu: 'Khối gỗ',
	monHoc: 'vat-ly',
	lop: 11,
	chuong: 'chuong-1-dao-dong',
	chuDe: 'dao-dong-dieu-hoa',
	loai: 'vat-ran',
	nhan: 'Khối gỗ',
	component: lazy(() => import('./KhoiGo')),
	kichThuocVaCham: [0.75, 0.75, 0.75],
	viTriY: 0.15,
	coDinh: false,
	thuocTinh: [{ khoa: 'mauSac', nhan: 'Màu sắc', loai: 'mau', macDinh: '#feca57' }],
};
export default dinhNghia;
