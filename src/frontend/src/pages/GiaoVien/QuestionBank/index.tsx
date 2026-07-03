import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Tag, Select, Input, message, Modal, Form, InputNumber, Popconfirm, Row, Col, Tooltip, Checkbox, Segmented } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, RobotOutlined } from '@ant-design/icons';
import PageCard from '@/components/PageCard';
import Formula from '@/components/Formula';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, aiGenerateQuestions } from '@/services/question-bank/api';
import 'katex/dist/katex.min.css';
import TableStaticData from '@/components/Table/TableStaticData';
import { UploadOutlined } from '@ant-design/icons';
import SelectMonHoc from '@/pages/DanhMuc/MonHoc/components/Select';
import SelectLop from '@/pages/DanhMuc/Lop/components/Select';
import SelectLoaiCauHoi from '@/pages/DanhMuc/LoaiCauHoi/components/Select';
import SelectChuDe from '@/pages/DanhMuc/ChuDe/components/Select';
import SelectDoKho from '@/pages/DanhMuc/DoKho/components/Select';

const { Title, Text } = Typography;
const { TextArea } = Input;
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
    try {
      setSubmitting(true);
      const payload = { ...values };
      // Nếu là TEXT_ANSWER thì xóa mảng options đi để không lưu rác vào DB
      if (payload.answerMode === 'TEXT_ANSWER') {
        payload.options = [];
      }
      delete payload.answerMode; // Xóa answerMode khỏi payload vì DB không có trường này

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
    { title: 'Câu hỏi', dataIndex: 'question', key: 'question', width: 350, ellipsis: true, render: (t: string) => <Formula style={{ fontSize: 13, display: 'inline-block', maxHeight: 48, overflow: 'hidden' }}>{t}</Formula> },
    { title: 'Môn', dataIndex: 'subject', key: 'subject', width: 100, render: (s: string) => s },
    { title: 'Lớp', dataIndex: 'grade', key: 'grade', width: 80, render: (g: number) => g },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 120, render: (t: string) => <Tag>{t}</Tag> },
    { title: 'Chủ đề', dataIndex: 'topic', key: 'topic', width: 150, ellipsis: true, render: (t: string) => t },
    { title: 'Độ khó', dataIndex: 'difficulty', key: 'difficulty', width: 80, align: 'center' as const, render: (d: number) => <Tag color={diffColors[String(d)]}>{'★'.repeat(d)}</Tag> },
    {
      title: 'Thao tác', key: 'action', width: 100, align: 'center' as const,
      render: (_: any, r: any) => (
        <Space size="small">
          <Tooltip title="Sửa câu hỏi">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
              let opts = r.options;
              if (typeof opts === 'string') {
                try { opts = JSON.parse(opts); } catch { opts = []; }
              }
              let answerMode = 'TEXT_ANSWER';
              if (opts && opts.length > 0) {
                answerMode = 'MULTIPLE_CHOICE';
              } else {
                opts = [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }];
              }
              setEditing(r);
              form.setFieldsValue({ ...r, options: opts, answerMode });
              setModalVisible(true);
            }} />
          </Tooltip>
          <Popconfirm title="Xoá câu hỏi này?" onConfirm={() => handleDelete(r.id)}>
            <Tooltip title="Xoá câu hỏi">
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageCard title={<Title level={3} style={{ margin: 0 }}>Ngân hàng câu hỏi</Title>}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col><SelectMonHoc allowClear placeholder="Môn" style={{ width: 120 }} value={filters.subject} onChange={v => setFilters((p: any) => ({ ...p, subject: v }))} hasCreate={false} /></Col>
        <Col><SelectLop allowClear placeholder="Lớp" style={{ width: 80 }} value={filters.grade} onChange={v => setFilters((p: any) => ({ ...p, grade: v }))} hasCreate={false} /></Col>
        <Col><SelectLoaiCauHoi allowClear placeholder="Loại" style={{ width: 140 }} value={filters.type} onChange={v => setFilters((p: any) => ({ ...p, type: v }))} hasCreate={false} /></Col>
        <Col><SelectDoKho allowClear placeholder="Độ khó" style={{ width: 100 }} value={filters.difficulty} onChange={v => setFilters((p: any) => ({ ...p, difficulty: v }))} hasCreate={false} /></Col>
        <Col><SelectChuDe allowClear placeholder="Chủ đề" style={{ width: 120 }} value={filters.topic} onChange={v => setFilters((p: any) => ({ ...p, topic: v }))} hasCreate={false} subjectCode={filters.subject} gradeCode={filters.grade} /></Col>
        <Col flex="auto"><Input.Search placeholder="Tìm câu hỏi..." onSearch={v => setFilters((p: any) => ({ ...p, search: v || undefined }))} /></Col>
      </Row>

      <TableStaticData
        data={questions}
        columns={columns}
        hasCreate={false}
        otherButtons={[
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalVisible(true); }}>Tạo câu hỏi</Button>,
          <Button key="ai" icon={<RobotOutlined />} onClick={() => { aiForm.resetFields(); setAiModalVisible(true); }}>AI sinh câu hỏi</Button>,
          <Button key="import" icon={<UploadOutlined />} onClick={() => message.info('Tính năng Import câu hỏi')}>Import câu hỏi</Button>
        ]}
        otherProps={{
          rowKey: 'id',
          loading,
          size: 'small',
          pagination: { pageSize: 20 },
        }}
      />

      <Modal title={editing ? 'Sửa câu hỏi' : 'Tạo câu hỏi'} open={modalVisible} onCancel={() => { setModalVisible(false); setEditing(null); }} footer={null} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{
          answerMode: 'MULTIPLE_CHOICE', difficulty: 2, grade: 10, subject: 'math',
          options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }]
        }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="type" label="Loại" rules={[{ required: true }]}><SelectLoaiCauHoi /></Form.Item></Col>
            <Col span={8}><Form.Item name="subject" label="Môn" rules={[{ required: true }]}><SelectMonHoc /></Form.Item></Col>
            <Col span={4}><Form.Item name="grade" label="Lớp" rules={[{ required: true }]}><SelectLop /></Form.Item></Col>
            <Col span={4}><Form.Item name="difficulty" label="Độ khó"><SelectDoKho /></Form.Item></Col>
          </Row>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.subject !== cur.subject || prev.grade !== cur.grade}>
            {({ getFieldValue }) => (
              <Form.Item name="topic" label="Chủ đề">
                <SelectChuDe allowClear placeholder="Chọn chủ đề" subjectCode={getFieldValue('subject')} gradeCode={getFieldValue('grade')} />
              </Form.Item>
            )}
          </Form.Item>
          <Form.Item name="question" label="Nội dung câu hỏi" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="Hỗ trợ LaTeX: $$...$$" /></Form.Item>

          <Form.Item name="answerMode" label="Định dạng trả lời" style={{ marginBottom: 16 }}>
            <Segmented
              options={[
                { label: 'Trắc nghiệm / Chọn nhiều đáp án', value: 'MULTIPLE_CHOICE' },
                { label: 'Tự luận / Câu hỏi ngắn', value: 'TEXT_ANSWER' },
              ]}
            />
          </Form.Item>

          <Form.Item name="correctAnswer" noStyle />
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.answerMode !== cur.answerMode || prev.correctAnswer !== cur.correctAnswer || prev.options !== cur.options}>
            {({ getFieldValue, setFieldsValue }) => getFieldValue('answerMode') === 'MULTIPLE_CHOICE' ? (
              <Form.List name="options">
                {(fields, { add, remove }) => (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Đáp án:</div>
                    {fields.map((field) => (
                      <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Checkbox
                          checked={(getFieldValue('correctAnswer') || '').split(',').map((s: string) => s.trim()).includes(getFieldValue(['options', field.name, 'key']))}
                          onChange={(e) => {
                            const optionKey = getFieldValue(['options', field.name, 'key']);
                            if (!optionKey) return;
                            const currentAns = getFieldValue('correctAnswer') || '';
                            let currentArray = currentAns.split(',').map((s: string) => s.trim()).filter(Boolean);
                            if (e.target.checked) {
                              if (!currentArray.includes(optionKey)) currentArray.push(optionKey);
                            } else {
                              currentArray = currentArray.filter((k: string) => k !== optionKey);
                            }
                            // Sort array to keep A,B,C,D order if possible
                            currentArray.sort();
                            setFieldsValue({ correctAnswer: currentArray.join(',') });
                          }}
                        />
                        <Form.Item
                          {...field}
                          name={[field.name, 'key']}
                          rules={[{ required: true, message: 'Nhập key (A, B, C...)' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Key (A)" style={{ width: 80 }} />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'text']}
                          rules={[{ required: true, message: 'Nhập nội dung đáp án' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Nội dung đáp án" style={{ width: 480 }} />
                        </Form.Item>
                        <DeleteOutlined onClick={() => remove(field.name)} style={{ color: 'red' }} />
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm đáp án
                    </Button>
                  </div>
                )}
              </Form.List>
            ) : (
              <Form.Item name="correctAnswer" label="Đáp án đúng" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="Nhập đáp án đúng hoặc đoạn văn bản mẫu..." /></Form.Item>
            )}
          </Form.Item>
          <Form.Item name="explanation" label="Giải thích"><TextArea rows={2} /></Form.Item>
          <Form.Item name="tags" label="Tags (phân cách dấu phẩy)"><Input placeholder="VD: đạo hàm, giới hạn" /></Form.Item>
          <div className="form-footer">
            <Button type="primary" htmlType="submit" loading={submitting}>{editing ? 'Cập nhật' : 'Tạo'}</Button>
            <Button onClick={() => { setModalVisible(false); setEditing(null); }}>Hủy</Button>
          </div>
        </Form>
      </Modal>

      <Modal title="AI sinh câu hỏi" open={aiModalVisible} onCancel={() => setAiModalVisible(false)} footer={null} width={500}>
        <Form form={aiForm} layout="vertical" onFinish={handleAiGenerate} initialValues={{ subject: 'math', grade: 10, type: 'MULTIPLE_CHOICE', count: 5, difficulty: 2 }}>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="subject" label="Môn" rules={[{ required: true }]}><SelectMonHoc hasCreate={false} /></Form.Item></Col>
            <Col span={12}><Form.Item name="grade" label="Lớp" rules={[{ required: true }]}><SelectLop hasCreate={false} /></Form.Item></Col>
          </Row>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.subject !== cur.subject || prev.grade !== cur.grade}>
            {({ getFieldValue }) => (
              <Form.Item name="topic" label="Chủ đề">
                <SelectChuDe allowClear placeholder="Để trống → AI tự chọn" hasCreate={false} subjectCode={getFieldValue('subject')} gradeCode={getFieldValue('grade')} />
              </Form.Item>
            )}
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item name="type" label="Loại câu hỏi"><SelectLoaiCauHoi allowClear placeholder="Hỗn hợp" hasCreate={false} /></Form.Item></Col>
            <Col span={6}><Form.Item name="count" label="Số lượng"><InputNumber min={1} max={20} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={6}><Form.Item name="difficulty" label="Độ khó"><SelectDoKho hasCreate={false} /></Form.Item></Col>
          </Row>
          <div className="form-footer">
            <Button type="primary" htmlType="submit" loading={submitting} icon={<RobotOutlined />}>AI sinh câu hỏi</Button>
            <Button onClick={() => setAiModalVisible(false)}>Hủy</Button>
          </div>
        </Form>
      </Modal>
    </PageCard>
  );
};

export default QBank;
