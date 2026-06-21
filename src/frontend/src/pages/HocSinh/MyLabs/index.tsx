import React, { useState } from 'react';
import { history } from 'umi';
import StudentLayout from '../components/StudentLayout';
import './index.less';

// ── Mock Data ──
const IN_PROGRESS = [
	{ id: 1, title: 'Điều chế ethyl acetate (phản ứng ester hóa)', subject: 'chem', progress: 60, lastOpened: '2 ngày trước' },
	{ id: 2, title: 'Chuyển động ném xiên', subject: 'physics', progress: 25, lastOpened: '5 ngày trước' },
];

const COMPLETED = [
	{ id: 3, title: 'Thử nghiệm ngọn lửa', subject: 'chem', score: 92 },
	{ id: 4, title: 'Định luật Ohm', subject: 'physics', score: 88 },
	{ id: 5, title: 'Phương trình bậc nhất', subject: 'math', score: 74 },
];

const SUBJECT_MAP: Record<string, { label: string; className: string }> = {
	physics: { label: 'Vật lý', className: 'physics' },
	math: { label: 'Toán', className: 'math' },
	chem: { label: 'Hóa học', className: 'chem' },
};

const getSubjectIcon = (subject: string, id: number) => {
	const iconStyle = {
		animation: 'labFloat 4s ease-in-out infinite',
		animationDelay: `${id * 0.2}s`,
		opacity: 0.88,
	};

	if (subject === 'chem') {
		return (
			<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
				<path d="M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3" />
				<path d="M8 14h8" />
			</svg>
		);
	}
	if (subject === 'physics') {
		return (
			<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
				<circle cx="12" cy="12" r="2" />
				<path d="M12 4c5 0 9 3.6 9 8s-4 8-9 8-9-3.6-9-8 4-8 9-8Z" transform="rotate(60 12 12)" />
				<path d="M12 4c5 0 9 3.6 9 8s-4 8-9 8-9-3.6-9-8 4-8 9-8Z" transform="rotate(-60 12 12)" />
			</svg>
		);
	}
	return (
		<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
			<path d="M3 20c4 0 5-14 9-14M3 20h6M14 9l6 6M20 9l-6 6" />
		</svg>
	);
};

const TABS = ['Đang làm', 'Hoàn thành', 'Đã lưu'];

const MyLabs: React.FC = () => {
	const [activeTab, setActiveTab] = useState(0);

	const openWorkspace = (subject: string) => {
		history.push(`/hoc-sinh/workspace?subject=${subject}`);
	};

	return (
		<StudentLayout>
			<div className="stu-labs scl">
				<div className="stu-labs__inner">
					{/* Header */}
					<div className="stu-labs__header">
						<div>
							<div className="stu-labs__title">Phòng thí nghiệm của tôi</div>
							<div className="stu-labs__subtitle">
								<strong style={{ color: '#5a5852' }}>2</strong> đang làm · <strong style={{ color: '#5a5852' }}>3</strong> đã hoàn thành học kỳ này
							</div>
						</div>
						<div className="stu-labs__tabs">
							{TABS.map((tab, i) => (
								<div
									key={tab}
									className={`stu-labs__tab ${activeTab === i ? 'stu-labs__tab--active' : ''}`}
									onClick={() => setActiveTab(i)}
								>
									{tab}
								</div>
							))}
						</div>
					</div>

					{/* In Progress */}
					{activeTab === 0 && (
						<div className="stu-labs__list">
							{IN_PROGRESS.map((lab, idx) => {
								const subj = SUBJECT_MAP[lab.subject];
								return (
									<div
										key={lab.id}
										className="stu-labs__progress-card"
										style={{ animationDelay: `${idx * 0.08}s` }}
										onClick={() => openWorkspace(lab.subject)}
									>
										<div className={`stu-labs__progress-thumb stu-labs__progress-thumb--${subj.className}`}>
											{getSubjectIcon(lab.subject, lab.id)}
											<div className="stu-labs__card-shine" style={{ animationDelay: `${lab.id * 0.3}s` }} />
											<div className="stu-labs__resume-badge">TIẾP TỤC</div>
										</div>
										<div className="stu-labs__progress-info">
											<div className="stu-labs__progress-top">
												<span className="stu-labs__progress-name">{lab.title}</span>
												<span className={`stu-labs__progress-badge stu-labs__progress-badge--${subj.className}`}>
													{subj.label}
												</span>
											</div>
											<div className="stu-labs__progress-bar-row">
												<div className="stu-labs__progress-bar">
													<div className="stu-labs__progress-fill" style={{ width: `${lab.progress}%` }} />
												</div>
												<span className="stu-labs__progress-pct">{lab.progress}% hoàn thành</span>
											</div>
										</div>
										<div className="stu-labs__progress-action">
											<div className="stu-labs__continue-btn">
												Tiếp tục
												<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
													<path d="M5 12h14M13 6l6 6-6 6" />
												</svg>
											</div>
											<span className="stu-labs__last-opened">mở {lab.lastOpened}</span>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{/* Completed */}
					{(activeTab === 0 || activeTab === 1) && (
						<>
							{activeTab === 0 && (
								<div className="stu-labs__section-label">Đã hoàn thành</div>
							)}
							<div className="stu-labs__completed-grid">
								{COMPLETED.map((lab, idx) => {
									const subj = SUBJECT_MAP[lab.subject];
									return (
										<div
											key={lab.id}
											className="stu-labs__completed-card"
											style={{ animationDelay: `${idx * 0.08}s` }}
										>
											<div className={`stu-labs__completed-thumb stu-labs__completed-thumb--${subj.className}`}>
												{getSubjectIcon(lab.subject, lab.id)}
												<div className="stu-labs__card-shine" style={{ animationDelay: `${lab.id * 0.35}s` }} />
												<div className="stu-labs__completed-score-badge">
													<svg width="11" height="11" viewBox="0 0 24 24" fill="oklch(0.5 0.16 150)">
														<path d="M12 2 15 9l7 .5-5.5 4.5L18.5 21 12 17l-6.5 4 1.9-7L2 9.5 9 9Z" />
													</svg>
													{lab.score}%
												</div>
											</div>
											<div className="stu-labs__completed-footer">
												<div className="stu-labs__completed-info">
													<div className="stu-labs__completed-name">{lab.title}</div>
													<div className="stu-labs__completed-xp">+60 XP đã nhận</div>
												</div>
												<span className="stu-labs__completed-replay" onClick={() => openWorkspace(lab.subject)}>
													<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" />
													</svg>
													Xem lại
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</>
					)}

					{/* Saved placeholder */}
					{activeTab === 2 && (
						<div className="stu-labs__empty">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0bdb4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
								<path d="M7 4h10v16l-5-3.2L7 20V4Z" />
							</svg>
							<p>Chưa có thí nghiệm nào được lưu</p>
						</div>
					)}
				</div>
			</div>
		</StudentLayout>
	);
};

export default MyLabs;
