import React, { useEffect, useState } from 'react';
import { useParams, history, useModel } from '@umijs/max';
import { Typography, Spin, Button, Tabs, Tag, Popconfirm, message, Modal, Form, Input, DatePicker, Select, Space, Tooltip, Segmented } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, CheckOutlined, CloseOutlined, ShareAltOutlined, DeleteOutlined } from '@ant-design/icons';
import TableBase from '@/components/Table';
import type { IColumn } from '@/components/Table/typing';
import PageCard from '@/components/PageCard';
import { getClassById, updateMemberStatus, createAssignment, deleteClass } from '@/services/classrooms/api';
import dayjs from 'dayjs';
import './TeacherClassDetails.less';

const { Title, Text } = Typography;

const BUILT_IN_SIMULATIONS = [
  { value: 'MATH10-01', label: 'Đồ thị hàm số bậc hai (Toán)' },
  { value: 'MATH10-02', label: 'Chuyển động ném xiên & Parabol (Toán)' },
  { value: 'MATH10-03', label: 'Bất phương trình bậc nhất hai ẩn (Toán)' },
  { value: 'MATH10-04', label: 'Hệ thức lượng trong tam giác (Toán)' },
  { value: 'MATH10-05', label: 'Phương trình đường tròn và Ellipse (Toán)' },
  { value: 'MATH10-06', label: 'Thống kê (Toán)' },
  { value: 'CHEM10-04', label: 'Đốt cháy dây magnesium (Hóa học 10)' },
  { value: 'CHEM11-01', label: 'Độ pH và Chất chỉ thị (Hóa học 11)' },
  { value: 'CHEM11-02', label: 'Chuẩn độ Acid - Base (Hóa học 11)' },
  { value: 'CHEM12-01', label: 'Điều chế ethyl acetate (Hóa học 12)' }
];

const TeacherClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassroomsAPI.ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [form] = Form.useForm();
  
  const [simType, setSimType] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM');
  const [scenes, setScenes] = useState<Scene.IRecord[]>([]);
  const { getModel: getScenes } = useModel('scene');

  useEffect(() => {
    if (getScenes) {
      getScenes({ page: 1, limit: 1000, sort: { createdAt: -1 } }).then((res: any) => {
        if (res?.data?.result) {
          setScenes(res.data.result);
        } else if (Array.isArray(res?.data)) {
          setScenes(res.data);
        } else if (Array.isArray(res)) {
          setScenes(res);
        }
      }).catch(() => {});
    }
  }, []);

  const fetchClassDetails = () => {
    if (!id) return;
    setLoading(true);
    getClassById(id)
      .then(res => {
        setCls(res.data?.data || res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const handleMemberStatus = async (memberId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateMemberStatus(id!, memberId, status);
      message.success(status === 'APPROVED' ? 'Đã duyệt học sinh' : 'Đã từ chối học sinh');
      fetchClassDetails();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleCreateAssignment = async (values: any) => {
    setSubmittingAssignment(true);
    try {
      const formattedValues = {
        ...values,
        simulationId: Array.isArray(values.simulationId) ? values.simulationId[0] : values.simulationId,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      await createAssignment(id!, formattedValues);
      message.success('Đã giao bài tập thành công!');
      setAssignmentModalVisible(false);
      form.resetFields();
      fetchClassDetails();
    } catch (error) {
      message.error('Lỗi khi giao bài tập');
    }
    setSubmittingAssignment(false);
  };

  const handleDeleteClass = async () => {
    try {
      await deleteClass(id!);
      message.success('Đã xóa lớp học thành công');
      history.push('/giao-vien/classes');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa lớp');
    }
  };

  if (loading) {
    return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  if (!cls) return <div style={{ padding: 40 }}>Không tìm thấy lớp học</div>;

  const membersColumns: IColumn<ClassroomsAPI.ClassMember>[] = [
    { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 120 },
    { title: 'Họ và tên', dataIndex: 'studentName', key: 'studentName', width: 200 },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        if (status === 'PENDING') return <Tag color="warning">Chờ duyệt</Tag>;
        if (status === 'APPROVED') return <Tag color="success">Đã duyệt</Tag>;
        return <Tag color="error">Từ chối</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_: any, record: ClassroomsAPI.ClassMember) => {
        if (record.status === 'PENDING') {
          return (
            <Space size="small" style={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Duyệt">
                <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleMemberStatus(record.id, 'APPROVED')} />
              </Tooltip>
              <Popconfirm title="Bạn có chắc muốn từ chối?" onConfirm={() => handleMemberStatus(record.id, 'REJECTED')}>
                <Tooltip title="Từ chối">
                  <Button danger size="small" icon={<CloseOutlined />} />
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        }
        return null;
      }
    }
  ];

  const assignmentsColumns: IColumn<ClassroomsAPI.ClassAssignment>[] = [
    { title: 'Tên bài tập', dataIndex: 'title', key: 'title', width: 250 },
    { title: 'Mã thí nghiệm', dataIndex: 'simulationId', key: 'simulationId', width: 150 },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (date: string) => date ? dayjs(date).format('HH:mm DD/MM/YYYY') : 'Không có'
    },
    {
      title: 'Số bài nộp',
      key: 'submissions',
      width: 120,
      render: (_: any, record: ClassroomsAPI.ClassAssignment) => `${record.submissions?.length || 0} bài`
    }
  ];

  return (
    <div className="ttn-page">
      <PageCard
        title={
          <Space size="large">
            <Title level={3} style={{ margin: 0 }}>{cls.name}</Title>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<ShareAltOutlined />}
              onClick={() => {
                const link = `${window.location.origin}/join?code=${cls.inviteCode}`;
                navigator.clipboard.writeText(link);
                message.success('Đã copy link tham gia lớp học!');
              }}
            >
              Copy link
            </Button>
            <Popconfirm title="Bạn có chắc chắn muốn xóa lớp học này không? Mọi dữ liệu sẽ bị xóa vĩnh viễn." onConfirm={handleDeleteClass}>
              <Button danger icon={<DeleteOutlined />}>Xóa lớp</Button>
            </Popconfirm>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Mã lớp: <strong>{cls.inviteCode}</strong> | Tạo lúc: {dayjs(cls.createdAt).format('DD/MM/YYYY')}</Text>
        </div>

        <Tabs defaultActiveKey="1" className="class-tabs">
          <Tabs.TabPane tab="Thành viên" key="1">
            <TableBase
              modelName={"scene" as any}
              getData={() => { }}
              hideCard={true}
              otherProps={{ dataSource: cls.members, pagination: false, rowKey: 'id' }}
              columns={membersColumns}
              buttons={{ create: false, export: false, reload: false, globalSearch: false }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Bài tập" key="2">
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAssignmentModalVisible(true)}>
                Giao bài tập mới
              </Button>
            </div>
            <TableBase
              modelName={"scene" as any}
              getData={() => { }}
              hideCard={true}
              otherProps={{ dataSource: cls.assignments, pagination: false, rowKey: 'id' }}
              columns={assignmentsColumns}
              buttons={{ create: false, export: false, reload: false, globalSearch: false }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Kết quả & Điểm số" key="3">
            {/* Simple display of results for MVP */}
            <div className="results-container">
              {cls.assignments?.map(ass => (
                <div key={ass.id} className="result-section">
                  <Title level={5}>{ass.title}</Title>
                  <TableBase
                    modelName={"scene" as any}
                    getData={() => { }}
                    hideCard={true}
                    otherProps={{ dataSource: ass.submissions, pagination: false, size: 'small', rowKey: 'id' }}
                    buttons={{ create: false, export: false, reload: false, globalSearch: false }}
                    columns={[
                      {
                        title: 'Học sinh',
                        key: 'student',
                        width: 250,
                        render: (_: any, sub: ClassroomsAPI.AssignmentSubmission) => {
                          const m = cls.members.find(x => x.id === sub.memberId);
                          return m ? `${m.studentName} (${m.studentCode})` : 'Unknown';
                        }
                      },
                      { title: 'Điểm số', dataIndex: 'score', key: 'score', width: 100, render: (score: number) => <strong style={{ color: '#1677ff' }}>{score}</strong> },
                      { title: 'Thời gian nộp', dataIndex: 'submittedAt', key: 'submittedAt', width: 180, render: (date: string) => dayjs(date).format('HH:mm DD/MM/YYYY') },
                    ]}
                  />
                </div>
              ))}
              {cls.assignments?.length === 0 && <Text type="secondary">Chưa có bài tập nào.</Text>}
            </div>
          </Tabs.TabPane>
        </Tabs>

        <Modal
          title="Giao bài tập mới"
          visible={isAssignmentModalVisible}
          onCancel={() => setAssignmentModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateAssignment}>
            <Form.Item name="title" label="Tên bài tập" rules={[{ required: true }]}>
              <Input placeholder="VD: Bài tập thực hành Chuyển động thẳng" />
            </Form.Item>

            <Form.Item label="Nguồn thí nghiệm" style={{ marginBottom: 16 }}>
              <Segmented
                block
                options={[
                  { label: 'Thí nghiệm hệ thống', value: 'SYSTEM' },
                  { label: 'Thí nghiệm của tôi', value: 'CUSTOM' }
                ]}
                value={simType}
                onChange={(val) => {
                  setSimType(val as 'SYSTEM' | 'CUSTOM');
                  form.setFieldsValue({ simulationId: undefined });
                }}
              />
            </Form.Item>

            <Form.Item 
              name="simulationId" 
              label="Mã thí nghiệm" 
              rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập mã thí nghiệm' }]}
              tooltip="Chọn từ danh sách hoặc nhập mã SIM- (nhấn Enter để thêm mã tự do)"
            >
              <Select 
                showSearch
                mode="tags"
                maxCount={1}
                placeholder={simType === 'SYSTEM' ? "Tìm và chọn thí nghiệm hệ thống..." : "Tìm thí nghiệm của bạn..."}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                options={simType === 'SYSTEM' 
                  ? BUILT_IN_SIMULATIONS 
                  : (scenes?.map(s => ({
                      value: s.id,
                      label: `${s.name} ${s.roomType ? `(${s.roomType})` : ''}`
                    })) || [])
                }
              />
            </Form.Item>
            <Form.Item name="description" label="Ghi chú">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="dueDate" label="Hạn nộp bài">
              <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button onClick={() => setAssignmentModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submittingAssignment}>Giao bài</Button>
            </Form.Item>
          </Form>
        </Modal>
      </PageCard>
    </div>
  );
};

export default TeacherClassDetails;
