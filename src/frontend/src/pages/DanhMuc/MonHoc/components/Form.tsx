import rules from '@/utils/rules';
import { resetFieldsForm } from '@/utils/utils';
import { Button, Card, Form, Input } from 'antd';
import { useEffect } from 'react';
import { useModel } from 'umi';

const FormMonHoc = (props: any) => {
	const [form] = Form.useForm();
	const { record, setVisibleForm, edit, postModel, putModel, formSubmiting, visibleForm } = useModel('danhmuc.mon-hoc');
	const title = props?.title ?? '';

	useEffect(() => {
		if (!visibleForm) resetFieldsForm(form);
		else if (record?.id || record?._id) form.setFieldsValue(record);
	}, [record?.id, record?._id, visibleForm]);

	const onFinish = async (values: any) => {
		if (edit) {
			putModel(record?.id ?? record?._id ?? '', values)
				.then()
				.catch((er: any) => console.log(er));
		} else {
			postModel(values)
				.then(() => form.resetFields())
				.catch((er: any) => console.log(er));
    }
	};

	return (
		<Card title={(edit ? 'Chỉnh sửa ' : 'Thêm mới ') + title?.toLowerCase()}>
			<Form onFinish={onFinish} form={form} layout='vertical'>
				<Form.Item name='code' label='Mã' rules={[...rules.required, ...rules.text, ...rules.length(100)]}>
					<Input placeholder='Mã (vd: math, 10, A...)' />
				</Form.Item>

				<Form.Item name='name' label='Tên' rules={[...rules.required, ...rules.text, ...rules.length(250)]}>
					<Input placeholder='Tên hiển thị' />
				</Form.Item>

        <Form.Item name='description' label='Mô tả'>
					<Input.TextArea placeholder='Mô tả thêm (không bắt buộc)' rows={3} />
				</Form.Item>

				<div className='form-footer'>
					<Button loading={formSubmiting} htmlType='submit' type='primary'>
						{!edit ? 'Thêm mới' : 'Lưu lại'}
					</Button>
					<Button onClick={() => setVisibleForm(false)}>Hủy</Button>
				</div>
			</Form>
		</Card>
	);
};

export default FormMonHoc;
