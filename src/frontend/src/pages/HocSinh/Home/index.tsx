import { analyzeAiPrompt } from '@/services/ai/api';
import { getSceneAll } from '@/services/base/api';
import { calcLevel, levelFloorXp, nextThresholdXp } from '@/utils/xp';
import { Pagination } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import StudentLayout from '../components/StudentLayout';
import './index.less';

const escapeHtml = (value: unknown) =>
	String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

// Render AI chat text an toàn: escape trước, sau đó xuống dòng + dựng công thức $...$ bằng KaTeX
const renderChatText = (text: string) => {
	const escaped = escapeHtml(text).replace(/\n/g, '<br/>');
	const withMath = escaped.replace(/\$(.+?)\$/g, (_, texEscaped) => {
		const tex = texEscaped
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");
		if (typeof window !== 'undefined' && (window as any).katex) {
			try {
				return (window as any).katex.renderToString(tex, { throwOnError: false, displayMode: false });
			} catch {
				return tex;
			}
		}
		return tex;
	});
	return { __html: withMath };
};

// ── Types ──
interface LabItem {
	id: number | string;
	title: string;
	subject: 'physics' | 'math' | 'chem';
	level: string;
	mins: string;
	xp: string;
	locked: boolean;
	simId?: string;
	grade: number;
}

