import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

interface EFieldSimulationProps extends SimulationProps {
  onStep?: (t: number, E: number, F: number, r: number) => void;
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

function makeCharge(r = 0.6) {
  const g = new THREE.Group();
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xe8453a,
    roughness: 0.35,
    metalness: 0.1,
    emissive: 0xe8453a,
    emissiveIntensity: 0.25,
  });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), ballMat);
  ball.castShadow = true;
  g.add(ball);

  const plusObj = makeTextSprite('+', 0xffffff, 96);
  const plus = plusObj.sprite;
  plus.position.set(0, 0, r + 0.02);
  plus.scale.set(0.85, 0.85, 1);
  plus.material.depthTest = true;

  const minusObj = makeTextSprite('−', 0xffffff, 96);
  const minus = minusObj.sprite;
  minus.position.set(0, 0, r + 0.02);
  minus.scale.set(0.85, 0.85, 1);
  minus.material.depthTest = true;

  g.add(plus, minus);

  const setSign = (sign: number) => {
    const col = sign >= 0 ? 0xe8453a : 0x3a78e8;
    ballMat.color.setHex(col);
    ballMat.emissive.setHex(col);
    plus.visible = sign >= 0;
    minus.visible = sign < 0;
  };

  setSign(1);

  return {
    group: g,
    setSign,
    dispose() {
      ball.geometry.dispose();
      ballMat.dispose();
      plus.geometry.dispose();
      plus.material.dispose();
      plusObj.texture.dispose();
      minus.geometry.dispose();
      minus.material.dispose();
      minusObj.texture.dispose();
    },
  };
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

function makeLabelSprite(text: string, colorVal: number) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 96;
  const g = c.getContext('2d')!;
  const colStr = '#' + ('000000' + colorVal.toString(16)).slice(-6);
  g.fillStyle = 'rgba(8,16,28,.86)';
  rr(g, 3, 3, 250, 90, 18);
  g.fill();
  g.strokeStyle = colStr;
  g.lineWidth = 5;
  rr(g, 3, 3, 250, 90, 18);
  g.stroke();
  g.textBaseline = 'middle';
  drawRich(g, text, 128, 52, 54, colStr, 'center');
  const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })
  );
  s.scale.set(1.35, 0.5, 1);
  s.renderOrder = 31;
  return { sprite: s, texture: tex };
}

function makeVector(sceneGroup: THREE.Group, color: number, labelText?: string) {
  const mat = new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1, 12), mat);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 16), mat);
  const g = new THREE.Group();
  g.add(shaft, head);
  g.renderOrder = 30;
  shaft.renderOrder = 30;
  head.renderOrder = 30;
  sceneGroup.add(g);

  let labObj: any = null;
  if (labelText) {
    labObj = makeLabelSprite(labelText, color);
    sceneGroup.add(labObj.sprite);
  }

  const Y_VEC = new THREE.Vector3(0, 1, 0);

  const set = (dir: THREE.Vector3, len: number, origin: THREE.Vector3) => {
    len = Math.max(len, 0.4);
    const d = dir.clone().normalize();
    g.position.copy(origin);
    g.quaternion.setFromUnitVectors(Y_VEC, d);
    const hl = Math.min(0.6, len * 0.42);
    const sl = Math.max(0.05, len - hl);
    shaft.scale.y = sl;
    shaft.position.y = sl / 2;
    head.scale.set(1, hl / 0.5, 1);
    head.position.y = sl + hl / 2;
    if (labObj) {
      labObj.sprite.position.copy(g.position).addScaledVector(d, len + 0.5);
    }
  };

  return {
    g,
    label: labObj ? labObj.sprite : null,
    set,
    setVisible(v: boolean) {
      g.visible = v;
      if (labObj) labObj.sprite.visible = v;
    },
    dispose() {
      sceneGroup.remove(g);
      shaft.geometry.dispose();
      head.geometry.dispose();
      mat.dispose();
      if (labObj) {
        sceneGroup.remove(labObj.sprite);
        labObj.sprite.geometry.dispose();
        labObj.sprite.material.dispose();
        labObj.texture.dispose();
      }
    },
  };
}

