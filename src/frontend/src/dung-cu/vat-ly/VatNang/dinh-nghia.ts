import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'MassBlock',
	tenDungCu: 'Vật nặng',
	monHoc: 'vat-ly',
	lop: 11,
	chuong: 'chuong-1-dao-dong',
	chuDe: 'dao-dong-dieu-hoa',
	loai: 'vat-ran',
	nhan: 'Vật nặng',
	component: lazy(() => import('./VatNang')),
	kichThuocVaCham: [0.4, 0.4, 0.4],
	viTriY: 0.2,
	coDinh: false,
	thuocTinh: [{ khoa: 'mauSac', nhan: 'Màu sắc', loai: 'mau', macDinh: '#f59e0b' }],
};
export default dinhNghia;
