import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function StatisticsSimulation({ config }: SimulationProps) {
  const v1 = config.parameters?.find(p => p.key === 'v1')?.value ?? 5;
  const v2 = config.parameters?.find(p => p.key === 'v2')?.value ?? 6;
  const v3 = config.parameters?.find(p => p.key === 'v3')?.value ?? 7;
  const v4 = config.parameters?.find(p => p.key === 'v4')?.value ?? 8;
  const v5 = config.parameters?.find(p => p.key === 'v5')?.value ?? 9;
  const v6 = config.parameters?.find(p => p.key === 'v6')?.value ?? 10;

  const W = 600; const H = 400;
  const { svgHandlers, groupTransform, resetView, isDirty } = useMathPanZoom(1, W, H);

  const { mean, std, q1, q2, q3, iqr, whiskerLow, whiskerHigh, fmtN } = useMemo(() => {
    const data = [v1, v2, v3, v4, v5, v6];
    const n = data.length;
    const m = data.reduce((s, v) => s + v, 0) / n;
    const variance = data.reduce((s, v) => s + (v - m) ** 2, 0) / n;
    const s = Math.sqrt(variance);

    const sorted = [...data].sort((a, b) => a - b);
    // Quartiles for n=6: Q1=avg(sorted[1],sorted[2]), Q2=avg(sorted[2],sorted[3]), Q3=avg(sorted[3],sorted[4])
    const q1v = (sorted[1] + sorted[2]) / 2;
    const q2v = (sorted[2] + sorted[3]) / 2;
    const q3v = (sorted[3] + sorted[4]) / 2;
    const iqrv = q3v - q1v;
    const wLow = Math.max(sorted[0], q1v - 1.5 * iqrv);
    const wHigh = Math.min(sorted[5], q3v + 1.5 * iqrv);

    const fmtN = (v: number) => (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
    return { mean: m, std: s, sorted, q1: q1v, q2: q2v, q3: q3v, iqr: iqrv, whiskerLow: wLow, whiskerHigh: wHigh, fmtN };
  }, [v1, v2, v3, v4, v5, v6]);

  const data = [v1, v2, v3, v4, v5, v6];
  const allMin = Math.min(...data) - 1;
  const allMax = Math.max(...data) + 1;
  const range = allMax - allMin || 1;

  // Scale for x-axis (shared between histogram and box plot)
  const chartLeft = 60; const chartRight = W - 30;
  const chartW = chartRight - chartLeft;
  const toX = (v: number) => chartLeft + ((v - allMin) / range) * chartW;

  // Histogram — bars for each data value (frequency)
  const freqMap = new Map<number, number>();
  data.forEach(v => freqMap.set(v, (freqMap.get(v) ?? 0) + 1));
  const maxFreq = Math.max(...freqMap.values());
  const histTop = 30; const histBot = 200;
  const histH = histBot - histTop;
  const barW = Math.max(8, chartW / range * 0.7);

  // Box plot y position
  const bpMid = 280; const bpHalfH = 28;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />
        <g transform={groupTransform}>

        {/* === Histogram === */}
        <text x={chartLeft} y={18} fill="#94a3b8" fontSize="12" fontWeight="600">Biểu đồ tần số</text>

        {/* Y-axis labels */}
        {[1, 2].map(freq => (
          freq <= maxFreq ? (
            <g key={freq}>
              <line x1={chartLeft - 5} y1={histBot - freq / maxFreq * histH} x2={chartLeft} y2={histBot - freq / maxFreq * histH}
                stroke="#475569" strokeWidth="1" />
              <text x={chartLeft - 8} y={histBot - freq / maxFreq * histH + 4} fill="#64748b" fontSize="10" textAnchor="end">{freq}</text>
            </g>
          ) : null
        ))}

        {/* Histogram bars */}
        {Array.from(freqMap.entries()).map(([val, freq]) => {
          const bx = toX(val) - barW / 2;
          const bh = (freq / maxFreq) * histH;
          const by = histBot - bh;
          return (
            <g key={val}>
              <rect x={bx} y={by} width={barW} height={bh} fill="#38bdf8" fillOpacity={0.7} rx={2} />
              <text x={toX(val)} y={by - 4} fill="#38bdf8" fontSize="10" textAnchor="middle">{freq}</text>
              <text x={toX(val)} y={histBot + 14} fill="#64748b" fontSize="10" textAnchor="middle">{val}</text>
            </g>
          );
        })}

        {/* Histogram x-axis */}
        <line x1={chartLeft} y1={histBot} x2={chartRight} y2={histBot} stroke="#475569" strokeWidth="1.5" />
        <line x1={chartLeft} y1={histTop} x2={chartLeft} y2={histBot} stroke="#475569" strokeWidth="1.5" />

        {/* Mean line on histogram */}
        <line x1={toX(mean)} y1={histTop} x2={toX(mean)} y2={histBot} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x={toX(mean)+3} y={histTop+12} fill="#fbbf24" fontSize="9">x̄</text>

        {/* === Box plot === */}
        <text x={chartLeft} y={235} fill="#94a3b8" fontSize="12" fontWeight="600">Box plot</text>

        {/* Whisker lines */}
        <line x1={toX(whiskerLow)} y1={bpMid} x2={toX(q1)} y2={bpMid} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={toX(q3)} y1={bpMid} x2={toX(whiskerHigh)} y2={bpMid} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={toX(whiskerLow)} y1={bpMid - 10} x2={toX(whiskerLow)} y2={bpMid + 10} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={toX(whiskerHigh)} y1={bpMid - 10} x2={toX(whiskerHigh)} y2={bpMid + 10} stroke="#94a3b8" strokeWidth="1.5" />

        {/* IQR box */}
        <rect x={toX(q1)} y={bpMid - bpHalfH} width={toX(q3) - toX(q1)} height={bpHalfH * 2}
          fill="#3b82f6" fillOpacity={0.35} stroke="#38bdf8" strokeWidth="1.8" rx={2} />

        {/* Q2 median line */}
        <line x1={toX(q2)} y1={bpMid - bpHalfH} x2={toX(q2)} y2={bpMid + bpHalfH}
          stroke="#fbbf24" strokeWidth="2.5" />

        {/* Individual data points */}
        {data.map((v, i) => (
          <circle key={i} cx={toX(v)} cy={bpMid} r={3.5} fill="#e879f9" opacity={0.8} />
        ))}

        {/* Labels */}
        <text x={toX(q1)} y={bpMid + bpHalfH + 14} fill="#38bdf8" fontSize="9" textAnchor="middle">Q1={fmtN(q1)}</text>
        <text x={toX(q2)} y={bpMid - bpHalfH - 6} fill="#fbbf24" fontSize="9" textAnchor="middle">Q2={fmtN(q2)}</text>
        <text x={toX(q3)} y={bpMid + bpHalfH + 14} fill="#38bdf8" fontSize="9" textAnchor="middle">Q3={fmtN(q3)}</text>
        <text x={toX(whiskerLow)} y={bpMid + bpHalfH + 14} fill="#94a3b8" fontSize="9" textAnchor="middle">{fmtN(whiskerLow)}</text>
        <text x={toX(whiskerHigh)} y={bpMid + bpHalfH + 14} fill="#94a3b8" fontSize="9" textAnchor="middle">{fmtN(whiskerHigh)}</text>

        {/* Box plot x-axis */}
        <line x1={chartLeft} y1={bpMid + bpHalfH + 1} x2={chartRight} y2={bpMid + bpHalfH + 1} stroke="#334155" strokeWidth="1" />

        {/* === Stats summary === */}
        <rect x={8} y={H-88} width={230} height={80} rx={5} fill="#0f172a" fillOpacity={0.92} />
        <text x={16} y={H-70} fill="#64748b" fontSize="11" fontWeight="600">Thống kê mô tả</text>
        <text x={16} y={H-54} fill="#fbbf24" fontSize="11">x̄ (trung bình) = {fmtN(mean)}</text>
        <text x={16} y={H-38} fill="#f97316" fontSize="11">σ (độ lệch chuẩn) = {fmtN(std)}</text>
        <text x={16} y={H-22} fill="#94a3b8" fontSize="11">IQR = Q3 - Q1 = {fmtN(iqr)}</text>
        <text x={16} y={H-7} fill="#94a3b8" fontSize="11">Dữ liệu: [{[...data].sort((a,b)=>a-b).join(', ')}]</text>

        {/* Sorted data display */}
        <rect x={W-200} y={H-88} width={192} height={80} rx={5} fill="#0f172a" fillOpacity={0.92} />
        <text x={W-192} y={H-70} fill="#64748b" fontSize="11" fontWeight="600">Phân vị</text>
        <text x={W-192} y={H-54} fill="#38bdf8" fontSize="11">Q1 (25%) = {fmtN(q1)}</text>
        <text x={W-192} y={H-38} fill="#fbbf24" fontSize="11">Q2 / Trung vị = {fmtN(q2)}</text>
        <text x={W-192} y={H-22} fill="#38bdf8" fontSize="11">Q3 (75%) = {fmtN(q3)}</text>
        <text x={W-192} y={H-7} fill="#e879f9" fontSize="11">Các điểm: {data.join(', ')}</text>
        </g>
      </svg>
      {isDirty && (
        <button onClick={resetView} style={{
          position: 'absolute', bottom: 8, right: 8, zIndex: 10,
          padding: '3px 10px', background: 'rgba(15,23,42,0.9)',
          border: '1px solid #334155', borderRadius: 6,
          color: '#94a3b8', fontSize: 12, cursor: 'pointer',
        }}>↺ Reset</button>
      )}
    </div>
  );
}
