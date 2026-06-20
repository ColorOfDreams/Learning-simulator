import React, { useState, useMemo, useCallback } from 'react';
import { history } from 'umi';
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
}

// ── Mock Data ──
const ALL_LABS: LabItem[] = [
	{ id: 1, title: 'Chuẩn độ Axit-Bazơ', subject: 'chem', level: 'Trung bình', mins: '~15 phút', xp: '+120 XP', locked: false },
	{ id: 2, title: 'Thử nghiệm ngọn lửa', subject: 'chem', level: 'Cơ bản', mins: '~8 phút', xp: '+60 XP', locked: false },
	{ id: 3, title: 'Tốc độ phản ứng', subject: 'chem', level: 'Nâng cao', mins: '~20 phút', xp: '+200 XP', locked: false },
	{ id: 4, title: 'Chuyển động ném xiên', subject: 'physics', level: 'Cơ bản', mins: '~10 phút', xp: '+60 XP', locked: false },
	{ id: 5, title: 'Mạch RLC', subject: 'physics', level: 'Trung bình', mins: '~15 phút', xp: '+120 XP', locked: false },
	{ id: 6, title: 'Hàm bậc hai', subject: 'math', level: 'Cơ bản', mins: '~12 phút', xp: '+80 XP', locked: false },
	{ id: 7, title: 'Định luật Ohm', subject: 'physics', level: 'Khóa', mins: 'Đạt Lv.8', xp: '', locked: true },
];

const SUBJECT_LABELS: Record<string, string> = {
	physics: 'vật lý',
	math: 'toán',
	chem: 'hóa học',
};

const HERO_CHIPS = [
	{ label: 'Nóng chảy băng', subject: 'chem' },
	{ label: 'Chuẩn độ Axit-Bazơ', subject: 'chem' },
	{ label: 'Chuyển động ném xiên', subject: 'physics' },
	{ label: 'Hàm bậc hai', subject: 'math' },
	{ label: 'Mạch RLC', subject: 'physics' },
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
	const [grade, setGrade] = useState(11);
	const [filter, setFilter] = useState('all');

	const filteredLabs = useMemo(
		() => ALL_LABS.filter((l) => filter === 'all' || l.subject === filter),
		[filter],
	);

	const openWorkspace = useCallback((subject: string) => {
		history.push(`/hoc-sinh/workspace?subject=${subject}`);
	}, []);

	const handleHeroRun = useCallback(() => {
		const t = heroInput.toLowerCase();
		let s = 'physics';
		if (/chuẩn độ|axit|bazơ|phản ứng|ph\b|hóa/.test(t)) s = 'chem';
		else if (/bậc hai|parabol|phương trình|nghiệm|đỉnh|toán/.test(t)) s = 'math';
		openWorkspace(s);
	}, [heroInput, openWorkspace]);

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
								<span key={c.label} className="stu-home__hero-chip" onClick={() => openWorkspace(c.subject)}>
									{c.label}
								</span>
							))}
						</div>
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
								onClick={() => !lab.locked && openWorkspace(lab.subject)}
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
