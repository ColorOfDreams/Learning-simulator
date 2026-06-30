import { useMemo } from 'react';
import type { SimulationProps } from '../../types';

export default function ComplexSimulation({ config }: SimulationProps) {
  const re = config.parameters?.find(p => p.key === 're')?.value ?? 3;
  const im = config.parameters?.find(p => p.key === 'im')?.value ?? 2;

  const W = 600; const H = 400;
  const scale = 45;
  const ox = W / 2; const oy = H / 2;
  const toSX = (x: number) => ox + x * scale;
  const toSY = (y: number) => oy - y * scale;

  const r    = Math.sqrt(re*re + im*im);
  const theta = Math.atan2(im, re);
  const thetaDeg = theta * 180 / Math.PI;

  // z² = (a+bi)² = (a²-b²) + 2abi
  const re2 = re*re - im*im;
  const im2 = 2*re*im;

  // Conjugate
  const reConj = re; const imConj = -im;

  const { arcPath } = useMemo(() => {
    // Arc from 0 to theta
    const pts: string[] = [];
    const arcR = Math.min(r * 0.3, 1.5);
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = theta * i / steps;
      pts.push(`${i===0?'M':'L'} ${toSX(arcR*Math.cos(t)).toFixed(1)} ${toSY(arcR*Math.sin(t)).toFixed(1)}`);
    }
    return { arcPath: pts.join(' ') };
  }, [re, im]);

  const xTicks = Array.from({length: 13}, (_, i) => i - 6).filter(x => x !== 0);
  const yTicks = Array.from({length: 11}, (_, i) => i - 5).filter(y => y !== 0);

  const sz  = { x: toSX(re),   y: toSY(im)   };
  const sz2 = { x: toSX(re2),  y: toSY(im2)  };
  const szC = { x: toSX(reConj), y: toSY(imConj) };

  const showZ2  = r <= 3.5;
  const showZ2Clamp = { x: Math.max(4, Math.min(W-4, sz2.x)), y: Math.max(4, Math.min(H-4, sz2.y)) };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <rect width={W} height={H} fill="#090d16" />

        {/* Grid */}
        {xTicks.map(x => <line key={`gx${x}`} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
        {yTicks.map(y => <line key={`gy${y}`} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="#1e293b" strokeWidth="1" />)}

        {/* Unit circle */}
        <circle cx={ox} cy={oy} r={scale} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

        {/* Modulus circle */}
        {r > 0.1 && <circle cx={ox} cy={oy} r={r*scale} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="6 4" />}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#475569" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#475569" strokeWidth="1.5" />
        <text x={W-6} y={oy-5} fill="#64748b" fontSize="12" textAnchor="end">Re</text>
        <text x={ox+5} y={12} fill="#64748b" fontSize="12">Im</text>

        {/* Ticks */}
        {xTicks.filter((_,i)=>i%2===0).map(x => <text key={`xt${x}`} x={toSX(x)} y={oy+14} fill="#64748b" fontSize="10" textAnchor="middle">{x}</text>)}
        {yTicks.filter((_,i)=>i%2===0).map(y => <text key={`yt${y}`} x={ox-5} y={toSY(y)+4} fill="#64748b" fontSize="10" textAnchor="end">{y}i</text>)}

        {/* Projections */}
        <line x1={sz.x} y1={oy} x2={sz.x} y2={sz.y} stroke="#38bdf840" strokeWidth="1" strokeDasharray="4 3" />
        <line x1={ox} y1={sz.y} x2={sz.x} y2={sz.y} stroke="#38bdf840" strokeWidth="1" strokeDasharray="4 3" />

        {/* z vector */}
        <line x1={ox} y1={oy} x2={sz.x} y2={sz.y} stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arr)" />

        {/* Conjugate */}
        <line x1={ox} y1={oy} x2={szC.x} y2={szC.y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 3" />
        <circle cx={szC.x} cy={szC.y} r={3} fill="#64748b" />
        <text x={szC.x+6} y={szC.y+4} fill="#64748b" fontSize="11">z̄ = {re}{im<0?'':'+'}{-im}i</text>

        {/* z² */}
        {showZ2 && (
          <g>
            <line x1={ox} y1={oy} x2={showZ2Clamp.x} y2={showZ2Clamp.y} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="6 3" />
            <circle cx={showZ2Clamp.x} cy={showZ2Clamp.y} r={3} fill="#a78bfa" />
            <text x={showZ2Clamp.x+6} y={showZ2Clamp.y+4} fill="#a78bfa" fontSize="11">
              z² = {re2.toFixed(1)}{im2>=0?'+':''}{im2.toFixed(1)}i
            </text>
          </g>
        )}

        {/* Arc for angle */}
        {r > 0.3 && <path d={arcPath} fill="none" stroke="#f97316" strokeWidth="1.5" />}
        {r > 0.3 && (
          <text
            x={toSX(0.5 * Math.cos(theta/2))+4}
            y={toSY(0.5 * Math.sin(theta/2))}
            fill="#f97316" fontSize="11"
          >θ={thetaDeg.toFixed(1)}°</text>
        )}

        {/* z point */}
        <circle cx={sz.x} cy={sz.y} r={6} fill="#38bdf8" />
        <text x={sz.x+8} y={sz.y-4} fill="#38bdf8" fontSize="13" fontWeight="bold">z</text>
        <text x={sz.x+8} y={sz.y+12} fill="#38bdf8" fontSize="11">{re}{im>=0?'+':''}{im}i</text>

        {/* Arrow marker */}
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Info box */}
        <rect x={8} y={8} width={210} height={84} rx={6} fill="#0f172a" fillOpacity={0.9} />
        <text x={16} y={26} fill="#38bdf8" fontSize="13">z = {re}{im>=0?'+':''}{im}i</text>
        <text x={16} y={44} fill="#94a3b8" fontSize="12">|z| = r = {r.toFixed(3)}</text>
        <text x={16} y={62} fill="#f97316" fontSize="12">arg(z) = {thetaDeg.toFixed(2)}°</text>
        <text x={16} y={80} fill="#64748b" fontSize="11">z = {r.toFixed(2)}(cos{thetaDeg.toFixed(1)}° + i·sin{thetaDeg.toFixed(1)}°)</text>
      </svg>
    </div>
  );
}
