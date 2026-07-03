import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Tag, Select, Input, message, Modal, Form, InputNumber, Segmented, Table, Popconfirm, Row, Col, Card } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, RobotOutlined } from '@ant-design/icons';
import PageCard from '@/components/PageCard';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, aiGenerateQuestions } from '@/services/question-bank/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SUBJECTS = { math: 'Toán', physics: 'Lý', chemistry: 'Hóa' };
const QUESTION_TYPES: Record<string, string> = { MULTIPLE_CHOICE: 'Trắc nghiệm', ESSAY: 'Tự luận', SHORT_ANSWER: 'Câu hỏi ngắn' };

const QBank: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();

  const fetchQuestions = () => {
    setLoading(true);
    getQuestions(filters).then(res => setQuestions(res.data?.data || res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(); }, [filters]);

  const handleSave = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = { ...values };
      if (typeof payload.options === 'string') {
        try { payload.options = JSON.parse(payload.options); } catch { payload.options = undefined; }
      }
      if (typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      if (editing) { await updateQuestion(editing.id, payload); message.success('Đã cập nhật'); }
      else { await createQuestion(payload); message.success('Đã tạo câu hỏi'); }
      setModalVisible(false); setEditing(null); form.resetFields(); fetchQuestions();
    } catch { message.error('Lỗi khi lưu'); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await deleteQuestion(id); message.success('Đã xoá'); fetchQuestions();
  };

  const handleAiGenerate = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await aiGenerateQuestions(values);
      message.success(`Đã tạo ${res.data?.data?.length || 0} câu hỏi`);
      setAiModalVisible(false); aiForm.resetFields(); fetchQuestions();
    } catch { message.error('Lỗi AI generate'); }
    setSubmitting(false);
  };

  const typeColors: Record<string, string> = { MULTIPLE_CHOICE: 'blue', ESSAY: 'green', SHORT_ANSWER: 'orange' };
  const diffColors: Record<string, string> = { '1': 'green', '2': 'lime', '3': 'gold', '4': 'orange', '5': 'red' };

  const columns = [
    { title: 'Câu hỏi', dataIndex: 'question', key: 'question', width: 350, ellipsis: true, render: (t: string) => <Text style={{ fontSize: 13 }}>{t.replace(/\$\$.*?\$\$/g, '[Math]').slice(0, 100)}...</Text> },
    { title: 'Môn', dataIndex: 'subject', key: 'subject', width: 70, render: (s: string) => <Tag>{SUBJECTS[s as keyof typeof SUBJECTS] || s}</Tag> },
    { title: 'Lớp', dataIndex: 'grade', key: 'grade', width: 60, align: 'center' as const },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 110, render: (t: string) => <Tag color={typeColors[t] || 'default'}>{QUESTION_TYPES[t] || t}</Tag> },
    { title: 'Chủ đề', dataIndex: 'topic', key: 'topic', width: 100, ellipsis: true },
    { title: 'Độ khó', dataIndex: 'difficulty', key: 'difficulty', width: 80, align: 'center' as const, render: (d: number) => <Tag color={diffColors[String(d)]}>{'★'.repeat(d)}</Tag> },
    {
      title: '', key: 'action', width: 80,
      render: (_: any, r: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalVisible(true); }} />
          <Popconfirm title="Xoá câu hỏi?" onConfirm={() => handleDelete(r.id)}><Button type="link" danger size="small" icon={<DeleteOutlined />} /></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageCard title={<Title level={3} style={{ margin: 0 }}>Ngân hàng câu hỏi</Title>}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col><Select allowClear placeholder="Môn" style={{ width: 120 }} value={filters.subject} onChange={v => setFilters(p => ({ ...p, subject: v }))} options={Object.entries(SUBJECTS).map(([k, v]) => ({ value: k, label: v }))} /></Col>
        <Col><Select allowClear placeholder="Lớp" style={{ width: 80 }} value={filters.grade} onChange={v => setFilters(p => ({ ...p, grade: v }))} options={[10, 11, 12].map(g => ({ value: g, label: `Lớp ${g}` }))} /></Col>
        <Col><Select allowClear placeholder="Loại" style={{ width: 140 }} value={filters.type} onChange={v => setFilters(p => ({ ...p, type: v }))} options={Object.entries(QUESTION_TYPES).map(([k, v]) => ({ value: k, label: v }))} /></Col>
        <Col><Select allowClear placeholder="Độ khó" style={{ width: 100 }} value={filters.difficulty} onChange={v => setFilters(p => ({ ...p, difficulty: v }))} options={[1,2,3,4,5].map(d => ({ value: d, label: '★'.repeat(d) }))} /></Col>
        <Col flex="auto"><Input.Search placeholder="Tìm câu hỏi..." onSearch={v => setFilters(p => ({ ...p, search: v || undefined }))} /></Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalVisible(true); }}>Tạo câu hỏi</Button>
        <Button icon={<RobotOutlined />} onClick={() => { aiForm.resetFields(); setAiModalVisible(true); }}>AI sinh câu hỏi</Button>
      </Space>

      <Table dataSource={questions} columns={columns} rowKey="id" loading={loading} size="small" pagination={{ pageSize: 20 }} />

      <Modal title={editing ? 'Sửa câu hỏi' : 'Tạo câu hỏi'} open={modalVisible} onCancel={() => { setModalVisible(false); setEditing(null); }} footer={null} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ type: 'MULTIPLE_CHOICE', difficulty: 2, grade: 10, subject: 'math' }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="type" label="Loại" rules={[{ required: true }]}><Select options={Object.entries(QUESTION_TYPES).map(([k, v]) => ({ value: k, label: v }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="subject" label="Môn" rules={[{ required: true }]}><Select options={Object.entries(SUBJECTS).map(([k, v]) => ({ value: k, label: v }))} /></Form.Item></Col>
            <Col span={4}><Form.Item name="grade" label="Lớp" rules={[{ required: true }]}><Select options={[10, 11, 12].map(g => ({ value: g, label: g }))} /></Form.Item></Col>
            <Col span={4}><Form.Item name="difficulty" label="Độ khó"><InputNumber min={1} max={5} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="topic" label="Chủ đề"><Input placeholder="VD: Đạo hàm, Điện trường, Este" /></Form.Item>
          <Form.Item name="question" label="Nội dung câu hỏi" rules={[{ required: true }]}><TextArea rows={3} placeholder="Hỗ trợ LaTeX: $$...$$" /></Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) => getFieldValue('type') === 'MULTIPLE_CHOICE' ? (
              <Form.Item name="options" label="Đáp án (mặc định 4 lựa chọn)">
                <Input.TextArea rows={3} placeholder='[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}]' />
              </Form.Item>
            ) : null}
          </Form.Item>
          <Form.Item name="correctAnswer" label="Đáp án đúng" rules={[{ required: true }]}><Input placeholder="VD: A hoặc nội dung đáp án" /></Form.Item>
          <Form.Item name="explanation" label="Giải thích"><TextArea rows={2} /></Form.Item>
          <Form.Item name="tags" label="Tags (phân cách dấu phẩy)"><Input placeholder="VD: đạo hàm, giới hạn" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>{editing ? 'Cập nhật' : 'Tạo'}</Button>
        </Form>
      </Modal>

      <Modal title="AI sinh câu hỏi" open={aiModalVisible} onCancel={() => setAiModalVisible(false)} footer={null} width={500}>
        <Form form={aiForm} layout="vertical" onFinish={handleAiGenerate} initialValues={{ subject: 'math', grade: 10, type: 'MULTIPLE_CHOICE', count: 5, difficulty: 2 }}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="subject" label="Môn" rules={[{ required: true }]}><Select options={Object.entries(SUBJECTS).map(([k, v]) => ({ value: k, label: v }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="grade" label="Lớp" rules={[{ required: true }]}><Select options={[10, 11, 12].map(g => ({ value: g, label: g }))} /></Form.Item></Col>
          </Row>
          <Form.Item name="topic" label="Chủ đề"><Input placeholder="Để trống → AI tự chọn" /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="type" label="Loại câu hỏi"><Select options={[{ value: '', label: 'Hỗn hợp' }, ...Object.entries(QUESTION_TYPES).map(([k, v]) => ({ value: k, label: v }))]} /></Form.Item></Col>
            <Col span={6}><Form.Item name="count" label="Số lượng"><InputNumber min={1} max={20} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="difficulty" label="Độ khó"><InputNumber min={1} max={5} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Button type="primary" htmlType="submit" loading={submitting} icon={<RobotOutlined />} size="large">AI sinh câu hỏi</Button>
        </Form>
      </Modal>
    </PageCard>
  );
};

export default QBank;
