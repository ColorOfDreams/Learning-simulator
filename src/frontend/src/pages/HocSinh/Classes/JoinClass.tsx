import React, { useState, useEffect } from 'react';
import { useSearchParams, history } from '@umijs/max';
import { Input, Button, Card, message, Typography } from 'antd';
import { joinClass } from '@/services/classrooms/api';
import './JoinClass.less';

const { Title, Text } = Typography;

const JoinClass: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialInviteCode = searchParams.get('code') || '';
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!initialInviteCode) {
      // Don't show error immediately if user just opens the page without code
    }
  }, [initialInviteCode]);

  const handleJoin = async () => {
    if (!studentName.trim() || !studentCode.trim()) {
      message.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await joinClass({
        inviteCode,
        studentName,
        studentCode,
      });
      message.success('Đã gửi yêu cầu tham gia lớp học!');
      setSuccess(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi xin vào lớp');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="join-class-container">
        <Card className="join-class-card">
          <div className="success-icon">🎉</div>
          <Title level={3}>Gửi yêu cầu thành công!</Title>
          <Text type="secondary">
            Bạn đã xin tham gia lớp học. Vui lòng chờ giáo viên duyệt yêu cầu.
            Sau khi được duyệt, lớp học sẽ xuất hiện trong danh sách Lớp của bạn.
          </Text>
          <Button type="primary" block size="large" onClick={() => history.push('/hoc-sinh')} style={{ marginTop: 24 }}>
            Về Trang Chủ
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="join-class-container">
      <Card className="join-class-card" bordered={false}>
        <div className="join-header">
          <Title level={3}>Tham Gia Lớp Học</Title>
          <Text type="secondary">Vui lòng điền thông tin để xin vào lớp</Text>
        </div>
        
        <div className="join-form">
          <div className="form-item">
            <label>Mã mời</label>
            <Input 
              size="large" 
              placeholder="VD: X8N3M1"
              value={inviteCode} 
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
            />
          </div>
          <div className="form-item">
            <label>Họ và Tên</label>
            <Input 
              size="large" 
              placeholder="VD: Nguyễn Văn A" 
              value={studentName} 
              onChange={e => setStudentName(e.target.value)} 
            />
          </div>
          <div className="form-item">
            <label>Mã học sinh</label>
            <Input 
              size="large" 
              placeholder="VD: HS102030" 
              value={studentCode} 
              onChange={e => setStudentCode(e.target.value)} 
            />
          </div>
          <Button 
            type="primary" 
            block 
            size="large" 
            loading={loading} 
            onClick={handleJoin}
            disabled={!inviteCode}
          >
            Xin tham gia lớp học
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default JoinClass;
