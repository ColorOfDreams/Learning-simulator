import { analyzeAiPrompt } from '@/services/ai/api';
import React, { useCallback, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import StudentLayout from '../components/StudentLayout';
import './index.less';

// ── Types ──
interface LabItem {
	id: number;
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
	{
		id: 1,
		title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
		subject: 'chem',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+120 XP',
		locked: false,
		simId: 'SIM-01',
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
		simId: 'SIM-03',
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
		simId: 'SIM-04',
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
		id: 5,
		title: 'Mạch RLC',
		subject: 'physics',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+120 XP',
		locked: false,
		grade: 12,
	},
	{
		id: 6,
		title: 'Đồ thị hàm số bậc hai',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-08',
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
		simId: 'SIM-05',
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
		simId: 'SIM-06',
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
		simId: 'SIM-07',
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
		simId: 'SIM-09',
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
		simId: 'SIM-10',
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
		simId: 'SIM-11',
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
		simId: 'SIM-12',
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
		simId: 'SIM-13',
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
		simId: 'SIM-14',
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
		simId: 'SIM-15',
		grade: 11,
	},
	{
		id: 19,
		title: 'Ném xiên và vòm cổng parabol',
		subject: 'math',
		level: 'Trung bình',
		mins: '~15 phút',
		xp: '+100 XP',
		locked: false,
		simId: 'SIM-16',
		grade: 10,
	},
	{
		id: 20,
		title: 'Miền nghiệm hệ bất phương trình',
		subject: 'math',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-17',
		grade: 10,
	},
	{
		id: 21,
		title: 'Hệ thức lượng tam giác cột cờ',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'SIM-18',
		grade: 10,
	},
	{
		id: 22,
		title: 'Định nghĩa Elip ghim đinh',
		subject: 'math',
		level: 'Trung bình',
		mins: '~12 phút',
		xp: '+80 XP',
		locked: false,
		simId: 'SIM-19',
		grade: 10,
	},
	{
		id: 23,
		title: 'Thống kê số liệu mẫu và biểu đồ',
		subject: 'math',
		level: 'Cơ bản',
		mins: '~10 phút',
		xp: '+60 XP',
		locked: false,
		simId: 'SIM-20',
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
	simulation?: {
		simulation_id: string;
		title: string;
		subject: 'physics' | 'math' | 'chem';
		level?: string;
		mins?: string;
		xp?: string;
	};
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

const HocSinhHome: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;
	const [heroInput, setHeroInput] = useState('');
	const [grade, setGrade] = useState(() => {
		const saved = localStorage.getItem('selected_grade');
		return saved ? parseInt(saved, 10) : 12;
	});
	const [filter, setFilter] = useState(() => {
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

	// Auto-scroll chat to bottom
	React.useEffect(() => {
		const el = document.getElementById('hero-chat-scroll');
		if (el) {
			el.scrollTop = el.scrollHeight;
		}
	}, [chatMessages, aiLoading]);

	const filteredLabs = useMemo(
		() => ALL_LABS.filter((l) => l.grade === grade && (filter === 'all' || l.subject === filter)),
		[grade, filter],
	);

	const openWorkspace = useCallback((subject: string, simId?: string) => {
		let path = `/hoc-sinh/workspace?subject=${subject}`;
		if (simId) {
			path += `&sim=${simId}`;
			const matchedLab = ALL_LABS.find((l) => l.simId === simId);
			if (matchedLab) {
				setGrade(matchedLab.grade);
				setFilter(matchedLab.subject);
				localStorage.setItem('selected_grade', String(matchedLab.grade));
				localStorage.setItem('selected_filter', matchedLab.subject);
			}
		}
		history.push(path);
	}, []);

	const handleHeroRun = useCallback(
		async (customPrompt?: string) => {
			const prompt = (customPrompt || heroInput).trim();
			if (!prompt) return;

			const contextForApi = chatMessages.slice(-6).map(m => ({
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
				let recommendedSim = undefined;

				if (data) {
					if (data.answer?.short_answer) {
						text = data.answer.short_answer;
					} else {
						text = 'Mình đã tìm thấy một phòng thí nghiệm rất phù hợp với chủ đề của bạn. Hãy trải nghiệm ngay nhé:';
					}

					if (data.simulation) {
						const matchedLab = ALL_LABS.find((l) => l.simId === data.simulation?.simulation_id);
						recommendedSim = {
							simulation_id: data.simulation.simulation_id,
							title: data.simulation.title || matchedLab?.title || 'Phòng thí nghiệm',
							subject: (data.subject || matchedLab?.subject || 'chem') as 'physics' | 'math' | 'chem',
							level: matchedLab?.level || 'Trung bình',
							mins: matchedLab?.mins || '~15 phút',
							xp: matchedLab?.xp || '+120 XP',
						};
					}
				}

				setChatMessages((prev) => [
					...prev,
					{
						role: 'ai',
						text,
						simulation: recommendedSim,
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
		<StudentLayout>
			<div className='stu-home scl'>
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
								<span>Level {user?.level ?? 1}</span>
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
								const lvl = user?.level ?? 1;
								const nextThreshold = lvl * lvl * 100;
								const pct = Math.min(100, Math.round((xp / nextThreshold) * 100));
								return (
									<div className='stu-home__xp-bar'>
										<div className='stu-home__xp-labels'>
											<span>XP</span>
											<span>{xp.toLocaleString('vi-VN')} / {nextThreshold.toLocaleString('vi-VN')}</span>
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
											<div className='stu-home__hero-chat-bubble'>{msg.text}</div>
											{msg.simulation && (
												<div className='stu-home__hero-chat-labs'>
													<div
														className='stu-home__hero-chat-lab-card'
														onClick={() => openWorkspace(msg.simulation!.subject, msg.simulation!.simulation_id)}
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
															<div className='stu-home__hero-chat-lab-title'>{msg.simulation.title}</div>
															<div className='stu-home__hero-chat-lab-meta'>
																{msg.simulation.level} · {msg.simulation.mins} · {msg.simulation.xp}
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
						<div className='stu-home__divider-text'>hoặc duyệt danh mục</div>
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
						{filteredLabs.map((lab, idx) => (
							<div
								key={lab.id}
								className='stu-home__card'
								style={{ animationDelay: `${idx * 0.06}s` }}
								onClick={() => !lab.locked && openWorkspace(lab.subject, lab.simId)}
							>
								<div className={`stu-home__card-thumb stu-home__card-thumb--${lab.subject}`}>
									{getSubjectIcon(lab.subject, idx)}
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
										{lab.xp && <span className='stu-home__card-xp'>{lab.xp}</span>}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default HocSinhHome;
