import { getResponsiveFov } from '../camera';
import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface WaveSimulationProps extends SimulationProps {
  onStep?: (t: number, v: number, lam: number, f: number) => void;
  resetKey?: number;
}

function makeBall(r = 0.45, color = 0xff7043) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, 16, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  );
  m.castShadow = true;
  return m;
}

export default function WaveSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: WaveSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const A = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'A');
    return p ? p.value : 1.0;
  }, [config.parameters]);

  const f = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'f');
    return p ? p.value : 1.5;
  }, [config.parameters]);

  // Bước sóng suy từ tốc độ sóng: λ = v/f (Workspace truyền 'v'); 'lam' làm dự phòng cũ.
  const lam = useMemo(() => {
    const pV = config.parameters.find((param) => param.key === 'v');
    const pF = config.parameters.find((param) => param.key === 'f');
    const fv = pF && pF.value > 0 ? pF.value : 1.5;
    if (pV) return pV.value / fv;
    const pL = config.parameters.find((param) => param.key === 'lam');
    return pL ? pL.value : 4.0;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    cy: 4,
    x0: -8,
    x1: 8,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    A,
    lam,
    f,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.A = A;
    refs.current.lam = lam;
    refs.current.f = f;
  }, [isPlaying, isSlow, A, lam, f]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Create Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(getResponsiveFov(45, width / height), width / height, 0.1, 100);
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

    // Create 46 particles row
    const ballsCount = 46;
    const balls: THREE.Mesh[] = [];
    const ballGeo = new THREE.SphereGeometry(0.17, 12, 9);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0x4aa3ff, roughness: 0.4 });
    for (let i = 0; i < ballsCount; i++) {
      const b = new THREE.Mesh(ballGeo, ballMat);
      b.position.x = s.x0 + ((s.x1 - s.x0) * i) / (ballsCount - 1);
      b.position.y = s.cy;
      group.add(b);
      balls.push(b);
    }

    // Line connecting particles
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x9fd4ff });
    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);

    // Wave Source Marker (First ball highlighted)
    const mark = makeBall(0.26, 0xffca28);
    group.add(mark);

    // ── 5. Stats Panel ──


    const roDefs = [
      { key: 'v', label: "Tốc độ sóng", unit: 'm/s' },
      { key: 'lam', label: "Bước sóng", unit: 'm' },
      { key: 'f', label: "Tần số", unit: 'Hz' },
      { key: 'T', label: "Chu kỳ", unit: 's' }
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

      const activeA = refs.current.A;
      const activeLam = refs.current.lam;
      const activeF = refs.current.f;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;
      }

      const k = (2 * Math.PI) / activeLam;
      const w = 2 * Math.PI * activeF;

      const pts: THREE.Vector3[] = [];
      for (const b of balls) {
        b.position.y = s.cy + activeA * Math.sin(w * s.lt - k * b.position.x);
        pts.push(b.position.clone());
      }
      line.geometry.setFromPoints(pts);

      // Place highlighter marker at first particle
      mark.position.set(s.x0, balls[0].position.y, 0);

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        v: (activeLam * activeF).toFixed(2),
        lam: activeLam.toFixed(2),
        f: activeF.toFixed(2),
        T: (1 / activeF).toFixed(2),
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
        camera.fov = getResponsiveFov(45, camera.aspect);
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
      balls.forEach((b) => {
        b.geometry.dispose();
      });
      ballGeo.dispose();
      ballMat.dispose();
      line.geometry.dispose();
      lineMat.dispose();
      mark.geometry.dispose();
      (mark.material as THREE.Material).dispose();
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
