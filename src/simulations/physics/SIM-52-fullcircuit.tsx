import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface FullCircuitSimulationProps extends SimulationProps {
  onStep?: (t: number, I: number, U: number) => void;
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

function makeTextSprite(text: string, color = 0xffffff, fs = 56) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#' + ('000000' + color.toString(16)).slice(-6);
  g.font = `bold ${fs}px ${PHYS_FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 70);
  const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  s.scale.set(1, 0.5, 1);
  s.renderOrder = 25;
  return { sprite: s, texture: tex };
}

function rectLoop(L: number, R: number, B: number, T: number) {
  const pts = [
    new THREE.Vector3(L, B, 0),
    new THREE.Vector3(R, B, 0),
    new THREE.Vector3(R, T, 0),
    new THREE.Vector3(L, T, 0),
  ];
  const segs: Array<{ a: THREE.Vector3; b: THREE.Vector3; len: number }> = [];
  let total = 0;
  for (let i = 0; i < 4; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % 4];
    const len = a.distanceTo(b);
    segs.push({ a, b, len });
    total += len;
  }
  return {
    pts,
    total,
    at(t: number) {
      let d = (((t % 1) + 1) % 1) * total;
      for (let i = 0; i < 4; i++) {
        const sg = segs[i];
        if (d <= sg.len || i === 3) {
          return sg.a.clone().lerp(sg.b, sg.len ? Math.min(d / sg.len, 1) : 0);
        }
        d -= sg.len;
      }
      return pts[0].clone();
    },
  };
}

function segMesh(a: THREE.Vector3, b: THREE.Vector3, rad: number, color: number) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rad, rad, len, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.8 })
  );
  m.position.copy(a).lerp(b, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

function makeResistor(color = 0xcaa472) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 1.6, 18),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
  );
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  g.add(body);

  const ringGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.12, 18);
  const rings: Array<{ m: THREE.Mesh; mat: THREE.Material }> = [];
  for (const [bx, bc] of [
    [-0.35, 0x8a5a2a],
    [-0.1, 0xc23a2a],
    [0.2, 0xd6b020],
    [0.45, 0xb4bcc8],
  ]) {
    const ringMat = new THREE.MeshStandardMaterial({ color: bc, roughness: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.z = Math.PI / 2;
    ring.position.x = bx;
    g.add(ring);
    rings.push({ m: ring, mat: ringMat });
  }

  return {
    group: g,
    dispose() {
      body.geometry.dispose();
      (body.material as THREE.Material).dispose();
      ringGeo.dispose();
      rings.forEach((r) => {
        r.mat.dispose();
      });
    },
  };
}

function makeBattery() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2b3a4e, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.8), bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  g.add(body);

  const capMat = new THREE.MeshStandardMaterial({ color: 0xd9b94a, roughness: 0.3, metalness: 0.8 });
  const pos = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12), capMat);
  pos.position.set(0.6, 1.12, 0);
  g.add(pos);

  const plusObj = makeTextSprite('+', 0xffd24a, 80);
  const plus = plusObj.sprite;
  plus.position.set(0.6, 1.45, 0);
  plus.scale.set(0.6, 0.6, 1);
  g.add(plus);

  const minusObj = makeTextSprite('−', 0x9fd4ff, 80);
  const minus = minusObj.sprite;
  minus.position.set(-0.6, 1.45, 0);
  minus.scale.set(0.6, 0.6, 1);
  g.add(minus);

  return {
    group: g,
    dispose() {
      body.geometry.dispose();
      bodyMat.dispose();
      pos.geometry.dispose();
      capMat.dispose();
      plus.geometry.dispose();
      plus.material.dispose();
      plusObj.texture.dispose();
      minus.geometry.dispose();
      minus.material.dispose();
      minusObj.texture.dispose();
    },
  };
}

export default function FullCircuitSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: FullCircuitSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const E = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'E');
    return p ? p.value : 9.0;
  }, [config.parameters]);

  const r = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'r');
    return p ? p.value : 1.0;
  }, [config.parameters]);

  const R = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'R');
    return p ? p.value : 5.0;
  }, [config.parameters]);

  const stateRef = useRef({
    lt: 0,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    E,
    r,
    R,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.E = E;
    refs.current.r = r;
    refs.current.R = R;
  }, [isPlaying, isSlow, E, r, R]);

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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
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
    scene.add(dirLight);

    // ── 3. Floor & Grid ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x16222f, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    scene.add(floor);

    const grid = new THREE.GridHelper(80, 80, 0x355072, 0x1f3147);
    grid.position.y = 0;
    scene.add(grid);

    // ── 4. Build Circuit Setup ──
    const group = new THREE.Group();
    scene.add(group);

    const L = -5, R_edge = 5, B = 1.6, T = 6.4;
    const loop = rectLoop(L, R_edge, B, T);

    // Wires (4 cylinder segments + corner spheres)
    const wireGroup = new THREE.Group();
    const wires: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const w = segMesh(loop.pts[i], loop.pts[(i + 1) % 4], 0.07, 0x33455c);
      wireGroup.add(w);
      wires.push(w);
    }
    const corners: THREE.Mesh[] = [];
    const cornerGeo = new THREE.SphereGeometry(0.1, 10, 8);
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x33455c, metalness: 0.8, roughness: 0.3 });
    for (const c of loop.pts) {
      const k = new THREE.Mesh(cornerGeo, cornerMat);
      k.position.copy(c);
      wireGroup.add(k);
      corners.push(k);
    }
    group.add(wireGroup);

    // Battery (Suất điện động)
    const bat = makeBattery();
    bat.group.position.set(-1.6, B - 0.5, 0);
    group.add(bat.group);

    // External Resistor (R ngoài)
    const res = makeResistor(0xcaa472);
    res.group.position.set(1.6, T, 0);
    group.add(res.group);

    // Internal Resistor (r trong)
    const rin = makeResistor(0xb46c6c);
    rin.group.scale.setScalar(0.6);
    rin.group.position.set(0.6, B, 0);
    group.add(rin.group);

    // Label for internal resistor 'r'
    const rinLblObj = makeTextSprite('r', 0xff9a9a, 64);
    const rinLbl = rinLblObj.sprite;
    rinLbl.scale.set(0.6, 0.3, 1);
    rinLbl.position.set(0.6, B + 0.7, 0);
    group.add(rinLbl);

    // Electrons (26 small blue spheres)
    const electronsGroup = new THREE.Group();
    const electronCount = 26;
    const electronGeo = new THREE.SphereGeometry(0.13, 8, 6);
    const electronMat = new THREE.MeshBasicMaterial({ color: 0x66e0ff });
    const electronMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < electronCount; i++) {
      const e = new THREE.Mesh(electronGeo, electronMat);
      e.userData = { ph: i / electronCount };
      e.position.copy(loop.at(e.userData.ph));
      electronsGroup.add(e);
      electronMeshes.push(e);
    }
    group.add(electronsGroup);

    const stepElectrons = (ds: number) => {
      for (const e of electronMeshes) {
        let q_ph = (e.userData.ph + ds) % 1;
        if (q_ph < 0) q_ph += 1;
        e.userData.ph = q_ph;
        e.position.copy(loop.at(q_ph));
      }
    };

    // ── 5. Stats Panel ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 320) => {
      const c = document.createElement('canvas');
      c.width = px;
      c.height = py;
      const g = c.getContext('2d')!;
      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      const worldH = (worldW * py) / px;
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
        },
      };
    };

    const roDefs = [
      { key: 'I', label: 'Cường độ dòng điện I', unit: 'A' },
      { key: 'U', label: 'Hiệu điện thế mạch ngoài U', unit: 'V' },
      { key: 'E', label: 'Suất điện động ξ', unit: 'V' },
      { key: 'r', label: 'Điện trở trong r', unit: 'Ω' },
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 80 + roDefs.length * 84);

    stateRef.current.lt = 0;

    // ── 6. Animation Loop ──
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

      const activeE = refs.current.E;
      const active_r = refs.current.r;
      const active_R = refs.current.R;

      const I = activeE / (active_R + active_r);
      const U = I * active_R;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        stepElectrons(Math.min(0.4, I * 0.04) * dt * 4 * speed);
      }

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        I: I.toFixed(2),
        U: U.toFixed(2),
        E: activeE.toFixed(1),
        r: active_r.toFixed(1),
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
      bat.dispose();
      res.dispose();
      rin.dispose();
      rinLbl.geometry.dispose();
      rinLbl.material.dispose();
      rinLblObj.texture.dispose();
      wires.forEach((w) => w.geometry.dispose());
      corners.forEach((c) => c.geometry.dispose());
      cornerGeo.dispose();
      cornerMat.dispose();
      electronMeshes.forEach((e) => e.geometry.dispose());
      electronGeo.dispose();
      electronMat.dispose();
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
