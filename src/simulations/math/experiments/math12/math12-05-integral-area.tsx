import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

type FnDef = { label: string; f: (x: number) => number; F: (x: number) => number };

const FNS: FnDef[] = [
  { label: 'f(x) = sin(x)', f: x => Math.sin(x), F: x => -Math.cos(x) },
  { label: 'f(x) = x²',     f: x => x*x,          F: x => x*x*x/3       },
  { label: 'f(x) = x³ − 2x', f: x => x*x*x - 2*x, F: x => x*x*x*x/4 - x*x },
  { label: 'f(x) = e^x / 4', f: x => Math.exp(x)/4, F: x => Math.exp(x)/4   },
];

export default function IntegralAreaSimulation({ config }: SimulationProps) {
  const fnIdx = Math.round(config.parameters?.find(p => p.key === 'fnIdx')?.value ?? 0) % FNS.length;
  const rawA  = config.parameters?.find(p => p.key === 'a')?.value ?? 0;
  const rawB  = config.parameters?.find(p => p.key === 'b')?.value ?? Math.PI;
  const N     = Math.max(1, Math.round(config.parameters?.find(p => p.key === 'N')?.value ?? 8));

  const a = Math.min(rawA, rawB);
  const b = Math.max(rawA, rawB);
  const { f, F, label } = FNS[fnIdx];
  const integral = F(b) - F(a);

  const W = 600; const H = 400;
  const { svgHandlers, groupTransform, resetView, isDirty } = useMathPanZoom(1, W, H);
  const scale = 60;
  const ox = W / 2; const oy = H * 0.6;
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const { curvePath, riemannBars } = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= W; i += 2) {
      const x = (i - ox) / scale;
      const y = f(x);
      if (!isFinite(y) || Math.abs(y) > 6) { if (pts.length) pts.push('Z'); continue; }
      pts.push(`${!pts.length||pts[pts.length-1]==='Z'?'M':'L'} ${i.toFixed(1)} ${toSY(y).toFixed(1)}`);
    }
    const bars: { x1: number; y1: number; x2: number; y2: number; pos: boolean }[] = [];
    const dx = (b - a) / N;
    for (let i = 0; i < N; i++) {
      const xMid = a + (i + 0.5) * dx;
      const yVal = f(xMid);
      if (!isFinite(yVal)) continue;
      bars.push({
        x1: toSX(a + i * dx), y1: oy,
        x2: toSX(a + (i+1)*dx), y2: toSY(yVal),
        pos: yVal >= 0,
      });
    }
    return { curvePath: pts.join(' '), riemannBars: bars };
  }, [fnIdx, a, b, N]);

  const xTicks = Array.from({length: 11}, (_, i) => i - 5).filter(x => x !== 0);
  const yTicks = Array.from({length: 7},  (_, i) => i - 3).filter(y => y !== 0);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />
        <g transform={groupTransform}>

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Riemann bars */}
        {riemannBars.map((bar, i) => (
          <rect key={i}
            x={Math.min(bar.x1, bar.x2)} y={Math.min(bar.y1, bar.y2)}
            width={Math.abs(bar.x2 - bar.x1)} height={Math.abs(bar.y1 - bar.y2)}
            fill={bar.pos ? '#38bdf820' : '#ef444420'}
            stroke={bar.pos ? '#38bdf860' : '#ef444460'}
            strokeWidth="0.5"
          />
        ))}

        {/* Area boundaries */}
        <line x1={toSX(a)} y1={0} x2={toSX(a)} y2={H} stroke="#4ade80" strokeWidth="1.5" strokeDasharray="5 3" />
        <line x1={toSX(b)} y1={0} x2={toSX(b)} y2={H} stroke="#4ade80" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x={toSX(a)} y={H-8} fill="#4ade80" fontSize="11" textAnchor="middle">a={a.toFixed(2)}</text>
        <text x={toSX(b)} y={H-8} fill="#4ade80" fontSize="11" textAnchor="middle">b={b.toFixed(2)}</text>

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <text x={W-6} y={oy-5} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+5} y={12} fill="#64748b" fontSize="12">y</text>

        {/* Tick labels */}
        {xTicks.filter((_,i)=>i%2===0).map(x => <text key={`xt${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>)}
        {yTicks.map(y => <text key={`yt${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}</text>)}

        {/* Curve */}
        <path d={curvePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Info box */}
        <rect x={8} y={8} width={270} height={72} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={26} fill="#94a3b8" fontSize="12">{label}</text>
        <text x={16} y={44} fill="#4ade80" fontSize="12">∫[{a.toFixed(2)},{b.toFixed(2)}] f(x)dx ≈ {integral.toFixed(4)}</text>
        <text x={16} y={62} fill="#64748b" fontSize="11">Riemann strips N={N}</text>
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
