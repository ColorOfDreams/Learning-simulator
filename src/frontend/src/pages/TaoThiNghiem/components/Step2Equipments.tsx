import { SearchOutlined } from '@ant-design/icons';
import { Card, Checkbox, Col, Input, Row, Tag } from 'antd';
import React, { useState } from 'react';

interface Props {
	data: Partial<Scene.IRecord>;
	onChange: (val: Partial<Scene.IRecord>) => void;
}

const ALL_EQUIPMENTS = [
	{ id: 'WoodenBlock', name: 'Khối gỗ', category: 'physics', type: 'Solid' },
	{ id: 'Stand', name: 'Giá đỡ tĩnh', category: 'physics', type: 'Fixed' },
	{ id: 'SimplePendulum', name: 'Con lắc đơn', category: 'physics', type: 'Oscillation' },
	{ id: 'SpringPendulum', name: 'Con lắc lò xo', category: 'physics', type: 'Oscillation' },
	{ id: 'Beaker', name: 'Cốc thủy tinh', category: 'chemistry', type: 'Glassware' },
];

const Step2Equipments: React.FC<Props> = ({ data, onChange }) => {
	const [search, setSearch] = useState('');

	// Lọc theo môn học và từ khóa tìm kiếm
	const filtered = ALL_EQUIPMENTS.filter(
		(eq) => eq.category === data.roomType && eq.name.toLowerCase().includes(search.toLowerCase()),
	);

	const selectedIds = data.objects?.map((obj) => obj.modelName) || [];

	const toggleEquipment = (modelName: string) => {
		let newObjects = [...(data.objects || [])];
		if (selectedIds.includes(modelName)) {
			newObjects = newObjects.filter((o) => o.modelName !== modelName);
		} else {
			const getInitialY = (name: string) => {
				switch (name) {
					case 'WoodenBlock':
						return 0.15;
					case 'Beaker':
						return 0.4;
					case 'Stand':
						return 1.9;
					case 'SimplePendulum':
						return 1.5;
					case 'SpringPendulum':
						return 1.5;
					default:
						return 0;
				}
			};
			// Phân bổ vị trí ngẫu nhiên trên mặt bàn
			const randomX = Math.random() * 4 - 2; // X: Từ -2 đến 2
			const randomZ = Math.random() * 2 - 1; // Z: Từ -1 đến 1
			newObjects.push({
				id: `${modelName}_${Date.now()}`,
				modelName,
				position: [randomX, getInitialY(modelName), randomZ],
				rotation: [0, 0, 0],
				scale: [1, 1, 1],
				properties: modelName === 'WoodenBlock' ? { color: '#feca57' } : { liquidVolume: 200 },
			});
		}
		onChange({ ...data, objects: newObjects });
	};

	return (
		<div>
			<Input
				placeholder='Tìm kiếm dụng cụ...'
				prefix={<SearchOutlined />}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				style={{ marginBottom: 16 }}
			/>
			<Row gutter={[16, 16]}>
				{filtered.map((eq) => (
					<Col span={8} key={eq.id}>
						<Card
							hoverable
							onClick={() => toggleEquipment(eq.id)}
							style={{
								borderColor: selectedIds.includes(eq.id) ? '#1890ff' : '#f0f0f0',
								borderWidth: selectedIds.includes(eq.id) ? 2 : 1,
							}}
						>
							<Card.Meta
								title={
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										{eq.name}
										<Checkbox checked={selectedIds.includes(eq.id)} />
									</div>
								}
								description={<Tag color='blue'>{eq.type}</Tag>}
							/>
						</Card>
					</Col>
				))}
				{filtered.length === 0 && <Col span={24}>Không tìm thấy dụng cụ phù hợp.</Col>}
			</Row>
		</div>
	);
};

export default Step2Equipments;
