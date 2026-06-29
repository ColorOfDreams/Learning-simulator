import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function TransformationsSimulation({ config }: SimulationProps) {
  const transType = Math.round(config.parameters?.find(p => p.key === 'transType')?.value ?? 0);
  const tx = config.parameters?.find(p => p.key === 'tx')?.value ?? 3;
  const ty = config.parameters?.find(p => p.key === 'ty')?.value ?? 2;
  const angle = config.parameters?.find(p => p.key === 'angle')?.value ?? 90;

  const W = 600;
  const H = 400;
  const scale = 35;
  const originX = W / 2;
  const originY = H / 2;

  const toSX = (x: number) => originX + x * scale;
  const toSY = (y: number) => originY - y * scale;

  type Pt = { x: number; y: number };

  const original: Pt[] = [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 2, y: 3 },
  ];

  const applyTransform = (p: Pt): Pt => {
    const rad = (angle * Math.PI) / 180;
    switch (transType) {
      case 0:
        return { x: p.x + tx, y: p.y + ty };
      case 1:
        return { x: p.x, y: -p.y };
      case 2:
        return { x: -p.x, y: p.y };
      case 3:
        return { x: -p.x, y: -p.y };
      case 4:
        return {
          x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
          y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
        };
      default:
        return p;
    }
  };

  const transformed = useMemo(() => {
    return original.map(p => applyTransform(p));
  }, [transType, tx, ty, angle]);

  const triPath = (pts: Pt[]) =>
    `M ${toSX(pts[0].x)} ${toSY(pts[0].y)} L ${toSX(pts[1].x)} ${toSY(pts[1].y)} L ${toSX(pts[2].x)} ${toSY(pts[2].y)} Z`;

  const xMin = -Math.floor(originX / scale);
  const xMax = Math.floor((W - originX) / scale);
  const yMin = -Math.floor(originY / scale);
  const yMax = Math.floor((H - originY) / scale);

  const xTicks: number[] = [];
  for (let x = xMin; x <= xMax; x++) {
    if (x !== 0) xTicks.push(x);
  }
  const yTicks: number[] = [];
  for (let y = yMin; y <= yMax; y++) {
    if (y !== 0) yTicks.push(y);
  }

  const transLabels = [
    `Tịnh tiến theo v⃗ = (${tx.toFixed(1)}, ${ty.toFixed(1)})`,
    `Đối xứng qua trục Ox: (x,y) → (x,-y)`,
    `Đối xứng qua trục Oy: (x,y) → (-x,y)`,
    `Đối xứng qua tâm O: (x,y) → (-x,-y)`,
    `Quay ${angle.toFixed(0)}° quanh gốc O`,
  ];

  const transFormula = [
    `A'=(A₁+${tx.toFixed(1)}, A₂+${ty.toFixed(1)})`,
    `A'=(x, -y)`,
    `A'=(-x, y)`,
    `A'=(-x, -y)`,
    `A'=(x·cos${angle.toFixed(0)}°-y·sin${angle.toFixed(0)}°, ...)`,
  ];

  const label = transType >= 0 && transType <= 4 ? transLabels[transType] : transLabels[0];
  const formula = transType >= 0 && transType <= 4 ? transFormula[transType] : transFormula[0];

  const vertexLabels = ['A', 'B', 'C'];

  const midOriginal = {
    x: (original[0].x + original[1].x + original[2].x) / 3,
    y: (original[0].y + original[1].y + original[2].y) / 3,
  };

  const showVecArrow = transType === 0;
  const vecMid = {
    x: (original[0].x + original[0].x + tx) / 2,
    y: (original[0].y + original[0].y + ty) / 2,
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#090d16', color: '#f8fafc', fontFamily: 'sans-serif', position: 'relative', boxSizing: 'border-box', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        <g stroke="#1e293b" strokeWidth="0.5">
          {xTicks.map(x => (
            <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} />
          ))}
          {yTicks.map(y => (
            <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} />
          ))}
        </g>

        <line x1={0} y1={originY} x2={W} y2={originY} stroke="#475569" strokeWidth="1.5" />
        <line x1={originX} y1={0} x2={originX} y2={H} stroke="#475569" strokeWidth="1.5" />
        <text x={W - 14} y={originY - 7} fill="#94a3b8" fontSize="12" fontWeight="bold">x</text>
        <text x={originX + 8} y={14} fill="#94a3b8" fontSize="12" fontWeight="bold">y</text>
        <text x={originX - 10} y={originY + 14} fill="#64748b" fontSize="10">O</text>

        {xTicks.map(x => (
          <text key={`xt${x}`} x={toSX(x)} y={originY + 14} fill="#475569" fontSize="10" textAnchor="middle">{x}</text>
        ))}
        {yTicks.map(y => (
          <text key={`yt${y}`} x={originX - 7} y={toSY(y) + 4} fill="#475569" fontSize="10" textAnchor="end">{y}</text>
        ))}

        <defs>
          <marker id="arrOrange" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#fb923c" />
          </marker>
        </defs>

        {original.map((pt, i) => {
          const tpt = transformed[i];
          const sx1 = toSX(pt.x);
          const sy1 = toSY(pt.y);
          const sx2 = toSX(tpt.x);
          const sy2 = toSY(tpt.y);
          const dx = sx2 - sx1;
          const dy = sy2 - sy1;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 10) return null;
          const ux = dx / len;
          const uy = dy / len;
          const x1a = sx1 + ux * 8;
          const y1a = sy1 + uy * 8;
          const x2a = sx2 - ux * 8;
          const y2a = sy2 - uy * 8;
          return (
            <line key={`arr${i}`} x1={x1a} y1={y1a} x2={x2a} y2={y2a}
              stroke="#fb923c" strokeWidth="1" strokeDasharray="3 2" markerEnd="url(#arrOrange)" opacity="0.55" />
          );
        })}

        <path d={triPath(original)} fill="rgba(59,130,246,0.18)" stroke="#3b82f6" strokeWidth="2.5" />

        <path d={triPath(transformed)} fill="rgba(251,146,60,0.15)" stroke="#fb923c" strokeWidth="2.5" strokeDasharray="7 4" />

        {original.map((pt, i) => (
          <g key={`orig${i}`}>
            <circle cx={toSX(pt.x)} cy={toSY(pt.y)} r="5" fill="#3b82f6" />
            <text x={toSX(pt.x) - 12} y={toSY(pt.y) - 8} fill="#93c5fd" fontSize="12" fontWeight="bold">{vertexLabels[i]}</text>
          </g>
        ))}

        {transformed.map((pt, i) => (
          <g key={`trans${i}`}>
            <circle cx={toSX(pt.x)} cy={toSY(pt.y)} r="5" fill="#fb923c" />
            <text x={toSX(pt.x) + 8} y={toSY(pt.y) - 8} fill="#fdba74" fontSize="12" fontWeight="bold">{vertexLabels[i]}'</text>
          </g>
        ))}

        {showVecArrow && (
          <g>
            <defs>
              <marker id="arrVec" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                <polygon points="0 0, 7 3.5, 0 7" fill="#4f6ef7" />
              </marker>
            </defs>
            <line
              x1={toSX(midOriginal.x)}
              y1={toSY(midOriginal.y)}
              x2={toSX(midOriginal.x + tx)}
              y2={toSY(midOriginal.y + ty)}
              stroke="#4f6ef7"
              strokeWidth="2.5"
              markerEnd="url(#arrVec)"
            />
            <text
              x={toSX(vecMid.x) + 6}
              y={toSY(vecMid.y + ty / 2) - 4}
              fill="#818cf8"
              fontSize="11"
              fontWeight="bold"
            >
              v⃗({tx.toFixed(1)},{ty.toFixed(1)})
            </text>
          </g>
        )}

        {transType === 1 && (
          <line x1={0} y1={originY} x2={W} y2={originY} stroke="#facc15" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
        )}
        {transType === 2 && (
          <line x1={originX} y1={0} x2={originX} y2={H} stroke="#facc15" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.6" />
        )}
        {transType === 3 && (
          <circle cx={originX} cy={originY} r="8" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.7" />
        )}

        <rect x={10} y={10} width={240} height={68} rx="5" fill="rgba(15,23,42,0.9)" stroke="#334155" strokeWidth="1" />
        <text x={18} y={28} fill="#f8fafc" fontSize="11" fontWeight="bold">{label}</text>
        <text x={18} y={46} fill="#94a3b8" fontSize="10">{formula}</text>
        <g>
          <rect x={18} y={55} width={10} height={10} fill="#3b82f6" opacity="0.7" />
          <text x={32} y={64} fill="#93c5fd" fontSize="10">Hình gốc ABC</text>
          <rect x={110} y={55} width={10} height={10} fill="#fb923c" opacity="0.7" />
          <text x={124} y={64} fill="#fdba74" fontSize="10">Ảnh A'B'C'</text>
        </g>

        <rect x={W - 160} y={10} width={148} height={80} rx="5" fill="rgba(15,23,42,0.88)" stroke="#334155" strokeWidth="1" />
        {original.map((pt, i) => (
          <text key={`lp${i}`} x={W - 150} y={28 + i * 16} fill="#93c5fd" fontSize="10">
            {vertexLabels[i]}({pt.x.toFixed(1)},{pt.y.toFixed(1)}) → {vertexLabels[i]}'({transformed[i].x.toFixed(1)},{transformed[i].y.toFixed(1)})
          </text>
        ))}
        <text x={W - 150} y={82} fill="#64748b" fontSize="9">Phép dời hình bảo toàn khoảng cách</text>
      </svg>
    </div>
  );
}
