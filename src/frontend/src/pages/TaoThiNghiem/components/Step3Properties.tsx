import { Col, Collapse, Form, Input, InputNumber, Row } from 'antd';
import React from 'react';

const { Panel } = Collapse;

interface Props {
	data: Partial<Scene.IRecord>;
	onChange: (val: Partial<Scene.IRecord>) => void;
}

const Step3Properties: React.FC<Props> = ({ data, onChange }) => {
	const updateObject = (idx: number, key: string, value: any) => {
		const newObjects = [...(data.objects || [])];
		newObjects[idx] = {
			...newObjects[idx],
			properties: { ...newObjects[idx].properties, [key]: value },
		};
		onChange({ ...data, objects: newObjects });
	};

	if (!data.objects || data.objects.length === 0) {
		return <div>Chưa chọn dụng cụ nào. Vui lòng quay lại Bước 2.</div>;
	}

	return (
		<Collapse defaultActiveKey={['0']}>
			{data.objects.map((obj, index) => (
				<Panel header={`Cấu hình: ${obj.modelName}`} key={index.toString()}>
					<Form layout='vertical'>
						<Row gutter={16}>
							{obj.modelName === 'WoodenBlock' && (
								<>
									<Col span={12}>
										<Form.Item label='Khối lượng (kg)'>
											<InputNumber
												min={0.1}
												value={obj.properties?.mass || 1}
												onChange={(val) => updateObject(index, 'mass', val)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item label='Màu sắc (HEX)'>
											<Input
												type='color'
												value={obj.properties?.color || '#feca57'}
												onChange={(e) => updateObject(index, 'color', e.target.value)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
								</>
							)}
							{obj.modelName === 'SimplePendulum' && (
								<>
									<Col span={8}>
										<Form.Item label='Chiều dài dây l (m)'>
											<InputNumber
												min={0.5}
												step={0.1}
												value={obj.properties?.length || 2}
												onChange={(val) => updateObject(index, 'length', val)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item label='Khối lượng vật m (kg)'>
											<InputNumber
												min={0.1}
												value={obj.properties?.mass || 1}
												onChange={(val) => updateObject(index, 'mass', val)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item label='Màu sắc vật nặng'>
											<Input
												type='color'
												value={obj.properties?.color || '#ff0000'}
												onChange={(e) => updateObject(index, 'color', e.target.value)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
								</>
							)}
							{obj.modelName === 'SpringPendulum' && (
								<>
									<Col span={8}>
										<Form.Item label='Độ cứng lò xo k (N/m)'>
											<InputNumber
												min={1}
												value={obj.properties?.stiffness || 50}
												onChange={(val) => updateObject(index, 'stiffness', val)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item label='Khối lượng vật m (kg)'>
											<InputNumber
												min={0.1}
												value={obj.properties?.mass || 1}
												onChange={(val) => updateObject(index, 'mass', val)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item label='Màu sắc vật nặng'>
											<Input
												type='color'
												value={obj.properties?.color || '#0000ff'}
												onChange={(e) => updateObject(index, 'color', e.target.value)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
								</>
							)}
							{obj.modelName === 'Beaker' && (
								<>
									<Col span={12}>
										<Form.Item label='Thể tích dung dịch (ml)'>
											<InputNumber
												min={0}
												max={500}
												value={obj.properties?.liquidVolume || 200}
												onChange={(val) => updateObject(index, 'liquidVolume', val)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item label='Màu sắc dung dịch'>
											<Input
												type='color'
												value={obj.properties?.liquidColor || '#4db8ff'}
												onChange={(e) => updateObject(index, 'liquidColor', e.target.value)}
												style={{ width: '100%' }}
											/>
										</Form.Item>
									</Col>
								</>
							)}
						</Row>
					</Form>
				</Panel>
			))}
		</Collapse>
	);
};

export default Step3Properties;
