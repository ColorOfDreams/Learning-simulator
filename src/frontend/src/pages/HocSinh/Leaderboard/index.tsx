import { getLeaderboard } from '@/services/base/api';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import StudentLayout from '../components/StudentLayout';
import './index.less';

const TABS = ['Toàn trường'];

const Leaderboard: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [players, setPlayers] = useState<any[]>([]);
	const { initialState } = useModel('@@initialState');
	const currentUserId = (initialState?.currentUser as any)?.id;

	useEffect(() => {
		getLeaderboard(10).then(res => {
			const data = res.data?.data ?? res.data ?? [];
			setPlayers(Array.isArray(data) ? data : []);
		}).catch(() => {});
	}, []);

	const getInitials = (p: any) =>
		[(p.firstName?.[0] ?? ''), (p.lastName?.[0] ?? '')].join('').toUpperCase() || '?';
	const getDisplayName = (p: any) =>
		[p.firstName, p.lastName].filter(Boolean).join(' ') || 'Học sinh';

	const podiumOrder = players.length >= 3
		? [players[1], players[0], players[2]]
		: players;
	const rows = players.slice(3);

	return (
		<StudentLayout>
			<div className='stu-leader scl'>
				<div className='stu-leader__inner'>
					{/* Header */}
					<div className='stu-leader__header'>
						<div>
							<div className='stu-leader__title'>Bảng xếp hạng</div>
							<div className='stu-leader__subtitle'>
								<span className='stu-leader__live-dot' />
								Mùa giải kết thúc sau <strong style={{ color: '#5a5852' }}>4 ngày</strong> · tiếp tục thăng hạng
							</div>
						</div>
						<div className='stu-leader__tabs'>
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
					<div className='stu-leader__podium-wrapper'>
						{/* Glow backgrounds */}
						<div className='stu-leader__glow-top' />
						<div className='stu-leader__glow-right' />
						<div className='stu-leader__glow-left' />

						{/* Sparkling lights */}
						<div className='stu-leader__spark stu-leader__spark--1' />
						<div className='stu-leader__spark stu-leader__spark--2' />
						<div className='stu-leader__spark stu-leader__spark--3' />

						<div className='stu-leader__podium'>
							{podiumOrder.map((p, idx) => {
								const realRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
								const heights = [96, 140, 76];
								const borderColors = ['oklch(0.78 0.02 250)', 'oklch(0.8 0.14 85)', 'oklch(0.65 0.11 55)'];
								const badgeBgs = ['oklch(0.78 0.02 250)', 'oklch(0.8 0.14 85)', 'oklch(0.65 0.11 55)'];
								return (
									<div
										key={p.id}
										className={`stu-leader__podium-col stu-leader__podium-col--r${realRank}`}
										style={{ animationDelay: `${0.15 + (3 - realRank) * 0.15}s` }}
									>
										{realRank === 1 && <div className='stu-leader__crown-emoji'>👑</div>}
										<div className='stu-leader__podium-avatar-wrap'>
											<div
												className='stu-leader__podium-avatar'
												style={{ border: `3px solid ${borderColors[idx]}`, boxShadow: `0 6px 18px -6px ${borderColors[idx]} / 0.8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', background: '#5a5852' }}
											>
												{p.picture
													? <img src={p.picture} alt='' style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
													: getInitials(p)}
											</div>
											<div className='stu-leader__podium-badge' style={{ background: badgeBgs[idx] }}>{realRank}</div>
										</div>
										<div className={`stu-leader__podium-name ${realRank === 1 ? 'stu-leader__podium-name--bold' : ''}`}>
											{getDisplayName(p)}
										</div>
										<div className='stu-leader__podium-xp'>{(p.xp ?? 0).toLocaleString('vi-VN')} XP</div>
										<div className={`stu-leader__podium-bar stu-leader__podium-bar--r${realRank}`} style={{ height: `${heights[idx]}px` }}>
											<span>{realRank}</span>
											{realRank === 1 && <div className='stu-leader__podium-shine' />}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Ranked Rows */}
					<div className='stu-leader__rows'>
						{rows.map((r, idx) => {
							const rank = idx + 4;
							const isMe = r.id === currentUserId;
							return (
								<div
									key={r.id}
									className={`stu-leader__row ${isMe ? 'stu-leader__row--me' : ''}`}
									style={{ animationDelay: `${(idx * 0.08).toFixed(2)}s` }}
								>
									<div className={`stu-leader__row-rank ${isMe ? 'stu-leader__row-rank--me' : ''}`}>{rank}</div>
									<div className='stu-leader__row-avatar' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: '#ccc', borderRadius: '50%', color: '#fff' }}>
										{r.picture ? <img src={r.picture} alt='' style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(r)}
									</div>
									<div className='stu-leader__row-info'>
										<div className={`stu-leader__row-name ${isMe ? 'stu-leader__row-name--me' : ''}`}>{isMe ? `${getDisplayName(r)} (Bạn)` : getDisplayName(r)}</div>
										<div className={`stu-leader__row-level ${isMe ? 'stu-leader__row-level--me' : ''}`}>Level {r.level ?? 1}</div>
									</div>
									<div className='stu-leader__row-week' />
									<div className={`stu-leader__row-xp ${isMe ? 'stu-leader__row-xp--me' : ''}`}>{(r.xp ?? 0).toLocaleString('vi-VN')} XP</div>
								</div>
							);
						})}
						{players.length === 0 && (
							<div style={{ textAlign: 'center', padding: '32px', color: '#888' }}>Chưa có dữ liệu xếp hạng.</div>
						)}
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default Leaderboard;
