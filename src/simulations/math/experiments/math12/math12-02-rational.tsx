import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function RationalSimulation({ config }: SimulationProps) {
  const a = config.parameters?.find(p => p.key === 'a')?.value ?? 1;
  const b = config.parameters?.find(p => p.key === 'b')?.value ?? 0;
  const c = config.parameters?.find(p => p.key === 'c')?.value ?? 1;
  const d = config.parameters?.find(p => p.key === 'd')?.value ?? 1;

  const W = 600; const H = 400;
  const scale = 45;
  const ox = W / 2; const oy = H / 2;
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  // Vertical asymptote: x = -d/c  (when cx + d = 0)
  // Horizontal asymptote: y = a/c
  const va = Math.abs(c) > 0.001 ? -d / c : null;
  const ha = Math.abs(c) > 0.001 ? a / c : null;

  const { leftPath, rightPath } = useMemo(() => {
    const left: string[] = []; const right: string[] = [];
    for (let i = 0; i <= W; i += 2) {
      const x = (i - ox) / scale;
      const denom = c * x + d;
      if (Math.abs(denom) < 0.15) { left.push('Z'); right.push('Z'); continue; }
      const y = (a * x + b) / denom;
      if (!isFinite(y) || Math.abs(y) > 7) { left.push('Z'); right.push('Z'); continue; }
      const sx = i; const sy = toSY(y);
      const inLeft = va === null || x < va;
      const arr = inLeft ? left : right;
      arr.push(`${!arr.length || arr[arr.length-1]==='Z' ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    return { leftPath: left.join(' '), rightPath: right.join(' ') };
  }, [a, b, c, d]);

  const xTicks = Array.from({length: 13}, (_, i) => i - 6).filter(x => x !== 0);
  const yTicks = Array.from({length: 11}, (_, i) => i - 5).filter(y => y !== 0);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <text x={W-6} y={oy-5} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+5} y={12} fill="#64748b" fontSize="12">y</text>

        {/* Tick labels */}
        {xTicks.filter((_,i) => i%2===0).map(x => <text key={`xt${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>)}
        {yTicks.filter((_,i) => i%2===0).map(y => <text key={`yt${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}</text>)}

        {/* Vertical asymptote */}
        {va !== null && (
          <g>
            <line x1={toSX(va)} y1={0} x2={toSX(va)} y2={H} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="8 4" />
            <text x={toSX(va)+5} y={20} fill="#ef4444" fontSize="11">TCĐ: x = {va.toFixed(2)}</text>
          </g>
        )}

        {/* Horizontal asymptote */}
        {ha !== null && (
          <g>
            <line x1={0} y1={toSY(ha)} x2={W} y2={toSY(ha)} stroke="#fb923c" strokeWidth="1.5" strokeDasharray="8 4" />
            <text x={W-6} y={toSY(ha)-5} fill="#fb923c" fontSize="11" textAnchor="end">TCN: y = {ha.toFixed(2)}</text>
          </g>
        )}

        {/* Curves */}
        <path d={leftPath}  fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        <path d={rightPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Info box */}
        <rect x={8} y={8} width={220} height={66} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={26} fill="#94a3b8" fontSize="12">y = ({a}x {b>=0?'+':''}{b}) / ({c}x {d>=0?'+':''}{d})</text>
        {va !== null && <text x={16} y={43} fill="#fca5a5" fontSize="11">TCĐ: x = {va.toFixed(3)}</text>}
        {ha !== null && <text x={16} y={58} fill="#fdba74" fontSize="11">TCN: y = {ha.toFixed(3)}</text>}
      </svg>
    </div>
  );
}
