import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function TriangleSimulation({ config }: SimulationProps) {
  const a = Math.max(0.5, config.parameters?.find(p => p.key === 'a')?.value ?? 4);
  const b = Math.max(0.5, config.parameters?.find(p => p.key === 'b')?.value ?? 5);
  const Cdeg = Math.min(170, Math.max(5, config.parameters?.find(p => p.key === 'C')?.value ?? 60));

  const W = 600; const H = 400;
  const { svgHandlers, groupTransform, resetView, isDirty } = useMathPanZoom(1, W, H);

  const { c, Arad, Brad, Crad, Ax, Ay, Bx, By, Cx, Cy, area, R, valid } = useMemo(() => {
    const Cr = Cdeg * Math.PI / 180;
    const c2 = a*a + b*b - 2*a*b*Math.cos(Cr);
    if (c2 <= 0) return { c:0, Arad:0, Brad:0, Crad:Cr, Ax:0, Ay:0, Bx:0, By:0, Cx:0, Cy:0, area:0, R:0, valid:false };
    const cv = Math.sqrt(c2);
    // sinA / a = sinC / c
    const sinA = a * Math.sin(Cr) / cv;
    const sinB = b * Math.sin(Cr) / cv;
    const Ar = Math.asin(Math.min(1, Math.max(-1, sinA)));
    const Br = Math.asin(Math.min(1, Math.max(-1, sinB)));
    const S = 0.5 * a * b * Math.sin(Cr);
    const Rv = cv / (2 * Math.sin(Cr));

    // Place B at left, C at right on the base, A at top
    // base BC = a (side opposite A), but we want to visualize: let's use the triangle with
    // B at bottom-left, C at bottom-right, A at top
    // Place B=(0,0), C=(a,0), and find A using angles
    // BA = c (given), angle B = Brad
    // A = B + c*(cos B, sin B) but we need angle at B
    // Angle B is Brad
    const scale = Math.min(120, 240 / Math.max(a, b, cv));
    const cx2 = W/2 - a*scale/2;
    const cy2 = H*0.7;
    const Bx2 = cx2;
    const By2 = cy2;
    const Cx2 = cx2 + a * scale;
    const Cy2 = cy2;
    // A position: from B, angle Brad, length c
    const Ax2 = Bx2 + cv * scale * Math.cos(Br);
    const Ay2 = By2 - cv * scale * Math.sin(Br);

    return { c: cv, Arad: Ar, Brad: Br, Crad: Cr, Ax:Ax2, Ay:Ay2, Bx:Bx2, By:By2, Cx:Cx2, Cy:Cy2, area:S, R:Rv, valid:true };
  }, [a, b, Cdeg]);

  const fmtN = (v: number) => (Math.round(v * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
  const fmtDeg = (r: number) => (r * 180 / Math.PI).toFixed(1) + '°';

  const angleArc = (cx: number, cy: number, x1: number, y1: number, x2: number, y2: number) => {
    const a1 = Math.atan2(y1-cy, x1-cx);
    const a2 = Math.atan2(y2-cy, x2-cx);
    const r = 22;
    const sx = cx + r*Math.cos(a1); const sy = cy + r*Math.sin(a1);
    const ex = cx + r*Math.cos(a2); const ey = cy + r*Math.sin(a2);
    // cross product (P-V)×(Q-V): positive → CW on screen (y-down) → sweep=1
    const cross = (x1-cx)*(y2-cy) - (y1-cy)*(x2-cx);
    const sweep = cross > 0 ? 1 : 0;
    return `M ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  };

  // Circumscribed circle center (circumcenter)
  let ccx = W/2; let ccy = H/2; let ccR = 0;
  if (valid) {
    const D = 2*(Ax*(By-Cy)+Bx*(Cy-Ay)+Cx*(Ay-By));
    if (Math.abs(D) > 0.01) {
      ccx = ((Ax*Ax+Ay*Ay)*(By-Cy)+(Bx*Bx+By*By)*(Cy-Ay)+(Cx*Cx+Cy*Cy)*(Ay-By))/D;
      ccy = ((Ax*Ax+Ay*Ay)*(Cx-Bx)+(Bx*Bx+By*By)*(Ax-Cx)+(Cx*Cx+Cy*Cy)*(Bx-Ax))/D;
      ccR = Math.sqrt((Ax-ccx)**2+(Ay-ccy)**2);
    }
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />
        <g transform={groupTransform}>

        {!valid ? (
          <text x={W/2} y={H/2} fill="#ef4444" fontSize="16" textAnchor="middle">Không tạo được tam giác hợp lệ</text>
        ) : (
          <>
            {/* Circumscribed circle */}
            <circle cx={ccx.toFixed(1)} cy={ccy.toFixed(1)} r={ccR.toFixed(1)}
              fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />

            {/* Triangle fill */}
            <polygon points={`${Ax.toFixed(1)},${Ay.toFixed(1)} ${Bx.toFixed(1)},${By.toFixed(1)} ${Cx.toFixed(1)},${Cy.toFixed(1)}`}
              fill="#1e3a5f" opacity="0.35" />

            {/* Triangle edges */}
            {/* BC = a (bottom) */}
            <line x1={Bx.toFixed(1)} y1={By.toFixed(1)} x2={Cx.toFixed(1)} y2={Cy.toFixed(1)} stroke="#f97316" strokeWidth="2.5" />
            {/* AC = b */}
            <line x1={Ax.toFixed(1)} y1={Ay.toFixed(1)} x2={Cx.toFixed(1)} y2={Cy.toFixed(1)} stroke="#38bdf8" strokeWidth="2.5" />
            {/* AB = c */}
            <line x1={Ax.toFixed(1)} y1={Ay.toFixed(1)} x2={Bx.toFixed(1)} y2={By.toFixed(1)} stroke="#4ade80" strokeWidth="2.5" />

            {/* Side labels */}
            <text x={((Bx+Cx)/2).toFixed(1)} y={(By+12).toFixed(1)} fill="#f97316" fontSize="13" textAnchor="middle" fontWeight="600">a={fmtN(a)}</text>
            <text x={((Ax+Cx)/2+14).toFixed(1)} y={((Ay+Cy)/2).toFixed(1)} fill="#38bdf8" fontSize="13" fontWeight="600">b={fmtN(b)}</text>
            <text x={((Ax+Bx)/2-14).toFixed(1)} y={((Ay+By)/2).toFixed(1)} fill="#4ade80" fontSize="13" textAnchor="end" fontWeight="600">c={fmtN(c)}</text>

            {/* Angle arcs */}
            <path d={angleArc(Ax, Ay, Bx, By, Cx, Cy)} fill="none" stroke="#e879f9" strokeWidth="1.5" />
            <path d={angleArc(Bx, By, Ax, Ay, Cx, Cy)} fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            <path d={angleArc(Cx, Cy, Bx, By, Ax, Ay)} fill="none" stroke="#a78bfa" strokeWidth="1.5" />

            {/* Circumcenter R */}
            <circle cx={ccx.toFixed(1)} cy={ccy.toFixed(1)} r={3} fill="#475569" />

            {/* Info box — rendered before vertices so labels always appear on top */}
            <rect x={8} y={8} width={220} height={110} rx={6} fill="#0f172a" fillOpacity={0.9} />
            <text x={16} y={27} fill="#64748b" fontSize="12" fontWeight="600">Định lý cosin:</text>
            <text x={16} y={44} fill="#94a3b8" fontSize="11">c² = a²+b²-2ab·cosC = {fmtN(c*c)}</text>
            <text x={16} y={61} fill="#64748b" fontSize="12" fontWeight="600">Định lý sin:</text>
            <text x={16} y={78} fill="#94a3b8" fontSize="11">a/sinA = b/sinB = c/sinC = 2R</text>
            <text x={16} y={95} fill="#fbbf24" fontSize="11">S = ½ab·sinC = {fmtN(area)}</text>
            <text x={16} y={112} fill="#64748b" fontSize="11">R (ngoại tiếp) = {fmtN(R)}</text>

            {/* Vertices — rendered last, always on top of info box */}
            {[
              { x: Ax, y: Ay, label: 'A', angle: `A=${fmtDeg(Arad)}`, color: '#e879f9', dx: Ax < W/2 ? 8 : -18, dy:-22 },
              { x: Bx, y: By, label: 'B', angle: `B=${fmtDeg(Brad)}`, color: '#fbbf24', dx:-18, dy:14 },
              { x: Cx, y: Cy, label: 'C', angle: `C=${fmtDeg(Crad)}`, color: '#a78bfa', dx:8, dy:14 },
            ].map(({ x, y, label, angle, color, dx, dy }) => (
              <g key={label}>
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={5} fill={color} />
                <text x={(x+dx).toFixed(1)} y={(y+dy).toFixed(1)} fill={color} fontSize="12" fontWeight="600">{label}</text>
                <text x={(x+dx).toFixed(1)} y={(y+dy+14).toFixed(1)} fill={color} fontSize="10">{angle}</text>
              </g>
            ))}
          </>
        )}
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
