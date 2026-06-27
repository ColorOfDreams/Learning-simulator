import { chatWithAiPrompt, generateAiQuiz } from '@/services/ai/api';
import { completeActivity, completeLabSession, getUserInfo, openLabSession } from '@/services/base/api';
import GenericChemSimulation from '@simulations/chemistry/GenericChemSimulation';
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
import BoyleSimulation from '@simulations/physics/SIM-31-boyle';
import CharlesSimulation from '@simulations/physics/SIM-32-charles';
import KineticSimulation from '@simulations/physics/SIM-33-kinetic';
import StateChangeSimulation from '@simulations/physics/SIM-34-statechange';
import MagForceSimulation from '@simulations/physics/SIM-35-magforce';
import LorentzSimulation from '@simulations/physics/SIM-36-lorentz';
import InductionSimulation from '@simulations/physics/SIM-37-induction';
import ACGenSimulation from '@simulations/physics/SIM-38-acgen';
import RadioactiveSimulation from '@simulations/physics/SIM-39-radioactive';
import NuclearSimulation from '@simulations/physics/SIM-40-nuclear';
import BindingEnergySimulation from '@simulations/physics/SIM-41-bindingenergy';
import ShmSimulation from '@simulations/physics/SIM-42-shm';
import DampedSimulation from '@simulations/physics/SIM-43-damped';
import ResonanceSimulation from '@simulations/physics/SIM-44-resonance';
import WaveSimulation from '@simulations/physics/SIM-45-wave';
import StandingSimulation from '@simulations/physics/SIM-46-standing';
import InterferenceSimulation from '@simulations/physics/SIM-47-interference';
import CoulombSimulation from '@simulations/physics/SIM-48-coulomb';
import EFieldSimulation from '@simulations/physics/SIM-49-efield';
import OhmSimulation from '@simulations/physics/SIM-50-ohm';
import ResistorsSimulation from '@simulations/physics/SIM-51-resistors';
import FullCircuitSimulation from '@simulations/physics/SIM-52-fullcircuit';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { history, useLocation, useModel } from 'umi';
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

const escapeHtml = (value: unknown) =>
	String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

const CHEM_SIM_ALIASES: Record<string, string> = {
	'SIM-01': 'CHEM12-01',
	'SIM-03': 'CHEM12-02',
	'SIM-04': 'CHEM11-01',
	'SIM-05': 'CHEM11-02',
	'SIM-06': 'CHEM11-03',
	'SIM-07': 'CHEM11-04',
	'SIM-09': 'CHEM11-05',
	'SIM-10': 'CHEM11-06',
	'SIM-11': 'CHEM11-07',
	'SIM-12': 'CHEM11-08',
	'SIM-13': 'CHEM11-09',
	'SIM-14': 'CHEM11-10',
	'SIM-15': 'CHEM11-11',
};

const normalizeLabSimId = (simId: string) => CHEM_SIM_ALIASES[simId] || simId;

