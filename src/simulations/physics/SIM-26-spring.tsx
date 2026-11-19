import { getResponsiveFov } from '../camera';
import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';
const _Y = new THREE.Vector3(0, 1, 0);

function cssColor(hex: number): string {
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function drawBars(panel: any, o: any) {
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

  o.bars.forEach((b: any, i: number) => {
    const x = 60 + i * bw + bw * 0.16;
    const w = bw * 0.68;
    const h = Math.max(0, Math.min(1, b.val / max)) * maxH;
    g.fillStyle = '#16304a';
    g.fillRect(x, top, w, maxH);
    g.fillStyle = b.color;
    g.fillRect(x, baseY - h, w, h);
    g.fillStyle = '#cfe2f7';
    g.textAlign = 'center';
    g.font = `bold 21px ${PHYS_FONT}`;
    g.fillText(b.label, x + w / 2, baseY + 30);
    g.fillStyle = '#fff';
    g.font = `bold 22px ${PHYS_FONT}`;
    g.fillText(b.val.toFixed(1), x + w / 2, baseY - h - 12);
  });
  g.setTransform(1, 0, 0, 1, 0, 0);
  panel.flush();
}

function makeLabelSprite(text: string, color: number) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const g = c.getContext('2d')!;
  const col = cssColor(color);
  g.fillStyle = 'rgba(8, 16, 28, 0.86)';
  rr(g, 3, 3, 250, 90, 18);
  g.fill();
  g.strokeStyle = col;
  g.lineWidth = 5;
  rr(g, 3, 3, 250, 90, 18);
  g.stroke();
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `bold 54px ${PHYS_FONT}`;
  g.fillStyle = col;
  g.fillText(text, 128, 52);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
  );
  s.scale.set(1.35, 0.5, 1);
  s.renderOrder = 31;
  return s;
}

