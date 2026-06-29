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

export default function ProjectileSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  onAnimationEnd,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const angle = useMemo(() => {
    const p = config.parameters.find(x => ['theta', 'angle'].includes(x.key));
    return p ? p.value : 45;
  }, [config.parameters]);

  const velocity = useMemo(() => {
    const p = config.parameters.find(x => ['v0', 'velocity'].includes(x.key));
    return p ? p.value : 10;
  }, [config.parameters]);

  const gVal = useMemo(() => {
    const p = config.parameters.find(x => ['g', 'gravity'].includes(x.key));
    return p ? p.value : 9.8;
  }, [config.parameters]);

  const airResistance = useMemo(() => {
    const p = config.parameters.find(x => ['airResistance', 'air'].includes(x.key));
    return p ? p.value === 1 : false;
  }, [config.parameters]);

  const showVectors = useMemo(() => {
    const p = config.parameters.find(x => ['showVectors', 'vectors'].includes(x.key));
    return p ? p.value === 1 : true;
  }, [config.parameters]);

  // Pre-calculate trajectory
  const trajectory = useMemo<TrajectoryPoint[]>(() => {
    const points: TrajectoryPoint[] = [];
    const rad = (angle * Math.PI) / 180;

    if (!airResistance) {
      const vx0 = velocity * Math.cos(rad);
      const vy0 = velocity * Math.sin(rad);
      const tFlight = gVal > 0 ? (2 * vy0) / gVal : 0;
      const totalT = tFlight > 0 ? tFlight : 2;
      const steps = 300;
      const dt = totalT / steps;

      for (let i = 0; i <= steps; i++) {
        const t = i * dt;
        const x = vx0 * t;
        const y = vy0 * t - 0.5 * gVal * t * t;
        if (y < 0 && i > 0) {
          points.push({
            x: vx0 * tFlight,
            y: 0,
            vx: vx0,
            vy: vy0 - gVal * tFlight,
            t: tFlight,
          });
          break;
        }
        points.push({ x, y: Math.max(0, y), vx: vx0, vy: vy0 - gVal * t, t });
      }
    } else {
      let x = 0;
      let y = 0;
      let vx = velocity * Math.cos(rad);
      let vy = velocity * Math.sin(rad);
      let t = 0;
      const dt = 0.002;
      const k = 0.15; // drag coefficient
      points.push({ x, y, vx, vy, t });

      while (t < 30) {
        const ax = -k * vx;
        const ay = -gVal - k * vy;
        x += vx * dt;
        y += vy * dt;
        vx += ax * dt;
        vy += ay * dt;
        t += dt;

        if (y < 0) {
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
  }, [angle, velocity, gVal, airResistance]);

  const stats = useMemo(() => {
    let maxX = 0.1;
    let maxY = 0.1;
    let flightTime = 0;
    for (const p of trajectory) {
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
      if (p.t > flightTime) flightTime = p.t;
    }
    return { maxX, maxY, flightTime };
  }, [trajectory]);

  // Keep references for loop
  const stateRef = useRef({
    t: 0,
    done: false,
    pts: [] as THREE.Vector3[],
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    onAnimationEnd,
  });

  // Keep refs in sync
  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.onAnimationEnd = onAnimationEnd;
  }, [isPlaying, isSlow, onAnimationEnd]);

  // Reset physics states when parameters or reset key change
  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.done = false;
    stateRef.current.pts = [];
  }, [angle, velocity, gVal, airResistance, resetKey]);

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
    dirLight.shadow.mapSize.set(1024, 1024);
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

    // ── 4. Projectile ball & launch pad ──
    const ballRadius = 0.32;
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 32, 24),
      new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.4 })
    );
    ball.castShadow = true;
    scene.add(ball);

    // Gantry/base
    const launcher = new THREE.Group();
    const launcherBase = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 1), new THREE.MeshStandardMaterial({ color: 0x37474f }));
    launcherBase.position.y = 0.15;
    launcherBase.receiveShadow = true;
    launcher.add(launcherBase);
    launcher.position.set(-8, 0, -1);
    scene.add(launcher);

    const startX = -8;
    ball.position.set(startX, ballRadius, -1);

    // Dynamic Trail
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0x7cc4ff, linewidth: 3 });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);

    // ── 5. Vector Arrow ──
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

    // ── 6. Graph Panels ──
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
      { key: 'v', label: 'v (vận tốc)', unit: 'm/s' }
    ];
    const statsPanel = makePanel(-6.7, 5.0, -1, 4.6, 560, 332);

    // ── 7. Animation Loop & Tick ──
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

        if (t >= stats.flightTime) {
          t = stats.flightTime;
          state.done = true;
          if (activeOnAnimEnd) activeOnAnimEnd();
        }

        // Find current point along pre-calculated trajectory
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

        // Add trail points
        state.pts.push(new THREE.Vector3(bX, bY, -1));
        if (state.pts.length > 1) {
          trailGeo.setFromPoints(state.pts);
        }

        // Velocity vector arrow
        const spd = Math.sqrt(currentPt.vx * currentPt.vx + currentPt.vy * currentPt.vy);
        if (showVectors) {
          vArrow.set(new THREE.Vector3(currentPt.vx, currentPt.vy, 0), spd * 0.25, new THREE.Vector3(bX, bY, -1));
        } else {
          vArrow.set(new THREE.Vector3(0, 0, 0), 0, new THREE.Vector3(bX, bY, -1));
        }

        // Stats Panel
        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          x: currentPt.x.toFixed(2),
          y: currentPt.y.toFixed(2),
          v: spd.toFixed(2)
        });
      } else if (!activePlaying && state.t === 0) {
        // Reset state
        ball.position.set(startX, ballRadius, -1);
        vArrow.set(new THREE.Vector3(0, 0, 0), 0, new THREE.Vector3(startX, ballRadius, -1));
        trailGeo.setFromPoints([]);

        drawStats(statsPanel, roDefs, {
          t: '0.00',
          x: '0.00',
          y: '0.00',
          v: velocity.toFixed(2)
        });
      } else {
        // Paused, display constant values
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
          v: spd.toFixed(2)
        });
      }

      controls.update();
      render();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // ── 8. Resizing ──
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

    // ── 9. Cleanup ──
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
      launcherBase.geometry.dispose();
      (launcherBase.material as THREE.Material).dispose();
      trailGeo.dispose();
      trailMat.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [angle, velocity, gVal, airResistance, showVectors, resetKey]);

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
