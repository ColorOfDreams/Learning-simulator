import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'umi';
import { useModel } from '@umijs/max';
import SandboxEngine from '@/simulations/engine/SandboxEngine';
import ChatSidebar from './components/ChatSidebar';
import FooterBar from './components/FooterBar';
import useInitModel from '@/hooks/useInitModel';
import { Spin } from 'antd';

const ThiNghiem: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { getByIdModel } = useInitModel<Scene.IRecord>('scene');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { sceneGraph, initScene, clearScene, updateObjectPosition } = useModel('useSimulationModel');
  const { openChatbot, closeChatbot, requestGuidance } = useModel('useAIChatBotModel');

  useEffect(() => {
    const load = async () => {
      if (!id) { setLoading(false); return; }
      setLoading(true);
      if (getByIdModel) {
        const data = await getByIdModel(id);
        if (data) {
          initScene(data as Scene.IRecord);
          openChatbot(data.roomType, data);
        }
      }
      setLoading(false);
    };
    load();
    return () => { clearScene(); closeChatbot(); };
  }, [id]);

  const handleGuidance = useCallback(() => {
    if (sceneGraph) requestGuidance(sceneGraph);
  }, [sceneGraph, requestGuidance]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <Spin size="large" tip="Đang nạp phòng thí nghiệm..." />
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
            onUpdatePosition={updateObjectPosition}
          />
        </div>
        <FooterBar
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onRequestGuidance={handleGuidance}
        />
      </div>
    </div>
  );
};

export default ThiNghiem;
