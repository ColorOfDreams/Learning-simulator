import { getLeaderboard, getMyLabs, getUserStats } from '@/services/base/api';
import { calcLevel, levelFloorXp, nextThresholdXp } from '@/utils/xp';
import React, { useEffect, useMemo, useState } from 'react';
import { useModel } from 'umi';
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
	return (
		<span>
			{prefix}
			{formatted}
		</span>
	);
};

// ── SVG Icons ──
const FlaskIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='oklch(0.6 0.18 350)'
		strokeWidth='1.8'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' />
	</svg>
);

const StreakIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='oklch(0.65 0.17 50)'
		strokeWidth='1.8'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 2c1.5 3-1.5 5 0 8 1 2 4 2 4 5a4 4 0 0 1-8 0c0-2 1-3 1-4-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-6-6-6-14Z' />
	</svg>
);

const BoltIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='oklch(0.62 0.16 264)'
		strokeWidth='1.8'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M13 3 5 13h6l-1 8 8-10h-6l1-8Z' />
	</svg>
);

const LockIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='#b6b3aa'
		strokeWidth='1.8'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<rect x='5' y='11' width='14' height='10' rx='2' />
		<path d='M8 11V7a4 4 0 0 1 8 0v4' />
	</svg>
);

const Progress: React.FC = () => {
	const [stats, setStats] = useState<any>(null);
	const [labData, setLabData] = useState<{ inProgress: any[]; completed: any[] }>({ inProgress: [], completed: [] });
	const [rank, setRank] = useState<number>(0);
	const { initialState } = useModel('@@initialState');
	const currentUserId = (initialState?.currentUser as any)?.id;

	useEffect(() => {
		getUserStats()
			.then((res) => setStats(res.data?.data || res.data))
			.catch(() => {});
		getMyLabs()
			.then((res) => {
				const d = res.data?.data ?? res.data ?? {};
				setLabData({ inProgress: d.inProgress ?? [], completed: d.completed ?? [] });
			})
			.catch(() => {});
		getLeaderboard(50)
			.then((res) => {
				const list: any[] = res.data?.data ?? res.data ?? [];
				const idx = list.findIndex((p: any) => p.id === currentUserId);
				setRank(idx >= 0 ? idx + 1 : 0);
			})
			.catch(() => {});
	}, [currentUserId]);

	const xp = stats?.xp ?? 0;
	const level = calcLevel(xp);
	const streak = stats?.streak ?? 0;
	const maxStreak = stats?.maxStreak ?? 0;
	const levelTitle = stats?.levelTitle ?? 'Học sinh mới';
	// Tiến trình trong-cấp: đoạn XP giữa mốc vào cấp hiện tại và ngưỡng lên cấp kế.
	const levelFloor = levelFloorXp(level);
	const nextThreshold = nextThresholdXp(level);
	const inLevelXp = Math.max(0, xp - levelFloor);
	const levelSpan = Math.max(1, nextThreshold - levelFloor);
	const xpToNextLevel = Math.max(0, nextThreshold - xp);
	const pct = Math.min(100, Math.round((inLevelXp / levelSpan) * 100));
	const circumference = 402;
	const dashOffset = circumference - (circumference * pct) / 100;

	const totalLabs = labData.inProgress.length + labData.completed.length;
	const subjectSet = new Set([...labData.inProgress, ...labData.completed].map((l: any) => l.subject));
	const subjectCount = subjectSet.size;

	const weeklyBars = useMemo(() => {
		const today = new Date();
		return Array.from({ length: 6 }, (_, i) => {
			const anchor = new Date(today);
			anchor.setDate(today.getDate() - (5 - i) * 7);
			const day = anchor.getDay();
			const diff = day === 0 ? -6 : 1 - day;
			const weekStart = new Date(anchor);
			weekStart.setDate(anchor.getDate() + diff);
			weekStart.setHours(0, 0, 0, 0);
			const weekEnd = new Date(weekStart);
			weekEnd.setDate(weekStart.getDate() + 7);
			const count = labData.completed.filter((l: any) => {
				if (!l.completedAt) return false;
				const d = new Date(l.completedAt);
				return d >= weekStart && d < weekEnd;
			}).length;
			return { label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`, count };
		});
	}, [labData.completed]);
	const maxBarCount = Math.max(...weeklyBars.map((w) => w.count), 1);

	const computedBadges = useMemo(() => [
		{ label: 'Hoàn thành đầu tiên', earned: labData.completed.length >= 1, variant: 'chem', Icon: FlaskIcon },
		{ label: 'Chuỗi 5 ngày', earned: (stats?.maxStreak ?? 0) >= 5, variant: 'streak', Icon: StreakIcon },
		{ label: 'Chinh phục 5 bài', earned: labData.completed.length >= 5, variant: 'learner', Icon: BoltIcon },
		{ label: 'Nhà khoa học tập sự', earned: (stats?.level ?? 1) >= 7, variant: 'rank', Icon: BoltIcon },
	], [labData.completed, stats]);
	const earnedBadgeCount = computedBadges.filter((b) => b.earned).length;

	const avgScore = (subject: string) => {
		const done = labData.completed.filter((l: any) => l.subject === subject);
		if (!done.length) return 0;
		return Math.round(done.reduce((s: number, l: any) => s + (l.score ?? 0), 0) / done.length);
	};
	const chemPct = avgScore('chem');
	const mathPct = avgScore('math');
	const physicsPct = avgScore('physics');
	const avgMastery = subjectCount > 0 ? Math.round((chemPct + mathPct + physicsPct) / 3) : 0;

	return (
		<StudentLayout>
			<div className='stu-progress scl'>
				<div className='stu-progress__inner'>
					<div className='stu-progress__title'>Tiến trình học tập</div>

					{/* HERO CARD (Dark themed) */}
					<div className='stu-progress__hero'>
						{/* Background effects */}
						<div className='stu-progress__hero-glow1' />
						<div className='stu-progress__hero-glow2' />
						<div className='stu-progress__hero-grid' />

						<div className='stu-progress__hero-body'>
							{/* Left content */}
							<div className='stu-progress__hero-left'>
								<div className='stu-progress__hero-subtitle'>TIẾN TRÌNH CỦA BẠN</div>
								<div className='stu-progress__hero-identity'>
									<div className='stu-progress__hero-level'>Lv.{level}</div>
									<div className='stu-progress__hero-rank-name'>
										{levelTitle.split(' ').slice(0, -1).join(' ')}
										<br />
										{levelTitle.split(' ').slice(-1)[0]}
									</div>
								</div>

								<div className='stu-progress__hero-xp-section'>
									<div className='stu-progress__hero-xp-labels'>
										<span>{xp.toLocaleString('vi-VN')} XP</span>
										<span>→ Lv.{level + 1}</span>
									</div>
									<div className='stu-progress__hero-xp-track'>
										<div className='stu-progress__hero-xp-fill' style={{ width: `${pct}%` }} />
									</div>
									<div className='stu-progress__hero-hint'>
										Chỉ còn{' '}
										<span style={{ color: '#cfccdd', fontWeight: 600 }}>
											{xpToNextLevel.toLocaleString('vi-VN')} XP
										</span>{' '}
										để lên cấp tiếp theo.
									</div>
								</div>
							</div>

							{/* Right circle gauge */}
							<div className='stu-progress__hero-gauge'>
								<svg width='154' height='154' viewBox='0 0 154 154' className='stu-progress__gauge-svg'>
									<circle cx='77' cy='77' r='64' fill='none' stroke='rgba(255, 255, 255, 0.1)' strokeWidth='13' />
									<circle
										cx='77'
										cy='77'
										r='64'
										fill='none'
										stroke='url(#ringg)'
										strokeWidth='13'
										strokeLinecap='round'
										strokeDasharray='402'
										strokeDashoffset={dashOffset}
										transform='rotate(-90 77 77)'
										className='stu-progress__gauge-fill'
									/>
									<defs>
										<linearGradient id='ringg' x1='0' y1='0' x2='1' y2='1'>
											<stop offset='0' stopColor='oklch(0.7 0.16 264)' />
											<stop offset='1' stopColor='oklch(0.74 0.18 350)' />
										</linearGradient>
									</defs>
								</svg>
								<div className='stu-progress__gauge-text'>
									<div className='stu-progress__gauge-number'>
										<CountUp end={pct} />
										<span>%</span>
									</div>
									<div className='stu-progress__gauge-sub'>LÊN LV.{level + 1}</div>
								</div>
							</div>
						</div>

						{/* Stats footer row */}
						<div className='stu-progress__hero-stats'>
							<div className='stu-progress__hero-stat'>
								<div className='stu-progress__hero-stat-lbl'>TỔNG XP</div>
								<div className='stu-progress__hero-stat-val'>
									<CountUp end={xp} isComma />
								</div>
							</div>
							<div className='stu-progress__hero-stat'>
								<div className='stu-progress__hero-stat-lbl'>CHUỖI NGÀY</div>
								<div className='stu-progress__hero-stat-val'>
									<CountUp end={streak} />
									<span className='stu-progress__hero-stat-sub'>kỷ lục {maxStreak}</span>
								</div>
							</div>
							<div className='stu-progress__hero-stat'>
								<div className='stu-progress__hero-stat-lbl'>SỐ BÀI LAB</div>
								<div className='stu-progress__hero-stat-val'>
									<CountUp end={totalLabs} />
									<span className='stu-progress__hero-stat-sub'>{subjectCount || 0} môn</span>
								</div>
							</div>
							<div className='stu-progress__hero-stat'>
								<div className='stu-progress__hero-stat-lbl'>HẠNG LỚP</div>
								<div className='stu-progress__hero-stat-val'>
									<span>{rank ? `#${rank}` : '--'}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Charts Row */}
					<div className='stu-progress__charts-row'>
						{/* XP Chart Card */}
						<div className='stu-progress__chart-box stu-progress__chart-box--wide'>
							<div className='stu-progress__chart-header'>
								<span className='stu-progress__chart-title'>Bài hoàn thành 6 tuần qua</span>
								<span className='stu-progress__chart-badge'>Tổng {labData.completed.length} bài</span>
							</div>
							<div className='stu-progress__xp-chart'>
								<div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: '100%', padding: '8px 4px 24px' }}>
									{weeklyBars.map((w, i) => (
										<div
											key={i}
											style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}
										>
											<div style={{ fontSize: 11, color: '#9a9590', fontWeight: 600, minHeight: 16, textAlign: 'center' }}>
												{w.count > 0 ? w.count : ''}
											</div>
											<div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
												<div
													style={{
														width: '100%',
														height: `${Math.round((w.count / maxBarCount) * 100)}%`,
														minHeight: w.count > 0 ? 4 : 0,
														background: i === 5
															? 'linear-gradient(to top, oklch(0.62 0.16 264), oklch(0.72 0.18 350))'
															: 'oklch(0.62 0.16 264 / 0.22)',
														borderRadius: '4px 4px 0 0',
														transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
													}}
												/>
											</div>
											<div style={{ fontSize: 10, color: '#b8b5ad', fontWeight: 500, whiteSpace: 'nowrap' }}>
												{w.label}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Subject Mastery Card (Linear progress bars) */}
						<div className='stu-progress__chart-box'>
							<div className='stu-progress__chart-header'>
								<span className='stu-progress__chart-title'>Mức độ thành thạo</span>
								<span className='stu-progress__chart-desc'>trung bình {avgMastery}%</span>
							</div>

							<div className='stu-progress__mastery-list'>
								<div className='stu-progress__mastery-row'>
									<div className='stu-progress__mastery-info'>
										<span>Hóa học</span>
										<strong>{chemPct}%</strong>
									</div>
									<div className='stu-progress__mastery-track'>
										<div
											className='stu-progress__mastery-fill stu-progress__mastery-fill--chem'
											style={{ width: `${chemPct}%` }}
										/>
									</div>
								</div>

								<div className='stu-progress__mastery-row'>
									<div className='stu-progress__mastery-info'>
										<span>Toán học</span>
										<strong>{mathPct}%</strong>
									</div>
									<div className='stu-progress__mastery-track'>
										<div
											className='stu-progress__mastery-fill stu-progress__mastery-fill--math'
											style={{ width: `${mathPct}%` }}
										/>
									</div>
								</div>

								<div className='stu-progress__mastery-row'>
									<div className='stu-progress__mastery-info'>
										<span>Vật lý</span>
										<strong>{physicsPct}%</strong>
									</div>
									<div className='stu-progress__mastery-track'>
										<div
											className='stu-progress__mastery-fill stu-progress__mastery-fill--physics'
											style={{ width: `${physicsPct}%` }}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Badges Section */}
					<div className='stu-progress__badges-box'>
						<div className='stu-progress__chart-header'>
							<span className='stu-progress__chart-title'>Huy hiệu</span>
							<span className='stu-progress__chart-desc'>{earnedBadgeCount}/{computedBadges.length} đã đạt</span>
						</div>

						<div className='stu-progress__badges-flex'>
							{computedBadges.map((badge) => {
								const { label, earned, variant, Icon } = badge;
								return (
									<div
										key={label}
										className={`stu-progress__badge-card stu-progress__badge-card--${earned ? variant : 'locked'}`}
										style={{ opacity: earned ? 1 : 0.45, filter: earned ? 'none' : 'grayscale(0.6)' }}
										title={earned ? 'Đã đạt được' : 'Chưa đạt'}
									>
										<div className={`stu-progress__badge-avatar stu-progress__badge-avatar--${earned ? variant : 'locked'}`}>
											{earned ? <Icon /> : <LockIcon />}
										</div>
										<span className={`stu-progress__badge-title${earned ? '' : ' stu-progress__badge-title--locked'}`}>
											{label}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default Progress;
