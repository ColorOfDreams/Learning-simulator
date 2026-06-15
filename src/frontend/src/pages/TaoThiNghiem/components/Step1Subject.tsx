import React from 'react';
import { Form, Radio, InputNumber, Row, Col, Input } from 'antd';

interface Props {
  data: Partial<Scene.IRecord>;
  onChange: (val: Partial<Scene.IRecord>) => void;
}

const Step1Subject: React.FC<Props> = ({ data, onChange }) => {
  return (
    <Form layout="vertical">
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item label="Tên thí nghiệm">
            <Input
              placeholder="Nhập tên bài thí nghiệm (VD: Thực hành dao động)"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
            />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Chọn phân môn">
            <Radio.Group
              value={data.roomType}
              onChange={(e) => onChange({ ...data, roomType: e.target.value })}
            >
              <Radio.Button value="physics">Vật lý</Radio.Button>
              <Radio.Button value="chemistry">Hóa học</Radio.Button>
              <Radio.Button value="math">Toán học</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item label="Trọng lực (m/s²)">
            <InputNumber
              style={{ width: '100%' }}
              value={data.environment?.gravity}
              onChange={(val) =>
                onChange({
                  ...data,
                  environment: { ...data.environment, gravity: val || 9.81 },
                })
              }
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item label="Nhiệt độ môi trường (°C)">
            <InputNumber
              style={{ width: '100%' }}
              value={data.environment?.temperature}
              onChange={(val) =>
                onChange({
                  ...data,
                  environment: { ...data.environment, temperature: val || 25 },
                })
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default Step1Subject;
