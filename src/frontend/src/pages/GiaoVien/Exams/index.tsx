import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Tag, Select, Tooltip, Popconfirm, message, Row, Col, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import PageCard from '@/components/PageCard';
import { getExams, deleteExam } from '@/services/exams/api';
import TableStaticData from '@/components/Table/TableStaticData';
import PreviewFile from '@/components/PreviewFile';
import SelectMonHoc from '@/pages/DanhMuc/MonHoc/components/Select';
import SelectLop from '@/pages/DanhMuc/Lop/components/Select';

const { Title, Text } = Typography;

const ExamList: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const fetchExams = () => {
    setLoading(true);
    getExams(filters).then(res => setExams(res.data?.data || res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, [filters]);

  const handleDelete = async (id: string) => {
    await deleteExam(id); message.success('Đã xoá'); fetchExams();
  };

  const columns = [
    { title: 'Tên đề thi', dataIndex: 'title', key: 'title', width: 300 },
    { title: 'Môn', dataIndex: 'subject', key: 'subject', width: 100, render: (s: string) => <Tag color="blue">{s}</Tag> },
    { title: 'Lớp', dataIndex: 'grade', key: 'grade', width: 80, align: 'center' as const, render: (g: number) => <Tag color="green">{g}</Tag> },
    { title: 'Số câu', dataIndex: 'questionCount', key: 'questionCount', width: 70, align: 'center' as const },
    { title: 'Thời gian', dataIndex: 'duration', key: 'duration', width: 80, render: (d: number) => d ? `${d} phút` : '--' },
    { title: 'Tổng điểm', dataIndex: 'totalScore', key: 'totalScore', width: 80, align: 'center' as const },
    { title: 'Loại', dataIndex: 'isAIGenerated', key: 'isAIGenerated', width: 80, render: (v: boolean) => <Tag color={v ? 'purple' : 'blue'}>{v ? 'AI tạo' : 'Thủ công'}</Tag> },
    {
      title: 'Thao tác', key: 'action', width: 120, align: 'center' as const,
      render: (_: any, r: any) => (
        <Space size="small">
          <Tooltip title="Xem đề thi">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setPreviewUrl(`/giao-vien/exams/${r.id}/print`)} />
          </Tooltip>
          <Tooltip title="In đề thi">
            <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => window.open(`/giao-vien/exams/${r.id}/print`, '_blank')} />
          </Tooltip>
          <Popconfirm title="Xoá đề thi này?" onConfirm={() => handleDelete(r.id)}>
            <Tooltip title="Xoá đề thi">
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageCard title={<Title level={3} style={{ margin: 0 }}>Đề thi</Title>}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col><SelectMonHoc allowClear placeholder="Môn" style={{ width: 120 }} value={filters.subject} onChange={v => setFilters((p: any) => ({ ...p, subject: v }))} hasCreate={false} /></Col>
        <Col><SelectLop allowClear placeholder="Lớp" style={{ width: 80 }} value={filters.grade} onChange={v => setFilters((p: any) => ({ ...p, grade: v }))} hasCreate={false} /></Col>
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push('/giao-vien/exams/create')}>Tạo đề thi mới</Button>
        </Col>
      </Row>
      <TableStaticData
        data={exams}
        columns={columns}
        hasCreate={false}
        otherProps={{ rowKey: 'id', loading, size: 'small', pagination: { pageSize: 20 } }}
      />

      <Modal
        open={!!previewUrl}
        onCancel={() => setPreviewUrl('')}
        footer={null}
        width={1000}
        destroyOnClose
        title="Xem trước đề thi"
      >
        <div style={{ height: '80vh', overflow: 'hidden' }}>
          <PreviewFile file={previewUrl} style={{ height: '100%' }} />
        </div>
      </Modal>
    </PageCard>
  );
};

export default ExamList;
