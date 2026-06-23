import useInitModel from '@/hooks/useInitModel';
import SandboxEngine from '@/simulations/engine/SandboxEngine';
import { useModel } from '@umijs/max';
import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'umi';
import ChatSidebar from './components/ChatSidebar';
import FooterBar from './components/FooterBar';

const ThiNghiem: React.FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { getByIdModel } = useInitModel<Scene.IRecord>('scene');
	const [loading, setLoading] = useState(true);
	const [isPlaying, setIsPlaying] = useState(false);
	const [interactionMode, setInteractionMode] = useState<'observe' | 'practice'>('observe');
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const { sceneGraph, initScene, clearScene, updateObjectPosition } = useModel('useSimulationModel');
	const { openChatbot, closeChatbot } = useModel('useAIChatBotModel');

	useEffect(() => {
		const fetchScene = async () => {
			if (id) {
				setLoading(true);
				if (getByIdModel) {
					const data = await getByIdModel(id);
					if (data) {
						initScene(data as Scene.IRecord);
						openChatbot(data.roomType);
					}
				}
				setLoading(false);
			}
		};
		fetchScene();

		return () => {
			clearScene();
			closeChatbot();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					background: '#f0f2f5',
				}}
			>
				<Spin size='large' tip='Đang nạp dữ liệu phòng thí nghiệm...' />
			</div>
		);
	}

	return (
		<div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>
			<ChatSidebar
				collapsed={sidebarCollapsed}
				onToggle={() => setSidebarCollapsed((prev) => !prev)}
				subject={sceneGraph?.roomType}
			/>

			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
				<div style={{ flex: 1, position: 'relative' }}>
					<SandboxEngine
						sceneGraph={sceneGraph}
						isPlaying={isPlaying}
						interactionMode={interactionMode}
						onUpdatePosition={updateObjectPosition}
					/>
				</div>
				<FooterBar
					isPlaying={isPlaying}
					onTogglePlay={() => setIsPlaying((prev) => !prev)}
					interactionMode={interactionMode}
					onToggleMode={() => setInteractionMode((prev) => (prev === 'observe' ? 'practice' : 'observe'))}
					sidebarCollapsed={sidebarCollapsed}
					onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
				/>
			</div>
		</div>
	);
};

export default ThiNghiem;
