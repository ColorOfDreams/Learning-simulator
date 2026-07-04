import TableBase from '@/components/Table';
import { type IColumn } from '@/components/Table/typing';
import { formatDateTime } from '@/utils/formatDate';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip } from 'antd';
import { useModel } from 'umi';
import Form from './components/Form';

const ChuDePage = () => {
	const { getModel, page, limit, deleteModel, handleEdit } = useModel('danhmuc.chu-de');

	const columns: IColumn<DanhMuc.ChuDe>[] = [
		{
			title: 'Mã',
			dataIndex: 'code',
			width: 120,
			filterType: 'string',
			sortable: true,
			resizable: true,
		},
		{
			title: 'Môn học',
			dataIndex: 'subjectCode',
			width: 120,
			filterType: 'string',
			sortable: true,
			resizable: true,
		},
		{
			title: 'Lớp',
			dataIndex: 'gradeCode',
			width: 120,
			filterType: 'string',
			sortable: true,
			resizable: true,
		},
		{
			title: 'Tên chủ đề',
			dataIndex: 'name',
			width: 250,
			minWidth: 150,
			maxWidth: 600,
			filterType: 'string',
			sortable: true,
			resizable: true,
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			width: 200,
			filterType: 'string',
			sortable: true,
			resizable: true,
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			align: 'center',
			width: 150,
			filterType: 'datetime',
			sortable: true,
			render: (val: any) => formatDateTime(val),
			resizable: true,
		},
		{
			title: 'Thao tác',
			align: 'center',
			width: 90,
			fixed: 'right',
			render: (record: any) => (
				<>
					<Tooltip title='Chỉnh sửa'>
						<Button onClick={() => handleEdit(record)} type='link' icon={<EditOutlined />} />
					</Tooltip>
					<Tooltip title='Xóa'>
						<Popconfirm
							onConfirm={() => deleteModel(record.id ?? record._id, getModel)}
							title='Bạn có chắc chắn muốn xóa chủ đề này?'
							placement='topLeft'
						>
							<Button danger type='link' icon={<DeleteOutlined />} />
						</Popconfirm>
					</Tooltip>
				</>
			),
		},
	];

	return (
		<TableBase
			columns={columns}
			dependencies={[page, limit]}
			modelName='danhmuc.chu-de'
			title='Chủ đề'
			Form={Form}
			buttons={{ import: true }}
		/>
	);
};

export default ChuDePage;
