import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'umi';
import { useModel } from '@umijs/max';
import SandboxEngine from '@/simulations/engine/SandboxEngine';
import ChatSidebar from './components/ChatSidebar';
import FooterBar from './components/FooterBar';
import EquipmentDetail from './components/EquipmentDetail';
import GuidanceCard from './components/GuidanceCard';
import useInitModel from '@/hooks/useInitModel';
import { Spin, message, notification, Button } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { openLabSession } from '@/services/base/api';

const ThiNghiem: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { getByIdModel } = useInitModel<Scene.IRecord>('scene');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [rotationAxis, setRotationAxis] = useState<'x' | 'y' | 'z' | null>(null);
  const [showGuidanceOverlay, setShowGuidanceOverlay] = useState(true);

  const { sceneGraph, initScene, clearScene, updateObjectPosition, updateObjectRotation, updateObjectProperty, updateAllProperties, wrongActionData, guidanceSteps, setGuidanceSteps, currentStepIndex, nextStep } = useModel('useSimulationModel');
  const { openChatbot, closeChatbot, requestGuidance, sendMessage, messages } = useModel('useAIChatBotModel');

  const prevStepRef = useRef(currentStepIndex);

  useEffect(() => {
    if (wrongActionData) {
      setSidebarCollapsed(false);

      const translateAction = (action: string) => {
        if (action === 'pour') return 'đổ / cho';
        if (action === 'drag_and_drop') return 'kéo thả';
        if (action === 'update_property') return 'điều chỉnh / tương tác';
        return action;
      };

      const translateModel = (model: string) => {
        if (!model) return '';
        const map: Record<string, string> = {
          'ChemicalSolid': 'hóa chất rắn',
          'ChemicalLiquid': 'hóa chất lỏng',
          'ChemicalGas': 'chất khí',
          'Beaker': 'cốc mỏ',
          'TestTube': 'ống nghiệm',
          'ErlenmeyerFlask': 'bình tam giác',
          'BunsenBurner': 'đèn cồn',
          'Stand': 'giá đỡ',
          'SimplePendulum': 'con lắc đơn',
          'SpringPendulum': 'con lắc lò xo',
          'Spring': 'lò xo',
          'MassBlock': 'quả nặng',
          'WoodenBlock': 'khối gỗ',
          'Stopwatch': 'đồng hồ bấm giây',
          'Dashpot': 'bộ giảm chấn',
          'DrivingMotor': 'động cơ',
          'EnergyMeter': 'đồng hồ năng lượng',
          'Table': 'bàn',
        };
        return map[model] || model;
      };

      const expType = translateAction(wrongActionData.expected.type);
      const expSource = translateModel(wrongActionData.expected.sourceModel);
      const expTarget = translateModel(wrongActionData.expected.targetModel);
      
      const actType = translateAction(wrongActionData.actual.actionType);
      const actSource = translateModel(wrongActionData.actual.source);
      const actTarget = translateModel(wrongActionData.actual.target);

      const expectedText = expTarget 
        ? `${expType} ${expSource} vào ${expTarget}` 
        : `${expType} ${expSource}`;
      
      const actualText = `${actType} ${actSource || 'dụng cụ'} vào ${actTarget || '...'}`;

      const sysPrompt = `Hệ thống: Học sinh thao tác sai so với yêu cầu của bước hiện tại. 
Bước hiện tại yêu cầu: "${expectedText}" 
Nhưng học sinh lại làm: "${actualText}". 
Đóng vai AI trợ giảng, hãy đưa ra lời khuyên ngắn gọn (dưới 50 chữ), nhắc nhở nhẹ nhàng học sinh làm theo đúng yêu cầu của bước hiện tại. KHÔNG bịa ra các quy tắc an toàn hóa học sai lệch hay yêu cầu các dụng cụ (như cốc có nắp, khay chuyên dụng) không có trong bài.`;

      sendMessage(sysPrompt, { hidden: true });
    }
  }, [wrongActionData]);

  useEffect(() => {
    if (prevStepRef.current !== currentStepIndex) {
      if (currentStepIndex > prevStepRef.current) {
        message.success(`🎉 Đã hoàn thành bước ${currentStepIndex}, chuyển sang bước tiếp theo!`, 3);
      }
      prevStepRef.current = currentStepIndex;
    }
  }, [currentStepIndex]);

  useEffect(() => {
    const guidanceMsg = messages.find(m => m.sender === 'guidance');
    if (guidanceMsg && guidanceMsg.metadata?.steps) {
      setGuidanceSteps(guidanceMsg.metadata.steps as any[]);
      setShowGuidanceOverlay(true);
    }
  }, [messages]);

  useEffect(() => {
    const load = async () => {
      if (!id) { setLoading(false); return; }
      setLoading(true);
      if (getByIdModel) {
        const data = await getByIdModel(id);
        if (data) {
          initScene(data as Scene.IRecord);
          openChatbot(data.roomType, data);
          openLabSession({
            simulationId: id,
            simulationTitle: data.name,
            subject: data.roomType,
          }).catch(() => {});
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
        simId={id || ''}
        title={sceneGraph?.name}
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

          {/* Hướng dẫn Overlay */}
          {guidanceSteps && guidanceSteps.length > 0 && (
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {!showGuidanceOverlay ? (
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={<BulbOutlined />} 
                  size="large"
                  onClick={() => setShowGuidanceOverlay(true)}
                  style={{ background: '#f59e0b', borderColor: '#f59e0b', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}
                />
              ) : (
                <GuidanceCard 
                  steps={guidanceSteps} 
                  currentStepIndex={currentStepIndex} 
                  isOverlay={true} 
                  onClose={() => setShowGuidanceOverlay(false)}
                  onNextStep={nextStep}
                />
              )}
            </div>
          )}
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
