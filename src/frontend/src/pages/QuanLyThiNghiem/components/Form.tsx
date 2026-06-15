import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import useInitModel from '@/hooks/useInitModel';
import rules from '@/utils/rules';

const FormScene = () => {
  const [form] = Form.useForm();
  const { record, edit, setVisibleForm, postModel, putModel } = useInitModel<Scene.IRecord>('scene');

  useEffect(() => {
    if (edit && record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  }, [record, edit]);

  const onFinish = async (values: any) => {
    try {
      // Default sandbox params when creating a new scene
      if (!edit) {
        values.environment = { gravity: 9.81, temperature: 25 };
        values.objects = [];
      }

      if (edit) {
        await putModel(record?.id, values);
      } else {
        await postModel(values);
      }
      setVisibleForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item label="Tên thí nghiệm" name="name" rules={[rules.required]}>
        <Input placeholder="Nhập tên thí nghiệm" />
      </Form.Item>

      <Form.Item label="Môn học (Loại phòng)" name="roomType" rules={[rules.required]}>
        <Select placeholder="Chọn môn học">
          <Select.Option value="physics">Vật lý</Select.Option>
          <Select.Option value="chemistry">Hóa học</Select.Option>
          <Select.Option value="math">Toán học</Select.Option>
        </Select>
      </Form.Item>

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={() => setVisibleForm(false)}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu lại
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default FormScene;
