import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function CubicSimulation({ config }: SimulationProps) {
  const a = config.parameters?.find(p => p.key === 'a')?.value ?? 1;
  const b = config.parameters?.find(p => p.key === 'b')?.value ?? -3;
  const c = config.parameters?.find(p => p.key === 'c')?.value ?? 0;
  const d = config.parameters?.find(p => p.key === 'd')?.value ?? 0;

  const W = 600; const H = 400;
  const mainH = 270; const scale = 40;
  const ox = W / 2; const oy = mainH / 2;

  const f  = (x: number) => a*x*x*x + b*x*x + c*x + d;
  const df = (x: number) => 3*a*x*x + 2*b*x + c;

  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const derivY = mainH + 20;
  const derivH = 90;
  const dOY = derivY + derivH / 2;
  const dS = 30;
  const toDX = (x: number) => ox + x * dS;
  const toDY = (y: number) => dOY - y * dS;

  const { curvePath, extrema, inflection } = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= W; i += 2) {
      const x = (i - ox) / scale;
      const y = f(x);
      if (!isFinite(y) || Math.abs(y) > 7) { if (pts.length) pts.push('Z'); continue; }
      pts.push(`${!pts.length || pts[pts.length-1]==='Z' ? 'M' : 'L'} ${i.toFixed(1)} ${toSY(y).toFixed(1)}`);
    }
    const disc = 4*b*b - 12*a*c;
    const exList: {x: number; y: number; isMax: boolean}[] = [];
    if (Math.abs(a) > 0.001 && disc > 0) {
      const x1 = (-2*b - Math.sqrt(disc)) / (6*a);
      const x2 = (-2*b + Math.sqrt(disc)) / (6*a);
      [x1, x2].forEach(x => {
        if (Math.abs(x) <= 6) exList.push({ x, y: f(x), isMax: df(x + 0.01) < 0 });
      });
    }
    const ix = Math.abs(a) > 0.001 ? -b/(3*a) : NaN;
    const infl = isFinite(ix) && Math.abs(ix) <= 6 ? { x: ix, y: f(ix) } : null;
    return { curvePath: pts.join(' '), extrema: exList, inflection: infl };
  }, [a, b, c, d]);

  const derivPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= W; i += 2) {
      const x = (i - ox) / scale;
      const y = df(x);
      if (!isFinite(y) || Math.abs(y) > 5) { if (pts.length) pts.push('Z'); continue; }
      pts.push(`${!pts.length || pts[pts.length-1]==='Z' ? 'M' : 'L'} ${toDX(x).toFixed(1)} ${toDY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [a, b, c]);

  const xTicks = Array.from({length: 13}, (_, i) => i - 6).filter(x => x !== 0);
  const yTicks = Array.from({length: 9},  (_, i) => i - 4).filter(y => y !== 0);

  const fLabel = `${a}x³ ${b>=0?'+':''}${b}x² ${c>=0?'+':''}${c}x ${d>=0?'+':''}${d}`;
  const dLabel = `${3*a}x² ${2*b>=0?'+':''}${2*b}x ${c>=0?'+':''}${c}`;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid lines */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={mainH} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={mainH} stroke="#475569" strokeWidth="1.5" />
        <text x={W-6} y={oy-5} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+5} y={12} fill="#64748b" fontSize="12">y</text>

        {/* Tick labels */}
        {xTicks.filter((_,i) => i%2===0).map(x => <text key={`xt${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>)}
        {yTicks.filter((_,i) => i%2===0).map(y => <text key={`yt${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}</text>)}

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Extrema */}
        {extrema.map((pt, i) => {
          const sx = toSX(pt.x); const sy = toSY(pt.y);
          if (sy < 2 || sy > mainH - 2) return null;
          const col = pt.isMax ? '#4ade80' : '#f97316';
          return (
            <g key={i}>
              <circle cx={sx} cy={sy} r={5} fill={col} />
              <text x={sx+7} y={sy+4} fill={col} fontSize="11">{pt.isMax ? 'Cực đại' : 'Cực tiểu'} ({pt.x.toFixed(1)}, {pt.y.toFixed(1)})</text>
            </g>
          );
        })}

        {/* Inflection point */}
        {inflection && (() => {
          const sx = toSX(inflection.x); const sy = toSY(inflection.y);
          return sy > 2 && sy < mainH - 2 ? (
            <g>
              <circle cx={sx} cy={sy} r={4} fill="#a78bfa" />
              <text x={sx+7} y={sy-5} fill="#a78bfa" fontSize="11">Điểm uốn ({inflection.x.toFixed(1)}, {inflection.y.toFixed(1)})</text>
            </g>
          ) : null;
        })()}

        {/* Info box */}
        <rect x={8} y={8} width={240} height={50} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={25} fill="#94a3b8" fontSize="12">f(x) = {fLabel}</text>
        <text x={16} y={42} fill="#64748b" fontSize="11">f′(x) = {dLabel}</text>

        {/* Separator */}
        <line x1={0} y1={mainH} x2={W} y2={mainH} stroke="#1e293b" strokeWidth="1" />
        <text x={ox} y={mainH+14} fill="#64748b" fontSize="11" textAnchor="middle">Đồ thị f′(x)</text>

        {/* Derivative panel axes */}
        <line x1={0} y1={dOY} x2={W} y2={dOY} stroke="#334155" strokeWidth="1" />
        <line x1={ox} y1={derivY} x2={ox} y2={derivY+derivH} stroke="#334155" strokeWidth="1" />

        {/* Vertical dashed lines at extrema */}
        {extrema.map((pt, i) => (
          <line key={i} x1={toDX(pt.x)} y1={derivY} x2={toDX(pt.x)} y2={derivY+derivH}
            stroke="#64748b" strokeWidth="1" strokeDasharray="4 3" />
        ))}

        {/* Derivative curve */}
        <path d={derivPath} fill="none" stroke="#c084fc" strokeWidth="2" />
        <text x={W-6} y={derivY+12} fill="#c084fc" fontSize="11" textAnchor="end">f′(x)</text>
      </svg>
    </div>
  );
}
