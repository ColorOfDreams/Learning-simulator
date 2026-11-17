import { createReadoutPanel, drawStats } from './readout-panel';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface InductionSimulationProps extends SimulationProps {
  onStep?: (t: number, phi: number, e: number, phase: string) => void;
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

function makeCoil(turns = 8, rad = 1.2, len = 3.4, color = 0xc88a3a) {
  const g = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(rad, 0.08, 8, 28);
  const ringMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.8 });
  for (let i = 0; i < turns; i++) {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = -len / 2 + (len * i) / (turns - 1);
    g.add(ring);
  }
  return g;
}

function makeNeedleGauge(x: number, y: number, z: number) {
  const g = new THREE.Group();
  const face = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, 0.15, 28),
    new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 0.9 })
  );
  face.rotation.x = Math.PI / 2;
  g.add(face);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.08, 8, 28),
    new THREE.MeshStandardMaterial({ color: 0x44525f, roughness: 0.5 })
  );
  g.add(ring);

  const zero = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.5, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.9 })
  );
  zero.position.y = 0.55;
  zero.position.z = 0.1;
  g.add(zero);

  const needle = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.95, 0.04),
    new THREE.MeshBasicMaterial({ color: 0xe8453a })
  );
  needle.position.y = 0.35;

  const needleHub = new THREE.Group();
  needleHub.add(needle);
  needleHub.position.z = 0.12;
  g.add(needleHub);

  const lbl = makeTextSprite('G', 0x37474f, 64);
  lbl.scale.set(0.4, 0.2, 1);
  lbl.position.set(0, -0.55, 0.12);
  lbl.material.depthTest = true;
  g.add(lbl);

  g.position.set(x, y, z);

  return {
    group: g,
    set(val: number) {
      needleHub.rotation.z = -Math.max(-1, Math.min(1, val)) * 1.0;
    },
    dispose() {
      face.geometry.dispose();
      (face.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      zero.geometry.dispose();
      (zero.material as THREE.Material).dispose();
      needle.geometry.dispose();
      (needle.material as THREE.Material).dispose();
      lbl.geometry.dispose();
      (lbl.material as THREE.Material).dispose();
    }
  };
}

export default function InductionSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: InductionSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const spd = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'spd');
    return p ? p.value : 1.5;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    prevPhi: 0,
    pts: [] as [number, number][],
    cy: 4,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    spd,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.spd = spd;
  }, [isPlaying, isSlow, spd]);

  // Reset physics states
  useEffect(() => {
    stateRef.current.lt = 0;
    stateRef.current.prevPhi = 0;
    stateRef.current.pts = [];
  }, [spd, resetKey]);

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

    // ── 4. Set Up Solenoid Coil & Magnet ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Coil
    const coil = makeCoil(8, 1.2, 3.4);
    coil.position.set(0, s.cy, 0);
    group.add(coil);

    // Magnet N (Red) and S (Blue) parts
    const magnetN = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xe8453a, roughness: 0.3, metalness: 0.8 })
    );
    group.add(magnetN);

    const magnetS = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.8, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x3a78e8, roughness: 0.3, metalness: 0.8 })
    );
    group.add(magnetS);

    // Magnet text labels N and S
    const lblN = makeTextSprite('N', 0xffffff, 80);
    lblN.scale.set(0.5, 0.5, 1);
    group.add(lblN);

    const lblS = makeTextSprite('S', 0xffffff, 80);
    lblS.scale.set(0.5, 0.5, 1);
    group.add(lblS);

    // Galvanometer gauge
    const gauge = makeNeedleGauge(7, 4.4, -0.5);
    group.add(gauge.group);

    // ── 5. Graph Panel ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 480, py = 320) => {
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

    const gPanel = makePanel(6.2, 7.4, -1, 6);

    const roDefs = [
      { key: 'phi', label: "Từ thông", unit: '' },
      { key: 'e', label: "Suất điện động", unit: 'V' },
      { key: 'st', label: "Nam châm", unit: '' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

    const drawGraph = (panel: any, o: any) => {
      const g = panel.g;
      const W = 480;
      const H = 320;
      g.fillStyle = '#0e1f33';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#2f4760';
      g.lineWidth = 3;
      g.strokeRect(5, 5, W - 10, H - 10);
      g.fillStyle = '#bfe0ff';
      g.textAlign = 'center';
      g.font = `bold 28px ${PHYS_FONT}`;
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
      g.font = '600 18px sans-serif';
      g.textAlign = 'center';
      g.fillText(o.xlabel || 't (s)', (x0 + x1) / 2, H - 16);
      g.save();
      g.translate(24, (y0 + y1) / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(o.ylabel || '', 0, 0);
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

      const activeSpd = refs.current.spd;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;
      }

      const x = 6 * Math.sin(activeSpd * s.lt);
      magnetN.position.set(x - 0.75, s.cy, 0);
      magnetS.position.set(x + 0.75, s.cy, 0);
      lblN.position.set(x - 0.75, s.cy, 0.45);
      lblS.position.set(x + 0.75, s.cy, 0.45);

      // Magnetic flux through solenoid (peaks when magnet is centered)
      const phi = Math.exp(-(x * x) / 4);
      // EMF is the negative rate of change of flux (Faraday's Law)
      const e = -(phi - s.prevPhi) / Math.max(dt, 0.001);
      s.prevPhi = phi;

      // Update galvanometer needle deflection
      gauge.set(Math.max(-1.0, Math.min(1.0, e * 0.6)));

      // Graph recording
      const win = 6;
      if (refs.current.isPlaying) {
        if (s.pts.length === 0 || s.lt - s.pts[s.pts.length - 1][0] > 0.03) {
          s.pts.push([s.lt, phi]);
        }
      } else if (s.pts.length === 0) {
        s.pts.push([0, phi]);
      }
      const xmin = Math.max(0, s.lt - win);
      while (s.pts.length && s.pts[0][0] < xmin) {
        s.pts.shift();
      }

      drawGraph(gPanel, {
        title: 'Từ thông Φ theo t',
        xlabel: 't (s)',
        ylabel: 'Φ',
        xmin,
        xmax: xmin + win,
        ymin: 0,
        ymax: 1.1,
        series: [{ pts: s.pts, color: '#5ee1a0', label: 'Φ' }],
      });

      // Update stats panel
      const stVal = magnetN.position.x < 0
        ? (Math.cos(activeSpd * s.lt) > 0 ? 'đang vào' : 'đang ra')
        : (Math.cos(activeSpd * s.lt) > 0 ? 'đang ra' : 'đang vào');

      drawStats(statsPanel, roDefs, {
        phi: phi.toFixed(2),
        e: e.toFixed(2),
        st: stVal,
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
      gauge.dispose();
      coil.children.forEach((c) => {
        (c as THREE.Mesh).geometry.dispose();
        ((c as THREE.Mesh).material as THREE.Material).dispose();
      });
      magnetN.geometry.dispose();
      (magnetN.material as THREE.Material).dispose();
      magnetS.geometry.dispose();
      (magnetS.material as THREE.Material).dispose();
      lblN.geometry.dispose();
      (lblN.material as THREE.Material).dispose();
      lblS.geometry.dispose();
      (lblS.material as THREE.Material).dispose();
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
