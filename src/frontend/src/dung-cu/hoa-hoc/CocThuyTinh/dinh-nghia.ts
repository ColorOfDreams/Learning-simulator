import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'Beaker',
	tenDungCu: 'Cốc thủy tinh',
	monHoc: 'hoa-hoc',
	lop: 11,
	chuong: 'chuong-1-axit-bazo',
	chuDe: 'axit-bazo',
	loai: 'thuy-tinh',
	nhan: 'Cốc thủy tinh',
	component: lazy(() => import('./CocThuyTinh')),
	kichThuocVaCham: [0.4, 0.65, 0.4],
	viTriY: 0.4,
	coDinh: false,
	thuocTinh: [
		{ khoa: 'theTich', nhan: 'Thể tích (ml)', loai: 'so', macDinh: 0, nhoNhat: 0, lonNhat: 500, buoc: 10 },
		{ khoa: 'mauChatLong', nhan: 'Màu chất lỏng', loai: 'mau', macDinh: '#00a8ff' },
	],
};
export default dinhNghia;
