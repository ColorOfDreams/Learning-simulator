import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface LorentzSimulationProps extends SimulationProps {
  onStep?: (R: number, F: number, v: number) => void;
  resetKey?: number;
}

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

function drawRich(g: CanvasRenderingContext2D, text: string, x: number, y: number, fs: number, color: string, align: 'left' | 'right' | 'center' = 'left') {
  const parts: Array<{ s: string; sub: boolean }> = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === '_') {
      i++;
      let sub = '';
      if (text[i] === '{') {
        const e = text.indexOf('}', i);
        const end = e < 0 ? text.length : e;
        sub = text.slice(i + 1, end);
        i = e < 0 ? text.length : e + 1;
      } else {
        sub = text[i] || '';
        i++;
      }
      parts.push({ s: sub, sub: true });
    } else {
      let j = i;
      while (j < text.length && text[j] !== '_') j++;
      parts.push({ s: text.slice(i, j), sub: false });
      i = j;
    }
  }
  const subFs = Math.round(fs * 0.68);
  const subDy = fs * 0.16;
  let w = 0;
  for (const p of parts) {
    g.font = `bold ${p.sub ? subFs : fs}px ${PHYS_FONT}`;
    w += g.measureText(p.s).width;
  }
  let cx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  const prev = g.textAlign;
  g.textAlign = 'left';
  g.fillStyle = color;
  for (const p of parts) {
    g.font = `bold ${p.sub ? subFs : fs}px ${PHYS_FONT}`;
    g.fillText(p.s, cx, y + (p.sub ? subDy : 0));
    cx += g.measureText(p.s).width;
  }
  g.textAlign = prev;
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

function bFieldMarkers(group: THREE.Group, into = true, nx = 7, ny = 5, x0 = -7, x1 = 7, y0 = 1, y1 = 8) {
  const sprites: THREE.Sprite[] = [];
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const s = makeTextSprite(into ? '⊗' : '⊙', 0x6f8db0, 70);
      s.scale.set(0.5, 0.5, 1);
      s.position.set(
        x0 + ((x1 - x0) * i) / (nx - 1),
        y0 + ((y1 - y0) * j) / (ny - 1),
        -0.5
      );
      group.add(s);
      sprites.push(s);
    }
  }
  return sprites;
}

function makeCharge(r = 0.6) {
  const g = new THREE.Group();
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(r, 24, 18),
    new THREE.MeshStandardMaterial({
      color: 0xe8453a,
      roughness: 0.35,
      metalness: 0.1,
      emissive: 0xe8453a,
      emissiveIntensity: 0.25,
    })
  );
  ball.castShadow = true;
  g.add(ball);

  const plus = makeTextSprite('+', 0xffffff, 96);
  plus.position.set(0, 0, r + 0.02);
  plus.scale.set(0.85, 0.85, 1);
  plus.material.depthTest = true;
  g.add(plus);

  return g;
}
function drawStats(
  panel: any,
  defs: Array<{ key: string; label: string; unit?: string }>,
  vals: Record<string, string>
) {
  const g = panel.g;
  const W = panel.W;
  const H = panel.H;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#0e1f33';
  g.fillRect(0, 0, W, H);
  g.strokeStyle = '#3a5f86';
  g.lineWidth = 5;
  g.strokeRect(4, 4, W - 8, H - 8);
  g.fillStyle = '#bfe0ff';
  g.textAlign = 'left';
  g.font = `bold 38px ${PHYS_FONT}`;
  g.fillText('📊 Thông số', 26, 56);
  let y = 104;
  for (const d of defs) {
    drawRich(g, d.label, 28, y, 26, '#9fc0de', 'left');
    const v = (vals[d.key] != null ? vals[d.key] : '–') + (d.unit ? (' ' + d.unit) : '');
    const big = v.length <= 12;
    g.fillStyle = '#ffffff';
    g.font = `bold ${big ? 42 : 28}px ${PHYS_FONT}`;
    g.fillText(v, 28, y + (big ? 46 : 42));
    g.strokeStyle = '#223c56';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(24, y + 64);
    g.lineTo(W - 24, y + 64);
    g.stroke();
    y += 84;
  }
  panel.flush();
}

