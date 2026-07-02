import { getStudentClasses } from '@/services/classrooms/api';
import { history, useModel } from '@umijs/max';
import { Badge, Button, Card, Empty, Spin, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import './StudentClasses.less';

const { Title, Text } = Typography;

const StudentClasses: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;

	const [classes, setClasses] = useState<ClassroomsAPI.ClassInfo[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchClasses = () => {
		setLoading(true);
		getStudentClasses()
			.then((res) => {
				setClasses(res.data?.data || res.data || []);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		if (user) {
			fetchClasses();
		} else {
			setLoading(false);
		}
	}, [user]);

	return (
		<StudentLayout>
			<div className='student-classes scl'>
				<div className='student-classes__header'>
					<Title level={2}>Lớp học của tôi</Title>
					{!loading && classes.length > 0 && (
						<Button
							type='primary'
							size='large'
							style={{ borderRadius: '8px', fontWeight: 600 }}
							onClick={() => history.push('/join')}
						>
							Tham gia lớp học
						</Button>
					)}
				</div>

				{loading ? (
					<div className='loading-container'>
						<Spin size='large' />
					</div>
				) : classes.length === 0 ? (
					<Empty description='Bạn chưa tham gia lớp học nào' image={Empty.PRESENTED_IMAGE_SIMPLE}>
						<Button type='primary' onClick={() => history.push('/join')}>
							Xin tham gia lớp mới
						</Button>
					</Empty>
				) : (
					<div className='classes-grid'>
						{classes.map((cls) => {
							const currentMember = cls.members?.[0];
							const isPending = currentMember?.status === 'PENDING';

							return (
								<Card
									key={cls.id}
									className={`class-card ${isPending ? 'pending' : ''}`}
									hoverable={!isPending}
									onClick={() => {
										if (isPending) {
											message.info('Yêu cầu đang chờ giáo viên duyệt!');
										} else {
											history.push(`/hoc-sinh/classes/${cls.id}`);
										}
									}}
								>
									<div className='class-card__header'>
										<Title level={4}>{cls.name}</Title>
										{isPending ? (
											<Tag color='warning'>Đang chờ duyệt</Tag>
										) : (
											<Badge count={cls.assignments?.length || 0} style={{ backgroundColor: '#52c41a' }} />
										)}
									</div>
									{cls.description && <p className='class-card__desc'>{cls.description}</p>}
									<div className='class-card__meta'>
										<span>
											Mã lớp: <strong>{cls.inviteCode}</strong>
										</span>
										<span>Tham gia: {dayjs(cls.createdAt).format('DD/MM/YYYY')}</span>
									</div>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</StudentLayout>
	);
};

export default StudentClasses;
