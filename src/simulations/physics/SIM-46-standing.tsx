import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface StandingSimulationProps extends SimulationProps {
  onStep?: (t: number, n: number, lam: number, nodesCount: number) => void;
  resetKey?: number;
}

export default function StandingSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: StandingSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const n = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'n');
    return p ? p.value : 3;
  }, [config.parameters]);

  const A = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'A');
    return p ? p.value : 0.8;
  }, [config.parameters]);

  const f = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'f');
    return p ? p.value : 0.8;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    cy: 4,
    xL: -6,
    L: 12,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    n,
    A,
    f,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.n = n;
    refs.current.A = A;
    refs.current.f = f;
  }, [isPlaying, isSlow, n, A, f]);

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

    // ── 4. Build SHM Setup ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Boundary supports (posts)
    const postMat = new THREE.MeshStandardMaterial({ color: 0x6a727c, roughness: 0.5, metalness: 0.8 });
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
    for (const ex of [s.xL, s.xL + s.L]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(ex, s.cy - 0.7, 0);
      group.add(post);
    }

    // Particles row (61 balls)
    const ballsCount = 61;
    const balls: THREE.Mesh[] = [];
    const ballGeo = new THREE.SphereGeometry(0.14, 12, 9);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0x5ee1a0, roughness: 0.4 });
    for (let i = 0; i < ballsCount; i++) {
      const b = new THREE.Mesh(ballGeo, ballMat);
      b.position.x = s.xL + (s.L * i) / (ballsCount - 1);
      b.position.y = s.cy;
      group.add(b);
      balls.push(b);
    }

    // Connect line
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x9ff0cb });
    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);

    // Group for node highlights
    const nodesGroup = new THREE.Group();
    group.add(nodesGroup);

    // Update node highlights
    const nodeGeo = new THREE.SphereGeometry(0.16, 10, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xff5252 });
    const updateNodes = (activeN: number) => {
      while (nodesGroup.children.length) {
        const child = nodesGroup.children[0] as THREE.Mesh;
        nodesGroup.remove(child);
        child.geometry.dispose();
      }
      for (let i = 0; i <= activeN; i++) {
        const nd = new THREE.Mesh(nodeGeo, nodeMat);
        nd.position.set(s.xL + (s.L * i) / activeN, s.cy, 0);
        nodesGroup.add(nd);
      }
    };

    updateNodes(n);

    // ── 5. Stats Panel ──


    const roDefs = [
      { key: 'n', label: "Số bụng sóng", unit: '' },
      { key: 'lam', label: "Bước sóng", unit: 'm' },
      { key: 'nodes', label: "Số nút sóng", unit: '' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

    s.lt = 0;

    // ── 6. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;
    let prevN = n;

    const render = () => {
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      dt = Math.min(dt, 0.05);

      const activeN = refs.current.n;
      const activeA = refs.current.A;
      const activeF = refs.current.f;

      if (activeN !== prevN) {
        updateNodes(activeN);
        prevN = activeN;
      }

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;
      }

      const k = (activeN * Math.PI) / s.L;
      const w = 2 * Math.PI * activeF;

      const pts: THREE.Vector3[] = [];
      for (const b of balls) {
        const xp = b.position.x - s.xL;
        b.position.y = s.cy + 2 * activeA * Math.sin(k * xp) * Math.cos(w * s.lt);
        pts.push(b.position.clone());
      }
      line.geometry.setFromPoints(pts);

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        n: activeN.toString(),
        lam: ((2 * s.L) / activeN).toFixed(2),
        nodes: (activeN + 1).toString(),
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
      postGeo.dispose();
      postMat.dispose();
      balls.forEach((b) => {
        b.geometry.dispose();
      });
      ballGeo.dispose();
      ballMat.dispose();
      line.geometry.dispose();
      lineMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      while (nodesGroup.children.length) {
        const child = nodesGroup.children[0] as THREE.Mesh;
        nodesGroup.remove(child);
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
