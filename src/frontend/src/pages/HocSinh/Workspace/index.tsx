import { chatWithAiPrompt, generateAiQuiz } from '@/services/ai/api';
import GenericChemSimulation from '@simulations/chemistry/GenericChemSimulation';
import EsterSimulation from '@simulations/chemistry/SIM-01-ester';
import SoapSimulation from '@simulations/chemistry/SIM-03-soap';
import ProjectileSimulation from '@simulations/physics/SIM-02-projectile';
import KinematicsSimulation from '@simulations/physics/SIM-21-kinematics';
import FreefallSimulation from '@simulations/physics/SIM-22-freefall';
import HorizontalSimulation from '@simulations/physics/SIM-23-horizontal';
import Newton2Simulation from '@simulations/physics/SIM-24-newton2';
import InclineSimulation from '@simulations/physics/SIM-25-incline';
import SpringSimulation from '@simulations/physics/SIM-26-spring';
import PendulumSimulation from '@simulations/physics/SIM-27-pendulum';
import CircularSimulation from '@simulations/physics/SIM-28-circular';
import CollisionSimulation from '@simulations/physics/SIM-29-collision';
import EnergySimulation from '@simulations/physics/SIM-30-energy';
import React, { useCallback, useMemo, useState } from 'react';
import { history, useLocation } from 'umi';
import StudentLayout from '../components/StudentLayout';

// Math 10 Simulations
import QuadraticSimulation from '@simulations/math/SIM-08-quadratic';
import ProjectileArchSimulation from '@simulations/math/SIM-16-projectile-arch';
import InequalitySimulation from '@simulations/math/SIM-17-inequality';
import TriangulationSimulation from '@simulations/math/SIM-18-triangulation';
import ConicSimulation from '@simulations/math/SIM-19-conic';
import StatisticsSimulation from '@simulations/math/SIM-20-statistics';

import './index.less';

// ── Types ──
type SubjectKey = 'physics' | 'math' | 'chem';

interface ChatMessage {
	role: 'ai' | 'user';
	text: string;
}

// ── Lab metadata ──
const LAB_META = {
	'SIM-01': {
		label: 'Hóa học',
		title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-03': {
		label: 'Hóa học',
		title: 'Phản ứng xà phòng hóa chất béo',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-04': {
		label: 'Hóa học',
		title: 'Glucose tác dụng với Cu(OH)₂',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-05': {
		label: 'Hóa học',
		title: 'Phản ứng tráng bạc của glucose',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-06': {
		label: 'Hóa học',
		title: 'Phản ứng màu của tinh bột với iodine',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-07': {
		label: 'Hóa học',
		title: 'Phản ứng màu biuret của protein',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-08': { label: 'Hóa học', title: 'Sodium tác dụng với nước', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-09': {
		label: 'Hóa học',
		title: 'Đinh sắt tác dụng với dung dịch CuSO₄',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-10': {
		label: 'Hóa học',
		title: 'Nhôm tác dụng với dung dịch NaOH',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-11': {
		label: 'Hóa học',
		title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-12': {
		label: 'Hóa học',
		title: 'Điều chế Fe(OH)₂ và Fe(OH)₃',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-13': { label: 'Hóa học', title: 'Điện phân dung dịch CuSO₄', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-14': {
		label: 'Hóa học',
		title: 'Ăn mòn điện hóa học (pin Zn – Cu)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-15': {
		label: 'Hóa học 10',
		title: 'Thí nghiệm bắn phá lá vàng (Rutherford, 1911)',
		tutor: 'Trợ lý hạt nhân AI',
		className: 'chem',
	},
	'SIM-02': { label: 'Vật lý', title: 'Chuyển động ném xiên', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-21': {
		label: 'Vật lý',
		title: 'Chuyển động thẳng đều & biến đổi đều',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'physics',
	},
	'SIM-22': {
		label: 'Vật lý',
		title: 'Sự rơi tự do',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'physics',
	},
	'SIM-23': { label: 'Vật lý', title: 'Chuyển động ném ngang', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-24': { label: 'Vật lý', title: 'Định luật II Newton (Xe lăn)', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-25': { label: 'Vật lý', title: 'Vật trượt trên mặt phẳng nghiêng', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-26': { label: 'Vật lý', title: 'Con lắc lò xo nằm ngang', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-27': { label: 'Vật lý', title: 'Con lắc đơn dao động', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-28': { label: 'Vật lý', title: 'Chuyển động tròn đều', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-29': { label: 'Vật lý', title: 'Va chạm 1D — bảo toàn động lượng', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-30': { label: 'Vật lý', title: 'Bảo toàn cơ năng', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-08-math': { label: 'Toán', title: 'Đồ thị hàm số bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-16': { label: 'Toán', title: 'Ném xiên và vòm cổng parabol', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-17': { label: 'Toán', title: 'Miền nghiệm hệ bất phương trình', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-18': { label: 'Toán', title: 'Hệ thức lượng tam giác cột cờ', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-19': { label: 'Toán', title: 'Định nghĩa Elip ghim đinh', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-20': { label: 'Toán', title: 'Thống kê số liệu mẫu và biểu đồ', tutor: 'Trợ lý Toán AI', className: 'math' },
	default_math: { label: 'Toán', title: 'Hàm bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
	default_physics: {
		label: 'Vật lý',
		title: 'Chuyển động ném xiên',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'physics',
	},
};

// ── Initial chat messages ──
const LAB_INITIAL_CHATS: Record<string, ChatMessage[]> = {
	'SIM-01': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với thí nghiệm điều chế ethyl acetate! H₂SO₄ đặc đóng vai trò gì trong phản ứng này?',
		},
	],
	'SIM-03': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với thí nghiệm phản ứng xà phòng hóa chất béo! Phản ứng xà phòng hóa chất béo là phản ứng thủy phân ester trong môi trường kiềm hay axit?',
		},
	],
	'SIM-04': [
		{
			role: 'ai',
			text: 'Chào bạn! Trong phản ứng với Cu(OH)₂ ở nhiệt độ thường, glucose thể hiện tính chất của hợp chất nào?',
		},
	],
	'SIM-05': [
		{ role: 'ai', text: 'Chào bạn! Glucose có thể tham gia phản ứng tráng bạc là nhờ nhóm chức nào trong phân tử?' },
	],
	'SIM-06': [
		{
			role: 'ai',
			text: 'Chào bạn! Phản ứng màu giữa tinh bột và iodine có phải phản ứng hóa học tạo liên kết mới không?',
		},
	],
	'SIM-07': [{ role: 'ai', text: 'Chào bạn! Những peptide hoặc protein nào có khả năng cho phản ứng màu biuret?' }],
	'SIM-08': [{ role: 'ai', text: 'Chào bạn! Kim loại kiềm sodium phản ứng với nước tạo ra dung dịch gì và khí gì?' }],
	'SIM-09': [
		{ role: 'ai', text: 'Chào bạn! Thí nghiệm sắt tác dụng với đồng(II) sulfate minh họa cho loại phản ứng nào?' },
	],
	'SIM-10': [{ role: 'ai', text: 'Chào bạn! Nhôm có phải kim loại phản ứng trực tiếp với dung dịch kiềm NaOH không?' }],
	'SIM-11': [
		{ role: 'ai', text: 'Chào bạn! Phản ứng nhiệt nhôm là phản ứng tỏa nhiệt cực mạnh dùng để làm gì trong thực tế?' },
	],
	'SIM-12': [
		{ role: 'ai', text: 'Chào bạn! Tại sao Fe(OH)₂ màu trắng xanh lại chuyển sang màu nâu đỏ khi để ngoài không khí?' },
	],
	'SIM-13': [
		{
			role: 'ai',
			text: 'Chào bạn! Khi điện phân dung dịch CuSO₄ bằng điện cực trơ, ion nào sẽ nhận electron ở cathode?',
		},
	],
	'SIM-14': [
		{
			role: 'ai',
			text: 'Chào bạn! Trong pin điện hóa Zn-Cu nhúng trong H₂SO₄ loãng, kim loại nào đóng vai trò anode (cực âm) và bị ăn mòn?',
		},
	],
	'SIM-15': [
		{
			role: 'ai',
			text: 'Chào bạn! Thí nghiệm bắn phá lá vàng của Rutherford đã chứng minh điều gì về cấu tạo nguyên tử?',
		},
	],
	default_physics: [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng thí nghiệm Vật lý! Hãy điều chỉnh các thanh trượt và đặt câu hỏi cho mình nếu có thắc mắc nhé.',
		},
	],
	'SIM-02': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng thí nghiệm Ném xiên! Ở góc 45°, bạn gần đạt tầm xa tối đa. Bạn nghĩ điều gì xảy ra nếu tăng góc lên 60°?',
		},
	],
	'SIM-21': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng chuyển động thẳng đều và biến đổi đều! Hãy thay đổi vận tốc đầu v₀ và gia tốc a để quan sát sự thay đổi trên đồ thị v-t và x-t.',
		},
	],
	'SIM-22': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng thí nghiệm Sự rơi tự do! Hãy điều chỉnh độ cao thả h và gia tốc g để quan sát hai vật có khối lượng khác nhau rơi tự do.',
		},
	],
	'SIM-23': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng thí nghiệm Ném ngang! Hãy điều chỉnh độ cao thả h và vận tốc đầu v₀ để quan sát tầm xa lý thuyết.' }
	],
	'SIM-24': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng định luật II Newton! Gia tốc xe thay đổi thế nào khi lực kéo F tăng hoặc khối lượng xe m tăng?' }
	],
	'SIM-25': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng chuyển động trên mặt phẳng nghiêng! Hãy điều chỉnh góc nghiêng alpha và hệ số ma sát mu.' }
	],
	'SIM-26': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng con lắc lò xo nằm ngang! Hãy thay đổi độ cứng lò xo k và khối lượng m để xem đồ thị năng lượng.' }
	],
	'SIM-27': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng con lắc đơn dao động! Tần số dao động có phụ thuộc vào khối lượng quả nặng không?' }
	],
	'SIM-28': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng chuyển động tròn đều! Lực hướng tâm và tốc độ dài thay đổi thế nào khi thay đổi bán kính r?' }
	],
	'SIM-29': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng va chạm 1D! Hãy thay đổi độ đàn hồi e để so sánh va chạm đàn hồi (e=1) và va chạm mềm (e=0).' }
	],
	'SIM-30': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng bảo toàn cơ năng trên máng cong! Thế năng và động năng chuyển hóa thế nào khi vật chuyển động?' }
	],
	default_math: [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Toán học! Hãy điều chỉnh các tham số và đặt câu hỏi cho mình nếu cần trợ giúp nhé.',
		},
	],
	'SIM-08-math': [
		{
			role: 'ai',
			text: 'Chào bạn! Chúng ta cùng khảo sát đồ thị hàm số bậc hai y = ax² + bx + c. Bạn có biết khi a > 0 thì bề lõm quay lên hay quay xuống không?',
		},
	],
	'SIM-16': [
		{
			role: 'ai',
			text: 'Chào bạn! Thí nghiệm kết hợp giữa toán parabol và ném xiên vật lý. Bạn cần chọn góc alpha và vận tốc v0 sao cho quả bóng bay qua khớp hoàn hảo với vòm cổng đá. Hãy thử xem!',
		},
	],
	'SIM-17': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng miền nghiệm hệ bất phương trình! Vùng màu đậm nhất thể hiện điều gì?',
		},
	],
	'SIM-18': [
		{
			role: 'ai',
			text: 'Chào bạn! Chúng ta sẽ dùng hệ thức lượng trong tam giác để đo chiều cao cột cờ. Công thức tính chiều cao H từ khoảng cách a, chiều cao mắt h0 và góc nâng alpha là gì?',
		},
	],
	'SIM-19': [
		{
			role: 'ai',
			text: 'Chào bạn! Hãy khám phá cách vẽ elip bằng ghim đinh và vòng dây. Tổng khoảng cách từ điểm M đến hai tiêu điểm F1 và F2 có đặc điểm gì?',
		},
	],
	'SIM-20': [
		{
			role: 'ai',
			text: 'Chào bạn! Chúng ta cùng tìm hiểu các số đặc trưng đo xu thế trung tâm và độ phân tán. Bạn có thể tự nhập dữ liệu số liệu của lớp mình vào ô nhập liệu nhé.',
		},
	],
};

