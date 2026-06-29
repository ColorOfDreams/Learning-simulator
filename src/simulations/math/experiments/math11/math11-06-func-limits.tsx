import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function FuncLimitsSimulation({ config }: SimulationProps) {
  const funcType = Math.round(config.parameters?.find(p => p.key === 'funcType')?.value ?? 0);
  const approach = config.parameters?.find(p => p.key === 'approach')?.value ?? 1;

  const W = 600;
  const H = 400;
  const originX = W / 2;
  const originY = H / 2;
  const scale = 55;

  const toSX = (x: number) => originX + x * scale;
  const toSY = (y: number) => originY - y * scale;

  type FuncDef = {
    label: string;
    leftLimit: (x0: number) => number | null;
    rightLimit: (x0: number) => number | null;
    eval: (x: number) => number | null;
    discPoints: number[];
    discType: 'removable' | 'jump' | 'none';
    formulaLine2: string;
  };

  const funcDefs: FuncDef[] = [
    {
      label: 'f(x) = (x²-1)/(x-1)',
      formulaLine2: '= x+1  (x ≠ 1)',
      leftLimit: () => 2,
      rightLimit: () => 2,
      eval: (x) => Math.abs(x - 1) < 0.001 ? null : (x * x - 1) / (x - 1),
      discPoints: [1],
      discType: 'removable',
    },
    {
      label: 'f(x) = floor(x)',
      formulaLine2: '(hàm phần nguyên)',
      leftLimit: (x0) => Math.floor(x0) - (Number.isInteger(x0) ? 1 : 0),
      rightLimit: (x0) => Math.floor(x0),
      eval: (x) => Math.floor(x),
      discPoints: [-2, -1, 0, 1, 2],
      discType: 'jump',
    },
    {
      label: 'f(x) = |x|/x',
      formulaLine2: '(hàm dấu sgn)',
      leftLimit: () => -1,
      rightLimit: () => 1,
      eval: (x) => Math.abs(x) < 0.001 ? null : x / Math.abs(x),
      discPoints: [0],
      discType: 'jump',
    },
    {
      label: 'f(x) = sin(x)/x',
      formulaLine2: '(x ≠ 0)',
      leftLimit: () => 1,
      rightLimit: () => 1,
      eval: (x) => Math.abs(x) < 0.001 ? null : Math.sin(x) / x,
      discPoints: [0],
      discType: 'removable',
    },
  ];

  const def = funcDefs[Math.min(3, Math.max(0, funcType))];
  const x0 = approach;

  const leftLim = def.leftLimit(x0);
  const rightLim = def.rightLimit(x0);
  const limExists = leftLim !== null && rightLim !== null && Math.abs(leftLim - rightLim) < 0.0001;
  const limValue = limExists ? leftLim : null;

  const xMin = -originX / scale;
  const xMax = (W - originX) / scale;
  const yMin = -originY / scale;
  const yMax = originY / scale;

  const segments = useMemo(() => {
    const steps = 300;
    const dx = (xMax - xMin) / steps;
    const segs: string[][] = [[]];
    let current = segs[0];

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const near = def.discPoints.some(d => Math.abs(x - d) < dx * 1.5);
      if (near) {
        if (current.length > 0) {
          segs.push([]);
          current = segs[segs.length - 1];
        }
        continue;
      }
      const y = def.eval(x);
      if (y === null || !isFinite(y) || y < yMin - 2 || y > yMax + 2) {
        if (current.length > 0) {
          segs.push([]);
          current = segs[segs.length - 1];
        }
        continue;
      }
      const cmd = current.length === 0 ? 'M' : 'L';
      current.push(`${cmd} ${toSX(x).toFixed(2)} ${toSY(y).toFixed(2)}`);
    }
    return segs.filter(s => s.length > 1).map(s => s.join(' '));
  }, [funcType, approach]);

  const xTicks: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
    if (x !== 0) xTicks.push(x);
  }
  const yTicks: number[] = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
    if (y !== 0) yTicks.push(y);
  }

  const approachX = toSX(x0);
  const leftArrY = leftLim !== null && isFinite(leftLim) ? toSY(leftLim) : null;
  const rightArrY = rightLim !== null && isFinite(rightLim) ? toSY(rightLim) : null;

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
        <text x={originX - 10} y={originY + 14} fill="#64748b" fontSize="10">0</text>

        {xTicks.map(x => (
          <text key={`xt${x}`} x={toSX(x)} y={originY + 14} fill="#475569" fontSize="10" textAnchor="middle">{x}</text>
        ))}
        {yTicks.map(y => (
          <text key={`yt${y}`} x={originX - 7} y={toSY(y) + 4} fill="#475569" fontSize="10" textAnchor="end">{y}</text>
        ))}

        {segments.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {def.discType === 'removable' && def.discPoints.map(dp => {
          const yL = leftLim;
          if (yL === null) return null;
          const sx = toSX(dp);
          const sy = toSY(yL);
          if (sy < -10 || sy > H + 10) return null;
          return (
            <g key={`disc${dp}`}>
              <circle cx={sx} cy={sy} r="6" fill="#090d16" stroke="#38bdf8" strokeWidth="2" />
              <circle cx={sx} cy={sy} r="4" fill="#4ade80" opacity="0.5" />
            </g>
          );
        })}

        {def.discType === 'jump' && def.discPoints.map(dp => {
          const lL = def.leftLimit(dp);
          const rL = def.rightLimit(dp);
          if (lL === null || rL === null) return null;
          const sx = toSX(dp);
          const syL = toSY(lL);
          const syR = toSY(rL);
          return (
            <g key={`jump${dp}`}>
              <circle cx={sx} cy={syL} r="5.5" fill="#090d16" stroke="#f87171" strokeWidth="2" />
              <circle cx={sx} cy={syR} r="5.5" fill="#4ade80" stroke="#4ade80" strokeWidth="1.5" />
            </g>
          );
        })}

        <line x1={approachX} y1={0} x2={approachX} y2={H} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" />
        <text x={approachX + 4} y={20} fill="#a78bfa" fontSize="10">x₀={x0.toFixed(1)}</text>

        {leftArrY !== null && leftArrY > 0 && leftArrY < H && (
          <g>
            <line x1={approachX - 40} y1={leftArrY} x2={approachX - 8} y2={leftArrY} stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowR)" />
            <text x={approachX - 44} y={leftArrY - 4} fill="#f59e0b" fontSize="10" textAnchor="end">
              {leftLim !== null ? leftLim.toFixed(2) : ''}
            </text>
          </g>
        )}
        {rightArrY !== null && rightArrY > 0 && rightArrY < H && (
          <g>
            <line x1={approachX + 8} y1={rightArrY} x2={approachX + 40} y2={rightArrY} stroke="#fb923c" strokeWidth="2" />
            <text x={approachX + 44} y={rightArrY - 4} fill="#fb923c" fontSize="10">
              {rightLim !== null ? rightLim.toFixed(2) : ''}
            </text>
          </g>
        )}

        <defs>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#f59e0b" />
          </marker>
        </defs>

        <rect x={10} y={10} width={230} height={80} rx="5" fill="rgba(15,23,42,0.9)" stroke="#334155" strokeWidth="1" />
        <text x={20} y={28} fill="#f8fafc" fontSize="12" fontWeight="bold">{def.label}</text>
        <text x={20} y={44} fill="#94a3b8" fontSize="10">{def.formulaLine2}</text>
        {limExists && limValue !== null ? (
          <text x={20} y={62} fill="#4ade80" fontSize="12">lim f(x) = {limValue.toFixed(2)}</text>
        ) : (
          <text x={20} y={62} fill="#f87171" fontSize="11">Giới hạn không tồn tại</text>
        )}
        <text x={20} y={80} fill="#64748b" fontSize="9">Hàm liên tục tại x₀ khi lim = f(x₀)</text>

        {!limExists && leftLim !== null && rightLim !== null && (
          <g>
            <rect x={W / 2 - 110} y={H - 48} width={220} height={38} rx="4" fill="rgba(239,68,68,0.12)" stroke="#f87171" strokeWidth="1" />
            <text x={W / 2} y={H - 30} fill="#f87171" fontSize="11" textAnchor="middle">
              lim⁻ = {leftLim.toFixed(2)} ≠ lim⁺ = {rightLim.toFixed(2)}
            </text>
            <text x={W / 2} y={H - 16} fill="#f87171" fontSize="10" textAnchor="middle">Giới hạn hai phía không bằng nhau</text>
          </g>
        )}
        {limExists && limValue !== null && (
          <g>
            <rect x={W / 2 - 100} y={H - 44} width={200} height={34} rx="4" fill="rgba(74,222,128,0.1)" stroke="#4ade80" strokeWidth="1" />
            <text x={W / 2} y={H - 26} fill="#4ade80" fontSize="11" textAnchor="middle">
              lim f(x) = {limValue.toFixed(2)} khi x → {x0.toFixed(1)}
            </text>
            <text x={W / 2} y={H - 12} fill="#64748b" fontSize="9" textAnchor="middle">Giới hạn trái = Giới hạn phải</text>
          </g>
        )}
      </svg>
    </div>
  );
}
