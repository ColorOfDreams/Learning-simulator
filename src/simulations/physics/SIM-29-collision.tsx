import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';


// cssColor and rr functions removed as they were unused


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

function makeTrack(len = 20, color = 0x2c3e54) {
  const g = new THREE.Group();
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(len, 0.3, 1.5),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  rail.position.y = 0.15;
  rail.receiveShadow = true;
  g.add(rail);

  for (let i = -len / 2 + 1; i < len / 2; i += 2) {
    const t = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.07, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x5a7693, roughness: 0.6 })
    );
    t.position.set(i, 0.33, 0);
    g.add(t);
  }
  return g;
}

function makeCart(color = 0x4aa3ff) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.6, 0.9),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  body.position.y = 0.6;
  body.castShadow = true;
  g.add(body);

  const wm = new THREE.MeshStandardMaterial({ color: 0x232a33, metalness: 0.8, roughness: 0.2 });
  for (const sx of [-0.4, 0.4]) {
    for (const sz of [-0.45, 0.45]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16), wm);
      w.rotation.x = Math.PI / 2;
      w.position.set(sx, 0.35, sz);
      w.castShadow = true;
      g.add(w);
    }
  }
  return g;
}

export default function CollisionSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: SimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Extract parameters
  const m1 = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'm1');
    return p ? p.value : 2;
  }, [config.parameters]);

  const v1 = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'v1');
    return p ? p.value : 3;
  }, [config.parameters]);

  const m2 = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'm2');
    return p ? p.value : 3;
  }, [config.parameters]);

  const v2 = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'v2');
    return p ? p.value : -1;
  }, [config.parameters]);

  const eVal = useMemo(() => {
    const p = config.parameters.find(x => x.key === 'e');
    return p ? p.value : 1;
  }, [config.parameters]);

  const stateRef = useRef({
    t: 0,
    x1: -6.0,
    x2: 6.0,
    u1: v1,
    u2: v2,
    hit: false,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    m1,
    v1,
    m2,
    v2,
    eVal,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.m1 = m1;
    refs.current.v1 = v1;
    refs.current.m2 = m2;
    refs.current.v2 = v2;
    refs.current.eVal = eVal;
  }, [isPlaying, isSlow, m1, v1, m2, v2, eVal]);

  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.x1 = -6.0;
    stateRef.current.x2 = 6.0;
    stateRef.current.u1 = v1;
    stateRef.current.u2 = v2;
    stateRef.current.hit = false;
  }, [m1, v1, m2, v2, eVal, resetKey]);

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
    controls.target.set(0, 1.5, 0);
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

    // ── 4. Track & Carts ──
    const track = makeTrack(24);
    scene.add(track);

    const c1 = makeCart(0x4aa3ff); // Blue cart
    const c2 = makeCart(0xff9800); // Orange cart
    scene.add(c1);
    scene.add(c2);

    // ── 5. Stats Panel ──
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
      { key: 'p', label: 'Tổng động lượng p', unit: 'kg·m/s' },
      { key: 'ke', label: 'Tổng động năng', unit: 'J' },
      { key: 'u1', label: 'v_1′ (xe xanh)', unit: 'm/s' },
      { key: 'u2', label: 'v_2′ (xe cam)', unit: 'm/s' }
    ];
    const statsPanel = makePanel(-6.7, 5.0, -1, 4.6, 560, 416);

    // ── 6. Loop ──
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
      const { isPlaying: activePlaying, isSlow: activeSlow, m1: activeM1, m2: activeM2, eVal: activeE } = refs.current;

      const scale1 = 0.8 + activeM1 * 0.06;
      const scale2 = 0.8 + activeM2 * 0.06;
      c1.scale.setScalar(scale1);
      c2.scale.setScalar(scale2);

      if (activePlaying) {
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;
        
        state.x1 += state.u1 * dt * speed;
        state.x2 += state.u2 * dt * speed;

        // Collision logic
        // Center separation at contact:
        // Carts have length 1.2 at scale 1.
        // Radius/half-length is 0.6 * scale.
        // Wheel contact or magnet buffer adds ~0.2-0.4.
        // We use 0.6 * (scale1 + scale2) + 0.4 as dynamic contact distance.
        const contactDist = 0.6 * (scale1 + scale2) + 0.35;
        if (!state.hit && (state.x2 - state.x1) <= contactDist) {
          state.hit = true;
          const v1Current = state.u1;
          const v2Current = state.u2;
          
          state.u1 = (activeM1 * v1Current + activeM2 * v2Current + activeM2 * activeE * (v2Current - v1Current)) / (activeM1 + activeM2);
          state.u2 = (activeM1 * v1Current + activeM2 * v2Current + activeM1 * activeE * (v1Current - v2Current)) / (activeM1 + activeM2);

          // Push them slightly apart to prevent sticking
          const overlap = contactDist - (state.x2 - state.x1);
          state.x1 -= overlap / 2 + 0.01;
          state.x2 += overlap / 2 + 0.01;
        }

        // Clamp positions to track bounds (-11 to 11)
        state.x1 = Math.max(-11.5, Math.min(11.5, state.x1));
        state.x2 = Math.max(-11.5, Math.min(11.5, state.x2));
      }

      c1.position.x = state.x1;
      c2.position.x = state.x2;

      // Calculate readouts
      const p_tot = activeM1 * state.u1 + activeM2 * state.u2;
      const ke = 0.5 * activeM1 * state.u1 * state.u1 + 0.5 * activeM2 * state.u2 * state.u2;

      // Update Panel
      drawStats(statsPanel, roDefs, {
        t: state.t.toFixed(2),
        p: p_tot.toFixed(2),
        ke: ke.toFixed(2),
        u1: state.u1.toFixed(2),
        u2: state.u2.toFixed(2),
      });

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
      track.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      c1.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      c2.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [m1, v1, m2, v2, eVal, resetKey]);

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
