import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface ACGenSimulationProps extends SimulationProps {
  onStep?: (t: number, e: number, E0: number, f: number) => void;
  resetKey?: number;
}

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';

function cssColor(hex: number): string {
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}

function makeTextSprite(text: string, color = 0xffffff, fs = 56) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = cssColor(color);
  g.font = `bold ${fs}px ${PHYS_FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  s.scale.set(1, 0.5, 1);
  s.renderOrder = 25;
  return s;
}

function makePole(letter: string, color: number) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.2, 2.4),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.7 })
  );
  body.castShadow = true;
  g.add(body);

  const lbl = makeTextSprite(letter, 0xffffff, 96);
  lbl.scale.set(1, 0.5, 1);
  lbl.position.set(0, 0, 1.25);
  lbl.material.depthTest = true;
  g.add(lbl);

  return g;
}

export default function ACGenSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: ACGenSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const w = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'w');
    return p ? p.value : 3.0;
  }, [config.parameters]);

  const B = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'B');
    return p ? p.value : 1.0;
  }, [config.parameters]);

  const N = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'N');
    return p ? p.value : 4;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    pts: [] as [number, number][],
    cy: 4.2,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    w,
    B,
    N,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.w = w;
    refs.current.B = B;
    refs.current.N = N;
  }, [isPlaying, isSlow, w, B, N]);

  // Reset phase when controls or reset key change
  useEffect(() => {
    stateRef.current.lt = 0;
    stateRef.current.pts = [];
  }, [w, B, N, resetKey]);

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

    // ── 4. Set Up Poles & Rotating Coil ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Pole N (Red)
    const poleN = makePole('N', 0xe8453a);
    poleN.position.set(-4.5, s.cy, 0);
    group.add(poleN);

    // Pole S (Blue)
    const poleS = makePole('S', 0x3a78e8);
    poleS.position.set(4.5, s.cy, 0);
    group.add(poleS);

    // Square Coil Loop Group
    const coil = new THREE.Group();
    coil.position.set(0, s.cy, 0);
    group.add(coil);

    // Frame (Square Torus)
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.08, 8, 4),
      new THREE.MeshStandardMaterial({ color: 0xd0a050, roughness: 0.3, metalness: 0.8 })
    );
    frame.rotation.z = Math.PI / 4;
    coil.add(frame);

    // ── 5. Panel Graph ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 320) => {
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

    const gPanel = makePanel(6.3, 6, -1, 7);

    const roDefs = [
      { key: 'e', label: "Suất điện động", unit: 'V' },
      { key: 'E0', label: "Suất điện động cực đại", unit: 'V' },
      { key: 'f', label: "Tần số", unit: 'Hz' }
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
      g.font = '600 21px sans-serif';
      g.textAlign = 'center';
      g.fillText(o.xlabel || 't (s)', (x0 + x1) / 2, H - 16);
      g.save();
      g.translate(24, (y0 + y1) / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(o.ylabel || 'e (V)', 0, 0);
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
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      dt = Math.min(dt, 0.05);

      const activeW = refs.current.w;
      const activeB = refs.current.B;
      const activeN = refs.current.N;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;
      }

      coil.rotation.y = activeW * s.lt;

      const E0 = activeN * activeB * 1.5 * activeW;
      const e = E0 * Math.cos(activeW * s.lt);

      const win = 6;
      if (refs.current.isPlaying) {
        if (s.pts.length === 0 || s.lt - s.pts[s.pts.length - 1][0] > 0.02) {
          s.pts.push([s.lt, e]);
        }
      } else if (s.pts.length === 0) {
        s.pts.push([0, e]);
      }
      const xmin = Math.max(0, s.lt - win);
      while (s.pts.length && s.pts[0][0] < xmin) {
        s.pts.shift();
      }

      const ym = Math.max(5.0, E0 * 1.1);

      drawGraph(gPanel, {
        title: 'Suất điện động e theo t',
        xlabel: 't (s)',
        ylabel: 'e (V)',
        xmin,
        xmax: xmin + win,
        ymin: -ym,
        ymax: ym,
        series: [{ pts: s.pts, color: '#ffca28', label: 'e' }],
      });

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        e: e.toFixed(1),
        E0: E0.toFixed(1),
        f: (activeW / (2 * Math.PI)).toFixed(2),
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
      poleN.children.forEach((c) => {
        (c as THREE.Mesh).geometry.dispose();
        ((c as THREE.Mesh).material as THREE.Material).dispose();
      });
      poleS.children.forEach((c) => {
        (c as THREE.Mesh).geometry.dispose();
        ((c as THREE.Mesh).material as THREE.Material).dispose();
      });
      frame.geometry.dispose();
      (frame.material as THREE.Material).dispose();
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
