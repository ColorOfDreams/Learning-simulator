import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function InequalitySimulation({ config }: SimulationProps) {
  const a1 = config.parameters?.find(p => p.key === 'a1')?.value ?? 1;
  const b1 = config.parameters?.find(p => p.key === 'b1')?.value ?? 1;
  const c1 = config.parameters?.find(p => p.key === 'c1')?.value ?? 4;
  const a2 = config.parameters?.find(p => p.key === 'a2')?.value ?? 2;
  const b2 = config.parameters?.find(p => p.key === 'b2')?.value ?? -1;
  const c2 = config.parameters?.find(p => p.key === 'c2')?.value ?? 3;

  const W = 600; const H = 400;
  const { svgHandlers, groupTransform, resetView, isDirty } = useMathPanZoom(1, W, H);
  const scale = 45;
  const ox = 220; const oy = H / 2;
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const fmtN = (v: number) => {
    const r = Math.round(v * 100) / 100;
    return Number.isInteger(r) ? r.toString() : r.toFixed(2);
  };

  const fmtLine = (a: number, b: number, c: number) => {
    const as = a === 1 ? 'x' : a === -1 ? '-x' : `${fmtN(a)}x`;
    const bs = b === 0 ? '' : b === 1 ? ' + y' : b === -1 ? ' - y' : b > 0 ? ` + ${fmtN(b)}y` : ` - ${fmtN(Math.abs(b))}y`;
    return `${as}${bs} ≤ ${fmtN(c)}`;
  };

  const { poly1, poly2, intersectionPts } = useMemo(() => {
    const xMin = -ox / scale;
    const xMax = (W - ox) / scale;
    const yMax = oy / scale;
    const yMin = -yMax;

    const corners: [number, number][] = [
      [xMin, yMin], [xMax, yMin], [xMax, yMax], [xMin, yMax]
    ];

    function clipToHalfPlane(poly: [number, number][], a: number, b: number, c: number): [number, number][] {
      if (poly.length === 0) return [];
      const inside = (p: [number, number]) => a * p[0] + b * p[1] <= c + 1e-9;
      const intersect = (p1: [number, number], p2: [number, number]): [number, number] => {
        const dx = p2[0] - p1[0]; const dy = p2[1] - p1[1];
        const denom = a * dx + b * dy;
        if (Math.abs(denom) < 1e-12) return p1;
        const t = (c - a * p1[0] - b * p1[1]) / denom;
        return [p1[0] + t * dx, p1[1] + t * dy];
      };
      const out: [number, number][] = [];
      for (let i = 0; i < poly.length; i++) {
        const cur = poly[i]; const next = poly[(i + 1) % poly.length];
        const ci = inside(cur); const ni = inside(next);
        if (ci) out.push(cur);
        if (ci !== ni) out.push(intersect(cur, next));
      }
      return out;
    }

    const clip1 = clipToHalfPlane(corners, a1, b1, c1);
    const clip2 = clipToHalfPlane(corners, a2, b2, c2);

    const toPoints = (pts: [number, number][]) =>
      pts.map(([x, y]) => `${toSX(x).toFixed(1)},${toSY(y).toFixed(1)}`).join(' ');

    const ipts: [number, number][] = [];
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) > 1e-9) {
      const xi = (c1 * b2 - c2 * b1) / det;
      const yi = (a1 * c2 - a2 * c1) / det;
      ipts.push([xi, yi]);
    }

    return { poly1: toPoints(clip1), poly2: toPoints(clip2), intersectionPts: ipts };
  }, [a1, b1, c1, a2, b2, c2]);

  const xTicks = [-4,-3,-2,-1,0,1,2,3,4,5,6,7];
  const yTicks = [-3,-2,-1,1,2,3];

  const lineEndpoints = (a: number, b: number, c: number): [[number,number],[number,number]] | null => {
    const xL = -ox / scale; const xR = (W - ox) / scale;
    if (Math.abs(b) > 1e-9) {
      return [[xL, (c - a * xL) / b], [xR, (c - a * xR) / b]];
    } else if (Math.abs(a) > 1e-9) {
      const xv = c / a; return [[xv, -5], [xv, 5]];
    }
    return null;
  };

  const ep1 = lineEndpoints(a1, b1, c1);
  const ep2 = lineEndpoints(a2, b2, c2);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />
        <g transform={groupTransform}>

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Half-plane shading */}
        {poly1 && <polygon points={poly1} fill="#ef4444" fillOpacity={0.18} />}
        {poly2 && <polygon points={poly2} fill="#38bdf8" fillOpacity={0.18} />}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <polygon points={`${W-6},${oy-4} ${W},${oy} ${W-6},${oy+4}`} fill="#475569" />
        <polygon points={`${ox-4},6 ${ox},0 ${ox+4},6`} fill="#475569" />
        <text x={W-8} y={oy-6} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+6} y={13} fill="#64748b" fontSize="12">y</text>
        <text x={ox-8} y={oy+14} fill="#475569" fontSize="10" textAnchor="end">O</text>

        {/* Tick labels */}
        {xTicks.filter(x => x !== 0).map(x => (
          <text key={`xl${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="9" textAnchor="middle">{x}</text>
        ))}
        {yTicks.map(y => (
          <text key={`yl${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="9" textAnchor="end">{y}</text>
        ))}

        {/* Boundary lines */}
        {ep1 && (
          <line x1={toSX(ep1[0][0])} y1={toSY(ep1[0][1])} x2={toSX(ep1[1][0])} y2={toSY(ep1[1][1])}
            stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
        )}
        {ep2 && (
          <line x1={toSX(ep2[0][0])} y1={toSY(ep2[0][1])} x2={toSX(ep2[1][0])} y2={toSY(ep2[1][1])}
            stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
        )}

        {/* Intersection point */}
        {intersectionPts.map(([x, y], i) => (
          x > -ox/scale && x < (W-ox)/scale && Math.abs(y) < oy/scale ? (
            <g key={i}>
              <circle cx={toSX(x)} cy={toSY(y)} r={5} fill="#fbbf24" />
              <text x={toSX(x)+8} y={toSY(y)-5} fill="#fbbf24" fontSize="10">({fmtN(x)}, {fmtN(y)})</text>
            </g>
          ) : null
        ))}

        {/* Info box */}
        <rect x={W-210} y={8} width={202} height={82} rx={6} fill="#0f172a" fillOpacity={0.92} />
        <text x={W-202} y={26} fill="#ef4444" fontSize="12">{fmtLine(a1, b1, c1)}</text>
        <text x={W-202} y={43} fill="#38bdf8" fontSize="12">{fmtLine(a2, b2, c2)}</text>
        <text x={W-202} y={60} fill="#94a3b8" fontSize="10">Miền đỏ: nửa mặt phẳng 1</text>
        <text x={W-202} y={75} fill="#94a3b8" fontSize="10">Miền xanh: nửa mặt phẳng 2</text>
        <text x={W-202} y={88} fill="#a78bfa" fontSize="10">Phần giao: miền nghiệm chung</text>

        {/* Legend */}
        <rect x={8} y={H-68} width={195} height={60} rx={4} fill="#0f172a" fillOpacity={0.85} />
        <rect x={16} y={H-58} width={14} height={10} fill="#ef4444" fillOpacity={0.5} />
        <text x={36} y={H-50} fill="#ef4444" fontSize="10">{fmtLine(a1, b1, c1)}</text>
        <rect x={16} y={H-44} width={14} height={10} fill="#38bdf8" fillOpacity={0.5} />
        <text x={36} y={H-36} fill="#38bdf8" fontSize="10">{fmtLine(a2, b2, c2)}</text>
        <rect x={16} y={H-30} width={14} height={10} fill="#a78bfa" fillOpacity={0.65} />
        <text x={36} y={H-22} fill="#a78bfa" fontSize="10">Giao = miền nghiệm hệ bất pt</text>
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
