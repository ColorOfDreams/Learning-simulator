import { getResponsiveFov } from '../camera';
import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

// cssColor and rr functions removed as they were unused

export default function PendulumSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const L = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'L');
    return p ? p.value : 4;
  }, [config.parameters]);

  const gVal = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'g');
    return p ? p.value : 9.8;
  }, [config.parameters]);

  const th0 = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'th');
    return p ? p.value : 20;
  }, [config.parameters]);

  const stateRef = useRef({
    t: 0,
    angle: th0,
    n: 0,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    L,
    gVal,
    th0,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.L = L;
    refs.current.gVal = gVal;
    refs.current.th0 = th0;
  }, [isPlaying, isSlow, L, gVal, th0]);

  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.angle = th0;
    stateRef.current.n = 0;
  }, [L, gVal, th0, resetKey]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Create Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(getResponsiveFov(45, width / height), width / height, 0.1, 100);
    camera.position.set(0, 5.5, 18);

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

    // ── 4. Pendulum Support Beam ──
    const pivotY = 8.5;
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.25, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x556070, roughness: 0.4, metalness: 0.7 })
    );
    beam.position.set(0, pivotY + 0.125, 0);
    beam.castShadow = true;
    scene.add(beam);

    // Hub Group (pivots around Z-axis)
    const hub = new THREE.Group();
    hub.position.set(0, pivotY, 0);
    scene.add(hub);

    // Rod
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1, 8),
      new THREE.MeshStandardMaterial({ color: 0xcfd6df, roughness: 0.2, metalness: 0.9 })
    );
    rod.castShadow = true;
    hub.add(rod);

    // Bob Sphere
    const bob = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 24),
      new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.4, metalness: 0.1 })
    );
    bob.castShadow = true;
    hub.add(bob);

    // Adjust rod and bob scaling/position based on L
    rod.scale.y = L;
    rod.position.y = -L / 2;
    bob.position.y = -L;

    // Initial rotation angle
    hub.rotation.z = (th0 * Math.PI) / 180;

    // ── 5. Stats Panel ──


    const roDefs = [
      { key: 't', label: "Thời gian", unit: 's' },
      { key: 'th', label: "Góc lệch", unit: '°' },
      { key: 'T', label: "Chu kỳ", unit: 's' },
      { key: 'n', label: "Số dao động", unit: '' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

    // ── 6. Loop ──
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

      const state = stateRef.current;
      const { isPlaying: activePlaying, isSlow: activeSlow, L: activeL, gVal: activeG, th0: activeTh0 } = refs.current;

      const w = Math.sqrt(activeG / activeL);
      const T = 2 * Math.PI / w;
      const th0Rad = (activeTh0 * Math.PI) / 180;

      // Ensure cylinder scaling is updated in case L changes dynamically
      rod.scale.y = activeL;
      rod.position.y = -activeL / 2;
      bob.position.y = -activeL;

      if (activePlaying) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;
        const t = state.t;
        const th = th0Rad * Math.cos(w * t);

        state.angle = th * 180 / Math.PI;
        state.n = Math.floor(t / T);

        hub.rotation.z = th;

        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          th: state.angle.toFixed(1),
          T: T.toFixed(2),
          n: state.n.toString()
        });
      } else if (!activePlaying && state.t === 0) {
        hub.rotation.z = th0Rad;
        drawStats(statsPanel, roDefs, {
          t: '0.00',
          th: activeTh0.toFixed(1),
          T: T.toFixed(2),
          n: '0'
        });
      } else {
        // Paused
        hub.rotation.z = (state.angle * Math.PI) / 180;
        drawStats(statsPanel, roDefs, {
          t: state.t.toFixed(2),
          th: state.angle.toFixed(1),
          T: T.toFixed(2),
          n: state.n.toString()
        });
      }

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
        camera.fov = getResponsiveFov(45, camera.aspect);
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
      beam.geometry.dispose();
      (beam.material as THREE.Material).dispose();
      rod.geometry.dispose();
      (rod.material as THREE.Material).dispose();
      bob.geometry.dispose();
      (bob.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [L, gVal, th0, resetKey]);

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
