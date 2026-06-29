import React, { useState } from 'react';
import { Button, message, Tabs, Modal } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, RobotOutlined, ToolOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { history } from 'umi';
import useInitModel from '@/hooks/useInitModel';
import Step1Subject from './components/Step1Subject';
import Step2Equipments from './components/Step2Equipments';
import Step3Properties from './components/Step3Properties';
import AiGenerate from './components/AiGenerate';
import { validateExperiment } from '@/utils/experiment-validator';
import './TaoThiNghiem.less';

const TaoThiNghiem: React.FC = () => {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'ai' | 'manual'>('manual');
  const { postModel } = useInitModel('scene');
  const [submitting, setSubmitting] = useState(false);

  const [sceneData, setSceneData] = useState<Partial<Scene.IRecord>>({
    name: '',
    roomType: 'physics',
    environment: { gravity: 9.81, temperature: 25 },
    objects: [],
  });

  const update = (val: Partial<Scene.IRecord>) => setSceneData((prev) => ({ ...prev, ...val }));

  const handleSave = async (data?: Partial<Scene.IRecord>) => {
    const payload = data || sceneData;
    if (!payload.name?.trim()) { message.warning('Vui lòng đặt tên thí nghiệm'); return; }

    const validation = validateExperiment(payload.objects || []);
    if (validation.errors.length > 0) {
      Modal.error({ title: 'Không thể lưu', content: validation.errors.join('\n'), centered: true });
      return;
    }
    if (validation.warnings.length > 0) {
      Modal.confirm({
        title: 'Thí nghiệm có thể chưa hoàn chỉnh',
        icon: <ExclamationCircleOutlined />,
        content: validation.warnings.join('\n'),
        okText: 'Vẫn lưu',
        cancelText: 'Quay lại',
        centered: true,
        onOk: () => doSave(payload),
      });
      return;
    }
    doSave(payload);
  };

  const doSave = async (payload: Partial<Scene.IRecord>) => {
    setSubmitting(true);
    try {
      if (postModel) {
        const result = await postModel(payload);
        const id = (result as any)?.data?.id || (result as any)?.id;
        if (id) {
          message.success('Tạo thí nghiệm thành công! Đang vào phòng lab...');
          setTimeout(() => history.push(`/thi-nghiem?id=${id}`), 600);
          return;
        }
      }
      history.push('/quan-ly-thi-nghiem');
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally { setSubmitting(false); }
  };

  const handleSwitchToManual = (data: Partial<Scene.IRecord>) => {
    setSceneData((prev) => ({ ...prev, ...data, objects: prev.objects || [] }));
    setMode('manual');
    setStep(1); // Skip step 0, go directly to equipment selection
  };

  const selectedCount = sceneData.objects?.length || 0;

  return (
    <div className="ttn-page">
      <Tabs
        activeKey={mode}
        onChange={(key) => setMode(key as 'ai' | 'manual')}
        centered
        tabBarStyle={{ marginBottom: 0, background: '#fff', borderRadius: '12px 12px 0 0', paddingTop: 8 }}
        items={[
          { key: 'ai', label: <span><RobotOutlined /> Tạo bằng AI</span> },
          { key: 'manual', label: <span><ToolOutlined /> Tạo thủ công</span> },
        ]}
      />

      {mode === 'ai' ? (
        <div className="ttn-body">
          <AiGenerate
            onAccept={handleSave}
            onSwitchToManual={handleSwitchToManual}
            submitting={submitting}
          />
        </div>
      ) : (
        <>
          <div className="ttn-topbar">
            <div className="ttn-topbar-left">
              {step > 0 ? (
                <Button icon={<ArrowLeftOutlined />} onClick={() => setStep((s) => s - 1)}>
                  Quay lại
                </Button>
              ) : (
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => history.push('/quan-ly-thi-nghiem')}>
                  Thoát
                </Button>
              )}
            </div>

            <div className="ttn-progress">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`ttn-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
              ))}
            </div>

            <div className="ttn-topbar-right">
              {step === 2 ? (
                <Button type="primary" onClick={() => handleSave()} loading={submitting} icon={<CheckOutlined />}>
                  {selectedCount > 0 ? `Hoàn tất (${selectedCount})` : 'Hoàn tất'}
                </Button>
              ) : (
                <Button type="primary" onClick={() => setStep((s) => s + 1)} icon={<ArrowRightOutlined />}>
                  Tiếp tục
                </Button>
              )}
            </div>
          </div>

          <div className="ttn-body">
            <div className={`ttn-panel ${step === 0 ? 'enter' : ''}`} key={step}>
              {step === 0 && <Step1Subject data={sceneData} onChange={update} />}
              {step === 1 && <Step2Equipments data={sceneData} onChange={update} />}
              {step === 2 && <Step3Properties data={sceneData} onChange={update} onBack={() => setStep(1)} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaoThiNghiem;
