import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Select } from 'antd';
import { useEffect } from 'react';
import { useModel } from 'umi';
import FormChuDe from './Form';

/**
 * Secect Chủ đề để cho vào FormItem
 */
const SelectChuDe = (props: {
	value?: string | null;
	onChange?: (val: string | null) => void;
	multiple?: boolean;
	hasCreate?: boolean;
  style?: React.CSSProperties;
  allowClear?: boolean;
  placeholder?: string;
  subjectCode?: string;
  gradeCode?: string | number;
}) => {
	const { value, onChange, multiple, hasCreate, style, allowClear, placeholder, subjectCode, gradeCode } = props;
	const { danhSach, getAllModel, setVisibleForm, visibleForm, setEdit, setRecord, condition } = useModel('danhmuc.chu-de');

	useEffect(() => {
		if (!visibleForm) {
      const fetchCondition: any = { ...condition };
      if (subjectCode) fetchCondition.subjectCode = subjectCode;
      if (gradeCode) fetchCondition.gradeCode = String(gradeCode);
      getAllModel(false, undefined, fetchCondition);
    }
	}, [visibleForm, subjectCode, gradeCode]);

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
					placeholder={placeholder || 'Chọn chủ đề'}
          allowClear={allowClear}
          style={{ width: '100%' }}
				/>
			</div>

			{hasCreate !== false ? (
				<>
					<Button icon={<PlusOutlined />} onClick={onAddNew} />
					<Modal open={visibleForm} bodyStyle={{ padding: 0 }} footer={null} onCancel={() => setVisibleForm(false)}>
						<FormChuDe title='chủ đề' />
					</Modal>
				</>
			) : null}
		</div>
	);
};

export default SelectChuDe;