export default function EFieldSimulation({
  config,
  isPlaying = false,
  isSlow = false,
  resetKey = 0,
}: EFieldSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const q = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'q1');
    return p ? p.value : 3;
  }, [config.parameters]);

  const q0 = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'q2');
    return p ? p.value : -3;
  }, [config.parameters]);

  const r0 = useMemo(() => {
    const p = config.parameters.find((param) => param.key === 'r0');
    return p ? p.value : 0.8;
  }, [config.parameters]);

  const stateRef = useRef({
    r: r0,
    vr: 0,
    cy: 4,
  });

  const refs = useRef({
    isPlaying,
    isSlow,
    q,
    q0,
    r0,
  });

  useEffect(() => {
    refs.current.isPlaying = isPlaying;
    refs.current.isSlow = isSlow;
    refs.current.q = q;
    refs.current.q0 = q0;
    refs.current.r0 = r0;
  }, [isPlaying, isSlow, q, q0, r0]);

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

    // ── 4. Build Setup ──
    const group = new THREE.Group();
    scene.add(group);

    const s = stateRef.current;

    // Source Charge (Big)
    const sourceCharge = makeCharge(0.7);
    sourceCharge.group.position.set(0, s.cy, 0);
    group.add(sourceCharge.group);

    // Field lines (12 radiating arrows)
    const lines: any[] = [];
    for (let i = 0; i < 12; i++) {
      lines.push(makeVector(group, 0x6ab0ff));
    }

    // Test charge (Small)
    const testCharge = makeCharge(0.4);
    group.add(testCharge.group);

    // Electric Field (E) and Force (F) vectors on test charge
    const Earr = makeVector(group, 0x5ee1a0, 'E');
    const Farr = makeVector(group, 0xffd54a, 'F');

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
      { key: 'E', label: 'Điện trường E', unit: 'kV/m' },
      { key: 'F', label: 'Lực điện F', unit: 'N' },
      { key: 'r', label: 'Khoảng cách r', unit: 'm' },
      { key: 'st', label: 'Trạng thái', unit: '' },
    ];
    const statsPanel = makePanel(-6.7, 5.7, -1, 4.6, 560, 80 + roDefs.length * 84);

    // Initial resets
    s.r = r0;
    s.vr = 0;
    sourceCharge.setSign(q);
    testCharge.setSign(q0);

    const updateFieldLines = (activeQ: number) => {
      const outFlag = activeQ >= 0;
      lines.forEach((ln, i) => {
        const a = (i / 12) * Math.PI * 2;
        const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
        const start = new THREE.Vector3(0, s.cy, 0).addScaledVector(dir, 0.8);
        ln.set(outFlag ? dir : dir.clone().negate(), 1.2, outFlag ? start : start.clone().addScaledVector(dir, 1.2));
        ln.setVisible(activeQ !== 0);
      });
    };
    updateFieldLines(q);

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

      const activeQ = refs.current.q;
      const activeQ0 = refs.current.q0;

      sourceCharge.setSign(activeQ);
      testCharge.setSign(activeQ0);
      updateFieldLines(activeQ);

      const fieldOn = activeQ !== 0;
      const outFlag = activeQ >= 0;
      const push = activeQ * activeQ0 > 0;
      const moving = fieldOn && activeQ0 !== 0;

      let Esi = (9e9 * Math.abs(activeQ) * 1e-6) / (s.r * s.r);
      let F = Math.abs(activeQ0) * 1e-6 * Esi;

      if (moving && refs.current.isPlaying) {
        const speed = refs.current.isSlow ? 0.22 : 1.0;
        s.vr += (push ? 1 : -1) * Math.min(6, F * 40) * dt * speed;
        s.vr *= 0.95;
        s.vr = Math.max(-2.5, Math.min(2.5, s.vr));
        s.r += s.vr * dt * 0.5;

        if (s.r < 0.24) {
          s.r = 0.24;
          s.vr = 0;
        }
        if (s.r > 1.2) {
          s.r = 1.2;
          s.vr = 0;
        }
      }

      Esi = (9e9 * Math.abs(activeQ) * 1e-6) / (s.r * s.r);
      F = Math.abs(activeQ0) * 1e-6 * Esi;
      const Ekv = Esi / 1000;

      testCharge.group.position.set(s.r * 8, s.cy, 0);

      Earr.set(new THREE.Vector3(outFlag ? 1 : -1, 0, 0), Math.min(3, 0.5 + Ekv / 60), testCharge.group.position.clone().add(new THREE.Vector3(0, 1, 0)));
      Farr.set(new THREE.Vector3(push ? 1 : -1, 0, 0), Math.min(3, 0.4 + F * 30), testCharge.group.position.clone());

      Earr.setVisible(fieldOn);
      Farr.setVisible(moving);

      // Update stats panel
      drawStats(statsPanel, roDefs, {
        E: fieldOn ? Ekv.toFixed(1) : '0.0',
        F: moving ? F.toFixed(3) : '0.000',
        r: s.r.toFixed(2),
        st: !fieldOn ? 'Không có điện trường' : activeQ0 === 0 ? 'q₀ = 0 (Không chịu lực)' : push ? 'Bị đẩy ra xa' : 'Bị hút lại gần',
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
      sourceCharge.dispose();
      testCharge.dispose();
      Earr.dispose();
      Farr.dispose();
      lines.forEach((ln) => ln.dispose());
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
