import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function SeqLimitsSimulation({ config }: SimulationProps) {
  const seqType = config.parameters?.find(p => p.key === 'seqType')?.value ?? 0;
  const epsilon = config.parameters?.find(p => p.key === 'epsilon')?.value ?? 0.3;

  const W = 600;
  const H = 380;
  const padL = 60;
  const padR = 20;
  const padT = 50;
  const padB = 60;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const nMax = 20;

  type SeqDef = { label: string; fn: (n: number) => number; limit: number; limitLabel: string };

  const seqDefs: SeqDef[] = [
    { label: 'aₙ = 1/n', fn: (n) => 1 / n, limit: 0, limitLabel: '0' },
    { label: 'aₙ = (-1)ⁿ/n', fn: (n) => (Math.pow(-1, n)) / n, limit: 0, limitLabel: '0' },
    { label: 'aₙ = n/(n+1)', fn: (n) => n / (n + 1), limit: 1, limitLabel: '1' },
    { label: 'aₙ = (2n+1)/(n+1)', fn: (n) => (2 * n + 1) / (n + 1), limit: 2, limitLabel: '2' },
  ];

  const idx = Math.round(seqType) as 0 | 1 | 2 | 3;
  const def = seqDefs[Math.min(3, Math.max(0, idx))];
  const L = def.limit;

  const terms = useMemo(() => {
    const arr: { n: number; val: number }[] = [];
    for (let n = 1; n <= nMax; n++) {
      arr.push({ n, val: def.fn(n) });
    }
    return arr;
  }, [seqType]);

  const values = terms.map(t => t.val);
  const allVals = [...values, L + epsilon, L - epsilon];
  const dataMin = Math.min(...allVals) - 0.2;
  const dataMax = Math.max(...allVals) + 0.2;
  const dataRange = dataMax - dataMin || 1;

  const toScreenX = (n: number) => padL + ((n - 1) / (nMax - 1)) * plotW;
  const toScreenY = (v: number) => padT + plotH - ((v - dataMin) / dataRange) * plotH;

  const smallestN = useMemo(() => {
    for (let start = 1; start <= nMax; start++) {
      let allIn = true;
      for (let n = start; n <= nMax; n++) {
        if (Math.abs(def.fn(n) - L) > epsilon) { allIn = false; break; }
      }
      if (allIn) return start;
    }
    return nMax + 1;
  }, [seqType, epsilon]);

  const bandTop = toScreenY(L + epsilon);
  const bandBot = toScreenY(L - epsilon);
  const limitY = toScreenY(L);

  const yTickCount = 6;
  const yTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= yTickCount; i++) {
      const v = dataMin + (i / yTickCount) * dataRange;
      ticks.push(v);
    }
    return ticks;
  }, [dataMin, dataRange]);

  const xTicks = [1, 5, 10, 15, 20];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        <rect
          x={padL}
          y={Math.min(bandTop, bandBot)}
          width={plotW}
          height={Math.abs(bandBot - bandTop)}
          fill="rgba(250,204,21,0.13)"
          stroke="rgba(250,204,21,0.35)"
          strokeWidth="1"
          strokeDasharray="5 3"
        />

        <g stroke="#1e293b" strokeWidth="0.5">
          {yTicks.map((v, i) => (
            <line key={`gy${i}`} x1={padL} y1={toScreenY(v)} x2={padL + plotW} y2={toScreenY(v)} />
          ))}
          {xTicks.map(n => (
            <line key={`gx${n}`} x1={toScreenX(n)} y1={padT} x2={toScreenX(n)} y2={padT + plotH} />
          ))}
        </g>

        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#475569" strokeWidth="1.5" />
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#475569" strokeWidth="1.5" />

        {yTicks.map((v, i) => (
          <text key={`yt${i}`} x={padL - 6} y={toScreenY(v) + 4} fill="#475569" fontSize="10" textAnchor="end">{v.toFixed(1)}</text>
        ))}
        {xTicks.map(n => (
          <text key={`xt${n}`} x={toScreenX(n)} y={padT + plotH + 16} fill="#475569" fontSize="10" textAnchor="middle">{n}</text>
        ))}
        <text x={padL + plotW + 5} y={padT + plotH + 4} fill="#94a3b8" fontSize="11" fontWeight="bold">n</text>
        <text x={padL - 10} y={padT - 8} fill="#94a3b8" fontSize="11" fontWeight="bold">aₙ</text>

        <line x1={padL} y1={limitY} x2={padL + plotW} y2={limitY} stroke="#4ade80" strokeWidth="2" />
        <text x={padL + plotW - 4} y={limitY - 5} fill="#4ade80" fontSize="11" textAnchor="end">L = {def.limitLabel}</text>

        <line x1={padL} y1={bandTop} x2={padL + plotW} y2={bandTop} stroke="#facc15" strokeWidth="1" strokeDasharray="4 3" />
        <line x1={padL} y1={bandBot} x2={padL + plotW} y2={bandBot} stroke="#facc15" strokeWidth="1" strokeDasharray="4 3" />
        <text x={padL + 2} y={bandTop - 3} fill="#facc15" fontSize="9">L+ε</text>
        <text x={padL + 2} y={bandBot + 11} fill="#facc15" fontSize="9">L-ε</text>

        {smallestN <= nMax && (
          <line
            x1={toScreenX(smallestN)}
            y1={padT}
            x2={toScreenX(smallestN)}
            y2={padT + plotH}
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
        )}
        {smallestN <= nMax && (
          <text x={toScreenX(smallestN) + 3} y={padT + 12} fill="#a78bfa" fontSize="9">N={smallestN}</text>
        )}

        {terms.map(({ n, val }) => {
          const inside = Math.abs(val - L) <= epsilon;
          const cx = toScreenX(n);
          const cy = toScreenY(val);
          return (
            <circle key={n} cx={cx} cy={cy} r="4.5" fill={inside ? '#4ade80' : '#ef4444'} stroke="#090d16" strokeWidth="1" />
          );
        })}

        <rect x={10} y={10} width={220} height={72} rx="5" fill="rgba(15,23,42,0.88)" stroke="#334155" strokeWidth="1" />
        <text x={20} y={28} fill="#f8fafc" fontSize="12" fontWeight="bold">{def.label}</text>
        <text x={20} y={44} fill="#4ade80" fontSize="11">L = {def.limitLabel}</text>
        <text x={20} y={58} fill="#facc15" fontSize="11">ε = {epsilon.toFixed(2)}</text>
        {smallestN <= nMax
          ? <text x={20} y={74} fill="#a78bfa" fontSize="10">Từ n &gt; {smallestN - 1}: tất cả nằm trong dải</text>
          : <text x={20} y={74} fill="#f87171" fontSize="10">Chưa hội tụ trong phạm vi hiển thị</text>
        }

        <rect x={W - 110} y={10} width={100} height={44} rx="4" fill="rgba(15,23,42,0.85)" stroke="#334155" strokeWidth="1" />
        <circle cx={W - 100} cy={24} r="4" fill="#4ade80" />
        <text x={W - 93} y={28} fill="#94a3b8" fontSize="10">Trong dải ε</text>
        <circle cx={W - 100} cy={44} r="4" fill="#ef4444" />
        <text x={W - 93} y={48} fill="#94a3b8" fontSize="10">Ngoài dải ε</text>

        <text x={W / 2} y={H - 8} fill="#475569" fontSize="10" textAnchor="middle">Giới hạn dãy số: lim aₙ = {def.limitLabel} khi n → ∞</text>
      </svg>
    </div>
  );
}
