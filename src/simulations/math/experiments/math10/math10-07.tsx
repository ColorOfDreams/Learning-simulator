import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function TrigRatioSimulation({ config }: SimulationProps) {
  const alphaDeg = Math.min(89, Math.max(1, config.parameters?.find(p => p.key === 'alpha')?.value ?? 45));

  const W = 600; const H = 400;
  const { svgHandlers, groupTransform, resetView, isDirty } = useMathPanZoom(1, W, H);
  const alphaRad = alphaDeg * Math.PI / 180;
  const sinA = Math.sin(alphaRad);
  const cosA = Math.cos(alphaRad);
  const tanA = Math.tan(alphaRad);

  const fmtN = (v: number) => (Math.round(v * 1000) / 1000).toFixed(3);
  const fmtDeg = (d: number) => d.toFixed(0) + '°';

  // ---- Right triangle (left area, 50..350 x range, 60..350 y range) ----
  const triScale = useMemo(() => {
    // Hypotenuse = 1 in unit; scale to fit ~200px height
    return 200;
  }, []);

  const Bx = 60; const By = 340;     // right angle vertex B
  const Cx = Bx + cosA * triScale;   // C at bottom right
  const Cy = By;
  const Ax = Bx;                      // A at top-left
  const Ay = By - sinA * triScale;



  // ---- Unit circle (right area) ----
  const ucx = 460; const ucy = 200; const ucR = 110;
  const Px = ucx + cosA * ucR;
  const Py = ucy - sinA * ucR;

  // Special angles table
  const specials = [
    { deg: 30, sin: '½', cos: '√3/2', tan: '√3/3' },
    { deg: 45, sin: '√2/2', cos: '√2/2', tan: '1' },
    { deg: 60, sin: '√3/2', cos: '½', tan: '√3' },
  ];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />
        <g transform={groupTransform}>

        {/* === LEFT: Right triangle === */}
        <text x={Bx} y={45} fill="#94a3b8" fontSize="13" fontWeight="600">Tam giác vuông tại B</text>

        {/* Triangle fill */}
        <polygon points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`} fill="#1e3a5f" opacity="0.4" />

        {/* Hypotenuse (= 1 unit, orange) */}
        <line x1={Ax} y1={Ay} x2={Cx} y2={Cy} stroke="#f97316" strokeWidth="2.5" />
        {/* Adjacent side (cosA, cyan) */}
        <line x1={Bx} y1={By} x2={Cx} y2={Cy} stroke="#38bdf8" strokeWidth="2.5" />
        {/* Opposite side (sinA, green) */}
        <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke="#4ade80" strokeWidth="2.5" />

        {/* Right angle mark at B */}
        <rect x={Bx} y={By-14} width={14} height={14} fill="none" stroke="#94a3b8" strokeWidth="1.2" opacity="0.7" />

        {/* Angle arc at A */}
        <path
          d={`M ${Ax + Math.sin(alphaRad) * 28} ${Ay + 28} A 28 28 0 0 1 ${Ax + Math.cos(alphaRad/2) * 28} ${Ay + Math.sin(Math.PI/2 - alphaRad/2) * 28}`}
          fill="none" stroke="#e879f9" strokeWidth="1.5"
        />
        <text x={Ax+16} y={Ay+36} fill="#e879f9" fontSize="13" fontWeight="600">α={fmtDeg(alphaDeg)}</text>

        {/* Vertex labels */}
        <text x={Ax-18} y={Ay+4} fill="#94a3b8" fontSize="12" fontWeight="600">A</text>
        <text x={Bx-18} y={By+4} fill="#94a3b8" fontSize="12" fontWeight="600">B</text>
        <text x={Cx+5} y={Cy+4} fill="#94a3b8" fontSize="12" fontWeight="600">C</text>

        {/* Side labels */}
        <text x={(Ax+Cx)/2+6} y={(Ay+Cy)/2-8} fill="#f97316" fontSize="11" fontWeight="600">AC = 1</text>
        <text x={(Bx+Cx)/2} y={Cy-8} fill="#38bdf8" fontSize="11" fontWeight="600">BC = cos α</text>
        <text x={6} y={(Ay+By)/2+4} fill="#4ade80" fontSize="11" fontWeight="600">AB = sin α</text>

        {/* Values box below triangle */}
        <rect x={55} y={355} width={290} height={38} rx={4} fill="#0f172a" fillOpacity={0.9} />
        <text x={63} y={370} fill="#4ade80" fontSize="11">sin α = {fmtN(sinA)}</text>
        <text x={63} y={386} fill="#38bdf8" fontSize="11">cos α = {fmtN(cosA)}</text>
        <text x={170} y={370} fill="#fbbf24" fontSize="11">tan α = {alphaDeg < 89 ? fmtN(tanA) : '∞'}</text>
        <text x={170} y={386} fill="#a78bfa" fontSize="11">cot α = {alphaDeg > 1 ? fmtN(1/tanA) : '∞'}</text>

        {/* === MIDDLE divider === */}
        <line x1={355} y1={20} x2={355} y2={H-20} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

        {/* === RIGHT: Unit circle === */}
        <text x={ucx} y={30} fill="#94a3b8" fontSize="12" fontWeight="600" textAnchor="middle">Đường tròn đơn vị</text>

        {/* Axes */}
        <line x1={ucx - ucR - 15} y1={ucy} x2={ucx + ucR + 20} y2={ucy} stroke="#334155" strokeWidth="1.5" />
        <line x1={ucx} y1={ucy - ucR - 15} x2={ucx} y2={ucy + ucR + 15} stroke="#334155" strokeWidth="1.5" />
        <text x={ucx + ucR + 22} y={ucy+4} fill="#475569" fontSize="10">x</text>
        <text x={ucx+4} y={ucy - ucR - 17} fill="#475569" fontSize="10">y</text>
        <text x={ucx+3} y={ucy+12} fill="#475569" fontSize="9">O</text>

        {/* Unit circle */}
        <circle cx={ucx} cy={ucy} r={ucR} fill="none" stroke="#334155" strokeWidth="1.5" />

        {/* Radius to P */}
        <line x1={ucx} y1={ucy} x2={Px} y2={Py} stroke="#f97316" strokeWidth="2" />

        {/* cos projection (x-axis) */}
        <line x1={Px} y1={Py} x2={Px} y2={ucy} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 3" />
        <line x1={ucx} y1={ucy} x2={Px} y2={ucy} stroke="#38bdf8" strokeWidth="2" />

        {/* sin projection (y-axis) */}
        <line x1={Px} y1={Py} x2={ucx} y2={Py} stroke="#4ade80" strokeWidth="1.8" strokeDasharray="5 3" />
        <line x1={ucx} y1={Py} x2={ucx} y2={ucy} stroke="#4ade80" strokeWidth="2" />

        {/* Angle arc */}
        <path d={`M ${ucx + 30} ${ucy} A 30 30 0 0 0 ${ucx + 30 * cosA} ${ucy - 30 * sinA}`}
          fill="none" stroke="#e879f9" strokeWidth="1.5" />
        <text x={ucx + 35} y={ucy - 10} fill="#e879f9" fontSize="11">α</text>

        {/* Point P */}
        <circle cx={Px} cy={Py} r={5} fill="#fbbf24" />
        <text x={Px - 6} y={Py - 7} fill="#fbbf24" fontSize="10" textAnchor="end">P(cosα, sinα)</text>

        {/* Labels for projections */}
        <text x={(ucx + Px) / 2} y={ucy + 14} fill="#38bdf8" fontSize="10" textAnchor="middle">cosα={fmtN(cosA)}</text>
        <text x={ucx - 52} y={(ucy + Py) / 2 + 4} fill="#4ade80" fontSize="10">sinα={fmtN(sinA)}</text>

        {/* Special angles table — starts at y=315, after unit circle bottom (ucy+ucR=310) */}
        <rect x={355} y={315} width={245} height={78} rx={4} fill="#0f172a" fillOpacity={0.92} />
        <text x={365} y={330} fill="#64748b" fontSize="10" fontWeight="600">Góc đặc biệt</text>
        {['Góc', 'sin', 'cos', 'tan'].map((h, i) => (
          <text key={h} x={365 + i * 58} y={344} fill="#475569" fontSize="10" fontWeight="600">{h}</text>
        ))}
        {specials.map(({ deg, sin, cos, tan }, ri) => (
          <g key={deg}>
            <text x={365} y={360 + ri * 18} fill={alphaDeg === deg ? '#fbbf24' : '#94a3b8'} fontSize="10" fontWeight={alphaDeg === deg ? '700' : '400'}>{deg}°</text>
            <text x={365+58} y={360 + ri * 18} fill={alphaDeg === deg ? '#4ade80' : '#64748b'} fontSize="10">{sin}</text>
            <text x={365+116} y={360 + ri * 18} fill={alphaDeg === deg ? '#38bdf8' : '#64748b'} fontSize="10">{cos}</text>
            <text x={365+174} y={360 + ri * 18} fill={alphaDeg === deg ? '#fbbf24' : '#64748b'} fontSize="10">{tan}</text>
          </g>
        ))}
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