export default function LorentzSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: LorentzSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const B = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'B');
    return p ? p.value : 1.5;
  }, [config.parameters]);

  const v = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'v');
    return p ? p.value : 3.0;
  }, [config.parameters]);

  const q = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'q');
    return p ? p.value : 1.0;
  }, [config.parameters]);

  const m = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'm');
    return p ? p.value : 1.0;
  }, [config.parameters]);

  const stateRef = useRef({
    ph: 0,
    cx: 0,
    cy: 4.2,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    B,
    v,
    q,
    m,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.B = B;
    refs.current.v = v;
    refs.current.q = q;
    refs.current.m = m;
  }, [isPlaying, isSlow, B, v, q, m]);

  // Reset phase when controls or reset key change
  useEffect(() => {
    stateRef.current.ph = 0;
  }, [B, v, q, m, resetKey]);

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

    // ── 4. Set Up Charges & Circular Ring ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Field markers
    const fieldSprites = bFieldMarkers(group, true, 7, 5, -7, 7, 1.2, 7.6);

    // Circular path ring
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x44607c });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2, 0.025, 8, 60), ringMat);
    ring.position.set(s.cx, s.cy, 0);
    group.add(ring);

    // Particle charge
    const part = makeCharge(0.35);
    group.add(part);

    // ── 5. Vector arrows ──
    const makeVectorArrow = (color: number, label: string) => {
      const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 12), mat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 16), mat);
      const g = new THREE.Group();
      g.add(shaft);
      g.add(head);
      g.renderOrder = 30;
      shaft.renderOrder = 30;
      head.renderOrder = 30;
      scene.add(g);
      const lab = makeLabelSprite(label, color);
      scene.add(lab);

      return {
        g,
        label: lab,
        set(dir: THREE.Vector3, len: number, origin: THREE.Vector3) {
          if (len < 0.05) {
            g.visible = false;
            lab.visible = false;
            return;
          }
          g.visible = true;
          lab.visible = true;
          len = Math.max(len, 0.4);
          const d = dir.clone().normalize();
          g.position.copy(origin);
          g.quaternion.setFromUnitVectors(_Y, d);
          const hl = Math.min(0.5, len * 0.4), sl = Math.max(0.05, len - hl);
          shaft.scale.y = sl;
          shaft.position.y = sl / 2;
          head.scale.set(1, hl / 0.4, 1);
          head.position.y = sl + hl / 2;
          lab.position.copy(g.position).addScaledVector(d, len + 0.5);
        },
        dispose() {
          scene.remove(g);
          scene.remove(lab);
          shaft.geometry.dispose();
          head.geometry.dispose();
          mat.dispose();
        }
      };
    };

    const vArrow = makeVectorArrow(0x5ee1a0, 'v');
    const fArrow = makeVectorArrow(0xff5252, 'F');

    // ── 6. Stats Panel ──
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

    const roDefs = [
      { key: 'R', label: 'R (bán kính quỹ đạo)', unit: 'm' },
      { key: 'F', label: 'F (Lực Lorentz)', unit: 'N' },
      { key: 'v', label: 'v (vận tốc)', unit: 'm/s' }
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 332);

    // ── 7. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      statsPanel.grp.lookAt(camera.position);
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      dt = Math.min(dt, 0.05);

      const activeB = refs.current.B;
      const activeV = refs.current.v;
      const activeQ = refs.current.q;
      const activeM = refs.current.m;

      // Calculate radius R clamped to valid screen bounds [0.8, 4]
      const R = Math.max(0.8, Math.min(4.0, (activeM * activeV) / (activeQ * activeB)));
      ring.scale.setScalar(R / 2);

      const w = activeV / R;
      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.ph += w * dt * speed;
      }

      // Position particle on the circle
      const posX = s.cx + Math.cos(s.ph) * R;
      const posY = s.cy + Math.sin(s.ph) * R;
      part.position.set(posX, posY, 0);

      // Tangent velocity vector direction
      const tang = new THREE.Vector3(-Math.sin(s.ph), Math.cos(s.ph), 0);
      // Lorentz force direction (points to center of circular path)
      const toC = new THREE.Vector3(s.cx, s.cy, 0).sub(part.position).normalize();

      vArrow.set(tang, 1.4, part.position);
      fArrow.set(toC, Math.min(2.4, 0.4 + activeQ * activeV * activeB * 0.15), part.position);

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        R: R.toFixed(2),
        F: (activeQ * activeV * activeB).toFixed(2),
        v: activeV.toFixed(1),
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
      ring.geometry.dispose();
      ringMat.dispose();
      vArrow.dispose();
      fArrow.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
      part.children.forEach((c) => {
        (c as THREE.Mesh).geometry.dispose();
        ((c as THREE.Mesh).material as THREE.Material).dispose();
      });
      fieldSprites.forEach((sp) => {
        sp.geometry.dispose();
        (sp.material as THREE.Material).dispose();
      });
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
