import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function CombinatoricsSimulation({ config }: SimulationProps) {
  const params = config.parameters;
  const nRaw = params.find(p => p.key === 'n')?.value ?? 5;
  const kRaw = params.find(p => p.key === 'k')?.value ?? 2;

  const n = Math.max(0, Math.min(10, Math.round(nRaw)));
  const k = Math.max(0, Math.min(n, Math.round(kRaw)));

  const W = 600;
  const H = 420;

  const factorial = useMemo(() => {
    const memo: number[] = [1];
    for (let i = 1; i <= 20; i++) memo[i] = memo[i - 1] * i;
    return memo;
  }, []);

  const C = useMemo(() => (row: number, col: number): number => {
    if (col < 0 || col > row) return 0;
    if (col === 0 || col === row) return 1;
    return factorial[row] / (factorial[col] * factorial[row - col]);
  }, [factorial]);

  const triangle = useMemo(() => {
    return Array.from({ length: n + 1 }, (_, row) =>
      Array.from({ length: row + 1 }, (_, col) => C(row, col))
    );
  }, [n, C]);

  const factN = factorial[n] ?? 0;
  const Ank = n >= k ? factorial[n] / factorial[n - k] : 0;
  const Cnk = C(n, k);

  const triTop = 18;
  const triHeight = Math.min(190, H * 0.47);
  const triBottom = triTop + triHeight;

  const rowHeight = n > 0 ? triHeight / (n + 0.5) : triHeight;
  const cellR = Math.max(10, Math.min(18, rowHeight * 0.38));
  const fontSize = Math.max(7, Math.min(12, cellR * 0.85));

  const cellPos = useMemo(() => {
    return triangle.map((row, ri) => {
      const y = triTop + ri * rowHeight + rowHeight / 2;
      const totalWidth = W * 0.7;
      const startX = W / 2 - (row.length - 1) * (totalWidth / Math.max(n, 1)) / 2;
      const step = n > 0 ? totalWidth / Math.max(n, 1) : 0;
      return row.map((val, ci) => ({
        x: startX + ci * step,
        y,
        val,
        row: ri,
        col: ci,
      }));
    });
  }, [triangle, n, rowHeight]);

  const rowN = triangle[n] ?? [];
  const maxCoeff = Math.max(...rowN, 1);

  const chartTop = triBottom + 28;
  const chartH = H - chartTop - 40;
  const chartLeft = 40;
  const chartRight = W - 20;
  const chartW = chartRight - chartLeft;
  const barCount = rowN.length;
  const barW = barCount > 0 ? Math.min(35, (chartW / barCount) * 0.72) : 10;
  const barGap = barCount > 1 ? (chartW - barW * barCount) / (barCount - 1) : 0;

  const fmtBig = (v: number) => {
    if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
    if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e4) return v.toLocaleString();
    return v.toString();
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">

        <rect x={0} y={0} width={W} height={H} fill="#090d16" />

        <text x={W / 2} y={12} fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="600">
          Tam giác Pascal (n = {n})
        </text>

        {cellPos.map((row, ri) =>
          row.map((cell, ci) => {
            const isRowN = ri === n;
            const isNK = ri === n && ci === k;
            const fill = isNK
              ? '#f59e0b'
              : isRowN
              ? '#1d4ed8'
              : ri % 2 === 0
              ? '#1e2a3a'
              : '#16202e';
            const stroke = isNK ? '#fbbf24' : isRowN ? '#3b82f6' : '#334155';
            const textFill = isNK ? '#000' : '#f8fafc';
            const displayVal = fmtBig(cell.val);
            return (
              <g key={`${ri}-${ci}`}>
                <circle
                  cx={cell.x} cy={cell.y} r={cellR}
                  fill={fill} stroke={stroke} strokeWidth={isNK ? 2 : 1}
                />
                <text
                  x={cell.x} y={cell.y + fontSize * 0.38}
                  fill={textFill} fontSize={fontSize}
                  textAnchor="middle" fontWeight={isNK ? '700' : '400'}>
                  {displayVal}
                </text>
              </g>
            );
          })
        )}

        {cellPos.map((row, ri) =>
          ri > 0
            ? row.map((cell) => {
                const parentRow = cellPos[ri - 1];
                const leftParent = cell.col > 0 ? parentRow[cell.col - 1] : null;
                const rightParent = cell.col < parentRow.length ? parentRow[cell.col] : null;
                return (
                  <g key={`edge-${ri}-${cell.col}`}>
                    {leftParent && (
                      <line
                        x1={leftParent.x} y1={leftParent.y + cellR}
                        x2={cell.x} y2={cell.y - cellR}
                        stroke="#1e3a5f" strokeWidth="0.8" opacity="0.6"
                      />
                    )}
                    {rightParent && (
                      <line
                        x1={rightParent.x} y1={rightParent.y + cellR}
                        x2={cell.x} y2={cell.y - cellR}
                        stroke="#1e3a5f" strokeWidth="0.8" opacity="0.6"
                      />
                    )}
                  </g>
                );
              })
            : null
        )}

        <line x1={chartLeft} y1={chartTop + chartH} x2={chartRight} y2={chartTop + chartH}
          stroke="#475569" strokeWidth="1" />

        {rowN.map((val, i) => {
          const bh = chartH * (val / maxCoeff);
          const bx = chartLeft + i * (barW + barGap);
          const by = chartTop + chartH - bh;
          const isK = i === k;
          return (
            <g key={`bar-${i}`}>
              <rect
                x={bx} y={by} width={barW} height={bh}
                fill={isK ? '#f59e0b' : '#3b82f6'}
                opacity={isK ? 1 : 0.65}
                rx="2"
              />
              <text
                x={bx + barW / 2} y={chartTop + chartH + 12}
                fill="#64748b" fontSize="9" textAnchor="middle">
                {i}
              </text>
              {(bh > 16 || n <= 6) && (
                <text
                  x={bx + barW / 2} y={Math.max(by - 2, chartTop + 8)}
                  fill={isK ? '#fbbf24' : '#93c5fd'}
                  fontSize="8" textAnchor="middle">
                  {fmtBig(val)}
                </text>
              )}
            </g>
          );
        })}

        <text x={chartLeft} y={chartTop - 6} fill="#64748b" fontSize="10">
          Hệ số nhị thức C({n}, k) cho k = 0..{n}
        </text>

        <rect x={4} y={chartTop + chartH + 20} width={W - 8} height={56} rx="6"
          fill="rgba(15,23,42,0.9)" stroke="#1e293b" strokeWidth="1" />

        <text x={16} y={chartTop + chartH + 36} fill="#94a3b8" fontSize="11">
          P_{n} = {n}! =
        </text>
        <text x={130} y={chartTop + chartH + 36} fill="#4ade80" fontSize="11" fontWeight="600">
          {fmtBig(factN)}
        </text>

        <text x={230} y={chartTop + chartH + 36} fill="#94a3b8" fontSize="11">
          A({n},{k}) =
        </text>
        <text x={310} y={chartTop + chartH + 36} fill="#38bdf8" fontSize="11" fontWeight="600">
          {fmtBig(Ank)}
        </text>

        <text x={400} y={chartTop + chartH + 36} fill="#94a3b8" fontSize="11">
          C({n},{k}) =
        </text>
        <text x={480} y={chartTop + chartH + 36} fill="#fbbf24" fontSize="13" fontWeight="700">
          {fmtBig(Cnk)}
        </text>

        <text x={16} y={chartTop + chartH + 56} fill="#475569" fontSize="10">
          P_n=n!   A(n,k)=n!/(n-k)!   C(n,k)=n!/(k!(n-k)!)   (n={n}, k={k})
        </text>

        <rect x={2} y={0} width={W - 4} height={H - 2} rx="4" fill="none" stroke="#1e293b" strokeWidth="1" />
      </svg>
    </div>
  );
}
