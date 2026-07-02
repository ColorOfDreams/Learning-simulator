import CelebrationOverlay from '@/components/CelebrationOverlay';
import { chatWithAiPrompt, generateAiQuiz } from '@/services/ai/api';
import { completeActivity, completeLabSession, getUserInfo, openLabSession } from '@/services/base/api';
import GenericChemSimulation from '@simulations/chemistry/GenericChemSimulation';
import { CHEM_EXPERIMENT_ALIASES, EXPERIMENTS_CONFIG } from '@simulations/chemistry/experiments';
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
import GenericMathSimulation from '@simulations/math/GenericMathSimulation';

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
	'SIM-08': 'MATH10-01',
	'SIM-08-math': 'MATH10-01',
	'SIM-09': 'CHEM11-05',
	'SIM-10': 'CHEM11-06',
	'SIM-11': 'CHEM11-07',
	'SIM-12': 'CHEM11-08',
	'SIM-13': 'CHEM11-09',
	'SIM-14': 'CHEM11-10',
	'SIM-15': 'CHEM11-11',
	'SIM-16': 'MATH10-02',
	'SIM-17': 'MATH10-03',
	'SIM-18': 'MATH10-04',
	'SIM-19': 'MATH10-05',
	'SIM-20': 'MATH10-06',
};

const normalizeLabSimId = (simId: string) => CHEM_SIM_ALIASES[simId] || simId;

