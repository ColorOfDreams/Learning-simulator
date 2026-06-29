import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function UnitCircleSimulation({ config }: SimulationProps) {
  const params = config.parameters;
  const angleDeg = params.find(p => p.key === 'angle')?.value ?? 45;
  const target = params.find(p => p.key === 'target')?.value ?? 0.5;

  const W = 600;
  const H = 450;
  const cx = 220;
  const cy = 225;
  const R = 150;

  const angleRad = (angleDeg * Math.PI) / 180;
  const px = cx + R * Math.cos(angleRad);
  const py = cy - R * Math.sin(angleRad);

  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);

  const fmtVal = (v: number) => v.toFixed(4);
  const fmtShort = (v: number) => v.toFixed(3);

  const targetClamped = Math.max(-1, Math.min(1, target));
  const targetY = cy - targetClamped * R;

  const intersections = useMemo(() => {
    if (Math.abs(targetClamped) > 1) return [];
    const ang1 = Math.asin(targetClamped);
    const ang2 = Math.PI - ang1;
    return [
      { ang: ang1, x: cx + R * Math.cos(ang1), y: cy - R * Math.sin(ang1) },
      { ang: ang2, x: cx + R * Math.cos(ang2), y: cy - R * Math.sin(ang2) },
    ];
  }, [targetClamped]);

  const arcAngle = Math.min(angleRad, 2 * Math.PI);
  const arcR = 28;
  const arcX = cx + arcR * Math.cos(arcAngle);
  const arcY = cy - arcR * Math.sin(arcAngle);
  const largeArc = angleDeg > 180 ? 1 : 0;

  const rightPanelX = 410;
  const rpWidth = 170;

  return (
    <div style={{ width: '100%', height: '100%', background: '#090d16', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">

        <line x1={cx - R - 20} y1={cy} x2={cx + R + 20} y2={cy} stroke="#475569" strokeWidth="1.5" />
        <line x1={cx} y1={cy - R - 20} x2={cx} y2={cy + R + 20} stroke="#475569" strokeWidth="1.5" />
        <polygon points={`${cx + R + 14},${cy - 4} ${cx + R + 20},${cy} ${cx + R + 14},${cy + 4}`} fill="#475569" />
        <polygon points={`${cx - 4},${cy - R - 14} ${cx},${cy - R - 20} ${cx + 4},${cy - R - 14}`} fill="#475569" />
        <text x={cx + R + 24} y={cy + 4} fill="#94a3b8" fontSize="12" fontWeight="bold">x</text>
        <text x={cx + 6} y={cy - R - 22} fill="#94a3b8" fontSize="12" fontWeight="bold">y</text>

        {[-1, 1].map(v => (
          <g key={v}>
            <line x1={cx + v * R - 0.5} y1={cy - 4} x2={cx + v * R - 0.5} y2={cy + 4} stroke="#475569" strokeWidth="1" />
            <text x={cx + v * R} y={cy + 15} fill="#64748b" fontSize="10" textAnchor="middle">{v}</text>
            <line x1={cx - 4} y1={cy - v * R} x2={cx + 4} y2={cy - v * R} stroke="#475569" strokeWidth="1" />
            <text x={cx - 8} y={cy - v * R + 4} fill="#64748b" fontSize="10" textAnchor="end">{v}</text>
          </g>
        ))}
        <text x={cx - 10} y={cy + 15} fill="#64748b" fontSize="10" textAnchor="end">0</text>

        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#334155" strokeWidth="1.5" />

        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#38bdf8" strokeWidth="2" />

        {arcAngle > 0.02 && (
          <path
            d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcX.toFixed(2)} ${arcY.toFixed(2)}`}
            fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.8"
          />
        )}
        {angleDeg > 5 && angleDeg < 355 && (
          <text
            x={cx + (arcR + 12) * Math.cos(angleRad / 2)}
            y={cy - (arcR + 12) * Math.sin(angleRad / 2)}
            fill="#fbbf24" fontSize="11" textAnchor="middle">
            θ
          </text>
        )}

        <line x1={px} y1={py} x2={px} y2={cy} stroke="#4ade80" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.8" />
        <line x1={px} y1={py} x2={cx} y2={py} stroke="#f472b6" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.8" />

        <line x1={cx} y1={py} x2={cx - 4} y2={py} stroke="#4ade80" strokeWidth="1" opacity="0.6" />
        <text x={cx - 6} y={py + 4} fill="#4ade80" fontSize="10" textAnchor="end" opacity="0.85">
          sin={fmtShort(sinVal)}
        </text>

        <line x1={px} y1={cy} x2={px} y2={cy + 4} stroke="#f472b6" strokeWidth="1" opacity="0.6" />
        <text x={px} y={cy + 16} fill="#f472b6" fontSize="10" textAnchor="middle" opacity="0.85">
          cos={fmtShort(cosVal)}
        </text>

        {targetClamped >= -1 && targetClamped <= 1 && (
          <line
            x1={cx - R - 10} y1={targetY}
            x2={cx + R + 10} y2={targetY}
            stroke="#fb923c" strokeWidth="1.5" strokeDasharray="7 3" opacity="0.75"
          />
        )}
        {targetClamped >= -1 && targetClamped <= 1 && (
          <text x={cx - R - 14} y={targetY + 4} fill="#fb923c" fontSize="10" textAnchor="end" opacity="0.85">
            {fmtShort(targetClamped)}
          </text>
        )}

        {intersections.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="6" fill="#ef4444" opacity="0.9" />
            <circle cx={pt.x} cy={pt.y} r="10" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
            <text
              x={pt.x + (i === 0 ? 14 : -14)}
              y={pt.y - 8}
              fill="#ef4444" fontSize="10"
              textAnchor={i === 0 ? 'start' : 'end'} opacity="0.9">
              x={`${(pt.ang * 180 / Math.PI).toFixed(1)}`}°
            </text>
          </g>
        ))}

        <circle cx={px} cy={py} r="7" fill="#38bdf8" />
        <circle cx={px} cy={py} r="11" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4">
          <animate attributeName="r" values="7;13;7" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <text x={px + 14} y={py - 6} fill="#f8fafc" fontSize="11" fontWeight="500">P</text>

        <rect x={rightPanelX - 8} y={30} width={rpWidth + 16} height={385} rx="8"
          fill="rgba(15,23,42,0.85)" stroke="#1e293b" strokeWidth="1" />

        <text x={rightPanelX + rpWidth / 2} y={55} fill="#f8fafc" fontSize="13" fontWeight="700" textAnchor="middle">
          Vòng tròn đơn vị
        </text>

        <line x1={rightPanelX - 8} y1={68} x2={rightPanelX + rpWidth + 8} y2={68} stroke="#1e293b" strokeWidth="1" />

        <text x={rightPanelX} y={90} fill="#94a3b8" fontSize="11">Góc</text>
        <text x={rightPanelX + rpWidth} y={90} fill="#fbbf24" fontSize="12" fontWeight="600" textAnchor="end">
          θ = {angleDeg.toFixed(1)}°
        </text>
        <text x={rightPanelX} y={108} fill="#94a3b8" fontSize="11">= {((angleDeg * Math.PI) / 180).toFixed(4)} rad</text>

        <line x1={rightPanelX - 8} y1={118} x2={rightPanelX + rpWidth + 8} y2={118} stroke="#1e293b" strokeWidth="1" />

        <text x={rightPanelX} y={138} fill="#94a3b8" fontSize="11">sin(θ)</text>
        <text x={rightPanelX + rpWidth} y={138} fill="#4ade80" fontSize="13" fontWeight="700" textAnchor="end">
          {fmtVal(sinVal)}
        </text>
        <rect x={rightPanelX} y={143} width={rpWidth * Math.abs(sinVal)} height="10" rx="3"
          fill={sinVal >= 0 ? '#4ade80' : '#ef4444'} opacity="0.6" />
        <rect x={rightPanelX} y={143} width={rpWidth} height="10" rx="3"
          fill="none" stroke="#334155" strokeWidth="1" />

        <text x={rightPanelX} y={172} fill="#94a3b8" fontSize="11">cos(θ)</text>
        <text x={rightPanelX + rpWidth} y={172} fill="#f472b6" fontSize="13" fontWeight="700" textAnchor="end">
          {fmtVal(cosVal)}
        </text>
        <rect x={rightPanelX} y={177} width={rpWidth * Math.abs(cosVal)} height="10" rx="3"
          fill={cosVal >= 0 ? '#f472b6' : '#ef4444'} opacity="0.6" />
        <rect x={rightPanelX} y={177} width={rpWidth} height="10" rx="3"
          fill="none" stroke="#334155" strokeWidth="1" />

        <line x1={rightPanelX - 8} y1={198} x2={rightPanelX + rpWidth + 8} y2={198} stroke="#1e293b" strokeWidth="1" />

        <text x={rightPanelX} y={218} fill="#94a3b8" fontSize="11">tan(θ)</text>
        <text x={rightPanelX + rpWidth} y={218} fill="#fbbf24" fontSize="12" fontWeight="600" textAnchor="end">
          {Math.abs(cosVal) < 0.005 ? '∞' : fmtVal(sinVal / cosVal)}
        </text>

        <text x={rightPanelX} y={240} fill="#94a3b8" fontSize="11">sin²+cos²</text>
        <text x={rightPanelX + rpWidth} y={240} fill="#94a3b8" fontSize="12" textAnchor="end">
          = {(sinVal * sinVal + cosVal * cosVal).toFixed(4)}
        </text>

        <line x1={rightPanelX - 8} y1={252} x2={rightPanelX + rpWidth + 8} y2={252} stroke="#1e293b" strokeWidth="1" />

        <text x={rightPanelX} y={272} fill="#fb923c" fontSize="11" fontWeight="600">
          sin x = {fmtShort(targetClamped)}
        </text>
        <text x={rightPanelX} y={290} fill="#94a3b8" fontSize="10">
          Nghiệm trong [0°, 360°]:
        </text>
        {intersections.map((pt, i) => (
          <text key={i} x={rightPanelX} y={308 + i * 18} fill="#ef4444" fontSize="11" fontWeight="500">
            x{i + 1} ≈ {(pt.ang * 180 / Math.PI).toFixed(2)}°
          </text>
        ))}

        <line x1={rightPanelX - 8} y1={350} x2={rightPanelX + rpWidth + 8} y2={350} stroke="#1e293b" strokeWidth="1" />

        <text x={rightPanelX + rpWidth / 2} y={372} fill="#64748b" fontSize="10" textAnchor="middle">
          sin²θ + cos²θ = 1
        </text>
        <text x={rightPanelX + rpWidth / 2} y={388} fill="#64748b" fontSize="10" textAnchor="middle">
          tan θ = sin θ / cos θ
        </text>
        <text x={rightPanelX + rpWidth / 2} y={404} fill="#64748b" fontSize="10" textAnchor="middle">
          |sin θ| ≤ 1, |cos θ| ≤ 1
        </text>

        <text x={8} y={H - 12} fill="#334155" fontSize="10">
          Góc θ = {angleDeg.toFixed(1)}°  |  Điểm P({fmtShort(cosVal)}; {fmtShort(sinVal)})
        </text>
      </svg>
    </div>
  );
}
