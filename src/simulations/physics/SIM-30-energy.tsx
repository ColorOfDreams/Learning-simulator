import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';


// cssColor and rr functions removed as they were unused


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

function drawBars(panel: any, o: { title: string; max: number; bars: Array<{ label: string; val: number; color: string }> }) {
  const g = panel.g;
  const W = 560;
  const H = 320;
  g.setTransform(panel.W / W, 0, 0, panel.H / H, 0, 0);
  g.fillStyle = '#0e1f33';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#2f4760';
  g.lineWidth = 3;
  g.strokeRect(5, 5, W - 10, H - 10);
  g.fillStyle = '#bfe0ff';
  g.textAlign = 'center';
  g.font = `bold 31px ${PHYS_FONT}`;
  g.fillText(o.title || '', W / 2, 38);
  
  const n = o.bars.length;
  const baseY = H - 62;
  const top = 68;
  const maxH = baseY - top;
  const bw = (W - 90) / n;
  const max = Math.max(o.max, 1e-3);

  o.bars.forEach((b, i) => {
    const x = 60 + i * bw + bw * 0.16;
    const w = bw * 0.68;
    const h = Math.max(0, Math.min(1, b.val / max)) * maxH;
    g.fillStyle = '#16304a';
    g.fillRect(x, top, w, maxH);
    g.fillStyle = b.color;
    g.fillRect(x, baseY - h, w, h);
    g.fillStyle = '#cfe2f7';
    g.textAlign = 'center';
    g.font = `700 21px ${PHYS_FONT}`;
    g.fillText(b.label, x + w / 2, baseY + 30);
    g.fillStyle = '#fff';
    g.font = `bold 22px ${PHYS_FONT}`;
    g.fillText(b.val.toFixed(1), x + w / 2, baseY - h - 12);
  });
  g.setTransform(1, 0, 0, 1, 0, 0);
  panel.flush();
}

export default function EnergySimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const h0 = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'h0');
    return p ? p.value : 6;
  }, [config.parameters]);

  const m = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'm');
    return p ? p.value : 1;
  }, [config.parameters]);

  const gVal = 9.8; // Gravity

  const stateRef = useRef({
    t: 0,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    h0,
    m,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.h0 = h0;
    refs.current.m = m;
  }, [isPlaying, isSlow, h0, m]);

  useEffect(() => {
    stateRef.current.t = 0;
  }, [h0, m, resetKey]);

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
    controls.target.set(0, 3.5, 0);
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

    // ── 4. Parabolic Track and Sliding Ball ──
    const X = 5.5;
    const cVal = h0 / (X * X);

    // Generate track curve points
    const pts: THREE.Vector3[] = [];
    for (let i = -X; i <= X; i += 0.4) {
      pts.push(new THREE.Vector3(i, cVal * i * i + 0.2, 0));
    }

    const trackMesh = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0x55708c, roughness: 0.2, metalness: 0.8 })
    );
    trackMesh.receiveShadow = true;
    trackMesh.castShadow = true;
    scene.add(trackMesh);

    // Ball
    const ballRadius = 0.4;
    const ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 32, 24),
      new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.4, metalness: 0.1 })
    );
    ballMesh.castShadow = true;
    scene.add(ballMesh);

    // Support pillars for visual realism
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x354b60, roughness: 0.6 });
    const pillarLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h0 + 0.2, 8), pillarMat);
    pillarLeft.position.set(-X, (h0 + 0.2) / 2, 0);
    pillarLeft.castShadow = true;
    scene.add(pillarLeft);

    const pillarRight = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h0 + 0.2, 8), pillarMat);
    pillarRight.position.set(X, (h0 + 0.2) / 2, 0);
    pillarRight.castShadow = true;
    scene.add(pillarRight);

    // ── 5. Stats and Bars Panels ──
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
      { key: 'h', label: 'h (độ cao)', unit: 'm' },
      { key: 'v', label: 'v (vận tốc)', unit: 'm/s' }
    ];
    // Stats on left, Energy bar charts on right
    const statsPanel = makePanel(-6.7, 5.0, -1, 4.6, 560, 260);
    const barsPanel = makePanel(6.6, 5.0, -1, 5.0, 560, 320);

    // ── 6. Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      statsPanel.grp.lookAt(camera.position);
      barsPanel.grp.lookAt(camera.position);
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      dt = Math.min(dt, 0.05);

      const state = stateRef.current;
      const { isPlaying: activePlaying, isSlow: activeSlow, h0: activeH0, m: activeM } = refs.current;

      if (activePlaying) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;
      }

      // Parabolic oscillation: x = X * cos(w * t)
      const w = (Math.sqrt(2 * gVal * activeH0) / X) * 0.7;
      const x = X * Math.cos(w * state.t);
      const h = cVal * x * x;

      // Ball sits on top of track (cVal*x*x + 0.2 offset + 0.4 ballRadius = h + 0.6)
      ballMesh.position.set(x, h + 0.6, 0);

      // Energy calculation
      const E = activeM * gVal * activeH0;
      const PE = activeM * gVal * h;
      const KE = Math.max(0, E - PE);
      const v = Math.sqrt((2 * KE) / activeM);

      // Draw Stats
      drawStats(statsPanel, roDefs, {
        t: state.t.toFixed(2),
        h: h.toFixed(2),
        v: v.toFixed(2),
      });

      // Draw Energy Bars
      drawBars(barsPanel, {
        title: 'Cơ năng cơ học (J)',
        max: E,
        bars: [
          { label: 'Thế năng W_t', val: PE, color: '#ffc24a' },
          { label: 'Động năng W_đ', val: KE, color: '#5ee1a0' },
          { label: 'Cơ năng W', val: E, color: '#7cc4ff' }
        ]
      });

      controls.update();
      render();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // ── 7. Resizing ──
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

    // ── 8. Cleanup ──
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      statsPanel.dispose();
      barsPanel.dispose();
      trackMesh.geometry.dispose();
      (trackMesh.material as THREE.Material).dispose();
      ballMesh.geometry.dispose();
      (ballMesh.material as THREE.Material).dispose();
      pillarLeft.geometry.dispose();
      pillarRight.geometry.dispose();
      pillarMat.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [h0, m, resetKey]);

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