// ── Mock Data ──
const ALL_LABS: LabItem[] = [
	// ── Hóa học 10 ──
	{
		id: 201,
		title: 'Thí nghiệm bắn phá lá vàng – Rutherford',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM10-01',
		grade: 10,
	},
	{
		id: 202,
		title: 'Thử màu ngọn lửa của các kim loại',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM10-02',
		grade: 10,
	},
	{
		id: 203,
		title: 'Kẽm tác dụng với dung dịch HCl',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+55 XP',
		locked: false,
		simId: 'CHEM10-03',
		grade: 10,
	},
	{
		id: 204,
		title: 'Đốt cháy dây magnesium trong không khí',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM10-04',
		grade: 10,
	},
	{
		id: 205,
		title: 'Phản ứng tỏa nhiệt – tôi vôi (CaO + H₂O)',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM10-05',
		grade: 10,
	},
	{
		id: 206,
		title: 'Phản ứng thu nhiệt (NH₄Cl + Ba(OH)₂)',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM10-06',
		grade: 10,
	},
	{
		id: 207,
		title: 'Ảnh hưởng của nồng độ đến tốc độ phản ứng',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'CHEM10-07',
		grade: 10,
	},
	{
		id: 208,
		title: 'Ảnh hưởng của chất xúc tác – phân hủy H₂O₂',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'CHEM10-08',
		grade: 10,
	},
	{
		id: 209,
		title: 'Ảnh hưởng của diện tích bề mặt tiếp xúc',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'CHEM10-09',
		grade: 10,
	},
	{
		id: 210,
		title: 'Nhận biết ion halide bằng dung dịch AgNO₃',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'CHEM10-10',
		grade: 10,
	},
	{
		id: 211,
		title: 'Tính tẩy màu của nước chlorine',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM10-11',
		grade: 10,
	},
	{
		id: 212,
		title: 'Chlorine đẩy bromine ra khỏi muối bromide',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'CHEM10-12',
		grade: 10,
	},
	// ── Hóa học 12 ──
	{
		id: 1,
		title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+120 XP',
		locked: false,
		simId: 'CHEM12-01',
		grade: 12,
	},
	{
		id: 2,
		title: 'Phản ứng xà phòng hóa chất béo',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM12-02',
		grade: 12,
	},
	{
		id: 101,
		title: 'Glucose tác dụng với Cu(OH)₂',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'CHEM12-03',
		grade: 12,
	},
	{
		id: 102,
		title: 'Phản ứng tráng bạc của glucose',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'CHEM12-04',
		grade: 12,
	},
	{
		id: 103,
		title: 'Phản ứng màu của tinh bột với iodine',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM12-05',
		grade: 12,
	},
	{
		id: 104,
		title: 'Phản ứng màu biuret của protein',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+65 XP',
		locked: false,
		simId: 'CHEM12-06',
		grade: 12,
	},
	{
		id: 105,
		title: 'Sodium tác dụng với nước',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM12-07',
		grade: 12,
	},
	{
		id: 106,
		title: 'Đinh sắt tác dụng với dung dịch CuSO₄',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+65 XP',
		locked: false,
		simId: 'CHEM12-08',
		grade: 12,
	},
	{
		id: 107,
		title: 'Nhôm tác dụng với dung dịch NaOH',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'CHEM12-09',
		grade: 12,
	},
	{
		id: 108,
		title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)',
		subject: 'chem',
		level: 'Nâng cao',
		mins: '~12 phút',
		xp: '+100 XP',
		locked: false,
		simId: 'CHEM12-10',
		grade: 12,
	},
	{
		id: 109,
		title: 'Điều chế Fe(OH)₂ và Fe(OH)₃',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM12-11',
		grade: 12,
	},
	{
		id: 110,
		title: 'Điện phân dung dịch CuSO₄',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'CHEM12-12',
		grade: 12,
	},
	{
		id: 111,
		title: 'Ăn mòn điện hóa học (pin Zn-Cu)',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'CHEM12-13',
		grade: 12,
	},
	{
		id: 3,
		title: 'Độ pH và Chất chỉ thị',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM11-01',
		grade: 11,
	},
	{
		id: 4,
		title: 'Chuyển động ném xiên',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'SIM-02',
		grade: 10,
	},
	{
		id: 6,
		title: 'Đồ thị hàm số bậc hai – Đỉnh & Trục đối xứng',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH10-01',
		grade: 10,
	},
	{
		id: 7,
		title: 'Định luật Ohm cho đoạn mạch',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'SIM-50',
		grade: 11,
	},
	{
		id: 45,
		title: 'Dao động điều hòa',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-42',
		grade: 11,
	},
	{
		id: 46,
		title: 'Dao động tắt dần',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-43',
		grade: 11,
	},
	{
		id: 47,
		title: 'Hiện tượng cộng hưởng',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'SIM-44',
		grade: 11,
	},
	{
		id: 48,
		title: 'Sóng ngang truyền trên dây',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-45',
		grade: 11,
	},
	{
		id: 49,
		title: 'Sóng dừng',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'SIM-46',
		grade: 11,
	},
	{
		id: 50,
		title: 'Giao thoa sóng nước',
		subject: 'physics',
		level: 'Nâng cao',
		mins: '~15 phút',
		xp: '+100 XP',
		locked: false,
		simId: 'SIM-47',
		grade: 11,
	},
	{
		id: 51,
		title: 'Định luật Coulomb & Lực tương tác',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'SIM-48',
		grade: 11,
	},
	{
		id: 52,
		title: 'Điện trường & Đường sức điện',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'SIM-49',
		grade: 11,
	},
	{
		id: 53,
		title: 'Mạch ghép điện trở (Nối tiếp / Song song)',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-51',
		grade: 11,
	},
	{
		id: 54,
		title: 'Định luật Ohm cho toàn mạch',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'SIM-52',
		grade: 11,
	},
	{
		id: 24,
		title: 'Chuyển động thẳng đều & biến đổi đều',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-21',
		grade: 10,
	},
	{
		id: 25,
		title: 'Sự rơi tự do',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'SIM-22',
		grade: 10,
	},
	{
		id: 26,
		title: 'Chuyển động ném ngang',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'SIM-23',
		grade: 10,
	},
	{
		id: 27,
		title: 'Định luật II Newton (Xe lăn)',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-24',
		grade: 10,
	},
	{
		id: 28,
		title: 'Vật trượt trên mặt phẳng nghiêng',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'SIM-25',
		grade: 10,
	},
	{
		id: 29,
		title: 'Con lắc lò xo nằm ngang',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'SIM-26',
		grade: 10,
	},
	{
		id: 30,
		title: 'Con lắc đơn dao động',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'SIM-27',
		grade: 10,
	},
	{
		id: 31,
		title: 'Chuyển động tròn đều',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-28',
		grade: 10,
	},
	{
		id: 32,
		title: 'Va chạm 1D — bảo toàn động lượng',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-29',
		grade: 10,
	},
	{
		id: 33,
		title: 'Bảo toàn cơ năng',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'SIM-30',
		grade: 10,
	},
	{
		id: 8,
		title: 'Chuẩn độ Acid - Base',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM11-02',
		grade: 11,
	},
	{
		id: 9,
		title: 'Đồng tác dụng với dung dịch HNO₃ đặc',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM11-03',
		grade: 11,
	},
	{
		id: 10,
		title: 'Ammonia tác dụng với HCl đặc (Khói trắng)',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM11-04',
		grade: 11,
	},
	{
		id: 12,
		title: 'H₂SO₄ đặc tác dụng với đường (Saccharose)',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM11-05',
		grade: 11,
	},
	{
		id: 13,
		title: 'Ethylene tác dụng với nước Bromine',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~8 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'CHEM11-06',
		grade: 11,
	},
	{
		id: 14,
		title: 'Acetylene tác dụng với dung dịch AgNO₃/NH₃',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~10 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM11-07',
		grade: 11,
	},
	{
		id: 15,
		title: 'Ethanol tác dụng với kim loại Sodium',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'CHEM11-08',
		grade: 11,
	},
	{
		id: 16,
		title: 'Phenol tác dụng với nước Bromine',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'CHEM11-09',
		grade: 11,
	},
	{
		id: 17,
		title: 'Glycerol tác dụng với Cu(OH)₂',
		subject: 'chem',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'CHEM11-10',
		grade: 11,
	},
	{
		id: 18,
		title: 'Tính chất hóa học của Acetic Acid',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'CHEM11-11',
		grade: 11,
	},
	{
		id: 19,
		title: 'Vectơ và các phép toán vectơ',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH10-02',
		grade: 10,
	},
	{
		id: 20,
		title: 'Phương trình đường thẳng',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'MATH10-03',
		grade: 10,
	},
	{
		id: 21,
		title: 'Đường tròn và phương trình đường tròn',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH10-04',
		grade: 10,
	},
	{
		id: 22,
		title: 'Định lý cosin và sin trong tam giác',
		subject: 'math',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+100 XP',
		locked: false,
		simId: 'MATH10-05',
		grade: 10,
	},
	{
		id: 23,
		title: 'Hệ bất phương trình hai ẩn',
		subject: 'math',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH10-06',
		grade: 10,
	},
	{
		id: 24,
		title: 'Giá trị lượng giác – Tam giác vuông',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'MATH10-07',
		grade: 10,
	},
	{
		id: 25,
		title: 'Thống kê mô tả – Phân phối & Box plot',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH10-08',
		grade: 10,
	},
	{
		id: 34,
		title: 'Định luật Boyle (đẳng nhiệt)',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'SIM-31',
		grade: 12,
	},
	{
		id: 35,
		title: 'Định luật Charles (đẳng áp)',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+65 XP',
		locked: false,
		simId: 'SIM-32',
		grade: 12,
	},
	{
		id: 36,
		title: 'Thuyết động học phân tử chất khí',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-33',
		grade: 12,
	},
	{
		id: 37,
		title: 'Sự chuyển thể của chất',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'SIM-34',
		grade: 12,
	},
	{
		id: 38,
		title: 'Lực từ tác dụng lên dây dẫn',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-35',
		grade: 12,
	},
	{
		id: 39,
		title: 'Lực Lorentz',
		subject: 'physics',
		level: 'Nâng cao',
		mins: '~15 phút',
		xp: '+100 XP',
		locked: false,
		simId: 'SIM-36',
		grade: 12,
	},
	{
		id: 40,
		title: 'Hiện tượng cảm ứng điện từ',
		subject: 'physics',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'SIM-37',
		grade: 12,
	},
	{
		id: 41,
		title: 'Máy phát điện xoay chiều',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'SIM-38',
		grade: 12,
	},
	{
		id: 42,
		title: 'Phóng xạ & chu kỳ bán rã',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+90 XP',
		locked: false,
		simId: 'SIM-39',
		grade: 12,
	},
	{
		id: 43,
		title: 'Phản ứng phân hạch & nhiệt hạch',
		subject: 'physics',
		level: 'Nâng cao',
		mins: '~18 phút',
		xp: '+120 XP',
		locked: false,
		simId: 'SIM-40',
		grade: 12,
	},
	{
		id: 44,
		title: 'Năng lượng liên kết riêng',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-41',
		grade: 12,
	},
	// ── Toán học 11 ──
	{
		id: 'MATH11-01',
		title: 'Đồ thị hàm lượng giác',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'MATH11-01',
		grade: 11,
	},
	{
		id: 'MATH11-02',
		title: 'Vòng tròn đơn vị & phương trình lượng giác',
		subject: 'math',
		level: 'Trung bình',
		mins: '15 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'MATH11-02',
		grade: 11,
	},
	{
		id: 'MATH11-03',
		title: 'Hoán vị, tổ hợp & Nhị thức Newton',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'MATH11-03',
		grade: 11,
	},
	{
		id: 'MATH11-04',
		title: 'Xác suất sự kiện & biến cố',
		subject: 'math',
		level: 'Cơ bản',
		mins: '10 phút',
		xp: '+65 XP',
		locked: false,
		simId: 'MATH11-04',
		grade: 11,
	},
	{
		id: 'MATH11-05',
		title: 'Giới hạn dãy số',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'MATH11-05',
		grade: 11,
	},
	{
		id: 'MATH11-06',
		title: 'Giới hạn hàm số & hàm liên tục',
		subject: 'math',
		level: 'Trung bình',
		mins: '13 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'MATH11-06',
		grade: 11,
	},
	{
		id: 'MATH11-07',
		title: 'Đạo hàm & tiếp tuyến đường cong',
		subject: 'math',
		level: 'Nâng cao',
		mins: '15 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'MATH11-07',
		grade: 11,
	},
	{
		id: 'MATH11-08',
		title: 'Phép dời hình & phép đồng dạng',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'MATH11-08',
		grade: 11,
	},
	{
		id: 'MATH11-09',
		title: 'Đường thẳng & mặt phẳng trong không gian',
		subject: 'math',
		level: 'Nâng cao',
		mins: '15 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'MATH11-09',
		grade: 11,
	},
	{
		id: 'MATH11-10',
		title: 'Quan hệ vuông góc trong không gian',
		subject: 'math',
		level: 'Nâng cao',
		mins: '15 phút',
		xp: '+85 XP',
		locked: false,
		simId: 'MATH11-10',
		grade: 11,
	},
	{
		id: 'MATH11-11',
		title: 'Hình lăng trụ & hình chóp',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH11-11',
		grade: 11,
	},
	{
		id: 'MATH12-01',
		title: 'Đồ thị hàm số bậc 3 & bảng biến thiên',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'MATH12-01',
		grade: 12,
	},
	{
		id: 'MATH12-02',
		title: 'Hàm phân thức & tiệm cận',
		subject: 'math',
		level: 'Trung bình',
		mins: '10 phút',
		xp: '+65 XP',
		locked: false,
		simId: 'MATH12-02',
		grade: 12,
	},
	{
		id: 'MATH12-03',
		title: 'Hàm số mũ & lũy thừa',
		subject: 'math',
		level: 'Cơ bản',
		mins: '10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'MATH12-03',
		grade: 12,
	},
	{
		id: 'MATH12-04',
		title: 'Hàm logarit – đồ thị & tính chất',
		subject: 'math',
		level: 'Cơ bản',
		mins: '10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'MATH12-04',
		grade: 12,
	},
	{
		id: 'MATH12-05',
		title: 'Tích phân – diện tích dưới đường cong',
		subject: 'math',
		level: 'Nâng cao',
		mins: '14 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH12-05',
		grade: 12,
	},
	{
		id: 'MATH12-06',
		title: 'Diện tích miền giữa hai đường cong',
		subject: 'math',
		level: 'Nâng cao',
		mins: '14 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'MATH12-06',
		grade: 12,
	},
	{
		id: 'MATH12-07',
		title: 'Số phức – mặt phẳng Argand',
		subject: 'math',
		level: 'Nâng cao',
		mins: '12 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'MATH12-07',
		grade: 12,
	},
	{
		id: 'MATH12-08',
		title: 'Mặt cầu – mặt trụ – mặt nón',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'MATH12-08',
		grade: 12,
	},
	{
		id: 'MATH12-09',
		title: 'Khối đa diện & thể tích',
		subject: 'math',
		level: 'Trung bình',
		mins: '12 phút',
		xp: '+70 XP',
		locked: false,
		simId: 'MATH12-09',
		grade: 12,
	},
	{
		id: 'MATH12-10',
		title: 'Phương trình mặt phẳng trong Oxyz',
		subject: 'math',
		level: 'Nâng cao',
		mins: '13 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'MATH12-10',
		grade: 12,
	},
	{
		id: 'MATH12-11',
		title: 'Đường thẳng trong không gian Oxyz',
		subject: 'math',
		level: 'Nâng cao',
		mins: '13 phút',
		xp: '+75 XP',
		locked: false,
		simId: 'MATH12-11',
		grade: 12,
	},
];

