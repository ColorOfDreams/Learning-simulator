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

export default function CircularSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const r = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'r');
    return p ? p.value : 3;
  }, [config.parameters]);

  const wVal = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'w');
    return p ? p.value : 1.5;
  }, [config.parameters]);

  const m = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'm');
    return p ? p.value : 1;
  }, [config.parameters]);

  const stateRef = useRef({
    ph: 0,
    t: 0,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    r,
    wVal,
    m,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.r = r;
    refs.current.wVal = wVal;
    refs.current.m = m;
  }, [isPlaying, isSlow, r, wVal, m]);

  useEffect(() => {
    stateRef.current.ph = 0;
    stateRef.current.t = 0;
  }, [r, wVal, m, resetKey]);

  useEffect(() => {
    if (!mountRef.current) return;

    // ── 1. Create Scene, Camera, Renderer ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.5, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 4.0, 0);
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

    // ── 4. Circular Simulation Objects ──
    const cy = 4.0; // Center Y

    // Central hub
    const hubMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xcfd6df, roughness: 0.2, metalness: 0.8 })
    );
    hubMesh.position.set(0, cy, 0);
    hubMesh.castShadow = true;
    scene.add(hubMesh);

    // Circular track (Base radius is 3.0, scaled to r)
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(3.0, 0.03, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x35506e })
    );
    ringMesh.position.set(0, cy, 0);
    scene.add(ringMesh);

    // Connecting rod
    const rodMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1, 8),
      new THREE.MeshStandardMaterial({ color: 0x8a929c, roughness: 0.2, metalness: 0.8 })
    );
    rodMesh.castShadow = true;
    scene.add(rodMesh);

    // Rotating mass ball
    const ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 24),
      new THREE.MeshStandardMaterial({ color: 0x4aa3ff, roughness: 0.4, metalness: 0.1 })
    );
    ballMesh.castShadow = true;
    scene.add(ballMesh);

    // ── 5. Vector Arrow Helper ──
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

    const fArrow = makeVectorArrow(0xff5252, 'F_{ht}');
    const vArrow = makeVectorArrow(0x5ee1a0, 'v');

    // ── 6. Stats Panel ──
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

    const roDefs = [
      { key: 't', label: 't (thời gian)', unit: 's' },
      { key: 'v', label: 'v (tốc độ dài)', unit: 'm/s' },
      { key: 'a', label: 'a_{ht} (hướng tâm)', unit: 'm/s²' },
      { key: 'F', label: 'F_{ht} (hướng tâm)', unit: 'N' }
    ];
    const statsPanel = makePanel(-6.7, 5.0, -1, 4.6, 560, 332);

    // ── 7. Loop ──
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

      const state = stateRef.current;
      const { isPlaying: activePlaying, isSlow: activeSlow, r: activeR, wVal: activeW, m: activeM } = refs.current;

      ringMesh.scale.setScalar(activeR / 3.0);

      if (activePlaying) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;
        state.ph += activeW * dt * speed;
      }

      const cx = Math.cos(state.ph) * activeR;
      const cyo = Math.sin(state.ph) * activeR;
      const pos = new THREE.Vector3(cx, cy + cyo, 0);

      // Mass ball position
      ballMesh.position.copy(pos);

      // Rod alignment and scale
      const center = new THREE.Vector3(0, cy, 0);
      const mid = center.clone().add(pos).multiplyScalar(0.5);
      rodMesh.position.copy(mid);
      rodMesh.scale.y = activeR;
      rodMesh.quaternion.setFromUnitVectors(_Y, pos.clone().sub(center).normalize());

      // Vectors
      const toC = center.clone().sub(pos).normalize();
      const tang = new THREE.Vector3(-Math.sin(state.ph), Math.cos(state.ph), 0);
      const v = activeW * activeR;
      const a = activeW * activeW * activeR;
      const F = activeM * a;

      fArrow.set(toC, Math.min(2.5, a * 0.15 + 0.3), pos);
      vArrow.set(tang, Math.min(2.5, v * 0.25 + 0.3), pos);

      // Update Panel
      drawStats(statsPanel, roDefs, {
        t: state.t.toFixed(2),
        v: v.toFixed(2),
        a: a.toFixed(2),
        F: F.toFixed(2),
      });

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
      vArrow.dispose();
      hubMesh.geometry.dispose();
      (hubMesh.material as THREE.Material).dispose();
      ringMesh.geometry.dispose();
      (ringMesh.material as THREE.Material).dispose();
      rodMesh.geometry.dispose();
      (rodMesh.material as THREE.Material).dispose();
      ballMesh.geometry.dispose();
      (ballMesh.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [r, wVal, m, resetKey]);

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
