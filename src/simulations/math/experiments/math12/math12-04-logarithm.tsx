import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function LogarithmSimulation({ config }: SimulationProps) {
  const rawBase = config.parameters?.find(p => p.key === 'base')?.value ?? Math.E;
  const base = Math.max(1.01, rawBase === 1 ? Math.E : rawBase);

  const W = 600; const H = 400;
  const scale = 50;
  const ox = W / 2; const oy = H / 2;
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const logBase = (x: number) => Math.log(x) / Math.log(base);

  const { logPath, lnPath } = useMemo(() => {
    const log: string[] = []; const ln: string[] = [];
    for (let i = 1; i <= W; i += 2) {
      const x = (i - ox) / scale;
      if (x <= 0) continue;
      const yLog = logBase(x);
      const yLn  = Math.log(x);
      if (isFinite(yLog) && Math.abs(yLog) <= 6)
        log.push(`${log.length === 0 ? 'M' : 'L'} ${i.toFixed(1)} ${toSY(yLog).toFixed(1)}`);
      if (isFinite(yLn) && Math.abs(yLn) <= 6)
        ln.push(`${ln.length === 0 ? 'M' : 'L'} ${i.toFixed(1)} ${toSY(yLn).toFixed(1)}`);
    }
    return { logPath: log.join(' '), lnPath: ln.join(' ') };
  }, [base]);

  const xTicks = Array.from({length: 11}, (_, i) => i - 5).filter(x => x !== 0);
  const yTicks = Array.from({length: 9},  (_, i) => i - 4).filter(y => y !== 0);

  const yAtBase = toSY(1);
  const isNatural = Math.abs(base - Math.E) < 0.05;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Vertical asymptote x=0 */}
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#ef4444" strokeWidth="1" strokeDasharray="6 4" />
        <text x={ox+5} y={H-10} fill="#ef4444" fontSize="10">TCĐ: x=0</text>

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <text x={W-6} y={oy-5} fill="#64748b" fontSize="12" textAnchor="end">x</text>
        <text x={ox+5} y={12} fill="#64748b" fontSize="12">y</text>

        {/* Ticks */}
        {xTicks.filter((_,i)=>i%2===0&&i>5).map(x => <text key={`xt${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>)}
        {yTicks.filter((_,i)=>i%2===0).map(y => <text key={`yt${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}</text>)}

        {/* ln reference curve */}
        {!isNatural && <path d={lnPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" />}

        {/* Main log curve */}
        <path d={logPath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Key point (1, 0) */}
        <circle cx={ox + scale} cy={oy} r={4} fill="#94a3b8" />
        <text x={ox + scale + 8} y={oy + 4} fill="#94a3b8" fontSize="11">(1, 0)</text>

        {/* Key point (base, 1) */}
        {yAtBase > 0 && yAtBase < H && toSX(base) > 0 && toSX(base) < W && (
          <g>
            <circle cx={toSX(base)} cy={yAtBase} r={4} fill="#38bdf8" />
            <text x={toSX(base)+8} y={yAtBase+4} fill="#38bdf8" fontSize="11">({base.toFixed(2)}, 1)</text>
          </g>
        )}

        {/* Info box */}
        <rect x={8} y={8} width={260} height={72} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={26} fill="#38bdf8" fontSize="13">y = log_{isNatural ? 'e' : base.toFixed(2)}(x) {isNatural ? '= ln(x)' : ''}</text>
        <text x={16} y={44} fill="#64748b" fontSize="11">Tập xác định: D = (0, +∞)</text>
        <text x={16} y={62} fill="#64748b" fontSize="11">{base > 1 ? '⬆ Hàm đồng biến' : '⬇ Hàm nghịch biến'} | log_{isNatural?'e':base.toFixed(1)}(1) = 0</text>

        {/* Legend */}
        {!isNatural && (
          <>
            <line x1={W-130} y1={H-25} x2={W-110} y2={H-25} stroke="#38bdf8" strokeWidth="2" />
            <text x={W-106} y={H-21} fill="#38bdf8" fontSize="11">log_{base.toFixed(1)}(x)</text>
            <line x1={W-130} y1={H-10} x2={W-110} y2={H-10} stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={W-106} y={H-6} fill="#64748b" fontSize="11">ln(x)</text>
          </>
        )}
      </svg>
    </div>
  );
}
