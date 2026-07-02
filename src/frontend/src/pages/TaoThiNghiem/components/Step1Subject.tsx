import { CalculatorOutlined, ExperimentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Col, Input, InputNumber, Row } from 'antd';
import React from 'react';

interface Props {
	data: Partial<Scene.IRecord>;
	onChange: (val: Partial<Scene.IRecord>) => void;
}

const SUBJECTS = [
	{
		key: 'physics',
		label: 'Vật lý',
		icon: <ThunderboltOutlined />,
		color: '#3b82f6',
		bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
		emoji: '⚡',
	},
	{
		key: 'chemistry',
		label: 'Hóa học',
		icon: <ExperimentOutlined />,
		color: '#22c55e',
		bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
		emoji: '🧪',
	},
	{
		key: 'math',
		label: 'Toán học',
		icon: <CalculatorOutlined />,
		color: '#f59e0b',
		bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
		emoji: '📐',
	},
];

const Step1Subject: React.FC<Props> = ({ data, onChange }) => {
	const roomType = data.roomType || 'physics';

	return (
		<div className='s1'>
			<h2 className='s1-heading'>Tạo thí nghiệm mới</h2>
			<p className='s1-desc'>Chọn môn học và đặt tên cho thí nghiệm của bạn</p>

			<div className='s1-name'>
				<Input
					size='large'
					placeholder='Tên thí nghiệm...'
					value={data.name}
					onChange={(e) => onChange({ name: e.target.value })}
					maxLength={100}
				/>
			</div>

			<div className='s1-subjects'>
				{SUBJECTS.map((sub) => {
					const active = roomType === sub.key;
					return (
						<div
							key={sub.key}
							className={`s1-subject ${active ? 'active' : ''}`}
							onClick={() => onChange({ roomType: sub.key as any })}
							style={{ '--accent': sub.color } as React.CSSProperties}
						>
							<div className='s1-subject-emoji'>{sub.emoji}</div>
							<div className='s1-subject-label'>{sub.label}</div>
						</div>
					);
				})}
			</div>

			<Row gutter={16} className='s1-env'>
				<Col span={roomType === 'physics' ? 8 : 12}>
					<label>Gia tốc trọng trường</label>
					<InputNumber
						size='large'
						min={0}
						max={100}
						step={0.1}
						value={data.environment?.gravity ?? 9.81}
						onChange={(v) => onChange({ environment: { ...data.environment, gravity: v ?? 9.81 } })}
						addonAfter='m/s²'
						style={{ width: '100%' }}
					/>
				</Col>
				<Col span={roomType === 'physics' ? 8 : 12}>
					<label>Nhiệt độ phòng</label>
					<InputNumber
						size='large'
						min={-50}
						max={200}
						step={1}
						value={data.environment?.temperature ?? 25}
						onChange={(v) => onChange({ environment: { ...data.environment, temperature: v ?? 25 } })}
						addonAfter='°C'
						style={{ width: '100%' }}
					/>
				</Col>
				{roomType === 'physics' && (
					<Col span={8}>
						<label>Hệ số ma sát (Môi trường)</label>
						<InputNumber
							size='large'
							min={0}
							max={10}
							step={0.01}
							value={data.environment?.damping ?? 0.05}
							onChange={(v) => onChange({ environment: { ...data.environment, damping: v ?? 0 } })}
							style={{ width: '100%' }}
						/>
					</Col>
				)}
			</Row>
		</div>
	);
};

export default Step1Subject;
