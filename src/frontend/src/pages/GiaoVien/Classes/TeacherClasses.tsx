import React, { useEffect, useState } from 'react';
import { history, useModel } from '@umijs/max';
import { Card, Typography, Spin, Badge, Button, Modal, Form, Input, message, Tooltip, Empty, Popconfirm } from 'antd';
import { PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTeacherClasses, createClass, deleteClass } from '@/services/classrooms/api';
import dayjs from 'dayjs';
import './TeacherClasses.less';

const { Title, Text } = Typography;

const TeacherClasses: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const user = initialState?.currentUser;
  
  const [classes, setClasses] = useState<ClassroomsAPI.ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchClasses = () => {
    setLoading(true);
    getTeacherClasses()
      .then(res => {
        setClasses(res.data?.data || res.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await createClass(values);
      message.success('Tạo lớp học thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchClasses();
    } catch (error) {
      message.error('Lỗi khi tạo lớp học');
    }
    setSubmitting(false);
  };

  const copyInviteLink = (e: React.MouseEvent, inviteCode: string) => {
    e.stopPropagation();
    const link = `${window.location.origin}/join?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    message.success('Đã copy link mời!');
  };

  const handleDeleteClass = async (e: React.MouseEvent, classId: string) => {
    e.stopPropagation();
    try {
      await deleteClass(classId);
      message.success('Đã xóa lớp học');
      fetchClasses();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa lớp');
    }
  };

  return (
    <div className="teacher-classes">
      <div className="teacher-classes__header">
        <div>
          <Title level={2}>Quản lý lớp học</Title>
          <Text type="secondary">Tạo lớp học, quản lý học sinh và giao bài tập</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Tạo lớp học mới
        </Button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : classes.length === 0 ? (
        <Empty 
          description="Bạn chưa tạo lớp học nào" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <div className="classes-grid">
          {classes.map(cls => (
            <Card 
              key={cls.id} 
              className="class-card" 
              hoverable 
              onClick={() => history.push(`/giao-vien/classes/${cls.id}`)}
            >
              <div className="class-card__header">
                <Title level={4}>{cls.name}</Title>
                <div className="class-card__stats" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Tooltip title="Số học sinh">
                    <Badge count={cls.members?.filter(m => m.status === 'APPROVED').length || 0} style={{ backgroundColor: '#1677ff' }} />
                  </Tooltip>
                  <Tooltip title="Học sinh chờ duyệt">
                    <Badge count={cls.members?.filter(m => m.status === 'PENDING').length || 0} style={{ backgroundColor: '#faad14' }} />
                  </Tooltip>
                  <Popconfirm 
                    title="Xóa lớp học?" 
                    description="Mọi dữ liệu sẽ bị xóa vĩnh viễn"
                    onConfirm={(e) => handleDeleteClass(e as any, cls.id)}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </Popconfirm>
                </div>
              </div>
              {cls.description && <p className="class-card__desc">{cls.description}</p>}
              
              <div className="class-card__meta">
                <div className="invite-code">
                  <span>Mã lớp: <strong>{cls.inviteCode}</strong></span>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={(e) => copyInviteLink(e, cls.inviteCode)}
                  />
                </div>
                <span>Tạo lúc: {dayjs(cls.createdAt).format('DD/MM/YYYY')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        title="Tạo lớp học mới"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item 
            name="name" 
            label="Tên lớp học" 
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}
          >
            <Input placeholder="VD: Lý 10A1" size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả lớp học (không bắt buộc)" rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Tạo lớp</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherClasses;
