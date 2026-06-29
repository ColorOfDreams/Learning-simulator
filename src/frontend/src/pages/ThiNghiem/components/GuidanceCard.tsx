import React from 'react';
import { BulbOutlined, CheckCircleFilled } from '@ant-design/icons';

interface GuidanceStep { id: string; title: string; description: string; expectedAction?: any; targetEquipment?: string; }

interface Props { steps?: GuidanceStep[]; currentStepIndex?: number; }

const GuidanceCard: React.FC<Props> = ({ steps, currentStepIndex = 0 }) => {
  if (!steps?.length) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '1px solid #fcd34d',
      borderRadius: 14,
      padding: 14,
      boxShadow: '0 2px 12px rgba(245, 158, 11, 0.08)',
      animation: 'guidanceIn 0.4s ease-out',
      width: '100%',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12, paddingBottom: 8,
        borderBottom: '1px solid rgba(245, 158, 11, 0.15)'
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
        }}>
          <BulbOutlined style={{ color: '#fff', fontSize: 14 }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Các bước hướng dẫn</div>
          <div style={{ fontSize: 10, color: '#a16207', opacity: 0.7 }}>Làm theo từng bước</div>
        </div>
      </div>

      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isPast = index < currentStepIndex;
        return (
          <div key={step.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '8px 0',
            borderBottom: index < steps.length - 1 ? '1px solid rgba(245, 158, 11, 0.08)' : 'none',
            transition: 'all 0.2s',
            opacity: isPast ? 0.6 : 1,
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
            borderRadius: 8,
            paddingLeft: isActive ? 8 : 0,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: isActive ? 'linear-gradient(135deg, #f59e0b, #d97706)' : isPast ? '#fbbf24' : '#fef3c7',
              border: isActive || isPast ? 'none' : '2px solid #fbbf24',
              color: isActive || isPast ? '#fff' : '#d97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              boxShadow: isActive ? '0 2px 4px rgba(245, 158, 11, 0.3)' : 'none',
            }}>
              {isPast ? <CheckCircleFilled style={{ fontSize: 13 }} /> : index + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? '#b45309' : '#78350f', marginBottom: 2 }}>
                {step.title}
              </div>
              <div style={{ fontSize: 11, color: '#a16207', lineHeight: 1.6 }}>
                {step.description}
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes guidanceIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default React.memo(GuidanceCard);
