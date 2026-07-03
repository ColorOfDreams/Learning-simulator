import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Select } from 'antd';
import { useEffect } from 'react';
import { useModel } from 'umi';
import FormLop from './Form';

/**
 * Secect Lớp để cho vào FormItem
 */
const SelectLop = (props: {
	value?: string | null;
	onChange?: (val: string | null) => void;
	multiple?: boolean;
	hasCreate?: boolean;
  style?: React.CSSProperties;
  allowClear?: boolean;
  placeholder?: string;
}) => {
	const { value, onChange, multiple, hasCreate, style, allowClear, placeholder } = props;
	const { danhSach, getAllModel, setVisibleForm, visibleForm, setEdit, setRecord } = useModel('danhmuc.lop');

	useEffect(() => {
		if (!visibleForm) getAllModel();
	}, [visibleForm]);

	const onAddNew = () => {
		setRecord(undefined);
		setEdit(false);
		setVisibleForm(true);
	};

	return (
		<div style={{ display: 'flex', gap: 8, ...style }}>
			<div className={hasCreate !== false ? 'width-select-custom' : 'fullWidth'} style={{ flex: 1 }}>
				<Select
					mode={multiple ? 'multiple' : undefined}
					value={value}
					onChange={onChange}
					options={danhSach.map((item: any) => ({
						key: item.code,
						value: item.code,
						label: item.name,
					}))}
					showSearch
					optionFilterProp='label'
					placeholder={placeholder || 'Chọn lớp'}
          allowClear={allowClear}
          style={{ width: '100%' }}
				/>
			</div>

			{hasCreate !== false ? (
				<>
					<Button icon={<PlusOutlined />} onClick={onAddNew} />
					<Modal open={visibleForm} bodyStyle={{ padding: 0 }} footer={null} onCancel={() => setVisibleForm(false)}>
						<FormLop title='lớp' />
					</Modal>
				</>
			) : null}
		</div>
	);
};

export default SelectLop;
