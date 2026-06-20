import React, { useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import './index.less';

// ── Data ──
const TABS = ['Lớp tôi', 'Khối 11', 'Toàn cầu'];

const PODIUM = [
	{ rank: 2, name: 'Mai L.', xp: '2.980 XP' },
	{ rank: 1, name: 'Sơn O.', xp: '3.420 XP' },
	{ rank: 3, name: 'Ravi P.', xp: '2.610 XP' },
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
						<div className="stu-leader__title">Bảng xếp hạng</div>
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

					{/* Podium */}
					<div className="stu-leader__podium">
						{PODIUM.map((p) => (
							<div key={p.rank} className={`stu-leader__podium-col stu-leader__podium-col--r${p.rank}`}>
								{p.rank === 1 && (
									<svg className="stu-leader__crown" width="26" height="26" viewBox="0 0 24 24" fill="oklch(0.78 0.13 85)" stroke="oklch(0.62 0.13 70)" strokeWidth="1.2">
										<path d="M5 18 3 7l5 4 4-7 4 7 5-4-2 11Z" />
									</svg>
								)}
								<div className={`stu-leader__podium-avatar ${p.rank === 1 ? 'stu-leader__podium-avatar--gold' : ''}`} />
								<div className={`stu-leader__podium-name ${p.rank === 1 ? 'stu-leader__podium-name--bold' : ''}`}>{p.name}</div>
								<div className="stu-leader__podium-xp">{p.xp}</div>
								<div className={`stu-leader__podium-bar stu-leader__podium-bar--r${p.rank}`}>
									{p.rank}
								</div>
							</div>
						))}
					</div>

					{/* Ranked Rows */}
					<div className="stu-leader__rows">
						{ROWS.map((r) => (
							<div key={r.rank} className={`stu-leader__row ${r.me ? 'stu-leader__row--me' : ''}`}>
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
