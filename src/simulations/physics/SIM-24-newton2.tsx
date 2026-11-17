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

export default function Newton2Simulation({
  config,
  isPlaying = false,
  isSlow = false,
  onAnimationEnd,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const F = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'F');
    return p ? p.value : 8;
  }, [config.parameters]);

  const m = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'm');
    return p ? p.value : 2;
  }, [config.parameters]);

  const mu = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'mu');
    return p ? p.value : 0;
  }, [config.parameters]);

  const acceleration = useMemo(() => {
    // Định luật II Newton có ma sát: a = F/m − μg (kẹp ≥ 0 khi lực kéo chưa thắng ma sát)
    return Math.max(0, F / m - mu * 9.8);
  }, [F, m, mu]);

  const stateRef = useRef({
    t: 0,
    done: false,
    x: 0,
    v: 0,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    acceleration,
    onAnimationEnd,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.acceleration = acceleration;
    refs.current.onAnimationEnd = onAnimationEnd;
  }, [isPlaying, isSlow, acceleration, onAnimationEnd]);

  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.done = false;
    stateRef.current.x = 0;
    stateRef.current.v = 0;
  }, [acceleration, resetKey]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Scene, Camera, Renderer ──
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
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // ── 2. Add Lighting ──
    const hemi = new THREE.HemisphereLight(0xdcecff, 0x2a3744, 0.95);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(7, 16, 10);
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

    // ── 4. Build Track & Cart ──
    const track = new THREE.Group();
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.3, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x2c3e54, roughness: 0.55 })
    );
    rail.position.y = 0.15;
    rail.receiveShadow = true;
    track.add(rail);

    for (let i = -10; i < 11; i += 2) {
      const tMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.07, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x5a7693, roughness: 0.4 })
      );
      tMesh.position.set(i, 0.33, 0);
      track.add(tMesh);
    }
    scene.add(track);

    // Scaling factor based on mass
    const scaleFactor = 0.8 + m * 0.08;
    const cart = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2 * scaleFactor, 0.6 * scaleFactor, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xff9800, roughness: 0.55 })
    );
    body.position.y = 0.3 + 0.3 * scaleFactor;
    body.castShadow = true;
    cart.add(body);

    const wMat = new THREE.MeshStandardMaterial({ color: 0x232a33, roughness: 0.4, metalness: 0.5 });
    for (const sx of [-0.4 * scaleFactor, 0.4 * scaleFactor]) {
      for (const sz of [-0.45, 0.45]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16), wMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(sx, 0.35, sz);
        cart.add(wheel);
      }
    }
    scene.add(cart);

    const startX = -10;
    cart.position.x = startX;

    // ── 5. Vector Arrow ──
    const makeVectorArrow = (color: number, label: string) => {
      const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 12), mat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.35, 16), mat);
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

    // ── 6. Stats Panel ──


    const roDefs = [
      { key: 't', label: "Thời gian", unit: 's' },
      { key: 'a', label: "Gia tốc", unit: 'm/s²' },
      { key: 'v', label: "Vận tốc", unit: 'm/s' },
      { key: 'x', label: "Quãng đường", unit: 'm' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

    // ── 7. Loop ──
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
      const { isPlaying: activePlaying, isSlow: activeSlow, acceleration: activeA, onAnimationEnd: activeOnAnimEnd } = refs.current;

      if (activePlaying && !state.done) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;
        const t = state.t;
        const a = activeA;
        const v = a * t;
        const x = 0.5 * a * t * t;

        let xw = startX + x;
        if (xw >= 10) {
          xw = 10;
          state.done = true;
          state.v = a * t;
          if (activeOnAnimEnd) activeOnAnimEnd();
        }

        state.x = x;
        state.v = v;
        cart.position.x = xw;

        // Force vector arrow
        const arrowLength = Math.min(4, F * 0.25 + 0.4);
        fArrow.set(new THREE.Vector3(1, 0, 0), arrowLength, new THREE.Vector3(xw + 0.6 * scaleFactor, 0.3 + 0.3 * scaleFactor, 0));

        // Stats Panel
        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          F: F.toFixed(1),
          m: m.toFixed(1),
          a: a.toFixed(2),
          v: v.toFixed(2),
          x: x.toFixed(2)
        });
      } else if (!activePlaying && state.t === 0) {
        cart.position.x = startX;
        const arrowLength = Math.min(4, F * 0.25 + 0.4);
        fArrow.set(new THREE.Vector3(1, 0, 0), arrowLength, new THREE.Vector3(startX + 0.6 * scaleFactor, 0.3 + 0.3 * scaleFactor, 0));

        drawStats(statsPanel, roDefs, {
          t: '0.00',
          F: F.toFixed(1),
          m: m.toFixed(1),
          a: acceleration.toFixed(2),
          v: '0.00',
          x: '0.00'
        });
      } else {
        // Paused or done
        const arrowLength = Math.min(4, F * 0.25 + 0.4);
        const xw = startX + state.x;
        fArrow.set(new THREE.Vector3(1, 0, 0), arrowLength, new THREE.Vector3(xw + 0.6 * scaleFactor, 0.3 + 0.3 * scaleFactor, 0));

        drawStats(statsPanel, roDefs, {
          t: state.t.toFixed(2),
          F: F.toFixed(1),
          m: m.toFixed(1),
          a: acceleration.toFixed(2),
          v: state.v.toFixed(2),
          x: state.x.toFixed(2)
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
      statsPanel.dispose();
      fArrow.dispose();
      rail.geometry.dispose();
      (rail.material as THREE.Material).dispose();
      body.geometry.dispose();
      (body.material as THREE.Material).dispose();
      wMat.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [F, m, resetKey]);

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
