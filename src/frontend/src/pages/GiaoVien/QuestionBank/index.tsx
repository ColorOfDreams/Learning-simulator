import { useState } from 'react';
import { Typography, Button, Space, Tag, Tooltip, Popconfirm, message, Modal, Row, Col, InputNumber } from 'antd';
import { RobotOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import TableBase from '@/components/Table';
import type { IColumn } from '@/components/Table/typing';
import Formula from '@/components/Formula';
import { aiGenerateQuestions } from '@/services/question-bank/api';
import { useModel } from 'umi';
import 'katex/dist/katex.min.css';
import FormCauHoi from './components/Form';
import SelectMonHoc from '@/pages/DanhMuc/MonHoc/components/Select';
import SelectLop from '@/pages/DanhMuc/Lop/components/Select';
import SelectLoaiCauHoi from '@/pages/DanhMuc/LoaiCauHoi/components/Select';
import SelectChuDe from '@/pages/DanhMuc/ChuDe/components/Select';
import SelectDoKho from '@/pages/DanhMuc/DoKho/components/Select';

const { Title } = Typography;

const diffColors: Record<string, string> = { '1': 'green', '2': 'lime', '3': 'gold', '4': 'orange', '5': 'red' };
const typeLabels: Record<string, string> = { MULTIPLE_CHOICE: 'Trắc nghiệm', ESSAY: 'Tự luận', SHORT_ANSWER: 'Ngắn' };

const QBank: React.FC = () => {
  const { handleEdit, deleteModel, getModel } = useModel('question-bank');
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleAiGenerate = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await aiGenerateQuestions(values);
      message.success(`Đã tạo ${res.data?.data?.length || 0} câu hỏi`);
      setAiModalVisible(false); aiForm.resetFields();
    } catch { message.error('Lỗi AI generate'); }
    setSubmitting(false);
  };

  const columns: IColumn<any>[] = [
    {
      title: 'Câu hỏi', dataIndex: 'question', key: 'question', width: 350, ellipsis: true,
      filterType: 'string',
      render: (t: string) => <Formula style={{ fontSize: 13, display: 'inline-block', maxHeight: 48, overflow: 'hidden' }}>{t}</Formula>,
    },
    { title: 'Môn', dataIndex: 'subject', key: 'subject', width: 100, filterType: 'string' },
    { title: 'Lớp', dataIndex: 'grade', key: 'grade', width: 80, filterType: 'string', align: 'center' },
    {
      title: 'Loại', dataIndex: 'type', key: 'type', width: 120,
      render: (t: string) => <Tag>{typeLabels[t] || t}</Tag>,
    },
    { title: 'Chủ đề', dataIndex: 'topic', key: 'topic', width: 150, ellipsis: true, filterType: 'string' },
    {
      title: 'Độ khó', dataIndex: 'difficulty', key: 'difficulty', width: 80, align: 'center',
      render: (d: number) => <Tag color={diffColors[String(d)]}>{'★'.repeat(d)}</Tag>,
    },
    {
      title: 'Thao tác', key: 'action', width: 90, align: 'center', fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Sửa câu hỏi">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="Xoá câu hỏi này?" onConfirm={() => deleteModel(record._id, getModel)}>
            <Tooltip title="Xoá câu hỏi">
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <TableBase
        columns={columns}
        modelName="question-bank"
        title="Ngân hàng câu hỏi"
        Form={FormCauHoi}
        buttons={{ import: true, create: true, export: false }}
        otherButtons={[
          <Button key="ai" icon={<RobotOutlined />} onClick={() => { aiForm.resetFields(); setAiModalVisible(true); }}>
            AI sinh câu hỏi
          </Button>,
        ]}
        otherProps={{
          rowKey: 'id',
          pagination: { pageSize: 20 },
        }}
      />

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
    </>
  );
};

export default QBank;
