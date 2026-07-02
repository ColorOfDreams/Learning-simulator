import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'Protractor',
	tenDungCu: 'Thước đo góc',
	monHoc: 'vat-ly',
	lop: 11,
	chuong: 'chuong-1-dao-dong',
	chuDe: 'dao-dong-dieu-hoa',
	loai: 'do-luong',
	nhan: 'Thước đo góc',
	component: lazy(() => import('./ThuocDoGoc')),
	kichThuocVaCham: [0.3, 0.3, 0.05],
	viTriY: 0.05,
	coDinh: true,
	thuocTinh: [],
};
export default dinhNghia;
