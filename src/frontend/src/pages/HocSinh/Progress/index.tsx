import React from 'react';
import StudentLayout from '../components/StudentLayout';
import './index.less';

// ── SVG Icons ──
const FlaskIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3" />
	</svg>
);

const BoltIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
	</svg>
);

const CheckIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="m5 13 4 4L19 7" />
	</svg>
);

const LockIcon = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<rect x="5" y="11" width="14" height="9" rx="2" />
		<path d="M8 11V8a4 4 0 0 1 8 0v3" />
	</svg>
);

// ── Data ──
const STATS = [
	{ label: 'Tổng XP', value: '1.240', color: '' },
	{ label: 'Level', value: '7', color: 'accent' },
	{ label: 'Chuỗi ngày', value: '5', color: '' },
	{ label: 'Thí nghiệm', value: '18', color: '' },
];

const SUBJECTS = [
	{ name: 'Toán', pct: 72, color: 'math' },
	{ name: 'Vật lý', pct: 60, color: 'physics' },
	{ name: 'Hóa học', pct: 84, color: 'chem' },
];

const BADGES = [
	{ name: 'Chuẩn độ đầu tiên', icon: <FlaskIcon />, earned: true },
	{ name: 'Chuỗi 5 ngày', icon: <BoltIcon />, earned: true },
	{ name: 'Quiz xuất sắc', icon: <CheckIcon />, earned: true },
	{ name: 'Khóa', icon: <LockIcon />, earned: false },
];

const Progress: React.FC = () => {
	return (
		<StudentLayout>
			<div className="stu-progress scl">
				<div className="stu-progress__inner">
					<div className="stu-progress__title">Tiến trình học tập</div>

					{/* Stat Cards */}
					<div className="stu-progress__stats">
						{STATS.map((stat) => (
							<div key={stat.label} className="stu-progress__stat-card">
								<div className="stu-progress__stat-label">{stat.label}</div>
								<div className={`stu-progress__stat-value ${stat.color ? `stu-progress__stat-value--${stat.color}` : ''}`}>
									{stat.value}
								</div>
							</div>
						))}
					</div>

					{/* Charts Row */}
					<div className="stu-progress__charts">
						{/* XP Chart */}
						<div className="stu-progress__chart-card stu-progress__chart-card--wide">
							<div className="stu-progress__chart-title">XP trong 6 tuần qua</div>
							<div className="stu-progress__xp-chart">
								<div className="stu-progress__xp-axis-y" />
								<div className="stu-progress__xp-axis-x" />
								<svg viewBox="0 0 200 100" preserveAspectRatio="none" className="stu-progress__xp-svg">
									<defs>
										<linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0" stopColor="oklch(0.62 0.16 264 / 0.25)" />
											<stop offset="1" stopColor="oklch(0.62 0.16 264 / 0)" />
										</linearGradient>
									</defs>
									<path d="M4,92 L40,78 L76,82 L112,54 L148,40 L196,16 L196,100 L4,100 Z" fill="url(#xpGrad)" />
									<path d="M4,92 L40,78 L76,82 L112,54 L148,40 L196,16" fill="none" stroke="oklch(0.6 0.16 264)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
								</svg>
								<div className="stu-progress__xp-label stu-progress__xp-label--start">T1</div>
								<div className="stu-progress__xp-label stu-progress__xp-label--end">T6</div>
							</div>
						</div>

						{/* Subject Mastery */}
						<div className="stu-progress__chart-card">
							<div className="stu-progress__chart-title">Mức thành thạo</div>
							<div className="stu-progress__mastery">
								{SUBJECTS.map((subj) => (
									<div key={subj.name} className="stu-progress__mastery-item">
										<div
											className="stu-progress__mastery-ring"
											style={{
												background: `conic-gradient(var(--ring-color) 0 ${subj.pct}%, #eae8e2 0)`,
												'--ring-color': subj.color === 'math' ? 'oklch(0.6 0.12 195)' : subj.color === 'physics' ? 'oklch(0.58 0.15 262)' : 'oklch(0.6 0.18 350)',
											} as React.CSSProperties}
										>
											<div className="stu-progress__mastery-inner">
												{subj.pct}%
											</div>
										</div>
										<span className="stu-progress__mastery-label">{subj.name}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Badges */}
					<div className="stu-progress__badges-card">
						<div className="stu-progress__chart-title">Huy hiệu</div>
						<div className="stu-progress__badges-grid">
							{BADGES.map((badge) => (
								<div key={badge.name} className="stu-progress__badge-item">
									<div className={`stu-progress__badge-circle ${badge.earned ? 'stu-progress__badge-circle--earned' : 'stu-progress__badge-circle--locked'}`}>
										{badge.icon}
									</div>
									<span className={`stu-progress__badge-name ${!badge.earned ? 'stu-progress__badge-name--locked' : ''}`}>
										{badge.name}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default Progress;
