import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface StateChangeSimulationProps extends SimulationProps {
  onStep?: (t: number, Q: number, T: number, phase: string) => void;
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

function stTemp(Q: number) {
  if (Q < 30) return -20 + (Q / 30) * 20;        // rắn nóng lên: -20→0
  if (Q < 70) return 0;                          // đang nóng chảy
  if (Q < 130) return ((Q - 70) / 60) * 100;     // lỏng nóng lên: 0→100
  if (Q < 230) return 100;                       // đang sôi
  return 100 + ((Q - 230) / 30) * 30;            // khí nóng lên: 100→130
}
export default function StateChangeSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: StateChangeSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const P = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'P');
    return p ? p.value : 20;
  }, [config.parameters]);

  const stateRef = useRef({
    Q: 0,
    cy: 3.4,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    P,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.P = P;
  }, [isPlaying, isSlow, P]);

  // Reset heat state when resetKey changes
  useEffect(() => {
    stateRef.current.Q = 0;
  }, [resetKey]);

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

    // ── 4. Thermometer & Sample Setup ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Thermometer tube
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 5, 16),
      new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.3, depthWrite: false })
    );
    tube.position.set(-2, s.cy + 1, 0);
    group.add(tube);

    // Red mercury column inside thermometer
    const merc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 1, 12),
      new THREE.MeshBasicMaterial({ color: 0xe8453a })
    );
    group.add(merc);

    // Thermometer bulb
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xe8453a })
    );
    bulb.position.set(-2, s.cy - 1.5, 0);
    group.add(bulb);

    // Sample block
    const sampleMat = new THREE.MeshStandardMaterial({
      color: 0x9fd4ff,
      roughness: 0.5,
      transparent: true,
    });
    const sample = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), sampleMat);
    sample.position.set(2, s.cy, 0);
    group.add(sample);

    // ── 5. Alcohol Burner (makeFlame) ──
    const flameGroup = new THREE.Group();
    flameGroup.position.set(2, 0, 0);
    group.add(flameGroup);

    const lampBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 18, 12),
      new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.5, shininess: 90 })
    );
    lampBody.scale.y = 0.82;
    lampBody.position.y = 0.45;
    lampBody.castShadow = true;
    flameGroup.add(lampBody);

    const fuel = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 14, 10),
      new THREE.MeshPhongMaterial({ color: 0xa9c8e8, transparent: true, opacity: 0.6 })
    );
    fuel.scale.y = 0.55;
    fuel.position.y = 0.4;
    flameGroup.add(fuel);

    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.2, 0.2, 14),
      new THREE.MeshStandardMaterial({ color: 0xb8a44a, roughness: 0.4, metalness: 0.7 })
    );
    collar.position.y = 0.92;
    flameGroup.add(collar);

    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8),
      new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.9 })
    );
    wick.position.y = 1.06;
    flameGroup.add(wick);

    const outerFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.95, 16),
      new THREE.MeshBasicMaterial({ color: 0xff8a30, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    outerFlame.position.y = 1.5;
    flameGroup.add(outerFlame);

    const innerFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.46, 12),
      new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    innerFlame.position.y = 1.28;
    flameGroup.add(innerFlame);

    const flameGlow = new THREE.PointLight(0xffa040, 1.1, 6);
    flameGlow.position.y = 1.45;
    flameGroup.add(flameGlow);

    // ── 6. Panel Graph ──
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
      { key: 'T', label: 'T (nhiệt độ)', unit: '°C' },
      { key: 'Q', label: 'Q (nhiệt lượng)', unit: 'kJ' },
      { key: 'st', label: 'Trạng thái', unit: '' },
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 80 + roDefs.length * 84);

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
      g.fillText(o.xlabel || 'Q (kJ)', (x0 + x1) / 2, H - 16);
      g.save();
      g.translate(24, (y0 + y1) / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(o.ylabel || 'T (°C)', 0, 0);
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

    // ── 7. Animation Loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;
    let flameTime = 0;

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

      // Alcohol lamp flicker
      flameTime += dt;
      const f = 1 + Math.sin(flameTime * 16) * 0.12 + Math.sin(flameTime * 27) * 0.07;
      outerFlame.scale.set(f, f * (1 + Math.sin(flameTime * 11) * 0.12), f);
      innerFlame.scale.set(f * 0.9, f, f * 0.9);
      flameGlow.intensity = 0.9 + Math.sin(flameTime * 19) * 0.25;

      const activeP = refs.current.P;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.Q += activeP * dt * speed;
        if (s.Q > 260) {
          s.Q = 0;
        }
      }

      const currentT = stTemp(s.Q);


      // Thermometer mercury height adjustment: T ranges -20..130 -> height 0.05..3.0
      const h = Math.min(1.0, Math.max(0.05, (currentT + 20) / 150)) * 3;
      merc.scale.y = h;
      merc.position.set(-2, s.cy - 1.5 + h / 2, 0);

      // Adjust sample color based on Q/Phase
      const isGas = s.Q >= 230;
      if (s.Q < 70) {
        sampleMat.color.setHex(0x9fd4ff); // Solid Blue
        sampleMat.opacity = 1;
      } else if (isGas) {
        sampleMat.color.setHex(0xcfe0ee); // Gaseous light blue
        sampleMat.opacity = 0.4;
      } else {
        sampleMat.color.setHex(0x2f7ad0); // Liquid deep blue
        sampleMat.opacity = 1;
      }

      // Draw T-Q Graph
      const curve: [number, number][] = [];
      for (let q = 0; q <= 260; q += 2) {
        curve.push([q, stTemp(q)]);
      }

      drawGraph(gPanel, {
        title: 'Nhiệt độ – Nhiệt lượng',
        xlabel: 'Q (kJ)',
        ylabel: 'T (°C)',
        xmin: 0,
        xmax: 260,
        ymin: -20,
        ymax: 130,
        series: [
          { pts: curve, color: '#7cc4ff', label: 'T(Q)' },
          { pts: [[s.Q, currentT]], color: '#ffca28', label: 'hiện tại' },
        ],
      });

      // Marker
      const g = gPanel.g;
      const W = 560, H = 320;
      const x0 = 74, y0 = H - 52, x1 = W - 22, y1 = 56;
      const sx = (t: number) => x0 + (t / 260) * (x1 - x0);
      const sy = (v: number) => y0 - ((v + 20) / 150) * (y0 - y1);
      g.fillStyle = '#ffca28';
      g.beginPath();
      g.arc(sx(s.Q), sy(currentT), 7, 0, Math.PI * 2);
      g.fill();
      gPanel.flush();

      // Update stats panel
      let phase = '';
      if (s.Q < 30) phase = 'Rắn';
      else if (s.Q < 70) phase = 'Đang nóng chảy';
      else if (s.Q < 130) phase = 'Lỏng';
      else if (s.Q < 230) phase = 'Đang sôi';
      else phase = 'Khí';

      drawStats(statsPanel, roDefs, {
        T: currentT.toFixed(0),
        Q: s.Q.toFixed(0),
        st: phase,
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
      tube.geometry.dispose();
      (tube.material as THREE.Material).dispose();
      merc.geometry.dispose();
      (merc.material as THREE.Material).dispose();
      bulb.geometry.dispose();
      (bulb.material as THREE.Material).dispose();
      sample.geometry.dispose();
      sampleMat.dispose();
      lampBody.geometry.dispose();
      (lampBody.material as THREE.Material).dispose();
      fuel.geometry.dispose();
      (fuel.material as THREE.Material).dispose();
      collar.geometry.dispose();
      (collar.material as THREE.Material).dispose();
      wick.geometry.dispose();
      (wick.material as THREE.Material).dispose();
      outerFlame.geometry.dispose();
      (outerFlame.material as THREE.Material).dispose();
      innerFlame.geometry.dispose();
      (innerFlame.material as THREE.Material).dispose();
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
