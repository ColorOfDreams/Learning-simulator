import type { SimulationProps } from '../types';

export default function TriangulationSimulation({ config }: SimulationProps) {
  const params = config.parameters;
  const dist = params.find(p => p.key === 'dist')?.value ?? 12;
  const angleDeg = params.find(p => p.key === 'angle')?.value ?? 35;
  const h0 = params.find(p => p.key === 'h0')?.value ?? 1.6;

  const width = 600;
  const height = 400;

  // Render scaling factors
  const originX = 80;
  const originY = height - 60;
  // Let 12 meters be about 360 pixels, i.e., 30 pixels per meter
  const scale = 25; 

  const toScreenX = (x: number) => originX + x * scale;
  const toScreenY = (y: number) => originY - y * scale;

  const rad = (angleDeg * Math.PI) / 180;
  const hTriangle = dist * Math.tan(rad);
  const hTotal = h0 + hTriangle;

  return (
    <div style={{ width: '100%', height: '100%', padding: '16px', background: '#0f172a', borderRadius: '18px', display: 'flex', flexDirection: 'column', color: '#fff', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, position: 'relative', border: '1px solid #334155', borderRadius: '12px', background: '#0a0f1d', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Ground line */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="3" />

          {/* Grass/ground decorative band */}
          <rect x={0} y={originY} width={width} height={60} fill="#1e293b" opacity="0.4" />

          {/* Building/Tower at the target distance */}
          <g>
            {/* The main tower block */}
            <rect
              x={toScreenX(dist) - 20}
              y={toScreenY(hTotal)}
              width="40"
              height={hTotal * scale}
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="2"
            />
            {/* Windows */}
            <rect x={toScreenX(dist) - 10} y={toScreenY(hTotal) + 20} width="8" height="12" fill="#fbbf24" opacity="0.8" />
            <rect x={toScreenX(dist) + 2} y={toScreenY(hTotal) + 20} width="8" height="12" fill="#fbbf24" opacity="0.8" />
            <rect x={toScreenX(dist) - 10} y={toScreenY(hTotal) + 50} width="8" height="12" fill="#fbbf24" opacity="0.8" />
            <rect x={toScreenX(dist) + 2} y={toScreenY(hTotal) + 50} width="8" height="12" fill="#fbbf24" opacity="0.8" />
            
            {/* Red flag on top */}
            <line x1={toScreenX(dist)} y1={toScreenY(hTotal)} x2={toScreenX(dist)} y2={toScreenY(hTotal) - 30} stroke="#cbd5e1" strokeWidth="2" />
            <polygon points={`${toScreenX(dist)},${toScreenY(hTotal) - 30} ${toScreenX(dist) + 15},${toScreenY(hTotal) - 24} ${toScreenX(dist)},${toScreenY(hTotal) - 18}`} fill="#ef4444" />
          </g>

          {/* Observer / Transit at x = 0, height = h0 */}
          <g>
            {/* Simple Tripod stand */}
            <line x1={toScreenX(0)} y1={toScreenY(h0)} x2={toScreenX(0) - 15} y2={originY} stroke="#94a3b8" strokeWidth="2" />
            <line x1={toScreenX(0)} y1={toScreenY(h0)} x2={toScreenX(0) + 15} y2={originY} stroke="#94a3b8" strokeWidth="2" />
            <line x1={toScreenX(0)} y1={toScreenY(h0)} x2={toScreenX(0)} y2={originY} stroke="#475569" strokeWidth="1.5" />
            
            {/* Transit instrument */}
            <circle cx={toScreenX(0)} cy={toScreenY(h0)} r="6" fill="#fbbf24" />
            <line
              x1={toScreenX(0) - 8}
              y1={toScreenY(h0)}
              x2={toScreenX(0) + 12 * Math.cos(rad)}
              y2={toScreenY(h0 + 12 * Math.sin(rad) / scale)}
              stroke="#fbbf24"
              strokeWidth="4"
            />
          </g>

          {/* Triangular lines */}
          {/* Horizontal base at height h0 */}
          <line
            x1={toScreenX(0)}
            y1={toScreenY(h0)}
            x2={toScreenX(dist)}
            y2={toScreenY(h0)}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Line of sight to the top */}
          <line
            x1={toScreenX(0)}
            y1={toScreenY(h0)}
            x2={toScreenX(dist)}
            y2={toScreenY(hTotal)}
            stroke="#ef4444"
            strokeWidth="2"
            opacity="0.85"
          />

          {/* Vertical right triangle leg */}
          <line
            x1={toScreenX(dist)}
            y1={toScreenY(h0)}
            x2={toScreenX(dist)}
            y2={toScreenY(hTotal)}
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Angle arc symbol */}
          <path
            d={`M ${toScreenX(1.8)} ${toScreenY(h0)} A 45 45 0 0 0 ${toScreenX(1.8 * Math.cos(rad))} ${toScreenY(h0 + 1.8 * Math.sin(rad))}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <text x={toScreenX(2.2)} y={toScreenY(h0 + 0.5)} fill="#fbbf24" fontSize="12" fontWeight="bold">
            α = {angleDeg}°
          </text>

          {/* Horizontal Dimension Labels (a = distance) */}
          <line x1={toScreenX(0)} y1={originY + 20} x2={toScreenX(dist)} y2={originY + 20} stroke="#94a3b8" strokeWidth="1" />
          <polygon points={`${toScreenX(0)},${originY + 20} ${toScreenX(0) + 6},${originY + 16} ${toScreenX(0) + 6},${originY + 24}`} fill="#94a3b8" />
          <polygon points={`${toScreenX(dist)},${originY + 20} ${toScreenX(dist) - 6},${originY + 16} ${toScreenX(dist) - 6},${originY + 24}`} fill="#94a3b8" />
          <text x={toScreenX(dist / 2)} y={originY + 36} fill="#cbd5e1" fontSize="12" textAnchor="middle">
            Khoảng cách a = {dist}m
          </text>

          {/* Vertical labels (h0 = instrument height) */}
          <line x1={toScreenX(0) - 25} y1={originY} x2={toScreenX(0) - 25} y2={toScreenY(h0)} stroke="#94a3b8" strokeWidth="1" />
          <text x={toScreenX(0) - 32} y={toScreenY(h0 / 2) + 4} fill="#cbd5e1" fontSize="11" textAnchor="end">
            h₀ = {h0.toFixed(2)}m
          </text>

          {/* Triangle height leg label (a * tan(alpha)) */}
          <text x={toScreenX(dist) + 12} y={toScreenY(h0 + hTriangle / 2) + 4} fill="#38bdf8" fontSize="12" fontWeight="bold">
            a·tan(α) = {hTriangle.toFixed(2)}m
          </text>

          {/* Height Dimension label (H_total) */}
          <line x1={toScreenX(dist) - 35} y1={toScreenY(0)} x2={toScreenX(dist) - 35} y2={toScreenY(hTotal)} stroke="#ef4444" strokeWidth="1.5" />
          <polygon points={`${toScreenX(dist) - 35},${toScreenY(0)} ${toScreenX(dist) - 39},${toScreenY(0) + 6} ${toScreenX(dist) - 31},${toScreenY(0) + 6}`} fill="#ef4444" />
          <polygon points={`${toScreenX(dist) - 35},${toScreenY(hTotal)} ${toScreenX(dist) - 39},${toScreenY(hTotal) - 6} ${toScreenX(dist) - 31},${toScreenY(hTotal) - 6}`} fill="#ef4444" />
          <text
            x={toScreenX(dist) - 42}
            y={toScreenY(hTotal / 2) + 4}
            fill="#f8fafc"
            fontSize="12"
            fontWeight="bold"
            textAnchor="end"
          >
            H = {hTotal.toFixed(2)}m
          </text>
        </svg>

        {/* Dynamic Calculations Overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', lineHeight: '1.6' }}>
          <div style={{ borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '6px', fontWeight: 'bold', color: '#fbbf24' }}>
            Ứng dụng Hệ thức lượng:
          </div>
          <div>Khoảng cách (a): <b>{dist} m</b></div>
          <div>Góc nâng (α): <b>{angleDeg}°</b></div>
          <div>Chiều cao giác kế (h₀): <b>{h0.toFixed(2)} m</b></div>
          <div style={{ marginTop: '6px', color: '#38bdf8', fontFamily: 'monospace' }}>
            H = h₀ + a · tan(α)
          </div>
          <div style={{ fontSize: '15px', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>
            H = {h0.toFixed(2)} + {dist} · tan({angleDeg}°) = {hTotal.toFixed(2)} m
          </div>
        </div>
      </div>
    </div>
  );
}
