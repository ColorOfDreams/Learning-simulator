import { useState, useEffect, useRef } from 'react';
import type { SimulationProps } from '../types';

export default function ProjectileArchSimulation({
  config,
  isPlaying = false,
  onAnimationEnd,
}: SimulationProps) {
  const params = config.parameters;
  const v0 = params.find(p => p.key === 'v0')?.value ?? 15;
  const alpha = params.find(p => p.key === 'alpha')?.value ?? 45;
  const g = params.find(p => p.key === 'g')?.value ?? 9.8;

  const [t, setT] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [status, setStatus] = useState<'idle' | 'flying' | 'success' | 'fail'>('idle');
  const animationRef = useRef<number | null>(null);

  const width = 600;
  const height = 400;
  const scale = 25; // pixels per unit
  const originX = 50; // shift to the left
  const originY = height - 50; // shift down

  const toScreenX = (x: number) => originX + x * scale;
  const toScreenY = (y: number) => originY - y * scale;

  // The gate equation: y = -0.25 * (x - 8)^2 + 9, spanning x in [2, 14]
  // Gate peak is at x = 8, y = 9. Arch starts at x = 2, ends at x = 14.
  const getGateY = (x: number) => {
    if (x < 2 || x > 14) return 0;
    return -0.25 * Math.pow(x - 8, 2) + 9;
  };

  // Generate Arch Gate SVG Path
  const archOuterPath = (() => {
    const pts: string[] = [];
    for (let x = 1.6; x <= 14.4; x += 0.2) {
      // Outer arch is slightly taller/wider
      const y = -0.27 * Math.pow(x - 8, 2) + 9.8;
      pts.push(`${toScreenX(x)},${toScreenY(y)}`);
    }
    return pts.join(' ');
  })();

  const archInnerPath = (() => {
    const pts: string[] = [];
    for (let x = 14; x >= 2; x -= 0.2) {
      const y = getGateY(x);
      pts.push(`${toScreenX(x)},${toScreenY(y)}`);
    }
    return pts.join(' ');
  })();

  // Reset projectile on config/play changes
  useEffect(() => {
    if (!isPlaying) {
      setT(0);
      setTrail([]);
      setStatus('idle');
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      setT(0);
      setTrail([]);
      setStatus('flying');
    }
  }, [isPlaying, v0, alpha, g]);

  // Physics animation loop
  useEffect(() => {
    if (status !== 'flying') return;

    const rad = (alpha * Math.PI) / 180;
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);

    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000; // seconds
      const currentT = elapsed * 1.5; // speed up animation slightly

      const curX = 2 + vx * currentT;
      const curY = vy * currentT - 0.5 * g * currentT * currentT;

      const gateY = getGateY(curX);

      // Check for collision with the arch boundary
      // The arch wall thickness is between getGateY(x) and the outer boundary
      const outerY = -0.27 * Math.pow(curX - 8, 2) + 9.8;
      let hit = false;
      if (curX >= 1.6 && curX <= 14.4) {
        if (curY >= gateY && curY <= outerY) {
          hit = true;
        }
      }

      if (hit) {
        setStatus('fail');
        if (onAnimationEnd) onAnimationEnd();
        return;
      }

      // Check for success or hitting the ground
      if (curY < 0 || curX > 20) {
        // Evaluate if the trajectory matched the vòm arch
        // The ideal match parameters: alpha ~ 71.6, v0 ~ 14
        const isAngleMatch = Math.abs(alpha - 71.6) <= 2;
        const isSpeedMatch = Math.abs(v0 - 14.0) <= 0.8;

        if (isAngleMatch && isSpeedMatch) {
          setStatus('success');
        } else {
          setStatus('fail');
        }

        if (onAnimationEnd) onAnimationEnd();
        return;
      }

      setT(currentT);
      setTrail(prev => [...prev, { x: toScreenX(curX), y: toScreenY(curY) }]);
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [status, v0, alpha, g]);

  const rad = (alpha * Math.PI) / 180;
  const currentX = 2 + v0 * Math.cos(rad) * t;
  const currentY = v0 * Math.sin(rad) * t - 0.5 * g * t * t;

  return (
    <div style={{ width: '100%', height: '100%', padding: '16px', background: '#0f172a', borderRadius: '18px', display: 'flex', flexDirection: 'column', color: '#fff', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, position: 'relative', border: '1px solid #334155', borderRadius: '12px', background: '#020617', overflow: 'hidden' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Ground */}
          <line x1={0} y1={originY} x2={width} y2={originY} stroke="#475569" strokeWidth="3" />

          {/* Parabolic Arch Gateway (Drawn in stone gray) */}
          <path
            d={`M ${toScreenX(1.6)} ${originY} L ${archOuterPath} L ${toScreenX(14.4)} ${originY} L ${toScreenX(14)} ${originY} L ${archInnerPath} L ${toScreenX(2)} ${originY} Z`}
            fill="#334155"
            stroke="#475569"
            strokeWidth="1"
            opacity="0.85"
          />
          {/* Arch Gate Title */}
          <text x={toScreenX(8)} y={toScreenY(10.5)} fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold">
            CỔNG PARABOL (Cao: 9m, Rộng: 12m)
          </text>

          {/* Launching pad */}
          <circle cx={toScreenX(2)} cy={toScreenY(0)} r="8" fill="#e2e8f0" />
          <line
            x1={toScreenX(2)}
            y1={toScreenY(0)}
            x2={toScreenX(2 + 1.2 * Math.cos(rad))}
            y2={toScreenY(1.2 * Math.sin(rad))}
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Traced path */}
          {trail.length > 1 && (
            <path
              d={`M ${trail.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Target trajectory (Ideal trajectory in faint green) */}
          <path
            d={`M ${toScreenX(2)} ${toScreenY(0)} Q ${toScreenX(8)} ${toScreenY(9)} ${toScreenX(14)} ${toScreenY(0)}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.5"
            opacity="0.25"
          />

          {/* Projectile ball */}
          {status === 'flying' && currentY >= 0 && (
            <circle cx={toScreenX(currentX)} cy={toScreenY(currentY)} r="6" fill="#ef4444" />
          )}

          {/* Collision explosion effect */}
          {status === 'fail' && currentY > 0.1 && (
            <g transform={`translate(${toScreenX(currentX)}, ${toScreenY(currentY)})`}>
              <circle cx="0" cy="0" r="14" fill="#ef4444" opacity="0.4" />
              <circle cx="0" cy="0" r="8" fill="#f59e0b" />
              <text x="0" y="4" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">💥</text>
            </g>
          )}
        </svg>

        {/* Victory and Fail banners */}
        {status === 'success' && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '16px 24px', background: 'rgba(16, 185, 129, 0.95)', border: '2px solid #34d399', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '18px' }}>🎉 THÀNH CÔNG!</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#ecfdf5' }}>Quỹ đạo ném xiên đã trùng khớp hoàn hảo với vòm cổng parabol!</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a7f3d0', fontFamily: 'monospace' }}>
              Thông số tối ưu: v₀ = 14.0 m/s, θ = 71.6°
            </p>
          </div>
        )}

        {status === 'fail' && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '10px 16px', background: 'rgba(239, 68, 68, 0.9)', border: '1px solid #f87171', borderRadius: '8px', fontSize: '12px' }}>
            ❌ Lệch quỹ đạo. Điều chỉnh lại thông số!
          </div>
        )}

        {/* Informative indicators */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', fontSize: '12px', border: '1px solid #334155' }}>
          <div>Vận tốc đầu: <b>{v0} m/s</b></div>
          <div>Góc ném: <b>{alpha}°</b></div>
          <div>Quỹ đạo bay: {status === 'idle' ? 'Sẵn sàng' : status === 'flying' ? 'Đang bay...' : status === 'success' ? 'Chính xác!' : 'Không khớp'}</div>
        </div>
      </div>
    </div>
  );
}
