import TableBase from '@/components/Table';
import type { IColumn } from '@/components/Table/typing';
import FormScene from './components/Form';

import { Popconfirm, Space } from 'antd';
import { history } from 'umi';
import useInitModel from '@/hooks/useInitModel';

const QuanLyThiNghiem = () => {
  const { deleteModel, getModel } = useInitModel<Scene.IRecord>('scene');

  const columns: IColumn<any>[] = [
    {
      title: 'Tên thí nghiệm',
      dataIndex: 'name',
      width: 250,
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
      width: 150,
      align: 'center',
      render: (val, record) => (
        <Space>
          <a
            onClick={(e) => {
              e.stopPropagation();
              history.push(`/thi-nghiem?id=${record.id}`);
            }}
            style={{ fontWeight: 'bold' }}
          >
            Vào phòng
          </a>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={(e) => {
              e?.stopPropagation();
              if (deleteModel) {
                deleteModel(record.id, getModel);
              }
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <a style={{ color: 'red' }} onClick={(e) => e.stopPropagation()}>
              Xóa
            </a>
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
