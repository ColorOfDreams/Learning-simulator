import React, { useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import './index.less';

// ── Data ──
const TABS = ['Lớp tôi', 'Khối 11', 'Toàn cầu'];

const PODIUM = [
	{ rank: 2, name: 'Mai L.', xp: '2.980 XP', height: 96, labelColor: '#cdcbd6' },
	{ rank: 1, name: 'Sơn O.', xp: '3.420 XP', height: 140, labelColor: '#fff', crown: true },
	{ rank: 3, name: 'Ravi P.', xp: '2.610 XP', height: 76, labelColor: '#d8b89a' },
];

const ROWS = [
	{ rank: 4, name: 'Đức K.', level: 9, week: '+180 tuần', xp: '2.310 XP', me: false },
	{ rank: 5, name: 'Linh F.', level: 8, week: '+150 tuần', xp: '1.640 XP', me: false },
	{ rank: 6, name: 'Bạn · Học Sinh', level: 7, week: '+220 tuần', xp: '1.240 XP', me: true },
	{ rank: 7, name: 'Hoàng B.', level: 7, week: '+90 tuần', xp: '1.180 XP', me: false },
	{ rank: 8, name: 'Ivy C.', level: 7, week: '+70 tuần', xp: '1.090 XP', me: false },
];

const Leaderboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);

	return (
		<StudentLayout>
			<div className="stu-leader scl">
				<div className="stu-leader__inner">
					{/* Header */}
					<div className="stu-leader__header">
						<div>
							<div className="stu-leader__title">Bảng xếp hạng</div>
							<div className="stu-leader__subtitle">
								<span className="stu-leader__live-dot" />
								Mùa giải kết thúc sau <strong style={{ color: '#5a5852' }}>4 ngày</strong> · tiếp tục thăng hạng
							</div>
						</div>
						<div className="stu-leader__tabs">
							{TABS.map((tab, i) => (
								<div
									key={tab}
									className={`stu-leader__tab ${activeTab === i ? 'stu-leader__tab--active' : ''}`}
									onClick={() => setActiveTab(i)}
								>
									{tab}
								</div>
							))}
						</div>
					</div>

					{/* PODIUM WRAPPER (Dark themed card) */}
					<div className="stu-leader__podium-wrapper">
						{/* Glow backgrounds */}
						<div className="stu-leader__glow-top" />
						<div className="stu-leader__glow-right" />
						<div className="stu-leader__glow-left" />

						{/* Sparkling lights */}
						<div className="stu-leader__spark stu-leader__spark--1" />
						<div className="stu-leader__spark stu-leader__spark--2" />
						<div className="stu-leader__spark stu-leader__spark--3" />

						<div className="stu-leader__podium">
							{PODIUM.map((p, idx) => (
								<div
									key={p.rank}
									className={`stu-leader__podium-col stu-leader__podium-col--r${p.rank}`}
									style={{ animationDelay: `${0.15 + (3 - p.rank) * 0.15}s` }}
								>
									{p.crown && (
										<div className="stu-leader__crown-emoji">👑</div>
									)}

									<div className={`stu-leader__podium-avatar-wrap`}>
										<div
											className="stu-leader__podium-avatar"
											style={{
												border: p.rank === 1
													? '3px solid oklch(0.8 0.14 85)'
													: p.rank === 2
														? '3px solid oklch(0.78 0.02 250)'
														: '3px solid oklch(0.65 0.11 55)',
												boxShadow: p.rank === 1
													? '0 6px 18px -6px oklch(0.8 0.14 85 / 0.8)'
													: p.rank === 2
														? '0 6px 18px -6px oklch(0.78 0.02 250 / 0.8)'
														: '0 6px 18px -6px oklch(0.65 0.11 55 / 0.8)'
											}}
										/>
										<div
											className="stu-leader__podium-badge"
											style={{
												background: p.rank === 1
													? 'oklch(0.8 0.14 85)'
													: p.rank === 2
														? 'oklch(0.78 0.02 250)'
														: 'oklch(0.65 0.11 55)'
											}}
										>
											{p.rank}
										</div>
									</div>

									<div className={`stu-leader__podium-name ${p.rank === 1 ? 'stu-leader__podium-name--bold' : ''}`}>
										{p.name}
									</div>
									<div className="stu-leader__podium-xp">{p.xp}</div>

									{/* Tower Block */}
									<div
										className={`stu-leader__podium-bar stu-leader__podium-bar--r${p.rank}`}
										style={{ height: `${p.height}px` }}
									>
										<span style={{ color: p.labelColor }}>{p.rank}</span>
										{p.rank === 1 && (
											<div className="stu-leader__podium-shine" />
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Ranked Rows */}
					<div className="stu-leader__rows">
						{ROWS.map((r, idx) => (
							<div
								key={r.rank}
								className={`stu-leader__row ${r.me ? 'stu-leader__row--me' : ''}`}
								style={{ animationDelay: `${(idx * 0.08).toFixed(2)}s` }}
							>
								<div className={`stu-leader__row-rank ${r.me ? 'stu-leader__row-rank--me' : ''}`}>{r.rank}</div>
								<div className="stu-leader__row-avatar" />
								<div className="stu-leader__row-info">
									<div className={`stu-leader__row-name ${r.me ? 'stu-leader__row-name--me' : ''}`}>{r.name}</div>
									<div className={`stu-leader__row-level ${r.me ? 'stu-leader__row-level--me' : ''}`}>Level {r.level}</div>
								</div>
								<div className="stu-leader__row-week">{r.week}</div>
								<div className={`stu-leader__row-xp ${r.me ? 'stu-leader__row-xp--me' : ''}`}>{r.xp}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default Leaderboard;
