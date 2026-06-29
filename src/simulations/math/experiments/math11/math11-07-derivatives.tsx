import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function DerivativesSimulation({ config }: SimulationProps) {
  const fnIdx = Math.round(config.parameters?.find(p => p.key === 'fnIdx')?.value ?? 0);
  const x0 = config.parameters?.find(p => p.key === 'x0')?.value ?? 1.0;
  const h = config.parameters?.find(p => p.key === 'h')?.value ?? 0.5;

  const W = 600;
  const H = 400;
  const mainH = 270;
  const derivH = 100;
  const derivY = mainH + 30;

  const scale = 40;
  const mainOriginX = W / 2;
  const mainOriginY = mainH / 2;

  const toSX = (x: number) => mainOriginX + x * scale;
  const toSY = (y: number) => mainOriginY - y * scale;

  const derivOriginX = W / 2;
  const derivOriginY = derivY + derivH / 2;
  const derivScale = 35;
  const toDS = (x: number, y: number) => ({
    x: derivOriginX + x * derivScale,
    y: derivOriginY - y * derivScale,
  });

  type FnDef = {
    label: string;
    derivLabel: string;
    f: (x: number) => number;
    df: (x: number) => number;
  };

  const fnDefs: FnDef[] = [
    { label: 'f(x) = x²', derivLabel: "f'(x) = 2x", f: (x) => x * x, df: (x) => 2 * x },
    { label: 'f(x) = x³', derivLabel: "f'(x) = 3x²", f: (x) => x * x * x, df: (x) => 3 * x * x },
    { label: 'f(x) = sin(x)', derivLabel: "f'(x) = cos(x)", f: (x) => Math.sin(x), df: (x) => Math.cos(x) },
    { label: 'f(x) = x³-3x', derivLabel: "f'(x) = 3x²-3", f: (x) => x * x * x - 3 * x, df: (x) => 3 * x * x - 3 },
  ];

  const def = fnDefs[Math.min(3, Math.max(0, fnIdx))];
  const f = def.f;
  const df = def.df;

  const fy0 = f(x0);
  const slope = df(x0);
  const slopeSecant = h !== 0 ? (f(x0 + h) - fy0) / h : slope;

  const xMin = -mainOriginX / scale;
  const xMax = (W - mainOriginX) / scale;
  const yMin = -mainOriginY / scale;
  const yMax = mainOriginY / scale;

  const mainPath = useMemo(() => {
    const steps = 200;
    const dx = (xMax - xMin) / steps;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = f(x);
      if (!isFinite(y) || y < yMin - 3 || y > yMax + 3) {
        if (pts.length > 0) pts.push('Z M');
        continue;
      }
      const cmd = pts.length === 0 ? 'M' : 'L';
      pts.push(`${cmd} ${toSX(x).toFixed(2)} ${toSY(y).toFixed(2)}`);
    }
    return pts.join(' ');
  }, [fnIdx]);

  const tangentPath = useMemo(() => {
    const ext = (xMax - xMin) * 0.45;
    const x1 = x0 - ext;
    const x2 = x0 + ext;
    const y1 = fy0 + slope * (x1 - x0);
    const y2 = fy0 + slope * (x2 - x0);
    return `M ${toSX(x1)} ${toSY(y1)} L ${toSX(x2)} ${toSY(y2)}`;
  }, [fnIdx, x0, h]);

  const secantPath = useMemo(() => {
    const ext = (xMax - xMin) * 0.35;
    const x1 = x0 - ext;
    const x2 = x0 + h + ext;
    const y1 = fy0 + slopeSecant * (x1 - x0);
    const y2 = fy0 + slopeSecant * (x2 - x0);
    return `M ${toSX(x1)} ${toSY(y1)} L ${toSX(x2)} ${toSY(y2)}`;
  }, [fnIdx, x0, h]);

  const derivPath = useMemo(() => {
    const dxMin = -derivOriginX / derivScale;
    const dxMax = (W - derivOriginX) / derivScale;
    const dyMin = -derivH / 2 / derivScale;
    const dyMax = derivH / 2 / derivScale;
    const steps = 160;
    const dx = (dxMax - dxMin) / steps;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = dxMin + i * dx;
      const y = df(x);
      if (!isFinite(y) || y < dyMin - 1 || y > dyMax + 1) {
        if (pts.length > 0) pts.push('Z M');
        continue;
      }
      const p = toDS(x, y);
      const cmd = pts.length === 0 ? 'M' : 'L';
      pts.push(`${cmd} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [fnIdx]);

  const xTicks: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    if (x !== 0) xTicks.push(x);
  }
  const yTicks: number[] = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    if (y !== 0) yTicks.push(y);
  }

  const x1pt = toSX(x0 + h);
  const y1pt = toSY(f(x0 + h));

  return (
    <div style={{ width: '100%', height: '100%', background: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', position: 'relative', boxSizing: 'border-box', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        <clipPath id="mainClip">
          <rect x={0} y={0} width={W} height={mainH} />
        </clipPath>
        <clipPath id="derivClip">
          <rect x={0} y={derivY} width={W} height={derivH} />
        </clipPath>

        <g stroke="#1e293b" strokeWidth="0.5">
          {xTicks.map(x => (
            <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={mainH} />
          ))}
          {yTicks.map(y => (
            <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} />
          ))}
        </g>

        <line x1={0} y1={mainOriginY} x2={W} y2={mainOriginY} stroke="#475569" strokeWidth="1.5" />
        <line x1={mainOriginX} y1={0} x2={mainOriginX} y2={mainH} stroke="#475569" strokeWidth="1.5" />
        <text x={W - 14} y={mainOriginY - 7} fill="#94a3b8" fontSize="11" fontWeight="bold">x</text>
        <text x={mainOriginX + 7} y={13} fill="#94a3b8" fontSize="11" fontWeight="bold">y</text>
        <text x={mainOriginX - 10} y={mainOriginY + 13} fill="#64748b" fontSize="10">0</text>

        {xTicks.map(x => (
          <text key={`xt${x}`} x={toSX(x)} y={mainOriginY + 13} fill="#475569" fontSize="9" textAnchor="middle">{x}</text>
        ))}
        {yTicks.map(y => (
          <text key={`yt${y}`} x={mainOriginX - 7} y={toSY(y) + 3} fill="#475569" fontSize="9" textAnchor="end">{y}</text>
        ))}

        <path d={secantPath} fill="none" stroke="#facc15" strokeWidth="1.8" strokeDasharray="6 4" clipPath="url(#mainClip)" />

        <path d={tangentPath} fill="none" stroke="#fb923c" strokeWidth="2.5" clipPath="url(#mainClip)" />

        <path d={mainPath} fill="none" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" clipPath="url(#mainClip)" />

        <circle cx={toSX(x0)} cy={toSY(fy0)} r="5.5" fill="#fb923c" stroke="#090d16" strokeWidth="1.5" />

        {Math.abs(h) > 0.05 && x1pt > 0 && x1pt < W && y1pt > 0 && y1pt < mainH && (
          <circle cx={x1pt} cy={y1pt} r="4" fill="#facc15" stroke="#090d16" strokeWidth="1.5" />
        )}

        <rect x={10} y={6} width={220} height={76} rx="5" fill="rgba(15,23,42,0.9)" stroke="#334155" strokeWidth="1" />
        <text x={18} y={22} fill="#22d3ee" fontSize="12" fontWeight="bold">{def.label}</text>
        <text x={18} y={38} fill="#fb923c" fontSize="11">{def.derivLabel}</text>
        <text x={18} y={54} fill="#fb923c" fontSize="11">f'({x0.toFixed(2)}) = {slope.toFixed(3)}</text>
        <text x={18} y={70} fill="#facc15" fontSize="10">
          Cát tuyến (h={h.toFixed(2)}): k ≈ {slopeSecant.toFixed(3)}
        </text>

        <line x1={0} y1={mainH + 2} x2={W} y2={mainH + 2} stroke="#1e293b" strokeWidth="1" />
        <text x={W / 2} y={mainH + 18} fill="#64748b" fontSize="10" textAnchor="middle">
          Kéo thanh h→0 để thấy cát tuyến → tiếp tuyến
        </text>
        <line x1={0} y1={derivY - 2} x2={W} y2={derivY - 2} stroke="#1e293b" strokeWidth="1" />

        <line x1={0} y1={derivOriginY} x2={W} y2={derivOriginY} stroke="#334155" strokeWidth="1" />
        <line x1={derivOriginX} y1={derivY} x2={derivOriginX} y2={derivY + derivH} stroke="#334155" strokeWidth="1" />

        <path d={derivPath} fill="none" stroke="#a78bfa" strokeWidth="2" clipPath="url(#derivClip)" />

        <line
          x1={toDS(x0, 0).x}
          y1={derivY}
          x2={toDS(x0, 0).x}
          y2={derivY + derivH}
          stroke="#fb923c"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        {(() => {
          const p = toDS(x0, df(x0));
          if (p.y >= derivY && p.y <= derivY + derivH) {
            return <circle cx={p.x} cy={p.y} r="4" fill="#fb923c" />;
          }
          return null;
        })()}

        <text x={10} y={derivY + 13} fill="#a78bfa" fontSize="9">f'(x)</text>
        <text x={W - 14} y={derivOriginY + 3} fill="#64748b" fontSize="9">x</text>
      </svg>
    </div>
  );
}