// const SUBJECT_LABELS: Record<string, string> = {
// 	physics: 'vật lý',
// 	math: 'toán',
// 	chem: 'hóa học',
// };

const getSubjectIcon = (subject: 'physics' | 'math' | 'chem', idx: number) => {
	const iconStyle = {
		animation: 'labFloat 4s ease-in-out infinite',
		animationDelay: `${idx * 0.2}s`,
		opacity: 0.9,
	};

	if (subject === 'chem') {
		return (
			<svg
				width='44'
				height='44'
				viewBox='0 0 24 24'
				fill='none'
				stroke='#fff'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
				style={iconStyle}
			>
				<path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' />
				<path d='M8 14h8' />
			</svg>
		);
	}
	if (subject === 'physics') {
		return (
			<svg
				width='44'
				height='44'
				viewBox='0 0 24 24'
				fill='none'
				stroke='#fff'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
				style={iconStyle}
			>
				<path d='M4 20c6 0 12-6 16-16M14 4h6v6M4 20l4-1-3-3Z' />
			</svg>
		);
	}
	return (
		<svg
			width='44'
			height='44'
			viewBox='0 0 24 24'
			fill='none'
			stroke='#fff'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
			style={iconStyle}
		>
			<path d='M3 20c4 0 5-14 9-14M3 20h6M14 9l6 6M20 9l-6 6' />
		</svg>
	);
};

