import React, { useState, useMemo, useCallback } from 'react';
import { history, useLocation } from 'umi';
import { chatWithAiPrompt, generateAiQuiz } from '@/services/ai/api';
import StudentLayout from '../components/StudentLayout';
import ProjectileSimulation from '@simulations/physics/SIM-02-projectile';
import EsterSimulation from '@simulations/chemistry/SIM-01-ester';
import SoapSimulation from '@simulations/chemistry/SIM-03-soap';
import GenericChemSimulation from '@simulations/chemistry/GenericChemSimulation';

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
	'SIM-01': { label: 'Hóa học', title: 'Điều chế ethyl acetate (phản ứng ester hóa)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-03': { label: 'Hóa học', title: 'Phản ứng xà phòng hóa chất béo', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-04': { label: 'Hóa học', title: 'Glucose tác dụng với Cu(OH)₂', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-05': { label: 'Hóa học', title: 'Phản ứng tráng bạc của glucose', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-06': { label: 'Hóa học', title: 'Phản ứng màu của tinh bột với iodine', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-07': { label: 'Hóa học', title: 'Phản ứng màu biuret của protein', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-08': { label: 'Hóa học', title: 'Sodium tác dụng với nước', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-09': { label: 'Hóa học', title: 'Đinh sắt tác dụng với dung dịch CuSO₄', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-10': { label: 'Hóa học', title: 'Nhôm tác dụng với dung dịch NaOH', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-11': { label: 'Hóa học', title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-12': { label: 'Hóa học', title: 'Điều chế Fe(OH)₂ và Fe(OH)₃', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-13': { label: 'Hóa học', title: 'Điện phân dung dịch CuSO₄', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-14': { label: 'Hóa học', title: 'Ăn mòn điện hóa học (pin Zn – Cu)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'SIM-15': { label: 'Hóa học 10', title: 'Thí nghiệm bắn phá lá vàng (Rutherford, 1911)', tutor: 'Trợ lý hạt nhân AI', className: 'chem' },
	'SIM-02': { label: 'Vật lý', title: 'Chuyển động ném xiên', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-08-math': { label: 'Toán', title: 'Đồ thị hàm số bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-16': { label: 'Toán', title: 'Ném xiên và vòm cổng parabol', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-17': { label: 'Toán', title: 'Miền nghiệm hệ bất phương trình', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-18': { label: 'Toán', title: 'Hệ thức lượng tam giác cột cờ', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-19': { label: 'Toán', title: 'Định nghĩa Elip ghim đinh', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-20': { label: 'Toán', title: 'Thống kê số liệu mẫu và biểu đồ', tutor: 'Trợ lý Toán AI', className: 'math' },
	'default_math': { label: 'Toán', title: 'Hàm bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
	'default_physics': { label: 'Vật lý', title: 'Chuyển động ném xiên', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
};

// ── Initial chat messages ──
const LAB_INITIAL_CHATS: Record<string, ChatMessage[]> = {
	'SIM-01': [
		{ role: 'ai', text: 'Chào mừng bạn đến với thí nghiệm điều chế ethyl acetate! H₂SO₄ đặc đóng vai trò gì trong phản ứng này?' },
	],
	'SIM-03': [
		{ role: 'ai', text: 'Chào mừng bạn đến với thí nghiệm phản ứng xà phòng hóa chất béo! Phản ứng xà phòng hóa chất béo là phản ứng thủy phân ester trong môi trường kiềm hay axit?' },
	],
	'SIM-04': [
		{ role: 'ai', text: 'Chào bạn! Trong phản ứng với Cu(OH)₂ ở nhiệt độ thường, glucose thể hiện tính chất của hợp chất nào?' },
	],
	'SIM-05': [
		{ role: 'ai', text: 'Chào bạn! Glucose có thể tham gia phản ứng tráng bạc là nhờ nhóm chức nào trong phân tử?' },
	],
	'SIM-06': [
		{ role: 'ai', text: 'Chào bạn! Phản ứng màu giữa tinh bột và iodine có phải phản ứng hóa học tạo liên kết mới không?' },
	],
	'SIM-07': [
		{ role: 'ai', text: 'Chào bạn! Những peptide hoặc protein nào có khả năng cho phản ứng màu biuret?' },
	],
	'SIM-08': [
		{ role: 'ai', text: 'Chào bạn! Kim loại kiềm sodium phản ứng với nước tạo ra dung dịch gì và khí gì?' },
	],
	'SIM-09': [
		{ role: 'ai', text: 'Chào bạn! Thí nghiệm sắt tác dụng với đồng(II) sulfate minh họa cho loại phản ứng nào?' },
	],
	'SIM-10': [
		{ role: 'ai', text: 'Chào bạn! Nhôm có phải kim loại phản ứng trực tiếp với dung dịch kiềm NaOH không?' },
	],
	'SIM-11': [
		{ role: 'ai', text: 'Chào bạn! Phản ứng nhiệt nhôm là phản ứng tỏa nhiệt cực mạnh dùng để làm gì trong thực tế?' },
	],
	'SIM-12': [
		{ role: 'ai', text: 'Chào bạn! Tại sao Fe(OH)₂ màu trắng xanh lại chuyển sang màu nâu đỏ khi để ngoài không khí?' },
	],
	'SIM-13': [
		{ role: 'ai', text: 'Chào bạn! Khi điện phân dung dịch CuSO₄ bằng điện cực trơ, ion nào sẽ nhận electron ở cathode?' },
	],
	'SIM-14': [
		{ role: 'ai', text: 'Chào bạn! Trong pin điện hóa Zn-Cu nhúng trong H₂SO₄ loãng, kim loại nào đóng vai trò anode (cực âm) và bị ăn mòn?' },
	],
	'SIM-15': [
		{ role: 'ai', text: 'Chào bạn! Thí nghiệm bắn phá lá vàng của Rutherford đã chứng minh điều gì về cấu tạo nguyên tử?' },
	],
	'default_physics': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng thí nghiệm Vật lý! Hãy điều chỉnh các thanh trượt và đặt câu hỏi cho mình nếu có thắc mắc nhé.' },
	],
	'SIM-02': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng thí nghiệm Ném xiên! Ở góc 45°, bạn gần đạt tầm xa tối đa. Bạn nghĩ điều gì xảy ra nếu tăng góc lên 60°?' },
	],
	'default_math': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng Toán học! Hãy điều chỉnh các tham số và đặt câu hỏi cho mình nếu cần trợ giúp nhé.' },
	],
	'SIM-08-math': [
		{ role: 'ai', text: 'Chào bạn! Chúng ta cùng khảo sát đồ thị hàm số bậc hai y = ax² + bx + c. Bạn có biết khi a > 0 thì bề lõm quay lên hay quay xuống không?' },
	],
	'SIM-16': [
		{ role: 'ai', text: 'Chào bạn! Thí nghiệm kết hợp giữa toán parabol và ném xiên vật lý. Bạn cần chọn góc alpha và vận tốc v0 sao cho quả bóng bay qua khớp hoàn hảo với vòm cổng đá. Hãy thử xem!' },
	],
	'SIM-17': [
		{ role: 'ai', text: 'Chào mừng bạn đến với mô phỏng miền nghiệm hệ bất phương trình! Vùng màu đậm nhất thể hiện điều gì?' },
	],
	'SIM-18': [
		{ role: 'ai', text: 'Chào bạn! Chúng ta sẽ dùng hệ thức lượng trong tam giác để đo chiều cao cột cờ. Công thức tính chiều cao H từ khoảng cách a, chiều cao mắt h0 và góc nâng alpha là gì?' },
	],
	'SIM-19': [
		{ role: 'ai', text: 'Chào bạn! Hãy khám phá cách vẽ elip bằng ghim đinh và vòng dây. Tổng khoảng cách từ điểm M đến hai tiêu điểm F1 và F2 có đặc điểm gì?' },
	],
	'SIM-20': [
		{ role: 'ai', text: 'Chào bạn! Chúng ta cùng tìm hiểu các số đặc trưng đo xu thế trung tâm và độ phân tán. Bạn có thể tự nhập dữ liệu số liệu của lớp mình vào ô nhập liệu nhé.' },
	],
};

// ── Quiz data ──
const LAB_QUIZZES = {
	'SIM-01': {
		q: 'Vai trò chính của dung dịch H₂SO₄ đặc trong phản ứng ester hóa là gì?',
		opts: [{ k: 'a', t: 'Làm chất xúc tác' }, { k: 'b', t: 'Hút nước dịch chuyển cân bằng' }, { k: 'c', t: 'Vừa làm xúc tác vừa hút nước' }],
		correct: 'c',
	},
	'SIM-03': {
		q: 'Vai trò chính của dung dịch NaCl bão hòa được thêm vào ở bước 5 là gì?',
		opts: [
			{ k: 'a', t: 'Làm chất xúc tác cho phản ứng' },
			{ k: 'b', t: 'Làm giảm độ tan của xà phòng để muối natri tách ra và nổi lên' },
			{ k: 'c', t: 'Hòa tan hoàn toàn glixerol giải phóng' }
		],
		correct: 'b',
	},
	'SIM-04': {
		q: 'Phản ứng của glucose với Cu(OH)₂ ở nhiệt độ thường chứng minh glucose có cấu tạo nào?',
		opts: [
			{ k: 'a', t: 'Có nhiều nhóm hydroxy (–OH) kề nhau' },
			{ k: 'b', t: 'Có nhóm chức aldehyde (–CHO)' },
			{ k: 'c', t: 'Có liên kết ester' }
		],
		correct: 'a',
	},
	'SIM-05': {
		q: 'Nhóm chức nào của glucose chịu trách nhiệm cho phản ứng tráng bạc?',
		opts: [
			{ k: 'a', t: 'Nhóm aldehyde (–CHO)' },
			{ k: 'b', t: 'Nhóm hydroxy (–OH)' },
			{ k: 'c', t: 'Nhóm carboxylic (–COOH)' }
		],
		correct: 'a',
	},
	'SIM-06': {
		q: 'Tại sao khi đun nóng ống nghiệm chứa hồ tinh bột và iodine thì dung dịch lại mất màu?',
		opts: [
			{ k: 'a', t: 'Iodine bị thăng hoa bay ra ngoài hoàn toàn' },
			{ k: 'b', t: 'Cấu trúc xoắn duỗi ra, giải phóng các phân tử iodine' },
			{ k: 'c', t: 'Iodine phản ứng tạo chất mới không màu' }
		],
		correct: 'b',
	},
	'SIM-07': {
		q: 'Chất nào sau đây KHÔNG cho phản ứng màu biuret với Cu(OH)₂ trong môi trường kiềm?',
		opts: [
			{ k: 'a', t: 'Lòng trắng trứng (albumin)' },
			{ k: 'b', t: 'Dipeptide Gly-Ala' },
			{ k: 'c', t: 'Tripeptide Gly-Ala-Val' }
		],
		correct: 'b',
	},
	'SIM-08': {
		q: 'Hiện tượng nào sau đây KHÔNG xảy ra khi cho mẩu sodium nhỏ vào chậu nước có phenolphthalein?',
		opts: [
			{ k: 'a', t: 'Mẩu sodium chìm xuống đáy chậu và tan dần' },
			{ k: 'b', t: 'Mẩu sodium nóng chảy thành giọt tròn chạy trên mặt nước' },
			{ k: 'c', t: 'Dung dịch chuyển sang màu hồng' }
		],
		correct: 'a',
	},
	'SIM-09': {
		q: 'Bản chất của phản ứng giữa đinh sắt và dung dịch CuSO₄ là gì?',
		opts: [
			{ k: 'a', t: 'Phản ứng trao đổi ion' },
			{ k: 'b', t: 'Phản ứng oxi hóa - khử, Fe khử Cu²⁺' },
			{ k: 'c', t: 'Phản ứng phân hủy' }
		],
		correct: 'b',
	},
	'SIM-10': {
		q: 'Tại sao không dùng các xô chậu bằng nhôm để đựng dung dịch kiềm?',
		opts: [
			{ k: 'a', t: 'Vì nhôm phản ứng trực tiếp với khí oxi trong kiềm' },
			{ k: 'b', t: 'Vì dung dịch kiềm hòa tan lớp màng bảo vệ Al₂O₃ và sau đó ăn mòn nhôm' },
			{ k: 'c', t: 'Vì nhôm bị oxi hóa tạo thành muối không tan gây hỏng chậu' }
		],
		correct: 'b',
	},
	'SIM-11': {
		q: 'Trong phản ứng nhiệt nhôm giữa Al và Fe₂O₃, vai trò của Al là gì?',
		opts: [
			{ k: 'a', t: 'Chất oxi hóa' },
			{ k: 'b', t: 'Chất khử' },
			{ k: 'c', t: 'Chất xúc tác' }
		],
		correct: 'b',
	},
	'SIM-12': {
		q: 'Phản ứng chuyển màu của Fe(OH)₂ ngoài không khí ẩm thuộc loại phản ứng nào?',
		opts: [
			{ k: 'a', t: 'Phản ứng trao đổi' },
			{ k: 'b', t: 'Phản ứng oxi hóa - khử, Fe(II) bị oxi hóa lên Fe(III)' },
			{ k: 'c', t: 'Phản ứng phân hủy' }
		],
		correct: 'b',
	},
	'SIM-13': {
		q: 'Sản phẩm thu được ở anode (cực dương) khi điện phân dung dịch CuSO₄ với điện cực trơ là gì?',
		opts: [
			{ k: 'a', t: 'Kim loại Cu' },
			{ k: 'b', t: 'Khí O₂ và ion H⁺' },
			{ k: 'c', t: 'Khí SO₂' }
		],
		correct: 'b',
	},
	'SIM-14': {
		q: 'Khi nối hai thanh Zn và Cu bằng dây dẫn trong cốc chứa dung dịch H₂SO₄ loãng, electron di chuyển như thế nào?',
		opts: [
			{ k: 'a', t: 'Từ thanh Cu sang thanh Zn qua dây dẫn' },
			{ k: 'b', t: 'Từ thanh Zn sang thanh Cu qua dây dẫn' },
			{ k: 'c', t: 'Không có sự di chuyển electron qua dây dẫn' }
		],
		correct: 'b',
	},
	'SIM-15': {
		q: 'Tại sao phần lớn các hạt alpha lại xuyên thẳng qua lá vàng mà không bị lệch hướng?',
		opts: [
			{ k: 'a', t: 'Vì hạt alpha không mang điện tích' },
			{ k: 'b', t: 'Vì lá vàng rất mỏng và nguyên tử có cấu tạo chủ yếu là không gian rỗng' },
			{ k: 'c', t: 'Vì hạt nhân nguyên tử vàng mang điện tích âm' }
		],
		correct: 'b',
	},
	'default_physics': {
		q: 'Bỏ qua sức cản không khí, góc ném nào cho tầm xa tối đa?',
		opts: [{ k: 'a', t: '30°' }, { k: 'b', t: '45°' }, { k: 'c', t: '75°' }],
		correct: 'b',
	},
	'SIM-02': {
		q: 'Bỏ qua sức cản không khí, góc ném nào cho tầm xa tối đa?',
		opts: [{ k: 'a', t: '30°' }, { k: 'b', t: '45°' }, { k: 'c', t: '75°' }],
		correct: 'b',
	},
	'default_math': {
		q: 'Nghiệm của y = x² − 2x − 3 là?',
		opts: [{ k: 'a', t: 'x = −1 và x = 3' }, { k: 'b', t: 'x = 1 và x = −3' }, { k: 'c', t: 'x = 0 và x = 3' }],
		correct: 'a',
	},
	'SIM-08-math': {
		q: 'Tọa độ đỉnh I của đồ thị hàm số bậc hai y = ax² + bx + c được tính theo công thức nào?',
		opts: [
			{ k: 'a', t: 'I(-b/(2a); -delta/(4a))' },
			{ k: 'b', t: 'I(-b/a; -delta/(2a))' },
			{ k: 'c', t: 'I(b/(2a); delta/(4a))' }
		],
		correct: 'a'
	},
	'SIM-16': {
		q: 'Bỏ qua sức cản không khí, quỹ đạo chuyển động ném xiên là một đường gì?',
		opts: [
			{ k: 'a', t: 'Đường thẳng đứng' },
			{ k: 'b', t: 'Đường parabol' },
			{ k: 'c', t: 'Đường elip' }
		],
		correct: 'b'
	},
	'SIM-17': {
		q: 'Miền nghiệm của bất phương trình bậc nhất hai ẩn ax + by <= c là nửa mặt phẳng như thế nào?',
		opts: [
			{ k: 'a', t: 'Có bờ là đường thẳng ax + by = c' },
			{ k: 'b', t: 'Không chứa đường thẳng bờ' },
			{ k: 'c', t: 'Không xác định được bờ' }
		],
		correct: 'a'
	},
	'SIM-18': {
		q: 'Trong tam giác vuông, cạnh đối diện góc nhọn alpha được tính bằng:',
		opts: [
			{ k: 'a', t: 'Cạnh kề nhân với sin(alpha)' },
			{ k: 'b', t: 'Cạnh kề nhân với tan(alpha)' },
			{ k: 'c', t: 'Cạnh huyền nhân với tan(alpha)' }
		],
		correct: 'b'
	},
	'SIM-19': {
		q: 'Cho elip có phương trình chính tắc x²/a² + y²/b² = 1 (a > b > 0). Mối liên hệ giữa a, b và nửa tiêu cự c là:',
		opts: [
			{ k: 'a', t: 'a² = b² + c²' },
			{ k: 'b', t: 'b² = a² + c²' },
			{ k: 'c', t: 'c² = a² + b²' }
		],
		correct: 'a'
	},
	'SIM-20': {
		q: 'Khoảng tứ phân vị IQR được tính theo công thức nào?',
		opts: [
			{ k: 'a', t: 'IQR = Q2 - Q1' },
			{ k: 'b', t: 'IQR = Q3 - Q1' },
			{ k: 'c', t: 'IQR = Q3 - Q2' }
		],
		correct: 'b'
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

const Workspace: React.FC = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const subject = (params.get('subject') || 'physics') as SubjectKey;
	const simId = params.get('sim') || (subject === 'chem' ? 'SIM-01' : subject === 'physics' ? 'SIM-02' : '');
	const metaKey = ['SIM-01', 'SIM-02', 'SIM-03', 'SIM-04', 'SIM-05', 'SIM-06', 'SIM-07', 'SIM-08', 'SIM-09', 'SIM-10', 'SIM-11', 'SIM-12', 'SIM-13', 'SIM-14', 'SIM-15', 'SIM-16', 'SIM-17', 'SIM-18', 'SIM-19', 'SIM-20'].includes(simId)
		? (simId === 'SIM-08' && subject === 'math' ? 'SIM-08-math' : simId)
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
			'default_physics': LAB_INITIAL_CHATS['default_physics'],
			'default_math': LAB_INITIAL_CHATS['default_math'],
		};
		Object.keys(LAB_INITIAL_CHATS).forEach(k => {
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

	const pickDynAnswer = useCallback((idx: number, key: string) => {
		if (dynAnswers[idx] !== undefined) return;
		setDynAnswers(prev => ({ ...prev, [idx]: key }));
	}, [dynAnswers]);

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
		const f = (x: number) => { const r = Math.round(x * 10) / 10; return Object.is(r, -0) ? 0 : r; };
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
				{ role: 'ai' as const, text: 'Trợ lý đang suy nghĩ...' }
			],
		}));
		setChatInput('');

		const context = currentHistory.map(m => ({
			role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
			content: m.text
		}));

		try {
			const gradeVal = subject === 'chem' ? 12 : subject === 'physics' ? 11 : 10;
			const res = await chatWithAiPrompt({
				message: t,
				subject,
				grade: gradeVal,
				simulationId: simId,
				context
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
					updated[updated.length - 1] = { role: 'ai' as const, text: 'Đã xảy ra lỗi kết nối với máy chủ AI. Vui lòng thử lại.' };
					return { ...prev, [metaKey]: updated };
				}
				return prev;
			});
		}
	}, [chatInput, metaKey, chats, subject, simId]);



	// ── Reset ──
	const resetParams = useCallback(() => {
		if (subject === 'physics') {
			setPhAngle(45);
			setPhVel(20);
			setPhGrav(9.8);
			setPhAir(false);
			setPhVec(true);
			setIsPhPlaying(false);
			setIsPhSlow(false);
		}
		else if (subject === 'math') {
			if (simId === 'SIM-08' || simId === 'SIM-08-math') {
				setMA(1); setMB(-2); setMC(-3);
			} else if (simId === 'SIM-16') {
				setMAngle(45); setMVel(15); setMGrav(9.8); setIsMPlaying(false);
			} else if (simId === 'SIM-17') {
				setInA1(1); setInB1(1); setInC1(2);
				setInA2(-1); setInB2(2); setInC2(4);
				setShowM1(true); setShowM2(true);
			} else if (simId === 'SIM-18') {
				setTriA(10); setTriAlpha(45); setTriH0(1.5);
			} else if (simId === 'SIM-19') {
				setConicC(3); setConicA(5); setIsCPlaying(false);
			}
		}
		else { setChemStep(1); }
	}, [subject, simId]);



	const f = (x: number) => { const r = Math.round(x * 10) / 10; return Object.is(r, -0) ? 0 : r; };

	const formulaText = subject === 'physics'
		? 'y = v·sinθ·t − ½·g·t²'
		: subject === 'math'
			? (simId === 'SIM-16'
				? `x(t) = 2 + v₀·cosα·t  ·  y(t) = v₀·sinα·t − ½·g·t²  ·  Cổng: y = -0.25·(x-8)² + 9`
				: simId === 'SIM-17'
					? `d1: ${f(inA1)}x ${inB1 >= 0 ? '+' : '−'} ${Math.abs(f(inB1))}y ≤ ${f(inC1)}  ·  d2: ${f(inA2)}x ${inB2 >= 0 ? '+' : '−'} ${Math.abs(f(inB2))}y ≤ ${f(inC2)}`
					: simId === 'SIM-18'
						? `H = h₀ + a·tan(α) = ${f(triH0)} + ${f(triA)}·tan(${triAlpha}°) = ${(triH0 + triA * Math.tan((triAlpha * Math.PI) / 180)).toFixed(2)}m`
						: simId === 'SIM-19'
							? `Elip: x²/a² + y²/b² = 1  ·  MF₁ + MF₂ = 2a  (a=${f(conicA)}, b=${Math.sqrt(Math.max(0.1, conicA * conicA - conicC * conicC)).toFixed(2)}, c=${f(conicC)})`
							: simId === 'SIM-20'
								? `Số trung bình x̄ = Σx_i / n  ·  Độ lệch chuẩn s = √[Σ(x_i - x̄)² / n]`
								: `y = ${f(mA)}x² ${mB >= 0 ? '+' : '−'} ${Math.abs(f(mB))}x ${mC >= 0 ? '+' : '−'} ${Math.abs(f(mC))}`)
			: simId === 'SIM-03'
				? '(C₁₇H₃₅COO)₃C₃H₅ + 3NaOH → (t°) 3C₁₇H₃₅COONa + C₃H₅(OH)₃'
				: simId === 'SIM-04'
					? 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄  ·  2C₆H₁₂O₆ + Cu(OH)₂ → (C₆H₁₁O₆)₂Cu + 2H₂O'
					: simId === 'SIM-05'
						? 'CH₂OH[CHOH]₄CHO + 2[Ag(NH₃)₂]OH → (t°) CH₂OH[CHOH]₄COONH₄ + 2Ag↓ + 3NH₃ + H₂O'
						: simId === 'SIM-06'
							? 'Hồ tinh bột + I₂ ⇌ Hợp chất màu xanh tím (mất màu khi đun)'
							: simId === 'SIM-07'
								? 'Protein + Cu(OH)₂ / OH⁻ → Phức chất màu tím biuret đặc trưng'
								: simId === 'SIM-08'
									? '2Na + 2H₂O → 2NaOH + H₂↑ (phản ứng tỏa nhiệt mạnh)'
									: simId === 'SIM-09'
										? 'Fe + CuSO₄ → FeSO₄ + Cu↓'
										: simId === 'SIM-10'
											? '2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂↑'
											: simId === 'SIM-11'
												? '2Al + Fe₂O₃ → (t°) Al₂O₃ + 2Fe (phản ứng nhiệt nhôm)'
												: simId === 'SIM-12'
													? 'FeCl₂ + 2NaOH → Fe(OH)₂↓  ·  4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃'
													: simId === 'SIM-13'
														? '2CuSO₄ + 2H₂O → (điện phân) 2Cu↓ + O₂↑ + 2H₂SO₄'
														: simId === 'SIM-14'
															? 'Cực âm (Zn): Zn → Zn²⁺ + 2e  ·  Cực dương (Cu): 2H⁺ + 2e → H₂↑'
															: simId === 'SIM-15'
																? 'Hạt α = ⁴₂He²⁺  ·  Hầu hết đi thẳng, một số lệch/bật ngược'
																: 'CH₃COOH + C₂H₅OH ⇌ (H₂SO₄ đặc, t°) CH₃COOC₂H₅ + H₂O';

	const centerTitle = subject === 'physics'
		? 'Quỹ đạo'
		: subject === 'math'
			? (simId === 'SIM-08' || simId === 'SIM-08-math' || !simId ? 'Đồ thị hàm bậc hai' : simId === 'SIM-16' ? 'Quỹ đạo và vòm cổng' : simId === 'SIM-17' ? 'Miền nghiệm hệ BPT' : simId === 'SIM-18' ? 'Đo đạc thực tế' : simId === 'SIM-19' ? 'Vẽ Elip' : 'Thống kê số liệu')
			: 'Mô phỏng phản ứng';

	return (
		<StudentLayout hideSidebar>
			<div className="stu-ws">
				{/* Subheader */}
				<div className="stu-ws__subheader">
					<div className="stu-ws__subheader-left">
						<div className="stu-ws__back" onClick={() => history.push('/hoc-sinh')}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M15 6l-6 6 6 6" />
							</svg>
						</div>
						<div className={`stu-ws__subject-pill stu-ws__subject-pill--${meta.className}`}>{meta.label}</div>
						<span className="stu-ws__breadcrumb-sep">/</span>
						<span className="stu-ws__breadcrumb-title">{meta.title}</span>
					</div>
					<div className="stu-ws__live-badge">
						<div className="stu-ws__live-dot" />
						Trực tiếp · cập nhật khi tương tác
					</div>
					<div className="stu-ws__subheader-actions">
						<div className="stu-ws__btn-secondary" onClick={resetParams}>Đặt lại</div>
						<div className="stu-ws__btn-primary">Lưu & Nộp</div>
					</div>
				</div>

				{/* 3-Panel Layout */}
				<div className="stu-ws__panels">
					{/* LEFT: Parameters */}
					<div className="stu-ws__left scl">
						{/* Physics Params */}
						{subject === 'physics' && (
							<>
								<div className="stu-ws__section-label">Thông số</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>Góc ném</span><span className="stu-ws__param-val">{phAngle}°</span></div>
									<input type="range" min={0} max={90} step={1} value={phAngle} onChange={(e) => setPhAngle(+e.target.value)} />
								</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>Vận tốc ban đầu</span><span className="stu-ws__param-val">{phVel} m/s</span></div>
									<input type="range" min={1} max={40} step={1} value={phVel} onChange={(e) => setPhVel(+e.target.value)} />
								</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>Gia tốc trọng trường</span><span className="stu-ws__param-val">{f(phGrav)} m/s²</span></div>
									<input type="range" min={1} max={20} step={0.1} value={phGrav} onChange={(e) => setPhGrav(+e.target.value)} />
								</div>
								<div className="stu-ws__toggle-row" onClick={() => setPhAir(!phAir)}>
									<span>Sức cản không khí</span>
									<div className={`stu-ws__toggle ${phAir ? 'stu-ws__toggle--on' : ''}`}>
										<div className="stu-ws__toggle-knob" />
									</div>
								</div>
								<div className="stu-ws__toggle-row" onClick={() => setPhVec(!phVec)}>
									<span>Hiện vector vận tốc</span>
									<div className={`stu-ws__toggle ${phVec ? 'stu-ws__toggle--on' : ''}`}>
										<div className="stu-ws__toggle-knob" />
									</div>
								</div>
								<div className="stu-ws__results">
									<div className="stu-ws__results-title">Kết quả trực tiếp</div>
									<div className="stu-ws__result-row"><span>Tầm xa</span><span className="stu-ws__result-val stu-ws__result-val--accent">{physicsCalc.range} m</span></div>
									<div className="stu-ws__result-row"><span>Độ cao tối đa</span><span className="stu-ws__result-val">{physicsCalc.maxH} m</span></div>
									<div className="stu-ws__result-row"><span>Thời gian bay</span><span className="stu-ws__result-val">{physicsCalc.time} s</span></div>
								</div>
							</>
						)}

						{/* Math Params */}
						{subject === 'math' && (
							<>
								<div className="stu-ws__section-label">Thông số</div>
								
								{/* SIM-08 or default_math: Quadratic Graph */}
								{(simId === 'SIM-08' || simId === 'SIM-08-math' || !simId) && (
									<>
										<div className="stu-ws__formula-box">y = a·x² + b·x + c</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>a</span><span className="stu-ws__param-val">{f(mA).toFixed(1)}</span></div>
											<input type="range" min={-3} max={3} step={0.1} value={mA} onChange={(e) => setMA(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>b</span><span className="stu-ws__param-val">{f(mB).toFixed(1)}</span></div>
											<input type="range" min={-6} max={6} step={0.1} value={mB} onChange={(e) => setMB(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>c</span><span className="stu-ws__param-val">{f(mC).toFixed(1)}</span></div>
											<input type="range" min={-6} max={6} step={0.1} value={mC} onChange={(e) => setMC(+e.target.value)} />
										</div>
										<div className="stu-ws__results">
											<div className="stu-ws__results-title">Thông tin</div>
											<div className="stu-ws__result-row"><span>Đỉnh</span><span className="stu-ws__result-val stu-ws__result-val--accent">{mathCalc.vertex}</span></div>
											<div className="stu-ws__result-row"><span>Nghiệm</span><span className="stu-ws__result-val">{mathCalc.roots}</span></div>
											<div className="stu-ws__result-row"><span>Trục đối xứng</span><span className="stu-ws__result-val">{mathCalc.axis}</span></div>
										</div>
									</>
								)}

								{/* SIM-16: Projectile & Parabolic Arch */}
								{simId === 'SIM-16' && (
									<>
										<div className="stu-ws__formula-box">Quỹ đạo & vòm cổng</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Góc ném (α)</span><span className="stu-ws__param-val">{mAngle}°</span></div>
											<input type="range" min={10} max={85} step={1} value={mAngle} onChange={(e) => setMAngle(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Vận tốc đầu (v₀)</span><span className="stu-ws__param-val">{mVel} m/s</span></div>
											<input type="range" min={5} max={25} step={0.5} value={mVel} onChange={(e) => setMVel(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Gia tốc (g)</span><span className="stu-ws__param-val">{f(mGrav)} m/s²</span></div>
											<input type="range" min={5} max={15} step={0.1} value={mGrav} onChange={(e) => setMGrav(+e.target.value)} />
										</div>
										<div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '6px', lineHeight: '1.4' }}>
											💡 <b>Bài toán thực tế:</b> Cổng đá dạng parabol cao 9m, rộng 12m. Hãy điều chỉnh góc ném α và vận tốc v₀ để quỹ đạo bay khớp hoàn hảo vòm cổng!
										</div>
									</>
								)}

								{/* SIM-17: Linear Inequalities */}
								{simId === 'SIM-17' && (
									<>
										<div className="stu-ws__formula-box">Hệ bất phương trình</div>
										<div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}>Bất phương trình 1:</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Hệ số A₁</span><span className="stu-ws__param-val">{inA1}</span></div>
											<input type="range" min={-5} max={5} step={0.5} value={inA1} onChange={(e) => setInA1(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Hệ số B₁</span><span className="stu-ws__param-val">{inB1}</span></div>
											<input type="range" min={-5} max={5} step={0.5} value={inB1} onChange={(e) => setInB1(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Hằng số C₁</span><span className="stu-ws__param-val">{inC1}</span></div>
											<input type="range" min={-10} max={10} step={0.5} value={inC1} onChange={(e) => setInC1(+e.target.value)} />
										</div>
										<div className="stu-ws__toggle-row" onClick={() => setShowM1(!showM1)}>
											<span>Tô miền nghiệm 1</span>
											<div className={`stu-ws__toggle ${showM1 ? 'stu-ws__toggle--on' : ''}`}>
												<div className="stu-ws__toggle-knob" />
											</div>
										</div>

										<div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', margin: '12px 0 4px 0' }}>Bất phương trình 2:</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Hệ số A₂</span><span className="stu-ws__param-val">{inA2}</span></div>
											<input type="range" min={-5} max={5} step={0.5} value={inA2} onChange={(e) => setInA2(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Hệ số B₂</span><span className="stu-ws__param-val">{inB2}</span></div>
											<input type="range" min={-5} max={5} step={0.5} value={inB2} onChange={(e) => setInB2(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Hằng số C₂</span><span className="stu-ws__param-val">{inC2}</span></div>
											<input type="range" min={-10} max={10} step={0.5} value={inC2} onChange={(e) => setInC2(+e.target.value)} />
										</div>
										<div className="stu-ws__toggle-row" onClick={() => setShowM2(!showM2)}>
											<span>Tô miền nghiệm 2</span>
											<div className={`stu-ws__toggle ${showM2 ? 'stu-ws__toggle--on' : ''}`}>
												<div className="stu-ws__toggle-knob" />
											</div>
										</div>
									</>
								)}

								{/* SIM-18: Triangulation */}
								{simId === 'SIM-18' && (
									<>
										<div className="stu-ws__formula-box">Hệ thức lượng đo đạc</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Khoảng cách (a)</span><span className="stu-ws__param-val">{triA} m</span></div>
											<input type="range" min={2} max={30} step={0.5} value={triA} onChange={(e) => setTriA(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Góc nâng (α)</span><span className="stu-ws__param-val">{triAlpha}°</span></div>
											<input type="range" min={10} max={80} step={1} value={triAlpha} onChange={(e) => setTriAlpha(+e.target.value)} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Chiều cao mắt (h₀)</span><span className="stu-ws__param-val">{triH0} m</span></div>
											<input type="range" min={0.5} max={2.0} step={0.1} value={triH0} onChange={(e) => setTriH0(+e.target.value)} />
										</div>
										<div className="stu-ws__results">
											<div className="stu-ws__results-title">Tính toán chiều cao</div>
											<div className="stu-ws__result-row"><span>Chiều cao H</span><span className="stu-ws__result-val stu-ws__result-val--accent">{(triH0 + triA * Math.tan((triAlpha * Math.PI) / 180)).toFixed(2)} m</span></div>
										</div>
									</>
								)}

								{/* SIM-19: Ellipse Conic */}
								{simId === 'SIM-19' && (
									<>
										<div className="stu-ws__formula-box">Ghim đinh vẽ Elip</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Nửa tiêu cự (c)</span><span className="stu-ws__param-val">{conicC.toFixed(1)}</span></div>
											<input type="range" min={1} max={5} step={0.1} value={conicC} onChange={(e) => {
												const val = +e.target.value;
												setConicC(val);
												if (conicA <= val) setConicA(val + 0.5);
											}} />
										</div>
										<div className="stu-ws__param">
											<div className="stu-ws__param-row"><span>Độ dài dây (2a)</span><span className="stu-ws__param-val">{(conicA * 2).toFixed(1)} (a={conicA.toFixed(1)})</span></div>
											<input type="range" min={2.2} max={14} step={0.2} value={conicA * 2} onChange={(e) => {
												const val = +e.target.value / 2;
												if (val > conicC) {
													setConicA(val);
												}
											}} />
										</div>
										<div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8', background: 'rgba(30, 41, 59, 0.5)', padding: '8px', borderRadius: '6px', lineHeight: '1.4' }}>
											💡 <b>Định nghĩa Elip:</b> Quỹ tích những điểm M sao cho tổng khoảng cách đến hai tiêu điểm không đổi MF₁ + MF₂ = 2a.
										</div>
									</>
								)}

								{/* SIM-20: Statistics */}
								{simId === 'SIM-20' && (
									<>
										<div className="stu-ws__formula-box">Thống kê số liệu mẫu</div>
										<div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<div>📊 <b>Các đại lượng đo xu thế trung tâm:</b></div>
											<div>• <b>Số trung bình (x̄):</b> Giá trị trung bình cộng của mẫu số liệu.</div>
											<div>• <b>Trung vị (Q₂):</b> Giá trị chia mẫu số liệu thành hai phần bằng nhau.</div>
											<div>• <b>Tứ phân vị (Q₁, Q₃):</b> Các giá trị chia mẫu số liệu đã sắp xếp thành 4 phần bằng nhau.</div>
											<div style={{ borderTop: '1px solid #1e293b', paddingTop: '6px' }}>📉 <b>Các đại lượng đo độ phân tán:</b></div>
											<div>• <b>Khoảng biến thiên (R):</b> Hiệu giữa giá trị lớn nhất và nhỏ nhất.</div>
											<div>• <b>Khoảng tứ phân vị (IQR):</b> Bằng Q₃ - Q₁, đo độ phân tán của 50% dữ liệu ở giữa.</div>
											<div>• <b>Độ lệch chuẩn (s):</b> Đo mức độ phân tán xung quanh số trung bình.</div>
										</div>
									</>
								)}
							</>
						)}

						{/* Chem Steps */}
						{subject === 'chem' && (
							<>
								<div className="stu-ws__section-label">Các bước hướng dẫn</div>
								<div className="stu-ws__steps">
									{(LAB_CHEM_STEPS[simId as keyof typeof LAB_CHEM_STEPS] || LAB_CHEM_STEPS['SIM-01']).map((st) => {
										const done = st.n < chemStep;
										const active = st.n === chemStep;
										return (
											<div key={st.n} className="stu-ws__step">
												<div className={`stu-ws__step-circle ${done ? 'stu-ws__step-circle--done' : active ? 'stu-ws__step-circle--active' : ''}`}>
													{done ? '✓' : st.n}
												</div>
												<div>
													<div className={`stu-ws__step-title ${done || active ? '' : 'stu-ws__step-title--muted'}`}>{st.title}</div>
													<div className={`stu-ws__step-sub ${active ? 'stu-ws__step-sub--accent' : ''}`}>{st.sub}</div>
												</div>
											</div>
										);
									})}
								</div>

								<div className="stu-ws__watch">
									<div className="stu-ws__results-title">Quan sát</div>
									{getChemObservations(simId, chemStep).map((obs) => (
										<div key={obs.key} className="stu-ws__watch-item">
											<div className={`stu-ws__watch-dot ${obs.active ? 'stu-ws__watch-dot--pink' : 'stu-ws__watch-dot--empty'}`} />
											{obs.label}
										</div>
									))}
								</div>
							</>
						)}
					</div>

					{/* CENTER: Simulation */}
					<div className="stu-ws__center">
						<div className="stu-ws__center-header">
							<span className="stu-ws__center-title">{centerTitle}</span>
							<div className="stu-ws__center-actions">
								{subject === 'physics' ? (
									<>
										<div
											className="stu-ws__center-btn stu-ws__center-btn--primary"
											onClick={() => setIsPhPlaying(prev => !prev)}
										>
											{isPhPlaying ? 'Tạm dừng' : 'Phóng'}
										</div>
										<div
											className={`stu-ws__center-btn ${isPhSlow ? 'stu-ws__center-btn--active' : ''}`}
											onClick={() => setIsPhSlow(prev => !prev)}
										>
											Chậm
										</div>
									</>
								) : subject === 'math' ? (
									<>
										{(simId === 'SIM-16' || simId === 'SIM-19') && (
											<div
												className="stu-ws__center-btn stu-ws__center-btn--primary"
												onClick={() => {
													if (simId === 'SIM-16') setIsMPlaying(prev => !prev);
													if (simId === 'SIM-19') setIsCPlaying(prev => !prev);
												}}
											>
												{simId === 'SIM-16' ? (isMPlaying ? 'Tạm dừng' : 'Phóng') : (isCPlaying ? 'Tạm dừng' : 'Vẽ')}
											</div>
										)}
									</>
								) : (
									<></>
								)}
							</div>
						</div>

						{/* Simulation mount point */}
						<div className={`stu-ws__sim-slot stu-ws__sim-slot--${meta.className}`} id={`sim-mount-${subject}`} data-sim={subject}>
							<div className={`stu-ws__sim-pill stu-ws__sim-pill--${meta.className}`}>
								{subject === 'physics' && `θ ${phAngle}°  ·  v ${phVel} m/s  ·  g ${f(phGrav)}`}
								{subject === 'math' && (
									(simId === 'SIM-08' || simId === 'SIM-08-math' || !simId) ? `a ${f(mA)}  ·  b ${f(mB)}  ·  c ${f(mC)}` :
									simId === 'SIM-16' ? `θ ${mAngle}°  ·  v₀ ${mVel} m/s` :
									simId === 'SIM-17' ? `Hệ BPT bậc nhất 2 ẩn` :
									simId === 'SIM-18' ? `Giác kế  ·  a ${triA}m  ·  α ${triAlpha}°` :
									simId === 'SIM-19' ? `Bút vẽ  ·  a ${conicA.toFixed(1)}  ·  c ${conicC.toFixed(1)}` :
									`Thống kê mẫu số liệu`
								)}
								{subject === 'chem' && `Đang tiến hành  ·  bước ${chemStep}/${(LAB_CHEM_STEPS[simId as keyof typeof LAB_CHEM_STEPS] || LAB_CHEM_STEPS['SIM-01']).length}`}
							</div>
							{subject === 'physics' ? (
								<ProjectileSimulation
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
								(simId === 'SIM-08' || simId === 'SIM-08-math' || !simId) ? (
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
									<div className="stu-ws__sim-placeholder">
										Không tìm thấy mô phỏng Toán học tương ứng
									</div>
								)
							) : (
								<div className="stu-ws__sim-placeholder">
									<div className="stu-ws__sim-icon">
										<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
											<path d="M4 4v16h16" /><path d="M7 16c3-9 7-9 10 0" />
										</svg>
									</div>
									<div className="stu-ws__sim-label">Điểm gắn Mô phỏng</div>
								</div>
							)}
						</div>

						<div className="stu-ws__formula-bar">{formulaText}</div>
					</div>

					{/* RIGHT: AI Tutor + Quiz */}
					<div className="stu-ws__right">
						{/* Tutor header */}
						<div className="stu-ws__tutor-header">
							<div className="stu-ws__tutor-icon">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 3v2M12 19v2M3 12h2M19 12h2" />
								</svg>
							</div>
							<span className="stu-ws__tutor-name">{meta.tutor}</span>
							<div className="stu-ws__tutor-live" />
						</div>

						{/* Tabs Header */}
						<div className="stu-ws__right-tabs">
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
								<div className="stu-ws__chat scl">
									{(chats[metaKey] || []).map((m, i) => (
										<div key={i} className={`stu-ws__chat-msg ${m.role === 'user' ? 'stu-ws__chat-msg--user' : 'stu-ws__chat-msg--ai'}`}>
											{m.text}
										</div>
									))}
								</div>

								{/* Chat input */}
								<div className="stu-ws__chat-input-row">
									<input
										className="stu-ws__chat-input"
										value={chatInput}
										onChange={(e) => setChatInput(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && sendChat()}
										placeholder="Đặt câu hỏi…"
									/>
									<div className="stu-ws__chat-send" onClick={sendChat}>
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M5 12h14M13 6l6 6-6 6" />
										</svg>
									</div>
								</div>
							</>
						) : (
							/* Dynamic AI Quiz Panel */
							<div className="stu-ws__quiz-tab-content">
								{dynQuizState === 'setup' && (
									<div className="stu-ws__quiz dqz-setup">
										<div className="stu-ws__quiz-header">
											<span className="stu-ws__quiz-badge">AI QUIZ</span>
											<span className="stu-ws__quiz-count">Sinh đề AI</span>
										</div>
										<div className="dqz-setup__label">Chọn số câu hỏi ôn tập:</div>
										<div className="dqz-setup__options">
											{([3, 5, 10] as const).map(n => (
												<div key={n} className={`dqz-setup__count-btn ${dynQuizCount === n ? 'dqz-setup__count-btn--active' : ''}`} onClick={() => setDynQuizCount(n)}>
													{n} câu
												</div>
											))}
										</div>
										<div className="dqz-setup__hint">AI sẽ sinh {dynQuizCount} câu trắc nghiệm có độ khó tăng dần về chủ đề đang mô phỏng.</div>
										<div className="dqz-setup__start-btn" onClick={startDynQuiz}>✨ Sinh đề ngay</div>
									</div>
								)}
								{dynQuizState === 'loading' && (
									<div className="stu-ws__quiz dqz-loading">
										<div className="dqz-loading__spinner" />
										<div className="dqz-loading__text">AI đang soạn đề thi cho bạn…</div>
									</div>
								)}
								{dynQuizState === 'active' && dynQuestions.length > 0 && (() => {
									const q = dynQuestions[dynCurrent];
									const picked = dynAnswers[dynCurrent];
									return (
										<div className="stu-ws__quiz">
											<div className="stu-ws__quiz-header">
												<span className="stu-ws__quiz-badge">{dynUsedLlm ? '🤖 AI' : '📚 Quiz'}</span>
												<span className="stu-ws__quiz-count">Câu {dynCurrent + 1}/{dynQuestions.length}</span>
												<div className="dqz-print-wrap">
													<div className="dqz-print-btn" onClick={() => setShowPrintMenu(v => !v)} title="In / Xuất PDF">🖨️</div>
													{showPrintMenu && (
														<div className="dqz-print-menu">
															<div className="dqz-print-menu__item" onClick={() => triggerPrint(true)}>In có đáp án</div>
															<div className="dqz-print-menu__item" onClick={() => triggerPrint(false)}>In không đáp án</div>
														</div>
													)}
												</div>
											</div>
											<div className="dqz-nav-dots">
												{dynQuestions.map((_, i) => (
													<div key={i} className={`dqz-nav-dot ${i === dynCurrent ? 'dqz-nav-dot--active' : ''} ${dynAnswers[i] !== undefined ? (dynAnswers[i] === dynQuestions[i].correct ? 'dqz-nav-dot--correct' : 'dqz-nav-dot--wrong') : ''}`} onClick={() => setDynCurrent(i)} />
												))}
											</div>
											<div className="stu-ws__quiz-question">{q.q}</div>
											<div className="stu-ws__quiz-options">
												{q.opts.map((o) => {
													const isSel = picked === o.k;
													const isCorrect = o.k === q.correct;
													let optClass = '';
													if (!picked) optClass = '';
													else if (isCorrect) optClass = 'stu-ws__quiz-opt--correct';
													else if (isSel) optClass = 'stu-ws__quiz-opt--wrong';
													else optClass = 'stu-ws__quiz-opt--dimmed';
													return (
														<div key={o.k} className={`stu-ws__quiz-opt ${optClass}`} onClick={() => pickDynAnswer(dynCurrent, o.k)}>
															<div className={`stu-ws__quiz-radio ${isCorrect && picked ? 'stu-ws__quiz-radio--correct' : ''} ${isSel && !isCorrect ? 'stu-ws__quiz-radio--wrong' : ''}`} />
															<span><b>{o.k.toUpperCase()}.</b> {o.t}</span>
														</div>
													);
												})}
											</div>
											{picked && (
												<div className={`stu-ws__quiz-feedback ${picked === q.correct ? 'stu-ws__quiz-feedback--correct' : 'stu-ws__quiz-feedback--wrong'}`}>
													{picked === q.correct ? '✓ Chính xác!' : '✗ Chưa đúng.'}
													{q.explanation && <span style={{ display: 'block', fontWeight: 400, marginTop: 4, fontSize: 12 }}>{q.explanation}</span>}
												</div>
											)}
											<div className="dqz-nav-btns">
												{dynCurrent > 0 && <div className="dqz-nav-btn" onClick={() => setDynCurrent(c => c - 1)}>← Trước</div>}
												<div style={{ flex: 1 }} />
												{dynCurrent < dynQuestions.length - 1
													? <div className="dqz-nav-btn dqz-nav-btn--primary" onClick={() => setDynCurrent(c => c + 1)}>Tiếp →</div>
													: <div className="dqz-nav-btn dqz-nav-btn--primary" onClick={() => setDynQuizState('done')}>Xem kết quả</div>
												}
											</div>
										</div>
									);
								})()}
								{dynQuizState === 'done' && (() => {
									const totalCorrect = dynQuestions.filter((q, i) => dynAnswers[i] === q.correct).length;
									const pct = Math.round((totalCorrect / dynQuestions.length) * 100);
									return (
										<div className="stu-ws__quiz dqz-results">
											<div className="stu-ws__quiz-header">
												<span className="stu-ws__quiz-badge">KẾT QUẢ</span>
												<div className="dqz-print-wrap">
													<div className="dqz-print-btn" onClick={() => setShowPrintMenu(v => !v)} title="In / Xuất PDF">🖨️</div>
													{showPrintMenu && (
														<div className="dqz-print-menu">
															<div className="dqz-print-menu__item" onClick={() => triggerPrint(true)}>In có đáp án</div>
															<div className="dqz-print-menu__item" onClick={() => triggerPrint(false)}>In không đáp án</div>
														</div>
													)}
												</div>
											</div>
											<div className="dqz-results__score">
												<div className="dqz-results__pct">{pct}%</div>
												<div className="dqz-results__sub">{totalCorrect}/{dynQuestions.length} câu đúng</div>
											</div>
											<div className="dqz-results__list">
												{dynQuestions.map((q, i) => (
													<div key={i} className={`dqz-results__item ${dynAnswers[i] === q.correct ? 'dqz-results__item--correct' : 'dqz-results__item--wrong'}`}>
														<span>{dynAnswers[i] === q.correct ? '✓' : '✗'}</span>
														<span>Câu {i + 1}: Đáp án đúng là <b>{q.correct.toUpperCase()}</b></span>
													</div>
												))}
											</div>
											<div className="dqz-setup__start-btn" style={{ marginTop: 8 }} onClick={resetDynQuiz}>🔄 Làm lại bộ đề mới</div>
										</div>
									);
								})()}
								<div className="stu-ws__print-area" id="quiz-print-area">
									<div className="print-header">
										<h1>ĐỀ TRẮC NGHIỆM ÔN TẬP</h1>
										<p>{meta.label} · {meta.title}</p>
										<p>Số câu: {dynQuestions.length} · Thời gian: {dynQuestions.length * 2} phút</p>
									</div>
									<div className="print-questions">
										{dynQuestions.map((q, i) => (
											<div key={i} className="print-question">
												<div className="print-q-text"><b>Câu {i + 1}:</b> {q.q}</div>
												<div className="print-opts">
													{q.opts.map(o => (
														<div key={o.k} className="print-opt"><b>{o.k.toUpperCase()}.</b> {o.t}</div>
													))}
												</div>
											</div>
										))}
									</div>
									{dynQuestions.length > 0 && printWithAnswers && (
										<div className="print-answer-key">
											<h2>BẢNG ĐÁP ÁN</h2>
											<div className="print-key-grid">
												{dynQuestions.map((q, i) => (
													<div key={i} className="print-key-item">Câu {i + 1}: <b>{q.correct.toUpperCase()}</b></div>
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
