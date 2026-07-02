import PageCard from '@/components/PageCard';
import { getClassById } from '@/services/classrooms/api';
import { BookOutlined } from '@ant-design/icons';
import { history, useModel, useParams } from '@umijs/max';
import { Button, Card, Empty, Space, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import './StudentClassDetails.less';

const { Title, Text } = Typography;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const StudentClassDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;

	const [cls, setCls] = useState<ClassroomsAPI.ClassInfo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (id) {
			getClassById(id)
				.then((res) => {
					setCls(res.data?.data || res.data);
				})
				.finally(() => setLoading(false));
		}
	}, [id]);

	const handleDoAssignment = (assignment: ClassroomsAPI.ClassAssignment) => {
		// Determine target URL based on simulationId format
		const url = UUID_RE.test(assignment.simulationId)
			? `/thi-nghiem?id=${assignment.simulationId}`
			: `/hoc-sinh/workspace?sim=${assignment.simulationId}`;

		// Find the member record for the current user
		const member = cls?.members?.find(
			(m) => m.userId === user?.id || (user?.studentCode && m.studentCode === user?.studentCode),
		);

		// Add assignment context query params so we can submit it upon completion
		history.push(`${url}&assignmentId=${assignment.id}&memberId=${member?.id}&role=student`);
	};

	if (loading) {
		return (
			<StudentLayout>
				<div style={{ padding: 100, textAlign: 'center' }}>
					<Spin size='large' />
				</div>
			</StudentLayout>
		);
	}

	if (!cls)
		return (
			<StudentLayout>
				<div style={{ padding: 40 }}>Không tìm thấy lớp học</div>
			</StudentLayout>
		);

	// Find the student's member record to match submissions
	const currentMember = cls.members?.find(
		(m) => m.userId === user?.id || (user?.studentCode && m.studentCode === user?.studentCode),
	);

	return (
		<StudentLayout>
			<div className='student-class-details'>
				<PageCard
					title={
						<Space size='large' align='center'>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<Title level={3} style={{ margin: 0 }}>
									{cls.name}
								</Title>
							</div>
						</Space>
					}
				>
					<div className='assignments-section'>
						<Space size='middle' direction='horizontal'>
							<Title level={4} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
								<BookOutlined style={{ color: '#1677ff' }} />
								Bài tập được giao
							</Title>
							<Text type='secondary' style={{ fontSize: 13 }}>
								Mã lớp: <strong>{cls.inviteCode}</strong> | {cls.description || 'Không có mô tả'}
							</Text>
						</Space>

						<div className='assignments-list'>
							{(!cls.assignments || cls.assignments.length === 0) && (
								<Empty description='Chưa có bài tập nào được giao' />
							)}
							{cls.assignments?.map((assignment) => {
								const submission = assignment.submissions?.find((s) => s.memberId === currentMember?.id);
								const isSubmitted = !!submission;

								return (
									<Card key={assignment.id} className='assignment-card'>
										<div className='assignment-card__content'>
											<div className='assignment-card__info'>
												<Title level={5}>{assignment.title}</Title>
												{assignment.description && <Text>{assignment.description}</Text>}
												<div className='assignment-card__meta'>
													Hạn nộp:{' '}
													<strong>
														{assignment.dueDate ? dayjs(assignment.dueDate).format('HH:mm DD/MM/YYYY') : 'Không có'}
													</strong>
												</div>
											</div>
											<div className='assignment-card__action'>
												{isSubmitted ? (
													<div className='submission-status'>
														<Tag color='success'>Đã nộp bài</Tag>
														<div className='score-display'>
															Điểm: <strong>{submission.score}</strong>
														</div>
														<Button type='default' onClick={() => handleDoAssignment(assignment)}>
															Làm lại
														</Button>
													</div>
												) : (
													<Button type='primary' onClick={() => handleDoAssignment(assignment)}>
														Vào làm bài
													</Button>
												)}
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					</div>
				</PageCard>
			</div>
		</StudentLayout>
	);
};

export default StudentClassDetails;
