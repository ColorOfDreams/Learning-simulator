import React, { useState } from 'react';
import { Drawer, Input, Button, List, Typography, Avatar } from 'antd';
import { RobotOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const AIChatBox: React.FC<Props> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Xin chào! Tôi là AI trợ giảng. Tôi có thể giúp gì cho bạn trong bài thực hành này?' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    
    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', text: 'Xin lỗi, tính năng AI đang được phát triển trong Sprint tới. Vui lòng quay lại sau nhé!' }
      ]);
    }, 1000);
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ color: '#1890ff', fontSize: 20 }} />
          <span>AI Assistant</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      mask={false}
      bodyStyle={{ display: 'flex', flexDirection: 'column', padding: 16 }}
      style={{ zIndex: 1000 }} // Ensure it overlays correctly
    >
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                gap: 8,
                width: '100%'
              }}>
                <Avatar 
                  icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                  style={{ backgroundColor: msg.sender === 'user' ? '#f56a00' : '#1890ff' }}
                />
                <div style={{
                  background: msg.sender === 'user' ? '#e6f7ff' : '#f0f2f5',
                  padding: '8px 12px',
                  borderRadius: 8,
                  maxWidth: '80%',
                  wordBreak: 'break-word'
                }}>
                  <Text>{msg.text}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
      
      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          placeholder="Nhập câu hỏi..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onPressEnter={handleSend}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
      </div>
    </Drawer>
  );
};

// Sử dụng React.memo để ngăn chặn re-render khi component cha (chứa 3D Canvas) thay đổi
export default React.memo(AIChatBox);
