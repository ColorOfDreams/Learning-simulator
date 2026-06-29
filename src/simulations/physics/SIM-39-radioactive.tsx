import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface RadioactiveSimulationProps extends SimulationProps {
  onStep?: (t: number, N: number, N0: number, halfCycles: number) => void;
  resetKey?: number;
}

const PHYS_FONT = '"Be Vietnam Pro","Segoe UI",sans-serif';

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

function makeNucleus(color = 0x9ad06a, r = 0.26) {
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

export default function RadioactiveSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: RadioactiveSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const T = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'T');
    return p ? p.value : 3.0;
  }, [config.parameters]);

  const N0 = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'N0');
    return p ? p.value : 64;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
    pts: [] as [number, number][],
    cy: 4.4,
    nucMeshes: [] as THREE.Mesh[],
    decayParts: [] as THREE.Mesh[],
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    T,
    N0,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.T = T;
    refs.current.N0 = N0;
  }, [isPlaying, isSlow, T, N0]);

  // Reset simulation states
  useEffect(() => {
    const s = stateRef.current;
    s.lt = 0;
    s.pts = [];
    s.decayParts = [];
  }, [T, N0, resetKey]);

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

    // ── 4. Set Up Nuclei Grid ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    s.nucMeshes = [];
    for (let i = 0; i < 64; i++) {
      const m = makeNucleus(0x9ad06a, 0.26);
      m.position.set(-3.5 + (i % 8) * 1.0, s.cy + 2.1 - Math.floor(i / 8) * 0.7, 0);
      group.add(m);
      s.nucMeshes.push(m);
    }

    const initNuclei = (valN0: number) => {
      s.nucMeshes.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        m.visible = idx < valN0;
        m.userData = {
          alive: idx < valN0
        };
        mat.color.setHex(0x9ad06a);
        mat.emissive.setHex(0x9ad06a);
      });
    };
    initNuclei(N0);

    // ── 5. Panel Graph ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 280) => {
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

    const gPanel = makePanel(6.3, 5.6, -1, 7);

    const roDefs = [
      { key: 'N', label: 'N (còn lại)', unit: '' },
      { key: 'N0', label: 'N_0 (ban đầu)', unit: '' },
      { key: 't', label: 't (thời gian)', unit: 's' },
      { key: 'k', label: 'số chu kỳ', unit: '' },
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 80 + roDefs.length * 84);

    const drawGraph = (panel: any, o: any) => {
      const g = panel.g;
      const W = 560;
      const H = 280;
      g.fillStyle = '#0e1f33';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#2f4760';
      g.lineWidth = 3;
      g.strokeRect(5, 5, W - 10, H - 10);
      g.fillStyle = '#bfe0ff';
      g.textAlign = 'center';
      g.font = `bold 28px ${PHYS_FONT}`;
      g.fillText(o.title || '', W / 2, 36);

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
      g.fillText(o.ylabel || 'N', 0, 0);
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

      // Legend key
      let ly = y1 + 10;
      for (const series of o.series) {
        if (!series.label) continue;
        g.fillStyle = series.color;
        g.fillRect(x1 - 172, ly - 14, 24, 9);
        g.fillStyle = '#cfe2f7';
        g.textAlign = 'left';
        g.font = '700 16px sans-serif';
        g.fillText(series.label, x1 - 140, ly - 4);
        ly += 24;
      }

      g.setTransform(1, 0, 0, 1, 0, 0);
      panel.flush();
    };

    // ── 6. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;

    const render = () => {
      gPanel.grp.lookAt(camera.position);
      statsPanel.grp.lookAt(camera.position);
      renderer.render(scene, camera);
    };

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      let dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      dt = Math.min(dt, 0.05);

      const activeT = refs.current.T;
      const activeN0 = refs.current.N0;
      const lambda = Math.LN2 / activeT;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.lt += dt * speed;

        // Perform random decay on each active nucleus
        for (const m of s.nucMeshes) {
          if (m.visible && m.userData.alive && Math.random() < lambda * dt * speed) {
            m.userData.alive = false;
            const mat = m.material as THREE.MeshStandardMaterial;
            mat.color.setHex(0x55606a); // Dead grey
            mat.emissive.setHex(0x000000); // Turned off emission

            // Create emission particle
            const pt = makeNucleus(0xffd24a, 0.12);
            pt.position.copy(m.position);
            pt.userData = {
              v: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, 0),
              life: 0,
            };
            group.add(pt);
            s.decayParts.push(pt);
          }
        }
      }

      // Step/fade emitted particles
      for (let i = s.decayParts.length - 1; i >= 0; i--) {
        const pt = s.decayParts[i];
        const v = pt.userData.v as THREE.Vector3;
        pt.position.addScaledVector(v, dt);
        pt.userData.life += dt;
        if (pt.userData.life > 1.2) {
          group.remove(pt);
          pt.geometry.dispose();
          (pt.material as THREE.Material).dispose();
          s.decayParts.splice(i, 1);
        }
      }

      const aliveCount = s.nucMeshes.filter((m) => m.userData.alive && m.visible).length;

      // Recalculate theory curve
      const theoryCurve: [number, number][] = [];
      for (let t = 0; t <= 24; t += 0.4) {
        theoryCurve.push([t, activeN0 * Math.pow(2, -t / activeT)]);
      }

      // Record simulated decay step points
      if (refs.current.isPlaying) {
        if (s.pts.length === 0 || s.lt - s.pts[s.pts.length - 1][0] > 0.1) {
          s.pts.push([s.lt, aliveCount]);
        }
      } else if (s.pts.length === 0) {
        s.pts.push([0, aliveCount]);
      }

      drawGraph(gPanel, {
        title: 'Số hạt nhân N theo t',
        xlabel: 't (s)',
        ylabel: 'N',
        xmax: 24,
        ymax: activeN0,
        series: [
          { pts: theoryCurve, color: '#7cc4ff', label: 'lý thuyết' },
          { pts: s.pts, color: '#5ee1a0', label: 'mô phỏng' },
        ],
      });

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        N: aliveCount.toString(),
        N0: activeN0.toString(),
        t: s.lt.toFixed(1),
        k: (s.lt / activeT).toFixed(2),
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
      s.nucMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      s.decayParts.forEach((pt) => {
        pt.geometry.dispose();
        (pt.material as THREE.Material).dispose();
      });
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [N0, resetKey]);

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
