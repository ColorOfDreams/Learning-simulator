import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Spin, Empty, Segmented, Space, Button } from 'antd';
import { DownloadOutlined, TeamOutlined, BookOutlined, FileTextOutlined, StarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import StatisticsCard from '@/components/StatisticsCard';
import ColumnChart from '@/components/Chart/ColumnChart';
import DonutChart from '@/components/Chart/DonutChart';
import LineChart from '@/components/Chart/LineChart';
import BarChart from '@/components/Chart/BarChart';
import TableBase from '@/components/Table';
import type { IColumn } from '@/components/Table/typing';
import {
  getClassAnalyticsOverview,
  getClassCompletion,
  getClassScoreDistribution,
  getClassTimeline,
  getClassStudentRanking,
  getClassPerAssignment,
  getClassStudentDetail,
  getExportStudentDetailUrl,
  getExportStudentRankingUrl,
} from '@/services/classrooms/api';
import './ClassAnalytics.less';

const { Text } = Typography;

interface Props {
  classId: string;
}

const ClassAnalytics: React.FC<Props> = ({ classId }) => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('month');
  const [overview, setOverview] = useState<any>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [scoreDist, setScoreDist] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [perAssignment, setPerAssignment] = useState<any[]>([]);
  const [studentDetail, setStudentDetail] = useState<any[]>([]);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    Promise.all([
      getClassAnalyticsOverview(classId),
      getClassCompletion(classId, { period }),
      getClassScoreDistribution(classId),
      getClassTimeline(classId, period),
      getClassStudentRanking(classId),
      getClassPerAssignment(classId),
      getClassStudentDetail(classId),
    ])
      .then(([ov, comp, dist, tl, rank, perAss, detail]) => {
        setOverview(ov.data?.data || ov.data);
        setCompletion(comp.data?.data || comp.data);
        setScoreDist(dist.data?.data || dist.data);
        setTimeline(tl.data?.data || tl.data || []);
        setRanking(rank.data?.data || rank.data || []);
        setPerAssignment(perAss.data?.data || perAss.data || []);
        setStudentDetail(detail.data?.data || detail.data || []);
      })
      .finally(() => setLoading(false));
  }, [classId, period]);

  const studentDetailColumns: IColumn<any>[] = [
    { title: 'Mã HS', dataIndex: 'studentCode', key: 'studentCode', width: 100 },
    { title: 'Họ và tên', dataIndex: 'studentName', key: 'studentName', width: 180 },
    { title: 'Số bài nộp', dataIndex: 'totalSubmissions', key: 'totalSubmissions', width: 100, align: 'center' },
    { title: 'Điểm TB', dataIndex: 'avgScore', key: 'avgScore', width: 90, align: 'center', render: (s: number) => <strong style={{ color: '#1677ff' }}>{s}</strong> },
    { title: 'Cao nhất', dataIndex: 'highestScore', key: 'highestScore', width: 90, align: 'center' },
    { title: 'Thấp nhất', dataIndex: 'lowestScore', key: 'lowestScore', width: 90, align: 'center' },
    {
      title: 'Bài cuối',
      key: 'lastSubmission',
      width: 200,
      ellipsis: true,
      render: (_: any, r: any) => r.lastSubmission ? `${r.lastSubmission.assignmentTitle} (${r.lastSubmission.score})` : '--',
    },
    {
      title: 'Nộp cuối',
      key: 'lastSubmittedAt',
      width: 140,
      render: (_: any, r: any) => r.lastSubmission ? new Date(r.lastSubmission.submittedAt).toLocaleDateString('vi-VN') : '--',
    },
  ];

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <div className="class-analytics">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Segmented
          value={period}
          onChange={val => setPeriod(val as string)}
          options={[
            { label: 'Theo tuần', value: 'week' },
            { label: 'Theo tháng', value: 'month' },
          ]}
        />
      </div>

      {overview && (
        <StatisticsCard
          title="Tổng quan lớp học"
          data={[
            { title: 'Học sinh', value: overview.totalStudents ?? 0, icon: <TeamOutlined />, valueColor: '#1677ff' },
            { title: 'Bài tập', value: overview.totalAssignments ?? 0, icon: <BookOutlined />, valueColor: '#52c41a' },
            { title: 'Bài đã nộp', value: overview.totalSubmissions ?? 0, icon: <FileTextOutlined />, valueColor: '#faad14' },
            { title: 'Điểm TB', value: (overview.avgScore ?? 0).toString(), icon: <StarOutlined />, valueColor: '#eb2f96' },
            { title: 'Tỉ lệ hoàn thành', value: `${overview.completionRate ?? 0}%`, icon: <CheckCircleOutlined />, valueColor: '#722ed1' },
          ]}
          colSpan={{ span: 24, sm: 12, md: 8, lg: 4 }}
        />
      )}

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          {scoreDist && scoreDist.ranges?.length > 0 ? (
            <div className="analytics-chart-card">
              <ColumnChart
                title="Phân bố điểm số"
                xAxis={scoreDist.ranges.map((r: any) => r.label)}
                yAxis={[scoreDist.ranges.map((r: any) => r.count)]}
                yLabel={['Số bài']}
                formatY={v => `${v}`}
                height={300}
              />
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 13, color: '#595959' }}>
                <span>TB: <strong>{scoreDist.average}</strong></span>
                <span>Cao: <strong>{scoreDist.highest}</strong></span>
                <span>Thấp: <strong>{scoreDist.lowest}</strong></span>
                <span>SL: <strong>{scoreDist.totalScores}</strong></span>
              </div>
            </div>
          ) : <Empty description="Chưa có dữ liệu điểm" />}
        </Col>
        <Col xs={24} lg={12}>
          {completion ? (
            <div className="analytics-chart-card">
              <DonutChart
                xAxis={['Đã nộp', 'Chưa nộp']}
                yAxis={[[completion.submitted ?? 0, completion.notSubmitted ?? 0]]}
                height={300}
                showTotal
                formatY={v => `${v} bài`}
                colors={['#52c41a', '#d9d9d9']}
              />
            </div>
          ) : <Empty description="Chưa có dữ liệu" />}
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          {timeline.length > 0 ? (
            <div className="analytics-chart-card">
              <LineChart
                title={`Tiến độ nộp bài (theo ${period === 'week' ? 'ngày' : 'tháng'})`}
                xAxis={timeline.map((t: any) => t.label)}
                yAxis={[timeline.map((t: any) => t.submissions), timeline.map((t: any) => t.uniqueStudents)]}
                yLabel={['Bài nộp', 'Học sinh']}
                colors={['#1677ff', '#52c41a']}
                formatY={v => `${v}`}
                height={300}
              />
            </div>
          ) : <Empty description="Chưa có dữ liệu tiến độ" />}
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          {ranking.length > 0 ? (
            <div className="analytics-chart-card">
              <BarChart
                title="Xếp hạng học sinh"
                xAxis={ranking.map((r: any) => r.studentName)}
                yAxis={[ranking.map((r: any) => r.avgScore)]}
                yLabel={['Điểm TB']}
                formatY={v => `${v}`}
                height={Math.max(300, ranking.length * 32)}
              />
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <a href={getExportStudentRankingUrl(classId)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                  <DownloadOutlined /> Xuất Excel
                </a>
              </div>
            </div>
          ) : <Empty description="Chưa có dữ liệu xếp hạng" />}
        </Col>
        <Col xs={24} lg={12}>
          {perAssignment.length > 0 ? (
            <div className="analytics-chart-card">
              <ColumnChart
                title="Phân tích theo bài tập"
                xAxis={perAssignment.map((a: any) => a.title.length > 20 ? a.title.slice(0, 20) + '...' : a.title)}
                yAxis={[perAssignment.map((a: any) => a.completionRate), perAssignment.map((a: any) => a.avgScore)]}
                yLabel={['Tỉ lệ nộp (%)', 'Điểm TB']}
                colors={['#1677ff', '#52c41a']}
                formatY={v => `${v}`}
                height={300}
              />
            </div>
          ) : <Empty description="Chưa có bài tập nào" />}
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <div className="analytics-chart-card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>Chi tiết học sinh</span>
              <a href={getExportStudentDetailUrl(classId)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                <DownloadOutlined /> Xuất Excel
              </a>
            </div>
            <TableBase
              modelName={"scene" as any}
              getData={() => { }}
              hideCard
              otherProps={{
                dataSource: studentDetail,
                pagination: { pageSize: 20 },
                size: 'small',
                rowKey: 'memberId',
              }}
              columns={studentDetailColumns}
              buttons={{ create: false, export: false, reload: false, globalSearch: true }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ClassAnalytics;
