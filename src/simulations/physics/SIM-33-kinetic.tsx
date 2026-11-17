import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface KineticSimulationProps extends SimulationProps {
  onStep?: (T: number, N: number, vrms: number, p: number) => void;
  resetKey?: number;
}

function makeGasBox(w: number, h: number, d = 2.4) {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhongMaterial({
    color: 0x9fd4ff,
    transparent: true,
    opacity: 0.14,
    shininess: 90,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x6a86a2, roughness: 0.5 });
  const bot = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), edgeMat);
  bot.position.y = -h / 2;
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), edgeMat);
  top.position.y = h / 2;
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, d), edgeMat);
  left.position.x = -w / 2;
  const right = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, d), edgeMat);
  right.position.x = w / 2;

  const glass = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  glass.renderOrder = 3;

  g.add(bot, top, left, right, glass);
  return g;
}

function makeGasParticles(group: THREE.Group, n: number) {
  const arr: THREE.Mesh[] = [];
  const geo = new THREE.SphereGeometry(0.14, 8, 6);
  for (let i = 0; i < n; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x66e0ff });
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

function heatColor(v: number): THREE.Color {
  const t = Math.max(0, Math.min(1, (v + 1) / 2));
  const c = new THREE.Color();
  if (t < 0.5) {
    c.setRGB(0.12 + t * 0.3, 0.25 + t * 0.9, 0.55 + t * 0.6);
  } else {
    c.setRGB(0.27 + (t - 0.5) * 1.46, 0.7 + (t - 0.5) * 0.6, 0.85 + (t - 0.5) * 0.3);
  }
  return c;
}

export default function KineticSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: KineticSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const T = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'T');
    return p ? p.value : 300;
  }, [config.parameters]);

  const N = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'N');
    return p ? p.value : 30;
  }, [config.parameters]);

  const stateRef = useRef({
    cy: 4,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    T,
    N,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.T = T;
    refs.current.N = N;
  }, [isPlaying, isSlow, T, N]);

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

    // ── 4. Bounding Box & Gas Particles ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    const box = makeGasBox(9, 5);
    box.position.set(0, s.cy, 0);
    group.add(box);

    const gasParticles = makeGasParticles(group, 60);

    const initGas = (valN: number) => {
      gasParticles.forEach((m, idx) => {
        m.visible = idx < valN;
        m.position.set(
          (Math.random() - 0.5) * 8.4,
          s.cy + (Math.random() - 0.5) * 4.4,
          (Math.random() - 0.5) * 1.8
        );
      });
    };
    initGas(N);

    // ── 5. Stats Panel ──


    const roDefs = [
      { key: 'T', label: "Nhiệt độ", unit: 'K' },
      { key: 'N', label: "Số phân tử", unit: '' },
      { key: 'vr', label: "Tốc độ trung bình", unit: '' },
      { key: 'pr', label: "Áp suất (ước tính)", unit: 'atm' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

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

      const activeT = refs.current.T;
      const activeN = refs.current.N;
      const sp = Math.sqrt(activeT / 300);

      // Show/hide based on N
      gasParticles.forEach((m, idx) => {
        m.visible = idx < activeN;
      });

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        stepGas(
          gasParticles.filter((m) => m.visible),
          { xmin: -4.4, xmax: 4.4, ymin: s.cy - 2.3, ymax: s.cy + 2.3 },
          0.05 * sp * dt * 60 * speed
        );
      }

      // Color coding particles by their individual speed
      gasParticles.forEach((m) => {
        if (m.visible) {
          const v = m.userData.v as THREE.Vector3;
          const speedFactor = v.length() * sp - 0.6;
          const col = heatColor(speedFactor);
          (m.material as THREE.MeshBasicMaterial).color.copy(col);
        }
      });

      // Update stats panel
      const press = (activeN * activeT) / 9000;
      drawStats(statsPanel, roDefs, {
        T: activeT.toFixed(0),
        N: activeN.toFixed(0),
        vr: sp.toFixed(2),
        pr: press.toFixed(2),
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
      box.children.forEach((child) => {
        (child as THREE.Mesh).geometry.dispose();
        ((child as THREE.Mesh).material as THREE.Material).dispose();
      });
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
      gasParticles.forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
    };
  }, [N, resetKey]);

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
