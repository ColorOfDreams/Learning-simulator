import React from 'react';
import { history, useModel } from 'umi';
import StudentLayout from '../components/StudentLayout';
import './index.less';

const HocSinhProfile: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;
	const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Học sinh';
	const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'HS';

	const handleBack = () => {
		history.push('/hoc-sinh');
	};

	const handleViewProgress = () => {
		history.push('/hoc-sinh/progress');
	};

	const handleGoLeaderboard = () => {
		history.push('/hoc-sinh/leaderboard');
	};

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
						<svg
							width='15'
							height='15'
							viewBox='0 0 24 24'
							fill='none'
							stroke='#cfccdd'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
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
									<img
										src={user.picture}
										alt={fullName}
										className='stu-profile__avatar'
										style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
									/>
								) : (
									<div className='stu-profile__avatar'>{initials}</div>
								)}
								<div className='stu-profile__level-badge'>{user?.level ?? 1}</div>
							</div>
							<div className='stu-profile__name-wrapper'>
								<div className='stu-profile__name'>{fullName}</div>
								<div className='stu-profile__meta-list'>
									<span className='stu-profile__username'>{user?.email ? `@${user.email.split('@')[0]}` : ''}</span>
									<span className='stu-profile__role-tag'>Nhà khoa học tập sự</span>
									<span className='stu-profile__school-tag'>Lớp {user?.grade ?? 11}</span>
								</div>
							</div>
						</div>
						<div className='stu-profile__actions'>
							<div className='stu-profile__btn stu-profile__btn--secondary' onClick={handleViewProgress}>
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M4 20V4M4 20h16M8 17v-5M12 17V8M16 17v-7' />
								</svg>
								Xem tiến trình
							</div>
							<div className='stu-profile__btn stu-profile__btn--primary'>
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='#fff'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
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
								<svg
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='1.9'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M13 3 5 13h6l-1 8 8-10h-6l1-8Z' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>1,240</div>
								<div className='stu-profile__stat-card-label'>Tổng XP</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--xp'>+180 tuần này</div>
						</div>

						<div className='stu-profile__stat-card stu-profile__stat-card--streak'>
							<div className='stu-profile__stat-card-icon stu-profile__stat-card-icon--streak'>
								<svg
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='1.9'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M12 2c1.5 3-1.5 5 0 8 1 2 4 2 4 5a4 4 0 0 1-8 0c0-2 1-3 1-4-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-6-6-6-14Z' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>5</div>
								<div className='stu-profile__stat-card-label'>Ngày liên tiếp</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--streak'>Kỷ lục 9 ngày</div>
						</div>

						<div className='stu-profile__stat-card stu-profile__stat-card--labs'>
							<div className='stu-profile__stat-card-icon stu-profile__stat-card-icon--labs'>
								<svg
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='1.9'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>18</div>
								<div className='stu-profile__stat-card-label'>Đã hoàn thành</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--labs'>Trên cả 3 môn</div>
						</div>

						<div className='stu-profile__stat-card stu-profile__stat-card--rank'>
							<div className='stu-profile__stat-card-icon stu-profile__stat-card-icon--rank'>
								<svg
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='1.9'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M7 4h10v3.5a5 5 0 0 1-10 0V4ZM9.5 20h5M12 16v4' />
								</svg>
							</div>
							<div>
								<div className='stu-profile__stat-card-val'>#4</div>
								<div className='stu-profile__stat-card-label'>Hạng trong lớp</div>
							</div>
							<div className='stu-profile__stat-card-footer stu-profile__stat-card-footer--rank'>Tăng 2 bậc</div>
						</div>
					</div>

					{/* TWO COLUMNS */}
					<div className='stu-profile__columns'>
						<div className='stu-profile__col-left'>
							<div className='stu-profile__section-card'>
								<div className='stu-profile__section-title'>Giới thiệu</div>
								<div className='stu-profile__bio'>
									Học sinh lớp 11 năng động, yêu thích việc biến các bài toán thí nghiệm phức tạp thành các mô phỏng
									trực quan. Hiện đang tập trung vào phần chuẩn độ hóa học và cố gắng duy trì chuỗi học tập 10 ngày. Kỹ
									sư hóa học tương lai (có thể).
								</div>
							</div>

							<div className='stu-profile__section-card'>
								<div className='stu-profile__subjects-header'>
									<span>Môn học yêu thích</span>
									<span>mức độ thuần thục</span>
								</div>
								<div className='stu-profile__subjects-list'>
									<div className='stu-profile__subject-item'>
										<div className='stu-profile__subject-info'>
											<span>Hóa học</span>
											<span>84%</span>
										</div>
										<div className='stu-profile__subject-track'>
											<div
												className='stu-profile__subject-fill stu-profile__subject-fill--chem'
												style={{ width: '84%' }}
											/>
										</div>
									</div>

									<div className='stu-profile__subject-item'>
										<div className='stu-profile__subject-info'>
											<span>Toán học</span>
											<span>72%</span>
										</div>
										<div className='stu-profile__subject-track'>
											<div
												className='stu-profile__subject-fill stu-profile__subject-fill--math'
												style={{ width: '72%' }}
											/>
										</div>
									</div>

									<div className='stu-profile__subject-item'>
										<div className='stu-profile__subject-info'>
											<span>Vật lý</span>
											<span>60%</span>
										</div>
										<div className='stu-profile__subject-track'>
											<div
												className='stu-profile__subject-fill stu-profile__subject-fill--physics'
												style={{ width: '60%' }}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className='stu-profile__col-right'>
							<div className='stu-profile__section-card'>
								<div className='stu-profile__achievements-header'>
									<span>Thành tích</span>
									<span
										onClick={handleGoLeaderboard}
										style={{ fontSize: '11.5px', color: 'oklch(0.5 0.16 264)', fontWeight: 700, cursor: 'pointer' }}
									>
										Xem tất cả
									</span>
								</div>
								<div className='stu-profile__achievements-grid'>
									<div className='stu-profile__achievement-badge' style={{ animationDelay: '0.5s' }}>
										<div className='stu-profile__achievement-badge-icon stu-profile__achievement-badge-icon--chem'>
											<svg
												width='24'
												height='24'
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
										<span className='stu-profile__achievement-badge-title'>Chuẩn độ đầu tiên</span>
									</div>

									<div className='stu-profile__achievement-badge' style={{ animationDelay: '0.58s' }}>
										<div className='stu-profile__achievement-badge-icon stu-profile__achievement-badge-icon--streak'>
											<svg
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='1.8'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M12 2c1.5 3-1.5 5 0 8 1 2 4 2 4 5a4 4 0 0 1-8 0c0-2 1-3 1-4-2 1-3 3-3 5a6 6 0 0 0 12 0c0-5-6-6-6-14Z' />
											</svg>
										</div>
										<span className='stu-profile__achievement-badge-title'>Chuỗi 5 ngày</span>
									</div>

									<div className='stu-profile__achievement-badge' style={{ animationDelay: '0.66s' }}>
										<div className='stu-profile__achievement-badge-icon stu-profile__achievement-badge-icon--learner'>
											<svg
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='1.8'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M13 3 5 13h6l-1 8 8-10h-6l1-8Z' />
											</svg>
										</div>
										<span className='stu-profile__achievement-badge-title'>Học nhanh</span>
									</div>

									<div className='stu-profile__achievement-badge' style={{ animationDelay: '0.74s' }}>
										<div className='stu-profile__achievement-badge-icon stu-profile__achievement-badge-icon--rank'>
											<svg
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='1.8'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M7 4h10v3.5a5 5 0 0 1-10 0V4ZM9.5 20h5M12 16v4' />
											</svg>
										</div>
										<span className='stu-profile__achievement-badge-title'>Top 5 lớp</span>
									</div>
								</div>
							</div>

							<div className='stu-profile__section-card' style={{ animationDelay: '0.42s' }}>
								<div className='stu-profile__section-title' style={{ marginBottom: '18px' }}>
									Hoạt động gần đây
								</div>
								<div className='stu-profile__activity-list'>
									<div className='stu-profile__activity-item' style={{ animationDelay: '0.5s' }}>
										<div className='stu-profile__activity-timeline'>
											<div className='stu-profile__activity-icon-wrapper stu-profile__activity-icon-wrapper--chem'>
												<svg
													width='16'
													height='16'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<path d='M20 6 9 17l-5-5' />
												</svg>
											</div>
											<div className='stu-profile__activity-line' />
										</div>
										<div className='stu-profile__activity-content'>
											<div className='stu-profile__activity-title'>Hoàn thành bài Hóa học chuẩn độ</div>
											<div className='stu-profile__activity-meta'>Đạt 92% · +60 XP · 2 ngày trước</div>
										</div>
									</div>

									<div className='stu-profile__activity-item' style={{ animationDelay: '0.58s' }}>
										<div className='stu-profile__activity-timeline'>
											<div className='stu-profile__activity-icon-wrapper stu-profile__activity-icon-wrapper--learner'>
												<svg
													width='16'
													height='16'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<path d='M13 3 5 13h6l-1 8 8-10h-6l1-8Z' />
												</svg>
											</div>
											<div className='stu-profile__activity-line' />
										</div>
										<div className='stu-profile__activity-content'>
											<div className='stu-profile__activity-title'>Nhận huy hiệu "Học nhanh"</div>
											<div className='stu-profile__activity-meta'>4 ngày trước</div>
										</div>
									</div>

									<div className='stu-profile__activity-item' style={{ animationDelay: '0.66s' }}>
										<div className='stu-profile__activity-timeline'>
											<div className='stu-profile__activity-icon-wrapper stu-profile__activity-icon-wrapper--level'>
												<svg
													width='16'
													height='16'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<path d='M12 2 15 9l7 .5-5.5 4.5L18.5 21 12 17l-6.5 4 1.9-7L2 9.5 9 9Z' />
												</svg>
											</div>
											<div className='stu-profile__activity-line' />
										</div>
										<div className='stu-profile__activity-content'>
											<div className='stu-profile__activity-title'>Đạt cấp độ Level 7</div>
											<div className='stu-profile__activity-meta'>6 ngày trước</div>
										</div>
									</div>

									<div className='stu-profile__activity-item' style={{ animationDelay: '0.74s' }}>
										<div className='stu-profile__activity-timeline'>
											<div className='stu-profile__activity-icon-wrapper stu-profile__activity-icon-wrapper--physics'>
												<svg
													width='16'
													height='16'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<path d='M4 20c6 0 12-6 16-16M14 4h6v6' />
												</svg>
											</div>
										</div>
										<div className='stu-profile__activity-content stu-profile__activity-content--last'>
											<div className='stu-profile__activity-title'>Bắt đầu bài thí nghiệm Chuyển động ném xiên</div>
											<div className='stu-profile__activity-meta'>6 ngày trước</div>
										</div>
									</div>
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
