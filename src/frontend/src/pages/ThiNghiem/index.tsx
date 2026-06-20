import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'umi';
import { useModel } from '@umijs/max';
import SandboxEngine from '@/simulations/engine/SandboxEngine';
import ChatSidebar from './components/ChatSidebar';
import FooterBar from './components/FooterBar';
import EquipmentDetail from './components/EquipmentDetail';
import useInitModel from '@/hooks/useInitModel';
import { Spin } from 'antd';

const ThiNghiem: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { getByIdModel } = useInitModel<Scene.IRecord>('scene');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [rotationAxis, setRotationAxis] = useState<'x' | 'y' | 'z' | null>(null);

  const { sceneGraph, initScene, clearScene, updateObjectPosition, updateObjectRotation, updateObjectProperty, updateAllProperties } = useModel('useSimulationModel');
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

  const handleUpdateProperty = (objectId: string, key: string, value: any) => {
    updateObjectProperty(objectId, key, value);
  };

  const handleUpdateAllProperties = (objectId: string, props: Record<string, any>) => {
    updateAllProperties(objectId, props);
  };

  const handleUpdateRotation = (objectId: string, rotation: [number, number, number]) => {
    updateObjectRotation(objectId, rotation);
  };

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
            selectedEquipmentId={selectedEquipmentId}
            onSelectEquipment={setSelectedEquipmentId}
            rotationAxis={rotationAxis}
            onSetRotationAxis={setRotationAxis}
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
      {selectedEquipmentId && (
        <EquipmentDetail
          objectId={selectedEquipmentId}
          sceneGraph={sceneGraph}
          isPlaying={isPlaying}
          onClose={() => { setSelectedEquipmentId(null); setRotationAxis(null); }}
          onUpdateProperty={handleUpdateProperty}
          onUpdateAllProperties={handleUpdateAllProperties}
          onUpdateRotation={handleUpdateRotation}
          rotationAxis={rotationAxis}
          onSetRotationAxis={setRotationAxis}
        />
      )}
    </div>
  );
};

export default ThiNghiem;
