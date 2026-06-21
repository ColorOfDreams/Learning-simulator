import React, { useState, useEffect } from 'react';
import StudentLayout from '../components/StudentLayout';
import './index.less';

// ── CountUp Animation Component ──
const CountUp: React.FC<{ end: number; duration?: number; isComma?: boolean; prefix?: string }> = ({
	end,
	duration = 1100,
	isComma = false,
	prefix = '',
}) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let startTimestamp: number | null = null;
		let animationFrameId: number;

		const step = (timestamp: number) => {
			if (!startTimestamp) startTimestamp = timestamp;
			const progress = Math.min((timestamp - startTimestamp) / duration, 1);
			// cubic ease-out
			const ease = 1 - Math.pow(1 - progress, 3);
			setCount(Math.round(end * ease));

			if (progress < 1) {
				animationFrameId = window.requestAnimationFrame(step);
			} else {
				setCount(end);
			}
		};

		animationFrameId = window.requestAnimationFrame(step);
		return () => window.cancelAnimationFrame(animationFrameId);
	}, [end, duration]);

	const formatted = isComma ? count.toLocaleString('en-US') : count.toString();
	return <span>{prefix}{formatted}</span>;
};

// ── SVG Icons ──
const FlaskIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.6 0.18 350)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3" />
	</svg>
);

const StreakIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.65 0.17 50)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M12 2c1.5 3-1.5 5 0 8 1 2 4 2 4 5a4 4 0 0 1-8 0c0-2 1-3 1-4-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-6-6-6-14Z" />
	</svg>
);

const BoltIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.62 0.16 264)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
	</svg>
);

const LockIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b6b3aa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<rect x="5" y="11" width="14" height="10" rx="2" />
		<path d="M8 11V7a4 4 0 0 1 8 0v4" />
	</svg>
);

