import { getResponsiveFov } from '../camera';
import { createReadoutPanel, drawStats } from './readout-panel';
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

function stTemp(Q: number) {
  if (Q < 30) return -20 + (Q / 30) * 20;
  if (Q < 70) return 0;
  if (Q < 130) return ((Q - 70) / 60) * 100;
  if (Q < 230) return 100;
  return 100 + ((Q - 230) / 30) * 30;
}

// ── Particle layout (module-level constants) ───────────────────────────────

const N = 18; // 3×3×2 lattice

const LATTICE: [number, number, number][] = [];
for (let iy = 0; iy < 2; iy++)
  for (let ix = -1; ix <= 1; ix++)
    for (let iz = -1; iz <= 1; iz++)
      LATTICE.push([ix * 0.55, iy * 0.55, iz * 0.55]);

// Adjacent bonds (distance < 0.62 catches only direct neighbours, not diagonals)
const BONDS: [number, number][] = [];
for (let i = 0; i < N; i++)
  for (let j = i + 1; j < N; j++) {
    const d = Math.sqrt(
      (LATTICE[i][0] - LATTICE[j][0]) ** 2 +
      (LATTICE[i][1] - LATTICE[j][1]) ** 2 +
      (LATTICE[i][2] - LATTICE[j][2]) ** 2
    );
    if (d < 0.62) BONDS.push([i, j]);
  }

// Liquid pool: 3 staggered rings of 6 within r=0.85
const POOL: [number, number, number][] = Array.from({ length: N }, (_, i) => {
  const ring = Math.floor(i / 6);
  const theta = ((i % 6) / 6) * Math.PI * 2 + ring * (Math.PI / 6);
  const r = [0.28, 0.58, 0.82][ring];
  return [Math.cos(theta) * r, 0, Math.sin(theta) * r];
});

// Gas escape directions (upper hemisphere)
const GAS_DIR: [number, number, number][] = Array.from({ length: N }, (_, i) => {
  const grp = Math.floor(i / 6);
  const theta = ((i % 6) / 6) * Math.PI * 2;
  const phi = [Math.PI / 5, Math.PI / 3.5, Math.PI / 2.4][grp];
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi) + 0.15;
  const z = Math.sin(phi) * Math.sin(theta);
  const len = Math.sqrt(x * x + y * y + z * z);
  return [x / len, y / len, z / len];
});