interface ChatMessage {
	role: 'user' | 'ai';
	text: string;
	simulations?: {
		simulation_id: string;
		title: string;
		subject: 'physics' | 'math' | 'chem';
		level?: string;
		mins?: string;
		xp?: string;
	}[];
}

const HERO_CHIPS = [
	{ label: 'Chuẩn độ axit-bazơ', prompt: 'Giúp mình bài chuẩn độ axit-bazơ' },
	{ label: 'Chuyển động ném xiên', prompt: 'Mình cần thực hành chuyển động ném xiên' },
	{ label: 'Đồ thị hàm số bậc hai', prompt: 'Bài tập đồ thị hàm số bậc hai' },
	{ label: 'Xà phòng hóa chất béo', prompt: 'Phản ứng xà phòng hóa chất béo' },
	{ label: 'Phản ứng tráng bạc', prompt: 'Thí nghiệm tráng bạc của glucose' },
];

const GRADES = [10, 11, 12];
const FILTERS = [
	{ key: 'all', label: 'Tất cả' },
	{ key: 'math', label: 'Toán' },
	{ key: 'physics', label: 'Vật lý' },
	{ key: 'chem', label: 'Hóa học' },
];

const HOME_SCROLL_RESTORE_KEY = 'hoc_sinh_home_scroll_restore';

