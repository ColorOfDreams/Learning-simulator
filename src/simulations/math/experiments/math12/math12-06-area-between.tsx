import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

type CurvePair = { label: string; f: (x:number)=>number; g: (x:number)=>number; a: number; b: number };

const PAIRS: CurvePair[] = [
  { label: 'x² và x+2',   f: x => x+2,     g: x => x*x,          a: -1,       b: 2       },
  { label: 'sin và cos',   f: x => Math.sin(x), g: x => Math.cos(x), a: Math.PI/4, b: 5*Math.PI/4 },
  { label: 'x³ và x',     f: x => x,        g: x => x*x*x,        a: -1,       b: 1       },
  { label: '√x và x²',    f: x => Math.sqrt(Math.max(0,x)), g: x => x*x, a: 0, b: 1 },
];

export default function AreaBetweenSimulation({ config }: SimulationProps) {
  const pairIdx = Math.round(config.parameters?.find(p => p.key === 'pairIdx')?.value ?? 0) % PAIRS.length;
  const pair = PAIRS[pairIdx];
  const { f, g, a, b, label } = pair;

  const W = 600; const H = 400;
  const { ox, oy, scale, xMin, xMax, yMin, yMax, svgHandlers, resetView, isDirty } = useMathPanZoom(80, W, H);
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const { pathF, pathG, areaPath, area } = useMemo(() => {
    const pF: string[] = []; const pG: string[] = [];
    for (let i = 0; i <= W; i += 2) {
      const x = (i - ox) / scale;
      const yf = f(x); const yg = g(x);
      if (isFinite(yf) && Math.abs(yf) <= 5)
        pF.push(`${!pF.length?'M':'L'} ${i.toFixed(1)} ${toSY(yf).toFixed(1)}`);
      if (isFinite(yg) && Math.abs(yg) <= 5)
        pG.push(`${!pG.length?'M':'L'} ${i.toFixed(1)} ${toSY(yg).toFixed(1)}`);
    }

    // Area path: trace f from a to b, then g backwards
    const steps = 80;
    const dx = (b - a) / steps;
    const topPts: string[] = []; const botPts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = a + i * dx;
      const yf = f(x); const yg = g(x);
      if (!isFinite(yf) || !isFinite(yg)) continue;
      const top = Math.max(yf, yg); const bot = Math.min(yf, yg);
      topPts.push(`${!topPts.length?'M':'L'} ${toSX(x).toFixed(1)} ${toSY(top).toFixed(1)}`);
      botPts.push(`${toSX(x).toFixed(1)} ${toSY(bot).toFixed(1)}`);
    }
    const aPath = topPts.length ? `${topPts.join(' ')} L ${botPts.reverse().join(' L ')} Z` : '';

    // Numerical integration
    let areaSq = 0;
    for (let i = 0; i < 200; i++) {
      const x = a + (i + 0.5) * (b - a) / 200;
      areaSq += Math.abs(f(x) - g(x)) * (b - a) / 200;
    }

    return { pathF: pF.join(' '), pathG: pG.join(' '), areaPath: aPath, area: areaSq };
  }, [pairIdx, ox, oy, scale]);

  const xTicks = useMemo(() => {
    const t: number[] = [];
    for (let i = Math.ceil(xMin); i <= Math.floor(xMax); i++) if (i !== 0) t.push(i);
    return t;
  }, [xMin, xMax]);
  const yTicks = useMemo(() => {
    const t: number[] = [];
    for (let i = Math.ceil(yMin); i <= Math.floor(yMax); i++) if (i !== 0) t.push(i);
    return t;
  }, [yMin, yMax]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Shaded area */}
        {areaPath && <path d={areaPath} fill="#38bdf820" stroke="none" />}

        {/* Boundary lines */}
        <line x1={toSX(a)} y1={0} x2={toSX(a)} y2={H} stroke="#4ade80" strokeWidth="1" strokeDasharray="5 3" />
        <line x1={toSX(b)} y1={0} x2={toSX(b)} y2={H} stroke="#4ade80" strokeWidth="1" strokeDasharray="5 3" />

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <text x={W-6} y={oy-5} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+5} y={12} fill="#64748b" fontSize="12">y</text>

        {/* Ticks */}
        {xTicks.filter((_,i)=>i%2===0).map(x => <text key={`xt${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>)}
        {yTicks.filter((_,i)=>i%2===0).map(y => <text key={`yt${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}</text>)}

        {/* Curves */}
        <path d={pathF} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        <path d={pathG} fill="none" stroke="#f97316" strokeWidth="2.5" />

        {/* Info */}
        <rect x={8} y={8} width={280} height={66} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={26} fill="#94a3b8" fontSize="12">Diện tích: {label}</text>
        <line x1={16} y1={38} x2={36} y2={38} stroke="#38bdf8" strokeWidth="2" />
        <text x={42} y={42} fill="#38bdf8" fontSize="11">f(x) (trên)</text>
        <line x1={120} y1={38} x2={140} y2={38} stroke="#f97316" strokeWidth="2" />
        <text x={146} y={42} fill="#f97316" fontSize="11">g(x) (dưới)</text>
        <text x={16} y={62} fill="#4ade80" fontSize="12">S = ∫|f−g|dx ≈ {area.toFixed(4)}</text>
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
