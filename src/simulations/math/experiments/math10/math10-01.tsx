import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function QuadraticSimulation({ config }: SimulationProps) {
  const a = config.parameters?.find(p => p.key === 'a')?.value ?? 1;
  const b = config.parameters?.find(p => p.key === 'b')?.value ?? -2;
  const c = config.parameters?.find(p => p.key === 'c')?.value ?? -3;

  const W = 600; const H = 400;
  const { ox, oy, scale, xMin, xMax, yMin, yMax, svgHandlers, resetView, isDirty } = useMathPanZoom(50, W, H);
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const aSafe = a === 0 ? 0.001 : a;
  const h = -b / (2 * aSafe);
  const k = c - (b * b) / (4 * aSafe);
  const delta = b * b - 4 * aSafe * c;

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

  const { curvePath, x1Root, x2Root } = useMemo(() => {
    const pts: string[] = [];
    for (let px = 0; px <= W; px += 2) {
      const xv = (px - ox) / scale;
      const yv = aSafe * xv * xv + b * xv + c;
      const sy = oy - yv * scale;
      if (sy < -100 || sy > H + 100) {
        if (pts.length && pts[pts.length - 1] !== 'Z') pts.push('Z');
        continue;
      }
      pts.push(`${!pts.length || pts[pts.length - 1] === 'Z' ? 'M' : 'L'} ${px.toFixed(1)} ${sy.toFixed(1)}`);
    }
    let r1: number | null = null; let r2: number | null = null;
    if (delta >= 0) {
      r1 = (-b - Math.sqrt(delta)) / (2 * aSafe);
      r2 = (-b + Math.sqrt(delta)) / (2 * aSafe);
    }
    return { curvePath: pts.join(' '), x1Root: r1, x2Root: r2 };
  }, [a, b, c, ox, oy, scale]);

  const fmtN = (v: number) => {
    const r = Math.round(v * 100) / 100;
    return Number.isInteger(r) ? r.toString() : r.toFixed(2);
  };

  const hSX = toSX(h); const kSY = toSY(k);
  const vertexInView = hSX > -10 && hSX < W + 10 && kSY > -10 && kSY < H + 10;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Axis of symmetry */}
        {hSX > 0 && hSX < W && (
          <line x1={hSX} y1={0} x2={hSX} y2={H} stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.7" />
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

        {/* Parabola */}
        <path d={curvePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

        {/* X-intercepts */}
        {x1Root !== null && x2Root !== null && (
          <>
            {x1Root >= xMin && x1Root <= xMax && (
              <g>
                <circle cx={toSX(x1Root)} cy={oy} r={5} fill="#f97316" />
                <text x={toSX(x1Root)} y={oy+18} fill="#f97316" fontSize="10" textAnchor="middle">x₁={fmtN(x1Root)}</text>
              </g>
            )}
            {x2Root >= xMin && x2Root <= xMax && Math.abs(x1Root - x2Root) > 0.05 && (
              <g>
                <circle cx={toSX(x2Root)} cy={oy} r={5} fill="#f97316" />
                <text x={toSX(x2Root)} y={oy+18} fill="#f97316" fontSize="10" textAnchor="middle">x₂={fmtN(x2Root)}</text>
              </g>
            )}
          </>
        )}

        {/* Y-intercept */}
        {c >= yMin && c <= yMax && (
          <g>
            <circle cx={ox} cy={toSY(c)} r={4} fill="#4ade80" />
            <text x={ox+8} y={toSY(c)+4} fill="#4ade80" fontSize="10">(0, {fmtN(c)})</text>
          </g>
        )}

        {/* Vertex */}
        {vertexInView && (
          <g>
            <circle cx={hSX} cy={kSY} r={6} fill="#e879f9" />
            <text x={hSX+9} y={kSY-5} fill="#e879f9" fontSize="11" fontWeight="500">Đỉnh ({fmtN(h)}, {fmtN(k)})</text>
          </g>
        )}

        {/* Axis label */}
        {hSX > 20 && hSX < W-60 && (
          <text x={hSX+5} y={14} fill="#7c3aed" fontSize="10" opacity="0.9">x={fmtN(h)}</text>
        )}

        {/* Info box */}
        <rect x={8} y={8} width={225} height={100} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={27} fill="#38bdf8" fontSize="13" fontFamily="monospace">
          y = {fmtN(a)}x² {b >= 0 ? '+' : '-'} {fmtN(Math.abs(b))}x {c >= 0 ? '+' : '-'} {fmtN(Math.abs(c))}
        </text>
        <text x={16} y={45} fill="#e879f9" fontSize="11">Đỉnh: ({fmtN(h)}, {fmtN(k)})</text>
        <text x={16} y={62} fill="#64748b" fontSize="11">Δ = {fmtN(delta)} → {delta > 0 ? '2 nghiệm' : delta === 0 ? '1 nghiệm kép' : 'vô nghiệm'}</text>
        {x1Root !== null && (
          <text x={16} y={79} fill="#f97316" fontSize="11">x₁={fmtN(x1Root!)}, x₂={fmtN(x2Root!)}</text>
        )}
        <text x={16} y={97} fill={a > 0 ? '#4ade80' : '#fb923c'} fontSize="11">
          {a > 0 ? '⬆ Mở lên (a > 0)' : '⬇ Mở xuống (a < 0)'}
        </text>

        {/* Legend */}
        <line x1={W-120} y1={H-36} x2={W-100} y2={H-36} stroke="#38bdf8" strokeWidth="2" />
        <text x={W-96} y={H-32} fill="#38bdf8" fontSize="10">y=ax²+bx+c</text>
        <line x1={W-120} y1={H-20} x2={W-100} y2={H-20} stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x={W-96} y={H-16} fill="#7c3aed" fontSize="10">Trục đối xứng</text>
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