interface HomeScrollRestoreState {
	scrollTop: number;
	grade: number;
	filter: string;
	currentPage?: number;
}

const readHomeScrollRestore = (): HomeScrollRestoreState | null => {
	try {
		const raw = sessionStorage.getItem(HOME_SCROLL_RESTORE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<HomeScrollRestoreState>;
		if (typeof parsed.scrollTop !== 'number' || typeof parsed.grade !== 'number' || typeof parsed.filter !== 'string') {
			sessionStorage.removeItem(HOME_SCROLL_RESTORE_KEY);
			return null;
		}
		return {
			scrollTop: parsed.scrollTop,
			grade: parsed.grade,
			filter: parsed.filter,
			currentPage: parsed.currentPage,
		};
	} catch {
		sessionStorage.removeItem(HOME_SCROLL_RESTORE_KEY);
		return null;
	}
};

const HocSinhHome: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;
	const homeScrollRef = React.useRef<HTMLDivElement | null>(null);
	const restoredHomeState = useMemo(() => readHomeScrollRestore(), []);
	const [heroInput, setHeroInput] = useState('');
	const [grade, setGrade] = useState(() => {
		if (restoredHomeState) return restoredHomeState.grade;
		const saved = localStorage.getItem('selected_grade');
		return saved ? parseInt(saved, 10) : 12;
	});
	const [filter, setFilter] = useState(() => {
		if (restoredHomeState) return restoredHomeState.filter;
		return localStorage.getItem('selected_filter') || 'all';
	});

	React.useEffect(() => {
		localStorage.setItem('selected_grade', String(grade));
	}, [grade]);

	React.useEffect(() => {
		localStorage.setItem('selected_filter', filter);
	}, [filter]);

	// AI Assistant States
	const [aiLoading, setAiLoading] = useState(false);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [dynamicLabs, setDynamicLabs] = useState<LabItem[]>([]);

	React.useEffect(() => {
		getSceneAll()
			.then((res) => {
				const scenes = res.data?.data || res.data || [];
				if (Array.isArray(scenes)) {
					const mapped: LabItem[] = scenes.map((s: any) => ({
						id: s.id,
						title: s.name || 'Thí nghiệm tùy chỉnh',
						subject: s.roomType === 'chemistry' ? 'chem' : s.roomType,
						level: 'Trung bình',
						mins: '~15 phút',
						xp: '+100 XP',
						locked: false,
						simId: s.id,
						grade: 12, // Default grade for custom scenes
					}));
					setDynamicLabs(mapped);
				}
			})
			.catch((err) => console.error('Fetch scenes error:', err));
	}, []);

	// Auto-scroll chat to bottom
	React.useEffect(() => {
		const el = document.getElementById('hero-chat-scroll');
		if (el) {
			el.scrollTop = el.scrollHeight;
		}
	}, [chatMessages, aiLoading]);

	const combinedLabs = useMemo(() => [...dynamicLabs, ...ALL_LABS], [dynamicLabs]);

	const filteredLabs = useMemo(
		() =>
			combinedLabs.filter((l) => {
				const isBuiltInMathOrChem = typeof l.id === 'string' && (l.id.startsWith('MATH') || l.id.startsWith('CHEM'));
				const matchesGrade = l.grade === grade || (typeof l.id === 'string' && !isBuiltInMathOrChem);
				const matchesFilter = filter === 'all' || l.subject === filter;
				return matchesGrade && matchesFilter;
			}),
		[grade, filter, combinedLabs],
	);

	const [currentPage, setCurrentPage] = useState(() => {
		if (restoredHomeState && typeof restoredHomeState.currentPage === 'number') {
			return restoredHomeState.currentPage;
		}
		return 1;
	});

	const isFirstRender = React.useRef(true);
	React.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		setCurrentPage(1);
	}, [grade, filter]);

	const [thumbErrors, setThumbErrors] = useState<Set<string>>(new Set());

	const paginatedLabs = useMemo(() => {
		const startIndex = (currentPage - 1) * 9;
		return filteredLabs.slice(startIndex, startIndex + 9);
	}, [filteredLabs, currentPage]);

	const scrollRestoredRef = React.useRef(false);
	React.useEffect(() => {
		if (!restoredHomeState || scrollRestoredRef.current) return;

		const tryScroll = () => {
			if (scrollRestoredRef.current) return;
			const el = homeScrollRef.current;
			if (el) {
				el.scrollTop = restoredHomeState.scrollTop;
				if (Math.abs(el.scrollTop - restoredHomeState.scrollTop) < 5) {
					scrollRestoredRef.current = true;
				}
			}
		};

		tryScroll();

		const timer1 = setTimeout(tryScroll, 100);
		const timer2 = setTimeout(tryScroll, 300);
		const timer3 = setTimeout(tryScroll, 600);

		const forceStopTimer = setTimeout(() => {
			scrollRestoredRef.current = true;
			sessionStorage.removeItem(HOME_SCROLL_RESTORE_KEY);
		}, 1000);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
			clearTimeout(timer3);
			clearTimeout(forceStopTimer);
		};
	}, [restoredHomeState, filteredLabs.length]);

	const isScrollMountRef = React.useRef(true);
	React.useEffect(() => {
		if (isScrollMountRef.current) {
			isScrollMountRef.current = false;
			return;
		}
		if (restoredHomeState && !scrollRestoredRef.current) {
			return;
		}
		const el = homeScrollRef.current;
		if (el) {
			el.scrollTop = 0;
		}
	}, [currentPage, filter, grade]);

	const openWorkspace = useCallback(
		(subject: string, simId?: string) => {
			const el = homeScrollRef.current;
			sessionStorage.setItem(
				HOME_SCROLL_RESTORE_KEY,
				JSON.stringify({
					scrollTop: el?.scrollTop ?? 0,
					grade,
					filter,
					currentPage,
				}),
			);

			let path = `/hoc-sinh/workspace?subject=${subject}`;
			if (simId) {
				path += `&sim=${simId}`;
				const matchedLab = ALL_LABS.find((l) => l.simId === simId);
				if (matchedLab) {
					setGrade(matchedLab.grade);
					setFilter(matchedLab.subject);
					localStorage.setItem('selected_grade', String(matchedLab.grade));
					localStorage.setItem('selected_filter', matchedLab.subject);
					if (matchedLab.level) path += `&difficulty=${encodeURIComponent(matchedLab.level)}`;
				} else {
					// Dynamic lab, open sandbox viewer
					path = `/thi-nghiem?id=${simId}&role=student`;
				}
			}
			history.push(path);
		},
		[filter, grade, currentPage],
	);

	const handleHeroRun = useCallback(
		async (customPrompt?: string) => {
			const prompt = (customPrompt || heroInput).trim();
			if (!prompt) return;

			const contextForApi = chatMessages.slice(-6).map((m) => ({
				role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
				content: m.text,
			}));

			// Add user message
			setChatMessages((prev) => [...prev, { role: 'user', text: prompt }]);
			setHeroInput('');
			setAiLoading(true);

			try {
				const res = await analyzeAiPrompt({ message: prompt, context: contextForApi });
				const data = res?.data?.data;

				let text =
					'Mình có thể giúp bạn làm bài tập này! Hãy nhập chủ đề — ví dụ: chuẩn độ, ném xiên, đồ thị hàm số — hoặc chọn phòng thí nghiệm bên dưới nhé.';
				let recommendedSims: ChatMessage['simulations'] = undefined;

				if (data) {
					if (data.answer?.short_answer) {
						text = data.answer.short_answer;
					} else {
						text = 'Mình đã tìm thấy một phòng thí nghiệm rất phù hợp với chủ đề của bạn. Hãy trải nghiệm ngay nhé:';
					}

					const simList = data.simulations?.length ? data.simulations : data.simulation ? [data.simulation] : [];
					if (simList.length > 0) {
						recommendedSims = simList.map((sim) => {
							const matchedLab = ALL_LABS.find((l) => l.simId === sim.simulation_id);
							return {
								simulation_id: sim.simulation_id,
								title: sim.title || matchedLab?.title || 'Phòng thí nghiệm',
								subject: (data.subject || matchedLab?.subject || 'chem') as 'physics' | 'math' | 'chem',
								level: matchedLab?.level || 'Trung bình',
								mins: matchedLab?.mins || '~15 phút',
								xp: matchedLab?.xp || '+120 XP',
							};
						});
					}
				}

				setChatMessages((prev) => [
					...prev,
					{
						role: 'ai',
						text,
						simulations: recommendedSims,
					},
				]);
			} catch (err) {
				console.error('AI search analysis error:', err);
				setChatMessages((prev) => [
					...prev,
					{
						role: 'ai',
						text: 'Xin lỗi bạn, trợ lý AI đang gặp sự cố kết nối. Bạn có thể tự chọn phòng thí nghiệm bên dưới nhé!',
					},
				]);
			} finally {
				setAiLoading(false);
			}
		},
		[heroInput, chatMessages],
	);

	const handleHeroKey = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') handleHeroRun();
		},
		[handleHeroRun],
	);

	const getLevelClass = (level: string) => {
		if (level === 'Cơ bản') return 'level-beginner';
		if (level === 'Trung bình') return 'level-intermediate';
		if (level === 'Nâng cao') return 'level-advanced';
		return 'level-locked';
	};

	return (
		<>
			<StudentLayout>
				<div ref={homeScrollRef} className='stu-home scl'>
					{/* Grid overlay */}
					<div className='stu-home__grid-overlay' />

					<div className='stu-home__content'>
						{/* Header */}
						<div className='stu-home__header'>
							<div>
								<div className='stu-home__welcome'>Chào mừng trở lại, {user?.firstName || 'bạn'}</div>
								<div className='stu-home__subtitle'>Sẵn sàng cho thí nghiệm hôm nay?</div>
							</div>
							<div className='stu-home__badges'>
								<div className='stu-home__badge'>
									<div className='stu-home__badge-dot stu-home__badge-dot--level' />
									<span>Level {calcLevel(user?.xp ?? 0)}</span>
								</div>
								<div className='stu-home__badge stu-home__badge--streak'>
									<svg
										className='stu-home__flame'
										width='16'
										height='16'
										viewBox='0 0 24 24'
										xmlns='http://www.w3.org/2000/svg'
									>
										<defs>
											<linearGradient id='flameGrad' x1='0.5' y1='0' x2='0.5' y2='1'>
												<stop offset='0%' stopColor='oklch(0.92 0.2 80)' />
												<stop offset='55%' stopColor='oklch(0.76 0.22 48)' />
												<stop offset='100%' stopColor='oklch(0.6 0.2 30)' />
											</linearGradient>
										</defs>
										<path
											d='M12 2c1.5 3-1.5 5 0 8 1 2 4 2 4 5a4 4 0 0 1-8 0c0-2 1-3 1-4-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-6-6-6-14Z'
											fill='url(#flameGrad)'
										/>
									</svg>
									<span>{user?.streak ?? 0} ngày liên tiếp</span>
								</div>
								{(() => {
									const xp = user?.xp ?? 0;
									const lvl = calcLevel(xp);
									const floor = levelFloorXp(lvl);
									const next = nextThresholdXp(lvl);
									const span = Math.max(1, next - floor);
									const inLevel = Math.max(0, xp - floor);
									const remaining = Math.max(0, next - xp);
									const pct = Math.min(100, Math.round((inLevel / span) * 100));
									return (
										<div className='stu-home__xp-bar'>
											<div className='stu-home__xp-labels'>
												<span>{xp.toLocaleString('vi-VN')} XP</span>
												<span>
													Còn {remaining.toLocaleString('vi-VN')} → Lv.{lvl + 1}
												</span>
											</div>
											<div className='stu-home__xp-track'>
												<div className='stu-home__xp-fill' style={{ width: `${pct}%` }} />
											</div>
										</div>
									);
								})()}
							</div>
						</div>

						{/* AI Hero Bar */}
						<div className='stu-home__hero'>
							<div className='stu-home__hero-header'>
								<div className='stu-home__hero-icon'>
									<svg
										width='22'
										height='22'
										viewBox='0 0 24 24'
										fill='none'
										stroke='#fff'
										strokeWidth='1.8'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M12 3v3M12 18v3M3 12h3M18 12h3' />
										<path d='M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' />
										<path d='M12 10.5v3M10.5 12h3' />
									</svg>
								</div>
								<div>
									<div className='stu-home__hero-title'>Trợ lý AI Phòng Thí Nghiệm</div>
									<div className='stu-home__hero-desc'>
										Nhập chủ đề hoặc dán đề bài tập để trợ lý chuẩn bị phòng thí nghiệm
									</div>
								</div>
							</div>

							{/* Scrollable Chat History */}
							{chatMessages.length > 0 && (
								<div id='hero-chat-scroll' className='stu-home__hero-chat-scroll scl'>
									{chatMessages.map((msg, index) => (
										<div
											key={index}
											className={`stu-home__hero-chat-row ${
												msg.role === 'user' ? 'stu-home__hero-chat-row--user' : 'stu-home__hero-chat-row--ai'
											}`}
										>
											<div className='stu-home__hero-chat-bubble-container'>
												<div className='stu-home__hero-chat-bubble'>
													{msg.role === 'ai' ? (
														<span dangerouslySetInnerHTML={renderChatText(msg.text)} />
													) : (
														msg.text
													)}
												</div>
												{msg.simulations && msg.simulations.length > 0 && (
													<div className='stu-home__hero-chat-labs'>
														{msg.simulations.map((sim) => (
														<div
															key={sim.simulation_id}
															className='stu-home__hero-chat-lab-card'
															onClick={() => openWorkspace(sim.subject, sim.simulation_id)}
														>
															<div
																className='stu-profile__achievement-badge-icon stu-profile__achievement-badge-icon--chem'
																style={{ background: 'rgba(98, 43, 226, 0.15)', color: 'oklch(0.62 0.16 264)' }}
															>
																<svg
																	width='21'
																	height='21'
																	viewBox='0 0 24 24'
																	fill='none'
																	stroke='currentColor'
																	strokeWidth='1.8'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																>
																	<path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' />
																</svg>
															</div>
															<div style={{ flex: 1, minWidth: 0 }}>
																<div className='stu-home__hero-chat-lab-title'>{sim.title}</div>
																<div className='stu-home__hero-chat-lab-meta'>
																	{sim.level} · {sim.mins} · {sim.xp}
																</div>
															</div>
															<div className='stu-home__hero-chat-lab-btn'>
																Bắt đầu
																<svg
																	width='13'
																	height='13'
																	viewBox='0 0 24 24'
																	fill='none'
																	stroke='currentColor'
																	strokeWidth='2.4'
																	strokeLinecap='round'
																	strokeLinejoin='round'
																>
																	<path d='M5 12h14M13 6l6 6-6 6' />
																</svg>
															</div>
														</div>
														))}
													</div>
												)}
											</div>
										</div>
									))}

									{aiLoading && (
										<div className='stu-home__hero-chat-row stu-home__hero-chat-row--ai'>
											<div className='stu-home__hero-chat-typing'>
												<div className='stu-home__hero-chat-typing-dot' />
												<div className='stu-home__hero-chat-typing-dot' />
												<div className='stu-home__hero-chat-typing-dot' />
											</div>
										</div>
									)}
								</div>
							)}

							{/* Chat Input row */}
							<div className='stu-home__hero-input-row'>
								<input
									className='stu-home__hero-input'
									value={heroInput}
									onChange={(e) => setHeroInput(e.target.value)}
									onKeyDown={handleHeroKey}
									placeholder='Ví dụ: "giúp mình bài chuẩn độ axit-bazơ" hoặc nhập yêu cầu...'
								/>
								<div className='stu-home__hero-btn' onClick={() => handleHeroRun()}>
									<span>Chạy bằng AI</span>
									<svg
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2.5'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path d='M5 12h14M13 6l6 6-6 6' />
									</svg>
								</div>
							</div>

							{/* Chips */}
							<div className='stu-home__hero-chips'>
								<span className='stu-home__hero-chips-label'>Thử:</span>
								{HERO_CHIPS.map((c) => (
									<span key={c.label} className='stu-home__hero-chip' onClick={() => handleHeroRun(c.prompt)}>
										{c.label}
									</span>
								))}
							</div>
						</div>

						{/* Divider */}
						<div className='stu-home__divider'>
							<div className='stu-home__divider-line' />
							<div className='stu-home__divider-text'></div>
							<div className='stu-home__divider-line' />
						</div>

						{/* Controls */}
						<div className='stu-home__controls'>
							<div className='stu-home__grade-tabs'>
								{GRADES.map((g) => (
									<div
										key={g}
										className={`stu-home__grade-tab ${grade === g ? 'stu-home__grade-tab--active' : ''}`}
										onClick={() => setGrade(g)}
									>
										Lớp {g}
									</div>
								))}
							</div>
							<div className='stu-home__filter-chips'>
								{FILTERS.map((f) => (
									<div
										key={f.key}
										className={`stu-home__filter-chip ${filter === f.key ? `stu-home__filter-chip--active stu-home__filter-chip--${f.key}` : ''}`}
										onClick={() => setFilter(f.key)}
									>
										{f.label}
									</div>
								))}
							</div>
						</div>

						{/* Lab Grid */}
						<div className='stu-home__grid'>
							{paginatedLabs.map((lab, idx) => (
								<div
									key={lab.id}
									className='stu-home__card'
									style={{ animationDelay: `${idx * 0.06}s` }}
									onClick={() => !lab.locked && openWorkspace(lab.subject, lab.simId)}
								>
									<div className={`stu-home__card-thumb stu-home__card-thumb--${lab.subject}`}>
										{lab.simId && !thumbErrors.has(lab.simId) ? (
											<img
												className='stu-home__card-thumb-img'
												src={`/thumbnails/${lab.simId}.webp`}
												alt={lab.title}
												onError={() => setThumbErrors((prev) => new Set(prev).add(lab.simId!))}
											/>
										) : (
											getSubjectIcon(lab.subject, idx)
										)}
										<div className='stu-home__card-shine' style={{ animationDelay: `${1 + idx * 0.3}s` }} />
										{lab.locked && (
											<div className='stu-home__card-lock'>
												<svg
													width='22'
													height='22'
													viewBox='0 0 24 24'
													fill='none'
													stroke='#fff'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<rect x='5' y='11' width='14' height='9' rx='2' />
													<path d='M8 11V8a4 4 0 0 1 8 0v3' />
												</svg>
											</div>
										)}
									</div>
									<div className='stu-home__card-body'>
										<div className='stu-home__card-title-row'>
											<div className={`stu-home__card-dot stu-home__card-dot--${lab.subject}`} />
											<div className='stu-home__card-title'>{lab.title}</div>
										</div>
										<div className='stu-home__card-meta'>
											<span className={`stu-home__card-level ${getLevelClass(lab.level)}`}>{lab.level}</span>
											<span className='stu-home__card-mins'>{lab.mins}</span>
											<span className='stu-home__card-xp'>{{ 'Cơ bản': '+80 XP', 'Trung bình': '+120 XP', 'Nâng cao': '+180 XP' }[lab.level] ?? lab.xp ?? '+80 XP'}</span>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Pagination */}
						{filteredLabs.length > 9 && (
							<div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', marginBottom: '24px' }}>
								<Pagination
									current={currentPage}
									pageSize={9}
									total={filteredLabs.length}
									onChange={(page) => setCurrentPage(page)}
									showSizeChanger={false}
								/>
							</div>
						)}
					</div>
				</div>
			</StudentLayout>
		</>
	);
};

export default HocSinhHome;
