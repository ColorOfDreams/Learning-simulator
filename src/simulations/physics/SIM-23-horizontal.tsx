import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface TrajectoryPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
}

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';
const _Y = new THREE.Vector3(0, 1, 0);

function cssColor(hex: number): string {
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function drawRich(g: CanvasRenderingContext2D, text: string, x: number, y: number, fs: number, color: string, align: 'left' | 'right' | 'center' = 'left') {
  const parts: Array<{ s: string; sub: boolean }> = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '_') {
      i++;
      let sub = '';
      if (text[i] === '{') {
        const e = text.indexOf('}', i);
        const end = e < 0 ? text.length : e;
        sub = text.slice(i + 1, end);
        i = e < 0 ? text.length : e + 1;
      } else {
        sub = text[i] || '';
        i++;
      }
      parts.push({ s: sub, sub: true });
    } else {
      let j = i;
      while (j < text.length && text[j] !== '_') j++;
      parts.push({ s: text.slice(i, j), sub: false });
      i = j;
    }
  }
  const subFs = Math.round(fs * 0.68);
  const subDy = fs * 0.16;
  let w = 0;
  for (const p of parts) {
    g.font = `bold ${p.sub ? subFs : fs}px ${PHYS_FONT}`;
    w += g.measureText(p.s).width;
  }
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  const prev = g.textAlign;
  g.textAlign = 'left';
  g.fillStyle = color;
  for (const p of parts) {
    g.font = `bold ${p.sub ? subFs : fs}px ${PHYS_FONT}`;
    g.fillText(p.s, cx, y + (p.sub ? subDy : 0));
    cx += g.measureText(p.s).width;
  }
  g.textAlign = prev;
}

function drawStats(
  panel: any,
  defs: Array<{ key: string; label: string; unit?: string }>,
  vals: Record<string, string>
) {
  const g = panel.g;
  const W = panel.W;
  const H = panel.H;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#0e1f33';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#3a5f86';
  g.lineWidth = 5;
  g.strokeRect(4, 4, W - 8, H - 8);
  g.fillStyle = '#bfe0ff';
  g.textAlign = 'left';
  g.font = `bold 38px ${PHYS_FONT}`;
  g.fillText('📊 Thông số', 26, 56);
  let y = 104;
  for (const d of defs) {
    drawRich(g, d.label, 28, y, 26, '#9fc0de', 'left');
    const v = (vals[d.key] != null ? vals[d.key] : '–') + (d.unit ? (' ' + d.unit) : '');
    const big = v.length <= 12;
    g.fillStyle = '#ffffff';
    g.font = `bold ${big ? 42 : 28}px ${PHYS_FONT}`;
    g.fillText(v, 28, y + (big ? 46 : 42));
    g.strokeStyle = '#223c56';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(24, y + 64);
    g.lineTo(W - 24, y + 64);
    g.stroke();
    y += 84;
  }
  panel.flush();
}

function makeLabelSprite(text: string, color: number) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const g = c.getContext('2d')!;
  const col = cssColor(color);
  g.fillStyle = 'rgba(8, 16, 28, 0.86)';
  rr(g, 3, 3, 250, 90, 18);
  g.fill();
  g.strokeStyle = col;
  g.lineWidth = 5;
  rr(g, 3, 3, 250, 90, 18);
  g.stroke();
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `bold 54px ${PHYS_FONT}`;
  g.fillStyle = col;
  g.fillText(text, 128, 52);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
  );
  s.scale.set(1.35, 0.5, 1);
  s.renderOrder = 31;
  return s;
}

