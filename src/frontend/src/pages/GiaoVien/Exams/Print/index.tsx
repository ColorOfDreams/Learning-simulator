import React, { useEffect, useState } from 'react';
import { useParams } from '@umijs/max';
import { Spin, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import Formula from '@/components/Formula';
import { getExamWithQuestions } from '@/services/exams/api';
import 'katex/dist/katex.min.css';
import './style.less';

const SUBJECTS: Record<string, string> = { math: 'Toán', physics: 'Lý', chemistry: 'Hóa' };
const TYPE_LABELS: Record<string, string> = { MULTIPLE_CHOICE: 'I. TRẮC NGHIỆM', ESSAY: 'II. TỰ LUẬN', SHORT_ANSWER: 'III. CÂU HỎI NGẮN' };

const ExamPrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getExamWithQuestions(id)
      .then(res => setData(res.data?.data || res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!data) return <div>Không tìm thấy đề thi</div>;

  const { exam, questions } = data;

  return (
    <div className="exam-print-page">
      <div className="no-print" style={{ textAlign: 'center', padding: 16, background: '#f5f5f5', marginBottom: 16 }}>
        <Button type="primary" icon={<PrinterOutlined />} size="large" onClick={() => window.print()}>In đề thi</Button>
      </div>

      <div className="exam-print-content">
        <div className="exam-header">
          <div className="exam-school">TRƯỜNG ...</div>
          <div className="exam-title">{exam.title}</div>
          <div className="exam-info">
            Môn: {SUBJECTS[exam.subject as keyof typeof SUBJECTS] || exam.subject} | Lớp: {exam.grade}
            {exam.duration ? ` | Thời gian: ${exam.duration} phút` : ''}
          </div>
          <div className="exam-score">Điểm: ........./{exam.totalScore}</div>
        </div>

        {exam.description && <div className="exam-desc">{exam.description}</div>}

        {(exam.sections || []).map((section: any, si: number) => (
          <div key={si} className="exam-section">
            <h3 className="exam-section-title">{TYPE_LABELS[section.type] || section.title}
              <span className="exam-section-score">({section.maxScore} điểm)</span>
            </h3>

            {(section.questions || []).map((qref: any, qi: number) => {
              const q = questions?.[qref.questionId];
              if (!q) return null;
              const globalIdx = exam.sections.slice(0, si).reduce((s: number, sec: any) => s + (sec.questions?.length || 0), 0) + qi + 1;

              return (
                <div key={qi} className="exam-question">
                  <div className="question-text">
                    <strong>Câu {globalIdx}: </strong>
                    <Formula style={{ display: 'inline' }}>{q.question}</Formula>
                  </div>

                  <div className="answer-space">
                    {section.type === 'MULTIPLE_CHOICE' && (
                      <div className="mcq-options">
                        {(q.options || []).map((opt: any) => (
                          <div key={opt.key} className="mcq-option">
                            <span className="mcq-circle">○</span>
                            <span>{opt.key}. <Formula style={{ display: 'inline' }}>{opt.text}</Formula></span>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.type === 'ESSAY' && (
                      <div className="essay-lines">
                        {Array.from({ length: 8 }).map((_, li) => <div key={li} className="essay-line" />)}
                      </div>
                    )}
                    {section.type === 'SHORT_ANSWER' && (
                      <div className="short-answer-line">
                        <span className="dots">................................................................................</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamPrint;
