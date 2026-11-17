import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface DampedSimulationProps extends SimulationProps {
  onStep?: (t: number, x: number, amp: number) => void;
  resetKey?: number;
}

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';

function makeSpringHelix(coils = 11, rad = 0.34) {
  const pts = [], N = coils * 16;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    pts.push(new THREE.Vector3(u, Math.cos(u * coils * 6.2832) * rad, Math.sin(u * coils * 6.2832) * rad));
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, 0.05, 6);
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xb4bcc8, metalness: 0.8, roughness: 0.2 }));
}

function makeBlock(color = 0xffb74d, s = 1) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(1.1 * s, 1.1 * s, 1.1 * s),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  m.castShadow = true;
  return m;
}

export default function DampedSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: DampedSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const A0 = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'A');
    return p ? p.value : 2.5;
  }, [config.parameters]);

  // Nhận tần số riêng ω₀ (rad/s) từ config (key 'omega' khớp Workspace); 'T' làm dự phòng cũ.
  const omega = useMemo(() => {
    const pW = config.parameters.find((param) => param.key === 'omega');
    if (pW) return pW.value;
    const pT = config.parameters.find((param) => param.key === 'T');
    return pT && pT.value > 0 ? (2 * Math.PI) / pT.value : 2;
  }, [config.parameters]);

  const b = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'b');
    return p ? p.value : 0.25;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    pts: [] as [number, number][],
    up: [] as [number, number][],
    dn: [] as [number, number][],
    wallX: -7,
    eq: -1,
    cy: 3.6,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    A0,
    omega,
    b,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.A0 = A0;
    refs.current.omega = omega;
    refs.current.b = b;
  }, [isPlaying, isSlow, A0, omega, b]);

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

    // ── 4. Build Setup ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Anchor wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.6, 2),
      new THREE.MeshStandardMaterial({ color: 0x44525f, roughness: 0.5, metalness: 0.8 })
    );
    wall.position.set(s.wallX, s.cy, 0);
    group.add(wall);

    // Spring
    const spring = makeSpringHelix();
    spring.position.y = s.cy;
    group.add(spring);

    // Mass Block
    const mass = makeBlock(0x7c5cff, 1);
    mass.position.y = s.cy;
    group.add(mass);

    // Position spring and mass
    const placeMassSpring = (x: number) => {
      const massX = s.eq + x;
      mass.position.x = massX;
      spring.position.x = s.wallX + 0.2;
      spring.scale.x = (massX - 0.55) - (s.wallX + 0.2);
    };

    // ── 5. Graph and Stats Panels ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 320) => {
      const c = document.createElement('canvas');
      c.width = px;
      c.height = py;
      const g = c.getContext('2d')!;
      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      const worldH = (worldW * py) / px;
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
        },
      };
    };

    const gPanel = makePanel(6.3, 6, -1, 7);

    const roDefs = [
      { key: 'x', label: "Li độ", unit: "cm" },
      { key: 'A', label: "Biên độ", unit: "cm" },
      { key: 't', label: "Thời gian", unit: 's' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

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
        const yy = y1 + ((y0 - y1) * i) / 5;
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
      g.fillText(o.xlabel || 't (s)', (x0 + x1) / 2, H - 16);
      g.save();
      g.translate(24, (y0 + y1) / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(o.ylabel || 'x (m)', 0, 0);
      g.restore();

      for (const series of o.series) {
        if (!series.pts.length) continue;
        g.strokeStyle = series.color;
        g.lineWidth = series.lineWidth || 3.6;
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

    // Reset loop variables
    s.lt = 0;
    s.pts = [];
    s.up = [];
    s.dn = [];
    placeMassSpring(A0);

    // ── 6. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      gPanel.grp.lookAt(camera.position);
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      dt = Math.min(dt, 0.05);

      const activeA0 = refs.current.A0;
      const activeB = refs.current.b;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;
      }

      const w = Math.max(0.01, refs.current.omega); // tần số riêng ω₀ dùng trực tiếp
      const env = activeA0 * Math.exp(-activeB * s.lt);
      const x = env * Math.cos(w * s.lt);

      placeMassSpring(x);

      const win = 10;
      if (refs.current.isPlaying) {
        if (!s.pts.length || s.lt - s.pts[s.pts.length - 1][0] > 0.03) {
          s.pts.push([s.lt, x]);
          s.up.push([s.lt, env]);
          s.dn.push([s.lt, -env]);
        }
      } else if (s.pts.length === 0) {
        s.pts.push([0, x]);
        s.up.push([0, env]);
        s.dn.push([0, -env]);
      }

      const xmin = Math.max(0, s.lt - win);
      [s.pts, s.up, s.dn].forEach((arr) => {
        while (arr.length && arr[0][0] < xmin) arr.shift();
      });

      drawGraph(gPanel, {
        title: 'Đồ thị x – t (tắt dần)',
        ylabel: 'x (m)',
        xmin,
        xmax: xmin + win,
        ymin: -3.5,
        ymax: 3.5,
        series: [
          { pts: s.up, color: '#5a6f8c', label: 'biên độ', lineWidth: 1.8 },
          { pts: s.dn, color: '#5a6f8c', label: '', lineWidth: 1.8 },
          { pts: s.pts, color: '#5ee1a0', label: 'x', lineWidth: 3.6 },
        ],
      });

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        x: x.toFixed(2),
        A: env.toFixed(2),
        t: s.lt.toFixed(2),
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
      spring.geometry.dispose();
      (spring.material as THREE.Material).dispose();
      mass.geometry.dispose();
      (mass.material as THREE.Material).dispose();
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
