import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { SimulationProps, SimulationParam } from '../types';

interface TrajectoryPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

const getParam = (parameters: SimulationParam[], keys: string[], defaultValue: number): number => {
  const param = parameters.find(p => keys.includes(p.key));
  return param ? param.value : defaultValue;
};

export default function ProjectileSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  onAnimationEnd,
}: SimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });

  // Extract parameters
  const angle = getParam(config.parameters, ['theta', 'angle'], 45);
  const velocity = getParam(config.parameters, ['v0', 'velocity'], 20);
  const g = getParam(config.parameters, ['g', 'gravity'], 9.8);
  const airResistance = getParam(config.parameters, ['airResistance', 'air'], 0) === 1;
  const showVectors = getParam(config.parameters, ['showVectors', 'vectors'], 1) === 1;

  // Track animation time
  const animationTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 220),
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute Trajectory
  const trajectory = useMemo<TrajectoryPoint[]>(() => {
    const points: TrajectoryPoint[] = [];
    const rad = (angle * Math.PI) / 180;

    if (!airResistance) {
      const vx0 = velocity * Math.cos(rad);
      const vy0 = velocity * Math.sin(rad);
      const tFlight = g > 0 ? (2 * vy0) / g : 0;
      
      const totalT = tFlight > 0 ? tFlight : 2;
      const steps = 300;
      const dt = totalT / steps;

      for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        const x = vx0 * t;
        const y = vy0 * t - 0.5 * g * t * t;
        
        if (y < 0 && i > 0) {
          // Add precise landing point
          points.push({
            x: vx0 * tFlight,
            y: 0,
            vx: vx0,
            vy: vy0 - g * tFlight,
            t: tFlight,
          });
          break;
        }
        
        points.push({
          x,
          y: Math.max(0, y),
          vx: vx0,
          vy: vy0 - g * t,
          t,
        });
      }
    } else {
      // Numerical integration for air resistance (linear drag F_drag = -k * v)
      let x = 0;
      let y = 0;
      let vx = velocity * Math.cos(rad);
      let vy = velocity * Math.sin(rad);
      let t = 0;
      const dt = 0.002; // Small step size for stability
      const k = 0.15;   // Drag coefficient (realistic value)

      points.push({ x, y, vx, vy, t });

      while (t < 30) {
        const ax = -k * vx;
        const ay = -g - k * vy;

        x += vx * dt;
        y += vy * dt;
        vx += ax * dt;
        vy += ay * dt;
        t += dt;

        if (y < 0) {
          // Precise interpolation to ground (y=0)
          const ratio = -y / (vy * dt);
          points.push({
            x: x + vx * dt * ratio,
            y: 0,
            vx,
            vy,
            t,
          });
          break;
        }
        points.push({ x, y, vx, vy, t });
      }
    }

    return points;
  }, [angle, velocity, g, airResistance]);

  // Find max range and max height for viewport scaling
  const stats = useMemo(() => {
    let maxX = 0.1;
    let maxY = 0.1;
    let flightTime = 0;

    for (const p of trajectory) {
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
      if (p.t > flightTime) flightTime = p.t;
    }
    
    // Also check standard theoretical peak just in case
    const rad = (angle * Math.PI) / 180;
    const peakH = Math.pow(velocity * Math.sin(rad), 2) / (2 * g);
    if (peakH > maxY) maxY = peakH;

    return { maxX, maxY, flightTime };
  }, [trajectory, angle, velocity, g]);

  // Handle Play/Pause reset on param change
  useEffect(() => {
    animationTimeRef.current = 0;
    lastTimeRef.current = null;
  }, [angle, velocity, g, airResistance]);

  // Main Draw & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const width = dimensions.width;
    const height = dimensions.height;

    // Margin configuration
    const paddingLeft = 55;
    const paddingRight = 35;
    const paddingTop = 45;
    const paddingBottom = 45;

    // Grid Scaling
    const maxDimX = Math.max(stats.maxX, 8);
    const maxDimY = Math.max(stats.maxY, 4);

    const scaleX = (width - paddingLeft - paddingRight) / maxDimX;
    const scaleY = (height - paddingTop - paddingBottom) / maxDimY;
    const scale = Math.min(scaleX, scaleY);

    // Physics -> Canvas mapping
    const toCanvasX = (physX: number) => paddingLeft + physX * scale;
    const toCanvasY = (physY: number) => height - paddingBottom - physY * scale;

    const render = (time: number) => {
      // Find current point along trajectory
      let currentPoint = trajectory[0];
      if (time >= stats.flightTime) {
        currentPoint = trajectory[trajectory.length - 1];
      } else {
        // Find closest point by time
        for (let i = 0; i < trajectory.length; i++) {
          if (trajectory[i].t >= time) {
            currentPoint = trajectory[i];
            break;
          }
        }
      }

      // Clear
      ctx.clearRect(0, 0, width, height);

      // ── Grid Background ──
      ctx.strokeStyle = '#e8e6e0';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#8c8a82';
      ctx.font = '10px Menlo, monospace';

      // Decide Grid intervals
      let step = 5;
      if (maxDimX <= 15) step = 2;
      else if (maxDimX <= 40) step = 5;
      else if (maxDimX <= 100) step = 10;
      else step = 25;

      // Vertical lines (Distance)
      for (let x = 0; x <= maxDimX; x += step) {
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, paddingTop - 10);
        ctx.lineTo(cx, height - paddingBottom);
        ctx.stroke();
        
        ctx.fillText(`${x}m`, cx - 10, height - paddingBottom + 16);
      }

      // Horizontal lines (Height)
      for (let y = 0; y <= maxDimY; y += step) {
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, cy);
        ctx.lineTo(width - paddingRight + 10, cy);
        ctx.stroke();

        ctx.fillText(`${y}m`, paddingLeft - 32, cy + 4);
      }

      // ── Ground Line ──
      ctx.strokeStyle = '#6a6862';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(paddingLeft - 10, height - paddingBottom);
      ctx.lineTo(width - paddingRight + 20, height - paddingBottom);
      ctx.stroke();

      // ── Theoretical Max Range & Max Height Marker ──
      ctx.strokeStyle = 'rgba(106, 104, 98, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Peak vertical marker
      const peakX = stats.maxX / 2; // Approximate peak position for simple marker
      let peakY = stats.maxY;
      
      // Look for maximum Y point in computed trajectory
      const maxPt = trajectory.reduce((max, p) => p.y > max.y ? p : max, trajectory[0]);
      
      ctx.beginPath();
      ctx.moveTo(toCanvasX(maxPt.x), toCanvasY(maxPt.y));
      ctx.lineTo(toCanvasX(maxPt.x), toCanvasY(0));
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Peak height text label
      ctx.fillStyle = '#444';
      ctx.fillText(`H_max = ${maxPt.y.toFixed(1)}m`, toCanvasX(maxPt.x) - 30, toCanvasY(maxPt.y) - 8);

      // Trajectory Trail
      ctx.strokeStyle = 'oklch(0.58 0.15 262 / 0.55)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0), toCanvasY(0));
      for (let i = 1; i < trajectory.length; i++) {
        ctx.lineTo(toCanvasX(trajectory[i].x), toCanvasY(trajectory[i].y));
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Cannon/Launch Pad ──
      ctx.save();
      ctx.translate(toCanvasX(0), toCanvasY(0));
      ctx.rotate(- (angle * Math.PI) / 180);
      ctx.fillStyle = '#6a6862';
      ctx.fillRect(0, -5, 24, 10);
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── Projectile Ball ──
      const bx = toCanvasX(currentPoint.x);
      const by = toCanvasY(currentPoint.y);
      
      ctx.fillStyle = 'oklch(0.58 0.15 262)';
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Velocity Vectors ──
      if (showVectors && time < stats.flightTime) {
        const scaleVel = 2.5; // velocity arrow scale factor
        const vx = currentPoint.vx * scaleVel;
        const vy = currentPoint.vy * scaleVel;

        // Resultant vector (v)
        ctx.strokeStyle = 'oklch(0.58 0.15 262)';
        ctx.lineWidth = 2;
        drawArrow(ctx, bx, by, bx + vx, by - vy);
        ctx.fillStyle = 'oklch(0.58 0.15 262)';
        ctx.fillText('v', bx + vx + 4, by - vy - 4);

        // Horizontal component (vx)
        ctx.strokeStyle = 'rgba(235, 94, 40, 0.9)'; // orange
        ctx.lineWidth = 1.5;
        drawArrow(ctx, bx, by, bx + vx, by);
        ctx.fillStyle = 'rgba(235, 94, 40, 0.9)';
        ctx.fillText('vx', bx + vx - 10, by - 6);

        // Vertical component (vy)
        ctx.strokeStyle = 'rgba(46, 117, 89, 0.9)'; // green
        ctx.lineWidth = 1.5;
        drawArrow(ctx, bx, by, bx, by - vy);
        ctx.fillStyle = 'rgba(46, 117, 89, 0.9)';
        ctx.fillText('vy', bx - 16, by - vy + 4);
      }

      // ── Stats Box HUD ──
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.strokeStyle = '#e8e6e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width - 150, 15, 135, 80, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#33322f';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('THÔNG SỐ BAY', width - 140, 30);
      ctx.font = '10px Menlo, monospace';
      ctx.fillText(`t = ${currentPoint.t.toFixed(2)}s`, width - 140, 48);
      ctx.fillText(`x = ${currentPoint.x.toFixed(1)}m`, width - 140, 62);
      ctx.fillText(`y = ${currentPoint.y.toFixed(1)}m`, width - 140, 76);
      const speed = Math.sqrt(currentPoint.vx * currentPoint.vx + currentPoint.vy * currentPoint.vy);
      ctx.fillText(`v = ${speed.toFixed(1)}m/s`, width - 140, 90);
    };

    // Helper arrow drawer
    function drawArrow(context: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
      const headlen = 6; // length of head in pixels
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angleVal = Math.atan2(dy, dx);
      
      // If arrow is extremely short, don't draw arrow head to avoid glitches
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3) return;

      context.beginPath();
      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);
      context.stroke();

      context.beginPath();
      context.moveTo(tox, toy);
      context.lineTo(tox - headlen * Math.cos(angleVal - Math.PI / 6), toy - headlen * Math.sin(angleVal - Math.PI / 6));
      context.lineTo(tox - headlen * Math.cos(angleVal + Math.PI / 6), toy - headlen * Math.sin(angleVal + Math.PI / 6));
      context.closePath();
      context.fillStyle = context.strokeStyle;
      context.fill();
    }

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      
      const elapsedReal = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // speed modifier
      const speedMultiplier = isSlow ? 0.20 : 1.0;
      animationTimeRef.current += elapsedReal * speedMultiplier;

      // End detection
      if (animationTimeRef.current >= stats.flightTime) {
        animationTimeRef.current = stats.flightTime;
        render(animationTimeRef.current);
        if (onAnimationEnd) {
          onAnimationEnd();
        }
        return; // stop ticking
      }

      render(animationTimeRef.current);
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    // Trigger initial render or resume loop
    if (isPlaying) {
      // Resume or start ticking
      if (animationTimeRef.current >= stats.flightTime) {
        animationTimeRef.current = 0; // restart
      }
      lastTimeRef.current = null;
      animationFrameIdRef.current = requestAnimationFrame(tick);
    } else {
      // Just render current frame
      render(animationTimeRef.current);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, isSlow, dimensions, trajectory, stats, angle, showVectors, onAnimationEnd]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '18px',
          background: '#faf9f5',
        }}
      />
    </div>
  );
}
