import { getResponsiveFov } from '../camera';
import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface NuclearSimulationProps extends SimulationProps {
  onStep?: (t: number, dE: string, phase: string, typeName: string) => void;
  resetKey?: number;
}

function makeNucleus(color: number, r = 0.3) {
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

export default function NuclearSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: NuclearSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const type = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'type');
    return p ? p.value : 0; // 0: Fission, 1: Fusion
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    cy: 4.2,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    type,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.type = type;
  }, [isPlaying, isSlow, type]);

  // Reset clock when type or reset key changes
  useEffect(() => {
    stateRef.current.lt = 0;
  }, [type, resetKey]);

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

    // ── 4. Set Up Nuclear Particles ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Reactant A (Nucleus 1)
    const A = makeNucleus(0xe88a2a, 0.9);
    A.position.set(0, s.cy, 0);
    group.add(A);

    // Reactant B (Nucleus 2 - Fusion only)
    const B = makeNucleus(0x3a78e8, 0.6);
    group.add(B);

    // Incoming neutron n0 (Fission only)
    const n0 = makeNucleus(0xcfd6df, 0.2);
    group.add(n0);

    // Fragments frag (Fission Ba-139 / Kr-94)
    const frag = [
      makeNucleus(0xffca28, 0.55),
      makeNucleus(0x9ad06a, 0.5),
    ];
    frag.forEach((f) => group.add(f));

    // Emitted neutrons neus (Fission 3 neutrons, Fusion 1 neutron)
    const neus = [
      makeNucleus(0xcfd6df, 0.18),
      makeNucleus(0xcfd6df, 0.18),
      makeNucleus(0xcfd6df, 0.18),
    ];
    neus.forEach((nn) => group.add(nn));

    // Explosive light flash
    const flash = new THREE.PointLight(0xffd060, 0, 18);
    flash.position.set(0, s.cy, 1);
    group.add(flash);

    // ── 5. Stats Panel ──


    const roDefs = [
      { key: 'type', label: "Phản ứng", unit: '' },
      { key: 'dE', label: "Năng lượng tỏa", unit: 'MeV' },
      { key: 'ph', label: "Giai đoạn", unit: '' }
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

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;
      }

      const activeType = refs.current.type;
      const fission = activeType < 0.5;

      const cyc = 4; // 4 second loop cycle
      const t = s.lt % cyc;

      // Hide all by default
      B.visible = false;
      n0.visible = false;
      frag.forEach((f) => (f.visible = false));
      neus.forEach((nn) => (nn.visible = false));
      A.visible = true;

      let dE = '0';
      let phase = '';
      let typeName = '';

      if (fission) {
        typeName = 'Phân hạch ²³⁵U';
        dE = '≈ 200';
        A.scale.setScalar(1.0);
        const mat = A.material as THREE.MeshStandardMaterial;
        mat.color.setHex(0xe88a2a); // Orange

        if (t < 1) {
          // Phase 1: Neutron approaches U-235
          n0.visible = true;
          n0.position.set(-7 + t * 7, s.cy, 0);

          // Vibrate U-235 slightly
          A.scale.setScalar(1.0 + Math.sin(t * 6) * 0.04);
          flash.intensity = 0;
          phase = 'neutron bắn tới';
        } else {
          // Phase 2: Split apart
          const k = Math.min(1.0, (t - 1) / 2.6);
          A.visible = false;

          // Ba-139 / Kr-94 fly apart
          frag.forEach((f, idx) => {
            f.visible = true;
            f.position.set(
              (idx ? 1 : -1) * (1.0 + k * 5.0),
              s.cy + (idx ? 0.6 : -0.6) * k,
              0
            );
          });

          // 3 neutrons fly away
          neus.forEach((nn, idx) => {
            nn.visible = true;
            const angle = idx * 2.1;
            nn.position.set(
              Math.cos(angle) * k * 6.0,
              s.cy + Math.sin(angle) * k * 4.0,
              0
            );
          });

          // Explosive flash decay
          flash.intensity = Math.max(0, 6.0 * (1.0 - k * 2.0));
          phase = 'vỡ + tỏa năng lượng';
        }
      } else {
        typeName = 'Nhiệt hạch D + T';
        dE = '≈ 17.6';

        if (t < 1.2) {
          // Phase 1: Deuterium and Tritium approach each other
          A.scale.setScalar(0.55);
          const mat = A.material as THREE.MeshStandardMaterial;
          mat.color.setHex(0xe8453a); // Red (D)
          A.position.set(-2 + t * 1.7, s.cy, 0);

          B.visible = true;
          B.position.set(2 - t * 1.7, s.cy, 0);
          flash.intensity = 0;
          phase = 'hạt nhân nhẹ lại gần';
        } else {
          // Phase 2: Fuse into Helium-4 + neutron
          const k = Math.min(1.0, (t - 1.2) / 2.4);
          A.scale.setScalar(0.8);
          const mat = A.material as THREE.MeshStandardMaterial;
          mat.color.setHex(0x9ad06a); // Green (He-4)
          A.position.set(0, s.cy, 0);

          B.visible = false;

          // 1 neutron flies away
          neus[0].visible = true;
          neus[0].position.set(k * 6.0, s.cy + k * 3.0, 0);

          // Explosive flash decay
          flash.intensity = Math.max(0, 7.0 * (1.0 - k * 2.0));
          phase = 'hợp nhất → He + n';
        }
      }

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        type: typeName,
        dE: dE,
        ph: phase,
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
      A.geometry.dispose();
      (A.material as THREE.Material).dispose();
      B.geometry.dispose();
      (B.material as THREE.Material).dispose();
      n0.geometry.dispose();
      (n0.material as THREE.Material).dispose();
      frag.forEach((f) => {
        f.geometry.dispose();
        (f.material as THREE.Material).dispose();
      });
      neus.forEach((nn) => {
        nn.geometry.dispose();
        (nn.material as THREE.Material).dispose();
      });
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
