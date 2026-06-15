import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'umi';
import { useModel } from '@umijs/max';
import SandboxEngine from '@/simulations/engine/SandboxEngine';
import ThiNghiemOverlay from './components/ThiNghiemOverlay';
import useInitModel from '@/hooks/useInitModel';
import { Spin } from 'antd';

const ThiNghiem: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { getByIdModel } = useInitModel<Scene.IRecord>('scene');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'observe' | 'practice'>('observe');

  // Kết nối với global model
  const { sceneGraph, initScene, clearScene, addObject, updateObjectPosition } = useModel('useSimulationModel');

  useEffect(() => {
    const fetchScene = async () => {
      if (id) {
        setLoading(true);
        if (getByIdModel) {
          const data = await getByIdModel(id);
          if (data) {
            initScene(data as Scene.IRecord);
          }
        }
        setLoading(false);
      }
    };
    fetchScene();

    return () => {
      clearScene(); // Dọn dẹp khi rời phòng
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <Spin size="large" tip="Đang nạp dữ liệu phòng thí nghiệm..." />
      </div>
    );
  }


  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <ThiNghiemOverlay 
        sceneGraph={sceneGraph} 
        onAddObject={addObject} 
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(prev => !prev)}
        interactionMode={interactionMode}
        onToggleMode={() => setInteractionMode(prev => prev === 'observe' ? 'practice' : 'observe')}
      />
      <SandboxEngine 
        sceneGraph={sceneGraph} 
        isPlaying={isPlaying} 
        interactionMode={interactionMode} 
        onUpdatePosition={updateObjectPosition}
      />
    </div>
  );
};

export default ThiNghiem;