// ── Quiz data ──
export const LAB_QUIZZES = {
	'SIM-01': {
		q: 'Vai trò chính của dung dịch H₂SO₄ đặc trong phản ứng ester hóa là gì?',
		opts: [
			{ k: 'a', t: 'Làm chất xúc tác' },
			{ k: 'b', t: 'Hút nước dịch chuyển cân bằng' },
			{ k: 'c', t: 'Vừa làm xúc tác vừa hút nước' },
		],
		correct: 'c',
	},
	'SIM-03': {
		q: 'Vai trò chính của dung dịch NaCl bão hòa được thêm vào ở bước 5 là gì?',
		opts: [
			{ k: 'a', t: 'Làm chất xúc tác cho phản ứng' },
			{ k: 'b', t: 'Làm giảm độ tan của xà phòng để muối natri tách ra và nổi lên' },
			{ k: 'c', t: 'Hòa tan hoàn toàn glixerol giải phóng' },
		],
		correct: 'b',
	},
	'SIM-04': {
		q: 'Phản ứng của glucose với Cu(OH)₂ ở nhiệt độ thường chứng minh glucose có cấu tạo nào?',
		opts: [
			{ k: 'a', t: 'Có nhiều nhóm hydroxy (–OH) kề nhau' },
			{ k: 'b', t: 'Có nhóm chức aldehyde (–CHO)' },
			{ k: 'c', t: 'Có liên kết ester' },
		],
		correct: 'a',
	},
	'SIM-05': {
		q: 'Nhóm chức nào của glucose chịu trách nhiệm cho phản ứng tráng bạc?',
		opts: [
			{ k: 'a', t: 'Nhóm aldehyde (–CHO)' },
			{ k: 'b', t: 'Nhóm hydroxy (–OH)' },
			{ k: 'c', t: 'Nhóm carboxylic (–COOH)' },
		],
		correct: 'a',
	},
	'SIM-06': {
		q: 'Tại sao khi đun nóng ống nghiệm chứa hồ tinh bột và iodine thì dung dịch lại mất màu?',
		opts: [
			{ k: 'a', t: 'Iodine bị thăng hoa bay ra ngoài hoàn toàn' },
			{ k: 'b', t: 'Cấu trúc xoắn duỗi ra, giải phóng các phân tử iodine' },
			{ k: 'c', t: 'Iodine phản ứng tạo chất mới không màu' },
		],
		correct: 'b',
	},
	'SIM-07': {
		q: 'Chất nào sau đây KHÔNG cho phản ứng màu biuret với Cu(OH)₂ trong môi trường kiềm?',
		opts: [
			{ k: 'a', t: 'Lòng trắng trứng (albumin)' },
			{ k: 'b', t: 'Dipeptide Gly-Ala' },
			{ k: 'c', t: 'Tripeptide Gly-Ala-Val' },
		],
		correct: 'b',
	},
	'SIM-08': {
		q: 'Hiện tượng nào sau đây KHÔNG xảy ra khi cho mẩu sodium nhỏ vào chậu nước có phenolphthalein?',
		opts: [
			{ k: 'a', t: 'Mẩu sodium chìm xuống đáy chậu và tan dần' },
			{ k: 'b', t: 'Mẩu sodium nóng chảy thành giọt tròn chạy trên mặt nước' },
			{ k: 'c', t: 'Dung dịch chuyển sang màu hồng' },
		],
		correct: 'a',
	},
	'SIM-09': {
		q: 'Bản chất của phản ứng giữa đinh sắt và dung dịch CuSO₄ là gì?',
		opts: [
			{ k: 'a', t: 'Phản ứng trao đổi ion' },
			{ k: 'b', t: 'Phản ứng oxi hóa - khử, Fe khử Cu²⁺' },
			{ k: 'c', t: 'Phản ứng phân hủy' },
		],
		correct: 'b',
	},
	'SIM-10': {
		q: 'Tại sao không dùng các xô chậu bằng nhôm để đựng dung dịch kiềm?',
		opts: [
			{ k: 'a', t: 'Vì nhôm phản ứng trực tiếp với khí oxi trong kiềm' },
			{ k: 'b', t: 'Vì dung dịch kiềm hòa tan lớp màng bảo vệ Al₂O₃ và sau đó ăn mòn nhôm' },
			{ k: 'c', t: 'Vì nhôm bị oxi hóa tạo thành muối không tan gây hỏng chậu' },
		],
		correct: 'b',
	},
	'SIM-11': {
		q: 'Trong phản ứng nhiệt nhôm giữa Al và Fe₂O₃, vai trò của Al là gì?',
		opts: [
			{ k: 'a', t: 'Chất oxi hóa' },
			{ k: 'b', t: 'Chất khử' },
			{ k: 'c', t: 'Chất xúc tác' },
		],
		correct: 'b',
	},
	'SIM-12': {
		q: 'Phản ứng chuyển màu của Fe(OH)₂ ngoài không khí ẩm thuộc loại phản ứng nào?',
		opts: [
			{ k: 'a', t: 'Phản ứng trao đổi' },
			{ k: 'b', t: 'Phản ứng oxi hóa - khử, Fe(II) bị oxi hóa lên Fe(III)' },
			{ k: 'c', t: 'Phản ứng phân hủy' },
		],
		correct: 'b',
	},
	'SIM-13': {
		q: 'Sản phẩm thu được ở anode (cực dương) khi điện phân dung dịch CuSO₄ với điện cực trơ là gì?',
		opts: [
			{ k: 'a', t: 'Kim loại Cu' },
			{ k: 'b', t: 'Khí O₂ và ion H⁺' },
			{ k: 'c', t: 'Khí SO₂' },
		],
		correct: 'b',
	},
	'SIM-14': {
		q: 'Khi nối hai thanh Zn và Cu bằng dây dẫn trong cốc chứa dung dịch H₂SO₄ loãng, electron di chuyển như thế nào?',
		opts: [
			{ k: 'a', t: 'Từ thanh Cu sang thanh Zn qua dây dẫn' },
			{ k: 'b', t: 'Từ thanh Zn sang thanh Cu qua dây dẫn' },
			{ k: 'c', t: 'Không có sự di chuyển electron qua dây dẫn' },
		],
		correct: 'b',
	},
	'SIM-15': {
		q: 'Tại sao phần lớn các hạt alpha lại xuyên thẳng qua lá vàng mà không bị lệch hướng?',
		opts: [
			{ k: 'a', t: 'Vì hạt alpha không mang điện tích' },
			{ k: 'b', t: 'Vì lá vàng rất mỏng và nguyên tử có cấu tạo chủ yếu là không gian rỗng' },
			{ k: 'c', t: 'Vì hạt nhân nguyên tử vàng mang điện tích âm' },
		],
		correct: 'b',
	},
	default_physics: {
		q: 'Bỏ qua sức cản không khí, góc ném nào cho tầm xa tối đa?',
		opts: [
			{ k: 'a', t: '30°' },
			{ k: 'b', t: '45°' },
			{ k: 'c', t: '75°' },
		],
		correct: 'b',
	},
	'SIM-02': {
		q: 'Bỏ qua sức cản không khí, góc ném nào cho tầm xa tối đa?',
		opts: [
			{ k: 'a', t: '30°' },
			{ k: 'b', t: '45°' },
			{ k: 'c', t: '75°' },
		],
		correct: 'b',
	},
	'SIM-21': {
		q: 'Trong chuyển động thẳng biến đổi đều, khi gia tốc a cùng chiều với vận tốc v (a·v > 0) thì chuyển động là:',
		opts: [
			{ k: 'a', t: 'Nhanh dần đều' },
			{ k: 'b', t: 'Chậm dần đều' },
			{ k: 'c', t: 'Thẳng đều' },
		],
		correct: 'a',
	},
	'SIM-22': {
		q: 'Nếu bỏ qua sức cản của không khí, hai vật có khối lượng khác nhau được thả rơi tự do từ cùng một độ cao sẽ:',
		opts: [
			{ k: 'a', t: 'Vật nặng hơn chạm đất trước' },
			{ k: 'b', t: 'Vật nhẹ hơn chạm đất trước' },
			{ k: 'c', t: 'Cả hai vật chạm đất cùng một lúc' },
		],
		correct: 'c',
	},
	'SIM-23': {
		q: 'Trong chuyển động ném ngang, thời gian rơi của vật phụ thuộc vào yếu tố nào?',
		opts: [
			{ k: 'a', t: 'Chì phụ thuộc vào độ cao thả vật h' },
			{ k: 'b', t: 'Chỉ phụ thuộc vào vận tốc đầu v₀' },
			{ k: 'c', t: 'Phụ thuộc vào cả h và v₀' }
		],
		correct: 'a'
	},
	'SIM-24': {
		q: 'Theo định luật II Newton, gia tốc của vật tỉ lệ thuận với lực tác dụng và tỉ lệ nghịch với khối lượng của vật:',
		opts: [
			{ k: 'a', t: 'Đúng' },
			{ k: 'b', t: 'Sai' }
		],
		correct: 'a'
	},
	'SIM-25': {
		q: 'Điều kiện để vật trượt xuống trên mặt phẳng nghiêng có góc nghiêng alpha và hệ số ma sát mu là:',
		opts: [
			{ k: 'a', t: 'tan(alpha) > mu' },
			{ k: 'b', t: 'tan(alpha) < mu' },
			{ k: 'c', t: 'sin(alpha) < mu' }
		],
		correct: 'a'
	},
	'SIM-26': {
		q: 'Chu kỳ dao động điều hòa của con lắc lò xo nằm ngang phụ thuộc vào:',
		opts: [
			{ k: 'a', t: 'Độ cứng lò xo k và khối lượng m của vật' },
			{ k: 'b', t: 'Gia tốc trọng trường g' },
			{ k: 'c', t: 'Biên độ dao động A' }
		],
		correct: 'a'
	},
	'SIM-27': {
		q: 'Một con lắc đơn dao động điều hòa, nếu tăng chiều dài dây treo lên 4 lần thì chu kỳ dao động sẽ:',
		opts: [
			{ k: 'a', t: 'Tăng lên 2 lần' },
			{ k: 'b', t: 'Giảm đi 2 lần' },
			{ k: 'c', t: 'Tăng lên 4 lần' }
		],
		correct: 'a'
	},
	'SIM-28': {
		q: 'Lực hướng tâm trong chuyển động tròn đều có tác dụng gì?',
		opts: [
			{ k: 'a', t: 'Chỉ làm thay đổi hướng của vận tốc, giữ vật trên quỹ đạo tròn' },
			{ k: 'b', t: 'Làm thay đổi tốc độ dài của vật' },
			{ k: 'c', t: 'Làm vật chuyển động ra xa tâm' }
		],
		correct: 'a'
	},
	'SIM-29': {
		q: 'Trong va chạm mềm (e = 0) giữa hai vật chuyển động trên một đường thẳng, đại lượng nào sau đây được bảo toàn?',
		opts: [
			{ k: 'a', t: 'Chỉ động lượng' },
			{ k: 'b', t: 'Chỉ động năng' },
			{ k: 'c', t: 'Cả động lượng và động năng' }
		],
		correct: 'a'
	},
	'SIM-30': {
		q: 'Một vật trượt không ma sát từ đỉnh xuống chân máng cong, trong quá trình trượt có sự chuyển hóa năng lượng như thế nào?',
		opts: [
			{ k: 'a', t: 'Thế năng chuyển hóa thành động năng, cơ năng bảo toàn' },
			{ k: 'b', t: 'Động năng chuyển hóa thành thế năng' },
			{ k: 'c', t: 'Thế năng hao hụt do ma sát tỏa nhiệt' }
		],
		correct: 'a'
	},
	default_math: {
		q: 'Nghiệm của y = x² − 2x − 3 là?',
		opts: [
			{ k: 'a', t: 'x = −1 và x = 3' },
			{ k: 'b', t: 'x = 1 và x = −3' },
			{ k: 'c', t: 'x = 0 và x = 3' },
		],
		correct: 'a',
	},
	'SIM-08-math': {
		q: 'Tọa độ đỉnh I của đồ thị hàm số bậc hai y = ax² + bx + c được tính theo công thức nào?',
		opts: [
			{ k: 'a', t: 'I(-b/(2a); -delta/(4a))' },
			{ k: 'b', t: 'I(-b/a; -delta/(2a))' },
			{ k: 'c', t: 'I(b/(2a); delta/(4a))' },
		],
		correct: 'a',
	},
	'SIM-16': {
		q: 'Bỏ qua sức cản không khí, quỹ đạo chuyển động ném xiên là một đường gì?',
		opts: [
			{ k: 'a', t: 'Đường thẳng đứng' },
			{ k: 'b', t: 'Đường parabol' },
			{ k: 'c', t: 'Đường elip' },
		],
		correct: 'b',
	},
	'SIM-17': {
		q: 'Miền nghiệm của bất phương trình bậc nhất hai ẩn ax + by <= c là nửa mặt phẳng như thế nào?',
		opts: [
			{ k: 'a', t: 'Có bờ là đường thẳng ax + by = c' },
			{ k: 'b', t: 'Không chứa đường thẳng bờ' },
			{ k: 'c', t: 'Không xác định được bờ' },
		],
		correct: 'a',
	},
	'SIM-18': {
		q: 'Trong tam giác vuông, cạnh đối diện góc nhọn alpha được tính bằng:',
		opts: [
			{ k: 'a', t: 'Cạnh kề nhân với sin(alpha)' },
			{ k: 'b', t: 'Cạnh kề nhân với tan(alpha)' },
			{ k: 'c', t: 'Cạnh huyền nhân với tan(alpha)' },
		],
		correct: 'b',
	},
	'SIM-19': {
		q: 'Cho elip có phương trình chính tắc x²/a² + y²/b² = 1 (a > b > 0). Mối liên hệ giữa a, b và nửa tiêu cự c là:',
		opts: [
			{ k: 'a', t: 'a² = b² + c²' },
			{ k: 'b', t: 'b² = a² + c²' },
			{ k: 'c', t: 'c² = a² + b²' },
		],
		correct: 'a',
	},
	'SIM-20': {
		q: 'Khoảng tứ phân vị IQR được tính theo công thức nào?',
		opts: [
			{ k: 'a', t: 'IQR = Q2 - Q1' },
			{ k: 'b', t: 'IQR = Q3 - Q1' },
			{ k: 'c', t: 'IQR = Q3 - Q2' },
		],
		correct: 'b',
	},
};

// ── Chem steps ──
const LAB_CHEM_STEPS = {
	'SIM-01': [
		{ n: 1, title: 'Thêm C₂H₅OH', sub: 'Rót 1 ml ethanol vào ống nghiệm' },
		{ n: 2, title: 'Thêm CH₃COOH', sub: 'Rót tiếp 1 ml acetic acid' },
		{ n: 3, title: 'Thêm H₂SO₄ đặc', sub: 'Nhỏ vài giọt axit làm xúc tác' },
		{ n: 4, title: 'Lắp ống nghiệm', sub: 'Kéo ống nghiệm lên giá đỡ đèn cồn' },
		{ n: 5, title: 'Đun nóng hỗn hợp', sub: 'Châm lửa đèn cồn để đun nhẹ' },
		{ n: 6, title: 'Quan sát lớp ester', sub: 'Sản phẩm có mùi thơm nổi lên trên' },
	],
	'SIM-03': [
		{ n: 1, title: 'Thêm dầu ăn', sub: 'Rót 1 ml dầu ăn vào cốc thủy tinh' },
		{ n: 2, title: 'Thêm dung dịch NaOH', sub: 'Rót tiếp 3 ml dung dịch NaOH 40%' },
		{ n: 3, title: 'Đun nóng hỗn hợp', sub: 'Châm lửa đèn cồn để đun sôi sủi bọt' },
		{ n: 4, title: 'Khuấy đều bằng đũa', sub: 'Dùng đũa thủy tinh khuấy đều xoay tròn' },
		{ n: 5, title: 'Thêm NaCl bão hòa', sub: 'Rót thêm 5 ml dung dịch NaCl bão hòa nóng' },
		{ n: 6, title: 'Quan sát xà phòng', sub: 'Lớp xà phòng rắn màu trắng nổi lên trên' },
	],
	'SIM-04': [
		{ n: 1, title: 'Thêm NaOH', sub: 'Rót 1 ml dung dịch NaOH 10%' },
		{ n: 2, title: 'Thêm CuSO₄', sub: 'Nhỏ vài giọt CuSO₄ 5% tạo kết tủa xanh' },
		{ n: 3, title: 'Thêm Glucose', sub: 'Thêm 2 ml dung dịch glucose 5%' },
		{ n: 4, title: 'Lắc ống nghiệm', sub: 'Nhấp ống nghiệm để lắc đều hòa tan kết tủa' },
		{ n: 5, title: 'Lắp ống nghiệm', sub: 'Kéo ống nghiệm lên giá đỡ đèn cồn' },
		{ n: 6, title: 'Đun nóng nhẹ', sub: 'Châm lửa đèn cồn để đun nóng phần trên' },
		{ n: 7, title: 'Quan sát kết tủa', sub: 'Kết tủa đỏ gạch Cu₂O xuất hiện' },
	],
	'SIM-05': [
		{ n: 1, title: 'Thêm AgNO₃', sub: 'Rót 1 ml dung dịch AgNO₃ 1% vào ống nghiệm' },
		{ n: 2, title: 'Thêm NH₃', sub: 'Nhỏ từ từ NH₃ tạo phức tan' },
		{ n: 3, title: 'Thêm Glucose', sub: 'Rót tiếp 1 ml dung dịch glucose 5%' },
		{ n: 4, title: 'Cách thủy', sub: 'Đặt ống nghiệm vào cốc nước nóng' },
		{ n: 5, title: 'Quan sát tráng bạc', sub: 'Lớp bạc sáng bám lên thành ống' },
	],
	'SIM-06': [
		{ n: 1, title: 'Thêm tinh bột', sub: 'Rót 2 ml hồ tinh bột vào ống nghiệm' },
		{ n: 2, title: 'Thêm iodine', sub: 'Nhỏ vài giọt dung dịch iodine' },
		{ n: 3, title: 'Lắp ống nghiệm', sub: 'Kéo ống nghiệm lên giá đỡ đèn cồn' },
		{ n: 4, title: 'Đun nóng', sub: 'Châm lửa đèn cồn để đun nhẹ' },
		{ n: 5, title: 'Để nguội', sub: 'Tắt đèn để nguội và quan sát màu sắc' },
	],
	'SIM-07': [
		{ n: 1, title: 'Lòng trắng trứng', sub: 'Rót 1 ml dung dịch lòng trắng trứng' },
		{ n: 2, title: 'Thêm NaOH', sub: 'Thêm 1 ml dung dịch NaOH 30%' },
		{ n: 3, title: 'Thêm CuSO₄', sub: 'Nhỏ vài giọt dung dịch CuSO₄ 2%' },
		{ n: 4, title: 'Lắc đều', sub: 'Nhấp ống nghiệm lắc đều tạo màu tím' },
	],
	'SIM-08': [
		{ n: 1, title: 'Phenolphthalein', sub: 'Nhỏ vài giọt phenolphthalein vào chậu nước' },
		{ n: 2, title: 'Thả Sodium', sub: 'Gắp mẩu Na thả vào chậu nước' },
		{ n: 3, title: 'Quan sát màu hồng', sub: 'Dung dịch chuyển hồng do tạo base' },
	],
	'SIM-09': [
		{ n: 1, title: 'Thêm CuSO₄', sub: 'Rót dung dịch CuSO₄ màu xanh vào ống nghiệm' },
		{ n: 2, title: 'Thả đinh sắt', sub: 'Thả đinh sắt vào ống nghiệm CuSO₄' },
		{ n: 3, title: 'Quan sát đinh', sub: 'Lớp đồng đỏ bám trên đinh sắt' },
	],
	'SIM-10': [
		{ n: 1, title: 'Thêm NaOH', sub: 'Rót 2 ml dung dịch NaOH đặc vào ống' },
		{ n: 2, title: 'Thả mảnh Al', sub: 'Thả vài mảnh nhôm vào ống nghiệm' },
		{ n: 3, title: 'Quan sát khí', sub: 'Khí thoát ra mạnh, nhôm tan dần' },
	],
	'SIM-11': [
		{ n: 1, title: 'Thêm Fe₂O₃', sub: 'Đổ bột Fe₂O₃ vào chén sứ' },
		{ n: 2, title: 'Thêm Al', sub: 'Đổ tiếp bột Al và trộn đều tecmit' },
		{ n: 3, title: 'Cắm dải Mg', sub: 'Cắm dải băng Mg làm mồi lửa' },
		{ n: 4, title: 'Châm lửa Mg', sub: 'Nhấp chén sứ để châm lửa dải Mg' },
		{ n: 5, title: 'Quan sát sắt lỏng', sub: 'Sắt nóng chảy chảy xuống khay cát' },
	],
	'SIM-12': [
		{ n: 1, title: 'Rót FeCl₂', sub: 'Rót dung dịch FeCl₂ vào ống 1' },
		{ n: 2, title: 'Rót FeCl₃', sub: 'Rót dung dịch FeCl₃ vào ống 2' },
		{ n: 3, title: 'Thêm NaOH vào ống 1', sub: 'Tạo kết tủa trắng xanh Fe(OH)₂' },
		{ n: 4, title: 'Thêm NaOH vào ống 2', sub: 'Tạo kết tủa nâu đỏ Fe(OH)₃' },
		{ n: 5, title: 'Để ngoài không khí', sub: 'Kết tủa trắng xanh hóa nâu đỏ dần' },
	],
	'SIM-13': [
		{ n: 1, title: 'Rót CuSO₄', sub: 'Rót dung dịch CuSO₄ vào bình điện phân' },
		{ n: 2, title: 'Mở nguồn điện', sub: 'Nhấp nút đỏ trên nguồn điện' },
		{ n: 3, title: 'Quan sát điện cực', sub: 'Cu bám cực âm, O₂ sủi cực dương' },
	],
	'SIM-14': [
		{ n: 1, title: 'Thêm H₂SO₄', sub: 'Rót dung dịch H₂SO₄ loãng vào cốc' },
		{ n: 2, title: 'Chưa nối dây', sub: 'Bọt khí chỉ thoát ra ở thanh Zn' },
		{ n: 3, title: 'Bật công tắc', sub: 'Nối hai thanh Zn và Cu bằng dây dẫn' },
		{ n: 4, title: 'Quan sát điện hóa', sub: 'Đèn sáng, khí thoát ra ở thanh Cu' },
	],
	'SIM-15': [
		{ n: 1, title: 'Gắn lá vàng', sub: 'Kéo lá vàng gắn vào giá đỡ tâm màn' },
		{ n: 2, title: 'Bắn hạt alpha', sub: 'Nhấp nguồn phóng xạ bắn chùm hạt α' },
		{ n: 3, title: 'Hạt đi thẳng', sub: 'Hầu hết hạt α đi thẳng qua lá vàng' },
		{ n: 4, title: 'Hạt lệch hướng', sub: 'Một số ít hạt bị lệch hoặc bật ngược' },
		{ n: 5, title: 'Kính hiển vi', sub: 'Nhấp kính hiển vi để phóng to nguyên tử' },
		{ n: 6, title: 'Xem va chạm', sub: 'Hạt α phản xạ khi chạm hạt nhân nguyên tử' },
	],
};

