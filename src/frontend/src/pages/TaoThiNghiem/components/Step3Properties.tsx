import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, InputNumber } from 'antd';
import React from 'react';

interface Props {
	data: Partial<Scene.IRecord>;
	onChange: (val: Partial<Scene.IRecord>) => void;
	onBack: () => void;
}

const LABELS: Record<string, string> = {
	WoodenBlock: 'Khối gỗ',
	Beaker: 'Cốc thủy tinh',
	Stand: 'Giá đỡ',
	SimplePendulum: 'Con lắc đơn',
	SpringPendulum: 'Con lắc lò xo',
	Spring: 'Lò xo',
	MassBlock: 'Vật nặng',
	Stopwatch: 'Đồng hồ',
	Ruler: 'Thước',
	Protractor: 'Thước đo góc',
	Dashpot: 'Bộ giảm chấn',
	DrivingMotor: 'Động cơ',
	EnergyMeter: 'Năng lượng',
};

const COLORS: Record<string, string> = {
	WoodenBlock: '#f59e0b',
	Beaker: '#06b6d4',
	Stand: '#6b7280',
	SimplePendulum: '#ef4444',
	SpringPendulum: '#3b82f6',
	Spring: '#64748b',
	MassBlock: '#f97316',
	Stopwatch: '#22c55e',
	Ruler: '#eab308',
	Protractor: '#a855f7',
	Dashpot: '#78716c',
	DrivingMotor: '#dc2626',
	EnergyMeter: '#8b5cf6',
};

const EMOJIS: Record<string, string> = {
	Stand: '🏗️',
	SimplePendulum: '⏳',
	SpringPendulum: '🪩',
	Spring: '🪀',
	MassBlock: '🧱',
	WoodenBlock: '🪵',
	Stopwatch: '⏱️',
	Ruler: '📏',
	Protractor: '📐',
	Dashpot: '🪫',
	DrivingMotor: '⚙️',
	EnergyMeter: '📊',
	Beaker: '🧫',
};

