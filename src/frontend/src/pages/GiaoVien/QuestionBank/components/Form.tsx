import { resetFieldsForm } from '@/utils/utils';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, Form, Input, InputNumber, Row, Segmented, Space } from 'antd';
import { useEffect } from 'react';
import { useModel } from 'umi';
import SelectMonHoc from '@/pages/DanhMuc/MonHoc/components/Select';
import SelectLop from '@/pages/DanhMuc/Lop/components/Select';
import SelectLoaiCauHoi from '@/pages/DanhMuc/LoaiCauHoi/components/Select';
import SelectChuDe from '@/pages/DanhMuc/ChuDe/components/Select';
import SelectDoKho from '@/pages/DanhMuc/DoKho/components/Select';

const { TextArea } = Input;

const FormCauHoi = (props: any) => {
  const [form] = Form.useForm();
  const { record, setVisibleForm, edit, postModel, putModel, formSubmiting, visibleForm } = useModel('question-bank');
  const title = props?.title ?? '';

  useEffect(() => {
    if (!visibleForm) {
      resetFieldsForm(form);
      return;
    }
    if (record?._id) {
      let opts = record.options;
      if (typeof opts === 'string') {
        try { opts = JSON.parse(opts); } catch { opts = []; }
      }
      let answerMode = 'TEXT_ANSWER';
      if (opts && opts.length > 0) {
        answerMode = 'MULTIPLE_CHOICE';
      } else {
        opts = [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }];
      }
      form.setFieldsValue({ ...record, options: opts, answerMode });
    }
  }, [record, visibleForm]);

  const onFinish = async (values: any) => {
    const payload = { ...values };
    if (payload.answerMode === 'TEXT_ANSWER') payload.options = [];
    delete payload.answerMode;
    if (typeof payload.options === 'string') {
      try { payload.options = JSON.parse(payload.options); } catch { payload.options = undefined; }
    }
    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    if (edit) {
      putModel(record?.id ?? record?._id ?? '', payload);
    } else {
      postModel(payload);
    }
  };

  return (
    <Card title={(edit ? 'Sửa' : 'Thêm mới') + ' câu hỏi'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{
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
        <Form.Item name="question" label="Nội dung câu hỏi" rules={[{ required: true }]}>
          <TextArea rows={3} placeholder="Hỗ trợ LaTeX: $$...$$" />
        </Form.Item>

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
                          currentArray.sort();
                          setFieldsValue({ correctAnswer: currentArray.join(',') });
                        }}
                      />
                      <Form.Item {...field} name={[field.name, 'key']}
                        rules={[{ required: true, message: 'Nhập key (A, B, C...)' }]}
                        style={{ marginBottom: 0 }}>
                        <Input placeholder="Key (A)" style={{ width: 80 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'text']}
                        rules={[{ required: true, message: 'Nhập nội dung đáp án' }]}
                        style={{ marginBottom: 0 }}>
                        <Input placeholder="Nội dung đáp án" style={{ width: 400 }} />
                      </Form.Item>
                      <DeleteOutlined onClick={() => remove(field.name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm đáp án</Button>
                </div>
              )}
            </Form.List>
          ) : (
            <Form.Item name="correctAnswer" label="Đáp án đúng" rules={[{ required: true }]}>
              <TextArea rows={3} placeholder="Nhập đáp án đúng hoặc đoạn văn bản mẫu..." />
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item name="explanation" label="Giải thích"><TextArea rows={2} /></Form.Item>
        <Form.Item name="tags" label="Tags (phân cách dấu phẩy)"><Input placeholder="VD: đạo hàm, giới hạn" /></Form.Item>
        <div className="form-footer">
          <Button type="primary" htmlType="submit" loading={formSubmiting}>
            {edit ? 'Cập nhật' : 'Tạo'}
          </Button>
          <Button onClick={() => setVisibleForm(false)}>Hủy</Button>
        </div>
      </Form>
    </Card>
  );
};

export default FormCauHoi;
