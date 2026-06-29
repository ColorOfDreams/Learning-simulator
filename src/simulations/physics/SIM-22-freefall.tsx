import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface FreefallSimulationProps extends SimulationProps {
  onStep?: (t: number, y: number, v: number) => void;
  resetKey?: number;
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

export default function FreefallSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  onAnimationEnd,
  onStep,
  resetKey = 0,
}: FreefallSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Simulation parameters
  const h = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'h');
    return p ? p.value : 9;
  }, [config.parameters]);

  const gVal = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'g');
    return p ? p.value : 9.8;
  }, [config.parameters]);

  // Keep references for loop
  const stateRef = useRef({
    t: 0,
    y: h,
    v: 0,
    landed: false,
    vpts: [] as [number, number][],
    impactTime: -1, // time since impact for visual ripple
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    h,
    gVal,
    onStep,
    onAnimationEnd,
  });

  // Keep refs in sync
  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.h = h;
    refs.current.gVal = gVal;
    refs.current.onStep = onStep;
    refs.current.onAnimationEnd = onAnimationEnd;
  }, [isPlaying, isSlow, h, gVal, onStep, onAnimationEnd]);

  // Reset physics states when parameters or reset key change
  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.y = h;
    stateRef.current.v = 0;
    stateRef.current.landed = false;
    stateRef.current.vpts = [];
    stateRef.current.impactTime = -1;
    if (refs.current.onStep) {
      refs.current.onStep(0, h, 0);
    }
  }, [h, gVal, resetKey]);

  // Reset if clicked play but already landed
  useEffect(() => {
    if (isPlaying) {
      if (stateRef.current.landed) {
        stateRef.current.t = 0;
        stateRef.current.y = h;
        stateRef.current.v = 0;
        stateRef.current.landed = false;
        stateRef.current.vpts = [];
        stateRef.current.impactTime = -1;
      }
    }
  }, [isPlaying, h]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Create Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 23);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 5.0, 0);
    controls.minDistance = 6;
    controls.maxDistance = 45;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // ── 2. Add Lighting ──
    const hemi = new THREE.HemisphereLight(0xdcecff, 0x2a3744, 0.95);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    // ── 3. Floor & Grid ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x16222f, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(80, 80, 0x355072, 0x1f3147);
    grid.position.y = 0;
    scene.add(grid);

    // ── 4. Drop Tower Structure ──
    const towerGroup = new THREE.Group();
    // Central mast
    const mast = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 13.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x2d3e50, roughness: 0.4, metalness: 0.8 })
    );
    mast.position.set(0, 6.75, -1);
    mast.castShadow = true;
    mast.receiveShadow = true;
    towerGroup.add(mast);

    // Height markers (every 1m, from 1 to 12)
    const tickMaterial = new THREE.MeshBasicMaterial({ color: 0x5a7693 });
    const ticks: THREE.Mesh[] = [];
    for (let i = 1; i <= 12; i++) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.1), tickMaterial);
      tick.position.set(0, i, -0.78);
      towerGroup.add(tick);
      ticks.push(tick);
    }
    scene.add(towerGroup);

    // Release Gantry/Bracket (slides vertically to h)
    const gantry = new THREE.Group();
    const gantryBeam = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.22, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x3e5875, roughness: 0.5, metalness: 0.7 })
    );
    gantryBeam.castShadow = true;
    gantry.add(gantryBeam);

    // Hold magnets / release cups at x = -2 and x = 2
    const magnetMat = new THREE.MeshStandardMaterial({ color: 0x1a2636, roughness: 0.3 });
    const magnetL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.2, 16), magnetMat);
    magnetL.position.set(-2, -0.15, 0);
    gantry.add(magnetL);
    const magnetR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.2, 16), magnetMat);
    magnetR.position.set(2, -0.15, 0);
    gantry.add(magnetR);
    scene.add(gantry);

    // Update gantry position initially
    gantry.position.set(0, h, -1);

    // ── 5. Falling Spheres ──
    // Ball 1: small orange-red ball (radius 0.4)
    const ball1Radius = 0.4;
    const ball1 = new THREE.Mesh(
      new THREE.SphereGeometry(ball1Radius, 32, 24),
      new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.35, metalness: 0.2 })
    );
    ball1.castShadow = true;
    ball1.position.set(-2, h + ball1Radius, -1);
    scene.add(ball1);

    // Ball 2: large blue ball (radius 0.7)
    const ball2Radius = 0.7;
    const ball2 = new THREE.Mesh(
      new THREE.SphereGeometry(ball2Radius, 32, 24),
      new THREE.MeshStandardMaterial({ color: 0x4aa3ff, roughness: 0.35, metalness: 0.2 })
    );
    ball2.castShadow = true;
    ball2.position.set(2, h + ball2Radius, -1);
    scene.add(ball2);

    // Ground impact pads
    const padMat = new THREE.MeshBasicMaterial({ color: 0x223c56, side: THREE.DoubleSide });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4aa3ff, side: THREE.DoubleSide });

    const pad1 = new THREE.Mesh(new THREE.RingGeometry(0.01, 0.8, 32), padMat);
    pad1.rotation.x = -Math.PI / 2;
    pad1.position.set(-2, 0.01, -1);
    scene.add(pad1);

    const pad2 = new THREE.Mesh(new THREE.RingGeometry(0.01, 1.1, 32), padMat);
    pad2.rotation.x = -Math.PI / 2;
    pad2.position.set(2, 0.01, -1);
    scene.add(pad2);

    // Impact ripple rings (hidden initially)
    const ripple1 = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.95, 32), ringMat);
    ripple1.rotation.x = -Math.PI / 2;
    ripple1.position.set(-2, 0.02, -1);
    ripple1.visible = false;
    scene.add(ripple1);

    const ripple2 = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.3, 32), ringMat);
    ripple2.rotation.x = -Math.PI / 2;
    ripple2.position.set(2, 0.02, -1);
    ripple2.visible = false;
    scene.add(ripple2);

    // ── 6. Vector Arrows ──
    const makeVectorArrow = (color: number, label: string) => {
      const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 12), mat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.35, 16), mat);
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

    const v1Arrow = makeVectorArrow(0x5ee1a0, 'v_1');
    const v2Arrow = makeVectorArrow(0x5ee1a0, 'v_2');

    // ── 7. Graph Panels ──
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

    const vgPanel = makePanel(5.8, 5.3, -1, 5.4);
    const roDefs = [
      { key: 't', label: 't (thời gian)', unit: 's' },
      { key: 'h', label: 'y (độ cao cách đất)', unit: 'm' },
      { key: 'v', label: 'v (vận tốc)', unit: 'm/s' }
    ];
    const statsPanel = makePanel(-6.7, 5.3, -1, 4.6, 560, 332);

    const drawGraph = (panel: any, o: any) => {
      const gCtx = panel.g;
      const W = 560;
      const H = 320;
      gCtx.setTransform(panel.W / W, 0, 0, panel.H / H, 0, 0);
      gCtx.fillStyle = '#0e1f33';
      gCtx.fillRect(0, 0, W, H);
      gCtx.strokeStyle = '#2f4760';
      gCtx.lineWidth = 3;
      gCtx.strokeRect(5, 5, W - 10, H - 10);
      gCtx.fillStyle = '#bfe0ff';
      gCtx.textAlign = 'center';
      gCtx.font = `bold 31px ${PHYS_FONT}`;
      gCtx.fillText(o.title || '', W / 2, 38);

      const x0 = 74, y0 = H - 52, x1 = W - 22, y1 = 56;
      const xmin = o.xmin || 0, xmax = Math.max(o.xmax, xmin + 1e-3);
      const ymin = o.ymin != null ? o.ymin : 0, ymax = Math.max(o.ymax, ymin + 1e-3);
      const sx = (t: number) => x0 + ((t - xmin) / (xmax - xmin)) * (x1 - x0);
      const sy = (v: number) => y0 - ((v - ymin) / (ymax - ymin)) * (y0 - y1);

      gCtx.strokeStyle = '#1d3349';
      gCtx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const yy = y1 + (y0 - y1) * i / 5;
        gCtx.beginPath();
        gCtx.moveTo(x0, yy);
        gCtx.lineTo(x1, yy);
        gCtx.stroke();
      }
      gCtx.strokeStyle = '#5f86a8';
      gCtx.lineWidth = 2.5;
      gCtx.beginPath();
      gCtx.moveTo(x0, y1);
      gCtx.lineTo(x0, y0);
      gCtx.lineTo(x1, y0);
      gCtx.stroke();

      gCtx.fillStyle = '#9fc0de';
      gCtx.font = '600 21px sans-serif';
      gCtx.textAlign = 'center';
      gCtx.fillText(o.xlabel || 't (s)', (x0 + x1) / 2, H - 16);
      gCtx.save();
      gCtx.translate(24, (y0 + y1) / 2);
      gCtx.rotate(-Math.PI / 2);
      gCtx.fillText(o.ylabel || '', 0, 0);
      gCtx.restore();

      for (const s of o.series) {
        if (!s.pts.length) continue;
        gCtx.strokeStyle = s.color;
        gCtx.lineWidth = 3.6;
        gCtx.beginPath();
        s.pts.forEach((pt: any, idx: number) => {
          const X = sx(pt[0]), Y = sy(pt[1]);
          if (idx === 0) gCtx.moveTo(X, Y);
          else gCtx.lineTo(X, Y);
        });
        gCtx.stroke();
      }

      let ly = y1 + 10;
      for (const s of o.series) {
        gCtx.fillStyle = s.color;
        gCtx.fillRect(x1 - 172, ly - 14, 24, 9);
        gCtx.fillStyle = '#cfe2f7';
        gCtx.textAlign = 'left';
        gCtx.font = '700 20px sans-serif';
        gCtx.fillText(s.label, x1 - 140, ly - 4);
        ly += 28;
      }
      gCtx.setTransform(1, 0, 0, 1, 0, 0);
      panel.flush();
    };

    // ── 8. Animation Loop & Tick ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      // Rotate billboard panels to face camera
      vgPanel.grp.lookAt(camera.position);
      statsPanel.grp.lookAt(camera.position);

      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Cap dt to prevent huge skips
      dt = Math.min(dt, 0.05);

      const state = stateRef.current;
      const { isPlaying: activePlaying, isSlow: activeSlow, h: activeH, gVal: activeG, onStep: activeOnStep, onAnimationEnd: activeOnAnimEnd } = refs.current;

      // Sync release gantry height dynamically in tick
      gantry.position.y = activeH;

      if (activePlaying && !state.landed) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;

        const t = state.t;
        const drop = 0.5 * activeG * t * t;
        let y = activeH - drop;
        let v = activeG * t;

        if (y <= 0) {
          y = 0;
          v = activeG * Math.sqrt(2 * activeH / activeG);
          state.landed = true;
          state.impactTime = 0.5; // Start impact ripple (lasts 0.5s)
          if (activeOnAnimEnd) activeOnAnimEnd();
        }

        state.y = y;
        state.v = v;

        // Position spheres based on bottom height y
        ball1.position.y = y + ball1Radius;
        ball2.position.y = y + ball2Radius;

        // Velocity Vectors pointing downwards from sphere centers
        v1Arrow.set(new THREE.Vector3(0, -1, 0), v * 0.45, new THREE.Vector3(-2, y + ball1Radius, -1));
        v2Arrow.set(new THREE.Vector3(0, -1, 0), v * 0.45, new THREE.Vector3(2, y + ball2Radius, -1));

        // Update Graphs
        if (state.vpts.length === 0 || t - state.vpts[state.vpts.length - 1][0] > 0.04) {
          state.vpts.push([t, v]);
          const vmax = Math.max(15, ...state.vpts.map((q) => q[1]));
          drawGraph(vgPanel, {
            title: 'Đồ thị v – t (rơi tự do)',
            ylabel: 'v (m/s)',
            xmax: Math.max(2, t),
            ymin: 0,
            ymax: vmax,
            series: [{ pts: state.vpts, color: '#5ee1a0', label: 'v' }],
          });
        }

        // Draw stats panel
        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          h: y.toFixed(2),
          v: v.toFixed(2)
        });

        // Notify parent workspace page
        if (activeOnStep) {
          activeOnStep(t, y, v);
        }
      } else if (!activePlaying && state.t === 0) {
        // Static reset state render
        ball1.position.y = activeH + ball1Radius;
        ball2.position.y = activeH + ball2Radius;

        v1Arrow.set(new THREE.Vector3(0, -1, 0), 0, new THREE.Vector3(-2, activeH + ball1Radius, -1));
        v2Arrow.set(new THREE.Vector3(0, -1, 0), 0, new THREE.Vector3(2, activeH + ball2Radius, -1));

        ripple1.visible = false;
        ripple2.visible = false;

        drawGraph(vgPanel, {
          title: 'Đồ thị v – t (rơi tự do)',
          ylabel: 'v (m/s)',
          xmax: 2,
          ymin: 0,
          ymax: 15,
          series: [{ pts: state.vpts, color: '#5ee1a0', label: 'v' }],
        });

        // Draw stats panel static
        drawStats(statsPanel, roDefs, {
          t: '0.00',
          h: activeH.toFixed(2),
          v: '0.00'
        });
      } else {
        // Paused or Landed, handle impact ripple animation timer
        if (state.impactTime > 0) {
          state.impactTime -= dt;
          ripple1.visible = true;
          ripple2.visible = true;

          // Expanding ring effect
          const scale = 1.0 + (0.5 - state.impactTime) * 4.5;
          ripple1.scale.set(scale, scale, 1);
          ripple2.scale.set(scale, scale, 1);

          // Simple pulse effect: flash color on landing pad
          if (state.impactTime <= 0) {
            ripple1.visible = false;
            ripple2.visible = false;
          }
        }

        // Draw stats panel with constant landed values
        drawStats(statsPanel, roDefs, {
          t: state.t.toFixed(2),
          h: state.y.toFixed(2),
          v: state.v.toFixed(2)
        });
      }

      controls.update();
      render();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // ── 9. Handling Resizing ──
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

    // ── 10. Cleanup on Unmount ──
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      vgPanel.dispose();
      statsPanel.dispose();
      v1Arrow.dispose();
      v2Arrow.dispose();

      // Dispose simple mesh geometries/materials
      mast.geometry.dispose();
      (mast.material as THREE.Material).dispose();
      tickMaterial.dispose();
      ticks.forEach(t => t.geometry.dispose());
      gantryBeam.geometry.dispose();
      (gantryBeam.material as THREE.Material).dispose();
      magnetL.geometry.dispose();
      magnetR.geometry.dispose();
      magnetMat.dispose();
      ball1.geometry.dispose();
      (ball1.material as THREE.Material).dispose();
      ball2.geometry.dispose();
      (ball2.material as THREE.Material).dispose();
      pad1.geometry.dispose();
      pad2.geometry.dispose();
      padMat.dispose();
      ripple1.geometry.dispose();
      ripple2.geometry.dispose();
      ringMat.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [h, gVal, resetKey]);

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