export default function SpringSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const k = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'k');
    return p ? p.value : 20;
  }, [config.parameters]);

  const m = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'm');
    return p ? p.value : 1;
  }, [config.parameters]);

  const A = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'A');
    return p ? p.value : 2;
  }, [config.parameters]);

  const stateRef = useRef({
    t: 0,
    x: A,
    v: 0,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    k,
    m,
    A,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.k = k;
    refs.current.m = m;
    refs.current.A = A;
  }, [isPlaying, isSlow, k, m, A]);

  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.x = A;
    stateRef.current.v = 0;
  }, [k, m, A, resetKey]);

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
    controls.target.set(0, 2.5, 0);
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

    // ── 4. Wall, Spring & Mass Block ──
    const wallX = -7;
    const eqX = -1;

    // Wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 3.2, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x44525f, roughness: 0.4, metalness: 0.8 })
    );
    wall.position.set(wallX, 1.6, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);

    // Spring Helix
    const coils = 11;
    const rad = 0.34;
    const N = coils * 16;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      pts.push(new THREE.Vector3(u, Math.cos(u * coils * 6.2832) * rad, Math.sin(u * coils * 6.2832) * rad));
    }
    const springGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, 0.05, 6);
    const spring = new THREE.Mesh(springGeo, new THREE.MeshStandardMaterial({ color: 0xb4bcc8, roughness: 0.2, metalness: 0.9 }));
    spring.position.set(wallX + 0.2, 1, 0);
    spring.castShadow = true;
    scene.add(spring);

    // Mass Block
    const scaleFactor = 0.8 + m * 0.08;
    const mass = new THREE.Mesh(
      new THREE.BoxGeometry(1.1 * scaleFactor, 1.1 * scaleFactor, 1.1 * scaleFactor),
      new THREE.MeshStandardMaterial({ color: 0x7c5cff, roughness: 0.6 })
    );
    mass.position.y = 1;
    mass.castShadow = true;
    scene.add(mass);

    // helper function to place mass and spring
    const placeMassSpring = (xDisplacement: number) => {
      const massX = eqX + xDisplacement;
      mass.position.x = massX;
      spring.scale.x = (massX - 0.55 * scaleFactor) - (wallX + 0.2);
    };

    placeMassSpring(A);

    // ── 5. Vector Arrow ──
    const makeVectorArrow = (color: number, label: string) => {
      const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 12), mat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.35, 16), mat);
      const gGroup = new THREE.Group();
      gGroup.add(shaft);
      gGroup.add(head);
      gGroup.renderOrder = 30;
      shaft.renderOrder = 30;
      head.renderOrder = 30;
      scene.add(gGroup);
      const lab = makeLabelSprite(label, color);
      scene.add(lab);

      return {
        g: gGroup,
        label: lab,
        set(dir: THREE.Vector3, len: number, origin: THREE.Vector3) {
          if (len < 0.05) {
            gGroup.visible = false;
            lab.visible = false;
            return;
          }
          gGroup.visible = true;
          lab.visible = true;
          len = Math.max(len, 0.35);
          const d = dir.clone().normalize();
          gGroup.position.copy(origin);
          gGroup.quaternion.setFromUnitVectors(_Y, d);
          const hl = Math.min(0.4, len * 0.4), sl = Math.max(0.05, len - hl);
          shaft.scale.y = sl;
          shaft.position.y = sl / 2;
          head.scale.set(1, hl / 0.35, 1);
          head.position.y = sl + hl / 2;
          lab.position.copy(gGroup.position).addScaledVector(d, len + 0.4);
        },
        dispose() {
          scene.remove(gGroup);
          scene.remove(lab);
          shaft.geometry.dispose();
          head.geometry.dispose();
          mat.dispose();
        }
      };
    };

    const fArrow = makeVectorArrow(0xff5252, 'F');

    // ── 6. Panels ──
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

    const vgBarsPanel = makePanel(5.8, 5.3, -1, 5.4);
    const roDefs = [
      { key: 't', label: "Thời gian", unit: 's' },
      { key: 'x', label: "Li độ", unit: 'm' },
      { key: 'F', label: "Lực đàn hồi", unit: 'N' },
      { key: 'T', label: "Chu kỳ riêng", unit: 's' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

    // ── 7. Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      vgBarsPanel.grp.lookAt(camera.position);
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      dt = Math.min(dt, 0.05);

      const state = stateRef.current;
      const { isPlaying: activePlaying, isSlow: activeSlow, k: activeK, m: activeM, A: activeA } = refs.current;

      const w = Math.sqrt(activeK / activeM);
      const T = 2 * Math.PI / w;

      if (activePlaying) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;
        const t = state.t;
        const x = activeA * Math.cos(w * t);
        const v = -activeA * w * Math.sin(w * t);

        state.x = x;
        state.v = v;

        placeMassSpring(x);

        // Spring force
        const F_elastic = activeK * x;
        const arrowDir = new THREE.Vector3(-Math.sign(x) || 1, 0, 0);
        const arrowLen = Math.min(3, Math.abs(F_elastic) * 0.08 + 0.3);
        fArrow.set(arrowDir, arrowLen, mass.position.clone().add(new THREE.Vector3(0, 1, 0)));

        // Energy calculations
        const PE = 0.5 * activeK * x * x;
        const KE = 0.5 * activeM * v * v;
        const E_total = 0.5 * activeK * activeA * activeA;

        drawBars(vgBarsPanel, {
          title: 'Năng lượng (J)',
          max: E_total,
          bars: [
            { label: 'Thế năng', val: PE, color: '#ffc24a' },
            { label: 'Động năng', val: KE, color: '#5ee1a0' },
            { label: 'Cơ năng', val: E_total, color: '#7cc4ff' }
          ]
        });

        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          x: x.toFixed(2),
          F: F_elastic.toFixed(2),
          T: T.toFixed(2)
        });
      } else if (!activePlaying && state.t === 0) {
        // Reset state
        placeMassSpring(activeA);
        const F_elastic = activeK * activeA;
        const arrowDir = new THREE.Vector3(-Math.sign(activeA) || 1, 0, 0);
        const arrowLen = Math.min(3, Math.abs(F_elastic) * 0.08 + 0.3);
        fArrow.set(arrowDir, arrowLen, mass.position.clone().add(new THREE.Vector3(0, 1, 0)));

        const E_total = 0.5 * activeK * activeA * activeA;
        drawBars(vgBarsPanel, {
          title: 'Năng lượng (J)',
          max: E_total,
          bars: [
            { label: 'Thế năng', val: E_total, color: '#ffc24a' },
            { label: 'Động năng', val: 0.0, color: '#5ee1a0' },
            { label: 'Cơ năng', val: E_total, color: '#7cc4ff' }
          ]
        });

        drawStats(statsPanel, roDefs, {
          t: '0.00',
          x: activeA.toFixed(2),
          F: F_elastic.toFixed(2),
          T: T.toFixed(2)
        });
      } else {
        // Paused, display constant values
        const t = state.t;
        const x = state.x;
        const v = state.v;
        placeMassSpring(x);

        const F_elastic = activeK * x;
        const arrowDir = new THREE.Vector3(-Math.sign(x) || 1, 0, 0);
        const arrowLen = Math.min(3, Math.abs(F_elastic) * 0.08 + 0.3);
        fArrow.set(arrowDir, arrowLen, mass.position.clone().add(new THREE.Vector3(0, 1, 0)));

        const PE = 0.5 * activeK * x * x;
        const KE = 0.5 * activeM * v * v;
        const E_total = 0.5 * activeK * activeA * activeA;

        drawBars(vgBarsPanel, {
          title: 'Năng lượng (J)',
          max: E_total,
          bars: [
            { label: 'Thế năng', val: PE, color: '#ffc24a' },
            { label: 'Động năng', val: KE, color: '#5ee1a0' },
            { label: 'Cơ năng', val: E_total, color: '#7cc4ff' }
          ]
        });

        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          x: x.toFixed(2),
          F: F_elastic.toFixed(2),
          T: T.toFixed(2)
        });
      }

      controls.update();
      render();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // ── 8. Resizing ──
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

    // ── 9. Cleanup ──
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      vgBarsPanel.dispose();
      statsPanel.dispose();
      fArrow.dispose();
      wall.geometry.dispose();
      (wall.material as THREE.Material).dispose();
      springGeo.dispose();
      (spring.material as THREE.Material).dispose();
      mass.geometry.dispose();
      (mass.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [k, m, A, resetKey]);

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
