import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function VectorSimulation({ config }: SimulationProps) {
  const ux = config.parameters?.find(p => p.key === 'ux')?.value ?? 3;
  const uy = config.parameters?.find(p => p.key === 'uy')?.value ?? 1;
  const vx = config.parameters?.find(p => p.key === 'vx')?.value ?? 1;
  const vy = config.parameters?.find(p => p.key === 'vy')?.value ?? 3;

  const W = 600; const H = 400;
  const scale = 50;
  const ox = W / 2; const oy = H / 2;
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const { modU, modV, dot, angle } = useMemo(() => {
    const mU = Math.sqrt(ux * ux + uy * uy);
    const mV = Math.sqrt(vx * vx + vy * vy);
    const d = ux * vx + uy * vy;
    const cosA = mU > 0 && mV > 0 ? d / (mU * mV) : 1;
    const ang = Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI;
    return { modU: mU, modV: mV, dot: d, angle: ang };
  }, [ux, uy, vx, vy]);

  const fmtN = (v: number) => (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, '');

  const xTicks = [-4,-3,-2,-1,1,2,3,4];
  const yTicks = [-3,-2,-1,1,2,3];

  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, dashed = false, sw = 2.5) => {
    const dx = x2 - x1; const dy = y2 - y1;
    const len = Math.sqrt(dx*dx+dy*dy);
    if (len < 2) return null;
    const ux2 = dx/len; const uy2 = dy/len;
    const AL = 12;
    const p1x = x2 - AL*(ux2*0.866-uy2*0.5); const p1y = y2 - AL*(uy2*0.866+ux2*0.5);
    const p2x = x2 - AL*(ux2*0.866+uy2*0.5); const p2y = y2 - AL*(uy2*0.866-ux2*0.5);
    return (
      <g stroke={color} fill="none" strokeWidth={sw} strokeLinecap="round">
        <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dashed ? '8 4' : undefined} />
        <polyline points={`${p1x.toFixed(1)},${p1y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`} />
      </g>
    );
  };

  const SUX = toSX(ux); const SUY = toSY(uy);
  const SVX = toSX(vx); const SVY = toSY(vy);
  const SUVX = toSX(ux+vx); const SUVY = toSY(uy+vy);
  const SDVX = toSX(ux-vx); const SDVY = toSY(uy-vy);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Parallelogram dashed lines */}
        <line x1={SUX} y1={SUY} x2={SUVX} y2={SUVY} stroke="#4ade80" strokeWidth="1" strokeDasharray="5 3" opacity="0.45" />
        <line x1={SVX} y1={SVY} x2={SUVX} y2={SUVY} stroke="#4ade80" strokeWidth="1" strokeDasharray="5 3" opacity="0.45" />

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <polygon points={`${W-6},${oy-4} ${W},${oy} ${W-6},${oy+4}`} fill="#475569" />
        <polygon points={`${ox-4},6 ${ox},0 ${ox+4},6`} fill="#475569" />
        <text x={W-8} y={oy-6} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+6} y={13} fill="#64748b" fontSize="12">y</text>
        <text x={ox-8} y={oy+14} fill="#475569" fontSize="10" textAnchor="end">O</text>

        {/* Tick labels */}
        {xTicks.filter((_,i)=>i%2===0).map(x => (
          <text key={`xl${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>
        ))}
        {yTicks.map(y => (
          <text key={`yl${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}</text>
        ))}

        {/* u-v (dashed purple) */}
        {arrow(ox, oy, SDVX, SDVY, '#c084fc', true, 2)}
        {SDVX > 10 && SDVX < W-10 && SDVY > 10 && SDVY < H-10 && (
          <text x={SDVX+8} y={SDVY-4} fill="#c084fc" fontSize="11" fontWeight="500">u-v</text>
        )}

        {/* u+v (green) */}
        {arrow(ox, oy, SUVX, SUVY, '#4ade80', false, 2.5)}
        {SUVX > 10 && SUVX < W-10 && SUVY > 10 && SUVY < H-10 && (
          <text x={SUVX+8} y={SUVY-4} fill="#4ade80" fontSize="11" fontWeight="500">u+v</text>
        )}

        {/* v (orange) */}
        {arrow(ox, oy, SVX, SVY, '#f97316', false, 3)}
        {SVX > 10 && SVX < W-10 && SVY > 10 && SVY < H-10 && (
          <text x={SVX+8} y={SVY-4} fill="#f97316" fontSize="12" fontWeight="600">v</text>
        )}

        {/* u (cyan) */}
        {arrow(ox, oy, SUX, SUY, '#38bdf8', false, 3)}
        {SUX > 10 && SUX < W-10 && SUY > 10 && SUY < H-10 && (
          <text x={SUX+8} y={SUY-4} fill="#38bdf8" fontSize="12" fontWeight="600">u</text>
        )}

        {/* Info box */}
        <rect x={8} y={8} width={210} height={115} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={27} fill="#38bdf8" fontSize="12">u = ({fmtN(ux)}, {fmtN(uy)})   |u| = {fmtN(modU)}</text>
        <text x={16} y={44} fill="#f97316" fontSize="12">v = ({fmtN(vx)}, {fmtN(vy)})   |v| = {fmtN(modV)}</text>
        <text x={16} y={61} fill="#4ade80" fontSize="12">u+v = ({fmtN(ux+vx)}, {fmtN(uy+vy)})</text>
        <text x={16} y={78} fill="#c084fc" fontSize="12">u-v = ({fmtN(ux-vx)}, {fmtN(uy-vy)})</text>
        <text x={16} y={95} fill="#94a3b8" fontSize="11">u·v = {fmtN(dot)}</text>
        <text x={16} y={112} fill="#94a3b8" fontSize="11">Góc (u,v) = {fmtN(angle)}°</text>

        {/* Legend */}
        {[
          { color: '#38bdf8', label: 'u', y: H-50 },
          { color: '#f97316', label: 'v', y: H-36 },
          { color: '#4ade80', label: 'u+v', y: H-22 },
          { color: '#c084fc', label: 'u-v (nét đứt)', y: H-8 },
        ].map(({ color, label, y }) => (
          <g key={label}>
            <line x1={W-130} y1={y} x2={W-112} y2={y} stroke={color} strokeWidth="2" />
            <text x={W-108} y={y+4} fill={color} fontSize="10">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
