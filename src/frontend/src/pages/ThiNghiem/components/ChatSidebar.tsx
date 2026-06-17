import { useEffect, useRef, useState } from 'react';
import { useModel } from '@umijs/max';
import { Button, Input, List, Typography, Avatar, Tag, Tooltip } from 'antd';
import { RobotOutlined, UserOutlined, SendOutlined, ReloadOutlined, LeftOutlined } from '@ant-design/icons';
import './ChatSidebar.less';

const { Text, Paragraph } = Typography;

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  subject?: string;
}

const ChatSidebar: React.FC<Props> = ({ collapsed, onToggle, subject }) => {
  const { messages, loading, sendMessage, resetChat } = useModel('useAIChatBotModel');

  const listRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;
    sendMessage(trimmed);
    setInputValue('');
  };

  const subjectLabel = subject === 'physics' ? 'Vật lý' : subject === 'chemistry' ? 'Hóa học' : subject === 'math' ? 'Toán học' : subject;

  return (
    <div className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-header-left">
          <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
          <div>
            <div className="chat-sidebar-title">AI Trợ giảng</div>
          </div>
        </div>
        <div className="chat-sidebar-header-actions">
          <Tooltip title="Xóa hội thoại">
            <Button type="text" size="small" icon={<ReloadOutlined style={{ color: '#fff' }} />} onClick={resetChat} />
          </Tooltip>
          <Tooltip title="Thu gọn">
            <Button type="text" size="small" icon={<LeftOutlined style={{ color: '#fff' }} />} onClick={onToggle} />
          </Tooltip>
        </div>
      </div>

      <div className="chat-sidebar-body" ref={listRef}>
        {messages.length === 0 ? (
          <div className="chat-sidebar-empty">
            <RobotOutlined style={{ fontSize: 32, opacity: 0.25 }} />
            <Text type="secondary">Hỏi AI về bài tập</Text>
          </div>
        ) : (
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item style={{ border: 'none', padding: '5px 0' }}>
                <div className={`chat-sidebar-bubble ${msg.sender === 'user' ? 'user' : ''}`}>
                  <Avatar size={26} icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ backgroundColor: msg.sender === 'user' ? '#f56a00' : '#134D8B', flexShrink: 0 }} />
                  <div className={`chat-sidebar-message ${msg.sender}`}>
                    {msg.sender === 'user' ? (
                      <Text style={{ fontSize: 13 }}>{msg.text}</Text>
                    ) : (
                      <div>
                        {msg.text.split('\n').map((line, i) => (
                          <Paragraph key={i} style={{ margin: '1px 0', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{line}</Paragraph>
                        ))}
                        {msg.aiResult && (
                          <div className="chat-sidebar-tags">
                            <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px' }}>{msg.aiResult.intent}</Tag>
                            <Tag color="green" style={{ fontSize: 10, lineHeight: '16px' }}>{Math.round(msg.aiResult.confidence * 100)}%</Tag>
                            {msg.aiResult.analysis.pattern_id && (
                              <Tag color="purple" style={{ fontSize: 10, lineHeight: '16px' }}>{msg.aiResult.analysis.pattern_id}</Tag>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <div className="chat-sidebar-typing">
              <span className="chat-sidebar-typing-dot" />
              <span className="chat-sidebar-typing-dot" />
              <span className="chat-sidebar-typing-dot" />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>AI đang phân tích...</Text>
          </div>
        )}
      </div>

      <div className="chat-sidebar-footer">
        <div className="chat-sidebar-input-group">
          <Input
            placeholder="Nhập câu hỏi..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            disabled={loading}
            size="small"
            style={{ borderRadius: 6 }}
          />
          <Button type="primary" size="small" icon={<SendOutlined />} onClick={handleSend} loading={loading} style={{ borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
