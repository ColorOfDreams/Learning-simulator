import React, { useState, useMemo, useCallback } from 'react';
import { history } from 'umi';
import { analyzeAiPrompt } from '@/services/ai/api';
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
	{ id: 1, title: 'Điều chế ethyl acetate (phản ứng ester hóa)', subject: 'chem', level: 'Trung bình', mins: '~15 phút', xp: '+120 XP', locked: false, simId: 'SIM-01', grade: 12 },
	{ id: 2, title: 'Phản ứng xà phòng hóa chất béo', subject: 'chem', level: 'Cơ bản', mins: '~8 phút', xp: '+60 XP', locked: false, simId: 'SIM-03', grade: 12 },
	{ id: 3, title: 'Glucose tác dụng với Cu(OH)₂', subject: 'chem', level: 'Trung bình', mins: '~12 phút', xp: '+80 XP', locked: false, simId: 'SIM-04', grade: 12 },
	{ id: 4, title: 'Chuyển động ném xiên', subject: 'physics', level: 'Cơ bản', mins: '~10 phút', xp: '+60 XP', locked: false, simId: 'SIM-02', grade: 10 },
	{ id: 5, title: 'Mạch RLC', subject: 'physics', level: 'Trung bình', mins: '~15 phút', xp: '+120 XP', locked: false, grade: 12 },
	{ id: 6, title: 'Đồ thị hàm số bậc hai', subject: 'math', level: 'Cơ bản', mins: '~12 phút', xp: '+80 XP', locked: false, simId: 'SIM-08', grade: 10 },
	{ id: 7, title: 'Định luật Ohm', subject: 'physics', level: 'Khóa', mins: 'Đạt Lv.8', xp: '', locked: true, grade: 11 },
	{ id: 8, title: 'Phản ứng tráng bạc của glucose', subject: 'chem', level: 'Cơ bản', mins: '~10 phút', xp: '+60 XP', locked: false, simId: 'SIM-05', grade: 12 },
	{ id: 9, title: 'Phản ứng màu của tinh bột với iodine', subject: 'chem', level: 'Cơ bản', mins: '~8 phút', xp: '+60 XP', locked: false, simId: 'SIM-06', grade: 12 },
	{ id: 10, title: 'Phản ứng màu biuret của protein', subject: 'chem', level: 'Cơ bản', mins: '~8 phút', xp: '+60 XP', locked: false, simId: 'SIM-07', grade: 12 },
	{ id: 11, title: 'Sodium tác dụng với nước', subject: 'chem', level: 'Trung bình', mins: '~10 phút', xp: '+80 XP', locked: false, simId: 'SIM-08', grade: 12 },
	{ id: 12, title: 'Đinh sắt tác dụng với dung dịch CuSO₄', subject: 'chem', level: 'Cơ bản', mins: '~8 phút', xp: '+60 XP', locked: false, simId: 'SIM-09', grade: 12 },
	{ id: 13, title: 'Nhôm tác dụng với dung dịch NaOH', subject: 'chem', level: 'Trung bình', mins: '~10 phút', xp: '+80 XP', locked: false, simId: 'SIM-10', grade: 12 },
	{ id: 14, title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)', subject: 'chem', level: 'Nâng cao', mins: '~15 phút', xp: '+120 XP', locked: false, simId: 'SIM-11', grade: 12 },
	{ id: 15, title: 'Điều chế Fe(OH)₂ và Fe(OH)₃', subject: 'chem', level: 'Trung bình', mins: '~12 phút', xp: '+80 XP', locked: false, simId: 'SIM-12', grade: 12 },
	{ id: 16, title: 'Điện phân dung dịch CuSO₄', subject: 'chem', level: 'Nâng cao', mins: '~15 phút', xp: '+120 XP', locked: false, simId: 'SIM-13', grade: 12 },
	{ id: 17, title: 'Ăn mòn điện hóa học (pin Zn – Cu)', subject: 'chem', level: 'Trung bình', mins: '~15 phút', xp: '+120 XP', locked: false, simId: 'SIM-14', grade: 12 },
	{ id: 18, title: 'Thí nghiệm bắn phá lá vàng (Rutherford, 1911)', subject: 'chem', level: 'Nâng cao', mins: '~18 phút', xp: '+150 XP', locked: false, simId: 'SIM-15', grade: 10 },
	{ id: 19, title: 'Ném xiên và vòm cổng parabol', subject: 'math', level: 'Trung bình', mins: '~15 phút', xp: '+100 XP', locked: false, simId: 'SIM-16', grade: 10 },
	{ id: 20, title: 'Miền nghiệm hệ bất phương trình', subject: 'math', level: 'Trung bình', mins: '~12 phút', xp: '+80 XP', locked: false, simId: 'SIM-17', grade: 10 },
	{ id: 21, title: 'Hệ thức lượng tam giác cột cờ', subject: 'math', level: 'Cơ bản', mins: '~10 phút', xp: '+60 XP', locked: false, simId: 'SIM-18', grade: 10 },
	{ id: 22, title: 'Định nghĩa Elip ghim đinh', subject: 'math', level: 'Trung bình', mins: '~12 phút', xp: '+80 XP', locked: false, simId: 'SIM-19', grade: 10 },
	{ id: 23, title: 'Thống kê số liệu mẫu và biểu đồ', subject: 'math', level: 'Cơ bản', mins: '~10 phút', xp: '+60 XP', locked: false, simId: 'SIM-20', grade: 10 },
];


