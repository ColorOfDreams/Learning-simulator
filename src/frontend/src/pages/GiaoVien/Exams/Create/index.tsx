import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Tag, Select, Input, InputNumber, message, Form, Steps, Segmented, Card, Table, Row, Col, Spin, Divider } from 'antd';
import { ArrowLeftOutlined, RobotOutlined, UnorderedListOutlined, CheckOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import PageCard from '@/components/PageCard';
import { getQuestions } from '@/services/question-bank/api';
import { createExam, aiGenerateExam } from '@/services/exams/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const SUBJECTS: Record<string, string> = { math: 'Toán', physics: 'Lý', chemistry: 'Hóa' };
const TYPE_LABELS: Record<string, string> = { MULTIPLE_CHOICE: 'Trắc nghiệm', ESSAY: 'Tự luận', SHORT_ANSWER: 'Câu hỏi ngắn' };

const ExamCreate: React.FC = () => {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [form] = Form.useForm();
  const [sections, setSections] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Manual: question pool
  const [pool, setPool] = useState<any[]>([]);
  const [poolFilters, setPoolFilters] = useState<any>({});
  const [selectedPool, setSelectedPool] = useState<string[]>([]);

  // AI
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiForm] = Form.useForm();

  useEffect(() => {
    if (mode === 'manual') {
      getQuestions(poolFilters).then(res => setPool(res.data?.data || res.data || []));
    }
  }, [mode, poolFilters]);

  const handleAddSection = () => {
    setSections(p => [...p, { type: 'MULTIPLE_CHOICE', title: `Phần ${p.length + 1}`, maxScore: 0, questions: [] }]);
  };

  const handleAddQuestionsToSection = (sectionIdx: number, qIds: string[]) => {
    setSections((prev: any[]) => prev.map((s, i) =>
      i === sectionIdx ? { ...s, questions: [...s.questions, ...qIds.map(id => ({ questionId: id, score: 0 }))] } : s
    ));
    setSelectedPool([]);
  };

  const handleManualSubmit = async () => {
    const values = form.getFieldsValue();
    const totalScore = sections.reduce((sum, s) => sum + s.maxScore, 0);
    if (totalScore <= 0) { message.error('Tổng điểm phải > 0'); return; }
    setSubmitting(true);
    try {
      await createExam({
        ...values,
        grade: Number(values.grade),
        duration: values.duration ? Number(values.duration) : undefined,
        sections: sections.map(s => ({ ...s, maxScore: Number(s.maxScore) })),
      });
      message.success('Tạo đề thi thành công!');
      history.push('/giao-vien/exams');
    } catch { message.error('Lỗi khi tạo đề'); }
    setSubmitting(false);
  };

  const handleAiGenerate = async () => {
    const values = aiForm.getFieldsValue();
    setAiLoading(true);
    setAiPreview(null);
    try {
      const res = await aiGenerateExam({
        subject: values.subject,
        grade: Number(values.grade),
        topic: values.topic,
        duration: values.duration ? Number(values.duration) : undefined,
        difficulty: values.difficulty ? Number(values.difficulty) : undefined,
        sections: values.structure?.trim() ? values.structure.split('+').map((s: string) => {
          const m = s.match(/(\d+)([A-Z_]+)/);
          if (!m) return null;
          return { type: m[2], count: parseInt(m[1]), maxScore: 0 };
        }).filter(Boolean) : undefined,
      });
      setAiPreview(res.data?.data || res.data);
      message.success('AI đã tạo đề thi!');
    } catch { message.error('Lỗi AI tạo đề'); }
    setAiLoading(false);
  };

  const handleAiSave = async () => {
    if (!aiPreview) return;
    setSubmitting(true);
    try {
      await createExam({
        title: aiPreview.title,
        subject: aiPreview.subject,
        grade: aiPreview.grade,
        description: aiPreview.description,
        duration: aiPreview.duration,
        totalScore: aiPreview.totalScore,
        sections: aiPreview.sections,
      });
      message.success('Đã lưu đề thi!');
      history.push('/giao-vien/exams');
    } catch { message.error('Lỗi khi lưu'); }
    setSubmitting(false);
  };

  const poolColumns = [
    { title: 'Câu hỏi', dataIndex: 'question', key: 'question', width: 400, ellipsis: true, render: (t: string) => t.replace(/\$\$.*?\$\$/g, '[Math]').slice(0, 120) },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 100, render: (t: string) => <Tag>{TYPE_LABELS[t] || t}</Tag> },
    { title: 'Độ khó', dataIndex: 'difficulty', key: 'difficulty', width: 80, render: (d: number) => '★'.repeat(d) },
  ];

  return (
    <PageCard
      title={<Space><Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/giao-vien/exams')}>Quay lại</Button><Title level={4} style={{ margin: 0 }}>Tạo đề thi mới</Title></Space>}
    >
      <Steps current={step} style={{ marginBottom: 32 }} items={[
        { title: 'Thông tin đề' }, { title: mode === 'manual' ? 'Chọn câu hỏi' : 'AI tạo đề' }, { title: 'Hoàn tất' },
      ]} />

      {step === 0 && (
        <Card>
          <Segmented block value={mode} onChange={v => setMode(v as 'manual' | 'ai')} style={{ marginBottom: 24 }}
            options={[{ label: <><UnorderedListOutlined /> Tạo thủ công</>, value: 'manual' }, { label: <><RobotOutlined /> AI tạo đề</>, value: 'ai' }]}
          />
          <Form form={form} layout="vertical" initialValues={{ subject: 'math', grade: 10, totalScore: 10 }}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="title" label="Tên đề thi" rules={[{ required: true }]}><Input placeholder="VD: Đề kiểm tra 1 tiết Toán 10" /></Form.Item></Col>
              <Col span={12}><Form.Item name="description" label="Mô tả"><Input placeholder="Mô tả ngắn" /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}><Form.Item name="subject" label="Môn"><Select options={Object.entries(SUBJECTS).map(([k, v]) => ({ value: k, label: v }))} /></Form.Item></Col>
              <Col span={6}><Form.Item name="grade" label="Lớp"><Select options={[10, 11, 12].map(g => ({ value: g, label: `Lớp ${g}` }))} /></Form.Item></Col>
              <Col span={6}><Form.Item name="duration" label="Thời gian (phút)"><InputNumber min={1} max={180} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="totalScore" label="Tổng điểm"><InputNumber min={1} max={100} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Button type="primary" onClick={() => { if (form.getFieldsValue().title) setStep(1); else message.warning('Nhập tên đề thi'); }}>Tiếp theo</Button>
          </Form>
        </Card>
      )}

      {step === 1 && mode === 'manual' && (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Button type="dashed" onClick={handleAddSection}>+ Thêm phần</Button>
          </Space>
          {sections.map((sec, idx) => (
            <Card key={idx} size="small" title={
              <Space>
                <Select value={sec.type} onChange={v => setSections((p: any[]) => p.map((s, i) => i === idx ? { ...s, type: v } : s))}
                  style={{ width: 140 }} options={Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
                <Input style={{ width: 200 }} placeholder="Tên phần" value={sec.title} onChange={e => setSections((p: any[]) => p.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))} />
                <span>Điểm:</span>
                <InputNumber value={sec.maxScore} min={0} max={10} onChange={v => setSections((p: any[]) => p.map((s, i) => i === idx ? { ...s, maxScore: v || 0 } : s))} style={{ width: 70 }} />
                <Button danger size="small" onClick={() => setSections((p: any[]) => p.filter((_, i) => i !== idx))}>Xoá</Button>
              </Space>
            } style={{ marginBottom: 12 }}>
              {sec.questions.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {sec.questions.map((qref: any, qi: number) => {
                    const q = pool.find(p => p.id === qref.questionId);
                    return <Tag key={qi} closable onClose={() => setSections((p: any[]) => p.map((s, i) => i === idx ? { ...s, questions: s.questions.filter((_: any, j: number) => j !== qi) } : s))}>{q?.question?.slice(0, 60) || qref.questionId?.slice(0, 8)}</Tag>;
                  })}
                </div>
              )}
              <Button size="small" onClick={() => setSelectedPool([])}>Chọn từ ngân hàng</Button>
              {selectedPool.length > 0 && <Button size="small" type="primary" style={{ marginLeft: 8 }} onClick={() => handleAddQuestionsToSection(idx, selectedPool)}>Thêm {selectedPool.length} câu</Button>}
            </Card>
          ))}
          <Row gutter={16}>
            <Col span={12}>
              <Select allowClear placeholder="Lọc môn" style={{ width: 120 }} value={poolFilters.subject} onChange={v => setPoolFilters((p: any) => ({ ...p, subject: v }))} options={Object.entries(SUBJECTS).map(([k, v]) => ({ value: k, label: v }))} />
              <Select allowClear placeholder="Loại" style={{ width: 140, marginLeft: 8 }} value={poolFilters.type} onChange={v => setPoolFilters((p: any) => ({ ...p, type: v }))} options={Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
            </Col>
          </Row>
          <Table size="small" dataSource={pool} columns={poolColumns} rowKey="id" pagination={{ pageSize: 5 }}
            rowSelection={{ selectedRowKeys: selectedPool, onChange: setSelectedPool }}
          />
          <Divider />
          <Button type="primary" onClick={() => setStep(2)} icon={<CheckOutlined />}>Xem lại & Hoàn tất</Button>
        </div>
      )}

      {step === 1 && mode === 'ai' && (
        <Card>
          <Form form={aiForm} layout="vertical" initialValues={{ subject: 'math', grade: 10, difficulty: 2 }}>
            <Row gutter={16}>
              <Col span={6}><Form.Item name="subject" label="Môn"><Select options={Object.entries(SUBJECTS).map(([k, v]) => ({ value: k, label: v }))} /></Form.Item></Col>
              <Col span={6}><Form.Item name="grade" label="Lớp"><Select options={[10, 11, 12].map(g => ({ value: g, label: g }))} /></Form.Item></Col>
              <Col span={6}><Form.Item name="duration" label="Thời gian"><InputNumber min={1} max={180} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="difficulty" label="Độ khó (1-5)"><InputNumber min={1} max={5} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Form.Item name="topic" label="Chủ đề"><Input placeholder="Để trống → AI tự chọn" /></Form.Item>
            <Form.Item name="structure" label="Cấu trúc đề (tuỳ chọn)" help="VD: 20MULTIPLE_CHOICE+3ESSAY+5SHORT_ANSWER. Để trống → AI tự phân bố.">
              <Input placeholder="20MULTIPLE_CHOICE+3ESSAY+5SHORT_ANSWER" />
            </Form.Item>
            <Button type="primary" onClick={handleAiGenerate} loading={aiLoading} icon={<RobotOutlined />} size="large">AI tạo đề thi</Button>
          </Form>
        </Card>
      )}

      {step === 2 && mode === 'manual' && (
        <Card>
          <Title level={5}>Xem lại đề thi</Title>
          {sections.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <Text strong>{sec.title}</Text> - <Text type="secondary">{TYPE_LABELS[sec.type]} ({sec.questions.length} câu - {sec.maxScore} điểm)</Text>
            </div>
          ))}
          <Text>Tổng điểm: {sections.reduce((s, sec) => s + sec.maxScore, 0)}</Text>
          <Divider />
          <Space>
            <Button onClick={() => setStep(1)}>Quay lại</Button>
            <Button type="primary" onClick={handleManualSubmit} loading={submitting} icon={<SaveOutlined />}>Lưu đề thi</Button>
          </Space>
        </Card>
      )}

      {step === 2 && mode === 'ai' && aiPreview && (
        <Card>
          <Title level={5}>{aiPreview.title}</Title>
          <Space style={{ marginBottom: 16 }}>
            <Tag>{SUBJECTS[aiPreview.subject as keyof typeof SUBJECTS] || aiPreview.subject}</Tag>
            <Tag>Lớp {aiPreview.grade}</Tag>
            {aiPreview.duration && <Tag>{aiPreview.duration} phút</Tag>}
            <Tag>{aiPreview.totalScore} điểm</Tag>
            <Tag color="purple">AI tạo</Tag>
          </Space>
          {(aiPreview.sections || []).map((sec: any, idx: number) => (
            <Card key={idx} size="small" title={`${sec.title} (${TYPE_LABELS[sec.type] || sec.type} - ${sec.maxScore} điểm)`} style={{ marginBottom: 12 }}>
              {(sec.questions || []).map((q: any, qi: number) => (
                <div key={qi} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Text strong>{`Câu ${qi + 1}: `}</Text><Text>{q.question}</Text>
                  {q.options?.length > 0 && (
                    <div style={{ paddingLeft: 20, marginTop: 4 }}>
                      {q.options.map((o: any) => <div key={o.key}><Text>{o.key}. {o.text}</Text></div>)}
                    </div>
                  )}
                  <div style={{ paddingLeft: 20, marginTop: 2 }}><Text type="secondary">Đáp án: {q.correctAnswer}</Text></div>
                </div>
              ))}
            </Card>
          ))}
          <Divider />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleAiGenerate} loading={aiLoading}>Tạo lại</Button>
            <Button type="primary" onClick={handleAiSave} loading={submitting} icon={<SaveOutlined />}>Lưu đề thi</Button>
          </Space>
        </Card>
      )}
    </PageCard>
  );
};

export default ExamCreate;
