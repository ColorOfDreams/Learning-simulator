import TableBase from '@/components/Table';
import type { IColumn } from '@/components/Table/typing';
import FormScene from './components/Form';

import { DeleteOutlined, LoginOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tooltip } from 'antd';
import { history } from 'umi';
import useInitModel from '@/hooks/useInitModel';

const QuanLyThiNghiem = () => {
  const { deleteModel, getModel } = useInitModel<Scene.IRecord>('scene');

  const columns: IColumn<any>[] = [
    {
      title: 'Tên thí nghiệm',
      dataIndex: 'name',
      width: 150,
      filterType: 'string',
    },
    {
      title: 'Loại phòng',
      dataIndex: 'roomType',
      width: 150,
      filterType: 'string',
      render: (val) => {
        const types: Record<string, string> = {
          physics: 'Vật lý',
          chemistry: 'Hóa học',
          math: 'Toán học',
        };
        return types[val] || val;
      },
    },
    {
      title: 'Thao tác',
      width: 80,
      align: 'center',
      render: (val, record) => (
        <Space>
          <Tooltip title="Vào phòng">
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                history.push(`/thi-nghiem?id=${record.id}`);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            placement="topRight"
            onConfirm={(e) => {
              e?.stopPropagation()
              if (deleteModel) {
                deleteModel(record.id, getModel);
              }
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Tooltip title="Xóa">
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <TableBase
      title="Danh sách thí nghiệm (Sandbox)"
      modelName="scene"
      columns={columns}
      onCreateClick={() => history.push('/tao-thi-nghiem')}
      buttons={{
        create: true,
        export: true,
        reload: true,
      }}
      rowSelection={true}
      deleteMany={true}
    />
  );
};

export default QuanLyThiNghiem;
