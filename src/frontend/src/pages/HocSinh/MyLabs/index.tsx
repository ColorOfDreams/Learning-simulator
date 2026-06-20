import React, { useState } from 'react';
import { history } from 'umi';
import StudentLayout from '../components/StudentLayout';
import './index.less';

// ── Mock Data ──
const IN_PROGRESS = [
	{ id: 1, title: 'Chuẩn độ Axit-Bazơ', subject: 'chem', progress: 60, lastOpened: '2 ngày trước' },
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
						<div className="stu-labs__title">Phòng thí nghiệm</div>
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
							{IN_PROGRESS.map((lab) => {
								const subj = SUBJECT_MAP[lab.subject];
								return (
									<div key={lab.id} className="stu-labs__progress-card" onClick={() => openWorkspace(lab.subject)}>
										<div className={`stu-labs__progress-thumb stu-labs__progress-thumb--${subj.className}`} />
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
											<div className="stu-labs__continue-btn">Tiếp tục</div>
											<span className="stu-labs__last-opened">{lab.lastOpened}</span>
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
								{COMPLETED.map((lab) => {
									const subj = SUBJECT_MAP[lab.subject];
									const scoreColor = lab.score >= 80 ? 'good' : 'ok';
									return (
										<div key={lab.id} className="stu-labs__completed-card">
											<div className={`stu-labs__completed-thumb stu-labs__completed-thumb--${subj.className}`}>
												<div className={`stu-labs__completed-score stu-labs__completed-score--${scoreColor}`}>
													{lab.score}%
												</div>
											</div>
											<div className="stu-labs__completed-footer">
												<div className="stu-labs__completed-name">{lab.title}</div>
												<span className="stu-labs__completed-replay" onClick={() => openWorkspace(lab.subject)}>
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
