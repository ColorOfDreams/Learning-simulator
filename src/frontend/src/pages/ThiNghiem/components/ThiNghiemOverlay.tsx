import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, SettingOutlined, ArrowLeftOutlined, EyeOutlined, ToolOutlined } from '@ant-design/icons';
import { history } from 'umi';

const { Title, Text } = Typography;

export const glassStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  color: '#1f2937',
};

interface OverlayProps {
  sceneGraph: Scene.IRecord | null;
  onAddObject: (modelName: string) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  interactionMode?: 'observe' | 'practice';
  onToggleMode?: () => void;
}

const getInstructions = (roomType?: string) => {
  switch (roomType) {
    case 'physics':
      return [
        'Kéo thả các dụng cụ (Khối gỗ, Giá đỡ, Con lắc) để sắp xếp vị trí trên bàn.',
        'Nhấn "BẮT ĐẦU" để bắt đầu mô phỏng và kích hoạt trọng lực.',
        'Nhấn giữ chuột trái và di chuyển chuột để kéo thả tự do các vật thể.',
        'Quan sát con lắc dao động hoặc các va chạm vật lý chân thực.'
      ];
    case 'chemistry':
      return [
        'Kéo thả các cốc hóa chất để thay đổi vị trí.',
        'Đặt chúng cạnh nhau hoặc quan sát thông số thể tích trên nhãn cốc.',
        'Xem màu sắc dung dịch mô phỏng trực quan theo pH.'
      ];
    case 'math':
      return [
        'Kéo thả các vật thể hình học tương tác trên bàn.',
        'Quan sát các thông số tọa độ và kích thước thực tế.',
        'Thay đổi tham số để so sánh sự tương phản hình học.'
      ];
    default:
      return [
        'Kéo thả các dụng cụ trên bàn thí nghiệm.',
        'Nhấn "BẮT ĐẦU" để chạy mô phỏng vật lý.'
      ];
  }
};

const ThiNghiemOverlay: React.FC<OverlayProps> = ({ 
  sceneGraph, 
  onAddObject, 
  isPlaying = false, 
  onTogglePlay,
  interactionMode = 'observe',
  onToggleMode
}) => {
  const instructions = getInstructions(sceneGraph?.roomType);

  return (
    <>
      {/* Lớp UI Overlay (Glassmorphism) đè lên trên */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Nút Quay Lại */}
        <Button 
          shape="circle"
          size="large"
          icon={<ArrowLeftOutlined />} 
          onClick={() => history.push('/quan-ly-thi-nghiem')}
          style={{ ...glassStyle, width: 48, height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        />

        <Card style={{ ...glassStyle, margin: 0 }} bordered={false}>
          <Title level={4} style={{ color: '#1f2937', margin: 0 }}>AI Hỗ Trợ Mô Phỏng</Title>
          <Text style={{ color: 'rgba(31,41,55,0.7)' }}>Không gian {sceneGraph?.roomType || '...'}</Text>
          <div style={{ marginTop: 16 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Space>
                <Button
                  type="primary"
                  shape="round"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  style={{ background: isPlaying ? '#ff4d4f' : '#52c41a', border: 'none' }}
                  onClick={onTogglePlay}
                >
                  {isPlaying ? 'Tạm Dừng' : 'Bắt Đầu'}
                </Button>
                <Button shape="round" icon={<SettingOutlined />}>
                  Cài đặt
                </Button>
              </Space>

              <div style={{ 
                display: 'flex', 
                background: 'rgba(0, 0, 0, 0.05)', 
                padding: 4, 
                borderRadius: 20, 
                border: '1px solid rgba(0, 0, 0, 0.08)' 
              }}>
                <button
                  onClick={interactionMode !== 'observe' ? onToggleMode : undefined}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: interactionMode === 'observe' ? '#1890ff' : 'transparent',
                    color: interactionMode === 'observe' ? 'white' : '#4b5563',
                    padding: '6px 12px',
                    borderRadius: 16,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <EyeOutlined /> Quan Sát
                </button>
                <button
                  onClick={interactionMode !== 'practice' ? onToggleMode : undefined}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: interactionMode === 'practice' ? '#1890ff' : 'transparent',
                    color: interactionMode === 'practice' ? 'white' : '#4b5563',
                    padding: '6px 12px',
                    borderRadius: 16,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ToolOutlined /> Thực Hành
                </button>
              </div>
            </Space>
          </div>
        </Card>
      </div>

      {/* Lớp Hướng Dẫn Thí Nghiệm (Top Right Glassmorphism) */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10, width: 350 }}>
        <Card style={glassStyle} bordered={false}>
          <Title level={5} style={{ color: '#1f2937', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💡 Hướng Dẫn Thí Nghiệm</span>
          </Title>
          <ul style={{ paddingLeft: 18, margin: 0, color: '#4b5563', fontSize: '13px', lineHeight: '1.6' }}>
            {instructions.map((inst, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>{inst}</li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default ThiNghiemOverlay;