const CHEM10_META = {
	'CHEM10-01': { label: 'Hóa học 10', title: 'Thí nghiệm bắn phá lá vàng – Rutherford', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-02': { label: 'Hóa học 10', title: 'Thử màu ngọn lửa của các kim loại', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-03': { label: 'Hóa học 10', title: 'Kẽm tác dụng với dung dịch HCl', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-04': { label: 'Hóa học 10', title: 'Đốt cháy dây magnesium trong không khí', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-05': { label: 'Hóa học 10', title: 'Phản ứng tỏa nhiệt – tôi vôi (CaO + H₂O)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-06': { label: 'Hóa học 10', title: 'Phản ứng thu nhiệt (NH₄Cl + Ba(OH)₂)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-07': { label: 'Hóa học 10', title: 'Ảnh hưởng của nồng độ đến tốc độ phản ứng', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-08': { label: 'Hóa học 10', title: 'Ảnh hưởng của chất xúc tác – phân hủy H₂O₂', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-09': { label: 'Hóa học 10', title: 'Ảnh hưởng của diện tích bề mặt tiếp xúc', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-10': { label: 'Hóa học 10', title: 'Nhận biết ion halide bằng dung dịch AgNO₃', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-11': { label: 'Hóa học 10', title: 'Tính tẩy màu của nước chlorine', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM10-12': { label: 'Hóa học 10', title: 'Chlorine đẩy bromine ra khỏi muối bromide', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
};

const CHEM12_META = {
	'CHEM12-01': { label: 'Hóa học 12', title: 'Điều chế ethyl acetate (phản ứng ester hóa)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-02': { label: 'Hóa học 12', title: 'Phản ứng xà phòng hóa chất béo', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-03': { label: 'Hóa học 12', title: 'Glucose tác dụng với Cu(OH)₂', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-04': { label: 'Hóa học 12', title: 'Phản ứng tráng bạc của glucose', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-05': { label: 'Hóa học 12', title: 'Phản ứng màu của tinh bột với iodine', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-06': { label: 'Hóa học 12', title: 'Phản ứng màu biuret của protein', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-07': { label: 'Hóa học 12', title: 'Sodium tác dụng với nước', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-08': { label: 'Hóa học 12', title: 'Đinh sắt tác dụng với dung dịch CuSO₄', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-09': { label: 'Hóa học 12', title: 'Nhôm tác dụng với dung dịch NaOH', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-10': { label: 'Hóa học 12', title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-11': { label: 'Hóa học 12', title: 'Điều chế Fe(OH)₂ và Fe(OH)₃', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-12': { label: 'Hóa học 12', title: 'Điện phân dung dịch CuSO₄', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
	'CHEM12-13': { label: 'Hóa học 12', title: 'Ăn mòn điện hóa học (pin Zn-Cu)', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
};

// ── Lab metadata ──
const LAB_META = {
	...CHEM10_META,
	...CHEM12_META,
	'CHEM11-01': {
		label: 'Hóa học 11',
		title: 'Độ pH và Chất chỉ thị',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-02': {
		label: 'Hóa học 11',
		title: 'Chuẩn độ Acid - Base',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-03': {
		label: 'Hóa học 11',
		title: 'Đồng tác dụng với dung dịch HNO₃ đặc',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-04': {
		label: 'Hóa học 11',
		title: 'Ammonia tác dụng với HCl đặc (Khói trắng)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'SIM-08': { label: 'Toán', title: 'Đồ thị hàm số bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
	'CHEM11-05': {
		label: 'Hóa học 11',
		title: 'H₂SO₄ đặc tác dụng với đường (Saccharose)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-06': {
		label: 'Hóa học 11',
		title: 'Ethylene tác dụng với nước Bromine',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-07': {
		label: 'Hóa học 11',
		title: 'Acetylene tác dụng với dung dịch AgNO₃/NH₃',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-08': {
		label: 'Hóa học 11',
		title: 'Ethanol tác dụng với kim loại Sodium',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-09': {
		label: 'Hóa học 11',
		title: 'Phenol tác dụng với nước Bromine',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-10': {
		label: 'Hóa học 11',
		title: 'Glycerol tác dụng với Cu(OH)₂',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM11-11': {
		label: 'Hóa học 11',
		title: 'Tính chất hóa học của Acetic Acid',
		tutor: 'Trợ lý thí nghiệm AI',
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
	'SIM-24': {
		label: 'Vật lý',
		title: 'Định luật II Newton (Xe lăn)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'physics',
	},
	'SIM-25': {
		label: 'Vật lý',
		title: 'Vật trượt trên mặt phẳng nghiêng',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'physics',
	},
	'SIM-26': { label: 'Vật lý', title: 'Con lắc lò xo nằm ngang', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-27': { label: 'Vật lý', title: 'Con lắc đơn dao động', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-28': { label: 'Vật lý', title: 'Chuyển động tròn đều', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-29': {
		label: 'Vật lý',
		title: 'Va chạm 1D — bảo toàn động lượng',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'physics',
	},
	'SIM-30': { label: 'Vật lý', title: 'Bảo toàn cơ năng', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	'SIM-31': { label: 'Vật lý', title: 'Định luật Boyle (đẳng nhiệt)', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-32': { label: 'Vật lý', title: 'Định luật Charles (đẳng áp)', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-33': {
		label: 'Vật lý',
		title: 'Thuyết động học phân tử chất khí',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
	'SIM-34': { label: 'Vật lý', title: 'Sự chuyển thể của chất', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-35': { label: 'Vật lý', title: 'Lực từ tác dụng lên dây dẫn', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-36': { label: 'Vật lý', title: 'Lực Lorentz', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-37': { label: 'Vật lý', title: 'Hiện tượng cảm ứng điện từ', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-38': { label: 'Vật lý', title: 'Máy phát điện xoay chiều', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-39': { label: 'Vật lý', title: 'Phóng xạ & chu kỳ bán rã', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-40': {
		label: 'Vật lý',
		title: 'Phản ứng phân hạch & nhiệt hạch',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
	'SIM-41': { label: 'Vật lý', title: 'Năng lượng liên kết riêng', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-42': { label: 'Vật lý 11', title: 'Dao động điều hòa', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-43': { label: 'Vật lý 11', title: 'Dao động tắt dần', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-44': { label: 'Vật lý 11', title: 'Hiện tượng cộng hưởng', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-45': {
		label: 'Vật lý 11',
		title: 'Sóng ngang truyền trên dây',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
	'SIM-46': { label: 'Vật lý 11', title: 'Sóng dừng', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-47': { label: 'Vật lý 11', title: 'Giao thoa sóng nước', tutor: 'Trợ lý Vật lý AI', className: 'physics' },
	'SIM-48': {
		label: 'Vật lý 11',
		title: 'Định luật Coulomb & Lực tương tác',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
	'SIM-49': {
		label: 'Vật lý 11',
		title: 'Điện trường & Đường sức điện',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
	'SIM-50': {
		label: 'Vật lý 11',
		title: 'Định luật Ohm cho đoạn mạch',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
	'SIM-51': {
		label: 'Vật lý 11',
		title: 'Mạch ghép điện trở (Nối tiếp / Song song)',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
	'SIM-52': {
		label: 'Vật lý 11',
		title: 'Định luật Ohm cho toàn mạch',
		tutor: 'Trợ lý Vật lý AI',
		className: 'physics',
	},
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
	'CHEM11-01': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với thí nghiệm độ pH và chất chỉ thị màu! Bạn có biết chất chỉ thị vạn năng sẽ hóa màu gì trong dung dịch HCl không?',
		},
	],
	'CHEM11-02': [
		{
			role: 'ai',
			text: 'Chào bạn! Trong chuẩn độ acid-base, tại sao ta lại thêm phenolphthalein vào dung dịch acid trước khi nhỏ NaOH?',
		},
	],
	'CHEM11-03': [
		{
			role: 'ai',
			text: 'Chào bạn! Phản ứng giữa đồng và HNO₃ đặc tạo ra khí có màu gì và công thức hóa học là gì?',
		},
	],
	'CHEM11-04': [
		{
			role: 'ai',
			text: 'Chào bạn! Tại sao khi đưa miệng hai lọ chứa NH₃ đặc và HCl đặc lại gần nhau lại xuất hiện khói trắng?',
		},
	],
	'SIM-08': [{ role: 'ai', text: 'Chào bạn! Kim loại kiềm sodium phản ứng với nước tạo ra dung dịch gì và khí gì?' }],
	'CHEM11-05': [
		{
			role: 'ai',
			text: 'Chào bạn! Axit sulfuric đặc có tính chất đặc trưng nào khiến đường saccharose bị hóa than đen và phồng lên?',
		},
	],
	'CHEM11-06': [
		{
			role: 'ai',
			text: 'Chào bạn! Ethylene phản ứng cộng với nước bromine làm mất màu vàng cam nhờ liên kết nào trong phân tử?',
		},
	],
	'CHEM11-07': [
		{
			role: 'ai',
			text: 'Chào bạn! Acetylene tác dụng với dung dịch AgNO₃ trong NH₃ sinh ra chất kết tủa màu gì?',
		},
	],
	'CHEM11-08': [
		{
			role: 'ai',
			text: 'Chào bạn! Ethanol tác dụng với mẩu sodium giải phóng bọt khí gì?',
		},
	],
	'CHEM11-09': [
		{
			role: 'ai',
			text: 'Chào bạn! Phenol phản ứng với nước bromine tạo kết tủa trắng nhờ nhóm -OH hoạt hóa vòng benzen ở các vị trí nào?',
		},
	],
	'CHEM11-10': [
		{
			role: 'ai',
			text: 'Chào bạn! Glycerol có thể hòa tan kết tủa xanh Cu(OH)₂ ở nhiệt độ thường là nhờ đặc điểm cấu tạo nào?',
		},
	],
	'CHEM11-11': [
		{
			role: 'ai',
			text: 'Chào bạn! Axit acetic phản ứng với đá vôi (CaCO₃) giải phóng khí gì?',
		},
	],
	'CHEM10-01': [{ role: 'ai', text: 'Chào bạn! Tại sao Rutherford bắn hạt α vào lá vàng lại thấy một số hạt bị bật ngược?' }],
	'CHEM10-02': [{ role: 'ai', text: 'Chào bạn! Mỗi nguyên tố kim loại cho ngọn lửa màu khác nhau — điều gì tạo ra sự khác biệt đó?' }],
	'CHEM10-03': [{ role: 'ai', text: 'Chào bạn! Trong phản ứng Zn + HCl, chất nào đóng vai trò chất khử và chất oxi hóa?' }],
	'CHEM10-04': [{ role: 'ai', text: 'Chào bạn! Khi đốt Mg trong không khí, sản phẩm tạo thành là gì và có màu gì?' }],
	'CHEM10-05': [{ role: 'ai', text: 'Chào bạn! Vì sao phản ứng tôi vôi tỏa nhiệt rất mạnh? Nhiệt lượng đó đến từ đâu?' }],
	'CHEM10-06': [{ role: 'ai', text: 'Chào bạn! Phản ứng NH₄Cl + Ba(OH)₂ thu nhiệt — điều đó có nghĩa là gì với năng lượng hệ?' }],
	'CHEM10-07': [{ role: 'ai', text: 'Chào bạn! Tại sao tăng nồng độ lại làm tốc độ phản ứng nhanh hơn?' }],
	'CHEM10-08': [{ role: 'ai', text: 'Chào bạn! MnO₂ là chất xúc tác — sau phản ứng nó có bị tiêu hao không?' }],
	'CHEM10-09': [{ role: 'ai', text: 'Chào bạn! Vì sao bột đá vôi phản ứng với HCl nhanh hơn cục đá vôi cùng khối lượng?' }],
	'CHEM10-10': [{ role: 'ai', text: 'Chào bạn! AgCl, AgBr, AgI có màu khác nhau — bạn dự đoán màu của từng kết tủa?' }],
	'CHEM10-11': [{ role: 'ai', text: 'Chào bạn! Tại sao nước chlorine lại có khả năng tẩy màu? Chất nào là tác nhân tẩy màu thực sự?' }],
	'CHEM10-12': [{ role: 'ai', text: 'Chào bạn! Chlorine đẩy bromine ra khỏi NaBr vì lý do gì? Đây là loại phản ứng gì?' }],
	'CHEM12-01': [{ role: 'ai', text: 'Chào bạn! H₂SO₄ đặc đóng vai trò gì khi điều chế ethyl acetate?' }],
	'CHEM12-02': [{ role: 'ai', text: 'Chào bạn! Vì sao thêm NaCl bão hòa lại giúp xà phòng tách ra?' }],
	'CHEM12-03': [{ role: 'ai', text: 'Chào bạn! Vì sao glucose tạo dung dịch xanh lam với Cu(OH)₂?' }],
	'CHEM12-04': [{ role: 'ai', text: 'Chào bạn! Glucose khử ion bạc trong thuốc thử Tollens thành chất gì?' }],
	'CHEM12-05': [{ role: 'ai', text: 'Chào bạn! Vì sao iodine làm hồ tinh bột chuyển xanh tím?' }],
	'CHEM12-06': [{ role: 'ai', text: 'Chào bạn! Màu tím biuret cho biết protein có loại liên kết nào?' }],
	'CHEM12-07': [{ role: 'ai', text: 'Chào bạn! Sodium tác dụng với nước tạo base nào và khí gì?' }],
	'CHEM12-08': [{ role: 'ai', text: 'Chào bạn! Vì sao đồng đỏ bám lên đinh sắt trong dung dịch CuSO₄?' }],
	'CHEM12-09': [{ role: 'ai', text: 'Chào bạn! Nhôm tan trong NaOH giải phóng khí gì?' }],
	'CHEM12-10': [{ role: 'ai', text: 'Chào bạn! Trong phản ứng nhiệt nhôm, Al đóng vai trò chất gì?' }],
	'CHEM12-11': [{ role: 'ai', text: 'Chào bạn! Fe(OH)₂ và Fe(OH)₃ khác nhau rõ nhất ở màu nào?' }],
	'CHEM12-12': [{ role: 'ai', text: 'Chào bạn! Khi điện phân CuSO₄, đồng bám ở điện cực nào?' }],
	'CHEM12-13': [{ role: 'ai', text: 'Chào bạn! Trong cặp Zn-Cu, kim loại nào bị ăn mòn trước?' }],
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
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng thí nghiệm Ném ngang! Hãy điều chỉnh độ cao thả h và vận tốc đầu v₀ để quan sát tầm xa lý thuyết.',
		},
	],
	'SIM-24': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng định luật II Newton! Gia tốc xe thay đổi thế nào khi lực kéo F tăng hoặc khối lượng xe m tăng?',
		},
	],
	'SIM-25': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng chuyển động trên mặt phẳng nghiêng! Hãy điều chỉnh góc nghiêng alpha và hệ số ma sát mu.',
		},
	],
	'SIM-26': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng con lắc lò xo nằm ngang! Hãy thay đổi độ cứng lò xo k và khối lượng m để xem đồ thị năng lượng.',
		},
	],
	'SIM-27': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng con lắc đơn dao động! Tần số dao động có phụ thuộc vào khối lượng quả nặng không?',
		},
	],
	'SIM-28': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng chuyển động tròn đều! Lực hướng tâm và tốc độ dài thay đổi thế nào khi thay đổi bán kính r?',
		},
	],
	'SIM-29': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng va chạm 1D! Hãy thay đổi độ đàn hồi e để so sánh va chạm đàn hồi (e=1) và va chạm mềm (e=0).',
		},
	],
	'SIM-30': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng bảo toàn cơ năng trên máng cong! Thế năng và động năng chuyển hóa thế nào khi vật chuyển động?',
		},
	],
	'SIM-31': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng định luật Boyle! Hãy nén khí (giảm thể tích V) và quan sát áp suất p thay đổi thế nào nhé.',
		},
	],
	'SIM-32': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng định luật Charles! Đun nóng khí (tăng nhiệt độ T) làm phân tử chuyển động nhanh hơn và đẩy piston ra thế nào?',
		},
	],
	'SIM-33': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng thuyết động học phân tử! Bạn sẽ thấy các phân tử va chạm hỗn loạn sinh ra áp suất. Hãy tăng T hoặc số hạt N để kiểm nghiệm.',
		},
	],
	'SIM-34': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng sự chuyển thể! Trong quá trình nóng chảy hoặc hóa hơi, nhiệt độ của chất có thay đổi không?',
		},
	],
	'SIM-35': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng lực từ Laplace! Dây dẫn mang dòng I đặt trong từ trường đều B sẽ chịu lực từ hướng nào? Hãy dùng quy tắc bàn tay trái.',
		},
	],
	'SIM-36': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng lực Lorentz! Lực Lorentz luôn vuông góc với vận tốc nên đóng vai trò lực hướng tâm làm điện tích chuyển động tròn.',
		},
	],
	'SIM-37': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng cảm ứng điện từ Faraday! Khi di chuyển nam châm nhanh hay chậm, suất điện động cảm ứng sinh ra thế nào?',
		},
	],
	'SIM-38': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng máy phát điện xoay chiều! Suất điện động cảm ứng biến thiên hình sin do từ thông qua khung dây thay đổi.',
		},
	],
	'SIM-39': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng phân rã phóng xạ! Bạn nghĩ sau thời gian bằng đúng 1 chu kỳ bán rã T, số hạt nhân chưa phân rã còn lại bao nhiêu phần trăm?',
		},
	],
	'SIM-40': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng phản ứng hạt nhân! Hãy so sánh năng lượng tỏa ra của phản ứng phân hạch và phản ứng nhiệt hạch.',
		},
	],
	'SIM-41': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng năng lượng liên kết riêng! Hạt nhân bền vững nhất nằm trong vùng số khối A bằng bao nhiêu?',
		},
	],
	'SIM-42': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Dao động điều hòa! Hãy quan sát li độ, vận tốc và gia tốc biến đổi điều hòa theo thời gian.',
		},
	],
	'SIM-43': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Dao động tắt dần! Hãy điều chỉnh hệ số lực cản b để thấy biên độ giảm dần theo thời gian.',
		},
	],
	'SIM-44': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Hiện tượng cộng hưởng! Biên độ dao động sẽ đạt cực đại khi tần số lực cưỡng bức tiến gần tới tần số riêng.',
		},
	],
	'SIM-45': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Sóng ngang truyền trên dây! Hãy quan sát các phần tử môi trường dao động vuông góc với phương truyền sóng.',
		},
	],
	'SIM-46': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Sóng dừng! Sóng dừng được hình thành từ sự giao thoa giữa sóng tới và sóng phản xạ, tạo ra các nút và bụng sóng.',
		},
	],
	'SIM-47': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Giao thoa sóng nước! Hãy quan sát hình ảnh các cực đại và cực tiểu giao thoa đan xen nhau.',
		},
	],
	'SIM-48': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng định luật Coulomb! Lực tương tác tĩnh điện giữa hai điện tích tỉ lệ nghịch với bình phương khoảng cách.',
		},
	],
	'SIM-49': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Điện trường & Đường sức điện! Hãy di chuyển các điện tích để quan sát sự thay đổi của đường sức điện trường.',
		},
	],
	'SIM-50': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng định luật Ohm cho đoạn mạch! Cường độ dòng điện chạy qua dây dẫn tỉ lệ thuận với hiệu điện thế.',
		},
	],
	'SIM-51': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng Mạch ghép điện trở! Hãy so sánh điện trở tương đương khi mắc nối tiếp và mắc song song.',
		},
	],
	'SIM-52': [
		{
			role: 'ai',
			text: 'Chào mừng bạn đến với mô phỏng định luật Ohm cho toàn mạch! Cường độ dòng điện phụ thuộc vào suất điện động E và tổng điện trở R + r.',
		},
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

const RIGHT_CHAT_CHIPS: Record<SubjectKey, string[]> = {
	physics: ['Giải thích hiện tượng', 'Công thức cần dùng?', 'Thử đổi tham số nào?'],
	math: ['Giải từng bước', 'Ý nghĩa đồ thị?', 'Kiểm tra đáp án'],
	chem: ['Vì sao đổi màu?', 'Điểm tương đương là gì?', 'Cách tính nồng độ?'],
};

// ── Quiz data ──
export const LAB_QUIZZES = {
	'CHEM12-01': {
		q: 'Vai trò chính của dung dịch H₂SO₄ đặc trong phản ứng ester hóa là gì?',
		opts: [
			{ k: 'a', t: 'Làm chất xúc tác' },
			{ k: 'b', t: 'Hút nước dịch chuyển cân bằng' },
			{ k: 'c', t: 'Vừa làm xúc tác vừa hút nước' },
		],
		correct: 'c',
	},
	'CHEM12-02': {
		q: 'Vai trò chính của dung dịch NaCl bão hòa được thêm vào ở bước 5 là gì?',
		opts: [
			{ k: 'a', t: 'Làm chất xúc tác cho phản ứng' },
			{ k: 'b', t: 'Làm giảm độ tan của xà phòng để muối natri tách ra và nổi lên' },
			{ k: 'c', t: 'Hòa tan hoàn toàn glixerol giải phóng' },
		],
		correct: 'b',
	},
	'CHEM11-01': {
		q: 'Chất chỉ thị vạn năng chuyển sang màu gì trong môi trường axit mạnh (pH < 3)?',
		opts: [
			{ k: 'a', t: 'Màu đỏ' },
			{ k: 'b', t: 'Màu xanh' },
			{ k: 'c', t: 'Màu lục' },
		],
		correct: 'a',
	},
	'CHEM11-02': {
		q: 'Trong quá trình chuẩn độ HCl bằng dung dịch NaOH với chỉ thị phenolphthalein, điểm tương đương đạt được khi dung dịch:',
		opts: [
			{ k: 'a', t: 'Chuyển sang màu đỏ sẫm' },
			{ k: 'b', t: 'Chuyển sang màu hồng nhạt bền trong khoảng 30 giây' },
			{ k: 'c', t: 'Mất màu hoàn toàn' },
		],
		correct: 'b',
	},
	'CHEM11-03': {
		q: 'Khí màu nâu đỏ sinh ra khi cho đồng tác dụng với HNO₃ đặc là gì?',
		opts: [
			{ k: 'a', t: 'Khí NO' },
			{ k: 'b', t: 'Khí NO₂' },
			{ k: 'c', t: 'Khí N₂O' },
		],
		correct: 'b',
	},
	'CHEM11-04': {
		q: 'Khói trắng sinh ra khi đưa miệng hai lọ đựng NH₃ đặc và HCl đặc lại gần nhau là chất nào?',
		opts: [
			{ k: 'a', t: 'Ammonium chloride (NH₄Cl)' },
			{ k: 'b', t: 'Khí nitrogen (N₂)' },
			{ k: 'c', t: 'Ammonium nitrate (NH₄NO₃)' },
		],
		correct: 'a',
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
	'CHEM11-05': {
		q: 'Đường saccharose bị hóa than đen khi gặp H₂SO₄ đặc là do axit này có tính chất đặc trưng nào?',
		opts: [
			{ k: 'a', t: 'Tính axit mạnh' },
			{ k: 'b', t: 'Tính oxi hóa cực mạnh' },
			{ k: 'c', t: 'Tính háo nước mạnh' },
		],
		correct: 'c',
	},
	'CHEM11-06': {
		q: 'Ethylene có thể làm mất màu dung dịch nước bromine là do cấu tạo phân tử ethylene có:',
		opts: [
			{ k: 'a', t: 'Liên kết đôi kém bền dễ tham gia phản ứng cộng' },
			{ k: 'b', t: 'Nhóm chức aldehyde' },
			{ k: 'c', t: 'Nhiều liên kết đơn bền vững' },
		],
		correct: 'a',
	},
	'CHEM11-07': {
		q: 'Sản phẩm kết tủa vàng nhạt thu được khi sục khí acetylene vào dung dịch AgNO₃/NH₃ có công thức là:',
		opts: [
			{ k: 'a', t: 'AgC' },
			{ k: 'b', t: 'Ag₂C₂' },
			{ k: 'c', t: 'AgC₂' },
		],
		correct: 'b',
	},
	'CHEM11-08': {
		q: 'Khi cho sodium vào ethanol khan, sản phẩm khí sinh ra là:',
		opts: [
			{ k: 'a', t: 'Khí hydrogen (H₂)' },
			{ k: 'b', t: 'Khí oxygen (O₂)' },
			{ k: 'c', t: 'Khí carbon dioxide (CO₂)' },
		],
		correct: 'a',
	},
	'CHEM11-09': {
		q: 'Khi nhỏ nước bromine vào dung dịch phenol, xuất hiện kết tủa màu gì?',
		opts: [
			{ k: 'a', t: 'Kết tủa trắng' },
			{ k: 'b', t: 'Kết tủa vàng' },
			{ k: 'c', t: 'Kết tủa đỏ' },
		],
		correct: 'a',
	},
	'CHEM11-10': {
		q: 'Glycerol hòa tan được Cu(OH)₂ tạo thành dung dịch màu gì?',
		opts: [
			{ k: 'a', t: 'Xanh lam thẫm' },
			{ k: 'b', t: 'Đỏ gạch' },
			{ k: 'c', t: 'Tím' },
		],
		correct: 'a',
	},
	'CHEM11-11': {
		q: 'Khi cho axit acetic tác dụng với đá vôi (CaCO₃), khí sinh ra làm đục nước vôi trong là khí nào?',
		opts: [
			{ k: 'a', t: 'Khí CO₂' },
			{ k: 'b', t: 'Khí H₂' },
			{ k: 'c', t: 'Khí SO₂' },
		],
		correct: 'a',
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
			{ k: 'c', t: 'Phụ thuộc vào cả h và v₀' },
		],
		correct: 'a',
	},
	'SIM-24': {
		q: 'Theo định luật II Newton, gia tốc của vật tỉ lệ thuận với lực tác dụng và tỉ lệ nghịch với khối lượng của vật:',
		opts: [
			{ k: 'a', t: 'Đúng' },
			{ k: 'b', t: 'Sai' },
		],
		correct: 'a',
	},
	'SIM-25': {
		q: 'Điều kiện để vật trượt xuống trên mặt phẳng nghiêng có góc nghiêng alpha và hệ số ma sát mu là:',
		opts: [
			{ k: 'a', t: 'tan(alpha) > mu' },
			{ k: 'b', t: 'tan(alpha) < mu' },
			{ k: 'c', t: 'sin(alpha) < mu' },
		],
		correct: 'a',
	},
	'SIM-26': {
		q: 'Chu kỳ dao động điều hòa của con lắc lò xo nằm ngang phụ thuộc vào:',
		opts: [
			{ k: 'a', t: 'Độ cứng lò xo k và khối lượng m của vật' },
			{ k: 'b', t: 'Gia tốc trọng trường g' },
			{ k: 'c', t: 'Biên độ dao động A' },
		],
		correct: 'a',
	},
	'SIM-27': {
		q: 'Một con lắc đơn dao động điều hòa, nếu tăng chiều dài dây treo lên 4 lần thì chu kỳ dao động sẽ:',
		opts: [
			{ k: 'a', t: 'Tăng lên 2 lần' },
			{ k: 'b', t: 'Giảm đi 2 lần' },
			{ k: 'c', t: 'Tăng lên 4 lần' },
		],
		correct: 'a',
	},
	'SIM-28': {
		q: 'Lực hướng tâm trong chuyển động tròn đều có tác dụng gì?',
		opts: [
			{ k: 'a', t: 'Chỉ làm thay đổi hướng của vận tốc, giữ vật trên quỹ đạo tròn' },
			{ k: 'b', t: 'Làm thay đổi tốc độ dài của vật' },
			{ k: 'c', t: 'Làm vật chuyển động ra xa tâm' },
		],
		correct: 'a',
	},
	'SIM-29': {
		q: 'Trong va chạm mềm (e = 0) giữa hai vật chuyển động trên một đường thẳng, đại lượng nào sau đây được bảo toàn?',
		opts: [
			{ k: 'a', t: 'Chỉ động lượng' },
			{ k: 'b', t: 'Chỉ động năng' },
			{ k: 'c', t: 'Cả động lượng và động năng' },
		],
		correct: 'a',
	},
	'SIM-30': {
		q: 'Một vật trượt không ma sát từ đỉnh xuống chân máng cong, trong quá trình trượt có sự chuyển hóa năng lượng như thế nào?',
		opts: [
			{ k: 'a', t: 'Thế năng chuyển hóa thành động năng, cơ năng bảo toàn' },
			{ k: 'b', t: 'Động năng chuyển hóa thành thế năng' },
			{ k: 'c', t: 'Thế năng hao hụt do ma sát tỏa nhiệt' },
		],
		correct: 'a',
	},
	'SIM-31': {
		q: 'Trong quá trình đẳng nhiệt của một lượng khí nhất định, nếu thể tích giảm đi một nửa thì áp suất thay đổi như thế nào?',
		opts: [
			{ k: 'a', t: 'Không thay đổi' },
			{ k: 'b', t: 'Tăng lên gấp đôi' },
			{ k: 'c', t: 'Giảm đi một nửa' },
		],
		correct: 'b',
	},
	'SIM-32': {
		q: 'Định luật Charles phát biểu rằng đối với một lượng khí nhất định ở áp suất không đổi, thể tích khí:',
		opts: [
			{ k: 'a', t: 'Tỉ lệ thuận với nhiệt độ tuyệt đối T (Kelvin)' },
			{ k: 'b', t: 'Tỉ lệ nghịch với nhiệt độ tuyệt đối T' },
			{ k: 'c', t: 'Tỉ lệ thuận với nhiệt độ Celsius t' },
		],
		correct: 'a',
	},
	'SIM-33': {
		q: 'Nhiệt độ tuyệt đối của một khối khí lý tưởng là đại lượng đặc trưng cho:',
		opts: [
			{ k: 'a', t: 'Khối lượng trung bình của các phân tử khí' },
			{ k: 'b', t: 'Động năng tịnh tiến trung bình của các phân tử khí' },
			{ k: 'c', t: 'Số lượng phân tử khí trong một đơn vị thể tích' },
		],
		correct: 'b',
	},
	'SIM-34': {
		q: 'Trong suốt thời gian đang nóng chảy hoặc đang sôi của một chất tinh khiết, nhiệt độ của nó:',
		opts: [
			{ k: 'a', t: 'Liên tục tăng do tiếp tục được cung cấp nhiệt lượng' },
			{ k: 'b', t: 'Không đổi, nhiệt lượng dùng để phá vỡ liên kết cấu trúc' },
			{ k: 'c', t: 'Giảm đi do tỏa nhiệt ra xung quanh' },
		],
		correct: 'b',
	},
	'SIM-35': {
		q: 'Một đoạn dây dẫn mang dòng điện nằm ngang đặt vuông góc với từ trường đều hướng thẳng đứng từ trên xuống. Lực từ tác dụng lên dây có hướng:',
		opts: [
			{ k: 'a', t: 'Song song với dòng điện' },
			{ k: 'b', t: 'Theo phương ngang vuông góc với dòng điện (Left-Hand Rule)' },
			{ k: 'c', t: 'Hướng thẳng đứng lên trên' },
		],
		correct: 'b',
	},
	'SIM-36': {
		q: 'Lực Lorentz tác dụng lên hạt mang điện chuyển động trong từ trường đều KHÔNG thực hiện công cơ học vì:',
		opts: [
			{ k: 'a', t: 'Độ lớn lực Lorentz luôn bằng không' },
			{ k: 'b', t: 'Lực Lorentz luôn vuông góc với vector vận tốc của hạt' },
			{ k: 'c', t: 'Hạt chuyển động thẳng đều' },
		],
		correct: 'b',
	},
	'SIM-37': {
		q: 'Theo định luật Lenz, dòng điện cảm ứng xuất hiện trong mạch kín có chiều sao cho từ trường cảm ứng do nó sinh ra:',
		opts: [
			{ k: 'a', t: 'Luôn cùng chiều với từ trường ban đầu' },
			{ k: 'b', t: 'Chống lại sự biến thiên từ thông sinh ra nó' },
			{ k: 'c', t: 'Luôn ngược chiều với từ trường ban đầu' },
		],
		correct: 'b',
	},
	'SIM-38': {
		q: 'Nguyên tắc hoạt động của máy phát điện xoay chiều dựa trên hiện tượng vật lý nào?',
		opts: [
			{ k: 'a', t: 'Tự cảm' },
			{ k: 'b', t: 'Cảm ứng điện từ' },
			{ k: 'c', t: 'Cộng hưởng điện từ' },
		],
		correct: 'b',
	},
	'SIM-39': {
		q: 'Sau 3 chu kỳ bán rã T, tỉ lệ số hạt nhân phóng xạ ban đầu chưa phân rã còn lại là bao nhiêu?',
		opts: [
			{ k: 'a', t: '1/3' },
			{ k: 'b', t: '1/8' },
			{ k: 'c', t: '1/6' },
		],
		correct: 'b',
	},
	'SIM-40': {
		q: 'Phản ứng nhiệt hạch (sự kết hợp của các hạt nhân rất nhẹ) giải phóng năng lượng lớn và xảy ra chủ yếu ở:',
		opts: [
			{ k: 'a', t: 'Trong các lò phản ứng hạt nhân thương mại hiện nay' },
			{ k: 'b', t: 'Trong lòng Mặt Trời và các ngôi sao' },
			{ k: 'c', t: 'Ở điều kiện nhiệt độ phòng bình thường' },
		],
		correct: 'b',
	},
	'SIM-41': {
		q: 'Đại lượng nào sau đây đặc trưng cho mức độ bền vững của một hạt nhân nguyên tử?',
		opts: [
			{ k: 'a', t: 'Năng lượng liên kết riêng (năng lượng liên kết trên mỗi nucleon)' },
			{ k: 'b', t: 'Năng lượng liên kết toàn phần' },
			{ k: 'c', t: 'Độ hụt khối lượng của hạt nhân' },
		],
		correct: 'a',
	},
	'SIM-42': {
		q: 'Trong dao động điều hòa, li độ biến thiên trễ pha hơn vận tốc một góc bao nhiêu?',
		opts: [
			{ k: 'a', t: 'pi' },
			{ k: 'b', t: 'pi/2' },
			{ k: 'c', t: 'pi/4' },
		],
		correct: 'b',
	},
	'SIM-43': {
		q: 'Nguyên nhân chính gây ra sự dao động tắt dần của một hệ cơ học trong môi trường là:',
		opts: [
			{ k: 'a', t: 'Lực cản và lực ma sát của môi trường làm tiêu hao cơ năng' },
			{ k: 'b', t: 'Khối lượng vật quá lớn' },
			{ k: 'c', t: 'Gia tốc trọng trường thay đổi' },
		],
		correct: 'a',
	},
	'SIM-44': {
		q: 'Hiện tượng cộng hưởng cơ xảy ra khi:',
		opts: [
			{ k: 'a', t: 'Tần số của ngoại lực tuần hoàn bằng tần số dao động riêng của hệ' },
			{ k: 'b', t: 'Biên độ ngoại lực cực đại' },
			{ k: 'c', t: 'Hệ dao động tắt dần hoàn toàn' },
		],
		correct: 'a',
	},
	'SIM-45': {
		q: 'Bước sóng là quãng đường mà sóng truyền đi được trong:',
		opts: [
			{ k: 'a', t: 'Một chu kỳ dao động của sóng' },
			{ k: 'b', t: 'Một giây' },
			{ k: 'c', t: 'Một nửa chu kỳ' },
		],
		correct: 'a',
	},
	'SIM-46': {
		q: 'Trên một sợi dây có sóng dừng ổn định, khoảng cách giữa hai nút sóng liên tiếp bằng:',
		opts: [
			{ k: 'a', t: 'Một bước sóng (lambda)' },
			{ k: 'b', t: 'Một nửa bước sóng (lambda/2)' },
			{ k: 'c', t: 'Một phần tư bước sóng (lambda/4)' },
		],
		correct: 'b',
	},
	'SIM-47': {
		q: 'Điều kiện để hai nguồn sóng gặp nhau giao thoa tạo thành các vân cực đại, cực tiểu ổn định là hai nguồn phải:',
		opts: [
			{ k: 'a', t: 'Cùng tần số, cùng biên độ' },
			{ k: 'b', t: 'Kết hợp (cùng tần số và hiệu số pha không đổi theo thời gian)' },
			{ k: 'c', t: 'Cùng pha và cùng vận tốc truyền' },
		],
		correct: 'b',
	},
	'SIM-48': {
		q: 'Nếu khoảng cách giữa hai điện tích điểm tăng lên gấp đôi thì lực tương tác tĩnh điện giữa chúng thay đổi thế nào?',
		opts: [
			{ k: 'a', t: 'Giảm đi 4 lần' },
			{ k: 'b', t: 'Tăng lên 2 lần' },
			{ k: 'c', t: 'Giảm đi 2 lần' },
		],
		correct: 'a',
	},
	'SIM-49': {
		q: 'Đặc điểm nào sau đây KHÔNG đúng với đường sức điện của điện trường tĩnh?',
		opts: [
			{ k: 'a', t: 'Là các đường cong không khép kín, xuất phát từ điện tích dương và kết thúc ở điện tích âm' },
			{ k: 'b', t: 'Có thể cắt nhau tại các điểm có điện trường mạnh' },
			{ k: 'c', t: 'Nơi nào điện trường mạnh thì đường sức vẽ dày' },
		],
		correct: 'b',
	},
	'SIM-50': {
		q: 'Định luật Ohm cho đoạn mạch có điện trở R phát biểu rằng cường độ dòng điện I tỉ lệ thuận với hiệu điện thế U theo hệ thức:',
		opts: [
			{ k: 'a', t: 'I = U / R' },
			{ k: 'b', t: 'I = U * R' },
			{ k: 'c', t: 'I = R / U' },
		],
		correct: 'a',
	},
	'SIM-51': {
		q: 'Khi mắc song song hai điện trở R1 và R2, điện trở tương đương R_tđ có đặc điểm:',
		opts: [
			{ k: 'a', t: 'R_tđ lớn hơn tổng R1 + R2' },
			{ k: 'b', t: 'R_tđ luôn nhỏ hơn cả R1 và R2' },
			{ k: 'c', t: 'R_tđ bằng trung bình cộng R1 và R2' },
		],
		correct: 'b',
	},
	'SIM-52': {
		q: 'Định luật Ohm cho toàn mạch xác định cường độ dòng điện trong mạch kín gồm suất điện động E, điện trở trong r và điện trở ngoài R là:',
		opts: [
			{ k: 'a', t: 'I = E / (R + r)' },
			{ k: 'b', t: 'I = E / R + r' },
			{ k: 'c', t: 'I = (E - r) / R' },
		],
		correct: 'a',
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

const CHEM10_STEPS = {
	'CHEM10-01': [
		{ n: 1, title: 'Đặt lá vàng', sub: 'Kéo lá vàng (Au) mỏng vào giá đỡ tâm màn huỳnh quang' },
		{ n: 2, title: 'Mở nguồn phóng xạ', sub: 'Nhấp vào nguồn để chiếu chùm hạt alpha (α)' },
		{ n: 3, title: 'Phân tích kết quả', sub: 'Nhấp vào kính hiển vi để xây dựng mô hình nguyên tử' },
	],
	'CHEM10-02': [
		{ n: 1, title: 'Châm đèn cồn', sub: 'Nhấp vào đèn cồn để tạo ngọn lửa' },
		{ n: 2, title: 'Thử muối NaCl', sub: 'Kéo que Pt vào bình NaCl — que tự hơ lên lửa, ngọn lửa chuyển vàng (Na⁺)' },
		{ n: 3, title: 'Thử muối KCl', sub: 'Kéo que Pt vào bình KCl — ngọn lửa chuyển tím (K⁺)' },
		{ n: 4, title: 'Thử muối CuSO₄', sub: 'Kéo que Pt vào bình CuSO₄ — ngọn lửa chuyển lam-lục (Cu²⁺)' },
		{ n: 5, title: 'Thử muối CaCl₂', sub: 'Kéo que Pt vào bình CaCl₂ — ngọn lửa chuyển đỏ cam (Ca²⁺)' },
	],
	'CHEM10-03': [
		{ n: 1, title: 'Rót dung dịch HCl', sub: 'Rót HCl loãng vào ống nghiệm' },
		{ n: 2, title: 'Thêm kẽm', sub: 'Thả mảnh Zn vào ống nghiệm, phản ứng sủi bọt H₂' },
	],
	'CHEM10-04': [
		{ n: 1, title: 'Châm đèn cồn', sub: 'Nhấp vào đèn cồn để tạo ngọn lửa' },
		{ n: 2, title: 'Đốt dây Mg', sub: 'Kéo dây Mg vào ngọn lửa – cháy sáng chói tạo MgO trắng' },
	],
	'CHEM10-05': [
		{ n: 1, title: 'Thêm CaO', sub: 'Rót vôi sống (CaO) vào cốc thủy tinh' },
		{ n: 2, title: 'Rót nước', sub: 'Rót nước vào cốc – phản ứng tỏa nhiệt mạnh, hơi bốc lên' },
	],
	'CHEM10-06': [
		{ n: 1, title: 'Thêm Ba(OH)₂', sub: 'Đổ Ba(OH)₂ vào cốc thủy tinh' },
		{ n: 2, title: 'Thêm NH₄Cl', sub: 'Thêm NH₄Cl – phản ứng thu nhiệt, nhiệt độ hạ xuống' },
	],
	'CHEM10-07': [
		{ n: 1, title: 'Na₂S₂O₃ đặc vào ống 1', sub: 'Rót dung dịch sodium thiosulfate đặc' },
		{ n: 2, title: 'Na₂S₂O₃ loãng vào ống 2', sub: 'Rót dung dịch sodium thiosulfate loãng' },
		{ n: 3, title: 'H₂SO₄ vào ống 1', sub: 'Thêm H₂SO₄ – kết tủa S xuất hiện nhanh' },
		{ n: 4, title: 'H₂SO₄ vào ống 2', sub: 'Thêm H₂SO₄ – kết tủa S xuất hiện chậm hơn' },
	],
	'CHEM10-08': [
		{ n: 1, title: 'Rót H₂O₂', sub: 'Rót dung dịch H₂O₂ vào ống nghiệm – phân hủy chậm' },
		{ n: 2, title: 'Thêm MnO₂', sub: 'Thêm chất xúc tác MnO₂ – bọt O₂ thoát ra mãnh liệt' },
	],
	'CHEM10-09': [
		{ n: 1, title: 'Đá vôi cục vào ống 1', sub: 'Thả cục đá vôi (CaCO₃) vào ống nghiệm 1' },
		{ n: 2, title: 'Bột CaCO₃ vào ống 2', sub: 'Cho bột CaCO₃ mịn vào ống nghiệm 2' },
		{ n: 3, title: 'HCl vào ống 1', sub: 'Rót HCl vào ống 1 – bọt CO₂ thoát chậm' },
		{ n: 4, title: 'HCl vào ống 2', sub: 'Rót HCl vào ống 2 – bọt CO₂ thoát nhanh hơn' },
	],
	'CHEM10-10': [
		{ n: 1, title: 'NaCl vào ống 1', sub: 'Rót dung dịch NaCl vào ống nghiệm 1' },
		{ n: 2, title: 'NaBr vào ống 2', sub: 'Rót dung dịch NaBr vào ống nghiệm 2' },
		{ n: 3, title: 'NaI vào ống 3', sub: 'Rót dung dịch NaI vào ống nghiệm 3' },
		{ n: 4, title: 'AgNO₃ vào ống 1', sub: 'Nhỏ AgNO₃ – kết tủa AgCl trắng' },
		{ n: 5, title: 'AgNO₃ vào ống 2', sub: 'Nhỏ AgNO₃ – kết tủa AgBr vàng nhạt' },
		{ n: 6, title: 'AgNO₃ vào ống 3', sub: 'Nhỏ AgNO₃ – kết tủa AgI vàng' },
	],
	'CHEM10-11': [
		{ n: 1, title: 'Rót dung dịch màu', sub: 'Rót dung dịch màu tím (litmus) vào ống nghiệm' },
		{ n: 2, title: 'Thêm nước chlorine', sub: 'Nhỏ nước chlorine – màu tím mất dần, dung dịch mất màu' },
	],
	'CHEM10-12': [
		{ n: 1, title: 'Rót dung dịch NaBr', sub: 'Rót dung dịch NaBr vào ống nghiệm' },
		{ n: 2, title: 'Thêm nước chlorine', sub: 'Nhỏ nước chlorine – dung dịch chuyển màu cam (Br₂ tự do)' },
	],
};

const CHEM12_STEPS = {
	'CHEM12-01': [
		{ n: 1, title: 'Thêm ethanol', sub: 'Rót ethanol vào ống nghiệm' },
		{ n: 2, title: 'Thêm acetic acid', sub: 'Rót tiếp CH₃COOH' },
		{ n: 3, title: 'Thêm H₂SO₄ đặc', sub: 'Nhỏ xúc tác acid sulfuric đặc' },
		{ n: 4, title: 'Lắp ống nghiệm', sub: 'Đưa ống nghiệm lên giá đỡ' },
		{ n: 5, title: 'Đun nóng', sub: 'Châm đèn cồn và đun nhẹ' },
		{ n: 6, title: 'Quan sát ester', sub: 'Lớp ester thơm nổi lên trên' },
	],
	'CHEM12-02': [
		{ n: 1, title: 'Thêm dầu ăn', sub: 'Rót chất béo vào cốc thủy tinh' },
		{ n: 2, title: 'Thêm NaOH', sub: 'Rót dung dịch NaOH 40%' },
		{ n: 3, title: 'Đun nóng', sub: 'Châm đèn cồn để đun hỗn hợp' },
		{ n: 4, title: 'Khuấy hỗn hợp', sub: 'Lắc/khuấy để phản ứng xảy ra đều' },
		{ n: 5, title: 'Thêm NaCl', sub: 'Rót dung dịch NaCl bão hòa' },
		{ n: 6, title: 'Tách xà phòng', sub: 'Lớp xà phòng trắng nổi lên' },
	],
	'CHEM12-03': [
		{ n: 1, title: 'Thêm NaOH', sub: 'Tạo môi trường kiềm' },
		{ n: 2, title: 'Thêm CuSO₄', sub: 'Tạo Cu(OH)₂ màu xanh' },
		{ n: 3, title: 'Thêm glucose', sub: 'Hòa tan kết tủa Cu(OH)₂' },
		{ n: 4, title: 'Lắc đều', sub: 'Tạo phức xanh lam' },
		{ n: 5, title: 'Đưa lên giá đỡ', sub: 'Kéo ống nghiệm qua đèn cồn' },
		{ n: 6, title: 'Đun nóng', sub: 'Khử Cu(II) khi đun' },
		{ n: 7, title: 'Kết tủa đỏ gạch', sub: 'Xuất hiện Cu₂O đỏ gạch' },
	],
	'CHEM12-04': [
		{ n: 1, title: 'Rót AgNO₃', sub: 'Chuẩn bị thuốc thử bạc' },
		{ n: 2, title: 'Thêm NH₃', sub: 'Tạo thuốc thử Tollens' },
		{ n: 3, title: 'Thêm glucose', sub: 'Cho chất khử vào ống nghiệm' },
		{ n: 4, title: 'Đun cách thủy', sub: 'Làm nóng nhẹ trong bể nước' },
		{ n: 5, title: 'Tráng bạc', sub: 'Bạc sáng bám lên thành ống' },
	],
	'CHEM12-05': [
		{ n: 1, title: 'Rót hồ tinh bột', sub: 'Cho tinh bột vào ống nghiệm' },
		{ n: 2, title: 'Nhỏ iodine', sub: 'Dung dịch chuyển xanh tím' },
		{ n: 3, title: 'Đưa lên giá đỡ', sub: 'Kéo ống nghiệm qua đèn cồn' },
		{ n: 4, title: 'Đun nóng', sub: 'Màu xanh tím nhạt dần' },
		{ n: 5, title: 'Để nguội', sub: 'Màu xanh tím xuất hiện lại' },
	],
	'CHEM12-06': [
		{ n: 1, title: 'Rót protein', sub: 'Cho dung dịch protein vào ống nghiệm' },
		{ n: 2, title: 'Thêm NaOH', sub: 'Tạo môi trường kiềm' },
		{ n: 3, title: 'Thêm CuSO₄', sub: 'Nhỏ vài giọt CuSO₄' },
		{ n: 4, title: 'Màu biuret', sub: 'Lắc đều thấy màu tím' },
	],
	'CHEM12-07': [
		{ n: 1, title: 'Rót nước', sub: 'Nước có phenolphthalein' },
		{ n: 2, title: 'Thả sodium', sub: 'Thả mẩu Na vào nước' },
		{ n: 3, title: 'Na chạy trên mặt nước', sub: 'Sủi khí H₂ và tỏa nhiệt' },
		{ n: 4, title: 'Dung dịch hồng', sub: 'Tạo NaOH làm phenolphthalein hóa hồng' },
	],
	'CHEM12-08': [
		{ n: 1, title: 'Rót CuSO₄', sub: 'Dung dịch màu xanh lam' },
		{ n: 2, title: 'Thả đinh sắt', sub: 'Đưa Fe vào dung dịch CuSO₄' },
		{ n: 3, title: 'Đồng bám đinh', sub: 'Cu màu đỏ bám lên đinh sắt' },
	],
	'CHEM12-09': [
		{ n: 1, title: 'Rót NaOH', sub: 'Cho kiềm vào ống nghiệm' },
		{ n: 2, title: 'Thả nhôm', sub: 'Cho mảnh Al vào dung dịch' },
		{ n: 3, title: 'Sủi khí H₂', sub: 'Nhôm tan dần trong NaOH' },
	],
	'CHEM12-10': [
		{ n: 1, title: 'Thêm Fe₂O₃', sub: 'Đổ bột nâu đỏ vào chén sứ' },
		{ n: 2, title: 'Thêm bột Al', sub: 'Trộn hỗn hợp tecmit' },
		{ n: 3, title: 'Cắm mồi Mg', sub: 'Đặt dải magnesium làm mồi' },
		{ n: 4, title: 'Mồi phản ứng', sub: 'Phản ứng nhiệt nhôm tóe sáng' },
		{ n: 5, title: 'Quan sát', sub: 'Sắt nóng chảy rơi xuống khay cát' },
	],
	'CHEM12-11': [
		{ n: 1, title: 'Rót FeSO₄', sub: 'Ống 1 chứa ion Fe²⁺' },
		{ n: 2, title: 'Rót FeCl₃', sub: 'Ống 2 chứa ion Fe³⁺' },
		{ n: 3, title: 'Tạo Fe(OH)₂', sub: 'Kết tủa xanh trắng' },
		{ n: 4, title: 'Tạo Fe(OH)₃', sub: 'Kết tủa nâu đỏ' },
		{ n: 5, title: 'Oxi hóa', sub: 'Fe(OH)₂ chuyển nâu đỏ trong không khí' },
	],
	'CHEM12-12': [
		{ n: 1, title: 'Rót CuSO₄', sub: 'Chuẩn bị bình điện phân' },
		{ n: 2, title: 'Bật nguồn DC', sub: 'Dòng điện chạy qua dung dịch' },
		{ n: 3, title: 'Quan sát điện cực', sub: 'Đồng bám ở cathode, có bọt khí' },
	],
	'CHEM12-13': [
		{ n: 1, title: 'Rót điện li', sub: 'Nhúng hai thanh Zn và Cu' },
		{ n: 2, title: 'Quan sát Zn', sub: 'Khí H₂ thoát ra ở thanh Zn' },
		{ n: 3, title: 'Đóng mạch', sub: 'Nối mạch pin Zn-Cu' },
		{ n: 4, title: 'Ăn mòn điện hóa', sub: 'Khí H₂ chuyển sang thanh Cu' },
	],
};

// ── Chem steps ──
const LAB_CHEM_STEPS = {
	...CHEM10_STEPS,
	...CHEM12_STEPS,
	'CHEM11-01': [
		{ n: 1, title: 'Thêm dung dịch HCl', sub: 'Rót dung dịch HCl vào ống 1' },
		{ n: 2, title: 'Thêm nước cất', sub: 'Rót nước cất vào ống 2' },
		{ n: 3, title: 'Thêm dung dịch NaOH', sub: 'Rót dung dịch NaOH vào ống 3' },
		{ n: 4, title: 'Nhỏ chất chỉ thị ống 1', sub: 'Môi trường acid làm chỉ thị vạn năng hóa đỏ' },
		{ n: 5, title: 'Nhỏ chất chỉ thị ống 2', sub: 'Môi trường trung tính làm chỉ thị vạn năng hóa lục' },
		{ n: 6, title: 'Nhỏ chất chỉ thị ống 3', sub: 'Môi trường base làm chỉ thị vạn năng hóa xanh tím' },
	],
	'CHEM11-02': [
		{ n: 1, title: 'Thêm dung dịch HCl', sub: 'Rót dung dịch HCl cần chuẩn độ vào bình' },
		{ n: 2, title: 'Thêm phenolphthalein', sub: 'Nhỏ vài giọt chất chỉ thị phenolphthalein (không màu)' },
		{ n: 3, title: 'Chuẩn độ bằng NaOH', sub: 'Nhỏ từ từ dung dịch NaOH từ buret đến khi dung dịch hóa hồng nhạt' },
	],
	'CHEM11-03': [
		{ n: 1, title: 'Thả mảnh đồng', sub: 'Thả mảnh đồng (Cu) vào ống nghiệm' },
		{ n: 2, title: 'Rót HNO₃ đặc', sub: 'Rót dung dịch HNO₃ đặc vào ống nghiệm, xuất hiện khí màu nâu đỏ' },
	],
	'CHEM11-04': [
		{ n: 1, title: 'Rót dung dịch NH₃', sub: 'Rót dung dịch NH₃ đặc vào lọ thứ nhất' },
		{ n: 2, title: 'Rót dung dịch HCl', sub: 'Rót dung dịch HCl đặc vào lọ thứ hai' },
		{ n: 3, title: 'Đưa lại gần nhau', sub: 'Đưa miệng hai lọ lại gần nhau, khói trắng ammonium chloride xuất hiện' },
	],
	'SIM-08': [
		{ n: 1, title: 'Phenolphthalein', sub: 'Nhỏ vài giọt phenolphthalein vào chậu nước' },
		{ n: 2, title: 'Thả Sodium', sub: 'Gắp mẩu Na thả vào chậu nước' },
		{ n: 3, title: 'Quan sát màu hồng', sub: 'Dung dịch chuyển hồng do tạo base' },
	],
	'CHEM11-05': [
		{ n: 1, title: 'Cho đường vào cốc', sub: 'Cho đường cát trắng (saccharose) vào cốc thủy tinh' },
		{ n: 2, title: 'Thêm H₂SO₄ đặc', sub: 'Rót axit H₂SO₄ đặc vào cốc, đường hóa than đen và phồng lên' },
	],
	'CHEM11-06': [
		{ n: 1, title: 'Rót nước bromine', sub: 'Rót dung dịch nước bromine màu vàng cam vào ống nghiệm' },
		{
			n: 2,
			title: 'Sục khí ethylene',
			sub: 'Sục khí ethylene (C₂H₄) vào ống nghiệm, màu vàng cam nhạt dần rồi mất hẳn',
		},
	],
	'CHEM11-07': [
		{ n: 1, title: 'Rót dung dịch AgNO₃', sub: 'Rót dung dịch AgNO₃ trong NH₃ vào ống nghiệm' },
		{ n: 2, title: 'Sục khí acetylene', sub: 'Sục khí acetylene (C₂H₂) vào ống nghiệm, xuất hiện kết tủa vàng nhạt' },
	],
	'CHEM11-08': [
		{ n: 1, title: 'Rót ethanol', sub: 'Rót ethanol khan vào ống nghiệm' },
		{ n: 2, title: 'Thả mẩu sodium', sub: 'Thả một mẩu sodium nhỏ vào ống nghiệm' },
		{ n: 3, title: 'Quan sát bọt khí', sub: 'Mẩu sodium tan dần và giải phóng nhiều bọt khí hydrogen' },
	],
	'CHEM11-09': [
		{ n: 1, title: 'Rót dung dịch phenol', sub: 'Rót dung dịch phenol vào ống nghiệm' },
		{
			n: 2,
			title: 'Thêm nước bromine',
			sub: 'Nhỏ dung dịch nước bromine vào ống nghiệm, xuất hiện kết tủa trắng lập tức',
		},
	],
	'CHEM11-10': [
		{ n: 1, title: 'Rót dung dịch NaOH', sub: 'Rót dung dịch NaOH vào ống nghiệm' },
		{ n: 2, title: 'Tạo kết tủa Cu(OH)₂', sub: 'Nhỏ dung dịch CuSO₄ vào tạo kết tủa xanh Cu(OH)₂' },
		{ n: 3, title: 'Thêm glycerol', sub: 'Thêm dung dịch glycerol vào ống nghiệm' },
		{ n: 4, title: 'Lắc đều ống nghiệm', sub: 'Nhấp ống nghiệm lắc đều, kết tủa tan tạo dung dịch xanh lam thẫm' },
	],
	'CHEM11-11': [
		{ n: 1, title: 'Thí nghiệm với quỳ', sub: 'Rót dung dịch acetic acid vào ống 1 (có quỳ tím hóa đỏ)' },
		{ n: 2, title: 'Thả đá vôi', sub: 'Thả mảnh đá vôi (CaCO₃) vào ống 2' },
		{ n: 3, title: 'Thêm axit vào ống 2', sub: 'Rót dung dịch acetic acid vào ống 2, phản ứng sủi bọt khí CO₂' },
	],
};

const CHEM12_OBSERVATIONS: Record<string, Array<{ key: number; label: string; step: number }>> = {
	'CHEM12-01': [
		{ key: 1, label: 'Hỗn hợp ethanol, acetic acid và H₂SO₄ đặc trong ống nghiệm', step: 3 },
		{ key: 2, label: 'Khi đun nhẹ, hỗn hợp sôi và bay hơi nhẹ', step: 5 },
		{ key: 3, label: 'Lớp ester mùi thơm nổi lên trên', step: 6 },
	],
	'CHEM12-02': [
		{ key: 1, label: 'Dầu ăn và NaOH tạo hỗn hợp đục khi đun', step: 3 },
		{ key: 2, label: 'Hỗn hợp đặc dần khi khuấy', step: 4 },
		{ key: 3, label: 'Thêm NaCl bão hòa làm xà phòng trắng nổi lên', step: 6 },
	],
	'CHEM12-03': [
		{ key: 1, label: 'Tạo kết tủa Cu(OH)₂ màu xanh', step: 2 },
		{ key: 2, label: 'Lắc với glucose tạo dung dịch xanh lam', step: 4 },
		{ key: 3, label: 'Đun nóng xuất hiện kết tủa đỏ gạch Cu₂O', step: 7 },
	],
	'CHEM12-04': [
		{ key: 1, label: 'NH₃ làm kết tủa bạc tan, tạo thuốc thử Tollens', step: 2 },
		{ key: 2, label: 'Đun cách thủy ống nghiệm chứa glucose', step: 4 },
		{ key: 3, label: 'Bạc kim loại bám sáng trên thành ống nghiệm', step: 5 },
	],
	'CHEM12-05': [
		{ key: 1, label: 'Iodine làm hồ tinh bột chuyển xanh tím', step: 2 },
		{ key: 2, label: 'Đun nóng làm màu xanh tím nhạt dần', step: 4 },
		{ key: 3, label: 'Để nguội màu xanh tím xuất hiện lại', step: 5 },
	],
	'CHEM12-06': [
		{ key: 1, label: 'Protein được đưa vào môi trường kiềm NaOH', step: 2 },
		{ key: 2, label: 'Nhỏ CuSO₄ tạo phức với liên kết peptide', step: 3 },
		{ key: 3, label: 'Dung dịch chuyển màu tím biuret', step: 4 },
	],
	'CHEM12-07': [
		{ key: 1, label: 'Sodium chạy trên mặt nước và sủi khí H₂', step: 3 },
		{ key: 2, label: 'Phản ứng tỏa nhiệt, mẩu Na nhỏ dần', step: 3 },
		{ key: 3, label: 'Phenolphthalein chuyển hồng do tạo NaOH', step: 4 },
	],
	'CHEM12-08': [
		{ key: 1, label: 'Dung dịch CuSO₄ ban đầu màu xanh lam', step: 1 },
		{ key: 2, label: 'Đinh sắt được nhúng vào dung dịch CuSO₄', step: 2 },
		{ key: 3, label: 'Đồng đỏ bám lên đinh, dung dịch nhạt màu', step: 3 },
	],
	'CHEM12-09': [
		{ key: 1, label: 'Mảnh nhôm tiếp xúc dung dịch NaOH', step: 2 },
		{ key: 2, label: 'Nhôm tan dần trong môi trường kiềm', step: 3 },
		{ key: 3, label: 'Bọt khí H₂ thoát ra quanh mảnh nhôm', step: 3 },
	],
	'CHEM12-10': [
		{ key: 1, label: 'Bột Fe₂O₃ và Al được trộn trong chén sứ', step: 2 },
		{ key: 2, label: 'Dải Mg được đặt làm mồi phản ứng', step: 3 },
		{ key: 3, label: 'Phản ứng nhiệt nhôm lóe sáng, tỏa nhiệt mạnh', step: 4 },
	],
	'CHEM12-11': [
		{ key: 1, label: 'Ống Fe²⁺ tạo kết tủa Fe(OH)₂ xanh trắng', step: 3 },
		{ key: 2, label: 'Ống Fe³⁺ tạo kết tủa Fe(OH)₃ nâu đỏ', step: 4 },
		{ key: 3, label: 'Fe(OH)₂ bị oxi hóa dần thành màu nâu đỏ', step: 5 },
	],
	'CHEM12-12': [
		{ key: 1, label: 'Dung dịch CuSO₄ màu xanh trong bình điện phân', step: 1 },
		{ key: 2, label: 'Khi bật nguồn, ion chuyển động về các điện cực', step: 2 },
		{ key: 3, label: 'Đồng bám ở cathode và có bọt khí tại điện cực', step: 3 },
	],
	'CHEM12-13': [
		{ key: 1, label: 'Hai thanh Zn và Cu cùng nhúng trong dung dịch điện li', step: 1 },
		{ key: 2, label: 'Trước khi nối dây, khí H₂ thoát ra ở thanh Zn', step: 2 },
		{ key: 3, label: 'Sau khi nối dây, khí H₂ chuyển sang thoát ở thanh Cu', step: 4 },
	],
};

const getChemObservations = (simId: string, chemStep: number) => {
	const chem12 = CHEM12_OBSERVATIONS[simId];
	if (chem12) {
		return chem12.map((obs) => ({ key: obs.key, label: obs.label, active: chemStep >= obs.step }));
	}

	switch (simId) {
		case 'CHEM11-01':
			return [
				{ key: 1, label: 'Ống 1 (acid): Hóa đỏ', active: chemStep >= 5 },
				{ key: 2, label: 'Ống 2 (neutral): Hóa lục', active: chemStep >= 6 },
				{ key: 3, label: 'Ống 3 (base): Hóa xanh tím', active: chemStep >= 7 },
			];
		case 'CHEM11-02':
			return [
				{ key: 1, label: 'Dung dịch HCl ban đầu không màu', active: chemStep >= 2 },
				{ key: 2, label: 'Nhỏ NaOH từ buret xuống bình', active: chemStep >= 4 },
				{ key: 3, label: 'Dung dịch chuyển hồng nhạt bền', active: chemStep >= 4 },
			];
		case 'CHEM11-03':
			return [
				{ key: 1, label: 'Đồng tan và dung dịch hóa xanh lam', active: chemStep >= 3 },
				{ key: 2, label: 'Bọt khí thoát ra mãnh liệt', active: chemStep >= 3 },
				{ key: 3, label: 'Sinh khí NO₂ màu nâu đỏ bốc lên', active: chemStep >= 3 },
			];
		case 'CHEM11-04':
			return [
				{ key: 1, label: 'Rót NH₃ đặc bốc hơi nhẹ', active: chemStep >= 2 },
				{ key: 2, label: 'Rót HCl đặc bốc hơi nhẹ', active: chemStep >= 3 },
				{ key: 3, label: 'Khói trắng NH₄Cl dày đặc ở miệng lọ', active: chemStep >= 4 },
			];
		case 'SIM-08':
			return [
				{ key: 1, label: 'Mẩu Na nóng chảy chạy trên mặt nước', active: chemStep >= 3 },
				{ key: 2, label: 'Phản ứng sủi bọt khí H₂ và có khói', active: chemStep >= 3 },
				{ key: 3, label: 'Nước hóa màu hồng do dung dịch kiềm', active: chemStep >= 4 },
			];
		case 'CHEM11-05':
			return [
				{ key: 1, label: 'Đường dần hóa đen do bị khử', active: chemStep >= 3 },
				{ key: 2, label: 'Cột carbon phồng cao khỏi cốc', active: chemStep >= 3 },
				{ key: 3, label: 'Khí mùi hắc (SO₂, CO₂) thoát ra', active: chemStep >= 3 },
			];
		case 'CHEM11-06':
			return [
				{ key: 1, label: 'Rót nước bromine màu vàng cam', active: chemStep >= 2 },
				{ key: 2, label: 'Sục khí ethylene sủi bọt khí', active: chemStep >= 3 },
				{ key: 3, label: 'Dung dịch bị mất màu vàng cam', active: chemStep >= 3 },
			];
		case 'CHEM11-07':
			return [
				{ key: 1, label: 'Dung dịch AgNO₃/NH₃ trong suốt', active: chemStep >= 2 },
				{ key: 2, label: 'Sục khí acetylene sủi bọt khí', active: chemStep >= 3 },
				{ key: 3, label: 'Xuất hiện kết tủa vàng nhạt Ag₂C₂', active: chemStep >= 3 },
			];
		case 'CHEM11-08':
			return [
				{ key: 1, label: 'Thả mẩu sodium vào ống nghiệm', active: chemStep >= 3 },
				{ key: 2, label: 'Sủi bọt khí H₂ xung quanh mẩu Na', active: chemStep >= 3 },
				{ key: 3, label: 'Mẩu sodium tan dần rồi biến mất', active: chemStep >= 4 },
			];
		case 'CHEM11-09':
			return [
				{ key: 1, label: 'Dung dịch phenol ban đầu trong suốt', active: chemStep >= 2 },
				{ key: 2, label: 'Xuất hiện kết tủa trắng đục lập tức', active: chemStep >= 3 },
				{ key: 3, label: 'Nước bromine bị mất màu', active: chemStep >= 3 },
			];
		case 'CHEM11-10':
			return [
				{ key: 1, label: 'Xuất hiện kết tủa xanh Cu(OH)₂', active: chemStep >= 3 },
				{ key: 2, label: 'Thêm dung dịch glycerol', active: chemStep >= 4 },
				{ key: 3, label: 'Kết tủa tan tạo dung dịch xanh lam thẫm', active: chemStep >= 5 },
			];
		case 'CHEM11-11':
			return [
				{ key: 1, label: 'Ống 1: Quỳ tím hóa đỏ do tính acid', active: chemStep >= 2 },
				{ key: 2, label: 'Ống 2: Viên đá vôi CaCO₃ tan dần', active: chemStep >= 4 },
				{ key: 3, label: 'Ống 2: Sủi bọt khí CO₂ mạnh mẽ', active: chemStep >= 4 },
			];
		case 'CHEM10-01':
			return [
				{ key: 1, label: 'Phần lớn hạt α đi thẳng qua lá vàng', active: chemStep >= 2 },
				{ key: 2, label: 'Một số hạt bị lệch hướng nhẹ', active: chemStep >= 2 },
				{ key: 3, label: 'Rất ít hạt bị bật ngược trở lại (< 1%)', active: chemStep >= 2 },
			];
		case 'CHEM10-02':
			return [
				{ key: 1, label: 'NaCl: ngọn lửa vàng tươi (Na⁺)', active: chemStep >= 3 },
				{ key: 2, label: 'KCl: ngọn lửa tím nhạt (K⁺)', active: chemStep >= 4 },
				{ key: 3, label: 'CuSO₄: ngọn lửa lam (Cu²⁺)', active: chemStep >= 5 },
			];
		case 'CHEM10-03':
			return [
				{ key: 1, label: 'Bọt khí H₂ thoát ra từ mảnh kẽm', active: chemStep >= 2 },
				{ key: 2, label: 'Mảnh Zn tan dần trong dung dịch', active: chemStep >= 2 },
				{ key: 3, label: 'Dung dịch ấm lên do phản ứng tỏa nhiệt', active: chemStep >= 2 },
			];
		case 'CHEM10-04':
			return [
				{ key: 1, label: 'Dây Mg bốc cháy với ánh sáng trắng chói', active: chemStep >= 2 },
				{ key: 2, label: 'Tạo khói trắng MgO', active: chemStep >= 2 },
				{ key: 3, label: 'Không thể nhìn trực tiếp vào ánh sáng', active: chemStep >= 2 },
			];
		case 'CHEM10-05':
			return [
				{ key: 1, label: 'Phản ứng tỏa nhiệt rất mạnh', active: chemStep >= 2 },
				{ key: 2, label: 'Hơi nước bốc lên trên bề mặt', active: chemStep >= 2 },
				{ key: 3, label: 'Tạo Ca(OH)₂ dạng bột (vôi tôi)', active: chemStep >= 2 },
			];
		case 'CHEM10-06':
			return [
				{ key: 1, label: 'Phản ứng thu nhiệt – nhiệt độ giảm xuống', active: chemStep >= 2 },
				{ key: 2, label: 'Mùi khai của khí NH₃ thoát ra', active: chemStep >= 2 },
				{ key: 3, label: 'Hơi ẩm ngưng tụ trên thành cốc (lạnh)', active: chemStep >= 2 },
			];
		case 'CHEM10-07':
			return [
				{ key: 1, label: 'Ống 1 (đặc): kết tủa S xuất hiện nhanh', active: chemStep >= 3 },
				{ key: 2, label: 'Ống 2 (loãng): kết tủa S xuất hiện chậm', active: chemStep >= 4 },
				{ key: 3, label: 'Nồng độ cao → tốc độ phản ứng lớn hơn', active: chemStep >= 4 },
			];
		case 'CHEM10-08':
			return [
				{ key: 1, label: 'H₂O₂ phân hủy chậm khi không có xúc tác', active: chemStep >= 1 },
				{ key: 2, label: 'Thêm MnO₂: bọt O₂ thoát ra mãnh liệt', active: chemStep >= 2 },
				{ key: 3, label: 'MnO₂ không bị tiêu hao sau phản ứng', active: chemStep >= 2 },
			];
		case 'CHEM10-09':
			return [
				{ key: 1, label: 'Ống 1 (cục): bọt CO₂ thoát ra chậm', active: chemStep >= 3 },
				{ key: 2, label: 'Ống 2 (bột): bọt CO₂ thoát ra nhanh hơn', active: chemStep >= 4 },
				{ key: 3, label: 'Diện tích tiếp xúc lớn hơn → phản ứng nhanh hơn', active: chemStep >= 4 },
			];
		case 'CHEM10-10':
			return [
				{ key: 1, label: 'Ống 1 (NaCl): kết tủa AgCl trắng', active: chemStep >= 4 },
				{ key: 2, label: 'Ống 2 (NaBr): kết tủa AgBr vàng nhạt', active: chemStep >= 5 },
				{ key: 3, label: 'Ống 3 (NaI): kết tủa AgI vàng', active: chemStep >= 6 },
			];
		case 'CHEM10-11':
			return [
				{ key: 1, label: 'Màu tím (litmus) nhạt dần khi thêm Cl₂', active: chemStep >= 2 },
				{ key: 2, label: 'Dung dịch mất màu hoàn toàn', active: chemStep >= 2 },
				{ key: 3, label: 'HClO (axit hypoclorơ) là tác nhân tẩy màu', active: chemStep >= 2 },
			];
		case 'CHEM10-12':
			return [
				{ key: 1, label: 'Dung dịch NaBr ban đầu không màu', active: chemStep >= 1 },
				{ key: 2, label: 'Thêm Cl₂: dung dịch chuyển màu cam (Br₂)', active: chemStep >= 2 },
				{ key: 3, label: 'Cl₂ hoạt động hơn Br₂ → đẩy Br ra', active: chemStep >= 2 },
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

const renderRichText = (html: string) => ({
	__html: html.replace(/\$(.+?)\$/g, (_, tex) => {
		const normalizedTex = tex.replace(/\\frac/g, '\\dfrac');
		if (typeof window !== 'undefined' && (window as any).katex) {
			try {
				return (window as any).katex.renderToString(normalizedTex, { throwOnError: false, displayMode: false });
			} catch {
				return normalizedTex.replace(/[\\{}]/g, '');
			}
		}
		return normalizedTex.replace(/[\\{}]/g, '');
	}),
});

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
	const rawSimId = params.get('sim') || (subject === 'chem' ? 'CHEM12-01' : subject === 'physics' ? 'SIM-02' : '');
	const simId = normalizeLabSimId(rawSimId);
	const metaKey = [
		'CHEM10-01',
		'CHEM10-02',
		'CHEM10-03',
		'CHEM10-04',
		'CHEM10-05',
		'CHEM10-06',
		'CHEM10-07',
		'CHEM10-08',
		'CHEM10-09',
		'CHEM10-10',
		'CHEM10-11',
		'CHEM10-12',
		'CHEM12-01',
		'CHEM12-02',
		'CHEM12-03',
		'CHEM12-04',
		'CHEM12-05',
		'CHEM12-06',
		'CHEM12-07',
		'CHEM12-08',
		'CHEM12-09',
		'CHEM12-10',
		'CHEM12-11',
		'CHEM12-12',
		'CHEM12-13',
		'SIM-02',
		'CHEM11-01',
		'CHEM11-02',
		'CHEM11-03',
		'CHEM11-04',
		'SIM-08',
		'CHEM11-05',
		'CHEM11-06',
		'CHEM11-07',
		'CHEM11-08',
		'CHEM11-09',
		'CHEM11-10',
		'CHEM11-11',
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
		'SIM-31',
		'SIM-32',
		'SIM-33',
		'SIM-34',
		'SIM-35',
		'SIM-36',
		'SIM-37',
		'SIM-38',
		'SIM-39',
		'SIM-40',
		'SIM-41',
		'SIM-42',
		'SIM-43',
		'SIM-44',
		'SIM-45',
		'SIM-46',
		'SIM-47',
		'SIM-48',
		'SIM-49',
		'SIM-50',
		'SIM-51',
		'SIM-52',
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

	// SIM-31 Boyle
	const [boyleV, setBoyleV] = useState(3);

	// SIM-32 Charles
	const [charlesT, setCharlesT] = useState(300);

	// SIM-33 Kinetic Theory
	const [kineticT, setKineticT] = useState(300);
	const [kineticN, setKineticN] = useState(30);

	// SIM-34 State Change
	const [stateChangeP, setStateChangeP] = useState(20);

	// SIM-35 Magnetic Force
	const [magForceB, setMagForceB] = useState(1.0);
	const [magForceI, setMagForceI] = useState(3.0);
	const [magForceL, setMagForceL] = useState(2.0);

	// SIM-36 Lorentz Force
	const [lorentzB, setLorentzB] = useState(1.5);
	const [lorentzV, setLorentzV] = useState(3.0);
	const [lorentzQ, setLorentzQ] = useState(1.0);
	const [lorentzM, setLorentzM] = useState(1.0);

	// SIM-37 Induction
	const [inductionSpd, setInductionSpd] = useState(1.5);

	// SIM-38 AC Generator
	const [acGenW, setAcGenW] = useState(3.0);
	const [acGenB, setAcGenB] = useState(1.0);
	const [acGenN, setAcGenN] = useState(4);

	// SIM-39 Radioactivity
	const [radioactiveT, setRadioactiveT] = useState(3.0);
	const [radioactiveN0, setRadioactiveN0] = useState(64);

	// SIM-40 Nuclear
	const [nuclearType, setNuclearType] = useState(0);

	// SIM-41 Binding Energy
	const [bindingEnergyA, setBindingEnergyA] = useState(56);

	// SIM-42 SHM
	const [shmA, setShmA] = useState(2.0);
	const [shmW, setShmW] = useState(2.0);

	// SIM-43 Damped
	const [dampedA, setDampedA] = useState(3.0);
	const [dampedW, setDampedW] = useState(2.0);
	const [dampedB, setDampedB] = useState(0.1);

	// SIM-44 Resonance
	const [resonanceW0, setResonanceW0] = useState(3.0);
	const [resonanceW, setResonanceW] = useState(2.0);
	const [resonanceA0, setResonanceA0] = useState(1.0);

	// SIM-45 Wave
	const [waveA, setWaveA] = useState(0.8);
	const [waveF, setWaveF] = useState(1.5);
	const [waveV, setWaveV] = useState(3.0);

	// SIM-46 Standing
	const [standingF, setStandingF] = useState(2);
	const [standingA, setStandingA] = useState(0.8);

	// SIM-47 Interference
	const [interfF, setInterfF] = useState(2.0);
	const [interfD, setInterfD] = useState(4.0);

	// SIM-48 Coulomb
	const [coulombQ1, setCoulombQ1] = useState(2.0);
	const [coulombQ2, setCoulombQ2] = useState(-2.0);
	const [coulombR, setCoulombR] = useState(3.0);

	// SIM-49 EField
	const [efieldQ1, setEfieldQ1] = useState(3.0);
	const [efieldQ2, setEfieldQ2] = useState(-3.0);

	// SIM-50 Ohm
	const [ohmU, setOhmU] = useState(6.0);
	const [ohmR, setOhmR] = useState(10.0);

	// SIM-51 Resistors
	const [resistorsR1, setResistorsR1] = useState(10.0);
	const [resistorsR2, setResistorsR2] = useState(20.0);
	const [resistorsMode, setResistorsMode] = useState<'series' | 'parallel'>('series');

	// SIM-52 Full Circuit
	const [fullCircuitE, setFullCircuitE] = useState(9.0);
	const [fullCircuitR, setFullCircuitR] = useState(8.0);
	const [fullCircuitr, setFullCircuitr] = useState(2.0);

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

	const { setInitialState } = useModel('@@initialState');

	// Dynamic AI Quiz
	type DynQuestion = { q: string; opts: Array<{ k: string; t: string }>; correct: string; explanation: string };
	const [dynQuizState, setDynQuizState] = useState<'setup' | 'loading' | 'active' | 'done'>('setup');
	const [dynQuizCount, setDynQuizCount] = useState<3 | 5 | 10>(5);
	const [dynQuestions, setDynQuestions] = useState<DynQuestion[]>([]);
	const [dynCurrent, setDynCurrent] = useState(0);
	const [dynAnswers, setDynAnswers] = useState<Record<number, string>>({});
	const [dynUsedLlm, setDynUsedLlm] = useState(false);
	const xpAwardedRef = useRef(false);

	const openedLabRef = useRef<string | null>(null);
	useEffect(() => {
		if (simId && simId !== 'default' && openedLabRef.current !== simId) {
			openedLabRef.current = simId;
			openLabSession({
				simulationId: simId,
				simulationTitle: (meta as any)?.title,
				subject,
			}).catch(() => {});
		}
	}, [simId]);

	useEffect(() => {
		if (dynQuizState === 'done' && dynQuestions.length > 0 && !xpAwardedRef.current) {
			xpAwardedRef.current = true;
			const correct = dynQuestions.filter((q, i) => dynAnswers[i] === q.correct).length;
			const pct = dynQuestions.length > 0 ? Math.round((correct / dynQuestions.length) * 100) : 0;
			const xpEarned = correct * 10;
			completeLabSession({
				simulationId: simId || 'default',
				simulationTitle: (meta as any)?.title,
				subject,
				score: pct,
				totalQuestions: dynQuestions.length,
				correctAnswers: correct,
			}).catch(() => {});
			if (xpEarned > 0) {
				completeActivity(xpEarned)
					.then(() => {
						getUserInfo().then((res) => {
							const user = res.data?.data || res.data;
							setInitialState((s: any) => ({ ...s, currentUser: user }));
						});
					})
					.catch(() => {});
			}
		}
		if (dynQuizState !== 'done') {
			xpAwardedRef.current = false;
		}
	}, [dynQuizState]);

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

	const triggerPrint = useCallback(
		(withAnswers: boolean) => {
			setPrintWithAnswers(withAnswers);
			setShowPrintMenu(false);

			const questionsHtml =
				dynQuestions.length === 0
					? `<div class="print-empty">Chưa có câu hỏi để in. Hãy tạo bộ câu hỏi trước.</div>`
					: dynQuestions
							.map(
								(q, i) => `
								<section class="print-question">
									<div class="print-q-text"><b>Câu ${i + 1}:</b> ${escapeHtml(q.q)}</div>
									<div class="print-opts">
										${q.opts
											.map(
												(o) => `
													<div class="print-opt">
														<b>${escapeHtml(o.k).toUpperCase()}.</b> ${escapeHtml(o.t)}
													</div>
												`,
											)
											.join('')}
									</div>
								</section>
							`,
							)
							.join('');

			const answersHtml =
				withAnswers && dynQuestions.length > 0
					? `
					<section class="print-answer-key">
						<h2>BẢNG ĐÁP ÁN</h2>
						<div class="print-key-grid">
							${dynQuestions
								.map(
									(q, i) => `
										<div class="print-key-item">Câu ${i + 1}: <b>${escapeHtml(q.correct).toUpperCase()}</b></div>
									`,
								)
								.join('')}
						</div>
					</section>
				`
					: '';

			const printHtml = `
			<!doctype html>
			<html>
				<head>
					<meta charset="utf-8" />
					<title>Đề trắc nghiệm ôn tập</title>
					<style>
						@page { margin: 18mm 16mm; }
						* { box-sizing: border-box; }
						body {
							margin: 0;
							background: #fff;
							color: #000;
							font-family: "Times New Roman", Times, serif;
							font-size: 11pt;
						}
						.print-header {
							text-align: center;
							border-bottom: 2px solid #000;
							padding-bottom: 10pt;
							margin-bottom: 16pt;
						}
						.print-header h1 {
							font-size: 16pt;
							font-weight: 900;
							text-transform: uppercase;
							letter-spacing: 1px;
							margin: 0 0 4pt;
						}
						.print-header p {
							font-size: 11pt;
							margin: 3pt 0;
							color: #333;
						}
						.print-questions {
							display: flex;
							flex-direction: column;
							gap: 18pt;
						}
						.print-question {
							break-inside: avoid;
							page-break-inside: avoid;
						}
						.print-q-text {
							font-size: 11pt;
							line-height: 1.5;
							margin-bottom: 6pt;
						}
						.print-opts {
							display: grid;
							grid-template-columns: 1fr 1fr;
							gap: 4pt 16pt;
							padding-left: 12pt;
						}
						.print-opt {
							font-size: 10.5pt;
							line-height: 1.4;
						}
						.print-answer-key {
							border-top: 2px solid #000;
							margin-top: 22pt;
							padding-top: 12pt;
							break-before: avoid;
						}
						.print-answer-key h2 {
							font-size: 13pt;
							margin: 0 0 8pt;
							text-align: center;
						}
						.print-key-grid {
							display: grid;
							grid-template-columns: repeat(5, 1fr);
							gap: 6pt;
						}
						.print-key-item,
						.print-empty {
							font-size: 11pt;
							line-height: 1.5;
						}
					</style>
				</head>
				<body>
					<header class="print-header">
						<h1>ĐỀ TRẮC NGHIỆM ÔN TẬP</h1>
						<p>${escapeHtml(meta.label)} · ${escapeHtml(meta.title)}</p>
						<p>Số câu: ${dynQuestions.length} · Thời gian: ${dynQuestions.length * 2} phút</p>
					</header>
					<main class="print-questions">${questionsHtml}</main>
					${answersHtml}
				</body>
			</html>
		`;

			const iframe = document.createElement('iframe');
			iframe.setAttribute('aria-hidden', 'true');
			iframe.style.position = 'fixed';
			iframe.style.left = '-10000px';
			iframe.style.top = '0';
			iframe.style.width = '210mm';
			iframe.style.height = '297mm';
			iframe.style.border = '0';
			iframe.style.opacity = '0';
			iframe.style.pointerEvents = 'none';

			const cleanUp = () => {
				setTimeout(() => iframe.remove(), 300);
			};

			iframe.onload = () => {
				const printWindow = iframe.contentWindow;
				if (!printWindow) {
					cleanUp();
					return;
				}
				printWindow.onafterprint = cleanUp;
				printWindow.focus();
				setTimeout(() => printWindow.print(), 80);
			};

			document.body.appendChild(iframe);
			iframe.srcdoc = printHtml;
		},
		[dynQuestions, meta.label, meta.title],
	);

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
	const sendChat = useCallback(
		async (presetText?: string) => {
			const t = (presetText ?? chatInput).trim();
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
		},
		[chatInput, metaKey, chats, subject, simId],
	);

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
			} else if (simId === 'SIM-31') {
				setBoyleV(3);
			} else if (simId === 'SIM-32') {
				setCharlesT(300);
			} else if (simId === 'SIM-33') {
				setKineticT(300);
				setKineticN(30);
			} else if (simId === 'SIM-34') {
				setStateChangeP(20);
			} else if (simId === 'SIM-35') {
				setMagForceB(1.0);
				setMagForceI(3.0);
				setMagForceL(2.0);
			} else if (simId === 'SIM-36') {
				setLorentzB(1.5);
				setLorentzV(3.0);
				setLorentzQ(1.0);
				setLorentzM(1.0);
			} else if (simId === 'SIM-37') {
				setInductionSpd(1.5);
			} else if (simId === 'SIM-38') {
				setAcGenW(3.0);
				setAcGenB(1.0);
				setAcGenN(4);
			} else if (simId === 'SIM-39') {
				setRadioactiveT(3.0);
				setRadioactiveN0(64);
			} else if (simId === 'SIM-40') {
				setNuclearType(0);
			} else if (simId === 'SIM-41') {
				setBindingEnergyA(56);
			} else if (simId === 'SIM-42') {
				setShmA(2.0);
				setShmW(2.0);
			} else if (simId === 'SIM-43') {
				setDampedA(3.0);
				setDampedW(2.0);
				setDampedB(0.1);
			} else if (simId === 'SIM-44') {
				setResonanceW0(3.0);
				setResonanceW(2.0);
				setResonanceA0(1.0);
			} else if (simId === 'SIM-45') {
				setWaveA(0.8);
				setWaveF(1.5);
				setWaveV(3.0);
			} else if (simId === 'SIM-46') {
				setStandingF(2);
				setStandingA(0.8);
			} else if (simId === 'SIM-47') {
				setInterfF(2.0);
				setInterfD(4.0);
			} else if (simId === 'SIM-48') {
				setCoulombQ1(2.0);
				setCoulombQ2(-2.0);
				setCoulombR(3.0);
			} else if (simId === 'SIM-49') {
				setEfieldQ1(3.0);
				setEfieldQ2(-3.0);
			} else if (simId === 'SIM-50') {
				setOhmU(6.0);
				setOhmR(10.0);
			} else if (simId === 'SIM-51') {
				setResistorsR1(10.0);
				setResistorsR2(20.0);
				setResistorsMode('series');
			} else if (simId === 'SIM-52') {
				setFullCircuitE(9.0);
				setFullCircuitR(8.0);
				setFullCircuitr(2.0);
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
												? "m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2' \\quad \\vert \\quad e = \\frac{v_2' - v_1'}{v_1 - v_2}"
												: simId === 'SIM-30'
													? 'W = W_t + W_đ = mgh + \\frac{1}{2}\\,m\\,v^2 = \\text{const}'
													: simId === 'SIM-31'
														? 'p\\,V = \\text{const} \\quad \\vert \\quad p_1\\,V_1 = p_2\\,V_2'
														: simId === 'SIM-32'
															? '\\frac{V}{T} = \\text{const} \\quad \\vert \\quad \\frac{V_1}{T_1} = \\frac{V_2}{T_2}'
															: simId === 'SIM-33'
																? 'p = \\frac{1}{3}\\,\\frac{N}{V}\\,m\\,\\bar{v}^2 \\quad \\vert \\quad \\bar{E}_đ = \\frac{3}{2}\\,k\\,T'
																: simId === 'SIM-34'
																	? 'Q = m\\,\\lambda \\quad \\vert \\quad Q = m\\,L'
																	: simId === 'SIM-35'
																		? 'F = B\\,I\\,L\\,\\sin\\theta \\quad \\vert \\quad \\vec{F} \\perp (\\vec{B}, \\vec{I})'
																		: simId === 'SIM-36'
																			? 'f = |q|\\,v\\,B\\,\\sin\\theta \\quad \\vert \\quad R = \\frac{m\\,v}{|q|\\,B}'
																			: simId === 'SIM-37'
																				? 'e_c = -\\frac{\\Delta\\Phi}{\\Delta t} \\quad \\vert \\quad \\Phi = B\\,S\\,\\cos\\alpha'
																				: simId === 'SIM-38'
																					? 'e = E_0\\,\\sin(\\omega\\,t) \\quad \\vert \\quad E_0 = N\\,B\\,S\\,\\omega'
																					: simId === 'SIM-39'
																						? 'N(t) = N_0\\,2^{-\\frac{t}{T}} = N_0\\,e^{-\\lambda\\,t}'
																						: simId === 'SIM-40'
																							? nuclearType === 0
																								? '{^{235}_{92}}\\text{U} + n \\rightarrow X + Y + 3n'
																								: '{^2_1}\\text{H} + {^3_1}\\text{H} \\rightarrow {^4_2}\\text{He} + n'
																							: simId === 'SIM-41'
																								? 'E_{lk} = \\Delta m\\,c^2 \\quad \\vert \\quad E_{lkr} = \\frac{E_{lk}}{A}'
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
				: simId === 'CHEM12-02'
					? '\\text{(C}_{17}\\text{H}_{35}\\text{COO)}_3\\text{C}_3\\text{H}_5 + 3\\text{NaOH} \\xrightarrow{t^\\circ} 3\\text{C}_{17}\\text{H}_{35}\\text{COONa} + \\text{C}_3\\text{H}_5\\text{(OH)}_3'
					: simId === 'CHEM11-01'
						? '\\text{pH} = -\\log[\\text{H}^+] \\quad \\vert \\quad \\text{Chất chỉ thị đổi màu theo môi trường acid/base}'
						: simId === 'CHEM11-02'
							? '\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O} \\quad \\vert \\quad n_{\\text{acid}} = n_{\\text{base}}'
							: simId === 'CHEM11-03'
								? '\\text{Cu} + 4\\text{HNO}_3 \\rightarrow \\text{Cu(NO}_3\\text{)}_2 + 2\\text{NO}_2\\uparrow + 2\\text{H}_2\\text{O}'
								: simId === 'CHEM11-04'
									? '\\text{NH}_3 + \\text{HCl} \\rightarrow \\text{NH}_4\\text{Cl}\\downarrow \\quad \\text{(khói trắng)}'
									: simId === 'SIM-08'
										? '2\\text{Na} + 2\\text{H}_2\\text{O} \\rightarrow 2\\text{NaOH} + \\text{H}_2\\uparrow \\text{ (phản ứng tỏa nhiệt mạnh)}'
										: simId === 'CHEM11-05'
											? '\\text{C}_{12}\\text{H}_{22}\\text{O}_{11} \\xrightarrow{\\text{H}_2\\text{SO}_4\\,\\text{đặc}} 12\\text{C} + 11\\text{H}_2\\text{O}'
											: simId === 'CHEM11-06'
												? '\\text{CH}_2=\\text{CH}_2 + \\text{Br}_2 \\rightarrow \\text{CH}_2\\text{Br}-\\text{CH}_2\\text{Br}'
												: simId === 'CHEM11-07'
													? '\\text{HC}\\equiv\\text{CH} + 2\\text{[Ag(NH}_3\\text{)}_2\\text{]OH} \\rightarrow \\text{AgC}\\equiv\\text{CAg}\\downarrow + 4\\text{NH}_3 + 2\\text{H}_2\\text{O}'
													: simId === 'CHEM11-08'
														? '2\\text{C}_2\\text{H}_5\\text{OH} + 2\\text{Na} \\rightarrow 2\\text{C}_2\\text{H}_5\\text{ONa} + \\text{H}_2\\uparrow'
														: simId === 'CHEM11-09'
															? '\\text{C}_6\\text{H}_5\\text{OH} + 3\\text{Br}_2 \\rightarrow \\text{C}_6\\text{H}_2\\text{Br}_3\\text{OH}\\downarrow + 3\\text{HBr}'
															: simId === 'CHEM11-10'
																? '\\text{Glycerol} + \\text{Cu(OH)}_2 \\rightarrow \\text{phức đồng màu xanh lam}'
																: simId === 'CHEM11-11'
																	? '2\\text{CH}_3\\text{COOH} + \\text{CaCO}_3 \\rightarrow (\\text{CH}_3\\text{COO})_2\\text{Ca} + \\text{CO}_2\\uparrow + \\text{H}_2\\text{O}'
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
													: simId === 'SIM-31'
														? 'Định luật Boyle'
														: simId === 'SIM-32'
															? 'Định luật Charles'
															: simId === 'SIM-33'
																? 'Thuyết động học phân tử'
																: simId === 'SIM-34'
																	? 'Sự chuyển thể của chất'
																	: simId === 'SIM-35'
																		? 'Lực từ Laplace'
																		: simId === 'SIM-36'
																			? 'Lực Lorentz'
																			: simId === 'SIM-37'
																				? 'Cảm ứng điện từ'
																				: simId === 'SIM-38'
																					? 'Máy phát điện xoay chiều'
																					: simId === 'SIM-39'
																						? 'Phân rã phóng xạ'
																						: simId === 'SIM-40'
																							? 'Phản ứng phân hạch & nhiệt hạch'
																							: simId === 'SIM-41'
																								? 'Năng lượng liên kết riêng'
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Vận tốc đầu (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>
														v<sub>0</sub>
													</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{kinV0}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Gia tốc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>a</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{kinA}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s²
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('v = v_0 + a\\,t')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('x = v_0\\,t + \\frac{1}{2}\\,a\\,t^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
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
													<span
														style={{
															width: '30px',
															textAlign: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#3b5bdb',
															fontWeight: 600,
															flex: 'none',
														}}
													>
														a&gt;0
													</span>
													<span style={{ width: '1px', height: '12px', background: '#cdd8f5', flex: 'none' }}></span>
													<span style={{ fontSize: '12px', color: '#4a4f63', fontWeight: kinA > 0 ? 600 : 400 }}>
														nhanh dần đều
													</span>
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
													<span
														style={{
															width: '30px',
															textAlign: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#7048c4',
															fontWeight: 600,
															flex: 'none',
														}}
													>
														a&lt;0
													</span>
													<span style={{ width: '1px', height: '12px', background: '#ddd0f0', flex: 'none' }}></span>
													<span style={{ fontSize: '12px', color: '#4a4f63', fontWeight: kinA < 0 ? 600 : 400 }}>
														chậm dần đều
													</span>
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
													<span
														style={{
															width: '30px',
															textAlign: 'center',
															fontFamily: 'Newsreader,serif',
															fontStyle: 'italic',
															fontSize: '13px',
															color: '#16a34a',
															fontWeight: 600,
															flex: 'none',
														}}
													>
														a=0
													</span>
													<span style={{ width: '1px', height: '12px', background: '#bbf7d0', flex: 'none' }}></span>
													<span style={{ fontSize: '12px', color: '#4a4f63', fontWeight: kinA === 0 ? 600 : 400 }}>
														thẳng đều
													</span>
												</div>
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'v0' ? (
															<>
																v<sub>0</sub>
															</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Độ cao thả (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>h</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{freefallH}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Gia tốc rơi tự do (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>g</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{freefallG}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s²
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('v = g\\,t')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('h = \\frac{1}{2}\\,g\\,t^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lưu ý:</b> Gia tốc rơi tự do{' '}
												<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>g</em> không phụ thuộc vào
												khối lượng của vật thả rơi. Khi bỏ qua sức cản không khí, các vật rơi tự do từ cùng độ cao sẽ
												chạm đất cùng lúc.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Độ cao ném (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>h</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{horizH}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Vận tốc đầu (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>
														v<sub>0</sub>
													</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{horizV0}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('y = h - \\frac{1}{2}\\,g\\,t^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'x = v_0\\,t \\quad \\vert \\quad L = v_0\\,\\sqrt{\\frac{2h}{g}}',
												)}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div
												className='stu-ws__formula-note'
												dangerouslySetInnerHTML={renderRichText(
													'💡 <b>Lưu ý:</b> Thời gian rơi chỉ phụ thuộc độ cao $h$. Tầm xa toàn phần $L$ phụ thuộc đồng thời vào vận tốc ném đầu $v_0$ và độ cao $h$.',
												)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'v0' ? (
															<>
																v<sub>0</sub>
															</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Lực kéo (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>F</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{newtonF}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														N
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng xe (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{newtonM}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Hệ số ma sát (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&mu;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
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
											<div
												dangerouslySetInnerHTML={renderTex('a = \\frac{F - F_{ms}}{m}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('F_{ms} = \\mu\\,m\\,g')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lưu ý:</b> Gia tốc xe tỉ lệ thuận với hợp lực kéo và tỉ lệ nghịch với khối lượng xe. Xe sẽ
												đứng yên hoặc chuyển động thẳng đều nếu lực kéo F &le; F_ms.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'mu' ? (
															<>&mu;</>
														) : row.sym === 'Fms' ? (
															<>
																F<sub>ms</sub>
															</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Góc nghiêng (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&alpha;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Hệ số ma sát (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&mu;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{inclineM}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('a = g\\,(\\sin\\alpha - \\mu\\,\\cos\\alpha)')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('F_{ms} = \\mu\\,m\\,g\\,\\cos\\alpha')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div
												className='stu-ws__formula-note'
												dangerouslySetInnerHTML={renderRichText(
													'💡 <b>Lưu ý:</b> Vật trượt xuống dốc khi góc nghiêng $\\alpha$ đủ lớn thỏa mãn $\\tan\\alpha$ &gt; $\\mu$. Nếu $\\tan\\alpha$ &le; $\\mu$, vật đứng yên do lực ma sát tĩnh cân bằng thành phần trọng lực trượt.',
												)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'alpha' ? (
															<>&alpha;</>
														) : row.sym === 'mu' ? (
															<>&mu;</>
														) : row.sym === 'Fms' ? (
															<>
																F<sub>ms</sub>
															</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Độ cứng lò xo (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>k</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{springK}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														N/m
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{springM}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Biên độ nén/dãn (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>A</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{springA}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('W_t = \\frac{1}{2}\\,k\\,x^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('W_đ = \\frac{1}{2}\\,m\\,v^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('W = W_t + W_đ = \\text{const}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lưu ý:</b> Bỏ qua ma sát, tổng cơ năng của con lắc lò xo luôn được bảo toàn. Động năng
												biến đổi tuần hoàn ngược pha với thế năng đàn hồi.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'Wt' ? (
															<>
																W<sub>t</sub>
															</>
														) : row.sym === 'Wd' ? (
															<>
																W<sub>đ</sub>
															</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Chiều dài dây (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>L</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{pendulumL}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Góc lệch cực đại (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>
														&theta;<sub>0</sub>
													</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Gia tốc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>g</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{pendulumG}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s²
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('\\theta(t) = \\theta_0\\,\\cos(\\omega\\,t)')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('T = 2\\pi\\,\\sqrt{\\frac{L}{g}}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div
												className='stu-ws__formula-note'
												dangerouslySetInnerHTML={renderRichText(
													'💡 <b>Lưu ý:</b> Chu kỳ $T$ của con lắc đơn tỷ lệ thuận với căn bậc hai chiều dài dây $L$. Khối lượng vật nặng không làm thay đổi chu kỳ dao động của con lắc.',
												)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'theta0' ? (
															<>
																&theta;<sub>0</sub>
															</>
														) : row.sym === 'omega' ? (
															<>&omega;</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Bán kính quỹ đạo (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>r</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{circularR}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tốc độ góc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&omega;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{circularW}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														rad/s
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{circularM}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex(
													'v = \\omega\\,r \\quad \\vert \\quad a_{ht} = \\omega^2 r = \\frac{v^2}{r}',
												)}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('F_{ht} = m\\,a_{ht}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lưu ý:</b> Lực hướng tâm F_ht vuông góc với vector vận tốc, chỉ đóng vai trò uốn cong quỹ
												đạo của vật thành hình tròn mà không làm thay đổi tốc độ dài.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'omega' ? (
															<>&omega;</>
														) : row.sym === 'Fht' ? (
															<>
																F<sub>ht</sub>
															</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Khối lượng m₁</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{collisionM1}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Vận tốc đầu v₁</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{collisionV1}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Khối lượng m₂</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{collisionM2}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Vận tốc đầu v₂</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{collisionV2}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Hệ số đàn hồi (e)</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
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
											<div
												dangerouslySetInnerHTML={renderTex("m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'")}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex("e = \\frac{v_2' - v_1'}{v_1 - v_2}")}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div
												className='stu-ws__formula-note'
												dangerouslySetInnerHTML={renderRichText(
													'💡 <b>Lưu ý:</b> Động lượng toàn phần luôn được bảo toàn. Động năng chỉ bảo toàn trong va chạm đàn hồi hoàn toàn ($e=1$). Trong va chạm mềm ($e=0$), động năng hao hụt lớn nhất.',
												)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'm1' ? (
															<>
																m<sub>1</sub>
															</>
														) : row.sym === 'v1' ? (
															<>
																v<sub>1</sub>
															</>
														) : row.sym === 'm2' ? (
															<>
																m<sub>2</sub>
															</>
														) : row.sym === 'v2' ? (
															<>
																v<sub>2</sub>
															</>
														) : (
															row.sym
														)}
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Độ cao thả (h₀)</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{energyH0}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
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
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng vật (m)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{energyM}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('W = W_t + W_đ = mgh + \\frac{1}{2}\\,m\\,v^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('W = \\text{const}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lưu ý:</b> Khi quả cầu trượt không ma sát trên dốc cong, động năng và thế năng chuyển hóa
												qua lại lẫn nhau nhưng cơ năng toàn phần luôn không đổi.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
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
														{row.sym === 'h0' ? (
															<>
																h<sub>0</sub>
															</>
														) : row.sym === 'Wt' ? (
															<>
																W<sub>t</sub>
															</>
														) : row.sym === 'Wd' ? (
															<>
																W<sub>đ</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-31' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Thể tích (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>V</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{boyleV}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														L
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={5}
												step={0.1}
												value={boyleV}
												style={getTrackStyle(boyleV, 1, 5, '#4f6ef7')}
												onChange={(e) => setBoyleV(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('p\\,V = \\text{const}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('p_1\\,V_1 = p_2\\,V_2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div
												className='stu-ws__formula-note'
												dangerouslySetInnerHTML={renderRichText(
													'💡 <b>Định luật Boyle:</b> Đối với một lượng khí nhất định ở nhiệt độ không đổi, áp suất tỉ lệ nghịch với thể tích khí. Khi nén khí (giảm $V$), áp suất $p$ sẽ tăng tương ứng.',
												)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'p', desc: 'áp suất lượng khí (atm)' },
												{ sym: 'V', desc: 'thể tích khí (L)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-32' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Nhiệt độ (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>T</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{charlesT}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														K
													</span>
												</span>
											</div>
											<input
												type='range'
												min={100}
												max={500}
												step={10}
												value={charlesT}
												style={getTrackStyle(charlesT, 100, 500, '#6d54e8')}
												onChange={(e) => setCharlesT(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('\\frac{V}{T} = \\text{const}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\frac{V_1}{T_1} = \\frac{V_2}{T_2}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Định luật Charles:</b> Đối với một lượng khí nhất định ở áp suất không đổi, thể tích tỉ lệ
												thuận với nhiệt độ tuyệt đối. Khi đun nóng khí, thể tích của nó tăng lên đẩy piston ra.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'V', desc: 'thể tích khí (L)' },
												{ sym: 'T', desc: 'nhiệt độ tuyệt đối (K)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-33' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Nhiệt độ (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>T</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{kineticT}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														K
													</span>
												</span>
											</div>
											<input
												type='range'
												min={100}
												max={600}
												step={10}
												value={kineticT}
												style={getTrackStyle(kineticT, 100, 600, '#6d54e8')}
												onChange={(e) => setKineticT(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Số hạt (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>N</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{kineticN}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														hạt
													</span>
												</span>
											</div>
											<input
												type='range'
												min={10}
												max={100}
												step={5}
												value={kineticN}
												style={getTrackStyle(kineticN, 10, 100, '#4f6ef7')}
												onChange={(e) => setKineticN(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('p = \\frac{1}{3}\\,\\frac{N}{V}\\,m\\,\\bar{v}^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\bar{E}_đ = \\frac{3}{2}\\,k\\,T')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Động học phân tử:</b> Áp suất khí sinh ra do va chạm của các phân tử lên thành bình. Khi
												nhiệt độ tăng, các phân tử chuyển động nhanh hơn, va chạm mạnh hơn sinh ra áp suất lớn hơn.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'p', desc: 'áp suất chất khí (Pa)' },
												{ sym: 'N', desc: 'tổng số phân tử khí' },
												{ sym: 'T', desc: 'nhiệt độ tuyệt đối (K)' },
												{ sym: 'Ed', desc: 'động năng tịnh tiến trung bình (J)' },
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
														{row.sym === 'Ed' ? (
															<>
																E<sub>đ</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-34' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Công suất nung (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>P</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{stateChangeP}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														W
													</span>
												</span>
											</div>
											<input
												type='range'
												min={5}
												max={100}
												step={5}
												value={stateChangeP}
												style={getTrackStyle(stateChangeP, 5, 100, '#4f6ef7')}
												onChange={(e) => setStateChangeP(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('Q = m\\,\\lambda \\quad (\\text{nóng chảy})')}
												style={{ fontSize: '14.5px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('Q = m\\,L \\quad (\\text{hóa hơi})')}
												style={{ fontSize: '14.5px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Sự chuyển thể:</b> Trong suốt quá trình nóng chảy hoặc sôi, nhiệt độ của chất không thay
												đổi. Nhiệt năng hấp thụ được dùng hoàn toàn để phá vỡ liên kết cấu trúc tinh thể hoặc liên kết
												lỏng.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'Q', desc: 'nhiệt lượng nhận vào (J)' },
												{ sym: 'm', desc: 'khối lượng chất (kg)' },
												{ sym: 'lambda', desc: 'nhiệt nóng chảy riêng (J/kg)' },
												{ sym: 'L', desc: 'nhiệt hóa hơi riêng (J/kg)' },
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
														{row.sym === 'lambda' ? <>&lambda;</> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-35' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Từ trường (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>B</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{magForceB.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														T
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-2}
												max={2}
												step={0.2}
												value={magForceB}
												style={getTrackStyle(magForceB, -2, 2, '#4f6ef7')}
												onChange={(e) => setMagForceB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Dòng điện (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>I</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{magForceI.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														A
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={magForceI}
												style={getTrackStyle(magForceI, -5, 5, '#6d54e8')}
												onChange={(e) => setMagForceI(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Chiều dài dây (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>L</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{magForceL.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={3}
												step={0.1}
												value={magForceL}
												style={getTrackStyle(magForceL, 0.5, 3, '#4f6ef7')}
												onChange={(e) => setMagForceL(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('F = B\\,I\\,L\\,\\sin\\theta')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\vec{F} \\perp (\\vec{B}, \\vec{I})')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lực Laplace:</b> Chiều của lực từ tác dụng lên dây dẫn mang dòng điện đặt trong từ trường
												được xác định bằng quy tắc bàn tay trái. Đảo chiều dòng điện hoặc từ trường sẽ đảo chiều lực từ.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'F', desc: 'lực từ tác dụng lên dây (N)' },
												{ sym: 'B', desc: 'cảm ứng từ (T)' },
												{ sym: 'I', desc: 'cường độ dòng điện (A)' },
												{ sym: 'L', desc: 'chiều dài dây mang dòng điện (m)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-36' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Từ trường (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>B</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{lorentzB.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														T
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.2}
												value={lorentzB}
												style={getTrackStyle(lorentzB, -3, 3, '#4f6ef7')}
												onChange={(e) => setLorentzB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Vận tốc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>v</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{lorentzV.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={6}
												step={0.2}
												value={lorentzV}
												style={getTrackStyle(lorentzV, 1, 6, '#6d54e8')}
												onChange={(e) => setLorentzV(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Điện tích (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>q</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{lorentzQ.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														C
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-2}
												max={2}
												step={0.5}
												value={lorentzQ}
												style={getTrackStyle(lorentzQ, -2, 2, '#4f6ef7')}
												onChange={(e) => setLorentzQ(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khối lượng (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>m</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{lorentzM.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														kg
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={3}
												step={0.5}
												value={lorentzM}
												style={getTrackStyle(lorentzM, 0.5, 3, '#6d54e8')}
												onChange={(e) => setLorentzM(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('f = |q|\\,v\\,B\\,\\sin\\theta')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('R = \\frac{m\\,v}{|q|\\,B}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lực Lorentz:</b> Lực từ tác dụng lên hạt mang điện chuyển động trong từ trường đều. Do lực
												Lorentz luôn vuông góc với vận tốc, nó đóng vai trò lực hướng tâm khiến hạt chuyển động tròn.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'f', desc: 'lực Lorentz tác dụng (N)' },
												{ sym: 'q', desc: 'điện tích hạt chuyển động (C)' },
												{ sym: 'v', desc: 'vận tốc tức thời của hạt (m/s)' },
												{ sym: 'B', desc: 'cảm ứng từ trường (T)' },
												{ sym: 'R', desc: 'bán kính quỹ đạo tròn (m)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-37' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tốc độ chuyển động (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>v</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{inductionSpd.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.2}
												max={3.0}
												step={0.1}
												value={inductionSpd}
												style={getTrackStyle(inductionSpd, 0.2, 3.0, '#4f6ef7')}
												onChange={(e) => setInductionSpd(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('e_c = -\\frac{\\Delta\\Phi}{\\Delta t}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\Phi = B\\,S\\,\\cos\\alpha')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Định luật Faraday:</b> Suất điện động cảm ứng tỷ lệ thuận với tốc độ biến thiên từ thông
												qua mạch kín. Tốc độ đưa nam châm vào/ra càng nhanh thì cường độ dòng điện cảm ứng sinh ra càng
												lớn.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'Phi', desc: 'từ thông xuyên qua vòng dây (Wb)' },
												{ sym: 'ec', desc: 'suất điện động cảm ứng sinh ra (V)' },
												{ sym: 'v', desc: 'tốc độ dịch chuyển nam châm (m/s)' },
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
														{row.sym === 'Phi' ? (
															<>&Phi;</>
														) : row.sym === 'ec' ? (
															<>
																e<sub>c</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-38' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tốc độ quay (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&omega;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{acGenW.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														rad/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={8}
												step={0.5}
												value={acGenW}
												style={getTrackStyle(acGenW, 1, 8, '#4f6ef7')}
												onChange={(e) => setAcGenW(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Từ trường (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>B</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{acGenB.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														T
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.2}
												max={2.0}
												step={0.1}
												value={acGenB}
												style={getTrackStyle(acGenB, 0.2, 2.0, '#6d54e8')}
												onChange={(e) => setAcGenB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Số vòng dây (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>N</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{acGenN}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														vòng
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={10}
												step={1}
												value={acGenN}
												style={getTrackStyle(acGenN, 1, 10, '#4f6ef7')}
												onChange={(e) => setAcGenN(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('e(t) = E_0\\,\\sin(\\omega\\,t)')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('E_0 = N\\,B\\,S\\,\\omega')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Máy phát điện xoay chiều:</b> Hoạt động dựa trên hiện tượng cảm ứng điện từ. Khi cuộn dây
												quay đều trong từ trường, từ thông qua nó biến thiên sinh ra suất điện động hình sin cảm ứng.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'e', desc: 'suất điện động tức thời (V)' },
												{ sym: 'E0', desc: 'suất điện động cực đại (V)' },
												{ sym: 'N', desc: 'số vòng dây của cuộn cảm' },
												{ sym: 'omega', desc: 'tốc độ góc quay rotor (rad/s)' },
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
														{row.sym === 'E0' ? (
															<>
																E<sub>0</sub>
															</>
														) : row.sym === 'omega' ? (
															<>&omega;</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-39' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Chu kỳ bán rã (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>T</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{radioactiveT.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={6}
												step={0.5}
												value={radioactiveT}
												style={getTrackStyle(radioactiveT, 1, 6, '#4f6ef7')}
												onChange={(e) => setRadioactiveT(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Số hạt ban đầu (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>
														N<sub>0</sub>
													</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{radioactiveN0}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														hạt
													</span>
												</span>
											</div>
											<input
												type='range'
												min={20}
												max={128}
												step={4}
												value={radioactiveN0}
												style={getTrackStyle(radioactiveN0, 20, 128, '#6d54e8')}
												onChange={(e) => setRadioactiveN0(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('N(t) = N_0\\,2^{-\\frac{t}{T}}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('N(t) = N_0\\,e^{-\\lambda\\,t}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Định luật phóng xạ:</b> Số lượng hạt nhân chưa phân rã giảm theo hàm mũ theo thời gian.
												Sau mỗi chu kỳ bán rã T, số lượng hạt nhân chưa phân rã còn lại giảm đi một nửa.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'N0', desc: 'số hạt nhân phóng xạ ban đầu' },
												{ sym: 'N', desc: 'số hạt nhân chưa phân rã tại thời điểm t' },
												{ sym: 'T', desc: 'chu kỳ bán rã chất phóng xạ' },
												{ sym: 'lambda', desc: 'hằng số phóng xạ' },
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
														{row.sym === 'N0' ? (
															<>
																N<sub>0</sub>
															</>
														) : row.sym === 'lambda' ? (
															<>&lambda;</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-40' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
											<button
												style={{
													flex: 1,
													padding: '8px 12px',
													borderRadius: '8px',
													border: '1px solid #4f6ef7',
													background: nuclearType === 0 ? '#4f6ef7' : '#fff',
													color: nuclearType === 0 ? '#fff' : '#4f6ef7',
													fontWeight: 600,
													cursor: 'pointer',
													transition: 'all 0.2s',
												}}
												onClick={() => setNuclearType(0)}
											>
												Phân hạch
											</button>
											<button
												style={{
													flex: 1,
													padding: '8px 12px',
													borderRadius: '8px',
													border: '1px solid #6d54e8',
													background: nuclearType === 1 ? '#6d54e8' : '#fff',
													color: nuclearType === 1 ? '#fff' : '#6d54e8',
													fontWeight: 600,
													cursor: 'pointer',
													transition: 'all 0.2s',
												}}
												onClick={() => setNuclearType(1)}
											>
												Nhiệt hạch
											</button>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											{nuclearType === 0 ? (
												<>
													<div
														dangerouslySetInnerHTML={renderTex('{^{235}_{92}}\\text{U} + n \\rightarrow X + Y + 3n')}
														style={{ fontSize: '14px', color: '#2b2f45', fontWeight: 500 }}
													/>
													<div
														style={{
															height: '1px',
															background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
															margin: '14px 0 10px',
														}}
													/>
													<div className='stu-ws__formula-note'>
														💡 <b>Phản ứng phân hạch:</b> Hạt nhân nặng (như Uranium-235) hấp thụ một neutron chậm rồi
														vỡ thành 2 hạt nhân nhẹ hơn kèm theo giải phóng năng lượng lớn và vài neutron. Các neutron
														mới có thể tiếp tục kích hoạt phản ứng dây chuyền.
													</div>
												</>
											) : (
												<>
													<div
														dangerouslySetInnerHTML={renderTex(
															'{^2_1}\\text{H} + {^3_1}\\text{H} \\rightarrow {^4_2}\\text{He} + n',
														)}
														style={{ fontSize: '14px', color: '#2b2f45', fontWeight: 500 }}
													/>
													<div
														style={{
															height: '1px',
															background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
															margin: '14px 0 10px',
														}}
													/>
													<div className='stu-ws__formula-note'>
														💡 <b>Phản ứng nhiệt hạch:</b> Là sự kết hợp giữa 2 hạt nhân rất nhẹ (như Deuterium và
														Tritium) dưới nhiệt độ và áp suất cực lớn tạo thành hạt nhân Heli nặng hơn và tỏa nhiệt
														lượng khổng lồ.
													</div>
												</>
											)}
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'U-235', desc: 'hạt nhân nguyên liệu Uranium nặng' },
												{ sym: 'n', desc: 'hạt neutron (không mang điện)' },
												{ sym: 'He-4', desc: 'hạt nhân Heli sinh ra từ nhiệt hạch' },
												{ sym: 'E', desc: 'năng lượng tỏa ra (MeV)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-41' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Số khối hạt nhân (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>A</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{bindingEnergyA}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														nucleon
													</span>
												</span>
											</div>
											<input
												type='range'
												min={4}
												max={240}
												step={4}
												value={bindingEnergyA}
												style={getTrackStyle(bindingEnergyA, 4, 240, '#4f6ef7')}
												onChange={(e) => setBindingEnergyA(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('E_{lk} = \\Delta m\\,c^2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('E_{lkr} = \\frac{E_{lk}}{A}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Năng lượng liên kết riêng:</b>{' '}
												{
													'Là năng lượng liên kết tính trên một nucleon. Hạt nhân bền vững nhất ở vùng số khối trung bình (50 < A < 80, ví dụ Fe-56) với năng lượng liên kết riêng lớn nhất (xấp xỉ 8.8 MeV).'
												}
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'Elk', desc: 'năng lượng liên kết toàn phần (MeV)' },
												{ sym: 'Elkr', desc: 'năng lượng liên kết riêng (MeV/nucleon)' },
												{ sym: 'A', desc: 'số khối hạt nhân (tổng số nucleon)' },
												{ sym: 'dm', desc: 'độ hụt khối lượng của hạt nhân (u)' },
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
														{row.sym === 'Elk' ? (
															<>
																E<sub>lk</sub>
															</>
														) : row.sym === 'Elkr' ? (
															<>
																E<sub>lkr</sub>
															</>
														) : row.sym === 'dm' ? (
															<>&Delta;m</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-42' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Biên độ (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>A</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{shmA.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														cm
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={5.0}
												step={0.1}
												value={shmA}
												style={getTrackStyle(shmA, 1.0, 5.0, '#4f6ef7')}
												onChange={(e) => setShmA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tần số góc (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&omega;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{shmW.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														rad/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={5.0}
												step={0.1}
												value={shmW}
												style={getTrackStyle(shmW, 1.0, 5.0, '#6d54e8')}
												onChange={(e) => setShmW(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('x = A\\,\\cos(\\omega\\,t + \\varphi)')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex("v = x' = -\\omega\\,A\\,\\sin(\\omega\\,t + \\varphi)")}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex("a = v' = -\\omega^2\\,A\\,\\cos(\\omega\\,t + \\varphi)")}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div
												className='stu-ws__formula-note'
												dangerouslySetInnerHTML={renderRichText(
													'💡 <b>Dao động điều hòa:</b> Li độ biến thiên điều hòa dạng $\\sin$ hoặc $\\cos$ theo thời gian. Vận tốc biến thiên nhanh pha hơn li độ góc $\\frac{\\pi}{2}$. Gia tốc ngược pha so với li độ.',
												)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'x', desc: 'li độ dao động tức thời (cm)' },
												{ sym: 'A', desc: 'biên độ dao động cực đại (cm)' },
												{ sym: 'omega', desc: 'tần số góc của dao động (rad/s)' },
												{ sym: 'v', desc: 'vận tốc tức thời của vật (cm/s)' },
												{ sym: 'a', desc: 'gia tốc tức thời của vật (cm/s²)' },
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
														{row.sym === 'omega' ? <>&omega;</> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-43' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Biên độ đầu (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>A</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{dampedA.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														cm
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={5.0}
												step={0.1}
												value={dampedA}
												style={getTrackStyle(dampedA, 1.0, 5.0, '#4f6ef7')}
												onChange={(e) => setDampedA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tần số riêng (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>
														&omega;<sub>0</sub>
													</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{dampedW.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														rad/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={5.0}
												step={0.1}
												value={dampedW}
												style={getTrackStyle(dampedW, 1.0, 5.0, '#6d54e8')}
												onChange={(e) => setDampedW(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Hệ số lực cản (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>b</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{dampedB.toFixed(2)}
												</span>
											</div>
											<input
												type='range'
												min={0.0}
												max={0.5}
												step={0.01}
												value={dampedB}
												style={getTrackStyle(dampedB, 0.0, 0.5, '#4f6ef7')}
												onChange={(e) => setDampedB(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('x(t) = A\\,e^{-b\\,t}\\,\\cos(\\omega\\,t)')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('E(t) = E_0\\,e^{-2b\\,t}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Dao động tắt dần:</b> Lực cản môi trường làm tiêu hao cơ năng của hệ dưới dạng nhiệt năng,
												khiến biên độ dao động giảm dần theo quy luật hàm mũ.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'A', desc: 'biên độ ban đầu thả vật (cm)' },
												{ sym: 'b', desc: 'hệ số cản của môi trường' },
												{ sym: 'x', desc: 'li độ tức thời tại thời điểm t (cm)' },
												{ sym: 'E', desc: 'cơ năng của hệ dao động (J)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-44' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tần số góc riêng (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>
														&omega;<sub>0</sub>
													</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{resonanceW0.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														rad/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={5.0}
												step={0.1}
												value={resonanceW0}
												style={getTrackStyle(resonanceW0, 1.0, 5.0, '#4f6ef7')}
												onChange={(e) => setResonanceW0(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tần số ngoại lực (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&omega;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{resonanceW.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														rad/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={5.0}
												step={0.1}
												value={resonanceW}
												style={getTrackStyle(resonanceW, 1.0, 5.0, '#6d54e8')}
												onChange={(e) => setResonanceW(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Biên độ lực cưỡng bức (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>
														F<sub>0</sub>
													</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{resonanceA0.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														N
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={2.0}
												step={0.1}
												value={resonanceA0}
												style={getTrackStyle(resonanceA0, 0.5, 2.0, '#4f6ef7')}
												onChange={(e) => setResonanceA0(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex(
													'A_{cb} = \\frac{F_0}{\\sqrt{m^2(\\omega_0^2 - \\omega^2)^2 + b^2\\omega^2}}',
												)}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\omega \\approx \\omega_0 \\Rightarrow A_{cb} = A_{\\max}',
												)}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div
												className='stu-ws__formula-note'
												dangerouslySetInnerHTML={renderRichText(
													'💡 <b>Hiện tượng cộng hưởng:</b> Biên độ dao động cưỡng bức đạt cực đại khi tần số góc của lực cưỡng bức $\\omega$ trùng với tần số góc riêng $\\omega_0$ của hệ.',
												)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'w0', desc: 'tần số góc dao động riêng (rad/s)' },
												{ sym: 'w', desc: 'tần số góc lực cưỡng bức (rad/s)' },
												{ sym: 'F0', desc: 'biên độ của lực cưỡng bức (N)' },
												{ sym: 'Acb', desc: 'biên độ dao động cưỡng bức (cm)' },
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
														{row.sym === 'w0' ? (
															<>
																&omega;<sub>0</sub>
															</>
														) : row.sym === 'w' ? (
															<>&omega;</>
														) : row.sym === 'F0' ? (
															<>
																F<sub>0</sub>
															</>
														) : row.sym === 'Acb' ? (
															<>
																A<sub>cb</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-45' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Biên độ nguồn (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>A</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{waveA.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														cm
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.2}
												max={1.5}
												step={0.1}
												value={waveA}
												style={getTrackStyle(waveA, 0.2, 1.5, '#4f6ef7')}
												onChange={(e) => setWaveA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tần số sóng (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>f</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{waveF.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														Hz
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={3.0}
												step={0.1}
												value={waveF}
												style={getTrackStyle(waveF, 0.5, 3.0, '#6d54e8')}
												onChange={(e) => setWaveF(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tốc độ truyền (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>v</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{waveV.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m/s
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={5.0}
												step={0.1}
												value={waveV}
												style={getTrackStyle(waveV, 1.0, 5.0, '#4f6ef7')}
												onChange={(e) => setWaveV(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('\\lambda = \\frac{v}{f}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'u_M(t) = A\\,\\cos\\left(2\\pi f t - \\frac{2\\pi d}{\\lambda}\\right)',
												)}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Sóng ngang:</b> Các phần tử của môi trường dao động theo phương vuông góc với phương
												truyền sóng. Sóng truyền đi mang theo năng lượng và trạng thái dao động chứ các phần tử môi
												trường không di chuyển theo sóng.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'A', desc: 'biên độ dao động nguồn (cm)' },
												{ sym: 'f', desc: 'tần số dao động nguồn (Hz)' },
												{ sym: 'v', desc: 'tốc độ lan truyền sóng cơ (m/s)' },
												{ sym: 'lambda', desc: 'bước sóng truyền trên dây (m)' },
												{ sym: 'uM', desc: 'li độ phần tử tại điểm M (cm)' },
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
														{row.sym === 'lambda' ? (
															<>&lambda;</>
														) : row.sym === 'uM' ? (
															<>
																u<sub>M</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-46' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Biên độ sóng nguồn (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>A</em>
													)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{standingA.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														cm
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.2}
												max={1.5}
												step={0.1}
												value={standingA}
												style={getTrackStyle(standingA, 0.2, 1.5, '#4f6ef7')}
												onChange={(e) => setStandingA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Họa tần / Số bụng (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>n</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{standingF}
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={6}
												step={1}
												value={standingF}
												style={getTrackStyle(standingF, 1, 6, '#6d54e8')}
												onChange={(e) => setStandingF(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('L = n\\,\\frac{\\lambda}{2}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('A_{bụng} = 2A \\quad \\vert \\quad A_{nút} = 0')}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Sóng dừng:</b> Sóng dừng là sự giao thoa của sóng tới và sóng phản xạ trên sợi dây có giới
												hạn. Trên sợi dây xuất hiện các nút sóng cố định và các bụng sóng dao động với biên độ cực đại.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'L', desc: 'chiều dài sợi dây đàn hồi (m)' },
												{ sym: 'n', desc: 'số bó sóng (bụng sóng) trên dây' },
												{ sym: 'lambda', desc: 'bước sóng truyền trên dây (m)' },
												{ sym: 'A', desc: 'biên độ sóng thành phần tới/phản xạ (cm)' },
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
														{row.sym === 'lambda' ? <>&lambda;</> : row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-47' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Tần số nguồn (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>f</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{interfF.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														Hz
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={4.0}
												step={0.1}
												value={interfF}
												style={getTrackStyle(interfF, 1.0, 4.0, '#4f6ef7')}
												onChange={(e) => setInterfF(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khoảng cách nguồn (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>d</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{interfD.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														cm
													</span>
												</span>
											</div>
											<input
												type='range'
												min={2.0}
												max={8.0}
												step={0.2}
												value={interfD}
												style={getTrackStyle(interfD, 2.0, 8.0, '#6d54e8')}
												onChange={(e) => setInterfD(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('d_2 - d_1 = k\\,\\lambda \\quad (\\text{Cực đại})')}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'd_2 - d_1 = (k + 0.5)\\,\\lambda \\quad (\\text{Cực tiểu})',
												)}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Giao thoa sóng:</b> Sự gặp nhau của hai nguồn sóng kết hợp tạo ra mạng lưới các điểm cực
												đại (gặp nhau cùng pha, biên độ tăng gấp đôi) và các cực tiểu (ngược pha, triệt tiêu lẫn nhau).
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'd', desc: 'khoảng cách hai nguồn S1, S2 (cm)' },
												{ sym: 'f', desc: 'tần số dao động của hai nguồn (Hz)' },
												{ sym: 'lambda', desc: 'bước sóng lan truyền (cm)' },
												{ sym: 'd1, d2', desc: 'khoảng cách từ điểm đo đến 2 nguồn' },
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
														{row.sym === 'lambda' ? (
															<>&lambda;</>
														) : row.sym === 'd1, d2' ? (
															<>
																d<sub>1,2</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-48' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Điện tích q₁</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{coulombQ1.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														&mu;C
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-5.0}
												max={5.0}
												step={0.5}
												value={coulombQ1}
												style={getTrackStyle(coulombQ1, -5.0, 5.0, '#4f6ef7')}
												onChange={(e) => setCoulombQ1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Điện tích q₂</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{coulombQ2.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														&mu;C
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-5.0}
												max={5.0}
												step={0.5}
												value={coulombQ2}
												style={getTrackStyle(coulombQ2, -5.0, 5.0, '#6d54e8')}
												onChange={(e) => setCoulombQ2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Khoảng cách (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>r</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{coulombR.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														m
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={6.0}
												step={0.2}
												value={coulombR}
												style={getTrackStyle(coulombR, 1.0, 6.0, '#4f6ef7')}
												onChange={(e) => setCoulombR(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('F = k\\,\\frac{|q_1\\,q_2|}{r^2}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('k = 9 \\times 10^9 \\text{ N.m}^2/\\text{C}^2')}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Định luật Coulomb:</b> Lực tương tác tĩnh điện tỷ lệ thuận với tích độ lớn hai điện tích
												và tỷ lệ nghịch với bình phương khoảng cách giữa chúng. Hai điện tích cùng dấu đẩy nhau, trái
												dấu hút nhau.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'q1, q2', desc: 'trị số hai điện tích điểm (C)' },
												{ sym: 'r', desc: 'khoảng cách hai điện tích (m)' },
												{ sym: 'F', desc: 'lực tương tác Coulomb (N)' },
												{ sym: 'k', desc: 'hằng số Coulomb tương tác trong chân không' },
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
														{row.sym === 'q1, q2' ? (
															<>
																q<sub>1,2</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-49' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Điện tích q₁</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{efieldQ1.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														nC
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-5.0}
												max={5.0}
												step={0.5}
												value={efieldQ1}
												style={getTrackStyle(efieldQ1, -5.0, 5.0, '#4f6ef7')}
												onChange={(e) => setEfieldQ1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Điện tích q₂</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{efieldQ2.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														nC
													</span>
												</span>
											</div>
											<input
												type='range'
												min={-5.0}
												max={5.0}
												step={0.5}
												value={efieldQ2}
												style={getTrackStyle(efieldQ2, -5.0, 5.0, '#6d54e8')}
												onChange={(e) => setEfieldQ2(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('\\vec{E} = k\\,\\frac{q}{r^2}\\,\\vec{r}_0')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\vec{E}_{tổng} = \\vec{E}_1 + \\vec{E}_2')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Điện trường:</b> Là môi trường vật chất bao quanh các điện tích. Đường sức điện là đường
												vẽ mà tiếp tuyến tại mỗi điểm trùng với phương của vectơ cường độ điện trường. Chúng đi ra từ
												điện tích dương và đi vào điện tích âm.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'E', desc: 'vectơ cường độ điện trường (V/m)' },
												{ sym: 'q', desc: 'điện tích sinh ra điện trường (C)' },
												{ sym: 'r', desc: 'khoảng cách từ điện tích đến điểm khảo sát (m)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-50' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Hiệu điện thế (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>U</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{ohmU.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														V
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={12.0}
												step={0.5}
												value={ohmU}
												style={getTrackStyle(ohmU, 1.0, 12.0, '#4f6ef7')}
												onChange={(e) => setOhmU(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Điện trở (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>R</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{ohmR}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														&Omega;
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={50}
												step={1}
												value={ohmR}
												style={getTrackStyle(ohmR, 1, 50, '#6d54e8')}
												onChange={(e) => setOhmR(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('I = \\frac{U}{R}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('P = U\\,I = I^2\\,R')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Định luật Ohm:</b> Cường độ dòng điện chạy qua dây dẫn tỷ lệ thuận với hiệu điện thế giữa
												hai đầu dây và tỷ lệ nghịch với điện trở của dây dẫn đó.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'I', desc: 'cường độ dòng điện trong mạch (A)' },
												{ sym: 'U', desc: 'hiệu điện thế đoạn mạch (V)' },
												{ sym: 'R', desc: 'điện trở của dây dẫn mang dòng (Ohm)' },
												{ sym: 'P', desc: 'công suất tiêu thụ điện (W)' },
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
														{row.sym}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-51' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Điện trở R₁</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{resistorsR1}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														&Omega;
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={50}
												step={1}
												value={resistorsR1}
												style={getTrackStyle(resistorsR1, 1, 50, '#4f6ef7')}
												onChange={(e) => setResistorsR1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>Điện trở R₂</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{resistorsR2}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														&Omega;
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={50}
												step={1}
												value={resistorsR2}
												style={getTrackStyle(resistorsR2, 1, 50, '#6d54e8')}
												onChange={(e) => setResistorsR2(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Kiểu ghép mạch</span>
										</div>
										<div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
											<button
												style={{
													flex: 1,
													padding: '8px 12px',
													borderRadius: '8px',
													border: '1px solid #4f6ef7',
													background: resistorsMode === 'series' ? '#4f6ef7' : '#fff',
													color: resistorsMode === 'series' ? '#fff' : '#4f6ef7',
													fontWeight: 600,
													cursor: 'pointer',
													transition: 'all 0.2s',
												}}
												onClick={() => setResistorsMode('series')}
											>
												Nối tiếp
											</button>
											<button
												style={{
													flex: 1,
													padding: '8px 12px',
													borderRadius: '8px',
													border: '1px solid #6d54e8',
													background: resistorsMode === 'parallel' ? '#6d54e8' : '#fff',
													color: resistorsMode === 'parallel' ? '#fff' : '#6d54e8',
													fontWeight: 600,
													cursor: 'pointer',
													transition: 'all 0.2s',
												}}
												onClick={() => setResistorsMode('parallel')}
											>
												Song song
											</button>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											{resistorsMode === 'series' ? (
												<>
													<div
														dangerouslySetInnerHTML={renderTex('R_{tđ} = R_1 + R_2')}
														style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
													/>
													<div
														dangerouslySetInnerHTML={renderTex('I = I_1 = I_2 \\quad \\vert \\quad U = U_1 + U_2')}
														style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
													/>
												</>
											) : (
												<>
													<div
														dangerouslySetInnerHTML={renderTex('\\frac{1}{R_{tđ}} = \\frac{1}{R_1} + \\frac{1}{R_2}')}
														style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
													/>
													<div
														dangerouslySetInnerHTML={renderTex('U = U_1 = U_2 \\quad \\vert \\quad I = I_1 + I_2')}
														style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
													/>
												</>
											)}
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Lưu ý:</b> Khi mắc nối tiếp, điện trở tương đương tăng lên. Khi mắc song song, điện trở
												tương đương luôn nhỏ hơn các điện trở thành phần.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'R1, R2', desc: 'các điện trở thành phần (Ohm)' },
												{ sym: 'Rtd', desc: 'điện trở tương đương của mạch (Ohm)' },
												{ sym: 'I', desc: 'cường độ dòng điện chạy qua mạch chính (A)' },
												{ sym: 'U', desc: 'hiệu điện thế đặt vào hai đầu mạch (V)' },
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
														{row.sym === 'R1, R2' ? (
															<>
																R<sub>1,2</sub>
															</>
														) : row.sym === 'Rtd' ? (
															<>
																R<sub>tđ</sub>
															</>
														) : (
															row.sym
														)}
													</span>
													<span style={{ fontSize: '12.5px', color: '#5a5f73' }}>{row.desc}</span>
												</div>
											))}
										</div>
									</>
								) : simId === 'SIM-52' ? (
									<>
										<div className='stu-ws__section-label'>
											<div className='stu-ws__section-label-bar' />
											<span>Thông số</span>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Suất điện động nguồn (
													<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>&Epsilon;</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{fullCircuitE.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														V
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1.0}
												max={15.0}
												step={0.5}
												value={fullCircuitE}
												style={getTrackStyle(fullCircuitE, 1.0, 15.0, '#4f6ef7')}
												onChange={(e) => setFullCircuitE(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Điện trở ngoài (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>R</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{fullCircuitR}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														&Omega;
													</span>
												</span>
											</div>
											<input
												type='range'
												min={1}
												max={30}
												step={1}
												value={fullCircuitR}
												style={getTrackStyle(fullCircuitR, 1, 30, '#6d54e8')}
												onChange={(e) => setFullCircuitR(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param'>
											<div
												style={{
													display: 'flex',
													alignItems: 'baseline',
													justifyContent: 'space-between',
													marginBottom: '2px',
												}}
											>
												<span style={{ fontSize: '13.5px', color: '#4a4f63', fontWeight: 500 }}>
													Điện trở trong (<em style={{ fontFamily: 'Newsreader,serif', fontStyle: 'italic' }}>r</em>)
												</span>
												<span
													style={{
														fontFamily: 'Newsreader,serif',
														fontSize: '15px',
														fontWeight: 600,
														color: '#2b2f45',
													}}
												>
													{fullCircuitr.toFixed(1)}
													<span
														style={{
															fontFamily: "'Be Vietnam Pro'",
															fontSize: '11px',
															fontWeight: 500,
															color: '#9094a8',
															marginLeft: '4px',
														}}
													>
														&Omega;
													</span>
												</span>
											</div>
											<input
												type='range'
												min={0.1}
												max={5.0}
												step={0.1}
												value={fullCircuitr}
												style={getTrackStyle(fullCircuitr, 0.1, 5.0, '#4f6ef7')}
												onChange={(e) => setFullCircuitr(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('I = \\frac{\\mathcal{E}}{R + r}')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('U_{N} = I\\,R = \\mathcal{E} - I\\,r')}
												style={{ fontSize: '16px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('H = \\frac{U_N}{\\mathcal{E}} = \\frac{R}{R + r}')}
												style={{ fontSize: '15px', color: '#2b2f45', fontWeight: 500, marginTop: '6px' }}
											/>
											<div
												style={{
													height: '1px',
													background: 'linear-gradient(90deg,transparent,#e1e3ee,transparent)',
													margin: '14px 0 10px',
												}}
											/>
											<div className='stu-ws__formula-note'>
												💡 <b>Định luật Ohm toàn mạch:</b> Cường độ dòng điện trong mạch điện kín tỷ lệ thuận với suất
												điện động của nguồn điện và tỷ lệ nghịch với điện trở toàn phần của mạch.
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div
											className='stu-ws__symbols-list'
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '2px',
												background: 'transparent',
												border: 'none',
												padding: 0,
											}}
										>
											{[
												{ sym: 'E', desc: 'suất điện động của nguồn điện (V)' },
												{ sym: 'r', desc: 'điện trở trong của nguồn điện (Ohm)' },
												{ sym: 'R', desc: 'điện trở ngoài tương đương (Ohm)' },
												{ sym: 'I', desc: 'cường độ dòng điện mạch chính (A)' },
												{ sym: 'UN', desc: 'hiệu điện thế hai cực nguồn điện (V)' },
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
														{row.sym === 'E' ? (
															<>&Epsilon;</>
														) : row.sym === 'UN' ? (
															<>
																U<sub>N</sub>
															</>
														) : (
															row.sym
														)}
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
												<span>
													Góc ném (<span dangerouslySetInnerHTML={renderTex('\\theta')} />)
												</span>
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
												<span>
													Vận tốc ban đầu (<span dangerouslySetInnerHTML={renderTex('v_0')} />)
												</span>
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
												<span>
													Gia tốc trọng trường (<span dangerouslySetInnerHTML={renderTex('g')} />)
												</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('v_y = v_0 \\sin\\theta - g\\,t')}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('L = \\frac{v_0^2 \\sin(2\\theta)}{g}')}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('H = \\frac{v_0^2 \\sin^2\\theta}{2g}')}
												style={{ marginTop: '6px' }}
											/>
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
										<div
											className='stu-ws__formula-box'
											dangerouslySetInnerHTML={renderTex('y = a\\,x^2 + b\\,x + c')}
										/>
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
											<div
												dangerouslySetInnerHTML={renderTex('y(t) = v_0 \\sin\\alpha\\,t - \\frac{1}{2}\\,g\\,t^2')}
												style={{ marginTop: '6px' }}
											/>
											<div className='stu-ws__formula-hint'>Cổng: y = -0.25 (x - 8)^2 + 9</div>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>
													Góc ném (<span dangerouslySetInnerHTML={renderTex('\\alpha')} />)
												</span>
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
												<span>
													Vận tốc đầu (<span dangerouslySetInnerHTML={renderTex('v_0')} />)
												</span>
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
												<span>
													Gia tốc (<span dangerouslySetInnerHTML={renderTex('g')} />)
												</span>
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
											<div
												dangerouslySetInnerHTML={renderTex('d_2: A_2 x + B_2 y \\le C_2')}
												style={{ marginTop: '6px' }}
											/>
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
											<div
												dangerouslySetInnerHTML={renderTex('s = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n}}')}
												style={{ marginTop: '6px' }}
											/>
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
									{(LAB_CHEM_STEPS[simId as keyof typeof LAB_CHEM_STEPS] || LAB_CHEM_STEPS['CHEM12-01']).map((st) => {
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
							{subject !== 'chem' && (
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
																			: simId === 'SIM-31'
																				? `V ${boyleV} L  ·  p ${(10 / boyleV).toFixed(1)} atm`
																				: simId === 'SIM-32'
																					? `T ${charlesT} K  ·  V ${(charlesT * 0.01).toFixed(2)} L`
																					: simId === 'SIM-33'
																						? `T ${kineticT} K  ·  N ${kineticN} hạt`
																						: simId === 'SIM-34'
																							? `Công suất P ${stateChangeP} W`
																							: simId === 'SIM-35'
																								? `B ${magForceB.toFixed(1)} T  ·  I ${magForceI.toFixed(1)} A  ·  L ${magForceL.toFixed(1)} m`
																								: simId === 'SIM-36'
																									? `B ${lorentzB.toFixed(1)} T  ·  v ${lorentzV.toFixed(1)} m/s  ·  q ${lorentzQ.toFixed(1)} C  ·  m ${lorentzM.toFixed(1)} kg`
																									: simId === 'SIM-37'
																										? `Tốc độ v ${inductionSpd.toFixed(1)} m/s`
																										: simId === 'SIM-38'
																											? `ω ${acGenW.toFixed(1)} rad/s  ·  B ${acGenB.toFixed(1)} T  ·  N ${acGenN} vòng`
																											: simId === 'SIM-39'
																												? `T ${radioactiveT.toFixed(1)}s  ·  N₀ ${radioactiveN0} hạt`
																												: simId === 'SIM-40'
																													? `Loại: ${nuclearType === 0 ? 'Phân hạch' : 'Nhiệt hạch'}`
																													: simId === 'SIM-41'
																														? `Số khối A ${bindingEnergyA}`
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
								</div>
							)}
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
								) : simId === 'SIM-31' ? (
									<BoyleSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-31',
											subject: 'physics',
											topic: 'boyle',
											parameters: [{ key: 'V', value: boyleV, unit: 'L', label: 'Thể tích' }],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-32' ? (
									<CharlesSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-32',
											subject: 'physics',
											topic: 'charles',
											parameters: [{ key: 'T', value: charlesT, unit: 'K', label: 'Nhiệt độ' }],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-33' ? (
									<KineticSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-33',
											subject: 'physics',
											topic: 'kinetic',
											parameters: [
												{ key: 'T', value: kineticT, unit: 'K', label: 'Nhiệt độ' },
												{ key: 'N', value: kineticN, unit: 'hạt', label: 'Số hạt' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-34' ? (
									<StateChangeSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-34',
											subject: 'physics',
											topic: 'statechange',
											parameters: [{ key: 'P', value: stateChangeP, unit: 'W', label: 'Công suất nung' }],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-35' ? (
									<MagForceSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-35',
											subject: 'physics',
											topic: 'magforce',
											parameters: [
												{ key: 'B', value: magForceB, unit: 'T', label: 'Từ trường B' },
												{ key: 'I', value: magForceI, unit: 'A', label: 'Dòng điện I' },
												{ key: 'L', value: magForceL, unit: 'm', label: 'Chiều dài L' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-36' ? (
									<LorentzSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-36',
											subject: 'physics',
											topic: 'lorentz',
											parameters: [
												{ key: 'B', value: lorentzB, unit: 'T', label: 'Từ trường B' },
												{ key: 'v', value: lorentzV, unit: 'm/s', label: 'Vận tốc v' },
												{ key: 'q', value: lorentzQ, unit: 'C', label: 'Điện tích q' },
												{ key: 'm', value: lorentzM, unit: 'kg', label: 'Khối lượng m' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-37' ? (
									<InductionSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-37',
											subject: 'physics',
											topic: 'induction',
											parameters: [{ key: 'spd', value: inductionSpd, unit: 'm/s', label: 'Tốc độ nam châm' }],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-38' ? (
									<ACGenSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-38',
											subject: 'physics',
											topic: 'acgen',
											parameters: [
												{ key: 'w', value: acGenW, unit: 'rad/s', label: 'Tốc độ quay' },
												{ key: 'B', value: acGenB, unit: 'T', label: 'Từ trường B' },
												{ key: 'N', value: acGenN, unit: 'vòng', label: 'Số vòng dây' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-39' ? (
									<RadioactiveSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-39',
											subject: 'physics',
											topic: 'radioactive',
											parameters: [
												{ key: 'T', value: radioactiveT, unit: 's', label: 'Chu kỳ bán rã' },
												{ key: 'N0', value: radioactiveN0, unit: 'hạt', label: 'Số hạt ban đầu' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-40' ? (
									<NuclearSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-40',
											subject: 'physics',
											topic: 'nuclear',
											parameters: [{ key: 'type', value: nuclearType, unit: '', label: 'Loại phản ứng' }],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-41' ? (
									<BindingEnergySimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-41',
											subject: 'physics',
											topic: 'bindingenergy',
											parameters: [{ key: 'A', value: bindingEnergyA, unit: '', label: 'Số khối A' }],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-42' ? (
									<ShmSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-42',
											subject: 'physics',
											topic: 'shm',
											parameters: [
												{ key: 'A', value: shmA, unit: 'cm', label: 'Biên độ' },
												{ key: 'omega', value: shmW, unit: 'rad/s', label: 'Tần số góc' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-43' ? (
									<DampedSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-43',
											subject: 'physics',
											topic: 'damped',
											parameters: [
												{ key: 'A', value: dampedA, unit: 'cm', label: 'Biên độ đầu' },
												{ key: 'omega', value: dampedW, unit: 'rad/s', label: 'Tần số riêng' },
												{ key: 'b', value: dampedB, unit: '', label: 'Hệ số cản' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-44' ? (
									<ResonanceSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-44',
											subject: 'physics',
											topic: 'resonance',
											parameters: [
												{ key: 'omega0', value: resonanceW0, unit: 'rad/s', label: 'Tần số riêng' },
												{ key: 'omega', value: resonanceW, unit: 'rad/s', label: 'Tần số lực' },
												{ key: 'F0', value: resonanceA0, unit: 'N', label: 'Biên độ lực' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-45' ? (
									<WaveSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-45',
											subject: 'physics',
											topic: 'wave',
											parameters: [
												{ key: 'A', value: waveA, unit: 'cm', label: 'Biên độ' },
												{ key: 'f', value: waveF, unit: 'Hz', label: 'Tần số' },
												{ key: 'v', value: waveV, unit: 'm/s', label: 'Tốc độ sóng' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-46' ? (
									<StandingSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-46',
											subject: 'physics',
											topic: 'standing',
											parameters: [
												{ key: 'n', value: standingF, unit: '', label: 'Số bụng' },
												{ key: 'A', value: standingA, unit: 'cm', label: 'Biên độ nguồn' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-47' ? (
									<InterferenceSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-47',
											subject: 'physics',
											topic: 'interference',
											parameters: [
												{ key: 'f', value: interfF, unit: 'Hz', label: 'Tần số' },
												{ key: 'd', value: interfD, unit: 'cm', label: 'Khoảng cách' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-48' ? (
									<CoulombSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-48',
											subject: 'physics',
											topic: 'coulomb',
											parameters: [
												{ key: 'q1', value: coulombQ1, unit: 'μC', label: 'Điện tích q1' },
												{ key: 'q2', value: coulombQ2, unit: 'μC', label: 'Điện tích q2' },
												{ key: 'r', value: coulombR, unit: 'm', label: 'Khoảng cách r' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-49' ? (
									<EFieldSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-49',
											subject: 'physics',
											topic: 'efield',
											parameters: [
												{ key: 'q1', value: efieldQ1, unit: 'nC', label: 'Điện tích q1' },
												{ key: 'q2', value: efieldQ2, unit: 'nC', label: 'Điện tích q2' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-50' ? (
									<OhmSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-50',
											subject: 'physics',
											topic: 'ohm',
											parameters: [
												{ key: 'U', value: ohmU, unit: 'V', label: 'Hiệu điện thế' },
												{ key: 'R', value: ohmR, unit: 'Ω', label: 'Điện trở R' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-51' ? (
									<ResistorsSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-51',
											subject: 'physics',
											topic: 'resistors',
											parameters: [
												{ key: 'R1', value: resistorsR1, unit: 'Ω', label: 'Điện trở R1' },
												{ key: 'R2', value: resistorsR2, unit: 'Ω', label: 'Điện trở R2' },
												{ key: 'mode', value: resistorsMode === 'series' ? 0 : 1, unit: '', label: 'Kiểu mắc' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
										resetKey={physResetKey}
									/>
								) : simId === 'SIM-52' ? (
									<FullCircuitSimulation
										key={physResetKey}
										config={{
											simulation_id: 'SIM-52',
											subject: 'physics',
											topic: 'fullcircuit',
											parameters: [
												{ key: 'E', value: fullCircuitE, unit: 'V', label: 'Suất điện động E' },
												{ key: 'R', value: fullCircuitR, unit: 'Ω', label: 'Điện trở ngoài R' },
												{ key: 'r', value: fullCircuitr, unit: 'Ω', label: 'Điện trở trong r' },
											],
										}}
										isPlaying={isPhPlaying}
										isSlow={isPhSlow}
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
								<GenericChemSimulation
									config={{
										simulation_id: simId || 'CHEM11-01',
										subject: 'chemistry',
										topic: 'generic',
										parameters: [],
									}}
									currentStep={chemStep}
									onStepChange={(step: number) => setChemStep(step)}
								/>
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
						<div className='stu-ws__right-bubbles' aria-hidden='true'>
							<span />
							<span />
							<span />
							<span />
							<span />
							<span />
						</div>

						{/* Tutor header */}
						<div className='stu-ws__tutor-header'>
							<div className='stu-ws__tutor-icon'>
								<span className='stu-ws__tutor-core' />
								<span className='stu-ws__tutor-spark' />
							</div>
							<div className='stu-ws__tutor-copy'>
								<span className='stu-ws__tutor-name'>Trợ lý AI</span>
								<div className='stu-ws__tutor-status'>
									<span className='stu-ws__tutor-live' />
									<span>Đang trực tuyến</span>
								</div>
							</div>
						</div>

						{/* Tabs Header */}
						<div className={`stu-ws__right-tabs stu-ws__right-tabs--${activeRightTab}`}>
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
							<span className='stu-ws__right-tab-indicator' />
						</div>

						{activeRightTab === 'chat' ? (
							<div className='stu-ws__chat-shell'>
								{/* Chat messages */}
								<div className='stu-ws__chat scl'>
									{(chats[metaKey] || []).map((m, i) => (
										<div
											key={i}
											className={`stu-ws__chat-row ${m.role === 'user' ? 'stu-ws__chat-row--user' : 'stu-ws__chat-row--ai'}`}
										>
											{m.role === 'ai' && <span className='stu-ws__chat-avatar'>AI</span>}
											<div
												className={`stu-ws__chat-msg ${m.role === 'user' ? 'stu-ws__chat-msg--user' : 'stu-ws__chat-msg--ai'}`}
											>
												{m.text}
											</div>
										</div>
									))}
								</div>

								{/* Chat input */}
								<div className='stu-ws__chat-composer'>
									{(chats[metaKey] || []).length <= 1 && (
										<div className='stu-ws__chat-chips'>
											{RIGHT_CHAT_CHIPS[subject].map((chip) => (
												<button key={chip} type='button' onClick={() => sendChat(chip)}>
													{chip}
												</button>
											))}
										</div>
									)}
									<div className='stu-ws__chat-input-row'>
										<input
											className='stu-ws__chat-input'
											value={chatInput}
											onChange={(e) => setChatInput(e.target.value)}
											onKeyDown={(e) => e.key === 'Enter' && sendChat()}
											placeholder='Đặt câu hỏi…'
										/>
										<div className='stu-ws__chat-send' onClick={() => sendChat()}>
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
								</div>
							</div>
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
										const progressPct = `${Math.round(((picked ? dynCurrent + 1 : dynCurrent) / dynQuestions.length) * 100)}%`;
										return (
											<div className='stu-ws__quiz stu-ws__quiz--active'>
												<div className='stu-ws__quiz-header'>
													<span
														className='stu-ws__quiz-badge'
														title={dynUsedLlm ? 'Câu hỏi tạo bởi AI' : 'Câu hỏi mẫu'}
													>
														AI
													</span>
													<span className='stu-ws__quiz-count'>
														Câu {dynCurrent + 1}/{dynQuestions.length}
													</span>
													<div className='dqz-print-wrap'>
														<div
															className='dqz-print-btn'
															onClick={() => setShowPrintMenu((v) => !v)}
															title='In / Xuất PDF'
														>
															In đề
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
												<div className='stu-ws__quiz-progress'>
													<span style={{ width: progressPct }} />
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
																>
																	{o.k.toUpperCase()}
																</div>
																<span>{o.t}</span>
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
															<span
																style={{
																	display: 'block',
																	fontWeight: 400,
																	marginTop: 3,
																	fontSize: 11.5,
																	lineHeight: 1.45,
																}}
															>
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
													{dynCurrent < dynQuestions.length - 1 ? (
														<div
															className={`dqz-nav-btn dqz-nav-btn--primary ${!picked ? 'dqz-nav-btn--disabled' : ''}`}
															onClick={() => picked && setDynCurrent((c) => c + 1)}
														>
															Tiếp →
														</div>
													) : (
														<div
															className={`dqz-nav-btn dqz-nav-btn--primary ${!picked ? 'dqz-nav-btn--disabled' : ''}`}
															onClick={() => picked && setDynQuizState('done')}
														>
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
												<div
													className='dqz-results__score'
													style={{
														background: `conic-gradient(var(--right-accent) ${pct}%, var(--right-border) 0)`,
													}}
												>
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
										{dynQuestions.length === 0 ? (
											<div className='print-empty'>Chưa có câu hỏi để in. Hãy tạo bộ câu hỏi trước.</div>
										) : (
											dynQuestions.map((q, i) => (
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
											))
										)}
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
