import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface InterferenceSimulationProps extends SimulationProps {
  onStep?: (t: number, d: number, lam: number) => void;
  resetKey?: number;
}

function makeBall(r = 0.45, color = 0xff7043) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(r, 16, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 })
  );
}

function makeGrid(size = 15, seg = 64) {
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const col = new Float32Array(geo.attributes.position.count * 3);
  for (let i = 0; i < col.length; i++) {
    col[i] = 0.4;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
  );
  m.userData.seg = seg;
  m.userData.size = size;
  return m;
}

function heatColor(v: number) {
  const t = Math.max(0, Math.min(1, (v + 1) / 2));
  const c = new THREE.Color();
  if (t < 0.5) {
    c.setRGB(0.12 + t * 0.3, 0.25 + t * 0.9, 0.55 + t * 0.6);
  } else {
    c.setRGB(0.27 + (t - 0.5) * 1.46, 0.7 + (t - 0.5) * 0.6, 0.85 + (t - 0.5) * 0.3);
  }
  return c;
}

export default function InterferenceSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: InterferenceSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const d = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'd');
    return p ? p.value : 4.0;
  }, [config.parameters]);

  // Bước sóng suy từ tần số nguồn: λ = C/f (Workspace truyền 'f'). Chọn C=4 để f=2 → λ=2
  // (khớp mặc định cũ); tần số tăng → bước sóng ngắn → vân giao thoa dày hơn. 'lam' dự phòng.
  const lam = useMemo(() => {
    const pF = config.parameters.find((param) => param.key === 'f');
    if (pF && pF.value > 0) return 4.0 / pF.value;
    const pL = config.parameters.find((param) => param.key === 'lam');
    return pL ? pL.value : 2.0;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    cy: 3,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    d,
    lam,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.d = d;
    refs.current.lam = lam;
  }, [isPlaying, isSlow, d, lam]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Create Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 3.0, 0);
    controls.minDistance = 6;
    controls.maxDistance = 40;
    controls.update();

    // ── 2. Lighting ──
    const hemi = new THREE.HemisphereLight(0xdcecff, 0x2a3744, 0.95);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(7, 16, 10);
    scene.add(dirLight);

    // ── 3. Floor & Grid ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x16222f, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    scene.add(floor);

    // ── 4. Build Setup ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Lưới mặt nước
    const waterGrid = makeGrid(15, 64);
    waterGrid.position.y = s.cy;
    group.add(waterGrid);

    // Hai quả cầu nguồn dao động
    const src1 = makeBall(0.22, 0xffd24a);
    const src2 = makeBall(0.22, 0xffd24a);
    group.add(src1);
    group.add(src2);

    // ── 5. Stats Panel ──


    const roDefs = [
      { key: 'd', label: "Khoảng cách nguồn", unit: 'm' },
      { key: 'lam', label: "Bước sóng", unit: 'm' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

    s.lt = 0;

    // ── 6. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      dt = Math.min(dt, 0.05);

      const activeD = refs.current.d;
      const activeLam = refs.current.lam;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;
      }

      const s1 = new THREE.Vector3(-activeD / 2, 0, 0);
      const s2 = new THREE.Vector3(activeD / 2, 0, 0);

      // Cập nhật vị trí nguồn phát
      src1.position.set(s1.x, s.cy + 0.3 + 0.15 * Math.sin(2 * Math.PI * 0.9 * s.lt), s1.z);
      src2.position.set(s2.x, s.cy + 0.3 + 0.15 * Math.sin(2 * Math.PI * 0.9 * s.lt), s2.z);

      const k = (2 * Math.PI) / activeLam;
      const w = 2 * Math.PI * 0.9;

      // Cập nhật dao động lưới và màu sắc
      const geo = waterGrid.geometry;
      const pos = geo.attributes.position.array as Float32Array;
      const col = geo.attributes.color.array as Float32Array;

      for (let i = 0; i < geo.attributes.position.count; i++) {
        const px = pos[i * 3];
        const pz = pos[i * 3 + 2];
        const r1 = Math.hypot(px - s1.x, pz - s1.z);
        const r2 = Math.hypot(px - s2.x, pz - s2.z);
        // Sóng lan truyền từ 2 nguồn
        const h = Math.sin(k * r1 - w * s.lt) + Math.sin(k * r2 - w * s.lt);
        pos[i * 3 + 1] = h * 0.32;

        const c = heatColor(h / 2);
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        d: activeD.toFixed(2),
        lam: activeLam.toFixed(2),
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
      statsPanel.dispose();
      src1.geometry.dispose();
      (src1.material as THREE.Material).dispose();
      src2.geometry.dispose();
      (src2.material as THREE.Material).dispose();
      waterGrid.geometry.dispose();
      (waterGrid.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
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
