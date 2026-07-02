import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function CircleSimulation({ config }: SimulationProps) {
  const h = config.parameters?.find(p => p.key === 'h')?.value ?? 0;
  const k = config.parameters?.find(p => p.key === 'k')?.value ?? 0;
  const r = Math.max(0.3, config.parameters?.find(p => p.key === 'r')?.value ?? 2.5);
  const tDeg = config.parameters?.find(p => p.key === 't')?.value ?? 45;

  const W = 600; const H = 400;
  const { ox, oy, scale, xMin, xMax, yMin, yMax, svgHandlers, resetView, isDirty } = useMathPanZoom(50, W, H);
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const fmtN = (v: number) => {
    const rv = Math.round(v * 100) / 100;
    return Number.isInteger(rv) ? rv.toString() : rv.toFixed(2);
  };

  const tRad = tDeg * Math.PI / 180;
  const Px = h + r * Math.cos(tRad);
  const Py = k + r * Math.sin(tRad);

  // Tangent direction at P: perpendicular to radius = (-sin t, cos t)
  const tangLen = 1.8;
  const tx = -Math.sin(tRad) * tangLen;
  const ty = Math.cos(tRad) * tangLen;

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

  const rSX = r * scale;
  const hSX = toSX(h); const kSY = toSY(k);
  const PSX = toSX(Px); const PSY = toSY(Py);
  const T1SX = toSX(Px - tx); const T1SY = toSY(Py - ty);
  const T2SX = toSX(Px + tx); const T2SY = toSY(Py + ty);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Circle */}
        <circle cx={hSX} cy={kSY} r={rSX} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

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

        {/* Radius line M→P */}
        <line x1={hSX} y1={kSY} x2={PSX} y2={PSY} stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5 3" />

        {/* Tangent line at P */}
        <line x1={T1SX} y1={T1SY} x2={T2SX} y2={T2SY} stroke="#f97316" strokeWidth="2" />

        {/* Right-angle mark at P */}
        <g>
          {(() => {
            const rx = (hSX - PSX); const ry = (kSY - PSY);
            const rLen = Math.sqrt(rx*rx+ry*ry);
            if (rLen < 2) return null;
            const rux = rx/rLen; const ruy = ry/rLen;
            const tux = -Math.sin(tRad); const tuy = Math.cos(tRad);
            const sq = 8;
            const qx1 = PSX + rux*sq; const qy1 = PSY + ruy*sq;
            const qx2 = qx1 + tux*sq; const qy2 = qy1 - tuy*sq*scale/scale;
            const qx3 = PSX + tux*sq; const qy3 = PSY - tuy*sq*scale/scale;
            return (
              <polyline points={`${qx1.toFixed(1)},${qy1.toFixed(1)} ${qx2.toFixed(1)},${qy2.toFixed(1)} ${qx3.toFixed(1)},${qy3.toFixed(1)}`}
                fill="none" stroke="#94a3b8" strokeWidth="1" opacity="0.7" />
            );
          })()}
        </g>

        {/* Center M */}
        <circle cx={hSX} cy={kSY} r={5} fill="#e879f9" />
        <text x={hSX+8} y={kSY-5} fill="#e879f9" fontSize="11" fontWeight="500">M({fmtN(h)},{fmtN(k)})</text>

        {/* Point P */}
        <circle cx={PSX} cy={PSY} r={5} fill="#4ade80" />
        {PSX > 10 && PSX < W-80 && PSY > 10 && PSY < H-10 && (
          <text x={PSX+8} y={PSY-4} fill="#4ade80" fontSize="11">P({fmtN(Px)},{fmtN(Py)})</text>
        )}

        {/* Tangent label */}
        {T2SX > 20 && T2SX < W-10 && T2SY > 5 && T2SY < H-5 && (
          <text x={T2SX+5} y={T2SY} fill="#f97316" fontSize="10">tiếp tuyến</text>
        )}

        {/* Radius label */}
        <text x={(hSX+PSX)/2+4} y={(kSY+PSY)/2-6} fill="#fbbf24" fontSize="10">r={fmtN(r)}</text>

        {/* Info box */}
        <rect x={8} y={8} width={230} height={80} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={27} fill="#38bdf8" fontSize="12" fontFamily="monospace">
          (x{h>=0?'-':'+'}·{fmtN(Math.abs(h))})² + (y{k>=0?'-':'+'}·{fmtN(Math.abs(k))})² = {fmtN(r*r)}
        </text>
        <text x={16} y={45} fill="#e879f9" fontSize="11">Tâm M({fmtN(h)}, {fmtN(k)})</text>
        <text x={16} y={62} fill="#fbbf24" fontSize="11">Bán kính r = {fmtN(r)}</text>
        <text x={16} y={79} fill="#f97316" fontSize="11">Điểm P tại góc {fmtN(tDeg)}°</text>
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
