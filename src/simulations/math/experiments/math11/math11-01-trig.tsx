import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function TrigSimulation({ config }: SimulationProps) {
  const params = config.parameters;
  const A = params.find(p => p.key === 'A')?.value ?? 1;
  const B = params.find(p => p.key === 'B')?.value ?? 1;
  const C = params.find(p => p.key === 'C')?.value ?? 0;
  const D = params.find(p => p.key === 'D')?.value ?? 0;
  const fn = params.find(p => p.key === 'fn')?.value ?? 0;

  const W = 600;
  const H = 400;
  const scale = 35;
  const ox = 300;
  const oy = 200;

  const fnIndex = Math.round(fn);
  const color = fnIndex === 0 ? '#38bdf8' : fnIndex === 1 ? '#fbbf24' : '#4ade80';
  const fnName = fnIndex === 0 ? 'sin' : fnIndex === 1 ? 'cos' : 'tan';
  const tanClip = Math.abs(A) * 3;

  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; label?: string; isX: boolean }[] = [];
    const xRange = Math.ceil(W / (2 * scale)) + 1;
    const yRange = Math.ceil(H / (2 * scale)) + 1;
    for (let i = -xRange; i <= xRange; i++) {
      lines.push({ x1: toSX(i), y1: 0, x2: toSX(i), y2: H, isX: true });
    }
    for (let i = -yRange; i <= yRange; i++) {
      lines.push({ x1: 0, y1: toSY(i), x2: W, y2: toSY(i), isX: false });
    }
    return lines;
  }, []);

  const curvePath = useMemo(() => {
    const Bsafe = B === 0 ? 0.001 : B;
    const segments: string[] = [];
    const steps = 600;
    const xMin = -W / (2 * scale);
    const xMax = W / (2 * scale);
    const dx = (xMax - xMin) / steps;
    let currentSeg = '';
    let prevY: number | null = null;

    for (let i = 0; i <= steps; i++) {
      const xv = xMin + i * dx;
      let yv: number;
      if (fnIndex === 0) {
        yv = A * Math.sin(Bsafe * xv + C) + D;
      } else if (fnIndex === 1) {
        yv = A * Math.cos(Bsafe * xv + C) + D;
      } else {
        const tanVal = Math.tan(Bsafe * xv + C);
        yv = A * tanVal + D;
        if (Math.abs(tanVal) > tanClip / Math.max(Math.abs(A), 0.01)) {
          if (currentSeg) segments.push(currentSeg);
          currentSeg = '';
          prevY = null;
          continue;
        }
      }

      const sx = toSX(xv);
      const sy = toSY(yv);

      if (sy < -200 || sy > H + 200) {
        if (currentSeg) segments.push(currentSeg);
        currentSeg = '';
        prevY = null;
        continue;
      }

      if (fnIndex === 2 && prevY !== null && Math.abs(sy - prevY) > 80) {
        if (currentSeg) segments.push(currentSeg);
        currentSeg = `M ${sx.toFixed(2)} ${sy.toFixed(2)}`;
      } else if (currentSeg === '') {
        currentSeg = `M ${sx.toFixed(2)} ${sy.toFixed(2)}`;
      } else {
        currentSeg += ` L ${sx.toFixed(2)} ${sy.toFixed(2)}`;
      }
      prevY = sy;
    }
    if (currentSeg) segments.push(currentSeg);
    return segments;
  }, [A, B, C, D, fnIndex]);

  const period = useMemo(() => {
    const Babs = Math.abs(B) === 0 ? 0.001 : Math.abs(B);
    return (fnIndex === 2 ? Math.PI : 2 * Math.PI) / Babs;
  }, [B, fnIndex]);

  const periodInScreen = period * scale;
  const periodStartX = ox;
  const periodEndX = ox + periodInScreen;
  const periodY = oy + 30;

  const amplitudeTopY = toSY(D + Math.abs(A));
  const amplitudeBotY = toSY(D - Math.abs(A));

  const xTicks = useMemo(() => {
    const ticks: { val: number; label: string }[] = [];
    const xRange = Math.ceil(W / (2 * scale));
    for (let i = -xRange; i <= xRange; i++) {
      if (i !== 0) ticks.push({ val: i, label: `${i}` });
    }
    const piSteps = [-2, -1, 1, 2];
    piSteps.forEach(n => {
      const xv = n * Math.PI;
      if (Math.abs(xv) <= W / (2 * scale)) {
        ticks.push({ val: xv, label: n === 1 ? 'π' : n === -1 ? '-π' : `${n}π` });
      }
    });
    return ticks;
  }, []);

  const yTicks = useMemo(() => {
    const ticks: { val: number }[] = [];
    const yRange = Math.ceil(H / (2 * scale));
    for (let i = -yRange; i <= yRange; i++) {
      if (i !== 0) ticks.push({ val: i });
    }
    return ticks;
  }, []);

  const fmtNum = (v: number) => {
    if (Math.abs(v) < 0.001) return '0';
    const rounded = Math.round(v * 100) / 100;
    return rounded.toString();
  };

  const Adisplay = fmtNum(A);
  const Bdisplay = fmtNum(B);
  const Cdisplay = fmtNum(C);
  const Ddisplay = fmtNum(D);

  const formula = (() => {
    let s = `y = `;
    if (A !== 1 && A !== -1) s += `${Adisplay}·`;
    else if (A === -1) s += `-`;
    s += `${fnName}(`;
    if (B !== 1 && B !== -1) s += `${Bdisplay}x`;
    else if (B === -1) s += `-x`;
    else s += `x`;
    if (C > 0) s += ` + ${Cdisplay}`;
    else if (C < 0) s += ` - ${fmtNum(Math.abs(C))}`;
    s += `)`;
    if (D > 0) s += ` + ${Ddisplay}`;
    else if (D < 0) s += ` - ${fmtNum(Math.abs(D))}`;
    return s;
  })();

  const showAmplitude = fnIndex !== 2;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
        <g stroke="#1e293b" strokeWidth="0.5" opacity="0.8">
          {gridLines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>

        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <polygon points={`${W - 6},${oy - 4} ${W},${oy} ${W - 6},${oy + 4}`} fill="#475569" />
        <polygon points={`${ox - 4},6 ${ox},0 ${ox + 4},6`} fill="#475569" />
        <text x={W - 10} y={oy - 8} fill="#94a3b8" fontSize="12" fontWeight="bold">x</text>
        <text x={ox + 8} y={14} fill="#94a3b8" fontSize="12" fontWeight="bold">y</text>
        <text x={ox - 10} y={oy + 14} fill="#64748b" fontSize="10" textAnchor="end">0</text>

        <g fill="#64748b" fontSize="10" textAnchor="middle">
          {xTicks.map((t, i) => (
            <g key={`xt-${i}`}>
              <line x1={toSX(t.val)} y1={oy - 3} x2={toSX(t.val)} y2={oy + 3} stroke="#64748b" strokeWidth="1" />
              <text x={toSX(t.val)} y={oy + 14}>{t.label}</text>
            </g>
          ))}
        </g>
        <g fill="#64748b" fontSize="10" textAnchor="end">
          {yTicks.map((t, i) => (
            <g key={`yt-${i}`}>
              <line x1={ox - 3} y1={toSY(t.val)} x2={ox + 3} y2={toSY(t.val)} stroke="#64748b" strokeWidth="1" />
              <text x={ox - 6} y={toSY(t.val) + 4}>{t.val}</text>
            </g>
          ))}
        </g>

        {showAmplitude && amplitudeTopY > 0 && amplitudeTopY < H && (
          <line x1={0} y1={amplitudeTopY} x2={W} y2={amplitudeTopY}
            stroke={color} strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
        )}
        {showAmplitude && amplitudeBotY > 0 && amplitudeBotY < H && (
          <line x1={0} y1={amplitudeBotY} x2={W} y2={amplitudeBotY}
            stroke={color} strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
        )}
        {showAmplitude && amplitudeTopY > 0 && amplitudeTopY < H && (
          <text x={W - 8} y={amplitudeTopY - 4} fill={color} fontSize="10" textAnchor="end" opacity="0.7">
            D+|A|={fmtNum(D + Math.abs(A))}
          </text>
        )}
        {showAmplitude && amplitudeBotY > 0 && amplitudeBotY < H && (
          <text x={W - 8} y={amplitudeBotY + 12} fill={color} fontSize="10" textAnchor="end" opacity="0.7">
            D-|A|={fmtNum(D - Math.abs(A))}
          </text>
        )}

        {periodEndX > 0 && periodEndX < W && periodStartX < W && (
          <g>
            <line x1={periodStartX} y1={periodY} x2={periodEndX} y2={periodY}
              stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.5" />
            <line x1={periodStartX} y1={periodY - 5} x2={periodStartX} y2={periodY + 5}
              stroke="#e2e8f0" strokeWidth="1.5" opacity="0.5" />
            <line x1={periodEndX} y1={periodY - 5} x2={periodEndX} y2={periodY + 5}
              stroke="#e2e8f0" strokeWidth="1.5" opacity="0.5" />
            <text x={(periodStartX + periodEndX) / 2} y={periodY + 14}
              fill="#e2e8f0" fontSize="10" textAnchor="middle" opacity="0.65">
              T = {fmtNum(period)}
            </text>
          </g>
        )}

        <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {curvePath.map((d, i) => (
            <path key={i} d={d} stroke={color} />
          ))}
        </g>

        <rect x="8" y="8" width="260" height="32" rx="6"
          fill="rgba(9,13,22,0.88)" stroke="#334155" strokeWidth="1" />
        <text x="18" y="29" fill={color} fontSize="13" fontFamily="monospace" fontWeight="500">
          {formula}
        </text>

        <rect x="8" y="48" width="160" height="22" rx="4"
          fill="rgba(9,13,22,0.75)" stroke="#1e293b" strokeWidth="1" />
        <text x="16" y="63" fill="#94a3b8" fontSize="11" fontFamily="monospace">
          {fnName === 'tan' ? `Chu kỳ T = π/|B|` : `Chu kỳ T = 2π/|B|`} = {fmtNum(period)}
        </text>

        {showAmplitude && (
          <>
            <rect x="8" y="78" width="160" height="22" rx="4"
              fill="rgba(9,13,22,0.75)" stroke="#1e293b" strokeWidth="1" />
            <text x="16" y="93" fill="#94a3b8" fontSize="11" fontFamily="monospace">
              Biên độ |A| = {fmtNum(Math.abs(A))}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
