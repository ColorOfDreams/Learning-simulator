import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface KinematicsSimulationProps extends SimulationProps {
  onStep?: (t: number, x: number, v: number) => void;
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

export default function KinematicsSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  onAnimationEnd,
  onStep,
  resetKey = 0,
}: KinematicsSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Simulation parameters
  const v0 = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'v0');
    return p ? p.value : 3;
  }, [config.parameters]);

  const a = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'a');
    return p ? p.value : 1;
  }, [config.parameters]);

  // Keep references for loop
  const stateRef = useRef({
    t: 0,
    x: 0,
    v: v0,
    done: false,
    vpts: [] as [number, number][],
    xpts: [] as [number, number][],
    x0w: -10,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    v0,
    a,
    onStep,
    onAnimationEnd,
  });

  // Keep refs in sync
  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.v0 = v0;
    refs.current.a = a;
    refs.current.onStep = onStep;
    refs.current.onAnimationEnd = onAnimationEnd;
  }, [isPlaying, isSlow, v0, a, onStep, onAnimationEnd]);

  // Reset physics states when parameters or reset key change
  useEffect(() => {
    stateRef.current.t = 0;
    stateRef.current.x = 0;
    stateRef.current.v = v0;
    stateRef.current.done = false;
    stateRef.current.vpts = [];
    stateRef.current.xpts = [];
    if (refs.current.onStep) {
      refs.current.onStep(0, 0, v0);
    }
  }, [v0, a, resetKey]);

  // Reset if clicked play but already done
  useEffect(() => {
    if (isPlaying) {
      if (stateRef.current.done) {
        stateRef.current.t = 0;
        stateRef.current.x = 0;
        stateRef.current.v = v0;
        stateRef.current.done = false;
        stateRef.current.vpts = [];
        stateRef.current.xpts = [];
      }
    }
  }, [isPlaying, v0]);

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
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.update();

    // ── 2. Add Lighting ──
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

    // ── 4. Build Track & Cart ──
    // makeTrack(22)
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

    // makeCart(0x4aa3ff)
    const cart = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x4aa3ff, roughness: 0.55 })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    cart.add(body);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x232a33, roughness: 0.4, metalness: 0.5 });
    for (const sx of [-0.4, 0.4]) {
      for (const sz of [-0.45, 0.45]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 16), wMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(sx, 0.35, sz);
        cart.add(wheel);
      }
    }
    scene.add(cart);

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
    const aArrow = makeVectorArrow(0xffa726, 'a');

    // ── 6. Graph Panels (using makePanel concept) ──
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

    const vgPanel = makePanel(5.8, 7.1, -1, 5.4);
    const xgPanel = makePanel(5.8, 3.5, -1, 5.4);

    const roDefs = [
      { key: 't', label: 't (thời gian)', unit: 's' },
      { key: 'x', label: 'x (quãng đường)', unit: 'm' },
      { key: 'v', label: 'v (vận tốc)', unit: 'm/s' }
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 332);

    const drawGraph = (panel: any, o: any) => {
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
      g.font = 'bold 31px "Be Vietnam Pro", sans-serif';
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

      if (ymin < 0) {
        const yz = sy(0);
        g.strokeStyle = '#3c5a78';
        g.beginPath();
        g.moveTo(x0, yz);
        g.lineTo(x1, yz);
        g.stroke();
      }

      g.fillStyle = '#9fc0de';
      g.font = '600 21px sans-serif';
      g.textAlign = 'center';
      g.fillText(o.xlabel || 't (s)', (x0 + x1) / 2, H - 16);
      g.save();
      g.translate(24, (y0 + y1) / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(o.ylabel || '', 0, 0);
      g.restore();

      for (const s of o.series) {
        if (!s.pts.length) continue;
        g.strokeStyle = s.color;
        g.lineWidth = 3.6;
        g.beginPath();
        s.pts.forEach((pt: any, idx: number) => {
          const X = sx(pt[0]), Y = sy(pt[1]);
          if (idx === 0) g.moveTo(X, Y);
          else g.lineTo(X, Y);
        });
        g.stroke();
      }

      let ly = y1 + 10;
      for (const s of o.series) {
        g.fillStyle = s.color;
        g.fillRect(x1 - 172, ly - 14, 24, 9);
        g.fillStyle = '#cfe2f7';
        g.textAlign = 'left';
        g.font = '700 20px sans-serif';
        g.fillText(s.label, x1 - 140, ly - 4);
        ly += 28;
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      panel.flush();
    };

    // ── 7. Animation Loop & Tick ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      // Rotate billboard panels to face camera
      vgPanel.grp.lookAt(camera.position);
      xgPanel.grp.lookAt(camera.position);
      statsPanel.grp.lookAt(camera.position);

      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Cap dt to prevent huge skips
      dt = Math.min(dt, 0.05);

      const state = stateRef.current;
      const { isPlaying: activePlaying, isSlow: activeSlow, v0: activeV0, a: activeA, onStep: activeOnStep, onAnimationEnd: activeOnAnimEnd } = refs.current;

      if (activePlaying && !state.done) {
        // Apply slow motion modifier
        const speed = activeSlow ? 0.22 : 1.0;
        state.t += dt * speed;

        const t = state.t;
        const x = activeV0 * t + 0.5 * activeA * t * t;
        const v = activeV0 + activeA * t;
        state.x = x;
        state.v = v;

        let xw = state.x0w + x;
        if (xw >= 10) {
          xw = 10;
          state.done = true;
          if (activeOnAnimEnd) activeOnAnimEnd();
        } else if (xw <= -10) {
          xw = -10;
          state.done = true;
          if (activeOnAnimEnd) activeOnAnimEnd();
        }

        cart.position.x = xw;

        // Draw vectors
        const cartCenter = new THREE.Vector3(xw, 0.6, 0);
        // Velocity vector
        vArrow.set(new THREE.Vector3(v >= 0 ? 1 : -1, 0, 0), Math.abs(v) * 0.45, cartCenter);
        // Acceleration vector
        aArrow.set(new THREE.Vector3(activeA >= 0 ? 1 : -1, 0, 0), Math.abs(activeA) * 0.7, cartCenter);

        // Update Graphs
        if (state.vpts.length === 0 || t - state.vpts[state.vpts.length - 1][0] > 0.05) {
          state.vpts.push([t, v]);
          state.xpts.push([t, x]);

          const vmax = Math.max(10, ...state.vpts.map((q) => Math.abs(q[1])));
          const xmax = Math.max(4, ...state.xpts.map((q) => Math.abs(q[1])));

          drawGraph(vgPanel, {
            title: 'Đồ thị v – t',
            ylabel: 'v (m/s)',
            xmax: Math.max(4, t),
            ymin: -vmax,
            ymax: vmax,
            series: [{ pts: state.vpts, color: '#5ee1a0', label: 'v' }],
          });

          drawGraph(xgPanel, {
            title: 'Đồ thị x – t',
            ylabel: 'x (m)',
            xmax: Math.max(4, t),
            ymin: 0,
            ymax: xmax,
            series: [{ pts: state.xpts, color: '#ffc24a', label: 'x' }],
          });
        }

        // Draw stats panel
        drawStats(statsPanel, roDefs, {
          t: t.toFixed(2),
          x: x.toFixed(2),
          v: v.toFixed(2)
        });

        // Notify parent workspace page
        if (activeOnStep) {
          activeOnStep(t, x, v);
        }
      } else if (!activePlaying && state.t === 0) {
        // Static reset state render
        cart.position.x = state.x0w;
        vArrow.set(new THREE.Vector3(v0 >= 0 ? 1 : -1, 0, 0), v0 * 0.45, new THREE.Vector3(state.x0w, 0.6, 0));
        aArrow.set(new THREE.Vector3(a >= 0 ? 1 : -1, 0, 0), Math.abs(a) * 0.7, new THREE.Vector3(state.x0w, 0.6, 0));

        drawGraph(vgPanel, {
          title: 'Đồ thị v – t',
          ylabel: 'v (m/s)',
          xmax: 4,
          ymin: -10,
          ymax: 10,
          series: [{ pts: state.vpts, color: '#5ee1a0', label: 'v' }],
        });

        drawGraph(xgPanel, {
          title: 'Đồ thị x – t',
          ylabel: 'x (m)',
          xmax: 4,
          ymin: 0,
          ymax: 4,
          series: [{ pts: state.xpts, color: '#ffc24a', label: 'x' }],
        });

        // Draw stats panel static
        drawStats(statsPanel, roDefs, {
          t: '0.00',
          x: '0.00',
          v: v0.toFixed(2)
        });
      } else {
        // When paused but state.t > 0, we still want to keep drawing the stats panel with current values
        drawStats(statsPanel, roDefs, {
          t: state.t.toFixed(2),
          x: state.x.toFixed(2),
          v: state.v.toFixed(2)
        });
      }

      controls.update();
      render();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    // ── 8. Handling Resizing ──
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

    // ── 9. Cleanup on Unmount ──
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      vgPanel.dispose();
      xgPanel.dispose();
      statsPanel.dispose();
      vArrow.dispose();
      aArrow.dispose();

      // Dispose simple mesh geometries/materials
      rail.geometry.dispose();
      (rail.material as THREE.Material).dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
      body.geometry.dispose();
      (body.material as THREE.Material).dispose();
      wMat.dispose();
    };
  }, [v0, a, resetKey]);

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
