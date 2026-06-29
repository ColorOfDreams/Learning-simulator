import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function InequalitySimulation({ config }: SimulationProps) {
  const params = config.parameters;
  const a1 = params.find(p => p.key === 'a1')?.value ?? 1;
  const b1 = params.find(p => p.key === 'b1')?.value ?? 1;
  const c1 = params.find(p => p.key === 'c1')?.value ?? 3;

  const a2 = params.find(p => p.key === 'a2')?.value ?? -1;
  const b2 = params.find(p => p.key === 'b2')?.value ?? 2;
  const c2 = params.find(p => p.key === 'c2')?.value ?? 4;

  const show1 = params.find(p => p.key === 'show1')?.value ?? 1;
  const show2 = params.find(p => p.key === 'show2')?.value ?? 1;

  const width = 600;
  const height = 400;
  const scale = 20; // 20 pixels per mathematical unit
  const originX = width / 2;
  const originY = height / 2;

  const toScreenX = (x: number) => originX + x * scale;
  const toScreenY = (y: number) => originY - y * scale;

  // Function to build a large polygon representing Ax + By <= C
  const getHalfPlanePath = (A: number, B: number, C: number) => {
    const len = Math.sqrt(A * A + B * B);
    if (len === 0) return '';

    const nx = A / len;
    const ny = B / len;

    // Find point P0 on the line Ax + By = C
    let x0 = 0;
    let y0 = 0;
    if (Math.abs(A) > Math.abs(B)) {
      x0 = C / A;
    } else {
      y0 = C / B;
    }

    // Direction along the line: (-ny, nx)
    const dx = -ny;
    const dy = nx;

    const R = 80; // Large radius to cover screen boundaries

    // Four vertices of the large half-plane quadrilateral
    const p1x = x0 + R * dx;
    const p1y = y0 + R * dy;

    const p2x = x0 - R * dx;
    const p2y = y0 - R * dy;

    // Shift in direction of inequality Ax + By <= C (opposite of normal vector nx, ny)
    const p3x = p2x - R * nx;
    const p3y = p2y - R * ny;

    const p4x = p1x - R * nx;
    const p4y = p1y - R * ny;

    return `M ${toScreenX(p1x)} ${toScreenY(p1y)} L ${toScreenX(p2x)} ${toScreenY(p2y)} L ${toScreenX(p3x)} ${toScreenY(p3y)} L ${toScreenX(p4x)} ${toScreenY(p4y)} Z`;
  };

  // Helper to get line segment path endpoints for grid display
  const getLinePathPoints = (A: number, B: number, C: number) => {
    const len = Math.sqrt(A * A + B * B);
    if (len === 0) return { x1: 0, y1: 0, x2: 0, y2: 0, visible: false };

    const dx = -B / len;
    const dy = A / len;

    let x0 = 0;
    let y0 = 0;
    if (Math.abs(A) > Math.abs(B)) {
      x0 = C / A;
    } else {
      y0 = C / B;
    }

    const R = 40;
    return {
      x1: toScreenX(x0 + R * dx),
      y1: toScreenY(y0 + R * dy),
      x2: toScreenX(x0 - R * dx),
      y2: toScreenY(y0 - R * dy),
      visible: true
    };
  };

  const poly1 = useMemo(() => getHalfPlanePath(a1, b1, c1), [a1, b1, c1]);
  const poly2 = useMemo(() => getHalfPlanePath(a2, b2, c2), [a2, b2, c2]);

  const line1 = useMemo(() => getLinePathPoints(a1, b1, c1), [a1, b1, c1]);
  const line2 = useMemo(() => getLinePathPoints(a2, b2, c2), [a2, b2, c2]);

  // Intersection points of two lines (A1x + B1y = C1 and A2x + B2y = C2)
  const intersection = useMemo(() => {
    const det = a1 * b2 - a2 * b1;
    if (det === 0) return null; // Parallel lines
    const ix = (c1 * b2 - c2 * b1) / det;
    const iy = (a1 * c2 - a2 * c1) / det;
    return { x: ix, y: iy };
  }, [a1, b1, c1, a2, b2, c2]);

  // Grid lines
  const ticks = useMemo(() => {
    const arr = [];
    const xRange = Math.floor(width / (2 * scale));
    const yRange = Math.floor(height / (2 * scale));

    for (let i = -xRange; i <= xRange; i += 2) {
      if (i !== 0) arr.push({ isX: true, val: i, s: toScreenX(i) });
    }
    for (let i = -yRange; i <= yRange; i += 2) {
      if (i !== 0) arr.push({ isX: false, val: i, s: toScreenY(i) });
    }
    return arr;
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#0a0f1d', overflow: 'hidden', display: 'flex', flexDirection: 'column', color: '#fff', boxSizing: 'border-box' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          <g stroke="#1e293b" strokeWidth="0.5">
            {ticks.map((t, idx) =>
              t.isX ? (
                <line key={`gl-x-${idx}`} x1={t.s} y1={0} x2={t.s} y2={height} />
              ) : (
                <line key={`gl-y-${idx}`} x1={0} y1={t.s} x2={width} y2={t.s} />
              )
            )}
          </g>

          {/* Shaded Half-Planes */}
          <g style={{ mixBlendMode: 'screen' }}>
            {show1 === 1 && poly1 && (
              <path d={poly1} fill="#1e3a8a" opacity="0.45" />
            )}
            {show2 === 1 && poly2 && (
              <path d={poly2} fill="#78350f" opacity="0.45" />
            )}
          </g>

          {/* Axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />

          {/* X/Y Labels */}
          <text x={width - 15} y={originY - 8} fill="#94a3b8" fontSize="11" fontWeight="bold">x</text>
          <text x={originX + 8} y={15} fill="#94a3b8" fontSize="11" fontWeight="bold">y</text>

          {/* Grid ticks values */}
          <g fill="#475569" fontSize="9" textAnchor="middle">
            {ticks.map((t, idx) =>
              t.isX ? (
                <text key={`tx-${idx}`} x={t.s} y={originY + 12}>{t.val}</text>
              ) : (
                <text key={`ty-${idx}`} x={originX - 8} y={t.s + 3} textAnchor="end">{t.val}</text>
              )
            )}
          </g>

          {/* Boundary lines */}
          {show1 === 1 && line1.visible && (
            <line x1={line1.x1} y1={line1.y1} x2={line1.x2} y2={line1.y2} stroke="#3b82f6" strokeWidth="2.5" />
          )}
          {show2 === 1 && line2.visible && (
            <line x1={line2.x1} y1={line2.y1} x2={line2.x2} y2={line2.y2} stroke="#f59e0b" strokeWidth="2.5" />
          )}

          {/* Intersection point */}
          {show1 === 1 && show2 === 1 && intersection && (
            <g>
              <circle cx={toScreenX(intersection.x)} cy={toScreenY(intersection.y)} r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <text
                x={toScreenX(intersection.x) + 8}
                y={toScreenY(intersection.y) - 8}
                fill="#34d399"
                fontSize="11"
                fontWeight="bold"
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }}
              >
                G({intersection.x.toFixed(1)}, {intersection.y.toFixed(1)})
              </text>
            </g>
          )}
        </svg>

        {/* Dynamic Equations Display */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', lineHeight: '1.5', fontFamily: 'monospace' }}>
          {show1 === 1 && (
            <div style={{ color: '#38bdf8' }}>
              d₁: {a1}x {b1 >= 0 ? '+' : '-'} {Math.abs(b1)}y = {c1} (Miền xanh)
            </div>
          )}
          {show2 === 1 && (
            <div style={{ color: '#fbbf24' }}>
              d₂: {a2}x {b2 >= 0 ? '+' : '-'} {Math.abs(b2)}y = {c2} (Miền vàng)
            </div>
          )}
          {show1 === 1 && show2 === 1 && (
            <div style={{ color: '#10b981', marginTop: '4px', borderTop: '1px solid #334155', paddingTop: '4px' }}>
              Miền giao: Hệ Bất phương trình
            </div>
          )}
        </div>
    </div>
  );
}