const Progress: React.FC = () => {
	return (
		<StudentLayout>
			<div className="stu-progress scl">
				<div className="stu-progress__inner">
					<div className="stu-progress__title">Tiến trình học tập</div>

					{/* HERO CARD (Dark themed) */}
					<div className="stu-progress__hero">
						{/* Background effects */}
						<div className="stu-progress__hero-glow1" />
						<div className="stu-progress__hero-glow2" />
						<div className="stu-progress__hero-grid" />

						<div className="stu-progress__hero-body">
							{/* Left content */}
							<div className="stu-progress__hero-left">
								<div className="stu-progress__hero-subtitle">TIẾN TRÌNH CỦA BẠN</div>
								<div className="stu-progress__hero-identity">
									<div className="stu-progress__hero-level">Lv.7</div>
									<div className="stu-progress__hero-rank-name">Học sinh<br />Tập sự</div>
								</div>
								
								<div className="stu-progress__hero-xp-section">
									<div className="stu-progress__hero-xp-labels">
										<span>1.240 XP</span>
										<span>1.500 → Lv.8</span>
									</div>
									<div className="stu-progress__hero-xp-track">
										<div className="stu-progress__hero-xp-fill" style={{ width: '82%' }} />
									</div>
									<div className="stu-progress__hero-hint">
										Chỉ còn <span style={{ color: '#cfccdd', fontWeight: 600 }}>260 XP</span> để lên cấp tiếp theo — khoảng 2 bài lab nữa.
									</div>
								</div>
							</div>

							{/* Right circle gauge */}
							<div className="stu-progress__hero-gauge">
								<svg width="154" height="154" viewBox="0 0 154 154" className="stu-progress__gauge-svg">
									<circle cx="77" cy="77" r="64" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="13" />
									<circle
										cx="77"
										cy="77"
										r="64"
										fill="none"
										stroke="url(#ringg)"
										strokeWidth="13"
										strokeLinecap="round"
										strokeDasharray="402"
										strokeDashoffset="72.4"
										transform="rotate(-90 77 77)"
										className="stu-progress__gauge-fill"
									/>
									<defs>
										<linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
											<stop offset="0" stopColor="oklch(0.7 0.16 264)" />
											<stop offset="1" stopColor="oklch(0.74 0.18 350)" />
										</linearGradient>
									</defs>
								</svg>
								<div className="stu-progress__gauge-text">
									<div className="stu-progress__gauge-number">
										<CountUp end={82} /><span>%</span>
									</div>
									<div className="stu-progress__gauge-sub">LÊN LV.8</div>
								</div>
							</div>
						</div>

						{/* Stats footer row */}
						<div className="stu-progress__hero-stats">
							<div className="stu-progress__hero-stat">
								<div className="stu-progress__hero-stat-lbl">TỔNG XP</div>
								<div className="stu-progress__hero-stat-val">
									<CountUp end={1240} isComma />
									<span className="stu-progress__hero-stat-plus">+180</span>
								</div>
							</div>
							<div className="stu-progress__hero-stat">
								<div className="stu-progress__hero-stat-lbl">CHUỖI NGÀY</div>
								<div className="stu-progress__hero-stat-val">
									<CountUp end={5} />
									<span className="stu-progress__hero-stat-sub">kỷ lục 9</span>
								</div>
							</div>
							<div className="stu-progress__hero-stat">
								<div className="stu-progress__hero-stat-lbl">SỐ BÀI LAB</div>
								<div className="stu-progress__hero-stat-val">
									<CountUp end={18} />
									<span className="stu-progress__hero-stat-sub">3 môn</span>
								</div>
							</div>
							<div className="stu-progress__hero-stat">
								<div className="stu-progress__hero-stat-lbl">HẠNG LỚP</div>
								<div className="stu-progress__hero-stat-val">
									<span>#4</span>
									<span className="stu-progress__hero-stat-plus">↑2</span>
								</div>
							</div>
						</div>
					</div>

					{/* Charts Row */}
					<div className="stu-progress__charts-row">
						{/* XP Chart Card */}
						<div className="stu-progress__chart-box stu-progress__chart-box--wide">
							<div className="stu-progress__chart-header">
								<span className="stu-progress__chart-title">XP trong 6 tuần qua</span>
								<span className="stu-progress__chart-badge">Tuần này +180</span>
							</div>
							<div className="stu-progress__xp-chart">
								<div className="stu-progress__xp-axis-y" />
								<div className="stu-progress__xp-axis-x" />
								
								<svg viewBox="0 0 200 100" preserveAspectRatio="none" className="stu-progress__xp-svg">
									<defs>
										<linearGradient id="xpg" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0" stopColor="oklch(0.62 0.16 264 / 0.28)" />
											<stop offset="1" stopColor="oklch(0.62 0.16 264 / 0)" />
										</linearGradient>
									</defs>
									<path d="M4,92 L40,78 L76,82 L112,54 L148,40 L196,16 L196,100 L4,100 Z" fill="url(#xpg)" className="stu-progress__xp-path-fill" />
									<path d="M4,92 L40,78 L76,82 L112,54 L148,40 L196,16" fill="none" stroke="oklch(0.6 0.16 264)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" className="stu-progress__xp-path-line" />
								</svg>

								{/* Pulse Dot and Tooltip */}
								<div className="stu-progress__chart-dot" />
								<div className="stu-progress__chart-tooltip">420 XP</div>

								<div className="stu-progress__xp-label stu-progress__xp-label--start">T1</div>
								<div className="stu-progress__xp-label stu-progress__xp-label--end">T6</div>
							</div>
						</div>

						{/* Subject Mastery Card (Linear progress bars) */}
						<div className="stu-progress__chart-box">
							<div className="stu-progress__chart-header">
								<span className="stu-progress__chart-title">Mức độ thành thạo</span>
								<span className="stu-progress__chart-desc">trung bình 72%</span>
							</div>

							<div className="stu-progress__mastery-list">
								<div className="stu-progress__mastery-row">
									<div className="stu-progress__mastery-info">
										<span>Hóa học</span>
										<strong>84%</strong>
									</div>
									<div className="stu-progress__mastery-track">
										<div className="stu-progress__mastery-fill stu-progress__mastery-fill--chem" style={{ width: '84%' }} />
									</div>
								</div>

								<div className="stu-progress__mastery-row">
									<div className="stu-progress__mastery-info">
										<span>Toán học</span>
										<strong>72%</strong>
									</div>
									<div className="stu-progress__mastery-track">
										<div className="stu-progress__mastery-fill stu-progress__mastery-fill--math" style={{ width: '72%' }} />
									</div>
								</div>

								<div className="stu-progress__mastery-row">
									<div className="stu-progress__mastery-info">
										<span>Vật lý</span>
										<strong>60%</strong>
									</div>
									<div className="stu-progress__mastery-track">
										<div className="stu-progress__mastery-fill stu-progress__mastery-fill--physics" style={{ width: '60%' }} />
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Badges Section */}
					<div className="stu-progress__badges-box">
						<div className="stu-progress__chart-header">
							<span className="stu-progress__chart-title">Huy hiệu</span>
							<span className="stu-progress__chart-desc">3/4 đã đạt</span>
						</div>

						<div className="stu-progress__badges-flex">
							<div className="stu-progress__badge-card stu-progress__badge-card--chem">
								<div className="stu-progress__badge-avatar stu-progress__badge-avatar--chem">
									<FlaskIcon />
								</div>
								<span className="stu-progress__badge-title">Chuẩn độ đầu tiên</span>
							</div>

							<div className="stu-progress__badge-card stu-progress__badge-card--streak">
								<div className="stu-progress__badge-avatar stu-progress__badge-avatar--streak">
									<StreakIcon />
								</div>
								<span className="stu-progress__badge-title">Chuỗi 5 ngày</span>
							</div>

							<div className="stu-progress__badge-card stu-progress__badge-card--learner">
								<div className="stu-progress__badge-avatar stu-progress__badge-avatar--learner">
									<BoltIcon />
								</div>
								<span className="stu-progress__badge-title">Học nhanh</span>
							</div>

							<div className="stu-progress__badge-card stu-progress__badge-card--locked">
								<div className="stu-progress__badge-avatar stu-progress__badge-avatar--locked">
									<LockIcon />
								</div>
								<span className="stu-progress__badge-title stu-progress__badge-title--locked">Điểm tuyệt đối</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default Progress;