export default function HorizontalSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  onAnimationEnd,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const h = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'h');
    return p ? p.value : 8;
  }, [config.parameters]);

  const v0 = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'v0');
    return p ? p.value : 5;
  }, [config.parameters]);

  const gVal = 9.8; // default gravity

  // Pre-calculate trajectory
  const trajectory = useMemo<TrajectoryPoint[]>(() => {
    const points: TrajectoryPoint[] = [];
    const tFlight = Math.sqrt((2 * h) / gVal);
    const steps = 300;
    const dt = tFlight / steps;

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const x = v0 * t;
      const y = h - 0.5 * gVal * t * t;
      points.push({
        x,
        y: Math.max(0, y),
        vx: v0,
        vy: -gVal * t,
        t,
      });
    }
    return points;
  }, [h, v0]);

  const stats = useMemo(() => {
    const tFlight = Math.sqrt((2 * h) / gVal);
    const maxRange = v0 * tFlight;
    return { maxRange, tFlight };
  }, [h, v0]);

  const stateRef = useRef({
    t: 0,
    done: false,
    pts: [] as THREE.Vector3[],
    impactTime: -1,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    onAnimationEnd,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.onAnimationEnd = onAnimationEnd;
  }, [isPlaying, isSlow, onAnimationEnd]);

  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.done = false;
    stateRef.current.pts = [];
    stateRef.current.impactTime = -1;
  }, [h, v0, resetKey]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Create Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.5, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 2.5, 0);
    controls.minDistance = 6;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // ── 2. Add Lighting ──
    const hemi = new THREE.HemisphereLight(0xdcecff, 0x2a3744, 0.95);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ── 3. Floor & Grid ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x16222f, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(80, 80, 0x355072, 0x1f3147);
    grid.position.y = 0;
    scene.add(grid);

    // ── 4. Table (Adjustable Height h) ──
    const tableGroup = new THREE.Group();
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.3, 2),
      new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 0.8 })
    );
    tableTop.position.set(-9.5, h - 0.15, -1);
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    // Table legs supporting from ground to h
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2c1e12, roughness: 0.7 });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h - 0.3, 8), legMat);
    leg1.position.set(-10.8, (h - 0.3) / 2, -1.6);
    leg1.castShadow = true;
    tableGroup.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h - 0.3, 8), legMat);
    leg2.position.set(-10.8, (h - 0.3) / 2, -0.4);
    leg2.castShadow = true;
    tableGroup.add(leg2);
    const leg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h - 0.3, 8), legMat);
    leg3.position.set(-8.2, (h - 0.3) / 2, -1.6);
    leg3.castShadow = true;
    tableGroup.add(leg3);
    const leg4 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h - 0.3, 8), legMat);
    leg4.position.set(-8.2, (h - 0.3) / 2, -0.4);
    leg4.castShadow = true;
    tableGroup.add(leg4);
    scene.add(tableGroup);

    // ── 5. Projectile Ball ──
    const ballRadius = 0.35;
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 32, 24),
      new THREE.MeshStandardMaterial({ color: 0xff5252, roughness: 0.4 })
    );
    ball.castShadow = true;
    scene.add(ball);

    const startX = -8;
    ball.position.set(startX, h + ballRadius, -1);

    // Dynamic Trail
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0xffd54a, linewidth: 3 });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);

    // Landing ripple rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd54a, side: THREE.DoubleSide });
    const ripple = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.85, 32), ringMat);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.set(startX + stats.maxRange, 0.02, -1);
    ripple.visible = false;
    scene.add(ripple);

    // ── 6. Vector Arrow ──
    const makeVectorArrow = (color: number, label: string) => {
      const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 12), mat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 16), mat);
      const gGroup = new THREE.Group();
      gGroup.add(shaft);
      gGroup.add(head);
      gGroup.renderOrder = 30;
      shaft.renderOrder = 30;
      head.renderOrder = 30;
      scene.add(gGroup);
      const lab = makeLabelSprite(label, color);
      scene.add(lab);

      return {
        g: gGroup,
        label: lab,
        set(dir: THREE.Vector3, len: number, origin: THREE.Vector3) {
          if (len < 0.05) {
            gGroup.visible = false;
            lab.visible = false;
            return;
          }
          gGroup.visible = true;
          lab.visible = true;
          len = Math.max(len, 0.35);
          const d = dir.clone().normalize();
          gGroup.position.copy(origin);
          gGroup.quaternion.setFromUnitVectors(_Y, d);
          const hl = Math.min(0.4, len * 0.4), sl = Math.max(0.05, len - hl);
          shaft.scale.y = sl;
          shaft.position.y = sl / 2;
          head.scale.set(1, hl / 0.35, 1);
          head.position.y = sl + hl / 2;
          lab.position.copy(gGroup.position).addScaledVector(d, len + 0.4);
        },
        dispose() {
          scene.remove(gGroup);
          scene.remove(lab);
          shaft.geometry.dispose();
          head.geometry.dispose();
          mat.dispose();
        }
      };
    };

    const vArrow = makeVectorArrow(0x5ee1a0, 'v');

    // ── 7. Stats Panel ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 320) => {
      const c = document.createElement('canvas');
      c.width = px;
      c.height = py;
      const gCtx = c.getContext('2d')!;
      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      const worldH = worldW * py / px;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(worldW, worldH),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
      );
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(worldW + 0.2, worldH + 0.2, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x12203a, roughness: 0.6 })
      );
      back.position.z = -0.05;
      const grp = new THREE.Group();
      grp.add(back);
      grp.add(mesh);
      grp.position.set(x, y, z);
      scene.add(grp);

      return {
        c,
        g: gCtx,
        tex,
        W: px,
        H: py,
        grp,
        flush() {
          tex.needsUpdate = true;
        },
        dispose() {
          scene.remove(grp);
          back.geometry.dispose();
          mesh.geometry.dispose();
          tex.dispose();
        }
      };
    };

    const roDefs = [
      { key: 't', label: 't (thời gian)', unit: 's' },
      { key: 'x', label: 'x (tầm xa)', unit: 'm' },
      { key: 'y', label: 'y (độ cao)', unit: 'm' },
      { key: 'v', label: 'v (vận tốc)', unit: 'm/s' },
      { key: 'L', label: 'L (tầm xa lý thuyết)', unit: 'm' }
    ];
    const statsPanel = makePanel(-6.7, 5.0, -1, 4.6, 560, 380);

    // ── 8. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      statsPanel.grp.lookAt(camera.position);
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      dt = Math.min(dt, 0.05);

      const state = stateRef.current;
      const { isPlaying: activePlaying, isSlow: activeSlow, onAnimationEnd: activeOnAnimEnd } = refs.current;

      if (activePlaying && !state.done) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;
        let t = state.t;

        if (t >= stats.tFlight) {
          t = stats.tFlight;
          state.done = true;
          state.impactTime = 0.5;
          if (activeOnAnimEnd) activeOnAnimEnd();
        }

        // Find trajectory point
        let currentPt = trajectory[0];
        for (let i = 0; i < trajectory.length; i++) {
          if (trajectory[i].t >= t) {
            currentPt = trajectory[i];
            break;
          }
        }

        const bX = startX + currentPt.x;
        const bY = currentPt.y + ballRadius;
        ball.position.set(bX, bY, -1);

        state.pts.push(new THREE.Vector3(bX, bY, -1));
        if (state.pts.length > 1) {
          trailGeo.setFromPoints(state.pts);
        }

        // Velocity vector arrow
        const spd = Math.sqrt(currentPt.vx * currentPt.vx + currentPt.vy * currentPt.vy);
        vArrow.set(new THREE.Vector3(currentPt.vx, currentPt.vy, 0), spd * 0.25, new THREE.Vector3(bX, bY, -1));

        // Stats Panel
        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          x: currentPt.x.toFixed(2),
          y: currentPt.y.toFixed(2),
          v: spd.toFixed(2),
          L: stats.maxRange.toFixed(2)
        });
      } else if (!activePlaying && state.t === 0) {
        ball.position.set(startX, h + ballRadius, -1);
        vArrow.set(new THREE.Vector3(1, 0, 0), v0 * 0.25, new THREE.Vector3(startX, h + ballRadius, -1));
        trailGeo.setFromPoints([]);
        ripple.visible = false;

        drawStats(statsPanel, roDefs, {
          t: '0.00',
          x: '0.00',
          y: h.toFixed(2),
          v: v0.toFixed(2),
          L: stats.maxRange.toFixed(2)
        });
      } else {
        // Paused or finished, animate impact ripple
        if (state.impactTime > 0) {
          state.impactTime -= dt;
          ripple.visible = true;
          const scale = 1.0 + (0.5 - state.impactTime) * 4.5;
          ripple.scale.set(scale, scale, 1);
          if (state.impactTime <= 0) {
            ripple.visible = false;
          }
        }

        let currentPt = trajectory[trajectory.length - 1];
        for (let i = 0; i < trajectory.length; i++) {
          if (trajectory[i].t >= state.t) {
            currentPt = trajectory[i];
            break;
          }
        }
        const spd = Math.sqrt(currentPt.vx * currentPt.vx + currentPt.vy * currentPt.vy);
        drawStats(statsPanel, roDefs, {
          t: state.t.toFixed(2),
          x: currentPt.x.toFixed(2),
          y: currentPt.y.toFixed(2),
          v: spd.toFixed(2),
          L: stats.maxRange.toFixed(2)
        });
      }

      controls.update();
      render();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // ── 9. Resizing ──
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: hVal } = entry.contentRect;
        renderer.setSize(w, hVal);
        camera.aspect = w / hVal;
        camera.updateProjectionMatrix();
        render();
      }
    });
    resizeObserver.observe(mountRef.current);

    // ── 10. Cleanup ──
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      statsPanel.dispose();
      vArrow.dispose();
      ball.geometry.dispose();
      (ball.material as THREE.Material).dispose();
      tableTop.geometry.dispose();
      (tableTop.material as THREE.Material).dispose();
      legMat.dispose();
      leg1.geometry.dispose();
      leg2.geometry.dispose();
      leg3.geometry.dispose();
      leg4.geometry.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      ripple.geometry.dispose();
      ringMat.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [h, v0, resetKey]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: '18px',
        overflow: 'hidden',
      }}
    />
  );
}
