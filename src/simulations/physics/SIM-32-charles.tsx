import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface CharlesSimulationProps extends SimulationProps {
  onStep?: (t: number, T: number, V: number) => void;
  resetKey?: number;
}

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';

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

function makeGasParticles(group: THREE.Group, n: number, color = 0x66e0ff) {
  const arr: THREE.Mesh[] = [];
  const geo = new THREE.SphereGeometry(0.14, 8, 6);
  const mat = new THREE.MeshBasicMaterial({ color });
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.userData = {
      v: new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), 0).normalize()
    };
    group.add(m);
    arr.push(m);
  }
  return arr;
}

function stepGas(
  arr: THREE.Mesh[],
  box: { xmin: number; xmax: number; ymin: number; ymax: number },
  speed: number
) {
  for (const m of arr) {
    const v = m.userData.v as THREE.Vector3;
    m.position.x += v.x * speed;
    m.position.y += v.y * speed;
    if (m.position.x < box.xmin) { m.position.x = box.xmin; v.x = Math.abs(v.x); }
    if (m.position.x > box.xmax) { m.position.x = box.xmax; v.x = -Math.abs(v.x); }
    if (m.position.y < box.ymin) { m.position.y = box.ymin; v.y = Math.abs(v.y); }
    if (m.position.y > box.ymax) { m.position.y = box.ymax; v.y = -Math.abs(v.y); }
  }
}

