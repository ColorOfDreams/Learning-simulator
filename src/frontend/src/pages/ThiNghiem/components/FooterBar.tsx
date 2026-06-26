import { Button, Tooltip } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, PauseCircleOutlined, MessageOutlined, BulbOutlined } from '@ant-design/icons';
import { history } from 'umi';

interface Props {
  isPlaying: boolean;
  onTogglePlay: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onRequestGuidance?: () => void;
}

const FooterBar: React.FC<Props> = ({
  isPlaying, onTogglePlay, sidebarCollapsed, onToggleSidebar, onRequestGuidance,
}) => (
  <div style={{
    height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 12px', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 -2px 16px rgba(0,0,0,0.06)', zIndex: 10, flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Tooltip title="Quay lại">
        <Button type="text" size="large" icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/quan-ly-thi-nghiem')} />
      </Tooltip>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Tooltip title="Hướng dẫn AI">
        <Button type="text" size="large" icon={<BulbOutlined />} onClick={onRequestGuidance}
          style={{ color: '#f59e0b' }} />
      </Tooltip>

      <Tooltip title={sidebarCollapsed ? 'Mở AI Chat' : 'Thu gọn AI Chat'}>
        <Button type="text" size="large" icon={<MessageOutlined />}
          onClick={onToggleSidebar}
          style={!sidebarCollapsed ? { color: '#134D8B' } : undefined} />
      </Tooltip>
    </div>
  </div>
);

export default FooterBar;
