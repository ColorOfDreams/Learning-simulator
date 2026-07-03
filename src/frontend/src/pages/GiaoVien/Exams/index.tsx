import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Tag, Select, Table, Popconfirm, message, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import PageCard from '@/components/PageCard';
import { getExams, deleteExam } from '@/services/exams/api';

const { Title, Text } = Typography;
const SUBJECTS: Record<string, string> = { math: 'Toán', physics: 'Lý', chemistry: 'Hóa' };

const ExamList: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});

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
    { title: 'Môn', dataIndex: 'subject', key: 'subject', width: 70, render: (s: string) => <Tag>{SUBJECTS[s] || s}</Tag> },
    { title: 'Lớp', dataIndex: 'grade', key: 'grade', width: 60, align: 'center' as const },
    { title: 'Số câu', dataIndex: 'questionCount', key: 'questionCount', width: 70, align: 'center' as const },
    { title: 'Thời gian', dataIndex: 'duration', key: 'duration', width: 80, render: (d: number) => d ? `${d} phút` : '--' },
    { title: 'Tổng điểm', dataIndex: 'totalScore', key: 'totalScore', width: 80, align: 'center' as const },
    { title: 'Loại', dataIndex: 'isAIGenerated', key: 'isAIGenerated', width: 80, render: (v: boolean) => <Tag color={v ? 'purple' : 'blue'}>{v ? 'AI tạo' : 'Thủ công'}</Tag> },
    {
      title: '', key: 'action', width: 140,
      render: (_: any, r: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => window.open(`/giao-vien/exams/${r.id}/print`, '_blank')}>Xem</Button>
          <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => window.open(`/giao-vien/exams/${r.id}/print`, '_blank')}>In</Button>
          <Popconfirm title="Xoá đề thi?" onConfirm={() => handleDelete(r.id)}><Button type="link" danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageCard title={<Title level={3} style={{ margin: 0 }}>Đề thi</Title>}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col><Select allowClear placeholder="Môn" style={{ width: 120 }} value={filters.subject} onChange={v => setFilters(p => ({ ...p, subject: v }))} options={Object.entries(SUBJECTS).map(([k, v]) => ({ value: k, label: v }))} /></Col>
        <Col><Select allowClear placeholder="Lớp" style={{ width: 80 }} value={filters.grade} onChange={v => setFilters(p => ({ ...p, grade: v }))} options={[10, 11, 12].map(g => ({ value: g, label: `Lớp ${g}` }))} /></Col>
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push('/giao-vien/exams/create')}>Tạo đề thi mới</Button>
        </Col>
      </Row>
      <Table dataSource={exams} columns={columns} rowKey="id" loading={loading} size="small" pagination={{ pageSize: 20 }} />
    </PageCard>
  );
};

export default ExamList;
