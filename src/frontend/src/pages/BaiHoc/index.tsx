import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';
import { BookOutlined, ExperimentOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Input, Pagination, Row, Segmented, Skeleton, Typography } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import './index.less';

const { Title } = Typography;

const PAGE_SIZE = 12;

const ROOM_LABELS: Record<string, string> = {
  physics: 'Vật lý',
  chemistry: 'Hóa học',
  math: 'Toán học',
};

interface SceneItem {
  id: string;
  name: string;
  roomType: string;
  image?: string;
}

const BaiHoc: React.FC = () => {
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [roomType, setRoomType] = useState<string>('');
  const [page, setPage] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchScenes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, any> = {
        page,
        limit: PAGE_SIZE,
      };
      if (roomType) params.roomType = roomType;
      if (keyword.trim()) params.keyword = keyword.trim();
      const res = await axios.get(`${ip3}/scene/page`, { params });
      const payload = res.data.data;
      setScenes(payload?.result ?? payload ?? []);
      setTotal(payload?.total ?? 0);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, roomType, keyword]);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((val: string | number) => {
    setRoomType(val as string);
    setKeyword('');
    setPage(1);
  }, []);

  const handleCardClick = useCallback((id: string) => {
    history.push(`/thi-nghiem?id=${id}`);
  }, []);

  const renderSkeletons = () => (
    <Row gutter={[20, 20]}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Col xs={24} sm={12} md={8} lg={6} key={i}>
          <Card>
            <Skeleton.Image style={{ width: '100%', height: 180 }} />
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderCards = () => {
    if (!scenes.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không tìm thấy bài học nào"
          style={{ marginTop: 48 }}
        />
      );
    }

    return (
      <>
        <Row gutter={[20, 20]}>
          {scenes.map((item, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                hoverable
                className="lesson-card"
                style={{ animationDelay: `${index * 0.06}s` }}
                onClick={() => handleCardClick(item.id)}
                cover={
                  <div className={`card-cover cover-${item.roomType}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cover-placeholder">
                        <ExperimentOutlined />
                      </div>
                    )}
                    <span className="cover-badge">{ROOM_LABELS[item.roomType] || item.roomType}</span>
                  </div>
                }
              >
                <Card.Meta title={<span className="card-title-text">{item.name}</span>} />
              </Card>
            </Col>
          ))}
        </Row>
        {total > PAGE_SIZE && (
          <div className="pagination-wrap">
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="bai-hoc-page">
      <div className="hero-section">
        <div className="hero-content">
          <BookOutlined className="hero-icon" />
          <Title level={2} className="hero-title">
            Khám phá bài học
          </Title>
          <p className="hero-subtitle">
            Trải nghiệm phòng thí nghiệm 3D tương tác — Vật lý, Hóa học, Toán học
          </p>
          <div className="hero-search">
            <Input
              size="large"
              placeholder="Tìm kiếm bài học..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={handleSearch}
              allowClear
            />
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <Segmented
          options={[
            { label: 'Tất cả', value: '' },
            { label: 'Vật lý', value: 'physics' },
            { label: 'Hóa học', value: 'chemistry' },
            { label: 'Toán học', value: 'math' },
          ]}
          value={roomType}
          onChange={handleFilterChange}
          size="large"
        />
      </div>

      <div className="content-area">
        {loading ? (
          renderSkeletons()
        ) : error ? (
          <Empty description="Không thể tải danh sách bài học" style={{ marginTop: 48 }}>
            <a onClick={fetchScenes}>Thử lại</a>
          </Empty>
        ) : (
          renderCards()
        )}
      </div>
    </div>
  );
};

export default BaiHoc;
