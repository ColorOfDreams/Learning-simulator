import React, { useEffect, useState } from 'react';
import { useModel, useIntl } from '@umijs/max';
import { Row, Col, Typography, Spin, Radio, Space, Card, Tag, Table, Button, Tooltip } from 'antd';
import {
  TeamOutlined, BookOutlined, FileTextOutlined, StarOutlined,
  CheckCircleOutlined, DownloadOutlined, TrophyOutlined,
  RiseOutlined, UserSwitchOutlined, ExperimentOutlined,
  ClockCircleOutlined, FireOutlined, BulbOutlined,
} from '@ant-design/icons';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { unitName, primaryColor, statusColors, accentColors, textColors } from '@/services/base/constant';
import {
  getTeacherDashboardOverview,
  getTeacherClassComparison,
  getTeacherMonthlyTrends,
  getTeacherTopStudents,
  getTeacherRecentActivity,
  getTeacherSubjectBreakdown,
  getExportRecentActivityUrl,
} from '@/services/classrooms/api';
import './components/style.less';

const { Title, Text } = Typography;

const CHART_COLORS = ['#4361ee', '#06d6a0', '#ef476f', '#ffd166', '#073b4c', '#118ab2'];

const TrangChu: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const user = (initialState?.currentUser as any);
  const role = user?.role;

  // Student/admin sees the welcome page
  if (role !== 'teacher') {
    return (
      <Card styles={{ body: { height: '100%' } }} variant='borderless'>
        <div className='home-welcome'>
          <h1 className='title'>{intl.formatMessage({ id: 'pages.trangchu.title' })}</h1>
          <h2 className='sub-title'>
            {intl.formatMessage({ id: 'pages.trangchu.subtitle' })} - {intl.formatMessage({ id: unitName }).toUpperCase()}
          </h2>
        </div>
      </Card>
    );
  }

  return <TeacherAnalytics />;
};

// ─── TEACHER ANALYTICS ──────────────────────────────

const TeacherAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);
  const [overview, setOverview] = useState<any>(null);
  const [classComp, setClassComp] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [subjectBreakdown, setSubjectBreakdown] = useState<any[]>([]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getTeacherDashboardOverview(),
      getTeacherClassComparison(),
      getTeacherMonthlyTrends(months),
      getTeacherTopStudents(10),
      getTeacherRecentActivity(20),
      getTeacherSubjectBreakdown(),
    ])
      .then(([ov, comp, t, top, recent, subj]) => {
        setOverview(ov.data?.data || ov.data);
        setClassComp(comp.data?.data || comp.data || []);
        setTrends(t.data?.data || t.data);
        setTopStudents(top.data?.data || top.data || []);
        setRecentActivity(recent.data?.data || recent.data || []);
        setSubjectBreakdown(subj.data?.data || subj.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [months]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="teacher-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Tổng quan giảng dạy</Title>
          <Text type="secondary">Phân tích kết quả học tập của học sinh trên tất cả lớp học</Text>
        </div>
        <Space>
          <Radio.Group
            value={months}
            onChange={e => setMonths(e.target.value)}
            buttonStyle="solid"
            optionType="button"
            size="middle"
          >
            <Radio.Button value={3}>3 tháng</Radio.Button>
            <Radio.Button value={6}>6 tháng</Radio.Button>
            <Radio.Button value={12}>12 tháng</Radio.Button>
            <Radio.Button value={24}>24 tháng</Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      {/* Stat Cards */}
      {overview && (
        <Row gutter={[16, 16]} className="stat-row">
          {[
            { label: 'Lớp học', value: overview.totalClasses, icon: <TeamOutlined />, color: '#4361ee', bg: '#eef0ff' },
            { label: 'Học sinh', value: overview.totalStudents, icon: <UserSwitchOutlined />, color: '#06d6a0', bg: '#e6faf4' },
            { label: 'Bài tập', value: overview.totalAssignments, icon: <BookOutlined />, color: '#ffd166', bg: '#fff9e6' },
            { label: 'Điểm trung bình', value: overview.avgScore?.toString(), icon: <StarOutlined />, color: '#ef476f', bg: '#fde6eb' },
            { label: 'Tỉ lệ hoàn thành', value: `${overview.completionRate ?? 0}%`, icon: <CheckCircleOutlined />, color: '#118ab2', bg: '#e6f4f9' },
          ].map((item, i) => (
            <Col xs={24} sm={12} md={8} lg={4} key={i}>
              <div className="stat-card" style={{ backgroundColor: item.bg, borderLeft: `3px solid ${item.color}` }}>
                <div className="stat-card-icon" style={{ color: item.color }}>{item.icon}</div>
                <div className="stat-card-body">
                  <div className="stat-card-value" style={{ color: item.color }}>{item.value}</div>
                  <div className="stat-card-label">{item.label}</div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Middle Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} xl={14}>
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><RiseOutlined /> So sánh các lớp</span>
            </div>
            {classComp.length > 0 ? (
              <ReactApexChart
                options={getClassComparisonOptions(classComp)}
                series={[
                  { name: 'Điểm TB', data: classComp.map(c => c.avgScore) },
                  { name: 'Tỉ lệ nộp (%)', data: classComp.map(c => c.completionRate) },
                ]}
                type="bar"
                height={300}
              />
            ) : (
              <div className="chart-empty">Chưa có dữ liệu lớp học</div>
            )}
          </div>
        </Col>
        <Col xs={24} xl={10}>
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><ExperimentOutlined /> Phân bố môn học</span>
            </div>
            {subjectBreakdown.length > 0 ? (
              <ReactApexChart
                options={getDonutOptions(subjectBreakdown.map(s => s.label))}
                series={subjectBreakdown.map(s => s.count)}
                type="donut"
                height={300}
              />
            ) : (
              <div className="chart-empty">Chưa có dữ liệu môn học</div>
            )}
          </div>
        </Col>
      </Row>

      {/* Monthly Trends */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><FireOutlined /> Xu hướng theo tháng</span>
            </div>
            {trends?.labels?.length ? (
              <ReactApexChart
                options={getTrendOptions(trends.labels)}
                series={[
                  { name: 'Bài nộp', data: trends.submissionData },
                  { name: 'Học sinh mới', data: trends.newStudentData },
                ]}
                type="area"
                height={280}
              />
            ) : (
              <div className="chart-empty">Chưa có dữ liệu xu hướng</div>
            )}
          </div>
        </Col>
      </Row>

      {/* Bottom: Top Students + Recent Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={12}>
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><TrophyOutlined /> Top học sinh xuất sắc</span>
            </div>
            {topStudents.length > 0 ? (
              <div style={{ padding: '0 8px' }}>
                {topStudents.slice(0, 7).map((s: any, i: number) => (
                  <div key={s.memberId} className="rank-row">
                    <div className={`rank-badge rank-badge-${i + 1}`}>{i + 1}</div>
                    <div className="rank-info">
                      <div className="rank-name">{s.studentName}</div>
                      <div className="rank-code">{s.studentCode}</div>
                    </div>
                    <div className="rank-stats">
                      <span className="rank-score">{s.avgScore}</span>
                      <span className="rank-sub">{s.submissionCount} bài</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty">Chưa có dữ liệu học sinh</div>
            )}
          </div>
        </Col>
        <Col xs={24} xl={12}>
          <div className="chart-wrapper">
            <div className="chart-header">
              <span className="chart-title"><ClockCircleOutlined /> Hoạt động gần đây</span>
              <a href={getExportRecentActivityUrl()} target="_blank" rel="noreferrer" className="export-link">
                <DownloadOutlined /> Xuất Excel
              </a>
            </div>
            <div className="recent-table-wrap">
              <Table
                dataSource={recentActivity.slice(0, 10)}
                rowKey="id"
                size="small"
                pagination={false}
                showHeader={false}
                columns={[
                  {
                    dataIndex: 'className',
                    width: 120,
                    render: (val: string) => <Tag color="blue">{val}</Tag>,
                  },
                  {
                    dataIndex: 'studentName',
                    width: 140,
                    render: (val: string, r: any) => (
                      <span style={{ fontWeight: 500 }}>{val} <Text type="secondary" style={{ fontSize: 12 }}>({r.studentCode})</Text></span>
                    ),
                  },
                  {
                    dataIndex: 'assignmentTitle',
                    width: 200,
                    ellipsis: true,
                    render: (val: string) => <Text type="secondary" style={{ fontSize: 13 }}>{val}</Text>,
                  },
                  {
                    dataIndex: 'score',
                    width: 60,
                    align: 'right',
                    render: (val: number) => val != null ? <Tag color={val >= 8 ? 'green' : val >= 5 ? 'orange' : 'red'}>{val}</Tag> : null,
                  },
                  {
                    dataIndex: 'submittedAt',
                    width: 120,
                    align: 'right',
                    render: (val: string) => <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{val ? new Date(val).toLocaleDateString('vi-VN') : ''}</Text>,
                  },
                ]}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

// ─── APEX OPTIONS ───────────────────────────────────

function getClassComparisonOptions(labels: any[]): ApexOptions {
  return {
    chart: { type: 'bar', toolbar: { show: true }, fontFamily: 'Inter, sans-serif' },
    colors: ['#4361ee', '#06d6a0'],
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, horizontal: false } },
    dataLabels: { enabled: false },
    xaxis: { categories: labels.map((c: any) => c.className), labels: { style: { fontSize: '12px' } } },
    yaxis: { labels: { formatter: v => `${v}` } },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '13px' },
    tooltip: { shared: true, intersect: false },
    grid: { borderColor: '#f0f0f0', strokeDashArray: 3 },
  };
}

function getDonutOptions(labels: string[]): ApexOptions {
  return {
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    labels,
    colors: ['#4361ee', '#06d6a0', '#ef476f', '#ffd166', '#118ab2', '#073b4c'],
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '13px' },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: { show: true, label: 'Tổng', formatter: (w: any) => `${w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)} bài` },
          },
        },
      },
    },
    responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
  };
}

function getTrendOptions(labels: string[]): ApexOptions {
  return {
    chart: { type: 'area', toolbar: { show: true }, fontFamily: 'Inter, sans-serif', zoom: { enabled: true } },
    colors: ['#4361ee', '#06d6a0'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0 } },
    xaxis: { categories: labels, labels: { style: { fontSize: '12px' } } },
    yaxis: { labels: { formatter: v => `${Math.round(v)}` } },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '13px' },
    tooltip: { shared: true, intersect: false },
    grid: { borderColor: '#f0f0f0', strokeDashArray: 3 },
  };
}

export default TrangChu;