export default function CharlesSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: CharlesSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const T = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'T');
    return p ? p.value : 300;
  }, [config.parameters]);

  const stateRef = useRef({
    t: 0,
    cy: 4,
    x0: -6,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    T,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.T = T;
  }, [isPlaying, isSlow, T]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Create Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6.4, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 3.8, 0);
    controls.minDistance = 6;
    controls.maxDistance = 40;
    controls.update();

    // ── 2. Lighting ──
    const hemi = new THREE.HemisphereLight(0xdcecff, 0x2a3744, 0.95);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(7, 16, 10);
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

    // ── 4. Chamber & Piston ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Wall (left boundary)
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 3.4, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x6a86a2, roughness: 0.5 })
    );
    wall.position.set(s.x0, s.cy, 0);
    group.add(wall);

    // Rails
    const rails: THREE.Mesh[] = [];
    for (const dy of [-1.6, 1.6]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(11, 0.16, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x55708c, roughness: 0.5 })
      );
      rail.position.set(s.x0 + 5, s.cy + dy, 0);
      group.add(rail);
      rails.push(rail);
    }

    // Glass cylinder
    const glassMat = new THREE.MeshPhongMaterial({
      color: 0x9fd4ff,
      transparent: true,
      opacity: 0.1,
      shininess: 90,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glassBody = new THREE.Mesh(new THREE.BoxGeometry(11, 3.0, 2.6), glassMat);
    glassBody.position.set(s.x0 + 5, s.cy, 0);
    group.add(glassBody);

    // Piston
    const piston = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 3.2, 2.6),
      new THREE.MeshStandardMaterial({ color: 0xb46c6c, roughness: 0.6 })
    );
    group.add(piston);

    // Gas particles
    const gasParticles = makeGasParticles(group, 26, 0x66e0ff);

    // ── 5. Alcohol Burner (makeFlame) ──
    const flameGroup = new THREE.Group();
    flameGroup.position.set(s.x0 + 2.4, 0, 0);
    group.add(flameGroup);

    const lampBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 18, 12),
      new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.5, shininess: 90 })
    );
    lampBody.scale.y = 0.82;
    lampBody.position.y = 0.45;
    lampBody.castShadow = true;
    flameGroup.add(lampBody);

    const fuel = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 14, 10),
      new THREE.MeshPhongMaterial({ color: 0xa9c8e8, transparent: true, opacity: 0.6 })
    );
    fuel.scale.y = 0.55;
    fuel.position.y = 0.4;
    flameGroup.add(fuel);

    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.2, 14),
      new THREE.MeshStandardMaterial({ color: 0xb8a44a, roughness: 0.4, metalness: 0.7 })
    );
    collar.position.y = 0.92;
    flameGroup.add(collar);

    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.9 })
    );
    wick.position.y = 1.06;
    flameGroup.add(wick);

    const outerFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.95, 16),
      new THREE.MeshBasicMaterial({ color: 0xff8a30, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    outerFlame.position.y = 1.5;
    flameGroup.add(outerFlame);

    const innerFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.46, 12),
      new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    innerFlame.position.y = 1.28;
    flameGroup.add(innerFlame);

    const flameGlow = new THREE.PointLight(0xffa040, 1.1, 6);
    flameGlow.position.y = 1.45;
    flameGroup.add(flameGlow);

    // Initialize gas positions based on T
    const initGas = (valT: number) => {
      const valV = valT / 100;
      const px = s.x0 + 0.4 + valV * 1.1;
      for (const m of gasParticles) {
        m.position.set(
          s.x0 + 0.4 + Math.random() * (px - s.x0 - 0.8),
          s.cy + (Math.random() - 0.5) * 2.6,
          (Math.random() - 0.5) * 1.8
        );
      }
    };
    initGas(T);

    // ── 6. Panel Graph ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 320) => {
      const c = document.createElement('canvas');
      c.width = px;
      c.height = py;
      const g = c.getContext('2d')!;
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
        g,
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

    const gPanel = makePanel(6.3, 6, -1, 7);

    const roDefs = [
      { key: 'T', label: 'T (nhiệt độ)', unit: 'K' },
      { key: 'V', label: 'V (thể tích)', unit: '' },
      { key: 'VT', label: 'V/T', unit: '' },
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 80 + roDefs.length * 84);

    const drawGraph = (panel: any, o: any) => {
      const g = panel.g;
      const W = 560;
      const H = 320;
      g.fillStyle = '#0e1f33';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#2f4760';
      g.lineWidth = 3;
      g.strokeRect(5, 5, W - 10, H - 10);
      g.fillStyle = '#bfe0ff';
      g.textAlign = 'center';
      g.font = `bold 31px ${PHYS_FONT}`;
      g.fillText(o.title || '', W / 2, 38);

      const x0 = 74, y0 = H - 52, x1 = W - 22, y1 = 56;
      const xmin = o.xmin || 0, xmax = Math.max(o.xmax, xmin + 1e-3);
      const ymin = o.ymin != null ? o.ymin : 0, ymax = Math.max(o.ymax, ymin + 1e-3);
      const sx = (t: number) => x0 + ((t - xmin) / (xmax - xmin)) * (x1 - x0);
      const sy = (v: number) => y0 - ((v - ymin) / (ymax - ymin)) * (y0 - y1);

      g.strokeStyle = '#1d3349';
      g.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const yy = y1 + (y0 - y1) * i / 5;
        g.beginPath();
        g.moveTo(x0, yy);
        g.lineTo(x1, yy);
        g.stroke();
      }
      g.strokeStyle = '#5f86a8';
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(x0, y1);
      g.lineTo(x0, y0);
      g.lineTo(x1, y0);
      g.stroke();

      g.fillStyle = '#9fc0de';
      g.font = '600 21px sans-serif';
      g.textAlign = 'center';
      g.fillText(o.xlabel || 'T (K)', (x0 + x1) / 2, H - 16);
      g.save();
      g.translate(24, (y0 + y1) / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(o.ylabel || 'V', 0, 0);
      g.restore();

      for (const series of o.series) {
        if (!series.pts.length) continue;
        g.strokeStyle = series.color;
        g.lineWidth = 3.6;
        g.beginPath();
        series.pts.forEach((pt: any, idx: number) => {
          const X = sx(pt[0]), Y = sy(pt[1]);
          if (idx === 0) g.moveTo(X, Y);
          else g.lineTo(X, Y);
        });
        g.stroke();
      }

      g.setTransform(1, 0, 0, 1, 0, 0);
      panel.flush();
    };

    // ── 7. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;
    let fTime = 0;

    const render = () => {
      gPanel.grp.lookAt(camera.position);
      statsPanel.grp.lookAt(camera.position);
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      dt = Math.min(dt, 0.05);

      const activeT = refs.current.T;
      const valV = activeT / 100;
      const px = s.x0 + 0.4 + valV * 1.1;

      piston.position.set(px, s.cy, 0);

      // Flame flicker animation
      fTime += dt;
      const f = 1 + Math.sin(fTime * 16) * 0.12 + Math.sin(fTime * 27) * 0.07;
      outerFlame.scale.set(f, f * (1 + Math.sin(fTime * 11) * 0.12), f);
      innerFlame.scale.set(f * 0.9, f, f * 0.9);
      flameGlow.intensity = 0.9 + Math.sin(fTime * 19) * 0.25;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        // Particle speed depends on temperature (sqrt(T/300))
        const tempSpeed = Math.sqrt(activeT / 300);
        stepGas(
          gasParticles,
          {
            xmin: s.x0 + 0.35,
            xmax: px - 0.35,
            ymin: s.cy - 1.45,
            ymax: s.cy + 1.45,
          },
          0.04 * tempSpeed * dt * 60 * speed
        );
      }

      // Draw V-T Graph
      const curve: [number, number][] = [];
      for (let t = 200; t <= 500.001; t += 10) {
        curve.push([t, t / 100]);
      }

      drawGraph(gPanel, {
        title: 'Đồ thị V – T (đẳng áp)',
        xlabel: 'T (K)',
        ylabel: 'V',
        xmin: 0,
        xmax: 500,
        ymin: 0,
        ymax: 5.5,
        series: [
          { pts: curve, color: '#7cc4ff', label: 'V ∝ T' },
          { pts: [[activeT, valV]], color: '#ffca28', label: 'điểm hiện tại' },
        ],
      });

      // Render marker on graph
      const g = gPanel.g;
      const W = 560, H = 320;
      const x0 = 74, y0 = H - 52, x1 = W - 22, y1 = 56;
      const sx = (t: number) => x0 + (t / 500) * (x1 - x0);
      const sy = (v: number) => y0 - (v / 5.5) * (y0 - y1);
      g.fillStyle = '#ffca28';
      g.beginPath();
      g.arc(sx(activeT), sy(valV), 7, 0, Math.PI * 2);
      g.fill();
      gPanel.flush();

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        T: activeT.toFixed(0),
        V: valV.toFixed(2),
        VT: (valV / activeT).toFixed(4),
      });

      controls.update();
      render();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        render();
      }
    });
    resizeObserver.observe(mountRef.current);



    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      gPanel.dispose();
      statsPanel.dispose();
      wall.geometry.dispose();
      (wall.material as THREE.Material).dispose();
      rails.forEach((rail) => {
        rail.geometry.dispose();
        (rail.material as THREE.Material).dispose();
      });
      glassBody.geometry.dispose();
      glassMat.dispose();
      piston.geometry.dispose();
      (piston.material as THREE.Material).dispose();
      lampBody.geometry.dispose();
      (lampBody.material as THREE.Material).dispose();
      fuel.geometry.dispose();
      (fuel.material as THREE.Material).dispose();
      collar.geometry.dispose();
      (collar.material as THREE.Material).dispose();
      wick.geometry.dispose();
      (wick.material as THREE.Material).dispose();
      outerFlame.geometry.dispose();
      (outerFlame.material as THREE.Material).dispose();
      innerFlame.geometry.dispose();
      (innerFlame.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
      gasParticles.forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
    };
  }, [resetKey]);

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
