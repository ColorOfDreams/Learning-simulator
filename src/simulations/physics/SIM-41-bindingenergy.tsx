import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface BindingEnergySimulationProps extends SimulationProps {
  onStep?: (t: number, A: number, eps: number, reg: string) => void;
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

function makeNucleus(color: number, r = 0.18) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, 12, 9),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      emissive: color,
      emissiveIntensity: 0.12,
    })
  );
}

function bindingPerA(A: number) {
  return Math.max(1.0, 8.9 - 26 / Math.max(A, 8) - 0.0058 * A);
}

export default function BindingEnergySimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: BindingEnergySimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const A = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'A');
    return p ? p.value : 56;
  }, [config.parameters]);

  const stateRef = useRef({
    cy: 4.2,
    blobGroup: null as THREE.Group | null,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    A,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.A = A;
  }, [isPlaying, isSlow, A]);

  // Regenerate nucleon blob mesh on parameters change or reset
  useEffect(() => {
    const s = stateRef.current;
    if (!s.blobGroup) return;

    // Clear old children
    while (s.blobGroup.children.length) {
      const child = s.blobGroup.children[0] as THREE.Mesh;
      s.blobGroup.remove(child);
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
    }

    // Generate nucleons
    const n = Math.min(60, A);
    const Rb = 0.35 * Math.cbrt(A);
    for (let i = 0; i < n; i++) {
      const nuc = makeNucleus(i % 2 ? 0xe8453a : 0x6f8db0, 0.18);
      const a = Math.random() * 6.283;
      const r = Rb * Math.cbrt(Math.random());
      const ph = Math.acos(2 * Math.random() - 1);
      nuc.position.set(
        Math.sin(ph) * Math.cos(a) * r,
        Math.cos(ph) * r,
        Math.sin(ph) * Math.sin(a) * r
      );
      s.blobGroup.add(nuc);
    }
  }, [A, resetKey]);

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

    // ── 4. Set Up Nucleon Blob Group ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    const blobGroup = new THREE.Group();
    blobGroup.position.set(-3.5, s.cy, 0);
    group.add(blobGroup);
    s.blobGroup = blobGroup;

    // Trigger initial generation of nucleons
    const initNucleons = (valA: number) => {
      const n = Math.min(60, valA);
      const Rb = 0.35 * Math.cbrt(valA);
      for (let i = 0; i < n; i++) {
        const nuc = makeNucleus(i % 2 ? 0xe8453a : 0x6f8db0, 0.18);
        const a = Math.random() * 6.283;
        const r = Rb * Math.cbrt(Math.random());
        const ph = Math.acos(2 * Math.random() - 1);
        nuc.position.set(
          Math.sin(ph) * Math.cos(a) * r,
          Math.cos(ph) * r,
          Math.sin(ph) * Math.sin(a) * r
        );
        blobGroup.add(nuc);
      }
    };
    initNucleons(A);

    // ── 5. Panel Graph ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 280) => {
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

    const gPanel = makePanel(6.2, 5.6, -1, 7);

    const roDefs = [
      { key: 'A', label: 'A (số khối)', unit: '' },
      { key: 'eps', label: 'ε (lk riêng)', unit: 'MeV' },
      { key: 'reg', label: 'Vùng', unit: '' },
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 80 + roDefs.length * 84);

    const drawGraph = (panel: any, o: any) => {
      const g = panel.g;
      const W = 560;
      const H = 280;
      g.fillStyle = '#0e1f33';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#2f4760';
      g.lineWidth = 3;
      g.strokeRect(5, 5, W - 10, H - 10);
      g.fillStyle = '#bfe0ff';
      g.textAlign = 'center';
      g.font = `bold 28px ${PHYS_FONT}`;
      g.fillText(o.title || '', W / 2, 36);

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
      g.font = '600 18px sans-serif';
      g.textAlign = 'center';
      g.fillText(o.xlabel || 'A', (x0 + x1) / 2, H - 16);
      g.save();
      g.translate(24, (y0 + y1) / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(o.ylabel || 'ε (MeV)', 0, 0);
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

    // ── 6. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

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

      const activeA = refs.current.A;
      const eps = bindingPerA(activeA);

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        blobGroup.rotation.y += dt * 0.5 * speed;
      }

      // Graph curve calculation
      const curve: [number, number][] = [];
      for (let a = 2; a <= 238; a += 2) {
        curve.push([a, bindingPerA(a)]);
      }

      drawGraph(gPanel, {
        title: 'Năng lượng liên kết riêng ε(A)',
        xlabel: 'A',
        ylabel: 'ε (MeV/nucleon)',
        xmin: 0,
        xmax: 238,
        ymin: 0,
        ymax: 9.5,
        series: [
          { pts: curve, color: '#7cc4ff', label: 'ε(A)' },
          { pts: [[activeA, eps]], color: '#ffca28', label: 'A hiện tại' },
        ],
      });

      // Render marker on graph
      const g = gPanel.g;
      const W = 560, H = 280;
      const x0 = 74, y0 = H - 52, x1 = W - 22, y1 = 56;
      const sx = (t: number) => x0 + (t / 238) * (x1 - x0);
      const sy = (v: number) => y0 - (v / 9.5) * (y0 - y1);
      g.fillStyle = '#ffca28';
      g.beginPath();
      g.arc(sx(activeA), sy(eps), 7, 0, Math.PI * 2);
      g.fill();
      gPanel.flush();

      // Update stats panel
      const regVal = activeA < 30 ? 'Nhẹ (dễ nhiệt hạch)' : (activeA > 150 ? 'Nặng (dễ phân hạch)' : 'Bền vững (sắt/thép)');

      drawStats(statsPanel, roDefs, {
        A: activeA.toString(),
        eps: eps.toFixed(2),
        reg: regVal,
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
      while (blobGroup.children.length) {
        const child = blobGroup.children[0] as THREE.Mesh;
        blobGroup.remove(child);
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
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