const CHEM10_META = {
	'CHEM10-01': {
		label: 'Hóa học 10',
		title: 'Thí nghiệm bắn phá lá vàng – Rutherford',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-02': {
		label: 'Hóa học 10',
		title: 'Thử màu ngọn lửa của các kim loại',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-03': {
		label: 'Hóa học 10',
		title: 'Kẽm tác dụng với dung dịch HCl',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-04': {
		label: 'Hóa học 10',
		title: 'Đốt cháy dây magnesium trong không khí',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-05': {
		label: 'Hóa học 10',
		title: 'Phản ứng tỏa nhiệt – tôi vôi (CaO + H₂O)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-06': {
		label: 'Hóa học 10',
		title: 'Phản ứng thu nhiệt (NH₄Cl + Ba(OH)₂)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-07': {
		label: 'Hóa học 10',
		title: 'Ảnh hưởng của nồng độ đến tốc độ phản ứng',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-08': {
		label: 'Hóa học 10',
		title: 'Ảnh hưởng của chất xúc tác – phân hủy H₂O₂',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-09': {
		label: 'Hóa học 10',
		title: 'Ảnh hưởng của diện tích bề mặt tiếp xúc',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-10': {
		label: 'Hóa học 10',
		title: 'Nhận biết ion halide bằng dung dịch AgNO₃',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-11': {
		label: 'Hóa học 10',
		title: 'Tính tẩy màu của nước chlorine',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM10-12': {
		label: 'Hóa học 10',
		title: 'Chlorine đẩy bromine ra khỏi muối bromide',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
};

const CHEM12_META = {
	'CHEM12-01': {
		label: 'Hóa học 12',
		title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-02': {
		label: 'Hóa học 12',
		title: 'Phản ứng xà phòng hóa chất béo',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-03': {
		label: 'Hóa học 12',
		title: 'Glucose tác dụng với Cu(OH)₂',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-04': {
		label: 'Hóa học 12',
		title: 'Phản ứng tráng bạc của glucose',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-05': {
		label: 'Hóa học 12',
		title: 'Phản ứng màu của tinh bột với iodine',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-06': {
		label: 'Hóa học 12',
		title: 'Phản ứng màu biuret của protein',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-07': {
		label: 'Hóa học 12',
		title: 'Sodium tác dụng với nước',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-08': {
		label: 'Hóa học 12',
		title: 'Đinh sắt tác dụng với dung dịch CuSO₄',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-09': {
		label: 'Hóa học 12',
		title: 'Nhôm tác dụng với dung dịch NaOH',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-10': {
		label: 'Hóa học 12',
		title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-11': {
		label: 'Hóa học 12',
		title: 'Điều chế Fe(OH)₂ và Fe(OH)₃',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-12': {
		label: 'Hóa học 12',
		title: 'Điện phân dung dịch CuSO₄',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
	'CHEM12-13': {
		label: 'Hóa học 12',
		title: 'Ăn mòn điện hóa học (pin Zn-Cu)',
		tutor: 'Trợ lý thí nghiệm AI',
		className: 'chem',
	},
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
	'SIM-08-math': { label: 'Toán 10', title: 'Đồ thị hàm số bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-16': { label: 'Toán 10', title: 'Ném xiên và vòm cổng parabol', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-17': { label: 'Toán 10', title: 'Miền nghiệm hệ bất phương trình', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-18': { label: 'Toán 10', title: 'Hệ thức lượng tam giác cột cờ', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-19': { label: 'Toán 10', title: 'Định nghĩa Elip ghim đinh', tutor: 'Trợ lý Toán AI', className: 'math' },
	'SIM-20': { label: 'Toán 10', title: 'Thống kê số liệu mẫu và biểu đồ', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH10-01': {
		label: 'Toán 10',
		title: 'Đồ thị hàm số bậc hai – Đỉnh & Trục đối xứng',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH10-02': { label: 'Toán 10', title: 'Vectơ và các phép toán vectơ', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH10-03': { label: 'Toán 10', title: 'Phương trình đường thẳng', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH10-04': {
		label: 'Toán 10',
		title: 'Đường tròn và phương trình đường tròn',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH10-05': {
		label: 'Toán 10',
		title: 'Định lý cosin và sin trong tam giác',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH10-06': { label: 'Toán 10', title: 'Hệ bất phương trình hai ẩn', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH10-07': {
		label: 'Toán 10',
		title: 'Giá trị lượng giác – Tam giác vuông',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH10-08': {
		label: 'Toán 10',
		title: 'Thống kê mô tả – Phân phối & Box plot',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-01': { label: 'Toán 11', title: 'Đồ thị hàm lượng giác', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH11-02': {
		label: 'Toán 11',
		title: 'Vòng tròn đơn vị & phương trình lượng giác',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-03': {
		label: 'Toán 11',
		title: 'Hoán vị, tổ hợp & Nhị thức Newton',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-04': { label: 'Toán 11', title: 'Xác suất sự kiện & biến cố', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH11-05': { label: 'Toán 11', title: 'Giới hạn dãy số', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH11-06': {
		label: 'Toán 11',
		title: 'Giới hạn hàm số & hàm liên tục',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-07': {
		label: 'Toán 11',
		title: 'Đạo hàm & tiếp tuyến đường cong',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-08': {
		label: 'Toán 11',
		title: 'Phép dời hình & phép đồng dạng',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-09': {
		label: 'Toán 11',
		title: 'Đường thẳng & mặt phẳng trong không gian',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-10': {
		label: 'Toán 11',
		title: 'Quan hệ vuông góc trong không gian',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH11-11': { label: 'Toán 11', title: 'Hình lăng trụ & hình chóp', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH12-01': {
		label: 'Toán 12',
		title: 'Đồ thị hàm số bậc 3 & bảng biến thiên',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH12-02': { label: 'Toán 12', title: 'Hàm phân thức & tiệm cận', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH12-03': { label: 'Toán 12', title: 'Hàm số mũ & lũy thừa', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH12-04': {
		label: 'Toán 12',
		title: 'Hàm logarit – đồ thị & tính chất',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH12-05': {
		label: 'Toán 12',
		title: 'Tích phân – diện tích dưới đường cong',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH12-06': {
		label: 'Toán 12',
		title: 'Diện tích miền giữa hai đường cong',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH12-07': { label: 'Toán 12', title: 'Số phức – mặt phẳng Argand', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH12-08': { label: 'Toán 12', title: 'Mặt cầu – mặt trụ – mặt nón', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH12-09': { label: 'Toán 12', title: 'Khối đa diện & thể tích', tutor: 'Trợ lý Toán AI', className: 'math' },
	'MATH12-10': {
		label: 'Toán 12',
		title: 'Phương trình mặt phẳng trong Oxyz',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	'MATH12-11': {
		label: 'Toán 12',
		title: 'Đường thẳng trong không gian Oxyz',
		tutor: 'Trợ lý Toán AI',
		className: 'math',
	},
	default_math: { label: 'Toán 10', title: 'Hàm bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
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
	'CHEM10-01': [
		{ role: 'ai', text: 'Chào bạn! Tại sao Rutherford bắn hạt α vào lá vàng lại thấy một số hạt bị bật ngược?' },
	],
	'CHEM10-02': [
		{
			role: 'ai',
			text: 'Chào bạn! Mỗi nguyên tố kim loại cho ngọn lửa màu khác nhau — điều gì tạo ra sự khác biệt đó?',
		},
	],
	'CHEM10-03': [
		{ role: 'ai', text: 'Chào bạn! Trong phản ứng Zn + HCl, chất nào đóng vai trò chất khử và chất oxi hóa?' },
	],
	'CHEM10-04': [{ role: 'ai', text: 'Chào bạn! Khi đốt Mg trong không khí, sản phẩm tạo thành là gì và có màu gì?' }],
	'CHEM10-05': [
		{ role: 'ai', text: 'Chào bạn! Vì sao phản ứng tôi vôi tỏa nhiệt rất mạnh? Nhiệt lượng đó đến từ đâu?' },
	],
	'CHEM10-06': [
		{ role: 'ai', text: 'Chào bạn! Phản ứng NH₄Cl + Ba(OH)₂ thu nhiệt — điều đó có nghĩa là gì với năng lượng hệ?' },
	],
	'CHEM10-07': [{ role: 'ai', text: 'Chào bạn! Tại sao tăng nồng độ lại làm tốc độ phản ứng nhanh hơn?' }],
	'CHEM10-08': [{ role: 'ai', text: 'Chào bạn! MnO₂ là chất xúc tác — sau phản ứng nó có bị tiêu hao không?' }],
	'CHEM10-09': [
		{ role: 'ai', text: 'Chào bạn! Vì sao bột đá vôi phản ứng với HCl nhanh hơn cục đá vôi cùng khối lượng?' },
	],
	'CHEM10-10': [{ role: 'ai', text: 'Chào bạn! AgCl, AgBr, AgI có màu khác nhau — bạn dự đoán màu của từng kết tủa?' }],
	'CHEM10-11': [
		{
			role: 'ai',
			text: 'Chào bạn! Tại sao nước chlorine lại có khả năng tẩy màu? Chất nào là tác nhân tẩy màu thực sự?',
		},
	],
	'CHEM10-12': [
		{ role: 'ai', text: 'Chào bạn! Chlorine đẩy bromine ra khỏi NaBr vì lý do gì? Đây là loại phản ứng gì?' },
	],
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
		{ n: 4, title: 'Ăn mòn điện hóa', sub: 'H₂ thoát ở điện cực Cu, Zn bị ăn mòn' },
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
		{ key: 3, label: 'Sau khi nối mạch, H₂ thoát ở điện cực Cu — Zn bị ăn mòn điện hóa', step: 4 },
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

// Trigger rebuild to apply new CSS specificity
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
		'MATH10-01',
		'MATH10-02',
		'MATH10-03',
		'MATH10-04',
		'MATH10-05',
		'MATH10-06',
		'MATH10-07',
		'MATH10-08',
		'MATH11-01',
		'MATH11-02',
		'MATH11-03',
		'MATH11-04',
		'MATH11-05',
		'MATH11-06',
		'MATH11-07',
		'MATH11-08',
		'MATH11-09',
		'MATH11-10',
		'MATH11-11',
		'MATH12-01',
		'MATH12-02',
		'MATH12-03',
		'MATH12-04',
		'MATH12-05',
		'MATH12-06',
		'MATH12-07',
		'MATH12-08',
		'MATH12-09',
		'MATH12-10',
		'MATH12-11',
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

	// MATH10-01 quadratic (legacy SIM-08)
	const [mA, setMA] = useState(1);
	const [mB, setMB] = useState(-2);
	const [mC, setMC] = useState(-3);
	// Legacy refs still in old JSX — keep to avoid TS errors
	const [mAngle, setMAngle] = useState(45);
	const [mVel, setMVel] = useState(15);
	const [isMPlaying, setIsMPlaying] = useState(false);
	const [triA, setTriA] = useState(10);
	const [triAlpha, setTriAlpha] = useState(45);
	const [conicC, setConicC] = useState(3);
	const [conicA, setConicA] = useState(5);
	const [isCPlaying, setIsCPlaying] = useState(false);
	// MATH10-02 vectors
	const [vecUx, setVecUx] = useState(3);
	const [vecUy, setVecUy] = useState(1);
	const [vecVx, setVecVx] = useState(1);
	const [vecVy, setVecVy] = useState(3);
	// MATH10-03 line ax+by+c=0
	const [line10a, setLine10a] = useState(1);
	const [line10b, setLine10b] = useState(-2);
	const [line10c, setLine10c] = useState(-3);
	// MATH10-04 circle (x-h)^2+(y-k)^2=r^2
	const [circ10h, setCirc10h] = useState(0);
	const [circ10k, setCirc10k] = useState(0);
	const [circ10r, setCirc10r] = useState(2.5);
	const [circ10t, setCirc10t] = useState(45);
	// MATH10-05 triangle sides and included angle
	const [tri10a, setTri10a] = useState(4);
	const [tri10b, setTri10b] = useState(5);
	const [tri10C, setTri10C] = useState(60);
	// MATH10-06 system of two linear inequalities
	const [iq10a1, setIq10a1] = useState(1);
	const [iq10b1, setIq10b1] = useState(1);
	const [iq10c1, setIq10c1] = useState(4);
	const [iq10a2, setIq10a2] = useState(2);
	const [iq10b2, setIq10b2] = useState(-1);
	const [iq10c2, setIq10c2] = useState(3);
	// MATH10-07 trig ratios — angle in degrees
	const [trig10alpha, setTrig10alpha] = useState(45);
	// MATH10-08 statistics — 6 data points
	const [stat10v1, setStat10v1] = useState(5);
	const [stat10v2, setStat10v2] = useState(6);
	const [stat10v3, setStat10v3] = useState(7);
	const [stat10v4, setStat10v4] = useState(8);
	const [stat10v5, setStat10v5] = useState(9);
	const [stat10v6, setStat10v6] = useState(10);

	// MATH11-01 trig
	const [trigA, setTrigA] = useState(1);
	const [trigB, setTrigB] = useState(1);
	const [trigC, setTrigC] = useState(0);
	const [trigD, setTrigD] = useState(0);
	const [trigFnIdx, setTrigFnIdx] = useState(0);

	// MATH11-02 unit circle
	const [ucAngle, setUcAngle] = useState(45);
	const [ucTarget, setUcTarget] = useState(0.5);

	// MATH11-03 combinatorics
	const [combN, setCombN] = useState(5);
	const [combK, setCombK] = useState(2);

	// MATH11-04 probability
	const [probPA, setProbPA] = useState(0.5);
	const [probPB, setProbPB] = useState(0.4);
	const [probPAB, setProbPAB] = useState(0.15);

	// MATH11-05 seq limits
	const [seqType, setSeqType] = useState(0);
	const [seqEps, setSeqEps] = useState(0.3);

	// MATH11-06 func limits
	const [limFuncType, setLimFuncType] = useState(0);

	// MATH11-07 derivatives
	const [derFnIdx, setDerFnIdx] = useState(0);
	const [derX0, setDerX0] = useState(1.0);
	const [derH, setDerH] = useState(0.5);

	// MATH11-08 transformations
	const [transType, setTransType] = useState(0);
	const [transTx, setTransTx] = useState(3);
	const [transTy, setTransTy] = useState(2);
	const [transAngle, setTransAngle] = useState(90);

	// MATH11-09 planes3d
	const [planeAlpha, setPlaneAlpha] = useState(20);
	const [planeBeta, setPlaneBeta] = useState(50);
	const [planesParallel, setPlanesParallel] = useState(0);

	// MATH11-10 perpendicular3d
	const [perpNx, setPerpNx] = useState(0);
	const [perpNy, setPerpNy] = useState(1);
	const [perpNz, setPerpNz] = useState(0);

	// MATH11-11 polyhedra
	const [polyType11, setPolyType11] = useState(0);
	const [polyN11, setPolyN11] = useState(4);
	const [polyBaseR, setPolyBaseR] = useState(1.5);
	const [polyH11, setPolyH11] = useState(2.5);

	// MATH12-01 cubic
	const [cubicA, setCubicA] = useState(1);
	const [cubicB, setCubicB] = useState(-3);
	const [cubicC, setCubicC] = useState(0);
	const [cubicD, setCubicD] = useState(0);
	// MATH12-02 rational y=(ax+b)/(cx+d)
	const [ratA, setRatA] = useState(1);
	const [ratB, setRatB] = useState(0);
	const [ratC, setRatC] = useState(1);
	const [ratD, setRatD] = useState(1);
	// MATH12-03 exponential
	const [expBase, setExpBase] = useState(2);
	// MATH12-04 logarithm
	const [logBaseVal, setLogBaseVal] = useState(Math.E);
	// MATH12-05 integral area
	const [intFnIdx, setIntFnIdx] = useState(0);
	const [intA, setIntA] = useState(0);
	const [intB, setIntB] = useState(Math.PI);
	const [intN, setIntN] = useState(8);
	// MATH12-06 area between curves
	const [abFnIdx, setAbFnIdx] = useState(0);
	// MATH12-07 complex plane
	const [cxRe, setCxRe] = useState(3);
	const [cxIm, setCxIm] = useState(2);
	// MATH12-08 revolution surfaces (0=sphere,1=cyl,2=cone)
	const [revShape, setRevShape] = useState(0);
	const [revR, setRevR] = useState(2);
	const [revH, setRevH] = useState(4);
	// MATH12-09 polyhedra3d (0=prism,1=pyramid,2=frustum)
	const [ph3Type, setPh3Type] = useState(0);
	const [ph3N, setPh3N] = useState(4);
	const [ph3R, setPh3R] = useState(2);
	const [ph3H, setPh3H] = useState(3);
	const [ph3R2, setPh3R2] = useState(1);
	// MATH12-10 plane Oxyz ax+by+cz+d=0
	const [plNx, setPlNx] = useState(1);
	const [plNy, setPlNy] = useState(1);
	const [plNz, setPlNz] = useState(1);
	const [plD, setPlD] = useState(0);
	// MATH12-11 line Oxyz
	const [ln3Mx, setLn3Mx] = useState(0);
	const [ln3My, setLn3My] = useState(0);
	const [ln3Mz, setLn3Mz] = useState(0);
	const [ln3Ux, setLn3Ux] = useState(1);
	const [ln3Uy, setLn3Uy] = useState(2);
	const [ln3Uz, setLn3Uz] = useState(1);

	// Sim viewport pan/zoom
	const [simZoom, setSimZoom] = useState(1);
	const [simPan, setSimPan] = useState({ x: 0, y: 0 });
	const [simIsDragging, setSimIsDragging] = useState(false);
	const simDragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });

	// Chem params
	const [chemStep, setChemStep] = useState(1);
	const [isAutoRunning, setIsAutoRunning] = useState(false);
	const [showChemCelebration, setShowChemCelebration] = useState(false);
	const chemExperimentId = simId ? CHEM_EXPERIMENT_ALIASES[simId] || simId : null;
	const resolvedMathSimId = simId ? CHEM_SIM_ALIASES[simId] || simId : 'MATH10-01';
	const simPanZoomEnabled = false; // Math sims handle pan/zoom via useMathPanZoom hook
	const totalChemSteps = chemExperimentId ? (EXPERIMENTS_CONFIG[chemExperimentId]?.steps?.length ?? 0) : 0;
	const [submitToast, setSubmitToast] = useState<{ msg: string; type: 'warn' | 'success' } | null>(null);
	const submitToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
	const [showCelebration, setShowCelebration] = useState(false);
	const xpAwardedRef = useRef(false);

	const isExperimentDone = subject !== 'chem' || totalChemSteps === 0 || chemStep > totalChemSteps;
	const allQuestionsAnswered = dynQuizState === 'active' && dynQuestions.length > 0 && Object.keys(dynAnswers).length >= dynQuestions.length;
	const isQuizDone = dynQuizState === 'done' || allQuestionsAnswered;
	const canSubmit = isExperimentDone && isQuizDone;

	const openedLabRef = useRef<string | null>(null);
	useEffect(() => {
		setSimZoom(1);
		setSimPan({ x: 0, y: 0 });
		setSimIsDragging(false);
	}, [simId]);

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
			const difficultyParam = new URLSearchParams(location.search).get('difficulty') ?? 'Cơ bản';
			const XP_MAX: Record<string, number> = { 'Cơ bản': 80, 'Trung bình': 120, 'Nâng cao': 180 };
			const maxXp = XP_MAX[difficultyParam] ?? 80;
			const xpEarned = dynQuestions.length > 0 ? Math.round(maxXp * correct / dynQuestions.length) : 0;
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
		setShowCelebration(false);
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
			} else if (simId === 'SIM-16' || simId === 'MATH10-02') {
				setMAngle(45);
				setMVel(15);
				setIsMPlaying(false);
				setVecUx(3);
				setVecUy(1);
				setVecVx(1);
				setVecVy(3);
			} else if (simId === 'SIM-17' || simId === 'MATH10-03') {
				setLine10a(1);
				setLine10b(-2);
				setLine10c(-3);
			} else if (simId === 'SIM-18' || simId === 'MATH10-04') {
				setTriA(10);
				setTriAlpha(45);
				setCirc10h(0);
				setCirc10k(0);
				setCirc10r(2.5);
				setCirc10t(45);
			} else if (simId === 'MATH10-05' || simId === 'SIM-19') {
				setConicC(3);
				setConicA(5);
				setIsCPlaying(false);
				setTri10a(4);
				setTri10b(5);
				setTri10C(60);
			} else if (simId === 'MATH10-06') {
				setIq10a1(1);
				setIq10b1(1);
				setIq10c1(4);
				setIq10a2(2);
				setIq10b2(-1);
				setIq10c2(3);
			} else if (simId === 'MATH10-07') {
				setTrig10alpha(45);
			} else if (simId === 'MATH10-08') {
				setStat10v1(5);
				setStat10v2(6);
				setStat10v3(7);
				setStat10v4(8);
				setStat10v5(9);
				setStat10v6(10);
			}
		} else {
			setChemStep(1);
			setIsAutoRunning(false);
			setShowChemCelebration(false);
		}
	}, [subject, simId]);

	useEffect(() => {
		if (!isAutoRunning) return;
		if (chemStep > totalChemSteps) {
			setIsAutoRunning(false);
			return;
		}
		const timer = setTimeout(() => {
			document.getElementById('sim-trigger')?.click();
		}, 300);
		return () => clearTimeout(timer);
	}, [chemStep, isAutoRunning, totalChemSteps]);

	useEffect(() => {
		if (subject === 'chem' && totalChemSteps > 0 && chemStep > totalChemSteps) {
			setShowChemCelebration(true);
		}
	}, [subject, chemStep, totalChemSteps]);

	const handleGlobalReset = useCallback(() => {
		resetParams();
		setPhysResetKey((k) => k + 1);
	}, [resetParams]);

	const handleSubmit = () => {
		if (submitToastRef.current) clearTimeout(submitToastRef.current);
		let msg: string;
		let type: 'warn' | 'success';
		if (!isExperimentDone && !isQuizDone) {
			msg = 'Bạn cần hoàn thành thí nghiệm và quiz trước khi nộp!';
			type = 'warn';
		} else if (!isExperimentDone) {
			msg = 'Bạn chưa hoàn thành thí nghiệm. Hãy thực hiện hết các bước!';
			type = 'warn';
		} else if (!isQuizDone) {
			msg = 'Bạn chưa hoàn thành quiz. Hãy trả lời hết các câu hỏi!';
			type = 'warn';
		} else {
			if (dynQuizState !== 'done') {
				setDynQuizState('done');
				setShowCelebration(true);
			}
			msg = '✓ Đã lưu & nộp thành công!';
			type = 'success';
		}
		setSubmitToast({ msg, type });
		submitToastRef.current = setTimeout(() => setSubmitToast(null), 3500);
	};

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
				? resolvedMathSimId === 'MATH10-02' || simId === 'SIM-16'
					? '\\vec{u}+\\vec{v}=(u_x+v_x,\\,u_y+v_y) \\quad \\vert \\quad \\vec{u}\\cdot\\vec{v}=u_x v_x+u_y v_y'
					: resolvedMathSimId === 'MATH10-03' || simId === 'SIM-17'
						? 'ax + by + c = 0 \\quad \\vert \\quad d(O,\\Delta) = \\frac{|c|}{\\sqrt{a^2+b^2}} \\quad \\vert \\quad \\vec{n}=(a,b)'
						: resolvedMathSimId === 'MATH10-04' || simId === 'SIM-18'
							? '(x-h)^2+(y-k)^2=r^2 \\quad \\vert \\quad \\text{tiếp tuyến tại }P\\perp MP'
							: resolvedMathSimId === 'MATH10-05' || simId === 'SIM-19'
								? 'c^2=a^2+b^2-2ab\\cos C \\quad \\vert \\quad S=\\tfrac{1}{2}ab\\sin C \\quad \\vert \\quad \\frac{a}{\\sin A}=2R'
								: resolvedMathSimId === 'MATH10-06' || simId === 'SIM-20'
									? 'a_1 x+b_1 y\\le c_1 \\quad \\vert \\quad a_2 x+b_2 y\\le c_2'
									: resolvedMathSimId === 'MATH10-07'
										? '\\sin\\alpha=\\frac{\\text{đối}}{\\text{huyền}} \\quad \\vert \\quad \\cos\\alpha=\\frac{\\text{kề}}{\\text{huyền}} \\quad \\vert \\quad \\tan\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}'
										: resolvedMathSimId === 'MATH10-08'
											? '\\bar{x}=\\frac{\\sum x_i}{n} \\quad \\vert \\quad s=\\sqrt{\\frac{\\sum(x_i-\\bar{x})^2}{n}} \\quad \\vert \\quad \\text{IQR}=Q_3-Q_1'
											: resolvedMathSimId === 'MATH11-01'
												? `y = A\\sin(Bx+C)+D \\quad T = \\frac{2\\pi}{|B|}`
												: resolvedMathSimId === 'MATH11-02'
													? `\\sin x = a \\Rightarrow x = \\arcsin a + 2k\\pi \\quad \\text{hoặc} \\quad x = \\pi - \\arcsin a + 2k\\pi`
													: resolvedMathSimId === 'MATH11-03'
														? `C_n^k = \\frac{n!}{k!(n-k)!} \\quad A_n^k = \\frac{n!}{(n-k)!}`
														: resolvedMathSimId === 'MATH11-04'
															? `P(A \\cup B) = P(A) + P(B) - P(A \\cap B)`
															: resolvedMathSimId === 'MATH11-05'
																? `\\lim_{n\\to\\infty} u_n = L \\quad \\forall \\varepsilon > 0,\\, \\exists N: n > N \\Rightarrow |u_n - L| < \\varepsilon`
																: resolvedMathSimId === 'MATH11-06'
																	? `\\lim_{x\\to a} f(x) = L \\quad f \\text{ liên tục tại } a \\Leftrightarrow \\lim_{x\\to a}f(x)=f(a)`
																	: resolvedMathSimId === 'MATH11-07'
																		? `f'(x_0) = \\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}`
																		: resolvedMathSimId === 'MATH11-08'
																			? `T_{\\vec{v}}(M) = M' \\quad \\overrightarrow{MM'} = \\vec{v}`
																			: resolvedMathSimId === 'MATH11-09'
																				? `\\vec{n_1} \\parallel \\vec{n_2} \\Leftrightarrow \\text{hai mặt phẳng song song}`
																				: resolvedMathSimId === 'MATH11-10'
																					? `d \\perp (P) \\Leftrightarrow d \\perp \\vec{n}_{(P)}`
																					: resolvedMathSimId === 'MATH11-11'
																						? `V_{\\text{lăng trụ}} = S_{đáy} \\cdot h \\quad V_{\\text{chóp}} = \\tfrac{1}{3}S_{đáy} \\cdot h`
																						: resolvedMathSimId === 'MATH12-01'
																							? `f(x)=ax^3+bx^2+cx+d \\quad f'(x)=3ax^2+2bx+c`
																							: resolvedMathSimId === 'MATH12-02'
																								? `y=\\dfrac{ax+b}{cx+d} \\quad TCĐ:\\,x=-\\tfrac{d}{c} \\quad TCN:\\,y=\\tfrac{a}{c}`
																								: resolvedMathSimId === 'MATH12-03'
																									? `y=a^x\\;(a>0,a\\neq1)\\quad \\lim_{x\\to-\\infty}a^x=0`
																									: resolvedMathSimId === 'MATH12-04'
																										? `y=\\log_a x\\quad D=(0,+\\infty)\\quad \\log_a(xy)=\\log_a x+\\log_a y`
																										: resolvedMathSimId === 'MATH12-05'
																											? `\\int_a^b f(x)\\,dx = F(b)-F(a)`
																											: resolvedMathSimId === 'MATH12-06'
																												? `S=\\int_a^b |f(x)-g(x)|\\,dx`
																												: resolvedMathSimId === 'MATH12-07'
																													? `z=a+bi=r(\\cos\\theta+i\\sin\\theta)\\quad|z|=\\sqrt{a^2+b^2}`
																													: resolvedMathSimId === 'MATH12-08'
																														? `V_{\\text{cầu}}=\\tfrac{4}{3}\\pi R^3\\quad V_{\\text{trụ}}=\\pi R^2h\\quad V_{\\text{nón}}=\\tfrac{1}{3}\\pi R^2h`
																														: resolvedMathSimId === 'MATH12-09'
																															? `V_{\\text{chóp}}=\\tfrac{1}{3}Sh\\quad V_{\\text{cụt}}=\\tfrac{h}{3}(S_1+S_2+\\sqrt{S_1 S_2})`
																															: resolvedMathSimId === 'MATH12-10'
																																? `ax+by+cz+d=0\\quad d(M,P)=\\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}`
																																: resolvedMathSimId === 'MATH12-11'
																																	? `\\dfrac{x-x_0}{a}=\\dfrac{y-y_0}{b}=\\dfrac{z-z_0}{c}`
																																	: `y = ${f(mA)}x^2 ${mB >= 0 ? '+' : '-'} ${Math.abs(f(mB))}x ${mC >= 0 ? '+' : '-'} ${Math.abs(f(mC))}`
				: chemExperimentId === 'CHEM12-01'
					? '\\text{CH}_3\\text{COOH} + \\text{C}_2\\text{H}_5\\text{OH} \\rightleftharpoons \\text{CH}_3\\text{COOC}_2\\text{H}_5 + \\text{H}_2\\text{O}'
					: chemExperimentId === 'CHEM12-02'
						? '\\text{(C}_{17}\\text{H}_{35}\\text{COO)}_3\\text{C}_3\\text{H}_5 + 3\\text{NaOH} \\xrightarrow{t^\\circ} 3\\text{C}_{17}\\text{H}_{35}\\text{COONa} + \\text{C}_3\\text{H}_5\\text{(OH)}_3'
						: chemExperimentId === 'CHEM12-03'
							? '\\text{CH}_2\\text{OH[CHOH]}_4\\text{CHO} + 2\\text{Cu(OH)}_2 + \\text{NaOH} \\xrightarrow{t^\\circ} \\text{CH}_2\\text{OH[CHOH]}_4\\text{COONa} + \\text{Cu}_2\\text{O}\\downarrow + 3\\text{H}_2\\text{O}'
							: chemExperimentId === 'CHEM12-04'
								? '\\text{CH}_2\\text{OH[CHOH]}_4\\text{CHO} + 2\\text{[Ag(NH}_3\\text{)}_2\\text{]OH} \\xrightarrow{t^\\circ} \\text{CH}_2\\text{OH[CHOH]}_4\\text{COONH}_4 + 2\\text{Ag}\\downarrow + 3\\text{NH}_3 + \\text{H}_2\\text{O}'
								: chemExperimentId === 'CHEM12-05'
									? '\\text{Tinh bột} + \\text{I}_2 \\rightleftharpoons \\text{Hợp chất màu xanh tím (hấp phụ)}'
									: chemExperimentId === 'CHEM12-06'
										? '\\text{Protein} + \\text{Cu(OH)}_2 \\xrightarrow{\\text{NaOH}} \\text{Phức chất màu tím đặc trưng}'
										: chemExperimentId === 'CHEM12-07'
											? '2\\text{Na} + 2\\text{H}_2\\text{O} \\rightarrow 2\\text{NaOH} + \\text{H}_2\\uparrow \\text{ (tỏa nhiệt mạnh)}'
											: chemExperimentId === 'CHEM12-08'
												? '\\text{Fe} + \\text{CuSO}_4 \\rightarrow \\text{FeSO}_4 + \\text{Cu}\\downarrow'
												: chemExperimentId === 'CHEM12-09'
													? '2\\text{Al} + 2\\text{NaOH} + 6\\text{H}_2\\text{O} \\rightarrow 2\\text{Na[Al(OH)}_4\\text{]} + 3\\text{H}_2\\uparrow'
													: chemExperimentId === 'CHEM12-10'
														? '2\\text{Al} + \\text{Fe}_2\\text{O}_3 \\xrightarrow{t^\\circ} \\text{Al}_2\\text{O}_3 + 2\\text{Fe}'
														: chemExperimentId === 'CHEM12-11'
															? '\\text{Fe}^{2+} \\xrightarrow{\\text{OH}^-} \\text{Fe(OH)}_2\\downarrow\\text{ (xanh trắng)} \\quad \\vert \\quad \\text{Fe}^{3+} \\xrightarrow{\\text{OH}^-} \\text{Fe(OH)}_3\\downarrow\\text{ (nâu đỏ)}'
															: chemExperimentId === 'CHEM12-12'
																? '2\\text{CuSO}_4 + 2\\text{H}_2\\text{O} \\xrightarrow{\\text{điện phân}} 2\\text{Cu}\\downarrow\\text{ (cathode)} + \\text{O}_2\\uparrow\\text{ (anode)} + 2\\text{H}_2\\text{SO}_4'
																: chemExperimentId === 'CHEM12-13'
																	? '\\text{Cực âm (Zn): } \\text{Zn} \\rightarrow \\text{Zn}^{2+} + 2\\text{e} \\quad \\vert \\quad \\text{Cực dương (Cu): } 2\\text{H}^+ + 2\\text{e} \\rightarrow \\text{H}_2\\uparrow'
																	: chemExperimentId === 'CHEM11-01'
																		? '\\text{pH} = -\\log[\\text{H}^+] \\quad \\vert \\quad \\text{Chất chỉ thị đổi màu theo môi trường acid/base}'
																		: chemExperimentId === 'CHEM11-02'
																			? '\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O} \\quad \\vert \\quad n_{\\text{acid}} = n_{\\text{base}}'
																			: chemExperimentId === 'CHEM11-03'
																				? '\\text{Cu} + 4\\text{HNO}_3 \\rightarrow \\text{Cu(NO}_3\\text{)}_2 + 2\\text{NO}_2\\uparrow + 2\\text{H}_2\\text{O}'
																				: chemExperimentId === 'CHEM11-04'
																					? '\\text{NH}_3 + \\text{HCl} \\rightarrow \\text{NH}_4\\text{Cl}\\downarrow \\quad \\text{(khói trắng)}'
																					: chemExperimentId === 'CHEM11-05'
																						? '\\text{C}_{12}\\text{H}_{22}\\text{O}_{11} \\xrightarrow{\\text{H}_2\\text{SO}_4\\,\\text{đặc}} 12\\text{C} + 11\\text{H}_2\\text{O}'
																						: chemExperimentId === 'CHEM11-06'
																							? '\\text{CH}_2=\\text{CH}_2 + \\text{Br}_2 \\rightarrow \\text{CH}_2\\text{Br}-\\text{CH}_2\\text{Br}'
																							: chemExperimentId === 'CHEM11-07'
																								? '\\text{HC}\\equiv\\text{CH} + 2\\text{[Ag(NH}_3\\text{)}_2\\text{]OH} \\rightarrow \\text{AgC}\\equiv\\text{CAg}\\downarrow + 4\\text{NH}_3 + 2\\text{H}_2\\text{O}'
																								: chemExperimentId === 'CHEM11-08'
																									? '2\\text{C}_2\\text{H}_5\\text{OH} + 2\\text{Na} \\rightarrow 2\\text{C}_2\\text{H}_5\\text{ONa} + \\text{H}_2\\uparrow'
																									: chemExperimentId === 'CHEM11-09'
																										? '\\text{C}_6\\text{H}_5\\text{OH} + 3\\text{Br}_2 \\rightarrow \\text{C}_6\\text{H}_2\\text{Br}_3\\text{OH}\\downarrow + 3\\text{HBr}'
																										: chemExperimentId === 'CHEM11-10'
																											? '\\text{Glycerol} + \\text{Cu(OH)}_2 \\rightarrow \\text{phức đồng màu xanh lam}'
																											: chemExperimentId === 'CHEM11-11'
																												? '2\\text{CH}_3\\text{COOH} + \\text{CaCO}_3 \\rightarrow (\\text{CH}_3\\text{COO})_2\\text{Ca} + \\text{CO}_2\\uparrow + \\text{H}_2\\text{O}'
																												: chemExperimentId === 'CHEM10-01'
																													? '\\alpha\\text{ (He}^{2+}\\text{)} \\rightarrow \\text{Bắn phá hạt Au} \\quad \\vert \\quad \\text{Hầu hết hạt truyền thẳng}'
																													: chemExperimentId === 'CHEM10-02'
																														? '\\text{Na}^+\\text{ (vàng), } \\text{K}^+\\text{ (tím), } \\text{Cu}^{2+}\\text{ (xanh lá), } \\text{Ca}^{2+}\\text{ (đỏ cam)}'
																														: chemExperimentId === 'CHEM10-03'
																															? '\\text{Zn} + 2\\text{HCl} \\rightarrow \\text{ZnCl}_2 + \\text{H}_2\\uparrow'
																															: chemExperimentId === 'CHEM10-04'
																																? '2\\text{Mg} + \\text{O}_2 \\xrightarrow{t^\\circ} 2\\text{MgO}'
																																: chemExperimentId === 'CHEM10-05'
																																	? '\\text{CaO} + \\text{H}_2\\text{O} \\rightarrow \\text{Ca(OH)}_2 \\quad \\vert \\quad \\Delta_r H^\\circ < 0\\text{ (tỏa nhiệt)}'
																																	: chemExperimentId === 'CHEM10-06'
																																		? '\\text{Ba(OH)}_2\\cdot8\\text{H}_2\\text{O} + 2\\text{NH}_4\\text{Cl} \\rightarrow \\text{BaCl}_2 + 2\\text{NH}_3\\uparrow + 10\\text{H}_2\\text{O} \\quad \\vert \\quad \\Delta_r H^\\circ > 0'
																																		: chemExperimentId === 'CHEM10-07'
																																			? '\\text{Na}_2\\text{S}_2\\text{O}_3 + \\text{H}_2\\text{SO}_4 \\rightarrow \\text{Na}_2\\text{SO}_4 + \\text{S}\\downarrow + \\text{SO}_2\\uparrow + \\text{H}_2\\text{O}'
																																			: chemExperimentId === 'CHEM10-08'
																																				? '2\\text{H}_2\\text{O}_2 \\xrightarrow{\\text{MnO}_2} 2\\text{H}_2\\text{O} + \\text{O}_2\\uparrow'
																																				: chemExperimentId === 'CHEM10-09'
																																					? '\\text{CaCO}_3 + 2\\text{HCl} \\rightarrow \\text{CaCl}_2 + \\text{CO}_2\\uparrow + \\text{H}_2\\text{O}'
																																					: chemExperimentId === 'CHEM10-10'
																																						? '\\text{Ag}^+ + \\text{Cl}^- \\rightarrow \\text{AgCl}\\downarrow\\text{ (trắng)} \\quad \\vert \\quad \\text{Ag}^+ + \\text{Br}^- \\rightarrow \\text{AgBr}\\downarrow\\text{ (vàng nhạt)}'
																																						: chemExperimentId === 'CHEM10-11'
																																							? '\\text{Cl}_2 + \\text{H}_2\\text{O} \\rightleftharpoons \\text{HCl} + \\text{HClO (tính oxy hóa tẩy màu)}'
																																							: chemExperimentId === 'CHEM10-12'
																																								? '\\text{Cl}_2 + 2\\text{NaBr} \\rightarrow 2\\text{NaCl} + \\text{Br}_2'
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
				? meta.title
				: 'Mô phỏng phản ứng';

	const unusedBundle = { liveT, liveX, liveV, physicsCalc, mathCalc };

	const handleSimWheel = useCallback(
		(e: React.WheelEvent<HTMLDivElement>) => {
			if (!simPanZoomEnabled) return;
			e.preventDefault();
			const rect = e.currentTarget.getBoundingClientRect();
			const cx = e.clientX - rect.left;
			const cy = e.clientY - rect.top;
			const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
			setSimZoom((prev) => {
				const next = Math.min(Math.max(prev * factor, 0.2), 10);
				const ratio = next / prev;
				setSimPan((pan) => ({ x: cx - ratio * (cx - pan.x), y: cy - ratio * (cy - pan.y) }));
				return next;
			});
		},
		[simPanZoomEnabled],
	);

	const handleSimMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!simPanZoomEnabled || e.button !== 0) return;
			e.preventDefault();
			setSimIsDragging(true);
			simDragRef.current = { startX: e.clientX, startY: e.clientY, panX: simPan.x, panY: simPan.y };
		},
		[simPanZoomEnabled, simPan],
	);

	const handleSimMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!simIsDragging) return;
			setSimPan({
				x: simDragRef.current.panX + (e.clientX - simDragRef.current.startX),
				y: simDragRef.current.panY + (e.clientY - simDragRef.current.startY),
			});
		},
		[simIsDragging],
	);

	const handleSimMouseUp = useCallback(() => {
		setSimIsDragging(false);
	}, []);

	const resetSimView = useCallback(() => {
		setSimZoom(1);
		setSimPan({ x: 0, y: 0 });
	}, []);

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
						<div
							className={`stu-ws__btn-primary${!canSubmit ? ' stu-ws__btn-primary--locked' : ''}`}
							onClick={handleSubmit}
						>
							Lưu & Nộp
						</div>
					</div>
				</div>

				{submitToast && (
					<div className={`stu-ws__submit-toast stu-ws__submit-toast--${submitToast.type}`}>{submitToast.msg}</div>
				)}

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
											<span>Công thức & Lý thuyết</span>
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
											<span>Ký hiệu</span>
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

								{/* MATH10-01: Quadratic Graph */}
								{(resolvedMathSimId === 'MATH10-01' || !simId) && (
									<>
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

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('y = a\\,x^2 + b\\,x + c \\quad (a \\neq 0)')} />
											<div
												dangerouslySetInnerHTML={renderTex('I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)')}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\text{Trục đối xứng: } x = -\\frac{b}{2a}')}
												style={{ marginTop: '6px' }}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a, b, c')} />
												<span className='stu-ws__symbol-desc'>các hệ số thực của hàm số bậc hai</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('I')} />
												<span className='stu-ws__symbol-desc'>đỉnh của parabol</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\Delta')} />
												<span className='stu-ws__symbol-desc'>biệt thức Δ = b² - 4ac</span>
											</div>
										</div>
									</>
								)}

								{/* MATH10-02: Vector Operations */}
								{resolvedMathSimId === 'MATH10-02' && (
									<>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>ux</span>
												<span className='stu-ws__param-val'>{vecUx}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={vecUx}
												style={getTrackStyle(vecUx, -5, 5, '#4f6ef7')}
												onChange={(e) => setVecUx(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>uy</span>
												<span className='stu-ws__param-val'>{vecUy}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={vecUy}
												style={getTrackStyle(vecUy, -5, 5, '#4f6ef7')}
												onChange={(e) => setVecUy(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>vx</span>
												<span className='stu-ws__param-val'>{vecVx}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={vecVx}
												style={getTrackStyle(vecVx, -5, 5, '#6d54e8')}
												onChange={(e) => setVecVx(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>vy</span>
												<span className='stu-ws__param-val'>{vecVy}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={vecVy}
												style={getTrackStyle(vecVy, -5, 5, '#6d54e8')}
												onChange={(e) => setVecVy(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\vec{u}+\\vec{v}=(u_x+v_x,\\,u_y+v_y)')} />
											<div
												dangerouslySetInnerHTML={renderTex('\\vec{u}\\cdot\\vec{v}=u_x v_x+u_y v_y')}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\cos\\theta=\\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{u}||\\vec{v}|}',
												)}
												style={{ marginTop: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\vec{u},\\vec{v}')} />
												<span className='stu-ws__symbol-desc'>hai vectơ trong mặt phẳng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('|\\vec{u}|')} />
												<span className='stu-ws__symbol-desc'>độ dài (mô-đun) của vectơ</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex('\\vec{u}\\cdot\\vec{v}')}
												/>
												<span className='stu-ws__symbol-desc'>tích vô hướng (dot product)</span>
											</div>
										</div>
									</>
								)}

								{/* MATH10-03: Line Equation */}
								{resolvedMathSimId === 'MATH10-03' && (
									<>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a</span>
												<span className='stu-ws__param-val'>{line10a}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={line10a}
												style={getTrackStyle(line10a, -5, 5, '#4f6ef7')}
												onChange={(e) => setLine10a(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b</span>
												<span className='stu-ws__param-val'>{line10b}</span>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={line10b}
												style={getTrackStyle(line10b, -5, 5, '#4f6ef7')}
												onChange={(e) => setLine10b(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>c</span>
												<span className='stu-ws__param-val'>{line10c}</span>
											</div>
											<input
												type='range'
												min={-10}
												max={10}
												step={0.5}
												value={line10c}
												style={getTrackStyle(line10c, -10, 10, '#6d54e8')}
												onChange={(e) => setLine10c(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('ax + by + c = 0')} />
											<div
												dangerouslySetInnerHTML={renderTex('d(O,\\Delta)=\\frac{|c|}{\\sqrt{a^2+b^2}}')}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\vec{n}=(a,b)\\text{ – pháp vectơ}')}
												style={{ marginTop: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a,b,c')} />
												<span className='stu-ws__symbol-desc'>hệ số phương trình đường thẳng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\vec{n}')} />
												<span className='stu-ws__symbol-desc'>pháp vectơ</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('d(O,\\Delta)')} />
												<span className='stu-ws__symbol-desc'>khoảng cách từ O đến đường thẳng</span>
											</div>
										</div>
									</>
								)}

								{/* MATH10-04: Circle */}
								{resolvedMathSimId === 'MATH10-04' && (
									<>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>h (tâm x)</span>
												<span className='stu-ws__param-val'>{circ10h}</span>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={circ10h}
												style={getTrackStyle(circ10h, -3, 3, '#4f6ef7')}
												onChange={(e) => setCirc10h(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>k (tâm y)</span>
												<span className='stu-ws__param-val'>{circ10k}</span>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={circ10k}
												style={getTrackStyle(circ10k, -3, 3, '#4f6ef7')}
												onChange={(e) => setCirc10k(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>r (bán kính)</span>
												<span className='stu-ws__param-val'>{circ10r}</span>
											</div>
											<input
												type='range'
												min={0.5}
												max={4}
												step={0.1}
												value={circ10r}
												style={getTrackStyle(circ10r, 0.5, 4, '#4f6ef7')}
												onChange={(e) => setCirc10r(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>t (góc P °)</span>
												<span className='stu-ws__param-val'>{circ10t}°</span>
											</div>
											<input
												type='range'
												min={0}
												max={360}
												step={5}
												value={circ10t}
												style={getTrackStyle(circ10t, 0, 360, '#6d54e8')}
												onChange={(e) => setCirc10t(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('(x-h)^2+(y-k)^2=r^2')} />
											<div
												dangerouslySetInnerHTML={renderTex('\\text{Tiếp tuyến tại }P\\perp MP')}
												style={{ marginTop: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('M(h,k)')} />
												<span className='stu-ws__symbol-desc'>tâm của đường tròn</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('r')} />
												<span className='stu-ws__symbol-desc'>bán kính đường tròn</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('t')} />
												<span className='stu-ws__symbol-desc'>góc xác định điểm P trên đường tròn</span>
											</div>
										</div>
									</>
								)}

								{/* MATH10-05: Triangle cosine/sine */}
								{resolvedMathSimId === 'MATH10-05' && (
									<>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a (cạnh đối A)</span>
												<span className='stu-ws__param-val'>{tri10a}</span>
											</div>
											<input
												type='range'
												min={1}
												max={8}
												step={0.5}
												value={tri10a}
												style={getTrackStyle(tri10a, 1, 8, '#4f6ef7')}
												onChange={(e) => setTri10a(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b (cạnh đối B)</span>
												<span className='stu-ws__param-val'>{tri10b}</span>
											</div>
											<input
												type='range'
												min={1}
												max={8}
												step={0.5}
												value={tri10b}
												style={getTrackStyle(tri10b, 1, 8, '#4f6ef7')}
												onChange={(e) => setTri10b(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>C (góc tại C °)</span>
												<span className='stu-ws__param-val'>{tri10C}°</span>
											</div>
											<input
												type='range'
												min={5}
												max={170}
												step={1}
												value={tri10C}
												style={getTrackStyle(tri10C, 5, 170, '#6d54e8')}
												onChange={(e) => setTri10C(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('c^2=a^2+b^2-2ab\\cos C')} />
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}=2R',
												)}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('S=\\tfrac{1}{2}ab\\sin C')}
												style={{ marginTop: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a,b,c')} />
												<span className='stu-ws__symbol-desc'>ba cạnh tam giác ABC</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('A,B,C')} />
												<span className='stu-ws__symbol-desc'>ba góc đối diện tương ứng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('R')} />
												<span className='stu-ws__symbol-desc'>bán kính đường tròn ngoại tiếp</span>
											</div>
										</div>
									</>
								)}

								{/* MATH10-06: System of Inequalities */}
								{resolvedMathSimId === 'MATH10-06' && (
									<>
										<div style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
											Bất phương trình 1:
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a₁</span>
												<span className='stu-ws__param-val'>{iq10a1}</span>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={iq10a1}
												style={getTrackStyle(iq10a1, -4, 4, '#4f6ef7')}
												onChange={(e) => setIq10a1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b₁</span>
												<span className='stu-ws__param-val'>{iq10b1}</span>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={iq10b1}
												style={getTrackStyle(iq10b1, -4, 4, '#4f6ef7')}
												onChange={(e) => setIq10b1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>c₁</span>
												<span className='stu-ws__param-val'>{iq10c1}</span>
											</div>
											<input
												type='range'
												min={-8}
												max={8}
												step={0.5}
												value={iq10c1}
												style={getTrackStyle(iq10c1, -8, 8, '#6d54e8')}
												onChange={(e) => setIq10c1(+e.target.value)}
											/>
										</div>
										<div style={{ fontSize: '11px', fontWeight: '600', color: '#38bdf8', margin: '10px 0 4px 0' }}>
											Bất phương trình 2:
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a₂</span>
												<span className='stu-ws__param-val'>{iq10a2}</span>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={iq10a2}
												style={getTrackStyle(iq10a2, -4, 4, '#4f6ef7')}
												onChange={(e) => setIq10a2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b₂</span>
												<span className='stu-ws__param-val'>{iq10b2}</span>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={iq10b2}
												style={getTrackStyle(iq10b2, -4, 4, '#4f6ef7')}
												onChange={(e) => setIq10b2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>c₂</span>
												<span className='stu-ws__param-val'>{iq10c2}</span>
											</div>
											<input
												type='range'
												min={-8}
												max={8}
												step={0.5}
												value={iq10c2}
												style={getTrackStyle(iq10c2, -8, 8, '#6d54e8')}
												onChange={(e) => setIq10c2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('a_1 x+b_1 y\\le c_1')} />
											<div dangerouslySetInnerHTML={renderTex('a_2 x+b_2 y\\le c_2')} style={{ marginTop: '6px' }} />
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('x,y')} />
												<span className='stu-ws__symbol-desc'>ẩn số cần tìm</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a_i,b_i,c_i')} />
												<span className='stu-ws__symbol-desc'>hệ số của bất phương trình</span>
											</div>
										</div>
									</>
								)}

								{/* MATH10-07: Trig Ratios */}
								{resolvedMathSimId === 'MATH10-07' && (
									<>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>Góc α (°)</span>
												<span className='stu-ws__param-val'>{trig10alpha}°</span>
											</div>
											<input
												type='range'
												min={1}
												max={89}
												step={1}
												value={trig10alpha}
												style={getTrackStyle(trig10alpha, 1, 89, '#4f6ef7')}
												onChange={(e) => setTrig10alpha(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\sin\\alpha=\\frac{\\text{đối}}{\\text{huyền}}')} />
											<div
												dangerouslySetInnerHTML={renderTex('\\cos\\alpha=\\frac{\\text{kề}}{\\text{huyền}}')}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\tan\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}')}
												style={{ marginTop: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\sin^2\\alpha+\\cos^2\\alpha=1')}
												style={{ marginTop: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\sin\\alpha')} />
												<span className='stu-ws__symbol-desc'>cạnh đối / cạnh huyền</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\cos\\alpha')} />
												<span className='stu-ws__symbol-desc'>cạnh kề / cạnh huyền</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\tan\\alpha')} />
												<span className='stu-ws__symbol-desc'>cạnh đối / cạnh kề</span>
											</div>
										</div>
									</>
								)}

								{/* MATH10-08: Statistics */}
								{resolvedMathSimId === 'MATH10-08' && (
									<>
										<div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
											6 điểm số:
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>x₁</span>
												<span className='stu-ws__param-val'>{stat10v1}</span>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={0.5}
												value={stat10v1}
												style={getTrackStyle(stat10v1, 1, 20, '#4f6ef7')}
												onChange={(e) => setStat10v1(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>x₂</span>
												<span className='stu-ws__param-val'>{stat10v2}</span>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={0.5}
												value={stat10v2}
												style={getTrackStyle(stat10v2, 1, 20, '#4f6ef7')}
												onChange={(e) => setStat10v2(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>x₃</span>
												<span className='stu-ws__param-val'>{stat10v3}</span>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={0.5}
												value={stat10v3}
												style={getTrackStyle(stat10v3, 1, 20, '#4f6ef7')}
												onChange={(e) => setStat10v3(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>x₄</span>
												<span className='stu-ws__param-val'>{stat10v4}</span>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={0.5}
												value={stat10v4}
												style={getTrackStyle(stat10v4, 1, 20, '#6d54e8')}
												onChange={(e) => setStat10v4(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>x₅</span>
												<span className='stu-ws__param-val'>{stat10v5}</span>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={0.5}
												value={stat10v5}
												style={getTrackStyle(stat10v5, 1, 20, '#6d54e8')}
												onChange={(e) => setStat10v5(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--a'>
											<div className='stu-ws__param-row'>
												<span>x₆</span>
												<span className='stu-ws__param-val'>{stat10v6}</span>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={0.5}
												value={stat10v6}
												style={getTrackStyle(stat10v6, 1, 20, '#6d54e8')}
												onChange={(e) => setStat10v6(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\bar{x}=\\frac{\\sum x_i}{n}')} />
											<div
												dangerouslySetInnerHTML={renderTex('s=\\sqrt{\\frac{\\sum(x_i-\\bar{x})^2}{n}}')}
												style={{ marginTop: '6px' }}
											/>
											<div dangerouslySetInnerHTML={renderTex('\\text{IQR}=Q_3-Q_1')} style={{ marginTop: '6px' }} />
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\bar{x}')} />
												<span className='stu-ws__symbol-desc'>số trung bình cộng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('s')} />
												<span className='stu-ws__symbol-desc'>độ lệch chuẩn</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('Q_1,Q_2,Q_3')} />
												<span className='stu-ws__symbol-desc'>các tứ phân vị</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-01: Đồ thị hàm lượng giác */}
								{resolvedMathSimId === 'MATH11-01' && (
									<>
										{[
											{ label: 'A (biên độ)', val: trigA, set: setTrigA, min: 0.1, max: 3, step: 0.1 },
											{ label: 'B (tần số)', val: trigB, set: setTrigB, min: 0.1, max: 4, step: 0.1 },
											{ label: 'C (pha rad)', val: trigC, set: setTrigC, min: -3.14, max: 3.14, step: 0.1 },
											{ label: 'D (dịch dọc)', val: trigD, set: setTrigD, min: -3, max: 3, step: 0.1 },
										].map(({ label, val, set, min, max, step }) => (
											<div key={label} className='stu-ws__param stu-ws__param--v0'>
												<div className='stu-ws__param-row'>
													<span>{label}</span>
													<span className='stu-ws__param-val'>{val.toFixed(1)}</span>
												</div>
												<input
													type='range'
													min={min}
													max={max}
													step={step}
													value={val}
													style={getTrackStyle(val, min, max, '#4f6ef7')}
													onChange={(e) => set(+e.target.value)}
												/>
											</div>
										))}
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Hàm số</span>
											</div>
											<div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
												{['sin', 'cos', 'tan'].map((fn, i) => (
													<button
														key={fn}
														onClick={() => setTrigFnIdx(i)}
														className={`stu-ws__param-btn${trigFnIdx === i ? ' stu-ws__param-btn--active' : ''}`}
														style={{ flex: 1 }}
													>
														{fn}
													</button>
												))}
											</div>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('y = A\\sin(Bx + C) + D')} />
											<div dangerouslySetInnerHTML={renderTex('T = \\dfrac{2\\pi}{|B|}')} style={{ marginTop: 6 }} />
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('A')} />
												<span className='stu-ws__symbol-desc'>biên độ dao động</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('B')} />
												<span className='stu-ws__symbol-desc'>hệ số tần số, chu kỳ T=2π/|B|</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('C')} />
												<span className='stu-ws__symbol-desc'>pha ban đầu (rad)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('D')} />
												<span className='stu-ws__symbol-desc'>dịch chuyển dọc trục y</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-01 */}
								{resolvedMathSimId === 'MATH12-01' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a</span>
												<strong>{cubicA.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={cubicA}
												style={getTrackStyle(cubicA, -3, 3, '#4f6ef7')}
												onChange={(e) => setCubicA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b</span>
												<strong>{cubicB.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={cubicB}
												style={getTrackStyle(cubicB, -5, 5, '#4f6ef7')}
												onChange={(e) => setCubicB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>c</span>
												<strong>{cubicC.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={cubicC}
												style={getTrackStyle(cubicC, -5, 5, '#4f6ef7')}
												onChange={(e) => setCubicC(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>d</span>
												<strong>{cubicD.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={cubicD}
												style={getTrackStyle(cubicD, -5, 5, '#4f6ef7')}
												onChange={(e) => setCubicD(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('f(x) = ax^3+bx^2+cx+d')}
												style={{ marginBottom: '6px' }}
											/>
											<div dangerouslySetInnerHTML={renderTex("f'(x) = 3ax^2+2bx+c")} style={{ marginBottom: '6px' }} />
											<div
												dangerouslySetInnerHTML={renderTex(
													"f'(x)=0 \\Rightarrow \\text{cực trị} \\quad f''(x)=0 \\Rightarrow \\text{điểm uốn}",
												)}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a,b,c,d')} />
												<span className='stu-ws__symbol-desc'>hệ số của đa thức bậc 3</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex("f'(x)")} />
												<span className='stu-ws__symbol-desc'>đạo hàm — xác định khoảng đơn điệu</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex("f''(x)=6ax+2b")} />
												<span className='stu-ws__symbol-desc'>đạo hàm cấp 2 — xác định điểm uốn</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-02 */}
								{resolvedMathSimId === 'MATH12-02' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a (tử số)</span>
												<strong>{ratA.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={ratA}
												style={getTrackStyle(ratA, -4, 4, '#4f6ef7')}
												onChange={(e) => setRatA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b (tử số)</span>
												<strong>{ratB.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={ratB}
												style={getTrackStyle(ratB, -4, 4, '#4f6ef7')}
												onChange={(e) => setRatB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>c (mẫu số)</span>
												<strong>{ratC.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={ratC}
												style={getTrackStyle(ratC, -4, 4, '#4f6ef7')}
												onChange={(e) => setRatC(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>d (mẫu số)</span>
												<strong>{ratD.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={ratD}
												style={getTrackStyle(ratD, -4, 4, '#4f6ef7')}
												onChange={(e) => setRatD(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('y = \\dfrac{ax+b}{cx+d} \\quad (c \\neq 0)')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\text{TCĐ}: x = -\\dfrac{d}{c} \\quad \\text{TCN}: y = \\dfrac{a}{c}',
												)}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex("y' = \\dfrac{ad-bc}{(cx+d)^2}")}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\text{TCĐ}')} />
												<span className='stu-ws__symbol-desc'>tiệm cận đứng (vertical asymptote)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\text{TCN}')} />
												<span className='stu-ws__symbol-desc'>tiệm cận ngang (horizontal asymptote)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('ad-bc')} />
												<span className='stu-ws__symbol-desc'>điều kiện để hàm không hằng (≠ 0)</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-03 */}
								{resolvedMathSimId === 'MATH12-03' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Cơ số a</span>
												<strong>{expBase.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={0.1}
												max={4}
												step={0.1}
												value={expBase}
												style={getTrackStyle(expBase, 0.1, 4, '#4f6ef7')}
												onChange={(e) => setExpBase(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('y = a^x \\quad (a>0,\\, a \\neq 1)')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('a>1: \\text{đồng biến} \\quad 0<a<1: \\text{nghịch biến}')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\lim_{x\\to-\\infty} a^x = 0 \\quad a^0=1 \\quad a^1=a')}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a')} />
												<span className='stu-ws__symbol-desc'>cơ số (a &gt; 0, a ≠ 1)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a^x')} />
												<span className='stu-ws__symbol-desc'>hàm mũ</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('e \\approx 2.718')} />
												<span className='stu-ws__symbol-desc'>số Euler — cơ số tự nhiên</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-04 */}
								{resolvedMathSimId === 'MATH12-04' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Cơ số a</span>
												<strong>{logBaseVal.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={1.01}
												max={10}
												step={0.1}
												value={logBaseVal}
												style={getTrackStyle(logBaseVal, 1.01, 10, '#4f6ef7')}
												onChange={(e) => setLogBaseVal(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('y = \\log_a x \\quad (a>0,\\, a\\neq 1,\\, x>0)')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\log_a(xy)=\\log_a x+\\log_a y')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\log_a\\dfrac{x}{y}=\\log_a x-\\log_a y \\quad \\log_a x^n = n\\log_a x',
												)}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex('\\ln x = \\log_e x')}
												/>
												<span className='stu-ws__symbol-desc'>logarit tự nhiên (cơ số e)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('D = (0,+\\infty)')} />
												<span className='stu-ws__symbol-desc'>tập xác định</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\log_a 1 = 0')} />
												<span className='stu-ws__symbol-desc'>điểm qua (1, 0)</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-05 */}
								{resolvedMathSimId === 'MATH12-05' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Hàm số</span>
											</div>
											<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
												{['\\sin x', 'x^2', 'x^3 - 2x', '\\dfrac{e^x}{4}'].map((tex, i) => (
													<button
														key={i}
														onClick={() => setIntFnIdx(i)}
														className={`stu-ws__param-btn${intFnIdx === i ? ' stu-ws__param-btn--active' : ''}`}
														dangerouslySetInnerHTML={renderTex(tex)}
													/>
												))}
											</div>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>a (cận dưới)</span>
												<strong>{intA.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.1}
												value={intA}
												style={getTrackStyle(intA, -4, 4, '#4f6ef7')}
												onChange={(e) => setIntA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>b (cận trên)</span>
												<strong>{intB.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.1}
												value={intB}
												style={getTrackStyle(intB, -4, 4, '#4f6ef7')}
												onChange={(e) => setIntB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>N (số dải)</span>
												<strong>{intN}</strong>
											</div>
											<input
												type='range'
												min={1}
												max={20}
												step={1}
												value={intN}
												style={getTrackStyle(intN, 1, 20, '#4ade80')}
												onChange={(e) => setIntN(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('\\int_a^b f(x)\\,dx = F(b) - F(a)')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex("F'(x) = f(x) \\quad \\text{(F là nguyên hàm của f)}")}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('\\int_a^b f\\,dx = -\\int_b^a f\\,dx')}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('F(x)')} />
												<span className='stu-ws__symbol-desc'>nguyên hàm của f(x)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\int_a^b')} />
												<span className='stu-ws__symbol-desc'>tích phân xác định từ a đến b</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('N')} />
												<span className='stu-ws__symbol-desc'>số dải Riemann</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-06 */}
								{resolvedMathSimId === 'MATH12-06' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Cặp hàm số</span>
											</div>
											<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
												{[
													'x^2 \\text{ và } x+2',
													'\\sin x \\text{ và } \\cos x',
													'x^3 \\text{ và } x',
													'\\sqrt{x} \\text{ và } x^2',
												].map((tex, i) => (
													<button
														key={i}
														onClick={() => setAbFnIdx(i)}
														className={`stu-ws__param-btn${abFnIdx === i ? ' stu-ws__param-btn--active' : ''}`}
														dangerouslySetInnerHTML={renderTex(tex)}
													/>
												))}
											</div>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('S = \\int_a^b |f(x)-g(x)|\\,dx')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\text{Giao điểm: } f(x)=g(x) \\Rightarrow \\text{biên a, b}',
												)}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('f(x)')} />
												<span className='stu-ws__symbol-desc'>đường cong trên (màu xanh)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('g(x)')} />
												<span className='stu-ws__symbol-desc'>đường cong dưới (màu cam)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('S')} />
												<span className='stu-ws__symbol-desc'>diện tích miền kẹp giữa hai đường</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-07 */}
								{resolvedMathSimId === 'MATH12-07' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Phần thực a</span>
												<strong>{cxRe.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={cxRe}
												style={getTrackStyle(cxRe, -5, 5, '#4f6ef7')}
												onChange={(e) => setCxRe(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Phần ảo b</span>
												<strong>{cxIm.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={cxIm}
												style={getTrackStyle(cxIm, -5, 5, '#4f6ef7')}
												onChange={(e) => setCxIm(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('z = a+bi = r(\\cos\\theta + i\\sin\\theta)')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('|z| = r = \\sqrt{a^2+b^2} \\quad \\arg(z)=\\theta')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('z^2 = (a^2-b^2)+2abi \\quad \\bar{z} = a-bi')}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\text{Re}(z)=a')} />
												<span className='stu-ws__symbol-desc'>phần thực</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\text{Im}(z)=b')} />
												<span className='stu-ws__symbol-desc'>phần ảo</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex('|z| \\cdot |w| = |zw|')}
												/>
												<span className='stu-ws__symbol-desc'>nhân trên mp phức = scale + quay</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-08 */}
								{resolvedMathSimId === 'MATH12-08' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Loại mặt tròn xoay</span>
											</div>
											<div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
												{['Mặt cầu', 'Mặt trụ', 'Mặt nón'].map((label, i) => (
													<button
														key={i}
														onClick={() => setRevShape(i)}
														className={`stu-ws__param-btn${revShape === i ? ' stu-ws__param-btn--active' : ''}`}
														style={{ flex: 1 }}
													>
														{label}
													</button>
												))}
											</div>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Bán kính R</span>
												<strong>{revR.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={0.5}
												max={4}
												step={0.1}
												value={revR}
												style={getTrackStyle(revR, 0.5, 4, '#4f6ef7')}
												onChange={(e) => setRevR(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Chiều cao H</span>
												<strong>{revH.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={0.5}
												max={6}
												step={0.1}
												value={revH}
												style={getTrackStyle(revH, 0.5, 6, '#4f6ef7')}
												onChange={(e) => setRevH(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex(
													'V_{\\text{cầu}}=\\tfrac{4}{3}\\pi R^3 \\quad S_{\\text{cầu}}=4\\pi R^2',
												)}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'V_{\\text{trụ}}=\\pi R^2 h \\quad S_{\\text{xq,trụ}}=2\\pi Rh',
												)}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'V_{\\text{nón}}=\\tfrac{1}{3}\\pi R^2 h \\quad S_{\\text{xq,nón}}=\\pi Rl',
												)}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('R')} />
												<span className='stu-ws__symbol-desc'>bán kính đáy</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('h')} />
												<span className='stu-ws__symbol-desc'>chiều cao</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('l=\\sqrt{R^2+h^2}')} />
												<span className='stu-ws__symbol-desc'>đường sinh mặt nón</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-09 */}
								{resolvedMathSimId === 'MATH12-09' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Loại khối</span>
											</div>
											<div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
												{['Lăng trụ', 'Hình chóp', 'Chóp cụt'].map((label, i) => (
													<button
														key={i}
														onClick={() => setPh3Type(i)}
														className={`stu-ws__param-btn${ph3Type === i ? ' stu-ws__param-btn--active' : ''}`}
														style={{ flex: 1 }}
													>
														{label}
													</button>
												))}
											</div>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Số cạnh đáy n</span>
												<strong>{ph3N}</strong>
											</div>
											<input
												type='range'
												min={3}
												max={8}
												step={1}
												value={ph3N}
												style={getTrackStyle(ph3N, 3, 8, '#4ade80')}
												onChange={(e) => setPh3N(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Bán kính R</span>
												<strong>{ph3R.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={0.5}
												max={4}
												step={0.1}
												value={ph3R}
												style={getTrackStyle(ph3R, 0.5, 4, '#4f6ef7')}
												onChange={(e) => setPh3R(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Chiều cao H</span>
												<strong>{ph3H.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={0.5}
												max={6}
												step={0.1}
												value={ph3H}
												style={getTrackStyle(ph3H, 0.5, 6, '#4f6ef7')}
												onChange={(e) => setPh3H(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Bán kính trên r</span>
												<strong>{ph3R2.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={0.1}
												max={3}
												step={0.1}
												value={ph3R2}
												style={getTrackStyle(ph3R2, 0.1, 3, '#4f6ef7')}
												onChange={(e) => setPh3R2(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('V_{\\text{lăng trụ}} = S_{\\text{đáy}} \\cdot h')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('V_{\\text{chóp}} = \\tfrac{1}{3}S_{\\text{đáy}} \\cdot h')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'V_{\\text{chóp cụt}} = \\tfrac{h}{3}(S_1+S_2+\\sqrt{S_1 S_2})',
												)}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex(
														'S_{n\\text{-giác}}=\\tfrac{nR^2}{2}\\sin\\tfrac{2\\pi}{n}',
													)}
												/>
												<span className='stu-ws__symbol-desc'>diện tích đa giác đều n cạnh</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('h')} />
												<span className='stu-ws__symbol-desc'>chiều cao khối</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('R, r')} />
												<span className='stu-ws__symbol-desc'>bán kính đáy lớn và đáy nhỏ (chóp cụt)</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-10 */}
								{resolvedMathSimId === 'MATH12-10' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>nx (hệ số x)</span>
												<strong>{plNx.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={plNx}
												style={getTrackStyle(plNx, -3, 3, '#4f6ef7')}
												onChange={(e) => setPlNx(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>ny (hệ số y)</span>
												<strong>{plNy.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={plNy}
												style={getTrackStyle(plNy, -3, 3, '#4f6ef7')}
												onChange={(e) => setPlNy(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>nz (hệ số z)</span>
												<strong>{plNz.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={plNz}
												style={getTrackStyle(plNz, -3, 3, '#4f6ef7')}
												onChange={(e) => setPlNz(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>d (hằng số)</span>
												<strong>{plD.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-5}
												max={5}
												step={0.5}
												value={plD}
												style={getTrackStyle(plD, -5, 5, '#4f6ef7')}
												onChange={(e) => setPlD(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex(
													'ax+by+cz+d=0 \\quad \\vec{n}=(a,b,c) \\text{ là pháp vectơ}',
												)}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'd(M_0,P) = \\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}',
												)}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\vec{n}=(a,b,c)')} />
												<span className='stu-ws__symbol-desc'>pháp vectơ mặt phẳng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('d(M,P)')} />
												<span className='stu-ws__symbol-desc'>khoảng cách từ điểm M đến mặt phẳng P</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex('d(O,P)=|d|/|\\vec{n}|')}
												/>
												<span className='stu-ws__symbol-desc'>khoảng cách từ gốc đến mặt phẳng</span>
											</div>
										</div>
									</>
								)}
								{/* MATH12-11 */}
								{resolvedMathSimId === 'MATH12-11' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>M.x₀</span>
												<strong>{ln3Mx.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={ln3Mx}
												style={getTrackStyle(ln3Mx, -3, 3, '#4f6ef7')}
												onChange={(e) => setLn3Mx(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>M.y₀</span>
												<strong>{ln3My.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={ln3My}
												style={getTrackStyle(ln3My, -3, 3, '#4f6ef7')}
												onChange={(e) => setLn3My(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>M.z₀</span>
												<strong>{ln3Mz.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.5}
												value={ln3Mz}
												style={getTrackStyle(ln3Mz, -3, 3, '#4f6ef7')}
												onChange={(e) => setLn3Mz(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>u.a</span>
												<strong>{ln3Ux.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={ln3Ux}
												style={getTrackStyle(ln3Ux, -4, 4, '#f97316')}
												onChange={(e) => setLn3Ux(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>u.b</span>
												<strong>{ln3Uy.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={ln3Uy}
												style={getTrackStyle(ln3Uy, -4, 4, '#f97316')}
												onChange={(e) => setLn3Uy(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>u.c</span>
												<strong>{ln3Uz.toFixed(2)}</strong>
											</div>
											<input
												type='range'
												min={-4}
												max={4}
												step={0.5}
												value={ln3Uz}
												style={getTrackStyle(ln3Uz, -4, 4, '#f97316')}
												onChange={(e) => setLn3Uz(+e.target.value)}
											/>
										</div>

										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex('\\dfrac{x-x_0}{a}=\\dfrac{y-y_0}{b}=\\dfrac{z-z_0}{c}=t')}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\vec{r}(t)=M_0+t\\vec{u} \\quad \\vec{u}=(a,b,c) \\text{ vtcp}',
												)}
												style={{ marginBottom: '6px' }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'd(O,d)=\\dfrac{|\\overrightarrow{OM_0}\\times\\vec{u}|}{|\\vec{u}|}',
												)}
												style={{ marginBottom: '6px' }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('M_0(x_0,y_0,z_0)')} />
												<span className='stu-ws__symbol-desc'>điểm thuộc đường thẳng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\vec{u}=(a,b,c)')} />
												<span className='stu-ws__symbol-desc'>vectơ chỉ phương (vtcp)</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex('t \\in \\mathbb{R}')}
												/>
												<span className='stu-ws__symbol-desc'>tham số</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-02: Vòng tròn đơn vị */}
								{resolvedMathSimId === 'MATH11-02' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Góc θ (độ)</span>
												<span className='stu-ws__param-val'>{ucAngle}°</span>
											</div>
											<input
												type='range'
												min={0}
												max={360}
												step={1}
												value={ucAngle}
												style={getTrackStyle(ucAngle, 0, 360, '#4f6ef7')}
												onChange={(e) => setUcAngle(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Giá trị a (sin x = a)</span>
												<span className='stu-ws__param-val'>{ucTarget.toFixed(2)}</span>
											</div>
											<input
												type='range'
												min={-1}
												max={1}
												step={0.01}
												value={ucTarget}
												style={getTrackStyle(ucTarget, -1, 1, '#f59e0b')}
												onChange={(e) => setUcTarget(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\sin x = a,\\ -1\\le a\\le 1')} />
											<div dangerouslySetInnerHTML={renderTex('x = \\arcsin a + 2k\\pi')} style={{ marginTop: 6 }} />
											<div
												dangerouslySetInnerHTML={renderTex('x = \\pi - \\arcsin a + 2k\\pi')}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\theta')} />
												<span className='stu-ws__symbol-desc'>góc lượng giác</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\sin\\theta')} />
												<span className='stu-ws__symbol-desc'>tung độ điểm P trên vòng tròn</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('k\\in\\mathbb{Z}')} />
												<span className='stu-ws__symbol-desc'>số nguyên, chỉ các chu kỳ lặp</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-03: Tổ hợp & Nhị thức Newton */}
								{resolvedMathSimId === 'MATH11-03' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>n</span>
												<span className='stu-ws__param-val'>{combN}</span>
											</div>
											<input
												type='range'
												min={0}
												max={10}
												step={1}
												value={combN}
												style={getTrackStyle(combN, 0, 10, '#4f6ef7')}
												onChange={(e) => {
													const v = +e.target.value;
													setCombN(v);
													if (combK > v) setCombK(v);
												}}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>k</span>
												<span className='stu-ws__param-val'>{combK}</span>
											</div>
											<input
												type='range'
												min={0}
												max={combN}
												step={1}
												value={combK}
												style={getTrackStyle(combK, 0, combN, '#f59e0b')}
												onChange={(e) => setCombK(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('P_n = n!')} />
											<div dangerouslySetInnerHTML={renderTex('A_n^k = \\frac{n!}{(n-k)!}')} style={{ marginTop: 6 }} />
											<div
												dangerouslySetInnerHTML={renderTex('C_n^k = \\frac{n!}{k!(n-k)!}')}
												style={{ marginTop: 6 }}
											/>
											<div
												dangerouslySetInnerHTML={renderTex('(a+b)^n=\\sum_{k=0}^{n}C_n^k a^{n-k}b^k')}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('P_n')} />
												<span className='stu-ws__symbol-desc'>hoán vị của n phần tử</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('A_n^k')} />
												<span className='stu-ws__symbol-desc'>chỉnh hợp chập k của n phần tử</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('C_n^k')} />
												<span className='stu-ws__symbol-desc'>tổ hợp / hệ số nhị thức</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-04: Xác suất sự kiện */}
								{resolvedMathSimId === 'MATH11-04' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span style={{ color: '#3b82f6' }}>P(A)</span>
												<span className='stu-ws__param-val'>{probPA.toFixed(2)}</span>
											</div>
											<input
												type='range'
												min={0.05}
												max={0.9}
												step={0.01}
												value={probPA}
												style={getTrackStyle(probPA, 0.05, 0.9, '#3b82f6')}
												onChange={(e) => setProbPA(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span style={{ color: '#8b5cf6' }}>P(B)</span>
												<span className='stu-ws__param-val'>{probPB.toFixed(2)}</span>
											</div>
											<input
												type='range'
												min={0.05}
												max={0.9}
												step={0.01}
												value={probPB}
												style={getTrackStyle(probPB, 0.05, 0.9, '#8b5cf6')}
												onChange={(e) => setProbPB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>P(A∩B)</span>
												<span className='stu-ws__param-val'>{probPAB.toFixed(2)}</span>
											</div>
											<input
												type='range'
												min={0}
												max={Math.min(probPA, probPB)}
												step={0.01}
												value={probPAB}
												style={getTrackStyle(probPAB, 0, Math.min(probPA, probPB), '#6366f1')}
												onChange={(e) => setProbPAB(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('P(A\\cup B)=P(A)+P(B)-P(A\\cap B)')} />
											<div
												dangerouslySetInnerHTML={renderTex('P(A|B)=\\frac{P(A\\cap B)}{P(B)}')}
												style={{ marginTop: 6 }}
											/>
											<div dangerouslySetInnerHTML={renderTex('P(\\bar{A})=1-P(A)')} style={{ marginTop: 6 }} />
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('A\\cap B')} />
												<span className='stu-ws__symbol-desc'>giao — cả A và B xảy ra</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('A\\cup B')} />
												<span className='stu-ws__symbol-desc'>hợp — A hoặc B xảy ra</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('P(A|B)')} />
												<span className='stu-ws__symbol-desc'>xác suất có điều kiện</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-05: Giới hạn dãy số */}
								{resolvedMathSimId === 'MATH11-05' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Chọn dãy số</span>
											</div>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
												{[
													'a_n = \\frac{1}{n} \\to 0',
													'a_n = \\frac{(-1)^n}{n} \\to 0',
													'a_n = \\frac{n}{n+1} \\to 1',
													'a_n = \\frac{2n+1}{n+1} \\to 2',
												].map((tex, i) => (
													<button
														key={i}
														onClick={() => setSeqType(i)}
														className={`stu-ws__param-btn${seqType === i ? ' stu-ws__param-btn--active' : ''}`}
														dangerouslySetInnerHTML={renderTex(tex)}
													/>
												))}
											</div>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>ε (độ chính xác)</span>
												<span className='stu-ws__param-val'>{seqEps.toFixed(2)}</span>
											</div>
											<input
												type='range'
												min={0.05}
												max={1.0}
												step={0.05}
												value={seqEps}
												style={getTrackStyle(seqEps, 0.05, 1.0, '#f59e0b')}
												onChange={(e) => setSeqEps(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\lim_{n\\to\\infty}a_n=L')} />
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\forall\\varepsilon>0\\ \\exists N: n>N\\Rightarrow|a_n-L|<\\varepsilon',
												)}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('a_n')} />
												<span className='stu-ws__symbol-desc'>số hạng thứ n của dãy số</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('L')} />
												<span className='stu-ws__symbol-desc'>giới hạn của dãy số</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\varepsilon')} />
												<span className='stu-ws__symbol-desc'>epsilon — độ chính xác cho trước</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-06: Giới hạn hàm số & hàm liên tục */}
								{resolvedMathSimId === 'MATH11-06' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Chọn hàm số</span>
											</div>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
												{[
													'\\dfrac{x^2-1}{x-1} \\text{ (gián đoạn bỏ được)}',
													'\\text{Hàm bậc thang (gián đoạn nhảy)}',
													'\\dfrac{|x|}{x} \\text{ (gián đoạn tại 0)}',
													'\\dfrac{\\sin x}{x} \\text{ (gián đoạn tại 0)}',
												].map((tex, i) => (
													<button
														key={i}
														onClick={() => setLimFuncType(i)}
														className={`stu-ws__param-btn${limFuncType === i ? ' stu-ws__param-btn--active' : ''}`}
														dangerouslySetInnerHTML={renderTex(tex)}
													/>
												))}
											</div>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex('\\lim_{x\\to a}f(x)=L')} />
											<div
												dangerouslySetInnerHTML={renderTex(
													'f\\ \\text{liên tục tại}\\ a\\Leftrightarrow\\lim_{x\\to a}f(x)=f(a)',
												)}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\lim_{x\\to a^-}')} />
												<span className='stu-ws__symbol-desc'>giới hạn trái</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\lim_{x\\to a^+}')} />
												<span className='stu-ws__symbol-desc'>giới hạn phải</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('f(a)')} />
												<span className='stu-ws__symbol-desc'>giá trị hàm số tại a</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-07: Đạo hàm & tiếp tuyến */}
								{resolvedMathSimId === 'MATH11-07' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Hàm số f(x)</span>
											</div>
											<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
												{['x^2', 'x^3', '\\sin x', 'x^3 - 3x'].map((tex, i) => (
													<button
														key={i}
														onClick={() => setDerFnIdx(i)}
														className={`stu-ws__param-btn${derFnIdx === i ? ' stu-ws__param-btn--active' : ''}`}
														dangerouslySetInnerHTML={renderTex(tex)}
													/>
												))}
											</div>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>x₀ (điểm tiếp xúc)</span>
												<span className='stu-ws__param-val'>{derX0.toFixed(1)}</span>
											</div>
											<input
												type='range'
												min={-3}
												max={3}
												step={0.1}
												value={derX0}
												style={getTrackStyle(derX0, -3, 3, '#fb923c')}
												onChange={(e) => setDerX0(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>h (cát tuyến → tiếp tuyến)</span>
												<span className='stu-ws__param-val'>{derH.toFixed(2)}</span>
											</div>
											<input
												type='range'
												min={0.01}
												max={2}
												step={0.01}
												value={derH}
												style={getTrackStyle(derH, 0.01, 2, '#fbbf24')}
												onChange={(e) => setDerH(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex("f'(x_0)=\\lim_{h\\to 0}\\frac{f(x_0+h)-f(x_0)}{h}")} />
											<div dangerouslySetInnerHTML={renderTex("y=f(x_0)+f'(x_0)(x-x_0)")} style={{ marginTop: 6 }} />
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex("f'(x_0)")} />
												<span className='stu-ws__symbol-desc'>đạo hàm của f tại x₀</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('h')} />
												<span className='stu-ws__symbol-desc'>gia số của biến độc lập</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex("k=f'(x_0)")} />
												<span className='stu-ws__symbol-desc'>hệ số góc tiếp tuyến</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-08: Phép dời hình & phép đồng dạng */}
								{resolvedMathSimId === 'MATH11-08' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Phép biến đổi</span>
											</div>
											<div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
												{[
													'\\text{Tịnh tiến } T_{\\vec{v}} (t_x, t_y)',
													'\\text{Đối xứng trục } D_{Ox}',
													'\\text{Đối xứng trục } D_{Oy}',
													'\\text{Đối xứng tâm } D_O',
													'\\text{Phép quay } R_{O, \\alpha}',
												].map((tex, i) => (
													<button
														key={i}
														onClick={() => setTransType(i)}
														className={`stu-ws__param-btn${transType === i ? ' stu-ws__param-btn--active' : ''}`}
														dangerouslySetInnerHTML={renderTex(tex)}
													/>
												))}
											</div>
										</div>
										{transType === 0 && (
											<>
												<div className='stu-ws__param stu-ws__param--v0'>
													<div className='stu-ws__param-row'>
														<span>tx</span>
														<span className='stu-ws__param-val'>{transTx.toFixed(1)}</span>
													</div>
													<input
														type='range'
														min={-5}
														max={5}
														step={0.5}
														value={transTx}
														style={getTrackStyle(transTx, -5, 5, '#4f6ef7')}
														onChange={(e) => setTransTx(+e.target.value)}
													/>
												</div>
												<div className='stu-ws__param stu-ws__param--v0'>
													<div className='stu-ws__param-row'>
														<span>ty</span>
														<span className='stu-ws__param-val'>{transTy.toFixed(1)}</span>
													</div>
													<input
														type='range'
														min={-5}
														max={5}
														step={0.5}
														value={transTy}
														style={getTrackStyle(transTy, -5, 5, '#4f6ef7')}
														onChange={(e) => setTransTy(+e.target.value)}
													/>
												</div>
											</>
										)}
										{transType === 4 && (
											<div className='stu-ws__param stu-ws__param--v0'>
												<div className='stu-ws__param-row'>
													<span>Góc quay α</span>
													<span className='stu-ws__param-val'>{transAngle}°</span>
												</div>
												<input
													type='range'
													min={0}
													max={360}
													step={5}
													value={transAngle}
													style={getTrackStyle(transAngle, 0, 360, '#4f6ef7')}
													onChange={(e) => setTransAngle(+e.target.value)}
												/>
											</div>
										)}
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div dangerouslySetInnerHTML={renderTex("T_{\\vec{v}}(M)=M':\\ M'=M+\\vec{v}")} />
											<div
												dangerouslySetInnerHTML={renderTex(
													"R_{O,\\alpha}:\\ (x',y')=(x\\cos\\alpha-y\\sin\\alpha,\\,x\\sin\\alpha+y\\cos\\alpha)",
												)}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('T_{\\vec{v}}')} />
												<span className='stu-ws__symbol-desc'>phép tịnh tiến theo vectơ v</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\Phi_O')} />
												<span className='stu-ws__symbol-desc'>phép đối xứng tâm O</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('R_{O,\\alpha}')} />
												<span className='stu-ws__symbol-desc'>phép quay tâm O góc α</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-09: Đường thẳng & mặt phẳng */}
								{resolvedMathSimId === 'MATH11-09' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Góc nghiêng α (°)</span>
												<span className='stu-ws__param-val'>{planeAlpha}°</span>
											</div>
											<input
												type='range'
												min={0}
												max={60}
												step={1}
												value={planeAlpha}
												style={getTrackStyle(planeAlpha, 0, 60, '#3b82f6')}
												onChange={(e) => setPlaneAlpha(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Góc nghiêng β (°)</span>
												<span className='stu-ws__param-val'>{planeBeta}°</span>
											</div>
											<input
												type='range'
												min={0}
												max={60}
												step={1}
												value={planeBeta}
												style={getTrackStyle(planeBeta, 0, 60, '#fb923c')}
												onChange={(e) => setPlaneBeta(+e.target.value)}
											/>
										</div>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Quan hệ</span>
											</div>
											<div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
												{['Cắt nhau', 'Song song'].map((label, i) => (
													<button
														key={i}
														onClick={() => setPlanesParallel(i)}
														className={`stu-ws__param-btn${planesParallel === i ? ' stu-ws__param-btn--active' : ''}`}
														style={{ flex: 1 }}
													>
														{label}
													</button>
												))}
											</div>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\alpha\\parallel\\beta\\Leftrightarrow\\vec{n}_1\\parallel\\vec{n}_2',
												)}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\cos\\theta=\\frac{|\\vec{n}_1\\cdot\\vec{n}_2|}{|\\vec{n}_1||\\vec{n}_2|}',
												)}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\vec{n}')} />
												<span className='stu-ws__symbol-desc'>vectơ pháp tuyến của mặt phẳng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex('\\alpha\\cap\\beta')}
												/>
												<span className='stu-ws__symbol-desc'>giao tuyến của hai mặt phẳng</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('\\theta')} />
												<span className='stu-ws__symbol-desc'>góc nhị diện giữa hai mặt phẳng</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-10: Quan hệ vuông góc trong không gian */}
								{resolvedMathSimId === 'MATH11-10' && (
									<>
										{[
											{ label: 'nx', val: perpNx, set: setPerpNx },
											{ label: 'ny', val: perpNy, set: setPerpNy },
											{ label: 'nz', val: perpNz, set: setPerpNz },
										].map(({ label, val, set }) => (
											<div key={label} className='stu-ws__param stu-ws__param--v0'>
												<div className='stu-ws__param-row'>
													<span>Pháp tuyến {label}</span>
													<span className='stu-ws__param-val'>{val.toFixed(1)}</span>
												</div>
												<input
													type='range'
													min={-1}
													max={1}
													step={0.1}
													value={val}
													style={getTrackStyle(val, -1, 1, '#fbbf24')}
													onChange={(e) => set(+e.target.value)}
												/>
											</div>
										))}
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex(
													'd\\perp\\alpha\\Leftrightarrow d\\perp a,d\\perp b\\ (a,b\\subset\\alpha)',
												)}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'\\alpha\\perp\\beta\\Leftrightarrow\\exists d\\subset\\alpha:\\ d\\perp\\beta',
												)}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('d\\perp\\alpha')} />
												<span className='stu-ws__symbol-desc'>đường thẳng d vuông góc mặt phẳng α</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span
													className='stu-ws__symbol-sym'
													dangerouslySetInnerHTML={renderTex('\\alpha\\perp\\beta')}
												/>
												<span className='stu-ws__symbol-desc'>hai mặt phẳng vuông góc nhau</span>
											</div>
										</div>
									</>
								)}

								{/* MATH11-11: Hình lăng trụ & hình chóp */}
								{resolvedMathSimId === 'MATH11-11' && (
									<>
										<div className='stu-ws__param stu-ws__param--v0'>
											<div className='stu-ws__param-row'>
												<span>Loại hình</span>
											</div>
											<div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
												{['Lăng trụ', 'Hình chóp'].map((label, i) => (
													<button
														key={i}
														onClick={() => setPolyType11(i)}
														className={`stu-ws__param-btn${polyType11 === i ? ' stu-ws__param-btn--active' : ''}`}
														style={{ flex: 1 }}
													>
														{label}
													</button>
												))}
											</div>
										</div>
										{[
											{ label: 'Số cạnh đáy (n)', val: polyN11, set: setPolyN11, min: 3, max: 6, step: 1 },
											{ label: 'Bán kính đáy (r)', val: polyBaseR, set: setPolyBaseR, min: 0.5, max: 2.5, step: 0.1 },
											{ label: 'Chiều cao (h)', val: polyH11, set: setPolyH11, min: 0.5, max: 4, step: 0.1 },
										].map(({ label, val, set, min, max, step }) => (
											<div key={label} className='stu-ws__param stu-ws__param--v0'>
												<div className='stu-ws__param-row'>
													<span>{label}</span>
													<span className='stu-ws__param-val'>{val.toFixed(step < 1 ? 1 : 0)}</span>
												</div>
												<input
													type='range'
													min={min}
													max={max}
													step={step}
													value={val}
													style={getTrackStyle(val, min, max, '#4f6ef7')}
													onChange={(e) => set(+e.target.value)}
												/>
											</div>
										))}
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Công thức & Lý thuyết</span>
										</div>
										<div className='stu-ws__formula-box'>
											<div
												dangerouslySetInnerHTML={renderTex(
													polyType11 === 0 ? 'V=S_{đáy}\\cdot h' : 'V=\\tfrac{1}{3}S_{đáy}\\cdot h',
												)}
											/>
											<div
												dangerouslySetInnerHTML={renderTex(
													'S_{n\\text{-giác đều}}=\\tfrac{n\\cdot r^2\\sin(2\\pi/n)}{2}',
												)}
												style={{ marginTop: 6 }}
											/>
										</div>
										<div className='stu-ws__section-label' style={{ marginTop: '12px' }}>
											<div className='stu-ws__section-label-bar' />
											<span>Ký hiệu</span>
										</div>
										<div className='stu-ws__symbols-list'>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('S_{đáy}')} />
												<span className='stu-ws__symbol-desc'>diện tích đa giác đều ở đáy</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('h')} />
												<span className='stu-ws__symbol-desc'>chiều cao của hình</span>
											</div>
											<div className='stu-ws__symbol-item'>
												<span className='stu-ws__symbol-sym' dangerouslySetInnerHTML={renderTex('V')} />
												<span className='stu-ws__symbol-desc'>thể tích hình</span>
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
							{subject === 'chem' && totalChemSteps > 0 && chemStep <= totalChemSteps && (
								<div className='stu-ws__center-actions'>
									<button
										className={`stu-ws__center-btn stu-ws__center-btn--quick ${isAutoRunning ? 'stu-ws__center-btn--active' : ''}`}
										onClick={() => setIsAutoRunning((prev) => !prev)}
									>
										{isAutoRunning ? 'Dừng lại' : 'Thực hiện nhanh'}
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
							{subject !== 'chem' && subject !== 'math' && (
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
							<div
								className='stu-ws__sim-viewport'
								style={{ cursor: simIsDragging ? 'grabbing' : simPanZoomEnabled ? 'grab' : undefined }}
								onWheel={handleSimWheel}
								onMouseDown={handleSimMouseDown}
								onMouseMove={handleSimMouseMove}
								onMouseUp={handleSimMouseUp}
								onMouseLeave={handleSimMouseUp}
							>
								<div
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										transform: `translate(${simPan.x}px, ${simPan.y}px) scale(${simZoom})`,
										transformOrigin: '50% 50%',
										willChange: 'transform',
									}}
								>
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
										(() => {
											const activeSimId = simId || 'MATH10-01';
											const resolvedSimId = CHEM_SIM_ALIASES[activeSimId] || activeSimId;
											let mathParams: Array<{ key: string; value: number; unit: string; label: string }> = [];

											if (resolvedSimId === 'MATH10-01') {
												mathParams = [
													{ key: 'a', value: mA, unit: '', label: 'a' },
													{ key: 'b', value: mB, unit: '', label: 'b' },
													{ key: 'c', value: mC, unit: '', label: 'c' },
												];
											} else if (resolvedSimId === 'MATH10-02') {
												mathParams = [
													{ key: 'ux', value: vecUx, unit: '', label: 'ux' },
													{ key: 'uy', value: vecUy, unit: '', label: 'uy' },
													{ key: 'vx', value: vecVx, unit: '', label: 'vx' },
													{ key: 'vy', value: vecVy, unit: '', label: 'vy' },
												];
											} else if (resolvedSimId === 'MATH10-03') {
												mathParams = [
													{ key: 'a', value: line10a, unit: '', label: 'a' },
													{ key: 'b', value: line10b, unit: '', label: 'b' },
													{ key: 'c', value: line10c, unit: '', label: 'c' },
												];
											} else if (resolvedSimId === 'MATH10-04') {
												mathParams = [
													{ key: 'h', value: circ10h, unit: '', label: 'h' },
													{ key: 'k', value: circ10k, unit: '', label: 'k' },
													{ key: 'r', value: circ10r, unit: '', label: 'r' },
													{ key: 't', value: circ10t, unit: '°', label: 't' },
												];
											} else if (resolvedSimId === 'MATH10-05') {
												mathParams = [
													{ key: 'a', value: tri10a, unit: '', label: 'a' },
													{ key: 'b', value: tri10b, unit: '', label: 'b' },
													{ key: 'C', value: tri10C, unit: '°', label: 'C' },
												];
											} else if (resolvedSimId === 'MATH10-06') {
												mathParams = [
													{ key: 'a1', value: iq10a1, unit: '', label: 'a1' },
													{ key: 'b1', value: iq10b1, unit: '', label: 'b1' },
													{ key: 'c1', value: iq10c1, unit: '', label: 'c1' },
													{ key: 'a2', value: iq10a2, unit: '', label: 'a2' },
													{ key: 'b2', value: iq10b2, unit: '', label: 'b2' },
													{ key: 'c2', value: iq10c2, unit: '', label: 'c2' },
												];
											} else if (resolvedSimId === 'MATH10-07') {
												mathParams = [{ key: 'alpha', value: trig10alpha, unit: '°', label: 'Góc α' }];
											} else if (resolvedSimId === 'MATH10-08') {
												mathParams = [
													{ key: 'v1', value: stat10v1, unit: '', label: 'x1' },
													{ key: 'v2', value: stat10v2, unit: '', label: 'x2' },
													{ key: 'v3', value: stat10v3, unit: '', label: 'x3' },
													{ key: 'v4', value: stat10v4, unit: '', label: 'x4' },
													{ key: 'v5', value: stat10v5, unit: '', label: 'x5' },
													{ key: 'v6', value: stat10v6, unit: '', label: 'x6' },
												];
											} else if (resolvedSimId === 'MATH11-01') {
												mathParams = [
													{ key: 'A', value: trigA, unit: '', label: 'A' },
													{ key: 'B', value: trigB, unit: '', label: 'B' },
													{ key: 'C', value: trigC, unit: 'rad', label: 'C' },
													{ key: 'D', value: trigD, unit: '', label: 'D' },
													{ key: 'fn', value: trigFnIdx, unit: '', label: 'Hàm' },
												];
											} else if (resolvedSimId === 'MATH11-02') {
												mathParams = [
													{ key: 'angle', value: ucAngle, unit: '°', label: 'Góc' },
													{ key: 'target', value: ucTarget, unit: '', label: 'Giá trị a' },
												];
											} else if (resolvedSimId === 'MATH11-03') {
												mathParams = [
													{ key: 'n', value: combN, unit: '', label: 'n' },
													{ key: 'k', value: combK, unit: '', label: 'k' },
												];
											} else if (resolvedSimId === 'MATH11-04') {
												mathParams = [
													{ key: 'PA', value: probPA, unit: '', label: 'P(A)' },
													{ key: 'PB', value: probPB, unit: '', label: 'P(B)' },
													{ key: 'PAB', value: probPAB, unit: '', label: 'P(A∩B)' },
												];
											} else if (resolvedSimId === 'MATH11-05') {
												mathParams = [
													{ key: 'seqType', value: seqType, unit: '', label: 'Dãy số' },
													{ key: 'epsilon', value: seqEps, unit: '', label: 'ε' },
												];
											} else if (resolvedSimId === 'MATH11-06') {
												mathParams = [{ key: 'funcType', value: limFuncType, unit: '', label: 'Hàm số' }];
											} else if (resolvedSimId === 'MATH11-07') {
												mathParams = [
													{ key: 'fnIdx', value: derFnIdx, unit: '', label: 'Hàm số' },
													{ key: 'x0', value: derX0, unit: '', label: 'x₀' },
													{ key: 'h', value: derH, unit: '', label: 'h' },
												];
											} else if (resolvedSimId === 'MATH11-08') {
												mathParams = [
													{ key: 'transType', value: transType, unit: '', label: 'Phép biến đổi' },
													{ key: 'tx', value: transTx, unit: '', label: 'tx' },
													{ key: 'ty', value: transTy, unit: '', label: 'ty' },
													{ key: 'angle', value: transAngle, unit: '°', label: 'Góc quay' },
												];
											} else if (resolvedSimId === 'MATH11-09') {
												mathParams = [
													{ key: 'alpha', value: planeAlpha, unit: '°', label: 'Góc mặt phẳng α' },
													{ key: 'beta', value: planeBeta, unit: '°', label: 'Góc mặt phẳng β' },
													{ key: 'parallel', value: planesParallel, unit: '', label: 'Song song' },
												];
											} else if (resolvedSimId === 'MATH11-10') {
												mathParams = [
													{ key: 'normalX', value: perpNx, unit: '', label: 'nx' },
													{ key: 'normalY', value: perpNy, unit: '', label: 'ny' },
													{ key: 'normalZ', value: perpNz, unit: '', label: 'nz' },
												];
											} else if (resolvedSimId === 'MATH11-11') {
												mathParams = [
													{ key: 'polyType', value: polyType11, unit: '', label: 'Loại hình' },
													{ key: 'n', value: polyN11, unit: '', label: 'Số cạnh đáy' },
													{ key: 'baseR', value: polyBaseR, unit: '', label: 'Bán kính đáy' },
													{ key: 'height', value: polyH11, unit: '', label: 'Chiều cao' },
												];
											} else if (resolvedSimId === 'MATH12-01') {
												mathParams = [
													{ key: 'a', value: cubicA, unit: '', label: 'Hệ số a' },
													{ key: 'b', value: cubicB, unit: '', label: 'Hệ số b' },
													{ key: 'c', value: cubicC, unit: '', label: 'Hệ số c' },
													{ key: 'd', value: cubicD, unit: '', label: 'Hệ số d' },
												];
											} else if (resolvedSimId === 'MATH12-02') {
												mathParams = [
													{ key: 'a', value: ratA, unit: '', label: 'Hệ số a' },
													{ key: 'b', value: ratB, unit: '', label: 'Hệ số b' },
													{ key: 'c', value: ratC, unit: '', label: 'Hệ số c' },
													{ key: 'd', value: ratD, unit: '', label: 'Hệ số d' },
												];
											} else if (resolvedSimId === 'MATH12-03') {
												mathParams = [{ key: 'base', value: expBase, unit: '', label: 'Cơ số a' }];
											} else if (resolvedSimId === 'MATH12-04') {
												mathParams = [{ key: 'base', value: logBaseVal, unit: '', label: 'Cơ số a' }];
											} else if (resolvedSimId === 'MATH12-05') {
												mathParams = [
													{ key: 'fnIdx', value: intFnIdx, unit: '', label: 'Hàm số' },
													{ key: 'a', value: intA, unit: '', label: 'Cận dưới a' },
													{ key: 'b', value: intB, unit: '', label: 'Cận trên b' },
													{ key: 'N', value: intN, unit: '', label: 'Số dải N' },
												];
											} else if (resolvedSimId === 'MATH12-06') {
												mathParams = [{ key: 'pairIdx', value: abFnIdx, unit: '', label: 'Cặp hàm' }];
											} else if (resolvedSimId === 'MATH12-07') {
												mathParams = [
													{ key: 're', value: cxRe, unit: '', label: 'Phần thực a' },
													{ key: 'im', value: cxIm, unit: '', label: 'Phần ảo b' },
												];
											} else if (resolvedSimId === 'MATH12-08') {
												mathParams = [
													{ key: 'shape', value: revShape, unit: '', label: 'Loại mặt' },
													{ key: 'R', value: revR, unit: '', label: 'Bán kính R' },
													{ key: 'H', value: revH, unit: '', label: 'Chiều cao H' },
												];
											} else if (resolvedSimId === 'MATH12-09') {
												mathParams = [
													{ key: 'type', value: ph3Type, unit: '', label: 'Loại khối' },
													{ key: 'n', value: ph3N, unit: '', label: 'Số cạnh đáy' },
													{ key: 'R', value: ph3R, unit: '', label: 'Bán kính R' },
													{ key: 'H', value: ph3H, unit: '', label: 'Chiều cao H' },
													{ key: 'R2', value: ph3R2, unit: '', label: 'Bán kính trên r' },
												];
											} else if (resolvedSimId === 'MATH12-10') {
												mathParams = [
													{ key: 'nx', value: plNx, unit: '', label: 'nx' },
													{ key: 'ny', value: plNy, unit: '', label: 'ny' },
													{ key: 'nz', value: plNz, unit: '', label: 'nz' },
													{ key: 'd', value: plD, unit: '', label: 'Hằng số d' },
												];
											} else if (resolvedSimId === 'MATH12-11') {
												mathParams = [
													{ key: 'mx', value: ln3Mx, unit: '', label: 'x₀' },
													{ key: 'my', value: ln3My, unit: '', label: 'y₀' },
													{ key: 'mz', value: ln3Mz, unit: '', label: 'z₀' },
													{ key: 'ux', value: ln3Ux, unit: '', label: 'u.a' },
													{ key: 'uy', value: ln3Uy, unit: '', label: 'u.b' },
													{ key: 'uz', value: ln3Uz, unit: '', label: 'u.c' },
												];
											}

											return (
												<GenericMathSimulation
													key={undefined}
													config={{
														simulation_id: resolvedSimId,
														subject: 'math',
														topic: 'generic',
														parameters: mathParams,
													}}
													isPlaying={undefined}
													onAnimationEnd={undefined}
												/>
											);
										})()
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
							</div>
							{simPanZoomEnabled && (simZoom !== 1 || simPan.x !== 0 || simPan.y !== 0) && (
								<button className='stu-ws__sim-reset' onClick={resetSimView}>
									↺ Reset
								</button>
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
											Sinh đề ngay
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
															<svg
																width='13'
																height='13'
																viewBox='0 0 24 24'
																fill='none'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
																style={{ marginRight: '5px' }}
															>
																<path d='M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' />
																<path d='M6 14h12v8H6z' />
															</svg>
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
															onClick={() => {
																if (picked) {
																	setDynQuizState('done');
																}
															}}
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
															<svg
																width='13'
																height='13'
																viewBox='0 0 24 24'
																fill='none'
																stroke='currentColor'
																strokeWidth='2'
																strokeLinecap='round'
																strokeLinejoin='round'
																style={{ marginRight: '5px' }}
															>
																<path d='M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' />
																<path d='M6 14h12v8H6z' />
															</svg>
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
													<svg
														width='13'
														height='13'
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth='2.2'
														strokeLinecap='round'
														strokeLinejoin='round'
														style={{ marginRight: '6px', verticalAlign: 'middle' }}
													>
														<path d='M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67' />
													</svg>
													Làm lại bộ đề mới
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
			{showCelebration && dynQuizState === 'done' && (
				<CelebrationOverlay
					score={
						dynQuestions.length > 0
							? Math.round(
									(dynQuestions.filter((q, i) => dynAnswers[i] === q.correct).length / dynQuestions.length) * 100,
								)
							: 0
					}
					onClose={() => setShowCelebration(false)}
				/>
			)}
			{showChemCelebration && (
				<CelebrationOverlay
					score={0}
					icon='🧪'
					title='Xuất sắc!'
					message='Bạn đã hoàn thành tất cả bước thí nghiệm! Hãy xem lại các hiện tượng quan sát được ở bên phải.'
					showScore={false}
					closeLabel='Hoàn thành'
					onClose={() => setShowChemCelebration(false)}
				/>
			)}
		</StudentLayout>
	);
};

export default Workspace;
