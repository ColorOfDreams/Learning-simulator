import { useState, useEffect, useRef, useMemo } from 'react';
import type { SimulationProps } from '../../types';

interface TickItem {
  isX: boolean;
  val: number;
  s: number;
}

export default function ConicSimulation({
  config,
  isPlaying = false,
  onAnimationEnd,
}: SimulationProps) {
  const params = config.parameters;
  const cVal = params.find(p => p.key === 'c')?.value ?? 3;
  const aVal = params.find(p => p.key === 'a')?.value ?? 5;

  // Enforce ellipse math constraint: a > c
  const c = Math.max(0.5, cVal);
  const a = Math.max(c + 0.5, aVal);
  const b = Math.sqrt(a * a - c * c);

  const [theta, setTheta] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const animationRef = useRef<number | null>(null);

  const width = 600;
  const height = 400;
  const scale = 30; // pixels per unit
  const originX = width / 2;
  const originY = height / 2;

  const toScreenX = (x: number) => originX + x * scale;
  const toScreenY = (y: number) => originY - y * scale;

  // Reset tracing when parameters change or play state resets
  useEffect(() => {
    if (!isPlaying) {
      setTheta(0);
      setTrail([]);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      setTheta(0);
      setTrail([]);
    }
  }, [isPlaying, aVal, cVal]);

  // Run the drawing loop
  useEffect(() => {
    if (!isPlaying) return;

    let startTime = performance.now();
    const duration = 8000; // 8 seconds for a complete trace

    const loop = (now: number) => {
      const elapsed = now - startTime;
      const progress = (elapsed % duration) / duration; // 0 to 1
      const currentTheta = progress * Math.PI * 2;

      const px = a * Math.cos(currentTheta);
      const py = b * Math.sin(currentTheta);

      setTheta(currentTheta);
      setTrail(prev => {
        // Only append unique/new points
        const sx = toScreenX(px);
        const sy = toScreenY(py);
        if (prev.length === 0 || Math.hypot(prev[prev.length - 1].x - sx, prev[prev.length - 1].y - sy) > 2) {
          return [...prev, { x: sx, y: sy }];
        }
        return prev;
      });

      if (elapsed >= duration) {
        if (onAnimationEnd) onAnimationEnd();
        return;
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, a, b]);

  // Current drawing point coordinates
  const curX = a * Math.cos(theta);
  const curY = b * Math.sin(theta);

  // Foci coordinates
  const f1X = -c;
  const f1Y = 0;
  const f2X = c;
  const f2Y = 0;

  // Distances
  const d1 = Math.hypot(curX - f1X, curY - f1Y);
  const d2 = Math.hypot(curX - f2X, curY - f2Y);
  const sumD = d1 + d2;

  // Grid tick marks
  const ticks = useMemo(() => {
    const arr: TickItem[] = [];
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
            {ticks.map((t: TickItem, idx: number) =>
              t.isX ? (
                <line key={`gl-x-${idx}`} x1={t.s} y1={0} x2={t.s} y2={height} />
              ) : (
                <line key={`gl-y-${idx}`} x1={0} y1={t.s} x2={width} y2={t.s} />
              )
            )}
          </g>

          {/* Axes */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="1.5" />
          <line x1={originX} y1={0} x2={originX} y2={height} stroke="#475569" strokeWidth="1.5" />

          {/* Grid ticks values */}
          <g fill="#475569" fontSize="9" textAnchor="middle">
            {ticks.map((t: TickItem, idx: number) =>
              t.isX ? (
                <text key={`tx-${idx}`} x={t.s} y={originY + 12}>{t.val}</text>
              ) : (
                <text key={`ty-${idx}`} x={originX - 8} y={t.s + 3} textAnchor="end">{t.val}</text>
              )
            )}
          </g>

          {/* Ideal Ellipse Path (Faint background) */}
          <ellipse
            cx={originX}
            cy={originY}
            rx={a * scale}
            ry={b * scale}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Traced trail */}
          {trail.length > 1 && (
            <path
              d={`M ${trail.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
            />
          )}

          {/* String lines (F1 - M - F2) */}
          <line
            x1={toScreenX(f1X)}
            y1={toScreenY(f1Y)}
            x2={toScreenX(curX)}
            y2={toScreenY(curY)}
            stroke="#f43f5e"
            strokeWidth="2"
            opacity="0.85"
          />
          <line
            x1={toScreenX(f2X)}
            y1={toScreenY(f2Y)}
            x2={toScreenX(curX)}
            y2={toScreenY(curY)}
            stroke="#f43f5e"
            strokeWidth="2"
            opacity="0.85"
          />

          {/* Focus 1 Point */}
          <circle cx={toScreenX(f1X)} cy={toScreenY(f1Y)} r="5" fill="#e2e8f0" stroke="#f43f5e" strokeWidth="1.5" />
          <text x={toScreenX(f1X)} y={toScreenY(f1Y) + 18} fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
            F₁(-{c.toFixed(1)}, 0)
          </text>

          {/* Focus 2 Point */}
          <circle cx={toScreenX(f2X)} cy={toScreenY(f2Y)} r="5" fill="#e2e8f0" stroke="#f43f5e" strokeWidth="1.5" />
          <text x={toScreenX(f2X)} y={toScreenY(f2Y) + 18} fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">
            F₂( {c.toFixed(1)}, 0)
          </text>

          {/* Tracer Peg M */}
          <g>
            <circle cx={toScreenX(curX)} cy={toScreenY(curY)} r="6" fill="#06b6d4" />
            <circle cx={toScreenX(curX)} cy={toScreenY(curY)} r="12" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
            <text x={toScreenX(curX) + 10} y={toScreenY(curY) - 10} fill="#22d3ee" fontSize="11" fontWeight="bold">
              M({curX.toFixed(2)}, {curY.toFixed(2)})
            </text>
          </g>
        </svg>

        {/* Dynamic Locus Info Display */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', lineHeight: '1.6' }}>
          <div style={{ borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '6px', fontWeight: 'bold', color: '#06b6d4' }}>
            Định nghĩa Elip (Quỹ tích):
          </div>
          <div>Bán trục lớn (a): <b>{a.toFixed(1)}</b></div>
          <div>Bán trục nhỏ (b): <b>{b.toFixed(2)}</b></div>
          <div>Tiêu cự (2c): <b>{(2 * c).toFixed(1)}</b></div>
          <div style={{ marginTop: '6px', color: '#f43f5e', borderTop: '1px dashed #334155', paddingTop: '6px' }}>
            MF₁ (d₁) = {d1.toFixed(2)}
          </div>
          <div style={{ color: '#f43f5e' }}>
            MF₂ (d₂) = {d2.toFixed(2)}
          </div>
          <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold', marginTop: '2px' }}>
            d₁ + d₂ = {sumD.toFixed(2)} (= 2a = {(2 * a).toFixed(1)})
          </div>
        </div>
    </div>
  );
}