const getChemObservations = (simId: string, chemStep: number) => {
	switch (simId) {
		case 'SIM-03':
			return [
				{ key: 1, label: 'Dung dịch sôi sủi bọt tăm', active: chemStep >= 4 },
				{ key: 2, label: 'Đũa khuấy đều hỗn hợp', active: chemStep >= 5 },
				{ key: 3, label: 'Lớp bánh xà phòng nổi lên trên', active: chemStep >= 7 },
			];
		case 'SIM-04':
			return [
				{ key: 1, label: 'Xuất hiện kết tủa xanh Cu(OH)₂', active: chemStep >= 3 },
				{ key: 2, label: 'Dung dịch xanh lam thẫm phức glucose-đồng', active: chemStep >= 5 },
				{ key: 3, label: 'Kết tủa đỏ gạch Cu₂O khi đun nóng', active: chemStep >= 7 },
			];
		case 'SIM-05':
			return [
				{ key: 1, label: 'Tạo kết tủa rồi tan hết trong NH₃', active: chemStep >= 3 },
				{ key: 2, label: 'Ống nghiệm đặt cách thủy nước nóng', active: chemStep >= 5 },
				{ key: 3, label: 'Lớp bạc sáng bóng bám lên thành ống', active: chemStep >= 6 },
			];
		case 'SIM-06':
			return [
				{ key: 1, label: 'Hồ tinh bột chuyển màu xanh tím', active: chemStep >= 3 },
				{ key: 2, label: 'Dung dịch mất màu khi đun nóng', active: chemStep >= 5 },
				{ key: 3, label: 'Màu xanh tím hiện lại khi nguội', active: chemStep >= 6 },
			];
		case 'SIM-07':
			return [
				{ key: 1, label: 'Tạo kết tủa Cu(OH)₂ xanh lam', active: chemStep >= 4 },
				{ key: 2, label: 'Lắc đều để chất phản ứng', active: chemStep >= 5 },
				{ key: 3, label: 'Xuất hiện phức màu tím biuret đặc trưng', active: chemStep >= 5 },
			];
		case 'SIM-08':
			return [
				{ key: 1, label: 'Mẩu Na nóng chảy chạy trên mặt nước', active: chemStep >= 3 },
				{ key: 2, label: 'Phản ứng sủi bọt khí H₂ và có khói', active: chemStep >= 3 },
				{ key: 3, label: 'Nước hóa màu hồng do dung dịch kiềm', active: chemStep >= 4 },
			];
		case 'SIM-09':
			return [
				{ key: 1, label: 'Đinh sắt ngập trong dung dịch CuSO₄', active: chemStep >= 3 },
				{ key: 2, label: 'Lớp đồng đỏ bám phủ ngoài đinh', active: chemStep >= 4 },
				{ key: 3, label: 'Màu xanh lam nhạt dần', active: chemStep >= 4 },
			];
		case 'SIM-10':
			return [
				{ key: 1, label: 'Mảnh nhôm sủi bọt khí H₂ mạnh', active: chemStep >= 3 },
				{ key: 2, label: 'Ống nghiệm tỏa nhiệt và sinh hơi nước', active: chemStep >= 3 },
				{ key: 3, label: 'Mảnh nhôm tan hoàn toàn trong kiềm', active: chemStep >= 4 },
			];
		case 'SIM-11':
			return [
				{ key: 1, label: 'Dải Mg làm mồi cháy sáng chói', active: chemStep >= 5 },
				{ key: 2, label: 'Phản ứng tỏa nhiệt mạnh sinh tia lửa', active: chemStep >= 5 },
				{ key: 3, label: 'Sắt nóng chảy sáng rực chảy xuống cát', active: chemStep >= 6 },
			];
		case 'SIM-12':
			return [
				{ key: 1, label: 'Ống 1: Kết tủa trắng xanh Fe(OH)₂', active: chemStep >= 4 },
				{ key: 2, label: 'Ống 2: Kết tủa nâu đỏ Fe(OH)₃', active: chemStep >= 5 },
				{ key: 3, label: 'Ống 1: Kết tủa chuyển nâu đỏ ngoài O₂', active: chemStep >= 6 },
			];
		case 'SIM-13':
			return [
				{ key: 1, label: 'Cathode (cực âm): Đồng đỏ bám vào', active: chemStep >= 3 },
				{ key: 2, label: 'Anode (cực dương): Khí O₂ sủi bọt', active: chemStep >= 3 },
				{ key: 3, label: 'Màu xanh của CuSO₄ nhạt dần', active: chemStep >= 3 },
			];
		case 'SIM-14':
			return [
				{ key: 1, label: 'Chưa nối dây: Khí chỉ sủi ở thanh Zn', active: chemStep >= 2 },
				{ key: 2, label: 'Nối dây: Đèn LED sáng lên', active: chemStep >= 4 },
				{ key: 3, label: 'Nối dây: Khí thoát ra mạnh ở thanh Cu', active: chemStep >= 4 },
			];
		case 'SIM-15':
			return [
				{ key: 1, label: 'Chùm hạt alpha bắn phá lá vàng', active: chemStep >= 3 },
				{ key: 2, label: 'Hầu hết chớp sáng thẳng hàng', active: chemStep >= 4 },
				{ key: 3, label: 'Hạt lệch hướng hoặc bật ngược va hạt nhân', active: chemStep >= 5 },
			];
		default:
			return [
				{ key: 1, label: 'Dung dịch sủi bọt khí (H₂SO₄)', active: chemStep >= 4 },
				{ key: 2, label: 'Sôi nhẹ & bốc hơi nước', active: chemStep >= 6 },
				{ key: 3, label: 'Lớp ester mùi thơm tách lớp', active: chemStep >= 7 },
			];
	}
};

const renderTex = (tex: string) => {
	if (typeof window !== 'undefined' && (window as any).katex) {
		try {
			return { __html: (window as any).katex.renderToString(tex, { throwOnError: false, displayMode: false }) };
		} catch (e) {
			return { __html: tex.replace(/[\\{}]/g, '') };
		}
	}
	return { __html: tex.replace(/[\\{}]/g, '') };
};

const getTrackStyle = (val: number, min: number, max: number, accent: string) => {
	const pct = ((val - min) / (max - min)) * 100;
	return {
		background: `linear-gradient(90deg, ${accent} 0%, ${accent} ${pct}%, #e6e8f2 ${pct}%, #e6e8f2 100%)`,
	};
};

