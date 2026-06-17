import React, { useState } from 'react';
import { Card, Steps, Button, message } from 'antd';
import { history } from 'umi';
import useInitModel from '@/hooks/useInitModel';
import Step1Subject from './components/Step1Subject';
import Step2Equipments from './components/Step2Equipments';
import Step3Properties from './components/Step3Properties';

const { Step } = Steps;

const TaoThiNghiem = () => {
  const [current, setCurrent] = useState(0);
  const { postModel } = useInitModel<Scene.IRecord>('scene');
  const [sceneData, setSceneData] = useState<Partial<Scene.IRecord>>({
    name: '',
    roomType: 'physics',
    environment: { gravity: 9.81, temperature: 25 },
    objects: [],
  });

  const steps = [
    {
      title: 'Phân môn & Môi trường',
      content: <Step1Subject data={sceneData} onChange={setSceneData} />,
    },
    {
      title: 'Chọn dụng cụ',
      content: <Step2Equipments data={sceneData} onChange={setSceneData} />,
    },
    {
      title: 'Thiết lập thông số',
      content: <Step3Properties data={sceneData} onChange={setSceneData} />,
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const onFinish = async () => {
    if (!sceneData.name) {
      message.error('Vui lòng nhập tên thí nghiệm!');
      setCurrent(0);
      return;
    }

    try {
      let result;
      if (postModel) {
        result = await postModel(sceneData);
      }
      message.success('Tạo thí nghiệm thành công!');
      if (result?.id) {
        history.push(`/thi-nghiem?id=${result.id}`);
      } else {
        history.push('/quan-ly-thi-nghiem');
      }
    } catch (err) {
      console.error(err);
      message.error('Lỗi lưu thí nghiệm. Xem console để biết thêm chi tiết.');
    }
  };

  return (
    <Card title="Tạo mới Thí Nghiệm" bordered={false}>
      <Steps current={current}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ marginTop: 24, minHeight: '400px' }}>{steps[current].content}</div>
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Quay lại
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Tiếp theo
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={onFinish}>
            Hoàn tất & Chơi thử
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TaoThiNghiem;
