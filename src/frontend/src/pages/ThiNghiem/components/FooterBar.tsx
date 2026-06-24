import {
	ArrowLeftOutlined,
	EyeOutlined,
	MessageOutlined,
	PauseCircleOutlined,
	PlayCircleOutlined,
	SettingOutlined,
	ToolOutlined,
} from '@ant-design/icons';
import { Button, Segmented, Tooltip } from 'antd';
import { history } from 'umi';

interface Props {
	isPlaying: boolean;
	onTogglePlay: () => void;
	interactionMode: 'observe' | 'practice';
	onToggleMode: () => void;
	sidebarCollapsed: boolean;
	onToggleSidebar: () => void;
}

const FooterBar: React.FC<Props> = ({
	isPlaying,
	onTogglePlay,
	interactionMode,
	onToggleMode,
	sidebarCollapsed,
	onToggleSidebar,
}) => {
	return (
		<div
			style={{
				height: 48,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '0 12px',
				background: 'rgba(255, 255, 255, 0.7)',
				backdropFilter: 'blur(12px)',
				WebkitBackdropFilter: 'blur(12px)',
				borderTop: '1px solid rgba(255, 255, 255, 0.5)',
				boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.06)',
				zIndex: 10,
				flexShrink: 0,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				<Tooltip title='Quay lại'>
					<Button
						type='text'
						size='large'
						icon={<ArrowLeftOutlined />}
						onClick={() => history.push('/quan-ly-thi-nghiem')}
					/>
				</Tooltip>
			</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
				<Tooltip title={sidebarCollapsed ? 'Mở AI Chat' : 'Thu gọn AI Chat'}>
					<Button
						type='text'
						size='large'
						icon={<MessageOutlined />}
						onClick={onToggleSidebar}
						style={!sidebarCollapsed ? { color: '#134D8B' } : undefined}
					/>
				</Tooltip>
				<Segmented
					value={interactionMode}
					onChange={(val) => val !== interactionMode && onToggleMode()}
					size='small'
					options={[
						{ value: 'observe', icon: <EyeOutlined />, label: 'Quan sát' },
						{ value: 'practice', icon: <ToolOutlined />, label: 'Thực hành' },
					]}
				/>

				<Tooltip title={isPlaying ? 'Tạm dừng' : 'Bắt đầu'}>
					<Button
						type='text'
						size='large'
						icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
						onClick={onTogglePlay}
						style={{ color: isPlaying ? '#ff4d4f' : '#52c41a' }}
					/>
				</Tooltip>

				<Tooltip title='Cài đặt'>
					<Button type='text' size='large' icon={<SettingOutlined />} />
				</Tooltip>
			</div>

			<style>{`
        @media (max-width: 480px) {
          .ant-segmented .ant-segmented-item-label {
            padding: 0 8px;
            font-size: 11px;
          }
        }
      `}</style>
		</div>
	);
};

export default FooterBar;