const Workspace: React.FC = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const subject = (params.get('subject') || 'physics') as SubjectKey;
	const simId = params.get('sim') || (subject === 'chem' ? 'SIM-01' : subject === 'physics' ? 'SIM-02' : '');
	const metaKey = [
		'SIM-01',
		'SIM-02',
		'SIM-03',
		'SIM-04',
		'SIM-05',
		'SIM-06',
		'SIM-07',
		'SIM-08',
		'SIM-09',
		'SIM-10',
		'SIM-11',
		'SIM-12',
		'SIM-13',
		'SIM-14',
		'SIM-15',
		'SIM-16',
		'SIM-17',
		'SIM-18',
		'SIM-19',
		'SIM-20',
		'SIM-21',
		'SIM-22',
		'SIM-23',
		'SIM-24',
		'SIM-25',
		'SIM-26',
		'SIM-27',
		'SIM-28',
		'SIM-29',
		'SIM-30',
	].includes(simId)
		? simId === 'SIM-08' && subject === 'math'
			? 'SIM-08-math'
			: simId
		: `default_${subject}`;
	const meta = LAB_META[metaKey as keyof typeof LAB_META] || LAB_META.default_physics;

	// Physics params
	const [phAngle, setPhAngle] = useState(45);
	const [phVel, setPhVel] = useState(20);
	const [phGrav, setPhGrav] = useState(9.8);
	const [phAir, setPhAir] = useState(false);
	const [phVec, setPhVec] = useState(true);
	const [isPhPlaying, setIsPhPlaying] = useState(false);
	const [isPhSlow, setIsPhSlow] = useState(false);

	// SIM-21 Kinematics
	const [kinV0, setKinV0] = useState(3);
	const [kinA, setKinA] = useState(1);
	const [liveT, setLiveT] = useState(0);
	const [liveX, setLiveX] = useState(0);
	const [liveV, setLiveV] = useState(3);
	const [physResetKey, setPhysResetKey] = useState(0);

	// SIM-22 Freefall
	const [freefallH, setFreefallH] = useState(9);
	const [freefallG, setFreefallG] = useState(9.8);

	// SIM-23 Horizontal Projectile
	const [horizH, setHorizH] = useState(8);
	const [horizV0, setHorizV0] = useState(5);

	// SIM-24 Newton 2
	const [newtonF, setNewtonF] = useState(2);
	const [newtonM, setNewtonM] = useState(1);
	const [newtonMu, setNewtonMu] = useState(0.1);

	// SIM-25 Incline
	const [inclineAlpha, setInclineAlpha] = useState(30);
	const [inclineMu, setInclineMu] = useState(0.2);
	const [inclineM, setInclineM] = useState(1);

	// SIM-26 Spring
	const [springK, setSpringK] = useState(50);
	const [springM, setSpringM] = useState(1);
	const [springA, setSpringA] = useState(2);

	// SIM-27 Pendulum
	const [pendulumL, setPendulumL] = useState(4);
	const [pendulumG, setPendulumG] = useState(9.8);
	const [pendulumTh, setPendulumTh] = useState(20);

	// SIM-28 Circular
	const [circularR, setCircularR] = useState(3);
	const [circularW, setCircularW] = useState(1.5);
	const [circularM, setCircularM] = useState(1);

	// SIM-29 Collision
	const [collisionM1, setCollisionM1] = useState(2);
	const [collisionV1, setCollisionV1] = useState(3);
	const [collisionM2, setCollisionM2] = useState(3);
	const [collisionV2, setCollisionV2] = useState(-1);
	const [collisionE, setCollisionE] = useState(1);

	// SIM-30 Energy
	const [energyH0, setEnergyH0] = useState(6);
	const [energyM, setEnergyM] = useState(1);

	// Math params
	const [mA, setMA] = useState(1);
	const [mB, setMB] = useState(-2);
	const [mC, setMC] = useState(-3);

	// SIM-16 (Projectile Arch)
	const [mAngle, setMAngle] = useState(45);
	const [mVel, setMVel] = useState(15);
	const [mGrav, setMGrav] = useState(9.8);
	const [isMPlaying, setIsMPlaying] = useState(false);

	// SIM-17 (Inequalities)
	const [inA1, setInA1] = useState(1);
	const [inB1, setInB1] = useState(1);
	const [inC1, setInC1] = useState(2);
	const [inA2, setInA2] = useState(-1);
	const [inB2, setInB2] = useState(2);
	const [inC2, setInC2] = useState(4);
	const [showM1, setShowM1] = useState(true);
	const [showM2, setShowM2] = useState(true);

	// SIM-18 (Triangulation)
	const [triA, setTriA] = useState(10);
	const [triAlpha, setTriAlpha] = useState(45);
	const [triH0, setTriH0] = useState(1.5);

	// SIM-19 (Conic)
	const [conicC, setConicC] = useState(3);
	const [conicA, setConicA] = useState(5);
	const [isCPlaying, setIsCPlaying] = useState(false);

	// Chem params
	const [chemStep, setChemStep] = useState(1);

	// Chat
	const [activeRightTab, setActiveRightTab] = useState<'chat' | 'quiz'>('chat');
	const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => {
		const initial: Record<string, ChatMessage[]> = {
			default_physics: LAB_INITIAL_CHATS['default_physics'],
			default_math: LAB_INITIAL_CHATS['default_math'],
		};
		Object.keys(LAB_INITIAL_CHATS).forEach((k) => {
			initial[k] = LAB_INITIAL_CHATS[k];
		});
		return initial;
	});
	const [chatInput, setChatInput] = useState('');

	// Dynamic AI Quiz
	type DynQuestion = { q: string; opts: Array<{ k: string; t: string }>; correct: string; explanation: string };
	const [dynQuizState, setDynQuizState] = useState<'setup' | 'loading' | 'active' | 'done'>('setup');
	const [dynQuizCount, setDynQuizCount] = useState<3 | 5 | 10>(5);
	const [dynQuestions, setDynQuestions] = useState<DynQuestion[]>([]);
	const [dynCurrent, setDynCurrent] = useState(0);
	const [dynAnswers, setDynAnswers] = useState<Record<number, string>>({});
	const [dynUsedLlm, setDynUsedLlm] = useState(false);

	const startDynQuiz = useCallback(async () => {
		setDynQuizState('loading');
		setDynCurrent(0);
		setDynAnswers({});
		try {
			const res = await generateAiQuiz({
				simulationId: simId || 'default',
				subject,
				count: dynQuizCount,
			});
			const data = res?.data?.data;
			if (data?.questions?.length > 0) {
				setDynQuestions(data.questions);
				setDynUsedLlm(data.used_llm ?? false);
				setDynQuizState('active');
			} else {
				setDynQuizState('setup');
			}
		} catch {
			setDynQuizState('setup');
		}
	}, [simId, subject, dynQuizCount]);

	const pickDynAnswer = useCallback(
		(idx: number, key: string) => {
			if (dynAnswers[idx] !== undefined) return;
			setDynAnswers((prev) => ({ ...prev, [idx]: key }));
		},
		[dynAnswers],
	);

	const [printWithAnswers, setPrintWithAnswers] = useState(true);
	const [showPrintMenu, setShowPrintMenu] = useState(false);

	const triggerPrint = useCallback((withAnswers: boolean) => {
		setPrintWithAnswers(withAnswers);
		setShowPrintMenu(false);
		setTimeout(() => window.print(), 50);
	}, []);

	const resetDynQuiz = useCallback(() => {
		setDynQuizState('setup');
		setDynQuestions([]);
		setDynAnswers({});
		setDynCurrent(0);
	}, []);

	// ── Physics calculations ──
	const physicsCalc = useMemo(() => {
		const rad = (phAngle * Math.PI) / 180;
		const range = (phVel * phVel * Math.sin(2 * rad)) / phGrav;
		const maxH = Math.pow(phVel * Math.sin(rad), 2) / (2 * phGrav);
		const time = (2 * phVel * Math.sin(rad)) / phGrav;
		return { range: range.toFixed(1), maxH: maxH.toFixed(1), time: time.toFixed(1) };
	}, [phAngle, phVel, phGrav]);

	// ── Math calculations ──
	const mathCalc = useMemo(() => {
		const a = Math.abs(mA) < 0.1 ? (mA < 0 ? -0.1 : 0.1) : mA;
		const f = (x: number) => {
			const r = Math.round(x * 10) / 10;
			return Object.is(r, -0) ? 0 : r;
		};
		const vx = -mB / (2 * a);
		const vy = mC - (mB * mB) / (4 * a);
		const disc = mB * mB - 4 * a * mC;
		let roots = 'không có nghiệm thực';
		if (disc >= 0) {
			const sq = Math.sqrt(disc);
			const r1 = (-mB - sq) / (2 * a);
			const r2 = (-mB + sq) / (2 * a);
			roots = `x = ${f(Math.min(r1, r2))}, ${f(Math.max(r1, r2))}`;
		}
		return { vertex: `(${f(vx)}, ${f(vy)})`, roots, axis: `x = ${f(vx)}` };
	}, [mA, mB, mC]);

	// ── Chat ──
	const sendChat = useCallback(async () => {
		const t = chatInput.trim();
		if (!t) return;

		const currentHistory = chats[metaKey] || [];

		setChats((prev) => ({
			...prev,
			[metaKey]: [
				...currentHistory,
				{ role: 'user' as const, text: t },
				{ role: 'ai' as const, text: 'Trợ lý đang suy nghĩ...' },
			],
		}));
		setChatInput('');

		const context = currentHistory.map((m) => ({
			role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
			content: m.text,
		}));

		try {
			const gradeVal = subject === 'chem' ? 12 : subject === 'physics' ? 11 : 10;
			const res = await chatWithAiPrompt({
				message: t,
				subject,
				grade: gradeVal,
				simulationId: simId,
				context,
			});

			const aiReply = res?.data?.data?.answer || 'Trợ lý không phản hồi. Vui lòng đặt câu hỏi khác.';

			setChats((prev) => {
				const list = prev[metaKey] || [];
				if (list.length > 0) {
					const updated = [...list];
					updated[updated.length - 1] = { role: 'ai' as const, text: aiReply };
					return { ...prev, [metaKey]: updated };
				}
				return prev;
			});
		} catch (err) {
			console.error('Chat error:', err);
			setChats((prev) => {
				const list = prev[metaKey] || [];
				if (list.length > 0) {
					const updated = [...list];
					updated[updated.length - 1] = {
						role: 'ai' as const,
						text: 'Đã xảy ra lỗi kết nối với máy chủ AI. Vui lòng thử lại.',
					};
					return { ...prev, [metaKey]: updated };
				}
				return prev;
			});
		}
	}, [chatInput, metaKey, chats, subject, simId]);

	// ── Reset ──
	const resetParams = useCallback(() => {
		if (subject === 'physics') {
			if (simId === 'SIM-21') {
				setKinV0(3);
				setKinA(1);
				setLiveT(0);
				setLiveX(0);
				setLiveV(3);
			} else if (simId === 'SIM-22') {
				setFreefallH(9);
				setFreefallG(9.8);
				setLiveT(0);
				setLiveX(0);
				setLiveV(0);
			} else if (simId === 'SIM-23') {
				setHorizH(8);
				setHorizV0(5);
			} else if (simId === 'SIM-24') {
				setNewtonF(2);
				setNewtonM(1);
				setNewtonMu(0.1);
			} else if (simId === 'SIM-25') {
				setInclineAlpha(30);
				setInclineMu(0.2);
				setInclineM(1);
			} else if (simId === 'SIM-26') {
				setSpringK(50);
				setSpringM(1);
				setSpringA(2);
			} else if (simId === 'SIM-27') {
				setPendulumL(4);
				setPendulumG(9.8);
				setPendulumTh(20);
			} else if (simId === 'SIM-28') {
				setCircularR(3);
				setCircularW(1.5);
				setCircularM(1);
			} else if (simId === 'SIM-29') {
				setCollisionM1(2);
				setCollisionV1(3);
				setCollisionM2(3);
				setCollisionV2(-1);
				setCollisionE(1);
			} else if (simId === 'SIM-30') {
				setEnergyH0(6);
				setEnergyM(1);
			} else {
				setPhAngle(45);
				setPhVel(20);
				setPhGrav(9.8);
				setPhAir(false);
				setPhVec(true);
			}
			setIsPhPlaying(false);
			setIsPhSlow(false);
		} else if (subject === 'math') {
			if (simId === 'SIM-08' || simId === 'SIM-08-math') {
				setMA(1);
				setMB(-2);
				setMC(-3);
			} else if (simId === 'SIM-16') {
				setMAngle(45);
				setMVel(15);
				setMGrav(9.8);
				setIsMPlaying(false);
			} else if (simId === 'SIM-17') {
				setInA1(1);
				setInB1(1);
				setInC1(2);
				setInA2(-1);
				setInB2(2);
				setInC2(4);
				setShowM1(true);
				setShowM2(true);
			} else if (simId === 'SIM-18') {
				setTriA(10);
				setTriAlpha(45);
				setTriH0(1.5);
			} else if (simId === 'SIM-19') {
				setConicC(3);
				setConicA(5);
				setIsCPlaying(false);
			}
		} else {
			setChemStep(1);
		}
	}, [subject, simId]);

	const handleGlobalReset = useCallback(() => {
		resetParams();
		setPhysResetKey((k) => k + 1);
	}, [resetParams]);

	const f = (x: number) => {
		const r = Math.round(x * 10) / 10;
		return Object.is(r, -0) ? 0 : r;
	};

	const formulaText =
		subject === 'physics'
			? simId === 'SIM-21'
				? 'v = v_0 + a\\,t \\quad \\vert \\quad x = v_0\\,t + \\frac{1}{2}\\,a\\,t^2'
				: simId === 'SIM-22'
					? 'v = g\\,t \\quad \\vert \\quad h = \\frac{1}{2}\\,g\\,t^2'
					: simId === 'SIM-23'
						? 'y = h - \\frac{1}{2}\\,g\\,t^2 \\quad \\vert \\quad x = v_0\\,t \\quad \\vert \\quad L = v_0\\,\\sqrt{\\frac{2h}{g}}'
						: simId === 'SIM-24'
							? 'a = \\frac{F - F_{ms}}{m} \\quad \\vert \\quad F_{ms} = \\mu\\,m\\,g'
							: simId === 'SIM-25'
								? 'a = g\\,(\\sin\\alpha - \\mu\\,\\cos\\alpha) \\quad \\vert \\quad v = a\\,t'
								: simId === 'SIM-26'
									? 'W_t = \\frac{1}{2}\\,k\\,x^2 \\quad \\vert \\quad W_đ = \\frac{1}{2}\\,m\\,v^2 \\quad \\vert \\quad W = W_t + W_đ = \\text{const}'
									: simId === 'SIM-27'
										? '\\theta(t) = \\theta_0\\,\\cos(\\omega\\,t) \\quad \\vert \\quad T = 2\\pi\\,\\sqrt{\\frac{L}{g}}'
										: simId === 'SIM-28'
											? 'v = \\omega\\,r \\quad \\vert \\quad a_{ht} = \\omega^2 r = \\frac{v^2}{r} \\quad \\vert \\quad F_{ht} = m\\,a_{ht}'
											: simId === 'SIM-29'
												? 'm_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\' \\quad \\vert \\quad e = \\frac{v_2\' - v_1\'}{v_1 - v_2}'
												: simId === 'SIM-30'
													? 'W = W_t + W_đ = mgh + \\frac{1}{2}\\,m\\,v^2 = \\text{const}'
													: 'y = v_0 \\sin\\theta\\,t - \\frac{1}{2}\\,g\\,t^2 \\quad \\vert \\quad x = v_0 \\cos\\theta\\,t'
			: subject === 'math'
				? simId === 'SIM-16'
					? `x(t) = 2 + v_0 \\cos\\alpha\\,t \\quad \\vert \\quad y(t) = v_0 \\sin\\alpha\\,t - \\frac{1}{2}\\,g\\,t^2 \\quad \\vert \\quad \\text{Cổng: } y = -0.25 (x - 8)^2 + 9`
					: simId === 'SIM-17'
						? `d_1: ${f(inA1)}x ${inB1 >= 0 ? '+' : '-'} ${Math.abs(f(inB1))}y \\le ${f(inC1)} \\quad \\vert \\quad d_2: ${f(inA2)}x ${inB2 >= 0 ? '+' : '-'} ${Math.abs(f(inB2))}y \\le ${f(inC2)}`
						: simId === 'SIM-18'
							? `H = h_0 + a\\,\\tan(\\alpha) = ${f(triH0)} + ${f(triA)}\\,\\tan(${triAlpha}^\\circ) = ${(triH0 + triA * Math.tan((triAlpha * Math.PI) / 180)).toFixed(2)}\\text{ m}`
							: simId === 'SIM-19'
								? `\\text{Elip: } \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1 \\quad \\vert \\quad MF_1 + MF_2 = 2a \\quad (a=${f(conicA)}, b=${Math.sqrt(Math.max(0.1, conicA * conicA - conicC * conicC)).toFixed(2)}, c=${f(conicC)})`
								: simId === 'SIM-20'
									? `\\text{Số trung bình } \\bar{x} = \\frac{\\sum x_i}{n} \\quad \\vert \\quad \\text{Độ lệch chuẩn } s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n}}`
									: `y = ${f(mA)}x^2 ${mB >= 0 ? '+' : '-'} ${Math.abs(f(mB))}x ${mC >= 0 ? '+' : '-'} ${Math.abs(f(mC))}`
				: simId === 'SIM-03'
					? '\\text{(C}_{17}\\text{H}_{35}\\text{COO)}_3\\text{C}_3\\text{H}_5 + 3\\text{NaOH} \\xrightarrow{t^\\circ} 3\\text{C}_{17}\\text{H}_{35}\\text{COONa} + \\text{C}_3\\text{H}_5\\text{(OH)}_3'
					: simId === 'SIM-04'
						? '\\text{CuSO}_4 + 2\\text{NaOH} \\rightarrow \\text{Cu(OH)}_2\\downarrow + \\text{Na}_2\\text{SO}_4 \\quad \\vert \\quad 2\\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{Cu(OH)}_2 \\rightarrow \\text{(C}_6\\text{H}_{11}\\text{O}_6)_2\\text{Cu} + 2\\text{H}_2\\text{O}'
						: simId === 'SIM-05'
							? '\\text{CH}_2\\text{OH[CHOH]}_4\\text{CHO} + 2\\text{[Ag(NH}_3\\text{)}_2\\text{]OH} \\xrightarrow{t^\\circ} \\text{CH}_2\\text{OH[CHOH]}_4\\text{COONH}_4 + 2\\text{Ag}\\downarrow + 3\\text{NH}_3 + \\text{H}_2\\text{O}'
							: simId === 'SIM-06'
								? '\\text{Hồ tinh bột} + \\text{I}_2 \\rightleftharpoons \\text{Hợp chất màu xanh tím (mất màu khi đun)}'
								: simId === 'SIM-07'
									? '\\text{Protein} + \\text{Cu(OH)}_2 / \\text{OH}^- \\rightarrow \\text{Phức chất màu tím biuret đặc trưng}'
									: simId === 'SIM-08'
										? '2\\text{Na} + 2\\text{H}_2\\text{O} \\rightarrow 2\\text{NaOH} + \\text{H}_2\\uparrow \\text{ (phản ứng tỏa nhiệt mạnh)}'
										: simId === 'SIM-09'
											? '\\text{Fe} + \\text{CuSO}_4 \\rightarrow \\text{FeSO}_4 + \\text{Cu}\\downarrow'
											: simId === 'SIM-10'
												? '2\\text{Al} + 2\\text{NaOH} + 6\\text{H}_2\\text{O} \\rightarrow 2\\text{Na[Al(OH)}_4\\text{]} + 3\\text{H}_2\\uparrow'
												: simId === 'SIM-11'
													? '2\\text{Al} + \\text{Fe}_2\\text{O}_3 \\xrightarrow{t^\\circ} \\text{Al}_2\\text{O}_3 + 2\\text{Fe} \\text{ (phản ứng nhiệt nhôm)}'
													: simId === 'SIM-12'
														? '\\text{FeCl}_2 + 2\\text{NaOH} \\rightarrow \\text{Fe(OH)}_2\\downarrow \\quad \\vert \\quad 4\\text{Fe(OH)}_2 + \\text{O}_2 + 2\\text{H}_2\\text{O} \\rightarrow 4\\text{Fe(OH)}_3'
														: simId === 'SIM-13'
															? '2\\text{CuSO}_4 + 2\\text{H}_2\\text{O} \\xrightarrow{\\text{điện phân}} 2\\text{Cu}\\downarrow + \\text{O}_2\\uparrow + 2\\text{H}_2\\text{SO}_4'
															: simId === 'SIM-14'
																? '\\text{Cực âm (Zn): Zn} \\rightarrow \\text{Zn}^{2+} + 2e \\quad \\vert \\quad \\text{Cực dương (Cu): 2H}^+ + 2e \\rightarrow \\text{H}_2\\uparrow'
																: simId === 'SIM-15'
																	? '\\text{Hạt } \\alpha = {^4_2}\\text{He}^{2+} \\quad \\vert \\quad \\text{Hầu hết đi thẳng, một số lệch/bật ngược}'
																	: '\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\rightleftharpoons \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O}';

	const centerTitle =
		subject === 'physics'
			? simId === 'SIM-21'
				? 'Chuyển động thẳng'
				: simId === 'SIM-22'
					? 'Sự rơi tự do'
					: simId === 'SIM-23'
						? 'Ném ngang'
						: simId === 'SIM-24'
							? 'Định luật II Newton'
							: simId === 'SIM-25'
								? 'Mặt phẳng nghiêng'
								: simId === 'SIM-26'
									? 'Con lắc lò xo nằm ngang'
									: simId === 'SIM-27'
										? 'Con lắc đơn'
										: simId === 'SIM-28'
											? 'Chuyển động tròn đều'
											: simId === 'SIM-29'
												? 'Va chạm 1D'
												: simId === 'SIM-30'
													? 'Bảo toàn cơ năng'
													: 'Quỹ đạo'
			: subject === 'math'
				? simId === 'SIM-08' || simId === 'SIM-08-math' || !simId
					? 'Đồ thị hàm bậc hai'
					: simId === 'SIM-16'
						? 'Quỹ đạo và vòm cổng'
						: simId === 'SIM-17'
							? 'Miền nghiệm hệ BPT'
							: simId === 'SIM-18'
								? 'Đo đạc thực tế'
								: simId === 'SIM-19'
									? 'Vẽ Elip'
									: 'Thống kê số liệu'
				: 'Mô phỏng phản ứng';

	const unusedBundle = { liveT, liveX, liveV, physicsCalc, mathCalc };

	return (
		<StudentLayout hideSidebar>
			<div style={{ display: 'none' }}>{JSON.stringify(unusedBundle)}</div>
			<div className='stu-ws'>
				{/* Subheader */}
				<div className='stu-ws__subheader'>
					<div className='stu-ws__subheader-left'>
						<div className='stu-ws__back' onClick={() => history.push('/hoc-sinh')}>
							<svg
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='#6a6862'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M15 6l-6 6 6 6' />
							</svg>
						</div>
						<div className={`stu-ws__subject-pill stu-ws__subject-pill--${meta.className}`}>{meta.label}</div>
						<span className='stu-ws__breadcrumb-sep'>/</span>
						<span className='stu-ws__breadcrumb-title'>{meta.title}</span>
					</div>
					<div className='stu-ws__live-badge'>
						<div className='stu-ws__live-dot' />
						Trực tiếp · cập nhật khi tương tác
					</div>
					<div className='stu-ws__subheader-actions'>
						<div className='stu-ws__btn-secondary' onClick={handleGlobalReset}>
							Đặt lại
						</div>
						<div className='stu-ws__btn-primary'>Lưu & Nộp</div>
					</div>
				</div>

				{/* 3-Panel Layout */}
				<div className='stu-ws__panels'>
					{/* LEFT: Parameters */}
					<div className='stu-ws__left scl'>
						{/* Physics Params */}
						{subject === 'physics' && (
							<>
								{simId === 'SIM-21' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Vận tốc đầu (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>v<sub>0</sub></em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{kinV0}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m/s</span>
												</span>
											</div>
											<input
												type='range'
												min={0}
												max={8}
												step={0.5}
												value={kinV0}
												style={getTrackStyle(kinV0, 0, 8, '#4f6ef7')}
												onChange={(e) => setKinV0(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Gia tốc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>a</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{kinA}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m/s²</span>
												</span>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={kinA}
												style={getTrackStyle(kinA, -3, 3, '#6d54e8')}
												onChange={(e) => setKinA(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('v = v_0 + a\\,t')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('x = v_0\\,t + \\frac{1}{2}\\,a\\,t^2')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '10px',
														padding: '6px 10px',
														borderRadius: '8px',
														background: '#eef3ff',
														opacity: kinA > 0 ? 1 : 0.35,
														transition: 'opacity 0.25s ease',
													}}
												>
													<span style={{ width: '30px', textAlign: 'center', fontFamily: 'Newsreader,serif', fontStyle: 'italic', fontSize: '13px', color: '#3b5bdb', fontWeight: 600, flex: 'none' }}>a&gt;0</span>
													<span style={{ width: '1px', height: '12px', background: '#cdd8f5', flex: 'none' }}></span>
													<span style={{ fontSize: '12px', color: '#4a4f63', fontWeight: kinA > 0 ? 600 : 400 }}>nhanh dần đều</span>
												</div>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '10px',
														padding: '6px 10px',
														borderRadius: '8px',
														background: '#f3eefb',
														opacity: kinA < 0 ? 1 : 0.35,
														transition: 'opacity 0.25s ease',
													}}
												>
													<span style={{ width: '30px', textAlign: 'center', fontFamily: 'Newsreader,serif', fontStyle: 'italic', fontSize: '13px', color: '#7048c4', fontWeight: 600, flex: 'none' }}>a&lt;0</span>
													<span style={{ width: '1px', height: '12px', background: '#ddd0f0', flex: 'none' }}></span>
													<span style={{ fontSize: '12px', color: '#4a4f63', fontWeight: kinA < 0 ? 600 : 400 }}>chậm dần đều</span>
												</div>
												<div
													style={{
														display: 'flex',
														alignItems: 'center',
														gap: '10px',
														padding: '6px 10px',
														borderRadius: '8px',
														background: '#f0fdf4',
														opacity: kinA === 0 ? 1 : 0.35,
														transition: 'opacity 0.25s ease',
													}}
												>
													<span style={{ width: '30px', textAlign: 'center', fontFamily: 'Newsreader,serif', fontStyle: 'italic', fontSize: '13px', color: '#16a34a', fontWeight: 600, flex: 'none' }}>a=0</span>
													<span style={{ width: '1px', height: '12px', background: '#bbf7d0', flex: 'none' }}></span>
													<span style={{ fontSize: '12px', color: '#4a4f63', fontWeight: kinA === 0 ? 600 : 400 }}>thẳng đều</span>
												</div>
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'v0', desc: 'vận tốc ban đầu (m/s)' },
												{ sym: 'a', desc: 'gia tốc (m/s²)' },
												{ sym: 't', desc: 'thời gian (s)' },
												{ sym: 'v', desc: 'vận tốc tại thời điểm t (m/s)' },
												{ sym: 'x', desc: 'quãng đường đi được (m)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
														transition: 'background 0.2s ease',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'v0' ? <>v<sub>0</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-22' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Độ cao thả (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>h</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{freefallH}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m</span>
												</span>
											</div>
											<input
												type='range'
												min={3}
												max={12}
												step={0.5}
												value={freefallH}
												style={getTrackStyle(freefallH, 3, 12, '#4f6ef7')}
												onChange={(e) => setFreefallH(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Gia tốc rơi tự do (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>g</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{freefallG}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m/s²</span>
												</span>
											</div>
											<input
												type='range'
												min={1.6}
												max={12}
												step={0.1}
												value={freefallG}
												style={getTrackStyle(freefallG, 1.6, 12, '#6d54e8')}
												onChange={(e) => setFreefallG(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('v = g\\,t')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('h = \\frac{1}{2}\\,g\\,t^2')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Gia tốc rơi tự do <em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>g</em> không phụ thuộc vào khối lượng của vật thả rơi. Khi bỏ qua sức cản không khí, các vật rơi tự do từ cùng độ cao sẽ chạm đất cùng lúc.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'h', desc: 'độ cao thả vật (m)' },
												{ sym: 'g', desc: 'gia tốc rơi tự do (m/s²)' },
												{ sym: 't', desc: 'thời gian rơi (s)' },
												{ sym: 'v', desc: 'vận tốc khi rơi (m/s)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
														transition: 'background 0.2s ease',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-23' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Độ cao ném (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>h</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{horizH}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m</span>
												</span>
											</div>
											<input
												type='range'
												min={3}
												max={12}
												step={0.5}
												value={horizH}
												style={getTrackStyle(horizH, 3, 12, '#4f6ef7')}
												onChange={(e) => setHorizH(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Vận tốc đầu (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>v<sub>0</sub></em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{horizV0}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m/s</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={15}
												step={0.5}
												value={horizV0}
												style={getTrackStyle(horizV0, 1, 15, '#6d54e8')}
												onChange={(e) => setHorizV0(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('y = h - \\frac{1}{2}\\,g\\,t^2')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('x = v_0\\,t \\quad \\vert \\quad L = v_0\\,\\sqrt{\\frac{2h}{g}}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Thời gian rơi chỉ phụ thuộc độ cao $h$. Tầm xa toàn phần $L$ phụ thuộc đồng thời vào vận tốc ném đầu $v_0$ và độ cao $h$.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'h', desc: 'độ cao ném vật (m)' },
												{ sym: 'v0', desc: 'vận tốc ban đầu (m/s)' },
												{ sym: 'g', desc: 'gia tốc rơi tự do (m/s²)' },
												{ sym: 't', desc: 'thời gian rơi (s)' },
												{ sym: 'x', desc: 'tầm xa tức thời theo Ox (m)' },
												{ sym: 'L', desc: 'tầm xa toàn phần (m)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'v0' ? <>v<sub>0</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-24' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Lực kéo (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>F</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{newtonF}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>N</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={5}
												step={0.5}
												value={newtonF}
												style={getTrackStyle(newtonF, 0.5, 5, '#4f6ef7')}
												onChange={(e) => setNewtonF(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng xe (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{newtonM}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>kg</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={3}
												step={0.5}
												value={newtonM}
												style={getTrackStyle(newtonM, 0.5, 3, '#6d54e8')}
												onChange={(e) => setNewtonM(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Hệ số ma sát (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&mu;</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{newtonMu}
												</span>
											</div>
											<input
												type='range'
												min={0}
												max={0.5}
												step={0.05}
												value={newtonMu}
												style={getTrackStyle(newtonMu, 0, 0.5, '#4f6ef7')}
												onChange={(e) => setNewtonMu(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('a = \\frac{F - F_{ms}}{m}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('F_{ms} = \\mu\\,m\\,g')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Gia tốc xe tỉ lệ thuận với hợp lực kéo và tỉ lệ nghịch với khối lượng xe. Xe sẽ đứng yên hoặc chuyển động thẳng đều nếu lực kéo F &le; F_ms.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'F', desc: 'lực kéo tác dụng (N)' },
												{ sym: 'm', desc: 'khối lượng xe lăn (kg)' },
												{ sym: 'mu', desc: 'hệ số ma sát lăn' },
												{ sym: 'a', desc: 'gia tốc của xe (m/s²)' },
												{ sym: 'Fms', desc: 'lực ma sát lăn cản trở (N)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'mu' ? <>&mu;</> : row.sym === 'Fms' ? <>F<sub>ms</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-25' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Góc nghiêng (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&alpha;</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{inclineAlpha}°
												</span>
											</div>
											<input
												type='range'
												min={10}
												max={60}
												step={1}
												value={inclineAlpha}
												style={getTrackStyle(inclineAlpha, 10, 60, '#4f6ef7')}
												onChange={(e) => setInclineAlpha(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Hệ số ma sát (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&mu;</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{inclineMu}
												</span>
											</div>
											<input
												type='range'
												min={0}
												max={0.8}
												step={0.05}
												value={inclineMu}
												style={getTrackStyle(inclineMu, 0, 0.8, '#6d54e8')}
												onChange={(e) => setInclineMu(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{inclineM}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>kg</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={3}
												step={0.5}
												value={inclineM}
												style={getTrackStyle(inclineM, 0.5, 3, '#4f6ef7')}
												onChange={(e) => setInclineM(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('a = g\\,(\\sin\\alpha - \\mu\\,\\cos\\alpha)')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('F_{ms} = \\mu\\,m\\,g\\,\\cos\\alpha')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Vật trượt xuống dốc khi góc nghiêng $\alpha$ đủ lớn thỏa mãn $\tan\alpha$ &gt; $\mu$. Nếu $\tan\alpha$ &le; $\mu$, vật đứng yên do lực ma sát tĩnh cân bằng thành phần trọng lực trượt.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'alpha', desc: 'góc nghiêng của mặt dốc (°)' },
												{ sym: 'mu', desc: 'hệ số ma sát trượt' },
												{ sym: 'm', desc: 'khối lượng vật trượt (kg)' },
												{ sym: 'a', desc: 'gia tốc trượt xuống (m/s²)' },
												{ sym: 'Fms', desc: 'lực ma sát cản trở (N)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'alpha' ? <>&alpha;</> : row.sym === 'mu' ? <>&mu;</> : row.sym === 'Fms' ? <>F<sub>ms</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-26' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Độ cứng lò xo (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>k</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{springK}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>N/m</span>
												</span>
											</div>
											<input
												type='range'
												min={20}
												max={100}
												step={5}
												value={springK}
												style={getTrackStyle(springK, 20, 100, '#4f6ef7')}
												onChange={(e) => setSpringK(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{springM}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>kg</span>
												</span>
											</div>
											<input
												type='range'
												min={0.2}
												max={3}
												step={0.1}
												value={springM}
												style={getTrackStyle(springM, 0.2, 3, '#6d54e8')}
												onChange={(e) => setSpringM(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Biên độ nén/dãn (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>A</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{springA}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={3}
												step={0.25}
												value={springA}
												style={getTrackStyle(springA, 0.5, 3, '#4f6ef7')}
												onChange={(e) => setSpringA(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('W_t = \\frac{1}{2}\\,k\\,x^2')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('W_đ = \\frac{1}{2}\\,m\\,v^2')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div dangerouslySetInnerHTML={renderTex('W = W_t + W_đ = \\text{const}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Bỏ qua ma sát, tổng cơ năng của con lắc lò xo luôn được bảo toàn. Động năng biến đổi tuần hoàn ngược pha với thế năng đàn hồi.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'k', desc: 'độ cứng của lò xo (N/m)' },
												{ sym: 'm', desc: 'khối lượng vật nặng (kg)' },
												{ sym: 'A', desc: 'biên độ dao động (m)' },
												{ sym: 'x', desc: 'ly độ dao động - độ biến dạng (m)' },
												{ sym: 'Wt', desc: 'thế năng đàn hồi (J)' },
												{ sym: 'Wd', desc: 'động năng vật (J)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'Wt' ? <>W<sub>t</sub></> : row.sym === 'Wd' ? <>W<sub>đ</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-27' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Chiều dài dây (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>L</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{pendulumL}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m</span>
												</span>
											</div>
											<input
												type='range'
												min={2}
												max={7}
												step={0.2}
												value={pendulumL}
												style={getTrackStyle(pendulumL, 2, 7, '#4f6ef7')}
												onChange={(e) => setPendulumL(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Góc lệch cực đại (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&theta;<sub>0</sub></em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{pendulumTh}°
												</span>
											</div>
											<input
												type='range'
												min={5}
												max={35}
												step={1}
												value={pendulumTh}
												style={getTrackStyle(pendulumTh, 5, 35, '#6d54e8')}
												onChange={(e) => setPendulumTh(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Gia tốc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>g</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{pendulumG}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m/s²</span>
												</span>
											</div>
											<input
												type='range'
												min={1.6}
												max={12}
												step={0.1}
												value={pendulumG}
												style={getTrackStyle(pendulumG, 1.6, 12, '#4f6ef7')}
												onChange={(e) => setPendulumG(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\theta(t) = \\theta_0\\,\\cos(\\omega\\,t)')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('T = 2\\pi\\,\\sqrt{\\frac{L}{g}}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Chu kỳ $T$ của con lắc đơn tỷ lệ thuận với căn bậc hai chiều dài dây $L$. Khối lượng vật nặng không làm thay đổi chu kỳ dao động của con lắc.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'L', desc: 'chiều dài dây treo con lắc (m)' },
												{ sym: 'theta0', desc: 'góc lệch lớn nhất - biên độ góc (°)' },
												{ sym: 'g', desc: 'gia tốc trọng trường (m/s²)' },
												{ sym: 'T', desc: 'chu kỳ dao động (s)' },
												{ sym: 'omega', desc: 'tần số góc dao động (rad/s)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'theta0' ? <>&theta;<sub>0</sub></> : row.sym === 'omega' ? <>&omega;</> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-28' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Bán kính quỹ đạo (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>r</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{circularR}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={4}
												step={0.25}
												value={circularR}
												style={getTrackStyle(circularR, 1, 4, '#4f6ef7')}
												onChange={(e) => setCircularR(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tốc độ góc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&omega;</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{circularW}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>rad/s</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={4}
												step={0.25}
												value={circularW}
												style={getTrackStyle(circularW, 0.5, 4, '#6d54e8')}
												onChange={(e) => setCircularW(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{circularM}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>kg</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={4}
												step={0.5}
												value={circularM}
												style={getTrackStyle(circularM, 0.5, 4, '#4f6ef7')}
												onChange={(e) => setCircularM(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('v = \\omega\\,r \\quad \\vert \\quad a_{ht} = \\omega^2 r = \\frac{v^2}{r}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('F_{ht} = m\\,a_{ht}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Lực hướng tâm F_ht vuông góc với vector vận tốc, chỉ đóng vai trò uốn cong quỹ đạo của vật thành hình tròn mà không làm thay đổi tốc độ dài.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'r', desc: 'bán kính quỹ đạo tròn (m)' },
												{ sym: 'omega', desc: 'tốc độ góc (rad/s)' },
												{ sym: 'm', desc: 'khối lượng quả nặng (kg)' },
												{ sym: 'v', desc: 'tốc độ dài tiếp tuyến (m/s)' },
												{ sym: 'Fht', desc: 'lực hướng tâm giữ dây (N)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'omega' ? <>&omega;</> : row.sym === 'Fht' ? <>F<sub>ht</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-29' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số xe 1 (Xanh)</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng m₁
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{collisionM1}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>kg</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={5}
												step={0.5}
												value={collisionM1}
												style={getTrackStyle(collisionM1, 1, 5, '#4f6ef7')}
												onChange={(e) => setCollisionM1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Vận tốc đầu v₁
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{collisionV1}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m/s</span>
												</span>
											</div>
											<input
												type='range'
												min={0}
												max={5}
												step={0.5}
												value={collisionV1}
												style={getTrackStyle(collisionV1, 0, 5, '#4f6ef7')}
												onChange={(e) => setCollisionV1(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số xe 2 (Cam)</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng m₂
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{collisionM2}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>kg</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={5}
												step={0.5}
												value={collisionM2}
												style={getTrackStyle(collisionM2, 1, 5, '#6d54e8')}
												onChange={(e) => setCollisionM2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Vận tốc đầu v₂
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{collisionV2}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m/s</span>
												</span>
											</div>
											<input
												type='range'
												min={-5}
												max={0}
												step={0.5}
												value={collisionV2}
												style={getTrackStyle(collisionV2, -5, 0, '#6d54e8')}
												onChange={(e) => setCollisionV2(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Đặc tính va chạm</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Hệ số đàn hồi (e)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{collisionE}
												</span>
											</div>
											<input
												type='range'
												min={0}
												max={1}
												step={0.1}
												value={collisionE}
												style={getTrackStyle(collisionE, 0, 1, '#4f6ef7')}
												onChange={(e) => setCollisionE(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('m_1 v_1 + m_2 v_2 = m_1 v_1\' + m_2 v_2\'')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('e = \\frac{v_2\' - v_1\'}{v_1 - v_2}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Động lượng toàn phần luôn được bảo toàn. Động năng chỉ bảo toàn trong va chạm đàn hồi hoàn toàn ($e=1$). Trong va chạm mềm ($e=0$), động năng hao hụt lớn nhất.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'm1', desc: 'khối lượng xe xanh (kg)' },
												{ sym: 'v1', desc: 'vận tốc ban đầu xe xanh (m/s)' },
												{ sym: 'm2', desc: 'khối lượng xe cam (kg)' },
												{ sym: 'v2', desc: 'vận tốc ban đầu xe cam (m/s)' },
												{ sym: 'e', desc: 'hệ số đàn hồi phục hồi' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'm1' ? <>m<sub>1</sub></> : row.sym === 'v1' ? <>v<sub>1</sub></> : row.sym === 'm2' ? <>m<sub>2</sub></> : row.sym === 'v2' ? <>v<sub>2</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-30' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Độ cao thả (h₀)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{energyH0}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>m</span>
												</span>
											</div>
											<input
												type='range'
												min={2}
												max={8}
												step={0.5}
												value={energyH0}
												style={getTrackStyle(energyH0, 2, 8, '#4f6ef7')}
												onChange={(e) => setEnergyH0(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2px' }}>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (m)
												</span>
												<span style={{ fontFamily: 'Newsreader,serif', fontSize: '15px', fontWeight: 600, color: '#2b2f45' }}>
													{energyM}
													<span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: '11px', fontWeight: 500, color: '#9094a8', marginLeft: '4px' }}>kg</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={4}
												step={0.5}
												value={energyM}
												style={getTrackStyle(energyM, 0.5, 4, '#6d54e8')}
												onChange={(e) => setEnergyM(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('W = W_t + W_đ = mgh + \\frac{1}{2}\\,m\\,v^2')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }} />
											<div dangerouslySetInnerHTML={renderTex('W = \\text{const}')} style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }} />
											<div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)', margin: '14px 0 10px' }} />
											<div style={{ fontSize: '12px', color: '#4a4f63', lineHeight: '1.5' }}>
												💡 <b>Lưu ý:</b> Khi quả cầu trượt không ma sát trên dốc cong, động năng và thế năng chuyển hóa qua lại lẫn nhau nhưng cơ năng toàn phần luôn không đổi.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list' style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'transparent', border: 'none', padding: 0 }}>
											{[
												{ sym: 'h0', desc: 'độ cao thả cực đại (m)' },
												{ sym: 'm', desc: 'khối lượng quả nặng (kg)' },
												{ sym: 'h', desc: 'độ cao tức thời tại vị trí khảo sát (m)' },
												{ sym: 'v', desc: 'vận tốc tức thời (m/s)' },
												{ sym: 'Wt', desc: 'thế năng trọng trường (J)' },
												{ sym: 'Wd', desc: 'động năng (J)' },
											].map((row, idx) => (
												<div
													key={idx}
													className='stu-ws__symbol-row'
													style={{
														display: 'grid',
														gridTemplateColumns: '32px 1fr',
														alignItems: 'center',
														gap: '10px',
														padding: '4px 6px',
														borderRadius: '8px',
													}}
												>
													<span
														className='stu-ws__symbol-bubble'
														style={{
															width: '26px',
															height: '26px',
															borderRadius: '50%',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#4f6ef7',
															background: '#fff',
															border: '1px solid #e0e2ee',
														}}
													>
														{row.sym === 'h0' ? <>h<sub>0</sub></> : row.sym === 'Wt' ? <>W<sub>t</sub></> : row.sym === 'Wd' ? <>W<sub>đ</sub></> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Góc ném (<span dangerouslySetInnerHTML={renderTex('\\theta')} />)</span>
												<span className='stu-ws__param-val'>{phAngle}°</span>
											</div>
											<input
												type='range'
												min={0}
												max={90}
												step={1}
												value={phAngle}
												style={getTrackStyle(phAngle, 0, 90, '#4f6ef7')}
												onChange={(e) => setPhAngle(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Vận tốc ban đầu (<span dangerouslySetInnerHTML={renderTex('v_0')} />)</span>
												<span className='stu-ws__param-val'>{phVel} m/s</span>
											</div>
											<input
												type='range'
												min={1}
												max={40}
												step={1}
												value={phVel}
												style={getTrackStyle(phVel, 1, 40, '#4f6ef7')}
												onChange={(e) => setPhVel(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>Gia tốc trọng trường (<span dangerouslySetInnerHTML={renderTex('g')} />)</span>
												<span className='stu-ws__param-val'>{f(phGrav)} m/s²</span>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={0.1}
												value={phGrav}
												style={getTrackStyle(phGrav, 1, 20, '#6d54e8')}
												onChange={(e) => setPhGrav(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__toggle-row' onClick={() => setPhAir(!phAir)}>
											<span>Sức cản không khí</span>
											<div className={`stu-ws__toggle ${phAir ? 'stu-ws__toggle--on' : ''}`}>
												<div className='stu-ws__toggle-knob' />
											</div>
										</div>
										<div className='stu-ws__toggle-row' onClick={() => setPhVec(!phVec)}>
											<span>Hiện vector vận tốc</span>
											<div className={`stu-ws__toggle ${phVec ? 'stu-ws__toggle--on' : ''}`}>
												<div className='stu-ws__toggle-knob' />
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>📐 Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('v_x = v_0 \\cos\\theta')} />
											<div dangerouslySetInnerHTML={renderTex('v_y = v_0 \\sin\\theta - g\\,t')} style={{ marginTop: '6px' }} />
											<div dangerouslySetInnerHTML={renderTex('L = \\frac{v_0^2 \\sin(2\\theta)}{g}')} style={{ marginTop: '6px' }} />
											<div dangerouslySetInnerHTML={renderTex('H = \\frac{v_0^2 \\sin^2\\theta}{2g}')} style={{ marginTop: '6px' }} />
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>🔤 Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('v_0')} />
												<span className='stu-ws__symbol-desc'>vận tốc ban đầu (m/s)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\theta')} />
												<span className='stu-ws__symbol-desc'>góc ném so với phương ngang</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('v_x')} />
												<span className='stu-ws__symbol-desc'>vận tốc theo phương ngang (m/s)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('v_y')} />
												<span className='stu-ws__symbol-desc'>vận tốc theo phương thẳng đứng (m/s)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('L')} />
												<span className='stu-ws__symbol-desc'>tầm xa (m)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('H')} />
												<span className='stu-ws__symbol-desc'>độ cao cực đại (m)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('g')} />
												<span className='stu-ws__symbol-desc'>gia tốc rơi tự do (m/s²)</span>
											</div>
										</div>
									</>
								)}
							</>
						)}

						{/* Math Params */}
						{subject === 'math' && (
							<>
								<div className='stu-ws__section-label'>
									<div className='stu-ws__section-label-bar' />
									<span>Thông số</span>
								</div>

								{/* SIM-08 or default_math: Quadratic Graph */}
								{(simId === 'SIM-08' || simId === 'SIM-08-math' || !simId) && (
									<>
										<div className='stu-ws__formula-box' dangerouslySetInnerHTML={renderTex('y = a\\,x^2 + b\\,x + c')} />
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a</span>
												<span className='stu-ws__param-val'>{f(mA).toFixed(1)}</span>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.1}
												value={mA}
												style={getTrackStyle(mA, -3, 3, '#4f6ef7')}
												onChange={(e) => setMA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b</span>
												<span className='stu-ws__param-val'>{f(mB).toFixed(1)}</span>
											</div>
											<input
												type='range'
												min={-6}
												max={6}
												step={0.1}
												value={mB}
												style={getTrackStyle(mB, -6, 6, '#4f6ef7')}
												onChange={(e) => setMB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>c</span>
												<span className='stu-ws__param-val'>{f(mC).toFixed(1)}</span>
											</div>
											<input
												type='range'
												min={-6}
												max={6}
												step={0.1}
												value={mC}
												style={getTrackStyle(mC, -6, 6, '#6d54e8')}
												onChange={(e) => setMC(+e.target.value)}
											/>
										</div>
									</>
								)}

								{/* SIM-16: Projectile & Parabolic Arch */}
								{simId === 'SIM-16' && (
									<>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('x(t) = 2 + v_0 \\cos\\alpha\\,t')} />
											<div dangerouslySetInnerHTML={renderTex('y(t) = v_0 \\sin\\alpha\\,t - \\frac{1}{2}\\,g\\,t^2')} style={{ marginTop: '6px' }} />
											<div className='stu-ws__formula-hint'>Cổng: y = -0.25 (x - 8)^2 + 9</div>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Góc ném (<span dangerouslySetInnerHTML={renderTex('\\alpha')} />)</span>
												<span className='stu-ws__param-val'>{mAngle}°</span>
											</div>
											<input
												type='range'
												min={10}
												max={85}
												step={1}
												value={mAngle}
												style={getTrackStyle(mAngle, 10, 85, '#4f6ef7')}
												onChange={(e) => setMAngle(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Vận tốc đầu (<span dangerouslySetInnerHTML={renderTex('v_0')} />)</span>
												<span className='stu-ws__param-val'>{mVel} m/s</span>
											</div>
											<input
												type='range'
												min={5}
												max={25}
												step={0.5}
												value={mVel}
												style={getTrackStyle(mVel, 5, 25, '#4f6ef7')}
												onChange={(e) => setMVel(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>Gia tốc (<span dangerouslySetInnerHTML={renderTex('g')} />)</span>
												<span className='stu-ws__param-val'>{f(mGrav)} m/s²</span>
											</div>
											<input
												type='range'
												min={5}
												max={15}
												step={0.1}
												value={mGrav}
												style={getTrackStyle(mGrav, 5, 15, '#6d54e8')}
												onChange={(e) => setMGrav(+e.target.value)}
											/>
										</div>

										<div
											style={{
												marginTop: '12px',
												fontSize: '11px',
												color: '#94a3b8',
												background: 'rgba(30, 41, 59, 0.5)',
												padding: '8px',
												borderRadius: '6px',
												lineHeight: '1.4',
											}}
										>
											💡 <b>Bài toán thực tế:</b> Cổng đá dạng parabol cao 9m, rộng 12m. Hãy điều chỉnh góc ném α và vận
											tốc v₀ để quỹ đạo bay khớp hoàn hảo vòm cổng!
										</div>
									</>
								)}

								{/* SIM-17: Linear Inequalities */}
								{simId === 'SIM-17' && (
									<>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('d_1: A_1 x + B_1 y \\le C_1')} />
											<div dangerouslySetInnerHTML={renderTex('d_2: A_2 x + B_2 y \\le C_2')} style={{ marginTop: '6px' }} />
										</div>
										<div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4f6ef7', marginBottom: '4px' }}>
											Bất phương trình 1:
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Hệ số A₁</span>
												<span className='stu-ws__param-val'>{inA1}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={inA1}
												style={getTrackStyle(inA1, -5, 5, '#4f6ef7')}
												onChange={(e) => setInA1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Hệ số B₁</span>
												<span className='stu-ws__param-val'>{inB1}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={inB1}
												style={getTrackStyle(inB1, -5, 5, '#4f6ef7')}
												onChange={(e) => setInB1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>Hằng số C₁</span>
												<span className='stu-ws__param-val'>{inC1}</span>
											</div>
											<input
												type='range'
												min={-10}
												max={10}
												step={0.5}
												value={inC1}
												style={getTrackStyle(inC1, -10, 10, '#6d54e8')}
												onChange={(e) => setInC1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__toggle-row' onClick={() => setShowM1(!showM1)}>
											<span>Tô miền nghiệm 1</span>
											<div className={`stu-ws__toggle ${showM1 ? 'stu-ws__toggle--on' : ''}`}>
												<div className='stu-ws__toggle-knob' />
											</div>
										</div>

										<div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6d54e8', margin: '12px 0 4px 0' }}>
											Bất phương trình 2:
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Hệ số A₂</span>
												<span className='stu-ws__param-val'>{inA2}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={inA2}
												style={getTrackStyle(inA2, -5, 5, '#4f6ef7')}
												onChange={(e) => setInA2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Hệ số B₂</span>
												<span className='stu-ws__param-val'>{inB2}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={inB2}
												style={getTrackStyle(inB2, -5, 5, '#4f6ef7')}
												onChange={(e) => setInB2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>Hằng số C₂</span>
												<span className='stu-ws__param-val'>{inC2}</span>
											</div>
											<input
												type='range'
												min={-10}
												max={10}
												step={0.5}
												value={inC2}
												style={getTrackStyle(inC2, -10, 10, '#6d54e8')}
												onChange={(e) => setInC2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__toggle-row' onClick={() => setShowM2(!showM2)}>
											<span>Tô miền nghiệm 2</span>
											<div className={`stu-ws__toggle ${showM2 ? 'stu-ws__toggle--on' : ''}`}>
												<div className='stu-ws__toggle-knob' />
											</div>
										</div>
									</>
								)}

								{/* SIM-18: Triangulation */}
								{simId === 'SIM-18' && (
									<>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('H = h_0 + a\\,\\tan\\alpha')} />
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Khoảng cách (a)</span>
												<span className='stu-ws__param-val'>{triA} m</span>
											</div>
											<input
												type='range'
												min={2}
												max={30}
												step={0.5}
												value={triA}
												style={getTrackStyle(triA, 2, 30, '#4f6ef7')}
												onChange={(e) => setTriA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Góc nâng (α)</span>
												<span className='stu-ws__param-val'>{triAlpha}°</span>
											</div>
											<input
												type='range'
												min={10}
												max={80}
												step={1}
												value={triAlpha}
												style={getTrackStyle(triAlpha, 10, 80, '#4f6ef7')}
												onChange={(e) => setTriAlpha(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>Chiều cao mắt (h₀)</span>
												<span className='stu-ws__param-val'>{triH0} m</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={2.0}
												step={0.1}
												value={triH0}
												style={getTrackStyle(triH0, 0.5, 2.0, '#6d54e8')}
												onChange={(e) => setTriH0(+e.target.value)}
											/>
										</div>
									</>
								)}

								{/* SIM-19: Ellipse Conic */}
								{simId === 'SIM-19' && (
									<>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1')} />
											<div dangerouslySetInnerHTML={renderTex('MF_1 + MF_2 = 2a')} style={{ marginTop: '6px' }} />
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Nửa tiêu cự (c)</span>
												<span className='stu-ws__param-val'>{conicC.toFixed(1)}</span>
											</div>
											<input
												type='range'
												min={1}
												max={5}
												step={0.1}
												value={conicC}
												style={getTrackStyle(conicC, 1, 5, '#4f6ef7')}
												onChange={(e) => {
													const val = +e.target.value;
													setConicC(val);
													if (conicA <= val) setConicA(val + 0.5);
												}}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>Độ dài dây (2a)</span>
												<span className='stu-ws__param-val'>
													{(conicA * 2).toFixed(1)} (a={conicA.toFixed(1)})
												</span>
											</div>
											<input
												type='range'
												min={2.2}
												max={14}
												step={0.2}
												value={conicA * 2}
												style={getTrackStyle(conicA * 2, 2.2, 14, '#6d54e8')}
												onChange={(e) => {
													const val = +e.target.value / 2;
													if (val > conicC) {
														setConicA(val);
													}
												}}
											/>
										</div>

										<div
											style={{
												marginTop: '12px',
												fontSize: '11px',
												color: '#94a3b8',
												background: 'rgba(30, 41, 59, 0.5)',
												padding: '8px',
												borderRadius: '6px',
												lineHeight: '1.4',
											}}
										>
											💡 <b>Định nghĩa Elip:</b> Quỹ tích những điểm M sao cho tổng khoảng cách đến hai tiêu điểm không
											đổi MF₁ + MF₂ = 2a.
										</div>
									</>
								)}

								{/* SIM-20: Statistics */}
								{simId === 'SIM-20' && (
									<>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\bar{x} = \\frac{\\sum x_i}{n}')} />
											<div dangerouslySetInnerHTML={renderTex('s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n}}')} style={{ marginTop: '6px' }} />
										</div>
										<div
											style={{
												fontSize: '11px',
												color: '#94a3b8',
												lineHeight: '1.5',
												display: 'flex',
												flexDirection: 'column',
												gap: '8px',
											}}
										>
											<div>
												📊 <b>Các đại lượng đo xu thế trung tâm:</b>
											</div>
											<div>
												• <b>Số trung bình (x̄):</b> Giá trị trung bình cộng của mẫu số liệu.
											</div>
											<div>
												• <b>Trung vị (Q₂):</b> Giá trị chia mẫu số liệu thành hai phần bằng nhau.
											</div>
											<div>
												• <b>Tứ phân vị (Q₁, Q₃):</b> Các giá trị chia mẫu số liệu đã sắp xếp thành 4 phần bằng nhau.
											</div>
											<div style={{ borderTop: '1px solid #1e293b', paddingTop: '6px' }}>
												📉 <b>Các đại lượng đo độ phân tán:</b>
											</div>
											<div>
												• <b>Khoảng biến thiên (R):</b> Hiệu giữa giá trị lớn nhất và nhỏ nhất.
											</div>
											<div>
												• <b>Khoảng tứ phân vị (IQR):</b> Bằng Q₃ - Q₁, đo độ phân tán của 50% dữ liệu ở giữa.
											</div>
											<div>
												• <b>Độ lệch chuẩn (s):</b> Đo mức độ phân tán xung quanh số trung bình.
											</div>
										</div>
									</>
								)}
							</>
						)}

						{/* Chem Steps */}
						{subject === 'chem' && (
							<>
								<div className='stu-ws__section-label'>Các bước hướng dẫn</div>
								<div className='stu-ws__steps'>
									{(LAB_CHEM_STEPS[simId as keyof typeof LAB_CHEM_STEPS] || LAB_CHEM_STEPS['SIM-01']).map((st) => {
										const done = st.n < chemStep;
										const active = st.n === chemStep;
										return (
											<div key={st.n} className='stu-ws__step'>
												<div
													className={`stu-ws__step-circle ${done ? 'stu-ws__step-circle--done' : active ? 'stu-ws__step-circle--active' : ''}`}
												>
													{done ? '✓' : st.n}
												</div>
												<div>
													<div className={`stu-ws__step-title ${done || active ? '' : 'stu-ws__step-title--muted'}`}>
														{st.title}
													</div>
													<div className={`stu-ws__step-sub ${active ? 'stu-ws__step-sub--accent' : ''}`}>{st.sub}</div>
												</div>
											</div>
										);
									})}
								</div>

								<div className='stu-ws__watch'>
									<div className='stu-ws__results-title'>Quan sát</div>
									{getChemObservations(simId, chemStep).map((obs) => (
										<div key={obs.key} className='stu-ws__watch-item'>
											<div
												className={`stu-ws__watch-dot ${obs.active ? 'stu-ws__watch-dot--pink' : 'stu-ws__watch-dot--empty'}`}
											/>
											{obs.label}
										</div>
									))}
								</div>
							</>
						)}
					</div>

					{/* CENTER: Simulation */}
					<div className='stu-ws__center'>
						<div className='stu-ws__center-header'>
							<span className='stu-ws__center-title'>{centerTitle}</span>
							{subject === 'physics' && (
								<div className='stu-ws__center-actions'>
									<button
										className={`stu-ws__center-btn stu-ws__center-btn--primary ${isPhPlaying ? 'stu-ws__center-btn--active' : ''}`}
										onClick={() => setIsPhPlaying((prev) => !prev)}
									>
										{isPhPlaying ? 'Tạm dừng' : 'Bắt đầu'}
									</button>
									<button
										className={`stu-ws__center-btn stu-ws__center-btn--slow ${isPhSlow ? 'stu-ws__center-btn--active' : ''}`}
										onClick={() => setIsPhSlow((prev) => !prev)}
									>
										Chậm
									</button>
								</div>
							)}
							{subject === 'math' && simId === 'SIM-16' && (
								<div className='stu-ws__center-actions'>
									<button
										className={`stu-ws__center-btn stu-ws__center-btn--primary ${isMPlaying ? 'stu-ws__center-btn--active' : ''}`}
										onClick={() => setIsMPlaying((prev) => !prev)}
									>
										{isMPlaying ? '⏸ Tạm dừng' : '▶ Phóng'}
									</button>
								</div>
							)}
							{subject === 'math' && simId === 'SIM-19' && (
								<div className='stu-ws__center-actions'>
									<button
										className={`stu-ws__center-btn stu-ws__center-btn--primary ${isCPlaying ? 'stu-ws__center-btn--active' : ''}`}
										onClick={() => setIsCPlaying((prev) => !prev)}
									>
										{isCPlaying ? '⏸ Tạm dừng' : '▶ Bút vẽ'}
									</button>
								</div>
							)}
						</div>

						{/* Simulation mount point */}
						<div
							className={`stu-ws__sim-slot stu-ws__sim-slot--${meta.className}`}
							id={`sim-mount-${subject}`}
							data-sim={subject}
						>
							<div className={`stu-ws__sim-pill stu-ws__sim-pill--${meta.className}`}>
								{subject === 'physics' &&
									(simId === 'SIM-21'
										? `v₀ ${kinV0} m/s  ·  a ${kinA} m/s²`
										: simId === 'SIM-22'
											? `h ${freefallH} m  ·  g ${f(freefallG)} m/s²`
											: simId === 'SIM-23'
												? `h ${horizH} m  ·  v₀ ${horizV0} m/s`
												: simId === 'SIM-24'
													? `F ${newtonF} N  ·  m ${newtonM} kg  ·  μ ${newtonMu}`
													: simId === 'SIM-25'
														? `α ${inclineAlpha}°  ·  μ ${inclineMu}  ·  m ${inclineM} kg`
														: simId === 'SIM-26'
															? `k ${springK} N/m  ·  m ${springM} kg  ·  A ${springA} m`
															: simId === 'SIM-27'
																? `L ${pendulumL} m  ·  θ₀ ${pendulumTh}°  ·  g ${pendulumG}`
																: simId === 'SIM-28'
																	? `r ${circularR} m  ·  ω ${circularW} rad/s  ·  m ${circularM} kg`
																	: simId === 'SIM-29'
																		? `m₁ ${collisionM1} kg  ·  m₂ ${collisionM2} kg  ·  e ${collisionE}`
																		: simId === 'SIM-30'
																			? `h₀ ${energyH0} m  ·  m ${energyM} kg`
																			: `θ ${phAngle}°  ·  v ${phVel} m/s  ·  g ${f(phGrav)}`)}
								{subject === 'math' &&
									(simId === 'SIM-08' || simId === 'SIM-08-math' || !simId
										? `a ${f(mA)}  ·  b ${f(mB)}  ·  c ${f(mC)}`
										: simId === 'SIM-16'
											? `θ ${mAngle}°  ·  v₀ ${mVel} m/s`
											: simId === 'SIM-17'
												? `Hệ BPT bậc nhất 2 ẩn`
												: simId === 'SIM-18'
													? `Giác kế  ·  a ${triA}m  ·  α ${triAlpha}°`
													: simId === 'SIM-19'
														? `Bút vẽ  ·  a ${conicA.toFixed(1)}  ·  c ${conicC.toFixed(1)}`
														: `Thống kê mẫu số liệu`)}
								{subject === 'chem' &&
									`Đang tiến hành  ·  bước ${chemStep}/${(LAB_CHEM_STEPS[simId as keyof typeof LAB_CHEM_STEPS] || LAB_CHEM_STEPS['SIM-01']).length}`}
							</div>
							{subject === 'physics' ? (
								simId === 'SIM-21' ? (
									<KinematicsSimulation
										config={{
											simulation_id: 'SIM-21',
											subject: 'physics',
											topic: 'kinematics',
											parameters: [
												{ key: 'v0', value: kinV0, unit: 'm/s', label: 'Vận tốc đầu' },
												{ key: 'a', value: kinA, unit: 'm/s²', label: 'Gia tốc' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										onStep={(t, x, v) => {
											setLiveT(t);
											setLiveX(x);
											setLiveV(v);
										}}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-22' ? (
									<FreefallSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-22',
											subject: 'physics',
											topic: 'freefall',
											parameters: [
												{ key: 'h', value: freefallH, unit: 'm', label: 'Độ cao thả' },
												{ key: 'g', value: freefallG, unit: 'm/s²', label: 'Gia tốc' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										onStep={(t, y, v) => {
											setLiveT(t);
											setLiveX(y);
											setLiveV(v);
										}}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-23' ? (
									<HorizontalSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-23',
											subject: 'physics',
											topic: 'horizontal',
											parameters: [
												{ key: 'h', value: horizH, unit: 'm', label: 'Độ cao' },
												{ key: 'v0', value: horizV0, unit: 'm/s', label: 'Vận tốc đầu' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-24' ? (
									<Newton2Simulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-24',
											subject: 'physics',
											topic: 'newton2',
											parameters: [
												{ key: 'F', value: newtonF, unit: 'N', label: 'Lực kéo' },
												{ key: 'm', value: newtonM, unit: 'kg', label: 'Khối lượng xe' },
												{ key: 'mu', value: newtonMu, unit: '', label: 'Hệ số ma sát' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-25' ? (
									<InclineSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-25',
											subject: 'physics',
											topic: 'incline',
											parameters: [
												{ key: 'alpha', value: inclineAlpha, unit: '°', label: 'Góc nghiêng' },
												{ key: 'mu', value: inclineMu, unit: '', label: 'Hệ số ma sát' },
												{ key: 'm', value: inclineM, unit: 'kg', label: 'Khối lượng' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-26' ? (
									<SpringSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-26',
											subject: 'physics',
											topic: 'spring',
											parameters: [
												{ key: 'k', value: springK, unit: 'N/m', label: 'Độ cứng lò xo' },
												{ key: 'm', value: springM, unit: 'kg', label: 'Khối lượng' },
												{ key: 'A', value: springA, unit: 'm', label: 'Biên độ' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-27' ? (
									<PendulumSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-27',
											subject: 'physics',
											topic: 'pendulum',
											parameters: [
												{ key: 'L', value: pendulumL, unit: 'm', label: 'Chiều dài dây' },
												{ key: 'g', value: pendulumG, unit: 'm/s²', label: 'Gia tốc' },
												{ key: 'th', value: pendulumTh, unit: '°', label: 'Góc lệch' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-28' ? (
									<CircularSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-28',
											subject: 'physics',
											topic: 'circular',
											parameters: [
												{ key: 'r', value: circularR, unit: 'm', label: 'Bán kính' },
												{ key: 'w', value: circularW, unit: 'rad/s', label: 'Tốc độ góc' },
												{ key: 'm', value: circularM, unit: 'kg', label: 'Khối lượng' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-29' ? (
									<CollisionSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-29',
											subject: 'physics',
											topic: 'collision',
											parameters: [
												{ key: 'm1', value: collisionM1, unit: 'kg', label: 'Khối lượng m1' },
												{ key: 'v1', value: collisionV1, unit: 'm/s', label: 'Vận tốc v1' },
												{ key: 'm2', value: collisionM2, unit: 'kg', label: 'Khối lượng m2' },
												{ key: 'v2', value: collisionV2, unit: 'm/s', label: 'Vận tốc v2' },
												{ key: 'e', value: collisionE, unit: '', label: 'Độ đàn hồi' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-30' ? (
									<EnergySimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-30',
											subject: 'physics',
											topic: 'energy',
											parameters: [
												{ key: 'h0', value: energyH0, unit: 'm', label: 'Độ cao thả' },
												{ key: 'm', value: energyM, unit: 'kg', label: 'Khối lượng' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
										resetKey={physResetKey}
									/>
								) : (
									<ProjectileSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-02',
											subject: 'physics',
											topic: 'projectile',
											parameters: [
												{ key: 'theta', value: phAngle, unit: '°', label: 'Góc ném' },
												{ key: 'v0', value: phVel, unit: 'm/s', label: 'Vận tốc đầu' },
												{ key: 'g', value: phGrav, unit: 'm/s²', label: 'Gia tốc trọng trường' },
												{ key: 'airResistance', value: phAir ? 1 : 0, unit: '', label: 'Sức cản không khí' },
												{ key: 'showVectors', value: phVec ? 1 : 0, unit: '', label: 'Hiện vector vận tốc' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										onAnimationEnd={() => setIsPhPlaying(false)}
									/>
								)
							) : subject === 'chem' ? (
								simId === 'SIM-03' ? (
									<SoapSimulation
										config={{
											simulation_id: 'SIM-03',
											subject: 'chemistry',
											topic: 'saponification',
											parameters: [],
										}}
										currentStep={chemStep}
										onStepChange={(step: number) => setChemStep(step)}
									/>
								) : simId === 'SIM-01' ? (
									<EsterSimulation
										config={{
											simulation_id: 'SIM-01',
											subject: 'chemistry',
											topic: 'esterification',
											parameters: [],
										}}
										currentStep={chemStep}
										onStepChange={(step: number) => setChemStep(step)}
									/>
								) : (
									<GenericChemSimulation
										config={{
											simulation_id: simId || 'SIM-04',
											subject: 'chemistry',
											topic: 'generic',
											parameters: [],
										}}
										currentStep={chemStep}
										onStepChange={(step: number) => setChemStep(step)}
									/>
								)
							) : subject === 'math' ? (
								simId === 'SIM-08' || simId === 'SIM-08-math' || !simId ? (
									<QuadraticSimulation
										config={{
											simulation_id: 'SIM-08',
											subject: 'math',
											topic: 'quadratic',
											parameters: [
												{ key: 'a', value: mA, unit: '', label: 'a' },
												{ key: 'b', value: mB, unit: '', label: 'b' },
												{ key: 'c', value: mC, unit: '', label: 'c' },
											],
										}}
									/>
								) : simId === 'SIM-16' ? (
									<ProjectileArchSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-16',
											subject: 'math',
											topic: 'projectile-arch',
											parameters: [
												{ key: 'v0', value: mVel, unit: 'm/s', label: 'Vận tốc đầu' },
												{ key: 'alpha', value: mAngle, unit: '°', label: 'Góc ném' },
												{ key: 'g', value: mGrav, unit: 'm/s²', label: 'Gia tốc' },
											],
										}}
										isPlaying={isMPlaying}
										onAnimationEnd={() => setIsMPlaying(false)}
									/>
								) : simId === 'SIM-17' ? (
									<InequalitySimulation
										config={{
											simulation_id: 'SIM-17',
											subject: 'math',
											topic: 'inequality',
											parameters: [
												{ key: 'A1', value: inA1, unit: '', label: 'A1' },
												{ key: 'B1', value: inB1, unit: '', label: 'B1' },
												{ key: 'C1', value: inC1, unit: '', label: 'C1' },
												{ key: 'A2', value: inA2, unit: '', label: 'A2' },
												{ key: 'B2', value: inB2, unit: '', label: 'B2' },
												{ key: 'C2', value: inC2, unit: '', label: 'C2' },
												{ key: 'show1', value: showM1 ? 1 : 0, unit: '', label: 'show1' },
												{ key: 'show2', value: showM2 ? 1 : 0, unit: '', label: 'show2' },
											],
										}}
									/>
								) : simId === 'SIM-18' ? (
									<TriangulationSimulation
										config={{
											simulation_id: 'SIM-18',
											subject: 'math',
											topic: 'triangulation',
											parameters: [
												{ key: 'a', value: triA, unit: 'm', label: 'Khoảng cách' },
												{ key: 'alpha', value: triAlpha, unit: '°', label: 'Góc nâng' },
												{ key: 'h0', value: triH0, unit: 'm', label: 'Chiều cao mắt' },
											],
										}}
									/>
								) : simId === 'SIM-19' ? (
									<ConicSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-19',
											subject: 'math',
											topic: 'conic',
											parameters: [
												{ key: 'c', value: conicC, unit: '', label: 'Nửa tiêu cự c' },
												{ key: 'a', value: conicA, unit: '', label: 'Nửa trục lớn a' },
											],
										}}
										isPlaying={isCPlaying}
										onAnimationEnd={() => setIsCPlaying(false)}
									/>
								) : simId === 'SIM-20' ? (
									<StatisticsSimulation
										config={{
											simulation_id: 'SIM-20',
											subject: 'math',
											topic: 'statistics',
											parameters: [],
										}}
									/>
								) : (
									<div className='stu-ws__sim-placeholder'>Không tìm thấy mô phỏng Toán học tương ứng</div>
								)
							) : (
								<div className='stu-ws__sim-placeholder'>
									<div className='stu-ws__sim-icon'>
										<svg
											width='28'
											height='28'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='1.6'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M4 4v16h16' />
											<path d='M7 16c3-9 7-9 10 0' />
										</svg>
									</div>
									<div className='stu-ws__sim-label'>Điểm gắn Mô phỏng</div>
								</div>
							)}
						</div>

						<div className='stu-ws__formula-bar' dangerouslySetInnerHTML={renderTex(formulaText)} />
					</div>

					{/* RIGHT: AI Tutor + Quiz */}
					<div className='stu-ws__right'>
						{/* Tutor header */}
						<div className='stu-ws__tutor-header'>
							<div className='stu-ws__tutor-icon'>
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='#fff'
									strokeWidth='1.8'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 3v2M12 19v2M3 12h2M19 12h2' />
								</svg>
							</div>
							<span className='stu-ws__tutor-name'>{meta.tutor}</span>
							<div className='stu-ws__tutor-live' />
						</div>

						{/* Tabs Header */}
						<div className='stu-ws__right-tabs'>
							<div
								className={`stu-ws__right-tab ${activeRightTab === 'chat' ? 'stu-ws__right-tab--active' : ''}`}
								onClick={() => setActiveRightTab('chat')}
							>
								Trợ lý AI
							</div>
							<div
								className={`stu-ws__right-tab ${activeRightTab === 'quiz' ? 'stu-ws__right-tab--active' : ''}`}
								onClick={() => setActiveRightTab('quiz')}
							>
								AI Quiz
							</div>
						</div>

						{activeRightTab === 'chat' ? (
							<>
								{/* Chat messages */}
								<div className='stu-ws__chat scl'>
									{(chats[metaKey] || []).map((m, i) => (
										<div
											key={i}
											className={`stu-ws__chat-msg ${m.role === 'user' ? 'stu-ws__chat-msg--user' : 'stu-ws__chat-msg--ai'}`}
										>
											{m.text}
										</div>
									))}
								</div>

								{/* Chat input */}
								<div className='stu-ws__chat-input-row'>
									<input
										className='stu-ws__chat-input'
										value={chatInput}
										onChange={(e) => setChatInput(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && sendChat()}
										placeholder='Đặt câu hỏi…'
									/>
									<div className='stu-ws__chat-send' onClick={sendChat}>
										<svg
											width='18'
											height='18'
											viewBox='0 0 24 24'
											fill='none'
											stroke='#fff'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										>
											<path d='M5 12h14M13 6l6 6-6 6' />
										</svg>
									</div>
								</div>
							</>
						) : (
							/* Dynamic AI Quiz Panel */
							<div className='stu-ws__quiz-tab-content'>
								{dynQuizState === 'setup' && (
									<div className='stu-ws__quiz dqz-setup'>
										<div className='stu-ws__quiz-header'>
											<span className='stu-ws__quiz-badge'>AI QUIZ</span>
											<span className='stu-ws__quiz-count'>Sinh đề AI</span>
										</div>
										<div className='dqz-setup__label'>Chọn số câu hỏi ôn tập:</div>
										<div className='dqz-setup__options'>
											{([3, 5, 10] as const).map((n) => (
												<div
													key={n}
													className={`dqz-setup__count-btn ${dynQuizCount === n ? 'dqz-setup__count-btn--active' : ''}`}
													onClick={() => setDynQuizCount(n)}
												>
													{n} câu
												</div>
											))}
										</div>
										<div className='dqz-setup__hint'>
											AI sẽ sinh {dynQuizCount} câu trắc nghiệm có độ khó tăng dần về chủ đề đang mô phỏng.
										</div>
										<div className='dqz-setup__start-btn' onClick={startDynQuiz}>
											✨ Sinh đề ngay
										</div>
									</div>
								)}
								{dynQuizState === 'loading' && (
									<div className='stu-ws__quiz dqz-loading'>
										<div className='dqz-loading__spinner' />
										<div className='dqz-loading__text'>AI đang soạn đề thi cho bạn…</div>
									</div>
								)}
								{dynQuizState === 'active' &&
									dynQuestions.length > 0 &&
									(() => {
										const q = dynQuestions[dynCurrent];
										const picked = dynAnswers[dynCurrent];
										return (
											<div className='stu-ws__quiz'>
												<div className='stu-ws__quiz-header'>
													<span className='stu-ws__quiz-badge'>{dynUsedLlm ? '🤖 AI' : '📚 Quiz'}</span>
													<span className='stu-ws__quiz-count'>
														Câu {dynCurrent + 1}/{dynQuestions.length}
													</span>
													<div className='dqz-print-wrap'>
														<div
															className='dqz-print-btn'
															onClick={() => setShowPrintMenu((v) => !v)}
															title='In / Xuất PDF'
														>
															🖨️
														</div>
														{showPrintMenu && (
															<div className='dqz-print-menu'>
																<div className='dqz-print-menu__item' onClick={() => triggerPrint(true)}>
																	In có đáp án
																</div>
																<div className='dqz-print-menu__item' onClick={() => triggerPrint(false)}>
																	In không đáp án
																</div>
															</div>
														)}
													</div>
												</div>
												<div className='dqz-nav-dots'>
													{dynQuestions.map((_, i) => (
														<div
															key={i}
															className={`dqz-nav-dot ${i === dynCurrent ? 'dqz-nav-dot--active' : ''} ${dynAnswers[i] !== undefined ? (dynAnswers[i] === dynQuestions[i].correct ? 'dqz-nav-dot--correct' : 'dqz-nav-dot--wrong') : ''}`}
															onClick={() => setDynCurrent(i)}
														/>
													))}
												</div>
												<div className='stu-ws__quiz-question'>{q.q}</div>
												<div className='stu-ws__quiz-options'>
													{q.opts.map((o) => {
														const isSel = picked === o.k;
														const isCorrect = o.k === q.correct;
														let optClass = '';
														if (!picked) optClass = '';
														else if (isCorrect) optClass = 'stu-ws__quiz-opt--correct';
														else if (isSel) optClass = 'stu-ws__quiz-opt--wrong';
														else optClass = 'stu-ws__quiz-opt--dimmed';
														return (
															<div
																key={o.k}
																className={`stu-ws__quiz-opt ${optClass}`}
																onClick={() => pickDynAnswer(dynCurrent, o.k)}
															>
																<div
																	className={`stu-ws__quiz-radio ${isCorrect && picked ? 'stu-ws__quiz-radio--correct' : ''} ${isSel && !isCorrect ? 'stu-ws__quiz-radio--wrong' : ''}`}
																/>
																<span>
																	<b>{o.k.toUpperCase()}.</b> {o.t}
																</span>
															</div>
														);
													})}
												</div>
												{picked && (
													<div
														className={`stu-ws__quiz-feedback ${picked === q.correct ? 'stu-ws__quiz-feedback--correct' : 'stu-ws__quiz-feedback--wrong'}`}
													>
														{picked === q.correct ? '✓ Chính xác!' : '✗ Chưa đúng.'}
														{q.explanation && (
															<span style={{ display: 'block', fontWeight: 400, marginTop: 4, fontSize: 12 }}>
																{q.explanation}
															</span>
														)}
													</div>
												)}
												<div className='dqz-nav-btns'>
													{dynCurrent > 0 && (
														<div className='dqz-nav-btn' onClick={() => setDynCurrent((c) => c - 1)}>
															← Trước
														</div>
													)}
													<div style={{ flex: 1 }} />
													{dynCurrent < dynQuestions.length - 1 ? (
														<div
															className='dqz-nav-btn dqz-nav-btn--primary'
															onClick={() => setDynCurrent((c) => c + 1)}
														>
															Tiếp →
														</div>
													) : (
														<div className='dqz-nav-btn dqz-nav-btn--primary' onClick={() => setDynQuizState('done')}>
															Xem kết quả
														</div>
													)}
												</div>
											</div>
										);
									})()}
								{dynQuizState === 'done' &&
									(() => {
										const totalCorrect = dynQuestions.filter((q, i) => dynAnswers[i] === q.correct).length;
										const pct = Math.round((totalCorrect / dynQuestions.length) * 100);
										return (
											<div className='stu-ws__quiz dqz-results'>
												<div className='stu-ws__quiz-header'>
													<span className='stu-ws__quiz-badge'>KẾT QUẢ</span>
													<div className='dqz-print-wrap'>
														<div
															className='dqz-print-btn'
															onClick={() => setShowPrintMenu((v) => !v)}
															title='In / Xuất PDF'
														>
															🖨️
														</div>
														{showPrintMenu && (
															<div className='dqz-print-menu'>
																<div className='dqz-print-menu__item' onClick={() => triggerPrint(true)}>
																	In có đáp án
																</div>
																<div className='dqz-print-menu__item' onClick={() => triggerPrint(false)}>
																	In không đáp án
																</div>
															</div>
														)}
													</div>
												</div>
												<div className='dqz-results__score'>
													<div className='dqz-results__pct'>{pct}%</div>
													<div className='dqz-results__sub'>
														{totalCorrect}/{dynQuestions.length} câu đúng
													</div>
												</div>
												<div className='dqz-results__list'>
													{dynQuestions.map((q, i) => (
														<div
															key={i}
															className={`dqz-results__item ${dynAnswers[i] === q.correct ? 'dqz-results__item--correct' : 'dqz-results__item--wrong'}`}
														>
															<span>{dynAnswers[i] === q.correct ? '✓' : '✗'}</span>
															<span>
																Câu {i + 1}: Đáp án đúng là <b>{q.correct.toUpperCase()}</b>
															</span>
														</div>
													))}
												</div>
												<div className='dqz-setup__start-btn' style={{ marginTop: 8 }} onClick={resetDynQuiz}>
													🔄 Làm lại bộ đề mới
												</div>
											</div>
										);
									})()}
								<div className='stu-ws__print-area' id='quiz-print-area'>
									<div className='print-header'>
										<h1>ĐỀ TRẮC NGHIỆM ÔN TẬP</h1>
										<p>
											{meta.label} · {meta.title}
										</p>
										<p>
											Số câu: {dynQuestions.length} · Thời gian: {dynQuestions.length * 2} phút
										</p>
									</div>
									<div className='print-questions'>
										{dynQuestions.map((q, i) => (
											<div key={i} className='print-question'>
												<div className='print-q-text'>
													<b>Câu {i + 1}:</b> {q.q}
												</div>
												<div className='print-opts'>
													{q.opts.map((o) => (
														<div key={o.k} className='print-opt'>
															<b>{o.k.toUpperCase()}.</b> {o.t}
														</div>
													))}
												</div>
											</div>
										))}
									</div>
									{dynQuestions.length > 0 && printWithAnswers && (
										<div className='print-answer-key'>
											<h2>BẢNG ĐÁP ÁN</h2>
											<div className='print-key-grid'>
												{dynQuestions.map((q, i) => (
													<div key={i} className='print-key-item'>
														Câu {i + 1}: <b>{q.correct.toUpperCase()}</b>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default Workspace;