const Step3Properties: React.FC<Props> = ({ data, onChange, onBack }) => {
	const objects = data.objects || [];

	const updateProp = (objId: string, key: string, value: any) => {
		const updated = objects.map((obj) =>
			obj.id === objId ? { ...obj, properties: { ...obj.properties, [key]: value } } : obj,
		);
		onChange({ objects: updated });
	};

	const renderProps = (obj: Scene.Object) => {
		const props: React.ReactNode[] = [];
		const m = obj.modelName;

		if (['WoodenBlock', 'SimplePendulum', 'SpringPendulum', 'MassBlock', 'Dashpot', 'DrivingMotor'].includes(m)) {
			props.push(
				<div className='s3-prop' key='mass'>
					<label>Khối lượng (kg)</label>
					<InputNumber
						min={0.01}
						max={50}
						step={0.1}
						value={obj.properties?.mass ?? 1}
						onChange={(v) => updateProp(obj.id, 'mass', v)}
						style={{ width: '100%' }}
					/>
				</div>,
			);
		}
		if (['SimplePendulum', 'Spring'].includes(m)) {
			props.push(
				<div className='s3-prop' key='length'>
					<label>Chiều dài (m)</label>
					<InputNumber
						min={0.1}
						max={10}
						step={0.1}
						value={obj.properties?.length ?? 2}
						onChange={(v) => updateProp(obj.id, 'length', v)}
						style={{ width: '100%' }}
					/>
				</div>,
			);
		}
		if (['SpringPendulum', 'Spring'].includes(m)) {
			props.push(
				<div className='s3-prop' key='stiffness'>
					<label>Độ cứng (N/m)</label>
					<InputNumber
						min={1}
						max={1000}
						step={1}
						value={obj.properties?.stiffness ?? 50}
						onChange={(v) => updateProp(obj.id, 'stiffness', v)}
						style={{ width: '100%' }}
					/>
				</div>,
			);
		}
		if (m === 'DrivingMotor') {
			props.push(
				<div className='s3-prop' key='freq'>
					<label>Tần số (Hz)</label>
					<InputNumber
						min={0.1}
						max={50}
						step={0.1}
						value={obj.properties?.frequency ?? 2}
						onChange={(v) => updateProp(obj.id, 'frequency', v)}
						style={{ width: '100%' }}
					/>
				</div>,
			);
			props.push(
				<div className='s3-prop' key='amp'>
					<label>Biên độ (m)</label>
					<InputNumber
						min={0.01}
						max={0.5}
						step={0.01}
						value={obj.properties?.amplitude ?? 0.3}
						onChange={(v) => updateProp(obj.id, 'amplitude', v)}
						style={{ width: '100%' }}
					/>
				</div>,
			);
		}
		if (['WoodenBlock', 'SimplePendulum', 'SpringPendulum'].includes(m)) {
			const defColor = m === 'WoodenBlock' ? '#feca57' : m === 'SimplePendulum' ? '#ff0000' : '#3b82f6';
			props.push(
				<div className='s3-prop' key='color'>
					<label>Màu sắc</label>
					<div className='s3-color'>
						<input
							type='color'
							value={obj.properties?.color || defColor}
							onChange={(e) => updateProp(obj.id, 'color', e.target.value)}
						/>
						<span>{obj.properties?.color || defColor}</span>
					</div>
				</div>,
			);
		}
		if (m === 'Beaker') {
			props.push(
				<div className='s3-prop' key='vol'>
					<label>Thể tích (ml)</label>
					<InputNumber
						min={0}
						max={500}
						step={10}
						value={obj.properties?.liquidVolume ?? 0}
						onChange={(v) => updateProp(obj.id, 'liquidVolume', v)}
						style={{ width: '100%' }}
					/>
				</div>,
			);
			props.push(
				<div className='s3-prop' key='lcolor'>
					<label>Màu chất lỏng</label>
					<div className='s3-color'>
						<input
							type='color'
							value={obj.properties?.liquidColor || '#00a8ff'}
							onChange={(e) => updateProp(obj.id, 'liquidColor', e.target.value)}
						/>
						<span>{obj.properties?.liquidColor || '#00a8ff'}</span>
					</div>
				</div>,
			);
		}
		if (m === 'BunsenBurner' || m === 'DenCon') {
			props.push(
				<div className='s3-prop' key='flame'>
					<label>Kích thước lửa</label>
					<InputNumber
						min={0.5}
						max={3.0}
						step={0.1}
						value={obj.properties?.kichThuocLua ?? 1}
						onChange={(v) => updateProp(obj.id, 'kichThuocLua', v)}
						style={{ width: '100%' }}
					/>
				</div>,
			);
		}
		if (props.length === 0) {
			props.push(
				<div className='s3-prop' key='none' style={{ color: '#94a3b8', fontSize: 12 }}>
					Không có thông số
				</div>,
			);
		}
		return props;
	};

	return (
		<div className='s3'>
			<h2 className='s3-heading'>Cấu hình dụng cụ</h2>
			<p className='s3-desc'>{objects.length} dụng cụ đã chọn</p>

			{objects.length === 0 ? (
				<div className='s3-empty-state'>
					<span style={{ fontSize: 48 }}>📦</span>
					<p>Chưa chọn dụng cụ nào</p>
					<Button icon={<ArrowLeftOutlined />} onClick={onBack}>
						Chọn dụng cụ
					</Button>
				</div>
			) : (
				<div className='s3-list'>
					{objects.map((obj) => (
						<div
							className='s3-item'
							key={obj.id}
							style={{ '--accent': COLORS[obj.modelName] || '#94a3b8' } as React.CSSProperties}
						>
							<div className='s3-item-head'>
								<div className='s3-item-emoji'>{EMOJIS[obj.modelName] || '📦'}</div>
								<div className='s3-item-info'>
									<div className='s3-item-name'>{LABELS[obj.modelName] || obj.modelName}</div>
									<div className='s3-item-id'>#{obj.id.slice(-4)}</div>
								</div>
							</div>
							<div className='s3-item-props'>{renderProps(obj)}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Step3Properties;
