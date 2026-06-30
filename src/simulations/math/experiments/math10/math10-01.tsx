import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function QuadraticSimulation({ config }: SimulationProps) {
  const params = config.parameters;
  const aVal = params.find(p => p.key === 'a')?.value ?? 1;
  const bVal = params.find(p => p.key === 'b')?.value ?? -2;
  const cVal = params.find(p => p.key === 'c')?.value ?? -3;

  // Safeguard: a should not be 0 for quadratic function
  const a = aVal === 0 ? 0.1 : aVal;
  const b = bVal;
  const c = cVal;

  const width = 600;
  const height = 400;
  const scale = 25; // pixels per unit
  const originX = width / 2;
  const originY = height / 2;

  const toScreenX = (x: number) => originX + x * scale;
  const toScreenY = (y: number) => originY - y * scale;

  // Calculate critical points
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  // Generate parabola path points
  const pathD = useMemo(() => {
    const points: string[] = [];
    const minX = -width / (2 * scale);
    const maxX = width / (2 * scale);
    const steps = 120;
    const stepSize = (maxX - minX) / steps;

    for (let i = 0; i <= steps; i++) {
      const xm = minX + i * stepSize;
      const ym = a * xm * xm + b * xm + c;
      const sx = toScreenX(xm);
      const sy = toScreenY(ym);

      // Clamp values slightly to prevent massive SVG coordinates
      if (sy >= -100 && sy <= height + 100) {
        if (points.length === 0) {
          points.push(`M ${sx} ${sy}`);
        } else {
          points.push(`L ${sx} ${sy}`);
        }
      }
    }
    return points.join(' ');
  }, [a, b, c]);

  // Grid tick marks
  const ticks = useMemo(() => {
    const arr = [];
    const xRange = Math.floor(width / (2 * scale));
    const yRange = Math.floor(height / (2 * scale));

    for (let i = -xRange; i <= xRange; i++) {
      if (i !== 0) arr.push({ isX: true, val: i, s: toScreenX(i) });
    }
    for (let i = -yRange; i <= yRange; i++) {
      if (i !== 0) arr.push({ isX: false, val: i, s: toScreenY(i) });
    }
    return arr;
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden', display: 'flex', flexDirection: 'column', color: '#fff', boxSizing: 'border-box' }}>
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

          {/* Axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#64748b" strokeWidth="2" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#64748b" strokeWidth="2" />

          {/* X/Y Labels */}
          <text x={width - 15} y={originY - 8} fill="#94a3b8" fontSize="12" fontWeight="bold">x</text>
          <text x={originX + 10} y={18} fill="#94a3b8" fontSize="12" fontWeight="bold">y</text>
          <text x={originX - 12} y={originY + 15} fill="#64748b" fontSize="11">0</text>

          {/* Ticks values */}
          <g fill="#475569" fontSize="10" textAnchor="middle">
            {ticks.map((t, idx) =>
              t.isX ? (
                <text key={`tx-${idx}`} x={t.s} y={originY + 14}>{t.val}</text>
              ) : (
                <text key={`ty-${idx}`} x={originX - 12} y={t.s + 4} textAnchor="end">{t.val}</text>
              )
            )}
          </g>

          {/* Axis of Symmetry (Dashed line) */}
          {Math.abs(vertexX) < width / (2 * scale) && (
            <line
              x1={toScreenX(vertexX)}
              y1={0}
              x2={toScreenX(vertexX)}
              y2={height}
              stroke="#e2e8f0"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Parabola Curve */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

          {/* Vertex Point */}
          {Math.abs(vertexX) < width / (2 * scale) && Math.abs(vertexY) < height / (2 * scale) && (
            <g>
              <circle cx={toScreenX(vertexX)} cy={toScreenY(vertexY)} r="6" fill="#ef4444" />
              <circle cx={toScreenX(vertexX)} cy={toScreenY(vertexY)} r="10" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.6">
                <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Vertex Coordinates Box */}
              <g transform={`translate(${toScreenX(vertexX) + 12}, ${toScreenY(vertexY) - 15})`}>
                <rect x="0" y="0" width="110" height="24" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#ef4444" strokeWidth="1" />
                <text x="55" y="15" fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="500">
                  I({vertexX.toFixed(2)}; {vertexY.toFixed(2)})
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Dynamic Formula Display */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '6px 12px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px', fontFamily: 'monospace' }}>
          y = {a.toFixed(1)}x² {b >= 0 ? '+' : '-'} {Math.abs(b).toFixed(1)}x {c >= 0 ? '+' : '-'} {Math.abs(c).toFixed(1)}
        </div>
    </div>
  );
}
