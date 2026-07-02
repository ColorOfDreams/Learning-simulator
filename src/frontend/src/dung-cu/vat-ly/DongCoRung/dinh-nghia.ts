import { lazy } from 'react';
const dinhNghia: DungCu.IRecord = {
	maDungCu: 'DrivingMotor',
	tenDungCu: 'Động cơ rung',
	monHoc: 'vat-ly',
	lop: 11,
	chuong: 'chuong-1-dao-dong',
	chuDe: 'dao-dong-cuong-buc',
	loai: 'dao-dong',
	nhan: 'Động cơ rung',
	component: lazy(() => import('./DongCoRung')),
	kichThuocVaCham: [0.4, 0.3, 0.3],
	viTriY: 0.2,
	coDinh: true,
	thuocTinh: [
		{ khoa: 'tanSo', nhan: 'Tần số (Hz)', loai: 'so', macDinh: 2, nhoNhat: 0.1, lonNhat: 50, buoc: 0.1 },
		{ khoa: 'bienDo', nhan: 'Biên độ (m)', loai: 'so', macDinh: 0.3, nhoNhat: 0.01, lonNhat: 0.5, buoc: 0.01 },
	],
};
export default dinhNghia;
