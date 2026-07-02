import { getLeaderboard, getMyLabs, getUserStats } from '@/services/base/api';
import React, { useEffect, useMemo, useState } from 'react';
import { history, useModel } from 'umi';
import StudentLayout from '../components/StudentLayout';
import './index.less';

const SUBJECT_LABEL: Record<string, string> = { chem: 'Hóa học', math: 'Toán học', physics: 'Vật lý' };
const SUBJECT_CLASS: Record<string, string> = { chem: 'chem', math: 'math', physics: 'physics' };

function timeAgo(dateStr: string): string {
	if (!dateStr) return '';
	const diff = Date.now() - new Date(dateStr).getTime();
	const days = Math.floor(diff / 86400000);
	if (days === 0) return 'Hôm nay';
	if (days === 1) return 'Hôm qua';
	return `${days} ngày trước`;
}

const HocSinhProfile: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;
	const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Học sinh';
	const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'HS';

	const [stats, setStats] = useState<any>(null);
	const [labs, setLabs] = useState<{ inProgress: any[]; completed: any[] }>({ inProgress: [], completed: [] });
	const [leaderboard, setLeaderboard] = useState<any[]>([]);

	useEffect(() => {
		getUserStats().then((res: any) => setStats(res?.data ?? res)).catch(() => {});
		getMyLabs().then((res: any) => setLabs(res?.data ?? res)).catch(() => {});
		getLeaderboard(100).then((res: any) => setLeaderboard(res?.data ?? res ?? [])).catch(() => {});
	}, []);

	const rank = useMemo(() => {
		if (!leaderboard.length || !user?.id) return 0;
		const idx = leaderboard.findIndex((u: any) => u.id === user.id);
		return idx >= 0 ? idx + 1 : 0;
	}, [leaderboard, user?.id]);

	const avgScore = (subject: string) => {
		const items = labs.completed.filter((l: any) => l.subject === subject && l.score != null);
		if (!items.length) return 0;
		return Math.round(items.reduce((s: number, l: any) => s + l.score, 0) / items.length);
	};

	const subjectScores = useMemo(() => [
		{ key: 'chem', label: 'Hóa học', pct: avgScore('chem') },
		{ key: 'math', label: 'Toán học', pct: avgScore('math') },
		{ key: 'physics', label: 'Vật lý', pct: avgScore('physics') },
	], [labs.completed]);

	const recentActivities = useMemo(() =>
		[...labs.completed]
			.filter((l: any) => l.completedAt)
			.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
			.slice(0, 4),
		[labs.completed]
	);

	const badges = useMemo(() => [
		{ key: 'first', label: 'Hoàn thành đầu tiên', earned: labs.completed.length >= 1, colorClass: 'chem' },
		{ key: 'streak5', label: 'Chuỗi 5 ngày', earned: (stats?.maxStreak ?? 0) >= 5, colorClass: 'streak' },
		{ key: 'five', label: 'Chinh phục 5 bài', earned: labs.completed.length >= 5, colorClass: 'learner' },
		{ key: 'scientist', label: 'Nhà khoa học tập sự', earned: (stats?.level ?? 1) >= 7, colorClass: 'rank' },
	], [labs.completed, stats]);

	const handleBack = () => history.push('/hoc-sinh');
	const handleViewProgress = () => history.push('/hoc-sinh/progress');
	const handleGoLeaderboard = () => history.push('/hoc-sinh/leaderboard');

	const labsFooter = useMemo(() => {
		const subjects = labs.completed.map((l: any) => l.subject).filter(Boolean);
		const unique = [...new Set(subjects)];
		if (unique.length === 0) return 'Chưa có bài nào';
		if (unique.length === 1) return `Môn ${SUBJECT_LABEL[unique[0]] ?? unique[0]}`;
		return `Trên ${unique.length} môn học`;
	}, [labs.completed]);

	return (
		<StudentLayout>
			<div className='stu-profile'>
				{/* COVER BANNER */}
				<div className='stu-profile__cover'>
					<div className='stu-profile__cover-glow1' />
					<div className='stu-profile__cover-glow2' />
					<div className='stu-profile__cover-glow3' />
					<div className='stu-profile__cover-grid' />
					<div className='stu-profile__cover-back' onClick={handleBack}>
						<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='#cfccdd' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M15 6l-6 6 6 6' />
						</svg>
						Quay lại trang chủ
					</div>
				</div>

				<div className='stu-profile__container'>
					{/* AVATAR + IDENTITY */}
					<div className='stu-profile__identity'>
						<div className='stu-profile__user-box'>
							<div className='stu-profile__avatar-wrapper'>
								{user?.picture ? (
									<img src={user.picture} alt={fullName} className='stu-profile__avatar' style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }} />
								) : (
									<div className='stu-profile__avatar'>{initials}</div>
								)}
								<div className='stu-profile__level-badge'>{stats?.level ?? user?.level ?? 1}</div>
							</div>
							<div className='stu-profile__name-wrapper'>
								<div className='stu-profile__name'>{fullName}</div>
								<div className='stu-profile__meta-list'>
									<span className='stu-profile__username'>{user?.email ? `@${user.email.split('@')[0]}` : ''}</span>
									<span className='stu-profile__role-tag'>{stats?.levelTitle ?? 'Học sinh mới'}</span>
									<span className='stu-profile__school-tag'>Lớp {user?.grade ?? 11}</span>
								</div>
							</div>
						</div>
						<div className='stu-profile__actions'>
							<div className='stu-profile__btn stu-profile__btn--secondary' onClick={handleViewProgress}>
								<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M4 20V4M4 20h16M8 17v-5M12 17V8M16 17v-7' />
								</svg>
								Xem tiến trình
							</div>
							<div className='stu-profile__btn stu-profile__btn--primary'>
								<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' />
								</svg>
								Chỉnh sửa thông tin
							</div>
						</div>
					</div>

					{/* STAT TILES */}
					<div className='stu-profile__stats'>
						<div className='stu-profile__stat-card stu-profile__stat-card--xp'>
							<div className='stu-profile__stat-card-icon stu-profile__stat-card-icon--xp'>
								<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M13 3 5 13h6l-1 8 8-10h-6l1-8Z' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>{(stats?.xp ?? user?.xp ?? 0).toLocaleString()}</div>
								<div className='stu-profile__stat-card-label'>Tổng XP</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--xp'>
								{stats ? `Còn ${stats.xpToNextLevel ?? 0} XP lên level ${(stats.level ?? 1) + 1}` : '—'}
							</div>
						</div>

						<div className='stu-profile__stat-card stu-profile__stat-card--streak'>
							<div className='stu-profile__stat-card-icon stu-profile__stat-card-icon--streak'>
								<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M12 2c1.5 3-1.5 5 0 8 1 2 4 2 4 5a4 4 0 0 1-8 0c0-2 1-3 1-4-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-6-6-6-14Z' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>{stats?.streak ?? user?.streak ?? 0}</div>
								<div className='stu-profile__stat-card-label'>Ngày liên tiếp</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--streak'>Kỷ lục {stats?.maxStreak ?? 0} ngày</div>
						</div>

						<div className='stu-profile__stat-card stu-profile__stat-card--labs'>
							<div className='stu-profile__stat-card-icon stu-profile__stat-card-icon--labs'>
								<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>{labs.completed.length}</div>
								<div className='stu-profile__stat-card-label'>Đã hoàn thành</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--labs'>{labsFooter}</div>
						</div>

						<div className='stu-profile__stat-card stu-profile__stat-card--rank'>
							<div className='stu-profile__stat-card-icon stu-profile__stat-card-icon--rank'>
								<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round'>
									<path d='M7 4h10v3.5a5 5 0 0 1-10 0V4ZM9.5 20h5M12 16v4' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>{rank > 0 ? `#${rank}` : '—'}</div>
								<div className='stu-profile__stat-card-label'>Hạng trong lớp</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--rank'>
								{rank > 0 ? `Top ${Math.round((rank / Math.max(leaderboard.length, 1)) * 100)}%` : 'Chưa có dữ liệu'}
							</div>
						</div>
					</div>

					{/* TWO COLUMNS */}
					<div className='stu-profile__columns'>
						<div className='stu-profile__col-left'>
							<div className='stu-profile__section-card'>
								<div className='stu-profile__section-title'>Giới thiệu</div>
								<div className='stu-profile__bio'>
									{fullName} — học sinh lớp {user?.grade ?? 11}, đang chinh phục các bài thí nghiệm khoa học tương tác. Hãy tiếp tục duy trì chuỗi học tập và leo lên top bảng xếp hạng!
								</div>
							</div>

							<div className='stu-profile__section-card'>
								<div className='stu-profile__subjects-header'>
									<span>Môn học</span>
									<span>điểm trung bình</span>
								</div>
								<div className='stu-profile__subjects-list'>
									{subjectScores.map(({ key, label, pct }) => (
										<div key={key} className='stu-profile__subject-item'>
											<div className='stu-profile__subject-info'>
												<span>{label}</span>
												<span>{pct > 0 ? `${pct}%` : '—'}</span>
											</div>
											<div className='stu-profile__subject-track'>
												<div
													className={`stu-profile__subject-fill stu-profile__subject-fill--${SUBJECT_CLASS[key]}`}
													style={{ width: `${pct}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className='stu-profile__col-right'>
							<div className='stu-profile__section-card'>
								<div className='stu-profile__achievements-header'>
									<span>Thành tích ({badges.filter(b => b.earned).length}/{badges.length} đã đạt)</span>
									<span onClick={handleGoLeaderboard} style={{ fontSize: '11.5px', color: 'oklch(0.5 0.16 264)', fontWeight: 700, cursor: 'pointer' }}>
										Xếp hạng
									</span>
								</div>
								<div className='stu-profile__achievements-grid'>
									{badges.map((b, i) => (
										<div
											key={b.key}
											className='stu-profile__achievement-badge'
											style={{ animationDelay: `${0.5 + i * 0.08}s`, opacity: b.earned ? 1 : 0.35, filter: b.earned ? 'none' : 'grayscale(1)' }}
											title={b.earned ? 'Đã đạt được' : 'Chưa đạt'}
										>
											<div className={`stu-profile__achievement-badge-icon stu-profile__achievement-badge-icon--${b.colorClass}`}>
												{b.key === 'first' && <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' /></svg>}
												{b.key === 'streak5' && <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M12 2c1.5 3-1.5 5 0 8 1 2 4 2 4 5a4 4 0 0 1-8 0c0-2 1-3 1-4-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-6-6-6-14Z' /></svg>}
												{b.key === 'five' && <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M13 3 5 13h6l-1 8 8-10h-6l1-8Z' /></svg>}
												{b.key === 'scientist' && <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M7 4h10v3.5a5 5 0 0 1-10 0V4ZM9.5 20h5M12 16v4' /></svg>}
											</div>
											<span className='stu-profile__achievement-badge-title'>{b.label}</span>
										</div>
									))}
								</div>
							</div>

							<div className='stu-profile__section-card' style={{ animationDelay: '0.42s' }}>
								<div className='stu-profile__section-title' style={{ marginBottom: '18px' }}>
									Hoạt động gần đây
								</div>
								<div className='stu-profile__activity-list'>
									{recentActivities.length === 0 ? (
										<div style={{ color: '#9a9590', fontSize: 13, padding: '8px 0' }}>Chưa có hoạt động nào. Hãy bắt đầu học!</div>
									) : (
										recentActivities.map((lab: any, i: number) => {
											const subj = lab.subject ?? 'chem';
											const isLast = i === recentActivities.length - 1;
											return (
												<div key={lab.id ?? i} className='stu-profile__activity-item' style={{ animationDelay: `${0.5 + i * 0.08}s` }}>
													<div className='stu-profile__activity-timeline'>
														<div className={`stu-profile__activity-icon-wrapper stu-profile__activity-icon-wrapper--${SUBJECT_CLASS[subj] ?? 'chem'}`}>
															<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
																<path d='M20 6 9 17l-5-5' />
															</svg>
														</div>
														{!isLast && <div className='stu-profile__activity-line' />}
													</div>
													<div className={`stu-profile__activity-content${isLast ? ' stu-profile__activity-content--last' : ''}`}>
														<div className='stu-profile__activity-title'>
															{lab.simulationTitle ?? `Hoàn thành bài ${SUBJECT_LABEL[subj] ?? 'thí nghiệm'}`}
														</div>
														<div className='stu-profile__activity-meta'>
															{lab.score != null ? `Đạt ${lab.score}% · ` : ''}
															{timeAgo(lab.completedAt)}
														</div>
													</div>
												</div>
											);
										})
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default HocSinhProfile;
