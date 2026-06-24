import { useState, useMemo } from 'react';
import type { SimulationProps } from '../types';

export default function StatisticsSimulation({ config }: SimulationProps) {
  // Let the user edit numbers dynamically in a text box
  const [dataInput, setDataInput] = useState('8, 9, 7, 6, 8, 9, 10, 8, 7, 9, 8, 6, 7, 8, 9');

  // Preset datasets
  const presets = [
    { label: 'Điểm Toán', data: '8, 9, 7, 6, 8, 9, 10, 8, 7, 9, 8, 6, 7, 8, 9' },
    { label: 'Chiều cao (cm)', data: '150, 155, 152, 160, 158, 154, 156, 162, 150, 158' },
    { label: 'Nhiệt độ (°C)', data: '32, 34, 31, 35, 33, 32, 30' },
  ];

  // Parse input
  const parsedData = useMemo(() => {
    return dataInput
      .split(',')
      .map(v => parseFloat(v.trim()))
      .filter(v => !isNaN(v));
  }, [dataInput]);

  // Calculations
  const stats = useMemo(() => {
    if (parsedData.length === 0) return null;

    const n = parsedData.length;
    const sorted = [...parsedData].sort((a, b) => a - b);
    const minVal = sorted[0];
    const maxVal = sorted[n - 1];

    // Mean
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Median function
    const getMedian = (arr: number[]) => {
      const len = arr.length;
      if (len === 0) return 0;
      const mid = Math.floor(len / 2);
      if (len % 2 !== 0) {
        return arr[mid];
      } else {
        return (arr[mid - 1] + arr[mid]) / 2;
      }
    };

    const q2 = getMedian(sorted);

    // Q1 and Q3 according to high school standards
    let lowerHalf: number[] = [];
    let upperHalf: number[] = [];

    if (n % 2 !== 0) {
      const midIdx = Math.floor(n / 2);
      lowerHalf = sorted.slice(0, midIdx);
      upperHalf = sorted.slice(midIdx + 1);
    } else {
      const midIdx = n / 2;
      lowerHalf = sorted.slice(0, midIdx);
      upperHalf = sorted.slice(midIdx);
    }

    const q1 = getMedian(lowerHalf);
    const q3 = getMedian(upperHalf);

    const range = maxVal - minVal;
    const iqr = q3 - q1;

    // Variance & Standard Deviation (sample division by n)
    const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Frequency distribution for Bar Chart
    const frequencies: Record<number, number> = {};
    sorted.forEach(val => {
      frequencies[val] = (frequencies[val] || 0) + 1;
    });

    const frequencyList = Object.entries(frequencies)
      .map(([val, freq]) => ({
        val: parseFloat(val),
        freq,
      }))
      .sort((a, b) => a.val - b.val);

    return {
      n,
      sorted,
      minVal,
      maxVal,
      mean,
      q1,
      q2,
      q3,
      range,
      iqr,
      stdDev,
      frequencyList,
    };
  }, [parsedData]);

  // Width & height of the visualization area
  const svgWidth = 560;
  const svgHeight = 280;

  // Render visualizations
  const visualContent = useMemo(() => {
    if (!stats) return null;

    const { minVal, maxVal, q1, q2, q3, frequencyList } = stats;

    // Scales
    const paddingX = 40;
    const plotWidth = svgWidth - 2 * paddingX;

    const dataRange = maxVal - minVal || 1;
    // Map value to Screen X
    const getScreenX = (val: number) => {
      return paddingX + ((val - minVal) / dataRange) * plotWidth;
    };

    // 1. Box Plot dimensions (top part)
    const boxY = 60;
    const boxHeight = 30;

    // 2. Bar Chart dimensions (bottom part)
    const chartYBottom = svgHeight - 40; // baseline
    const chartHeightMax = 100;
    const maxFreq = Math.max(...frequencyList.map(f => f.freq)) || 1;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ background: '#0a0f1d' }}>
        {/* Grids and Axes */}
        <line x1={paddingX} y1={chartYBottom} x2={svgWidth - paddingX} y2={chartYBottom} stroke="#334155" strokeWidth="2" />
        
        {/* Draw Box Plot */}
        <g stroke="#64748b" strokeWidth="1.5">
          {/* Main whiskers line */}
          <line x1={getScreenX(minVal)} y1={boxY} x2={getScreenX(maxVal)} y2={boxY} stroke="#06b6d4" strokeWidth="2" />
          
          {/* Min whisker */}
          <line x1={getScreenX(minVal)} y1={boxY - boxHeight/2} x2={getScreenX(minVal)} y2={boxY + boxHeight/2} stroke="#06b6d4" strokeWidth="2" />
          
          {/* Max whisker */}
          <line x1={getScreenX(maxVal)} y1={boxY - boxHeight/2} x2={getScreenX(maxVal)} y2={boxY + boxHeight/2} stroke="#06b6d4" strokeWidth="2" />
          
          {/* Main Box */}
          <rect
            x={getScreenX(q1)}
            y={boxY - boxHeight/2}
            width={Math.max(2, getScreenX(q3) - getScreenX(q1))}
            height={boxHeight}
            fill="#1e293b"
            stroke="#06b6d4"
            strokeWidth="2"
            rx="4"
          />

          {/* Median line (Q2) */}
          <line x1={getScreenX(q2)} y1={boxY - boxHeight/2} x2={getScreenX(q2)} y2={boxY + boxHeight/2} stroke="#ef4444" strokeWidth="3" />
        </g>

        {/* Labels for Box Plot */}
        <g fill="#94a3b8" fontSize="10" textAnchor="middle">
          <text x={getScreenX(minVal)} y={boxY - boxHeight/2 - 6} fill="#38bdf8">Min: {minVal}</text>
          <text x={getScreenX(q1)} y={boxY + boxHeight/2 + 14} fill="#a5f3fc">Q₁: {q1.toFixed(1)}</text>
          <text x={getScreenX(q2)} y={boxY - boxHeight/2 - 6} fill="#f87171" fontWeight="bold">Q₂ (Med): {q2.toFixed(1)}</text>
          <text x={getScreenX(q3)} y={boxY + boxHeight/2 + 14} fill="#a5f3fc">Q₃: {q3.toFixed(1)}</text>
          <text x={getScreenX(maxVal)} y={boxY - boxHeight/2 - 6} fill="#38bdf8">Max: {maxVal}</text>
        </g>

        {/* Title for Box Plot */}
        <text x={paddingX} y={20} fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="start">
          BIỂU ĐỒ HỘP (BOX PLOT)
        </text>

        {/* Title for Bar Chart */}
        <text x={paddingX} y={chartYBottom - chartHeightMax - 15} fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="start">
          BIỂU ĐỒ TẦN SỐ (FREQUENCY BAR CHART)
        </text>

        {/* Draw Bar Chart (Frequency representation) */}
        {frequencyList.map((item, idx) => {
          const x = getScreenX(item.val);
          const barHeight = (item.freq / maxFreq) * chartHeightMax;
          const barWidth = Math.min(24, Math.max(12, plotWidth / (frequencyList.length * 2)));

          return (
            <g key={idx}>
              {/* Bar */}
              <rect
                x={x - barWidth / 2}
                y={chartYBottom - barHeight}
                width={barWidth}
                height={barHeight}
                fill="#10b981"
                opacity="0.8"
                rx="3"
              />
              
              {/* Value label on X-axis */}
              <text x={x} y={chartYBottom + 16} fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
                {item.val}
              </text>

              {/* Frequency count above the bar */}
              <text x={x} y={chartYBottom - barHeight - 6} fill="#34d399" fontSize="10" textAnchor="middle">
                n={item.freq}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }, [stats]);

  return (
    <div style={{ width: '100%', height: '100%', padding: '16px', background: '#0f172a', borderRadius: '18px', display: 'flex', flexDirection: 'column', color: '#fff', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {/* Preset quick buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Mẫu nhanh:</span>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => setDataInput(p.data)}
              style={{
                background: dataInput === p.data ? '#06b6d4' : '#1e293b',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background 0.2s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>Dữ liệu:</span>
          <input
            type="text"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            placeholder="Nhập các số cách nhau bằng dấu phẩy"
            style={{
              flex: 1,
              background: '#090d16',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              color: '#fff',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {stats ? (
        <div style={{ display: 'flex', flex: 1, gap: '16px', flexWrap: 'wrap', minHeight: 0 }}>
          {/* Spreadsheet Table of calculations */}
          <div style={{
            width: '200px',
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            overflowY: 'auto'
          }}>
            <div style={{ fontWeight: 'bold', color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
              Đặc trưng mẫu (n={stats.n})
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Số trung bình:</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>{stats.mean.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Trung vị (Q₂):</span>
              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{stats.q2.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Tứ phân vị Q₁:</span>
              <span style={{ fontWeight: 'bold' }}>{stats.q1.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Tứ phân vị Q₃:</span>
              <span style={{ fontWeight: 'bold' }}>{stats.q3.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>K.biến thiên (R):</span>
              <span style={{ fontWeight: 'bold' }}>{stats.range}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Khoảng IQR:</span>
              <span style={{ fontWeight: 'bold' }}>{stats.iqr.toFixed(1)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #334155', paddingTop: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Độ lệch chuẩn:</span>
              <span style={{ fontWeight: 'bold', color: '#fb923c' }}>{stats.stdDev.toFixed(3)}</span>
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '4px', marginTop: 'auto', fontSize: '10px', color: '#475569' }}>
              * Q₁, Q₂, Q₃ áp dụng cách tính phân vị chương trình GDPT 2018.
            </div>
          </div>

          {/* Visualization slot */}
          <div style={{
            flex: 1,
            position: 'relative',
            border: '1px solid #334155',
            borderRadius: '12px',
            background: '#090d16',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {visualContent}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
          Vui lòng nhập danh sách số liệu mẫu hợp lệ (ví dụ: 1, 2, 3)
        </div>
      )}
    </div>
  );
}