// ──────────────────────────────────────────────────────────────────────────

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

  const stateRef = useRef({ Q: 0 });
  const refs = useRef({ isPlaying, isSlow, P });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.P = P;
  }, [isPlaying, isSlow, P]);

  useEffect(() => { stateRef.current.Q = 0; }, [resetKey]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1622);
    scene.fog = new THREE.Fog(0x0b1622, 45, 90);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(getResponsiveFov(45, width / height), width / height, 0.1, 100);
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

    const hemi = new THREE.HemisphereLight(0xdcecff, 0x2a3744, 0.95);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(7, 16, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x16222f, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(80, 80, 0x355072, 0x1f3147);
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;
    const CX = 2, CY = 3.4;

    // ── Thermometer ──
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 5, 16),
      new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.3, depthWrite: false })
    );
    tube.position.set(-2, CY + 1, 0);
    group.add(tube);

    const merc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 1, 12),
      new THREE.MeshBasicMaterial({ color: 0xe8453a })
    );
    group.add(merc);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0xe8453a })
    );
    bulb.position.set(-2, CY - 1.5, 0);
    group.add(bulb);

    // ── Alcohol burner ──
    const flameGroup = new THREE.Group();
    flameGroup.position.set(CX, 0, 0);
    group.add(flameGroup);

    const lampBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 18, 12),
      new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.5, shininess: 90 })
    );
    lampBody.scale.y = 0.82; lampBody.position.y = 0.45; lampBody.castShadow = true;
    flameGroup.add(lampBody);

    const fuel = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 14, 10),
      new THREE.MeshPhongMaterial({ color: 0xa9c8e8, transparent: true, opacity: 0.6 })
    );
    fuel.scale.y = 0.55; fuel.position.y = 0.4;
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

    // ── Glass beaker ──
    const beakerH = 2.8, beakerR = 1.1;
    const poolY = CY - beakerH / 2 + 0.35;

    const beakerWallMat = new THREE.MeshPhongMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false,
    });
    const beakerWall = new THREE.Mesh(
      new THREE.CylinderGeometry(beakerR, beakerR * 0.92, beakerH, 24, 1, true),
      beakerWallMat
    );
    beakerWall.position.set(CX, CY, 0);
    group.add(beakerWall);

    const beakerBottomMat = new THREE.MeshPhongMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.22, depthWrite: false,
    });
    const beakerBottom = new THREE.Mesh(
      new THREE.CircleGeometry(beakerR * 0.92, 20),
      beakerBottomMat
    );
    beakerBottom.rotation.x = -Math.PI / 2;
    beakerBottom.position.set(CX, CY - beakerH / 2, 0);
    group.add(beakerBottom);

    // Liquid surface disc (visible when liquid/boiling)
    const liquidSurfaceMat = new THREE.MeshBasicMaterial({
      color: 0x2f7ad0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
    });
    const liquidSurface = new THREE.Mesh(
      new THREE.CircleGeometry(beakerR * 0.78, 24),
      liquidSurfaceMat
    );
    liquidSurface.rotation.x = -Math.PI / 2;
    liquidSurface.position.set(CX, poolY + 0.3, 0);
    group.add(liquidSurface);

    // Orange glow ring at beaker bottom during boiling
    const heatRingMat = new THREE.MeshBasicMaterial({
      color: 0xff7030, transparent: true, opacity: 0, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const heatRing = new THREE.Mesh(
      new THREE.RingGeometry(0.18, beakerR * 0.88, 24),
      heatRingMat
    );
    heatRing.rotation.x = -Math.PI / 2;
    heatRing.position.set(CX, poolY + 0.04, 0);
    group.add(heatRing);

    // ── Substance particles ──
    const pGeo = new THREE.SphereGeometry(0.22, 10, 7);
    const pMats: THREE.MeshStandardMaterial[] = [];
    const pMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < N; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xc0e8ff, roughness: 0.35, metalness: 0.15, transparent: true, opacity: 1,
      });
      const mesh = new THREE.Mesh(pGeo, mat);
      const lp = LATTICE[i];
      mesh.position.set(CX + lp[0], CY + lp[1] - 0.28, lp[2]);
      pMats.push(mat);
      pMeshes.push(mesh);
      group.add(mesh);
    }

    // Crystal lattice bonds
    const bondMat = new THREE.LineBasicMaterial({
      color: 0x88aacc, transparent: true, opacity: 0.55,
    });
    const bondLines: { line: THREE.Line; attr: THREE.BufferAttribute }[] = BONDS.map(() => {
      const arr = new Float32Array(6);
      const attr = new THREE.BufferAttribute(arr, 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', attr);
      const line = new THREE.Line(geo, bondMat);
      group.add(line);
      return { line, attr };
    });

    // Heat point light near substance during boiling/gas
    const heatLight = new THREE.PointLight(0xff6030, 0, 6);
    heatLight.position.set(CX, CY, 0);
    group.add(heatLight);

    // ── Panels ──
    const makePanel = (x: number, y: number, z: number, worldW: number, px = 560, py = 320) => {
      const c = document.createElement('canvas');
      c.width = px; c.height = py;
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
      grp.add(back); grp.add(mesh);
      grp.position.set(x, y, z);
      scene.add(grp);
      return {
        c, g, tex, W: px, H: py, grp,
        flush() { tex.needsUpdate = true; },
        dispose() {
          scene.remove(grp);
          back.geometry.dispose(); mesh.geometry.dispose(); tex.dispose();
          (back.material as THREE.Material).dispose();
          (mesh.material as THREE.Material).dispose();
        },
      };
    };

    const gPanel = makePanel(6.3, 6, -1, 7);
    const roDefs = [
      { key: 'T', label: "Nhiệt độ", unit: '°C' },
      { key: 'Q', label: "Nhiệt lượng", unit: 'kJ' },
      { key: 'st', label: "Trạng thái", unit: '' }
    ];
    const statsPanel = createReadoutPanel(mountRef.current);

    const drawGraph = (panel: any) => {
      const g = panel.g;
      const W = 560, H = 320;
      g.fillStyle = '#0e1f33'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#2f4760'; g.lineWidth = 3; g.strokeRect(5, 5, W - 10, H - 10);
      g.fillStyle = '#bfe0ff'; g.textAlign = 'center';
      g.font = `bold 31px ${PHYS_FONT}`; g.fillText('Nhiệt độ – Nhiệt lượng', W / 2, 38);

      const x0 = 74, y0 = H - 52, x1 = W - 22, y1 = 56;
      const sxG = (t: number) => x0 + (t / 260) * (x1 - x0);
      const syG = (v: number) => y0 - ((v + 20) / 150) * (y0 - y1);

      // Grid lines
      g.strokeStyle = '#1d3349'; g.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const yy = y1 + (y0 - y1) * i / 5;
        g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.stroke();
      }

      // Phase region highlights
      const phaseColors = ['#1a3a6a', '#3a2a1a', '#0a2a4a', '#3a1a0a', '#1a2a1a'];
      const phaseQ = [[0, 30], [30, 70], [70, 130], [130, 230], [230, 260]];
      phaseQ.forEach(([qa, qb], pi) => {
        g.fillStyle = phaseColors[pi];
        g.fillRect(sxG(qa), y1, sxG(qb) - sxG(qa), y0 - y1);
      });

      // Axes
      g.strokeStyle = '#5f86a8'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();

      g.fillStyle = '#9fc0de'; g.font = '600 21px sans-serif'; g.textAlign = 'center';
      g.fillText('Q (kJ)', (x0 + x1) / 2, H - 16);
      g.save(); g.translate(24, (y0 + y1) / 2); g.rotate(-Math.PI / 2);
      g.fillText('T (°C)', 0, 0); g.restore();

      // T(Q) curve
      g.strokeStyle = '#7cc4ff'; g.lineWidth = 3.6;
      g.beginPath();
      for (let q = 0; q <= 260; q += 2) {
        const X = sxG(q), Y = syG(stTemp(q));
        if (q === 0) g.moveTo(X, Y); else g.lineTo(X, Y);
      }
      g.stroke();

      // Current position marker
      const curT = stTemp(s.Q);
      g.fillStyle = '#ffca28';
      g.beginPath(); g.arc(sxG(s.Q), syG(curT), 7, 0, Math.PI * 2); g.fill();

      panel.flush();
    };

    // ── Animation loop ──
    let lastTimestamp = 0;
    let animFrameId = 0;
    let ft = 0;

    const tick = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;
      ft += dt;

      // Flame flicker
      const ff = 1 + Math.sin(ft * 16) * 0.12 + Math.sin(ft * 27) * 0.07;
      outerFlame.scale.set(ff, ff * (1 + Math.sin(ft * 11) * 0.12), ff);
      innerFlame.scale.set(ff * 0.9, ff, ff * 0.9);
      flameGlow.intensity = 0.9 + Math.sin(ft * 19) * 0.25;

      if (refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.Q += refs.current.P * dt * speed;
        if (s.Q > 260) s.Q = 0;
      }

      const currentT = stTemp(s.Q);

      // Determine phase
      let phase: string; let phaseFrac: number;
      if (s.Q < 30) { phase = 'solid'; phaseFrac = s.Q / 30; }
      else if (s.Q < 70) { phase = 'melting'; phaseFrac = (s.Q - 30) / 40; }
      else if (s.Q < 130) { phase = 'liquid'; phaseFrac = (s.Q - 70) / 60; }
      else if (s.Q < 230) { phase = 'boiling'; phaseFrac = (s.Q - 130) / 100; }
      else { phase = 'gas'; phaseFrac = Math.min(1, (s.Q - 230) / 30); }

      // Heat glow & ring
      heatLight.intensity = phase === 'boiling' ? 0.4 + phaseFrac * 0.7 : phase === 'gas' ? 0.3 : 0;
      heatRingMat.opacity = phase === 'boiling' ? 0.1 + phaseFrac * 0.28 : 0;

      // Liquid surface disc
      liquidSurfaceMat.opacity =
        phase === 'liquid' ? 0.22 :
        phase === 'melting' ? phaseFrac * 0.22 :
        phase === 'boiling' ? (1 - phaseFrac) * 0.18 : 0;

      // ── Particles ──
      for (let i = 0; i < N; i++) {
        const mesh = pMeshes[i];
        const mat = pMats[i];
        const lp = LATTICE[i];
        const pp = POOL[i];
        const gd = GAS_DIR[i];
        const pi = i * 1.97 + 0.5;

        if (phase === 'solid') {
          const vib = 0.018 + phaseFrac * 0.022;
          mesh.position.set(
            CX + lp[0] + Math.sin(ft * 9.2 + pi) * vib,
            CY + lp[1] - 0.28 + Math.sin(ft * 11.3 + pi + 1) * vib,
            lp[2] + Math.sin(ft * 10.1 + pi + 2) * vib,
          );
          mat.color.setHex(0xc0e8ff);
          mat.emissive.setHex(0x000000);
          mat.opacity = 1;

        } else if (phase === 'melting') {
          const tx = CX + lp[0] + (pp[0] - lp[0]) * phaseFrac;
          const ty = (CY + lp[1] - 0.28) + (poolY - (CY + lp[1] - 0.28)) * phaseFrac;
          const tz = lp[2] + (pp[2] - lp[2]) * phaseFrac;
          const wobble = phaseFrac * 0.1;
          mesh.position.set(
            tx + Math.sin(ft * 6.1 + pi) * wobble,
            ty,
            tz + Math.cos(ft * 6.3 + pi + 1) * wobble,
          );
          const cr = Math.round(0xc0 + (0x2f - 0xc0) * phaseFrac);
          const cg = Math.round(0xe8 + (0x7a - 0xe8) * phaseFrac);
          mat.color.setRGB(cr / 255, cg / 255, 1.0);
          mat.emissive.setHex(0x000000);
          mat.opacity = 1;

        } else if (phase === 'liquid') {
          const amp = 0.07 + phaseFrac * 0.06;
          mesh.position.set(
            CX + pp[0] + Math.sin(ft * 3.4 + pi) * amp,
            poolY + Math.abs(Math.sin(ft * 2.7 + pi + 1)) * 0.07,
            pp[2] + Math.cos(ft * 3.7 + pi + 2) * amp,
          );
          mat.color.setHex(0x2f7ad0);
          mat.emissive.setHex(0x000000);
          mat.opacity = 1;

        } else if (phase === 'boiling') {
          const cycleLen = 2.2 + (i % 5) * 0.35;
          const tc = ((ft * 0.85 + i * 0.58) % cycleLen) / cycleLen;
          const riseThresh = phaseFrac * 0.52;
          if (tc < riseThresh) {
            const riseH = (tc / riseThresh) * 3.2;
            mesh.position.set(
              CX + pp[0] * 0.55 + Math.sin(ft * 3.5 + pi) * 0.12,
              poolY + riseH,
              pp[2] * 0.55 + Math.cos(ft * 3.5 + pi) * 0.1,
            );
            mat.color.setHex(0xaaddff);
            mat.emissive.setHex(0x112233);
            mat.opacity = Math.max(0, 1 - riseH * 0.36);
          } else {
            const amp = 0.1;
            mesh.position.set(
              CX + pp[0] + Math.sin(ft * 4.8 + pi) * amp,
              poolY + Math.abs(Math.sin(ft * 3.9 + pi)) * 0.05,
              pp[2] + Math.cos(ft * 4.8 + pi + 1) * amp,
            );
            mat.color.setHex(0x2f7ad0);
            mat.emissive.setHex(0x112200);
            mat.opacity = 1;
          }

        } else { // gas
          const spread = phaseFrac * 4.2;
          mesh.position.set(
            CX + pp[0] + gd[0] * spread + Math.sin(ft * 2.1 + pi) * 0.18,
            poolY + gd[1] * spread,
            pp[2] + gd[2] * spread + Math.cos(ft * 2.1 + pi + 1) * 0.18,
          );
          mat.color.setHex(0xd0eeff);
          mat.emissive.setHex(0x000000);
          mat.opacity = Math.max(0.05, 1 - phaseFrac * 0.82);
        }
      }

      // ── Crystal bonds ──
      const bondVisible = phase === 'solid' || (phase === 'melting' && phaseFrac < 0.75);
      bondMat.opacity = phase === 'solid' ? 0.55 : Math.max(0, (0.75 - phaseFrac) / 0.75) * 0.55;
      bondLines.forEach(({ line, attr }, bi) => {
        line.visible = bondVisible;
        if (bondVisible) {
          const [a, b] = BONDS[bi];
          const pa = pMeshes[a].position;
          const pb = pMeshes[b].position;
          attr.setXYZ(0, pa.x, pa.y, pa.z);
          attr.setXYZ(1, pb.x, pb.y, pb.z);
          attr.needsUpdate = true;
        }
      });

      // Thermometer
      const h = Math.min(1.0, Math.max(0.05, (currentT + 20) / 150)) * 3;
      merc.scale.y = h;
      merc.position.set(-2, CY - 1.5 + h / 2, 0);

      // Stats
      let phaseLabel = '';
      if (s.Q < 30) phaseLabel = '🧊 Rắn';
      else if (s.Q < 70) phaseLabel = '🔥 Nóng chảy';
      else if (s.Q < 130) phaseLabel = '💧 Lỏng';
      else if (s.Q < 230) phaseLabel = '♨️ Đang sôi';
      else phaseLabel = '💨 Khí';

      drawStats(statsPanel, roDefs, {
        T: currentT.toFixed(0),
        Q: s.Q.toFixed(0),
        st: phaseLabel,
      });

      drawGraph(gPanel);

      gPanel.grp.lookAt(camera.position);
      controls.update();
      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.fov = getResponsiveFov(45, camera.aspect);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      gPanel.dispose();
      statsPanel.dispose();
      pGeo.dispose();
      pMats.forEach(m => m.dispose());
      bondLines.forEach(({ line }) => line.geometry.dispose());
      bondMat.dispose();
      liquidSurface.geometry.dispose(); liquidSurfaceMat.dispose();
      heatRing.geometry.dispose(); heatRingMat.dispose();
      beakerWall.geometry.dispose(); beakerWallMat.dispose();
      beakerBottom.geometry.dispose(); beakerBottomMat.dispose();
      tube.geometry.dispose(); (tube.material as THREE.Material).dispose();
      merc.geometry.dispose(); (merc.material as THREE.Material).dispose();
      bulb.geometry.dispose(); (bulb.material as THREE.Material).dispose();
      lampBody.geometry.dispose(); (lampBody.material as THREE.Material).dispose();
      fuel.geometry.dispose(); (fuel.material as THREE.Material).dispose();
      collar.geometry.dispose(); (collar.material as THREE.Material).dispose();
      wick.geometry.dispose(); (wick.material as THREE.Material).dispose();
      outerFlame.geometry.dispose(); (outerFlame.material as THREE.Material).dispose();
      innerFlame.geometry.dispose(); (innerFlame.material as THREE.Material).dispose();
      floor.geometry.dispose(); (floor.material as THREE.Material).dispose();
      grid.dispose();
    };
  }, [resetKey]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '18px', overflow: 'hidden' }}
    />
  );
}