const SUBJECT_LABELS: Record<string, string> = {
	physics: 'vật lý',
	math: 'toán',
	chem: 'hóa học',
};

const HERO_CHIPS = [
	{ label: 'Tráng bạc', subject: 'chem', simId: 'SIM-05' },
	{ label: 'Điều chế ethyl acetate', subject: 'chem', simId: 'SIM-01' },
	{ label: 'Xà phòng hóa chất béo', subject: 'chem', simId: 'SIM-03' },
	{ label: 'Chuyển động ném xiên', subject: 'physics', simId: 'SIM-02' },
	{ label: 'Nhiệt nhôm', subject: 'chem', simId: 'SIM-11' },
];

const GRADES = [10, 11, 12];
const FILTERS = [
	{ key: 'all', label: 'Tất cả' },
	{ key: 'math', label: 'Toán' },
	{ key: 'physics', label: 'Vật lý' },
	{ key: 'chem', label: 'Hóa học' },
];

const HocSinhHome: React.FC = () => {
	const [heroInput, setHeroInput] = useState('');
	const [grade, setGrade] = useState(12);
	const [filter, setFilter] = useState('all');

	// AI Assistant States
	const [aiLoading, setAiLoading] = useState(false);
	const [aiResponse, setAiResponse] = useState<Ai.IRecord | null>(null);
	const [showAiPanel, setShowAiPanel] = useState(false);

	const filteredLabs = useMemo(
		() => ALL_LABS.filter((l) => l.grade === grade && (filter === 'all' || l.subject === filter)),
		[grade, filter],
	);

	const openWorkspace = useCallback((subject: string, simId?: string) => {
		let path = `/hoc-sinh/workspace?subject=${subject}`;
		if (simId) path += `&sim=${simId}`;
		history.push(path);
	}, []);

	const handleHeroRun = useCallback(async () => {
		if (!heroInput.trim()) return;
		setAiLoading(true);
		setShowAiPanel(true);
		setAiResponse(null);
		try {
			const res = await analyzeAiPrompt({ message: heroInput });
			if (res?.data?.data) {
				setAiResponse(res.data.data);
			}
		} catch (err) {
			console.error('AI search analysis error:', err);
		} finally {
			setAiLoading(false);
		}
	}, [heroInput]);

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
			<div className="stu-home scl">
				{/* Grid overlay */}
				<div className="stu-home__grid-overlay" />

				<div className="stu-home__content">
					{/* Header */}
					<div className="stu-home__header">
						<div>
							<div className="stu-home__welcome">Chào mừng trở lại, Học Sinh</div>
							<div className="stu-home__subtitle">Sẵn sàng cho thí nghiệm hôm nay?</div>
						</div>
						<div className="stu-home__badges">
							<div className="stu-home__badge">
								<div className="stu-home__badge-dot stu-home__badge-dot--level" />
								<span>Level 7</span>
							</div>
							<div className="stu-home__badge">
								<div className="stu-home__badge-dot stu-home__badge-dot--streak" />
								<span>5 ngày liên tiếp</span>
							</div>
							<div className="stu-home__xp-bar">
								<div className="stu-home__xp-labels">
									<span>XP</span>
									<span>1.240 / 1.500</span>
								</div>
								<div className="stu-home__xp-track">
									<div className="stu-home__xp-fill" style={{ width: '82%' }} />
								</div>
							</div>
						</div>
					</div>

					{/* AI Hero Bar */}
					<div className="stu-home__hero">
						<div className="stu-home__hero-header">
							<div className="stu-home__hero-icon">
								<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
									<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
									<path d="M12 10.5v3M10.5 12h3" />
								</svg>
							</div>
							<div>
								<div className="stu-home__hero-title">Trợ lý AI Phòng Thí Nghiệm</div>
								<div className="stu-home__hero-desc">Nhập bài tập hoặc mô tả thí nghiệm để bắt đầu</div>
							</div>
						</div>
						<div className="stu-home__hero-input-row">
							<input
								className="stu-home__hero-input"
								value={heroInput}
								onChange={(e) => setHeroInput(e.target.value)}
								onKeyDown={handleHeroKey}
								placeholder='VD: "Giúp mình bài chuẩn độ axit-bazơ"'
							/>
							<div className="stu-home__hero-btn" onClick={handleHeroRun}>
								Chạy với AI
								<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							</div>
						</div>
						<div className="stu-home__hero-chips">
							<span className="stu-home__hero-chips-label">Thử:</span>
							{HERO_CHIPS.map((c) => (
								<span key={c.label} className="stu-home__hero-chip" onClick={() => openWorkspace(c.subject, c.simId)}>
									{c.label}
								</span>
							))}
						</div>

						{showAiPanel && (
							<div className="stu-home__assistant-panel">
								<div className="stu-home__assistant-close" onClick={() => setShowAiPanel(false)}>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								</div>
								
								{aiLoading ? (
									<div className="stu-home__assistant-loading">
										<div className="stu-home__assistant-spinner"></div>
										<span>Trợ lý AI đang phân tích yêu cầu...</span>
									</div>
								) : aiResponse ? (
									<div className="stu-home__assistant-result">
										<div className="stu-home__assistant-header">
											<div className="stu-home__assistant-avatar">
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6-4.7L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
												</svg>
											</div>
											<span className="stu-home__assistant-name">Phản hồi từ Trợ lý AI</span>
										</div>
										
										<div className="stu-home__assistant-answer">
											{aiResponse.answer?.short_answer}
										</div>

										{aiResponse.simulation && (
											<div className="stu-home__assistant-recommendation">
												<div className="stu-home__recommend-card">
													<div className={`stu-home__recommend-badge stu-home__recommend-badge--${aiResponse.subject}`}>
														{aiResponse.subject === 'chem' ? 'Hóa học' : aiResponse.subject === 'math' ? 'Toán học' : 'Vật lý'}
													</div>
													<div className="stu-home__recommend-content">
														<div className="stu-home__recommend-title">{aiResponse.simulation.title}</div>
														<div className="stu-home__recommend-desc">Mô phỏng tương tác giúp trực quan hóa lý thuyết và hỗ trợ giải bài tập.</div>
													</div>
													<div 
														className="stu-home__recommend-action-btn"
														onClick={() => openWorkspace(
															aiResponse.subject, 
															aiResponse.simulation?.simulation_id
														)}
													>
														Trải nghiệm ngay
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
															<path d="M5 12h14M13 6l6 6-6 6" />
														</svg>
													</div>
												</div>
											</div>
										)}
									</div>
								) : (
									<div className="stu-home__assistant-error">
										Không nhận được phản hồi từ trợ lý. Vui lòng thử lại.
									</div>
								)}
							</div>
						)}
					</div>

					{/* Divider */}
					<div className="stu-home__divider">
						<div className="stu-home__divider-line" />
						<div className="stu-home__divider-text">hoặc duyệt danh mục</div>
						<div className="stu-home__divider-line" />
					</div>

					{/* Controls */}
					<div className="stu-home__controls">
						<div className="stu-home__grade-tabs">
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
						<div className="stu-home__filter-chips">
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
					<div className="stu-home__grid">
						{filteredLabs.map((lab, idx) => (
							<div
								key={lab.id}
								className="stu-home__card"
								style={{ animationDelay: `${idx * 0.06}s` }}
								onClick={() => !lab.locked && openWorkspace(lab.subject, lab.simId)}
							>
								<div className={`stu-home__card-thumb stu-home__card-thumb--${lab.subject}`}>
									<span className="stu-home__card-thumb-label">{SUBJECT_LABELS[lab.subject]}</span>
									{lab.locked && (
										<div className="stu-home__card-lock">
											<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
												<rect x="5" y="11" width="14" height="9" rx="2" />
												<path d="M8 11V8a4 4 0 0 1 8 0v3" />
											</svg>
										</div>
									)}
								</div>
								<div className="stu-home__card-body">
									<div className="stu-home__card-title-row">
										<div className={`stu-home__card-dot stu-home__card-dot--${lab.subject}`} />
										<div className="stu-home__card-title">{lab.title}</div>
									</div>
									<div className="stu-home__card-meta">
										<span className={`stu-home__card-level ${getLevelClass(lab.level)}`}>{lab.level}</span>
										<span className="stu-home__card-mins">{lab.mins}</span>
										{lab.xp && <span className="stu-home__card-xp">{lab.xp}</span>}
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
