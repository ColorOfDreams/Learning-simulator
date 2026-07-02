import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function ExponentialSimulation({ config }: SimulationProps) {
  const base = Math.max(0.1, config.parameters?.find(p => p.key === 'base')?.value ?? 2);

  const W = 600; const H = 400;
  const { ox, oy, scale, xMin, xMax, yMin, yMax, svgHandlers, resetView, isDirty } = useMathPanZoom(50, W, H);
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const isGrowth = base > 1;

  const makeExpPath = (baseVal: number, color: string) => {
    const pts: string[] = [];
    for (let i = 0; i <= W; i += 2) {
      const x = (i - ox) / scale;
      const y = Math.pow(baseVal, x);
      if (!isFinite(y) || y > 8 || y < 0.001) { if (pts.length) pts.push('Z'); continue; }
      pts.push(`${!pts.length || pts[pts.length-1]==='Z' ? 'M' : 'L'} ${i.toFixed(1)} ${toSY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const { mainPath, invPath } = useMemo(() => ({
    mainPath: makeExpPath(base, '#38bdf8'),
    invPath: makeExpPath(1 / base, '#f97316'),
  }), [base, ox, oy, scale]);

  const xTicks = useMemo(() => {
    const t: number[] = [];
    for (let i = Math.ceil(xMin); i <= Math.floor(xMax); i++) if (i !== 0) t.push(i);
    return t;
  }, [xMin, xMax]);
  const yTicks = useMemo(() => {
    const t: number[] = [];
    for (let i = Math.ceil(yMin); i <= Math.floor(yMax); i++) if (i !== 0 && i > 0) t.push(i);
    return t;
  }, [yMin, yMax]);

  const pts1 = toSY(1); const pt2 = toSY(base);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Horizontal asymptote y=0 */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth="1" strokeDasharray="6 4" />
        <text x={W-6} y={oy-4} fill="#475569" fontSize="10" textAnchor="end">tiệm cận y=0</text>

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <text x={W-6} y={oy-5} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+5} y={12} fill="#64748b" fontSize="12">y</text>

        {/* Tick labels */}
        {xTicks.filter((_,i)=>i%2===0).map(x => <text key={`xt${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>)}
        {yTicks.map(y => <text key={`yt${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}</text>)}

        {/* Inverse base curve */}
        <path d={invPath} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6 3" />

        {/* Main curve */}
        <path d={mainPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Key points */}
        {pts1 > 0 && pts1 < H && (
          <g>
            <circle cx={ox} cy={pts1} r={4} fill="#94a3b8" />
            <text x={ox+8} y={pts1+4} fill="#94a3b8" fontSize="11">(0, 1)</text>
          </g>
        )}
        {pt2 > 0 && pt2 < H && (
          <g>
            <circle cx={toSX(1)} cy={pt2} r={4} fill="#38bdf8" />
            <text x={toSX(1)+8} y={pt2+4} fill="#38bdf8" fontSize="11">(1, {base.toFixed(2)})</text>
          </g>
        )}

        {/* Info box */}
        <rect x={8} y={8} width={250} height={72} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={26} fill="#38bdf8" fontSize="13">y = {base.toFixed(2)}^x</text>
        <text x={16} y={44} fill="#f97316" fontSize="12" opacity={0.8}>y = {(1/base).toFixed(2)}^x  (cơ số nghịch)</text>
        <text x={16} y={62} fill="#64748b" fontSize="11">{isGrowth ? '⬆ Hàm tăng (a > 1)' : '⬇ Hàm giảm (0 < a < 1)'}</text>

        {/* Legend */}
        <line x1={W-120} y1={H-25} x2={W-100} y2={H-25} stroke="#38bdf8" strokeWidth="2" />
        <text x={W-96} y={H-21} fill="#38bdf8" fontSize="11">a^x</text>
        <line x1={W-120} y1={H-10} x2={W-100} y2={H-10} stroke="#f97316" strokeWidth="2" strokeDasharray="5 3" />
        <text x={W-96} y={H-6} fill="#f97316" fontSize="11">(1/a)^x</text>
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
