import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function LineSimulation({ config }: SimulationProps) {
  const a = config.parameters?.find(p => p.key === 'a')?.value ?? 1;
  const b = config.parameters?.find(p => p.key === 'b')?.value ?? -2;
  const c = config.parameters?.find(p => p.key === 'c')?.value ?? -3;

  const W = 600; const H = 400;
  const scale = 50;
  const ox = W / 2; const oy = H / 2;
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const fmtN = (v: number) => {
    const r = Math.round(v * 100) / 100;
    return Number.isInteger(r) ? r.toString() : r.toFixed(2);
  };

  const { linePath, xInt, yInt, dist, normalPt } = useMemo(() => {
    const norm = Math.sqrt(a * a + b * b);
    const d = norm > 0 ? Math.abs(c) / norm : 0;

    let pt1: [number, number] | null = null;
    let pt2: [number, number] | null = null;
    if (Math.abs(b) > 1e-9) {
      const yLeft = (-a * (-6) - c) / b;
      const yRight = (-a * 6 - c) / b;
      pt1 = [-6, yLeft];
      pt2 = [6, yRight];
    } else if (Math.abs(a) > 1e-9) {
      const x0 = -c / a;
      pt1 = [x0, -4];
      pt2 = [x0, 4];
    }

    const path = pt1 && pt2
      ? `M ${toSX(pt1[0]).toFixed(1)} ${toSY(pt1[1]).toFixed(1)} L ${toSX(pt2[0]).toFixed(1)} ${toSY(pt2[1]).toFixed(1)}`
      : '';

    const xInter = Math.abs(a) > 1e-9 ? -c / a : null;
    const yInter = Math.abs(b) > 1e-9 ? -c / b : null;

    // Point on line closest to origin (foot of perpendicular from O)
    let nx = 0; let ny = 0;
    if (norm > 1e-9) {
      nx = -a * c / (norm * norm);
      ny = -b * c / (norm * norm);
    }
    // Normal vector tip: from foot, extend in (a,b) direction
    const normalScale = 1.2;
    const ntx = nx + a / norm * normalScale;
    const nty = ny + b / norm * normalScale;

    return { linePath: path, xInt: xInter, yInt: yInter, dist: d, normalPt: { foot: [nx, ny], tip: [ntx, nty] } };
  }, [a, b, c]);

  // Arrow helper
  const Arrow = ({ x1, y1, x2, y2, color }: { x1:number; y1:number; x2:number; y2:number; color:string }) => {
    const dx = x2-x1; const dy = y2-y1;
    const len = Math.sqrt(dx*dx+dy*dy);
    if (len < 4) return null;
    const ux = dx/len; const uy = dy/len;
    const AL = 10;
    const p1x = x2 - AL*(ux*0.866-uy*0.5); const p1y = y2 - AL*(uy*0.866+ux*0.5);
    const p2x = x2 - AL*(ux*0.866+uy*0.5); const p2y = y2 - AL*(uy*0.866-ux*0.5);
    return (
      <g stroke={color} fill="none" strokeWidth="2" strokeLinecap="round">
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        <polyline points={`${p1x.toFixed(1)},${p1y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`} />
      </g>
    );
  };

  const xTicks = [-5,-4,-3,-2,-1,1,2,3,4,5];
  const yTicks = [-3,-2,-1,1,2,3];
  const norm = Math.sqrt(a*a+b*b);
  const showNormal = norm > 0.5;

  const footSX = toSX(normalPt.foot[0]);
  const footSY = toSY(normalPt.foot[1]);
  const tipSX = toSX(normalPt.tip[0]);
  const tipSY = toSY(normalPt.tip[1]);

  // Distance line from O to foot
  const distLinePath = `M ${ox} ${oy} L ${footSX.toFixed(1)} ${footSY.toFixed(1)}`;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Distance from O to line */}
        {dist > 0.05 && showNormal && (
          <path d={distLinePath} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.8" />
        )}

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

        {/* The line */}
        {linePath && <path d={linePath} stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />}

        {/* Normal vector (pháp vectơ) */}
        {showNormal && (
          <Arrow x1={footSX} y1={footSY} x2={tipSX} y2={tipSY} color="#e879f9" />
        )}
        {showNormal && tipSX > 10 && tipSX < W-10 && tipSY > 10 && tipSY < H-10 && (
          <text x={tipSX+8} y={tipSY} fill="#e879f9" fontSize="11">n=({a},{b})</text>
        )}

        {/* Right-angle mark at foot */}
        {dist > 0.1 && showNormal && (
          <>
            <circle cx={footSX} cy={footSY} r={3} fill="#fbbf24" />
          </>
        )}

        {/* Intercepts */}
        {xInt !== null && Math.abs(xInt) <= 5.5 && (
          <g>
            <circle cx={toSX(xInt)} cy={oy} r={5} fill="#4ade80" />
            <text x={toSX(xInt)} y={oy-8} fill="#4ade80" fontSize="10" textAnchor="middle">({fmtN(xInt)},0)</text>
          </g>
        )}
        {yInt !== null && Math.abs(yInt) <= 3.5 && (
          <g>
            <circle cx={ox} cy={toSY(yInt)} r={5} fill="#f97316" />
            <text x={ox+10} y={toSY(yInt)+4} fill="#f97316" fontSize="10">(0,{fmtN(yInt)})</text>
          </g>
        )}

        {/* Info box */}
        <rect x={8} y={8} width={230} height={90} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={27} fill="#38bdf8" fontSize="13" fontFamily="monospace">
          {fmtN(a)}x {b >= 0 ? '+' : '-'} {fmtN(Math.abs(b))}y {c >= 0 ? '+' : '-'} {fmtN(Math.abs(c))} = 0
        </text>
        <text x={16} y={46} fill="#64748b" fontSize="11">
          Pháp vectơ: n = ({a}, {b})
        </text>
        <text x={16} y={63} fill="#fbbf24" fontSize="11">
          d(O, đt) = |c|/|n| = {fmtN(dist)}
        </text>
        <text x={16} y={80} fill="#94a3b8" fontSize="11">
          {xInt !== null ? `Cắt Ox tại: (${fmtN(xInt)}, 0)` : 'Song song / trùng Ox'}
        </text>
        {yInt !== null && (
          <text x={16} y={97} fill="#94a3b8" fontSize="11">
            Cắt Oy tại: (0, {fmtN(yInt)})
          </text>
        )}
      </svg>
    </div>
  );
}
