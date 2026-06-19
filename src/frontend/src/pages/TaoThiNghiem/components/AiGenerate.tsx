import React, { useState } from 'react';
import { Input, Button, Card, Tag, message } from 'antd';
import { RobotOutlined, ThunderboltOutlined, EditOutlined, RocketOutlined } from '@ant-design/icons';
import { chatSessionApi } from '@/services/ai/api';
import { INITIAL_Y } from '@/simulations/equipment-catalog';

interface Props {
  onAccept: (data: Partial<Scene.IRecord>) => Promise<void>;
  onSwitchToManual: (data: Partial<Scene.IRecord>) => void;
  submitting: boolean;
}

const AiGenerate: React.FC<Props> = ({ onAccept, onSwitchToManual, submitting }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await chatSessionApi.generateExperiment(input.trim());
      const data = (res.data as any).data ?? res.data;
      setResult(data);
    } catch { message.error('Lỗi khi tạo thí nghiệm. Thử lại hoặc dùng chế độ thủ công.'); }
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!result) return;
    const objects = (result.objects || []).map((obj: any) => ({
      id: `${obj.modelName}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      modelName: obj.modelName,
      position: [Math.random() * 4 - 2, INITIAL_Y[obj.modelName] || 0.5, Math.random() * 2 - 1] as [number, number, number],
      rotation: [0, 0, 0], scale: [1, 1, 1],
      properties: obj.properties || {},
    }));
    await onAccept({
      name: result.name || 'Thí nghiệm mới',
      roomType: result.roomType || 'physics',
      environment: { gravity: 9.81, temperature: 25 },
      objects,
    });
  };

  const handleEdit = () => {
    if (!result) return;
    onSwitchToManual({
      name: result.name || 'Thí nghiệm mới',
      roomType: result.roomType || 'physics',
      environment: { gravity: 9.81, temperature: 25 },
    });
  };

  const subjectLabel = result?.roomType === 'physics' ? 'Vật lý' : result?.roomType === 'chemistry' ? 'Hóa học' : result?.roomType === 'math' ? 'Toán học' : '';

  if (result) {
    return (
      <div className="ai-result">
        <Card
          title={<span><RobotOutlined style={{ marginRight: 6 }} />{result.name}</span>}
          extra={<Tag color="blue">{subjectLabel}</Tag>}
          style={{ borderRadius: 14 }}
        >
          {result.explanation && <p style={{ color: '#64748b', marginBottom: 16 }}>{result.explanation}</p>}

          <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 600, color: '#334155' }}>
            Dụng cụ đã chọn ({result.objects?.length || 0}):
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20 }}>
            {(result.objects || []).map((obj: any) => (
              <Tag key={obj.modelName} style={{ borderRadius: 6, padding: '2px 10px' }}>
                {obj.modelName}
                {obj.properties?.length && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10 }}>({obj.properties.length}m)</span>}
                {obj.properties?.mass && <span style={{ opacity: 0.6, marginLeft: 4, fontSize: 10 }}>({obj.properties.mass}kg)</span>}
              </Tag>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="primary" size="large" icon={<RocketOutlined />} onClick={handleAccept} loading={submitting}>
              Lưu & Vào Lab
            </Button>
            <Button size="large" icon={<EditOutlined />} onClick={handleEdit}>
              Chỉnh sửa thủ công
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="ai-generate">
      <div className="ai-generate-icon"><RobotOutlined /></div>
      <h2>Tạo thí nghiệm bằng AI</h2>
      <p>Nhập mô tả hoặc đề bài, AI sẽ tự động chọn dụng cụ và cấu hình</p>
      <Input.TextArea
        rows={4}
        placeholder="VD: Tạo thí nghiệm dao động con lắc đơn với dây dài 1m, quả nặng 500g..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
        style={{ borderRadius: 12, fontSize: 14 }}
      />
      <Button type="primary" size="large" icon={<ThunderboltOutlined />}
        onClick={handleGenerate} loading={loading} style={{ marginTop: 14, borderRadius: 10 }}>
        Tạo thí nghiệm
      </Button>
    </div>
  );
};

export default AiGenerate;
