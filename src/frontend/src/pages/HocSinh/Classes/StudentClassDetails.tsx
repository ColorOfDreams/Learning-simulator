import { getClassById } from '@/services/classrooms/api';
import { BookOutlined } from '@ant-design/icons';
import { history, useModel, useParams } from '@umijs/max';
import { Button, Card, Empty, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import './StudentClassDetails.less';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MOCK_CLASS_DATA: ClassroomsAPI.ClassInfo = {
	id: 'demo',
	name: '12A2 (Lớp học mẫu)',
	inviteCode: 'ISK2P5',
	description: 'Đây là lớp học giả lập để trải nghiệm giao diện học sinh, bao gồm danh sách bài tập được giao và trạng thái nộp bài.',
	teacherId: 'teacher-1',
	members: [
		{
			id: 'member-1',
			userId: 'student-1',
			studentCode: 'HS001',
			role: 'student',
		}
	],
	assignments: [
		{
			id: 'assign-1',
			classroomId: 'demo',
			title: 'Con lắc đơn',
			description: 'Khảo sát chu kỳ dao động điều hòa của con lắc đơn phụ thuộc vào chiều dài dây treo và gia tốc trọng trường.',
			simulationId: 'con-lac-don',
			dueDate: '2026-06-28T23:09:00Z',
			submissions: [
				{
					id: 'sub-1',
					assignmentId: 'assign-1',
					memberId: 'member-1',
					score: 33,
					completedAt: '2026-06-27T10:00:00Z',
				}
			]
		},
		{
			id: 'assign-2',
			classroomId: 'demo',
			title: 'Dao động tắt dần của con lắc lò xo',
			description: 'Khảo sát dao động lò xo nằm ngang và xác định hệ số ma sát giữa vật nặng và mặt sàn.',
			simulationId: 'con-lac-lo-xo',
			dueDate: '2026-07-25T23:59:00Z',
			submissions: []
		}
	]
};

const StudentClassDetails: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;

	const [cls, setCls] = useState<ClassroomsAPI.ClassInfo | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (id) {
			if (id === 'demo') {
				setCls(MOCK_CLASS_DATA);
				setLoading(false);
				return;
			}
			getClassById(id)
				.then((res) => {
					setCls(res.data?.data || res.data);
				})
				.catch((err) => {
					console.error(err);
					setCls(MOCK_CLASS_DATA);
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
	const currentMember = cls.id === 'demo'
		? cls.members?.[0]
		: cls.members?.find(
			(m) => m.userId === user?.id || (user?.studentCode && m.studentCode === user?.studentCode),
		);

	return (
		<StudentLayout>
			<div className='student-class-details'>
				<div className='student-class-details__header'>
					<h2 className='student-class-details__title'>{cls.name}</h2>
					<div className='student-class-details__subtitle'>
						Mã lớp: <strong>{cls.inviteCode}</strong> {cls.description && ` · ${cls.description}`}
					</div>
				</div>

				<div className='assignments-section'>
					<h4 className='assignments-section__title'>
						<BookOutlined />
						Bài tập được giao
					</h4>

					<div className='assignments-list'>
						{(!cls.assignments || cls.assignments.length === 0) && (
							<Empty description='Chưa có bài tập nào được giao' />
						)}
						{cls.assignments?.map((assignment) => {
							const submission = assignment.submissions?.find((s) => s.memberId === currentMember?.id);
							const isSubmitted = !!submission;

							return (
								<Card key={assignment.id} className='assignment-card' bordered={false}>
									<div className='assignment-card__content'>
										<div className='assignment-card__info'>
											<h5 className='assignment-card__title'>{assignment.title}</h5>
											{assignment.description && (
												<div className='assignment-card__desc'>{assignment.description}</div>
											)}
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
			</div>
		</StudentLayout>
	);
};

export default StudentClassDetails;
