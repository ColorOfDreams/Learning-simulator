import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';

// Easing helpers
const Ease = {
  linear: (t: number) => t,
  quadIn: (t: number) => t * t,
  quadOut: (t: number) => t * (2 - t),
  quadInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  backOut: (t: number) => { const s = 1.35; t -= 1; return t * t * ((s + 1) * t + s) + 1; },
};

interface TweenItem {
  target: any;
  to: Record<string, number>;
  from: Record<string, number>;
  dur: number;
  t: number;
  delay: number;
  started: boolean;
  ease: (t: number) => number;
  onUpdate?: (e: number) => void;
  onDone?: () => void;
}

interface EmitterItem {
  update: (dt: number) => boolean;
  stop?: () => void;
}

interface TargetItem {
  id: string;
  obj: THREE.Object3D;
  offset: THREE.Vector3;
  ringY?: number;
}

// Global text textures helper
function textTexture(text: string, opts: any = {}) {
  const c = document.createElement('canvas');
  c.width = opts.w || 256; c.height = opts.h || 128;
  const g = c.getContext('2d')!;
  g.fillStyle = opts.bg || '#fdfdf6';
  const r = 16;
  g.beginPath();
  g.moveTo(r, 0); g.lineTo(c.width - r, 0); g.quadraticCurveTo(c.width, 0, c.width, r);
  g.lineTo(c.width, c.height - r); g.quadraticCurveTo(c.width, c.height, c.width - r, c.height);
  g.lineTo(r, c.height); g.quadraticCurveTo(0, c.height, 0, c.height - r);
  g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0); g.closePath(); g.fill();
  if (opts.border !== false) { g.lineWidth = 8; g.strokeStyle = opts.bd || '#3b82d6'; g.stroke(); }
  g.fillStyle = opts.fg || '#15293f';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = String(text).split('\n');
  const fs = opts.fs || (lines.length > 1 ? 38 : 44);
  g.font = `bold ${fs}px "Be Vietnam Pro","Segoe UI",sans-serif`;
  const lh = fs * 1.15, y0 = c.height / 2 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => g.fillText(ln, c.width / 2, y0 + i * lh));
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grd.addColorStop(0, inner); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// Materials library
const MAT = {
  glass(tint = 0xdcf0fa, op = 0.2) {
    return new THREE.MeshPhysicalMaterial({
      color: tint, transparent: true, opacity: op, roughness: 0.06,
      metalness: 0, side: THREE.DoubleSide, depthWrite: false,
    });
  },
  metal(color = 0x9aa3ad) {
    return new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.4 });
  },
  plastic(color: number) {
    return new THREE.MeshStandardMaterial({ color, metalness: 0.08, roughness: 0.55 });
  },
};

// Sound synthesizer using Web Audio API
const Snd = {
  ac: null as AudioContext | null,
  init() {
    if (!this.ac) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.ac = new AudioContextClass();
        } catch (e) {}
      }
    }
    if (this.ac && this.ac.state === 'suspended') {
      this.ac.resume();
    }
  },
  tone(f: number, t0: number, dur: number, vol = 0.12, type: OscillatorType = 'sine') {
    if (!this.ac) return;
    try {
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = type; o.frequency.value = f;
      const t = this.ac.currentTime + t0;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(this.ac.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  },
  step() { this.tone(660, 0, 0.12); this.tone(880, 0.1, 0.2); },
  err()  { this.tone(196, 0, 0.22, 0.08, 'square'); },
  pour() { this.tone(420, 0, 0.3, 0.05, 'triangle'); },
};

interface SoapSimulationProps extends SimulationProps {
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export default function SoapSimulation({
  currentStep = 1,
  onStepChange,
}: SoapSimulationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Simulation state refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const tweensRef = useRef<TweenItem[]>([]);
  const emittersRef = useRef<EmitterItem[]>([]);
  const updatablesRef = useRef<((dt: number) => boolean)[]>([]);

  // Registered interactive objects
  const objMapRef = useRef<Record<string, THREE.Object3D>>({});
  const targetsRef = useRef<TargetItem[]>([]);
  const interactivesRef = useRef<THREE.Object3D[]>([]);

  // Sound initializer trigger
  const playSound = (type: 'step' | 'err' | 'pour') => {
    Snd.init();
    if (type === 'step') Snd.step();
    else if (type === 'err') Snd.err();
    else if (type === 'pour') Snd.pour();
  };

  // Drag state
  const dragRef = useRef({
    obj: null as THREE.Object3D | null,
    moved: false,
    plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.7),
    downAt: new THREE.Vector2(),
  });

  const isBusyRef = useRef<boolean>(false);
  const currentStepRef = useRef<number>(currentStep);
  currentStepRef.current = currentStep;

  // Custom tweening helper
  const addTween = (target: any, to: Record<string, number>, dur: number, opts: any = {}) => {
    const ease = Ease[opts.ease as keyof typeof Ease || 'quadInOut'];
    const tw: TweenItem = {
      target, to, from: {}, dur: Math.max(dur, 0.0001), t: 0,
      delay: opts.delay || 0, started: false,
      ease,
      onDone: opts.onDone,
      onUpdate: opts.onUpdate,
    };
    tweensRef.current.push(tw);
    return tw;
  };

  const addTweenPromise = (target: any, to: Record<string, number>, dur: number, opts: any = {}) => {
    return new Promise<void>((resolve) => {
      const prevDone = opts.onDone;
      addTween(target, to, dur, {
        ...opts,
        onDone: () => {
          if (prevDone) prevDone();
          resolve();
        }
      });
    });
  };

  const delaySeconds = (s: number) => new Promise(r => setTimeout(r, s * 1000));

  // Snap back dragged item to its home
  const snapBack = (o: THREE.Object3D) => {
    const home = o.userData.home;
    if (home) {
      addTween(o.position, { x: home.x, y: home.y, z: home.z }, 0.5, { ease: 'backOut' });
      addTween(o.rotation, { z: home.rz || 0 }, 0.3);
    }
  };

  // Get world position of target anchor
  const targetAnchorWorld = (id: string) => {
    const t = targetsRef.current.find(target => target.id === id);
    if (!t) return new THREE.Vector3();
    const v = new THREE.Vector3();
    t.obj.getWorldPosition(v);
    return v.add(t.offset);
  };

  // Visual highlights
  const highlightMeshesRef = useRef<THREE.Object3D[]>([]);
  const clearHighlights = () => {
    highlightMeshesRef.current.forEach(h => {
      if (h.parent) h.parent.remove(h);
    });
    highlightMeshesRef.current = [];
  };

  const makeHighlightsForStep = (stepIdx: number) => {
    clearHighlights();
    const steps = [
      { src: 'oil', dst: 'beaker', type: 'pour' },
      { src: 'naoh', dst: 'beaker', type: 'pour' },
      { id: 'lamp', type: 'click' },
      { src: 'rod', dst: 'beaker', type: 'stir' },
      { src: 'nacl', dst: 'beaker', type: 'pour' },
      { id: 'beaker', type: 'click' },
    ];
    const step = steps[stepIdx - 1];
    if (!step) return;

    const scene = sceneRef.current;
    if (!scene) return;

    const srcId = (step as any).src || (step as any).id;
    if (srcId && objMapRef.current[srcId]) {
      const o = objMapRef.current[srcId];
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.26, 0.62, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd84a })
      );
      arrow.rotation.x = Math.PI;
      const wp = o.getWorldPosition(new THREE.Vector3());
      const h = o.userData.h || 2.5;
      arrow.position.set(wp.x, wp.y + h + 0.75, wp.z);
      scene.add(arrow);
      highlightMeshesRef.current.push(arrow);

      let t = 0;
      updatablesRef.current.push((dt) => {
        if (!arrow.parent) return false;
        t += dt;
        const w2 = o.getWorldPosition(new THREE.Vector3());
        arrow.position.set(w2.x, w2.y + h + 0.75 + Math.sin(t * 4) * 0.17, w2.z);
        arrow.rotation.y += dt * 2;
        return true;
      });
    }

    if ((step as any).dst) {
      const dstId = (step as any).dst;
      const aw = targetAnchorWorld(dstId);
      const tdef = targetsRef.current.find(t => t.id === dstId);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.35, 0.055, 8, 36),
        new THREE.MeshBasicMaterial({ color: 0x5ee1a0, transparent: true, opacity: 0.9 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(aw.x, (tdef && tdef.ringY != null) ? tdef.ringY : aw.y + 0.12, aw.z);
      scene.add(ring);
      highlightMeshesRef.current.push(ring);

      let t = 0;
      updatablesRef.current.push((dt) => {
        if (!ring.parent) return false;
        t += dt;
        const s = 1 + Math.sin(t * 5) * 0.12;
        ring.scale.set(s, s, s);
        if (ring.material instanceof THREE.Material) {
          ring.material.opacity = 0.65 + Math.sin(t * 5) * 0.3;
        }
        return true;
      });
    }
  };

  // Custom Effects
  const Effects = {
    bubbles(container: THREE.Object3D, opts: any = {}) {
      const liq = container.userData.liq;
      if (!liq) return { stop() {} };
      const dur = opts.dur != null ? opts.dur : 2.5;
      const rate = opts.rate || 16;
      const r = opts.r || 0.05;
      const color = opts.color != null ? opts.color : 0xffffff;
      const speed = opts.speed || 1.3;
      const at = opts.at || null;

      const grp = new THREE.Group();
      container.add(grp);

      const bubbleGeo = new THREE.SphereGeometry(1, 8, 6);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 });
      const parts: THREE.Mesh[] = [];
      let t = 0, acc = 0, stopped = false;

      const e: EmitterItem = {
        update(dt) {
          t += dt;
          if (!stopped && t < dur) {
            acc += dt * rate;
            while (acc > 1) {
              acc--;
              if (liq.level > 0.02) {
                const m = new THREE.Mesh(bubbleGeo, mat);
                let px, pz;
                if (at) {
                  px = at.x + (Math.random() - 0.5) * 2 * (at.r || 0.12);
                  pz = at.z + (Math.random() - 0.5) * 2 * (at.r || 0.12);
                } else {
                  const rr = Math.random() * liq.r * 0.72;
                  const a = Math.random() * 6.283;
                  px = Math.cos(a) * rr; pz = Math.sin(a) * rr;
                }
                m.position.set(px, (at && at.y != null ? at.y : liq.y0 + 0.08) + Math.random() * 0.15, pz);
                m.scale.setScalar(r * (0.5 + Math.random()));
                m.userData.v = speed * (0.7 + Math.random() * 0.6);
                m.renderOrder = 2;
                grp.add(m); parts.push(m);
              }
            }
          }
          const topVal = liq.y0 + liq.level * liq.hMax;
          for (let i = parts.length - 1; i >= 0; i--) {
            const m = parts[i];
            m.position.y += m.userData.v * dt;
            m.position.x += Math.sin(t * 9 + i * 1.7) * 0.0025;
            if (m.position.y >= topVal || m.position.y < liq.y0 - 0.05) {
              grp.remove(m);
              parts.splice(i, 1);
            }
          }
          if ((stopped || t >= dur) && parts.length === 0) {
            if (grp.parent) grp.parent.remove(grp);
            return false;
          }
          return true;
        }
      };
      emittersRef.current.push(e);
      return { stop() { stopped = true; } };
    },

    stream(getFrom: () => THREE.Vector3, toY: number, opts: any = {}) {
      const dur = opts.dur || 1.15;
      const rate = opts.rate || 42;
      const color = opts.color != null ? opts.color : 0x9fd0ff;
      const geo = new THREE.SphereGeometry(0.06, 6, 5);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const grp = new THREE.Group();
      const scene = sceneRef.current;
      if (scene) scene.add(grp);

      const parts: THREE.Mesh[] = [];
      let t = 0, acc = 0;

      emittersRef.current.push({
        update(dt) {
          t += dt;
          if (t < dur) {
            acc += dt * rate;
            while (acc > 1) {
              acc--;
              const f = getFrom();
              const m = new THREE.Mesh(geo, mat);
              m.position.copy(f);
              m.userData.vy = -0.5;
              grp.add(m); parts.push(m);
            }
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const m = parts[i];
            m.userData.vy -= 13 * dt;
            m.position.y += m.userData.vy * dt;
            if (m.position.y <= toY) { grp.remove(m); parts.splice(i, 1); }
          }
          if (t >= dur && parts.length === 0) {
            if (scene) scene.remove(grp);
            return false;
          }
          return true;
        }
      });
    },

    steam(parent: THREE.Object3D, localPos: THREE.Vector3, opts: any = {}) {
      const rate = opts.rate || 3;
      const dur = opts.dur != null ? opts.dur : 3;
      const size = opts.size || 0.55;
      const rise = opts.rise || 1.1;
      const grp = new THREE.Group();
      grp.position.copy(localPos);
      parent.add(grp);

      const tex = glowTexture('rgba(240,240,245,0.85)', 'rgba(240,240,245,0)');
      const parts: THREE.Sprite[] = [];
      let t = 0, acc = 0, stopped = false;

      const e: EmitterItem = {
        update(dt) {
          t += dt;
          if (!stopped && t < dur) {
            acc += dt * rate;
            while (acc > 1) {
              acc--;
              const sm = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.55, depthWrite: false });
              const s = new THREE.Sprite(sm);
              s.position.set((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3);
              s.scale.setScalar(size * (0.6 + Math.random() * 0.5));
              s.userData = { life: 0, max: 1.6 + Math.random() * 0.8, drift: (Math.random() - 0.5) * 0.25 };
              grp.add(s); parts.push(s);
            }
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const s = parts[i];
            s.userData.life += dt;
            const k = s.userData.life / s.userData.max;
            s.position.y += rise * dt;
            s.position.x += s.userData.drift * dt;
            s.scale.setScalar(s.scale.x + dt * 0.55);
            s.material.opacity = 0.55 * (1 - k);
            if (k >= 1) { s.material.dispose(); grp.remove(s); parts.splice(i, 1); }
          }
          if ((stopped || t >= dur) && parts.length === 0) {
            if (grp.parent) grp.parent.remove(grp);
            return false;
          }
          return true;
        },
        stop() { stopped = true; }
      };
      emittersRef.current.push(e);
      return e;
    },

    layer(container: THREE.Object3D, opts: any = {}) {
      const liq = container.userData.liq;
      if (!liq) return Promise.resolve();
      const topVal = liq.y0 + liq.level * liq.hMax;
      const mat = new THREE.MeshPhongMaterial({
        color: opts.color != null ? opts.color : 0xf7eeb5,
        transparent: true, opacity: 0, shininess: 70,
      });
      const m = new THREE.Mesh(new THREE.CylinderGeometry(liq.r * 0.98, liq.r * 0.98, opts.h || 0.18, 20), mat);
      m.position.y = topVal + (opts.h || 0.18) / 2 - 0.02;
      m.renderOrder = 2;
      m.name = 'soap-layer';
      container.add(m);
      const pr = { t: 0 };
      return addTweenPromise(pr, { t: 1 }, opts.dur || 1.4, {
        onUpdate: (e: number) => { mat.opacity = (opts.opacity != null ? opts.opacity : 0.88) * e; }
      });
    },

    boil(container: THREE.Object3D, dur = 3) {
      Effects.bubbles(container, { dur, rate: 26, r: 0.05, speed: 1.6 });
      const liq = container.userData.liq;
      const topVal = liq ? liq.y0 + liq.level * liq.hMax : 2;
      Effects.steam(container, new THREE.Vector3(0, (container.userData.h || topVal) + 0.15, 0), { dur, rate: 3.5, size: 0.42 });
      return delaySeconds(dur);
    }
  };

  // Run animations for step transitions
  const runPourAnimation = async (srcId: string, dstId: string, level: number, color: number, opacity: number, postFx: () => void) => {
    isBusyRef.current = true;
    playSound('pour');

    const src = objMapRef.current[srcId];
    const dst = objMapRef.current[dstId];
    const home = src.userData.home;

    const aw = targetAnchorWorld(dstId);

    // 1. Move to pouring position
    await addTweenPromise(src.position, { x: aw.x + 2.35, y: aw.y + 1.62, z: aw.z }, 0.42);
    // 2. Rotate to pour
    await addTweenPromise(src.rotation, { z: 1.78 }, 0.3);

    // 3. Pour stream & liquid rise
    const liq = dst.userData.liq;
    let toY = aw.y - 0.9;
    if (liq) {
      const wp = dst.getWorldPosition(new THREE.Vector3());
      toY = wp.y + liq.y0 + liq.level * liq.hMax + 0.05;
    }

    Effects.stream(
      () => new THREE.Vector3(aw.x + (Math.random() - 0.5) * 0.1, aw.y + 1.12, aw.z + (Math.random() - 0.5) * 0.1),
      toY,
      { color: src.userData.dropColor, dur: 1.15 }
    );

    if (liq) {
      const l0 = liq.level;
      const o0 = liq.mat.opacity;
      const pr = { t: 0 };
      await addTweenPromise(pr, { t: 1 }, 1.15, {
        onUpdate: (e: number) => {
          liq.mat.color.copy(new THREE.Color(color));
          liq.mat.opacity = o0 + (opacity - o0) * e;
          const h = Math.max(0.001, (l0 + (level - l0) * e) * liq.hMax);
          liq.mesh.visible = true;
          liq.mesh.scale.set(1, h, 1);
          liq.mesh.position.y = liq.y0 + h / 2;
          liq.level = l0 + (level - l0) * e;
        }
      });
    } else {
      await delaySeconds(1.15);
    }

    // 4. Stand back up
    await addTweenPromise(src.rotation, { z: 0 }, 0.28);
    // 5. Move home
    await addTweenPromise(src.position, { x: home.x, y: home.y, z: home.z }, 0.5);

    // Run callback
    postFx();

    isBusyRef.current = false;
    playSound('step');
    if (onStepChange) onStepChange(currentStepRef.current + 1);
  };

  const runClickAnimation = async (id: string) => {
    isBusyRef.current = true;
    const lamp = objMapRef.current[id];
    const flame = lamp.userData.flame;
    if (flame) flame.visible = true;

    const beaker = objMapRef.current['beaker'];
    Effects.bubbles(beaker, { dur: 2.2, rate: 14 });
    await delaySeconds(1.2);

    isBusyRef.current = false;
    playSound('step');
    if (onStepChange) onStepChange(currentStepRef.current + 1);
  };

  const runStirAnimation = async (srcId: string, dstId: string) => {
    isBusyRef.current = true;
    const rod = objMapRef.current[srcId];
    const home = rod.userData.home;
    const aw = targetAnchorWorld(dstId);

    // 1. Move rod inside beaker
    await addTweenPromise(rod.position, { x: aw.x + 0.35, y: aw.y - 0.4, z: aw.z }, 0.4);
    await addTweenPromise(rod.rotation, { z: 0.35 }, 0.2);

    // 2. Perform circular stir motion while boiling
    const beaker = objMapRef.current['beaker'];
    Effects.boil(beaker, 2.5);

    const pr = { t: 0 };
    await addTweenPromise(pr, { t: 1 }, 2.4, {
      ease: 'linear',
      onUpdate: (e: number) => {
        rod.position.x = aw.x + Math.cos(e * Math.PI * 6) * 0.35;
        rod.position.z = aw.z + Math.sin(e * Math.PI * 6) * 0.35;
      }
    });

    // 3. Return rod to home
    await addTweenPromise(rod.rotation, { z: 0 }, 0.2);
    await addTweenPromise(rod.position, { x: home.x, y: home.y, z: home.z }, 0.5);

    isBusyRef.current = false;
    playSound('step');
    if (onStepChange) onStepChange(currentStepRef.current + 1);
  };

  const runWaitAnimation = async () => {
    isBusyRef.current = true;
    const beaker = objMapRef.current['beaker'];

    // 1. Extinguish alcohol lamp
    const lamp = objMapRef.current['lamp'];
    const flame = lamp.userData.flame;
    if (flame) flame.visible = false;

    // 2. Separate soap solid layer
    await Effects.layer(beaker, { color: 0xf6f3e4, h: 0.35, opacity: 0.95, dur: 2.0 });

    await delaySeconds(0.5);

    isBusyRef.current = false;
    playSound('step');
    if (onStepChange) onStepChange(currentStepRef.current + 1);
  };

  const executeStep = (stepIdx: number) => {
    if (isBusyRef.current) return;
    if (stepIdx === 1) {
      runPourAnimation('oil', 'beaker', 0.25, 0xe9c63f, 0.85, () => {});
    } else if (stepIdx === 2) {
      runPourAnimation('naoh', 'beaker', 0.45, 0xdfc870, 0.8, () => {});
    } else if (stepIdx === 3) {
      runClickAnimation('lamp');
    } else if (stepIdx === 4) {
      runStirAnimation('rod', 'beaker');
    } else if (stepIdx === 5) {
      runPourAnimation('nacl', 'beaker', 0.62, 0xd8cfa0, 0.75, () => {});
    } else if (stepIdx === 6) {
      runWaitAnimation();
    }
  };

  const resetSimulation = () => {
    // 1. Restore initial positions and rotations
    Object.keys(objMapRef.current).forEach(id => {
      const o = objMapRef.current[id];
      const ih = o.userData.initHome;
      if (ih) {
        o.position.set(ih.x, ih.y, ih.z);
        o.rotation.set(0, 0, ih.rz || 0);
        o.userData.home = { ...ih };
      }
    });

    // 2. Reset liquid in beaker
    const beaker = objMapRef.current['beaker'];
    if (beaker) {
      const liq = beaker.userData.liq;
      if (liq) {
        liq.level = 0;
        liq.mesh.visible = false;
        liq.mesh.scale.set(1, 0.001, 1);
        liq.mesh.position.y = liq.y0;
        liq.mat.opacity = 0.1;
        liq.mat.color.set(0xffffff);
        if (liq.pile) liq.pile.visible = false;
      }
      
      // Remove dynamic soap layers
      const layers: THREE.Object3D[] = [];
      beaker.children.forEach(c => {
        if (c.name === 'soap-layer') {
          layers.push(c);
        }
      });
      layers.forEach(c => beaker.remove(c));
    }

    // 3. Extinguish lamp flame
    const lamp = objMapRef.current['lamp'];
    if (lamp && lamp.userData.flame) {
      lamp.userData.flame.visible = false;
    }

    // 4. Reset tweens, emitters, busy state
    tweensRef.current = [];
    emittersRef.current = [];
    isBusyRef.current = false;
  };

  // Watch parent step state (for buttons / external triggers)
  useEffect(() => {
    makeHighlightsForStep(currentStep);
    if (currentStep === 1) {
      resetSimulation();
    }
  }, [currentStep]);

  // Main canvas initialization
  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e1a2a);
    scene.fog = new THREE.Fog(0x0e1a2a, 34, 75);

    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 200);
    camera.position.set(0, 7, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.target.set(0, 2, 0);
    controls.minDistance = 5.5;
    controls.maxDistance = 26;
    controls.maxPolarAngle = 1.5;
    controls.minPolarAngle = 0.2;
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xdcecff, 0x33414f, 1.25);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xfff2dd, 1.45);
    dir.position.set(9, 17, 9);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    dir.shadow.camera.left = -16; dir.shadow.camera.right = 16;
    dir.shadow.camera.top = 16; dir.shadow.camera.bottom = -16;
    scene.add(dir);
    const accent = new THREE.PointLight(0x6db4ff, 0.75, 40);
    accent.position.set(-10, 9, 4);
    scene.add(accent);

    // Room objects
    // Floor
    const floorGeo = new THREE.PlaneGeometry(95, 70);
    const floorCanvas = document.createElement('canvas'); floorCanvas.width = floorCanvas.height = 256;
    const fg = floorCanvas.getContext('2d')!;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        fg.fillStyle = (x + y) % 2 ? '#26394d' : '#2e455d';
        fg.fillRect(x * 64, y * 64, 64, 64);
      }
    }
    fg.strokeStyle = 'rgba(140,180,220,.18)'; fg.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      fg.beginPath(); fg.moveTo(i * 64, 0); fg.lineTo(i * 64, 256); fg.stroke();
      fg.beginPath(); fg.moveTo(0, i * 64); fg.lineTo(256, i * 64); fg.stroke();
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(9, 7);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -7.4;
    floor.receiveShadow = true;
    scene.add(floor);

    // Wall
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(95, 30), new THREE.MeshStandardMaterial({ color: 0x3a5066, roughness: 0.95 }));
    wall.position.set(0, 7.5, -13.5);
    scene.add(wall);

    // Table
    const top = new THREE.Mesh(new THREE.BoxGeometry(27, 0.6, 9.4), new THREE.MeshStandardMaterial({ color: 0x223844, roughness: 0.5, metalness: 0.1 }));
    top.position.y = -0.3;
    top.receiveShadow = true;
    scene.add(top);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(25.8, 6.6, 8.6), new THREE.MeshStandardMaterial({ color: 0x3d6b75, roughness: 0.8 }));
    cab.position.y = -3.95;
    scene.add(cab);
    for (let i = -4; i <= 4; i += 2) {
      const knob = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.12), MAT.metal(0xc9d2da));
      knob.position.set(i * 2.6, -2.4, 4.32);
      scene.add(knob);
    }

    // Shelf
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(21, 0.28, 2.1), new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.7 }));
    shelf.position.set(0, 3.86, -3.05);
    shelf.receiveShadow = true;
    scene.add(shelf);
    for (const sx of [-10.2, 10.2]) {
      const sup = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.9, 1.9), new THREE.MeshStandardMaterial({ color: 0x82552c, roughness: 0.7 }));
      sup.position.set(sx, 1.95, -3.05);
      scene.add(sup);
    }
    const shelfLbl = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.85), new THREE.MeshBasicMaterial({ map: textTexture('KỆ HÓA CHẤT', { fs: 40, bd: '#b07a3a' }), transparent: true }));
    shelfLbl.position.set(0, 5.6, -3.4);
    scene.add(shelfLbl);

    // Setup helper containers
    const registerObj = (id: string, o: THREE.Object3D, opts: any = {}) => {
      o.userData.id = id;
      o.userData.draggable = !!opts.draggable;
      o.userData.clickable = !!opts.clickable;
      objMapRef.current[id] = o;
      if (opts.draggable || opts.clickable) interactivesRef.current.push(o);
      scene.add(o);
      o.userData.home = { x: o.position.x, y: o.position.y, z: o.position.z, rz: o.rotation.z };
      o.userData.initHome = { x: o.position.x, y: o.position.y, z: o.position.z, rz: o.rotation.z };
      return o;
    };

    const addTarget = (id: string, obj: THREE.Object3D, offset: THREE.Vector3, ringY?: number) => {
      targetsRef.current.push({ id, obj, offset, ringY });
    };

    const placard = (text: string, x: number, z: number, w = 1.4) => {
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(w, w * 0.3),
        new THREE.MeshBasicMaterial({ map: textTexture(text, { fs: 34, h: 78, w: 256, bd: '#88a7c5' }), transparent: true })
      );
      p.position.set(x, 0.16, z);
      p.rotation.x = -Math.PI / 2 + 0.5;
      scene.add(p);
      return p;
    };

    // Bottle creator
    const addBottleObj = (id: string, label: string, color: number, x: number, capColor = 0x37577a) => {
      const g = new THREE.Group();
      const liqMat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.75, shininess: 80 });
      const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.45, 20), liqMat);
      bBody.position.y = 0.76; bBody.castShadow = true;
      const bShoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 0.4, 20), liqMat);
      bShoulder.position.y = 1.68;
      const bNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 16), MAT.glass(0xeaf6ff, 0.35));
      bNeck.position.y = 2.07; bNeck.renderOrder = 3;
      const bCap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.3, 16), MAT.plastic(capColor));
      bCap.position.y = 2.34; bCap.castShadow = true;
      const lbl = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.5),
        new THREE.MeshBasicMaterial({ map: textTexture(label, { fs: 34 }), transparent: true })
      );
      lbl.position.set(0, 0.82, 0.505);
      g.add(bBody, bShoulder, bNeck, bCap, lbl);
      g.userData.dropColor = color;
      g.userData.h = 2.5;

      g.position.set(x, 4.05, -3.0);
      registerObj(id, g, { draggable: true });
    };

    // Add chemical bottles
    addBottleObj('oil', 'Dầu ăn', 0xe9c63f, -5.2, 0xd6a92a);
    addBottleObj('naoh', 'NaOH 40%', 0xffffff, -3.2);
    addBottleObj('nacl', 'NaCl\nbão hòa', 0xe6eef4, -1.2, 0x4a8a5a);

    // Tripod Stand setup
    const metal = MAT.metal(0x5f6770);
    const tri = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.55, 8), metal);
      leg.position.set(Math.cos(a) * 1.05, 0.78, Math.sin(a) * 1.05);
      tri.add(leg);
    }
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 8, 24), metal);
    ringMesh.rotation.x = Math.PI / 2; ringMesh.position.y = 1.52;
    const gauzeMesh = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 1.7), MAT.metal(0x8a9098));
    gauzeMesh.position.y = 1.57;
    tri.add(ringMesh, gauzeMesh);
    tri.position.set(0, 0, 0.3);
    scene.add(tri);

    // Beaker (Glassware)
    const beaker = new THREE.Group();
    const glassMat = MAT.glass();
    const wallMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05 * 0.94, 2.1, 28, 1, true), glassMat);
    wallMesh.position.y = 2.1 / 2; wallMesh.renderOrder = 3;
    const botGeo = new THREE.CylinderGeometry(1.05 * 0.94, 1.05 * 0.94, 0.07, 28);
    const bot = new THREE.Mesh(botGeo, glassMat);
    bot.position.y = 0.035; bot.renderOrder = 3;
    beaker.add(wallMesh, bot);

    // Liquid in beaker
    const liqGeo = new THREE.CylinderGeometry(1.05 * 0.88, 1.05 * 0.88 * 0.86, 1, 24);
    const liqMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, shininess: 95 });
    const liqMesh = new THREE.Mesh(liqGeo, liqMat);
    liqMesh.visible = false; liqMesh.renderOrder = 1; beaker.add(liqMesh);

    const pileMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 });
    const pile = new THREE.Mesh(new THREE.SphereGeometry(1.05 * 0.88 * 0.92, 16, 12), pileMat);
    pile.scale.set(1, 0.3, 1); pile.position.y = 0.1 + 0.04; pile.visible = false; pile.renderOrder = 1;
    beaker.add(pile);

    beaker.userData.liq = { mesh: liqMesh, mat: liqMat, pile, pileMat, r: 1.05 * 0.88, y0: 0.1, hMax: 2.1 * 0.82, level: 0 };
    beaker.userData.h = 2.1;

    beaker.position.set(0, 1.6, 0.3);
    registerObj('beaker', beaker, { clickable: true });
    addTarget('beaker', beaker, new THREE.Vector3(0, 2.2, 0));
    placard('Bộ đun cách lưới', 0, 2.1, 1.7);

    // Glass Rod
    const rod = new THREE.Group();
    const rm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 10), MAT.glass(0xcfe8f0, 0.5));
    rm.rotation.z = 1.35; rm.position.y = 0.12;
    rod.add(rm);
    rod.userData.h = 0.8;
    rod.position.set(-4.8, 0, 1.7);

    registerObj('rod', rod, { draggable: true });
    placard('Đũa thủy tinh', -4.8, 2.6, 1.4);

    // Alcohol Lamp
    const lampG = new THREE.Group();
    const lBody = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14),
      new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.45, shininess: 90 }));
    lBody.position.y = 0.5; lBody.scale.y = 0.82;
    const lFuel = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12),
      new THREE.MeshPhongMaterial({ color: 0xa9c8e8, transparent: true, opacity: 0.6 }));
    lFuel.position.y = 0.42; lFuel.scale.y = 0.6;
    const lCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.2, 14), MAT.metal(0xb8a44a));
    lCollar.position.y = 0.95;
    const lWick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), MAT.plastic(0xf5f0e0));
    lWick.position.y = 1.1;
    lampG.add(lBody, lFuel, lCollar, lWick);

    // Flame mesh
    const flameG = new THREE.Group();
    const fOuter = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.72, 12),
      new THREE.MeshBasicMaterial({ color: 0xff9a30, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    fOuter.position.y = 0.36;
    const fInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.34, 10),
      new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    fInner.position.y = 0.18;
    const fLight = new THREE.PointLight(0xffa040, 1.1, 7);
    fLight.position.y = 0.5;
    flameG.add(fOuter, fInner, fLight);
    flameG.visible = false;
    flameG.position.y = 1.2;
    lampG.add(flameG);

    lampG.userData.flame = flameG;
    lampG.userData.h = 1.3;
    lampG.position.set(0, 0, 0.3);

    registerObj('lamp', lampG, { clickable: true });

    let ft = 0;
    updatablesRef.current.push(dt => {
      if (flameG.visible) {
        ft += dt;
        const f = 1 + Math.sin(ft * 14) * 0.12 + Math.sin(ft * 23) * 0.07;
        fOuter.scale.set(f, f * (1 + Math.sin(ft * 9) * 0.1), f);
        fLight.intensity = 0.9 + Math.sin(ft * 17) * 0.25;
      }
      return true;
    });

    makeHighlightsForStep(currentStepRef.current);

    // Setup input listeners on renderer canvas
    const canvasElement = renderer.domElement;

    const setPointer = (e: PointerEvent) => {
      const r = canvasElement.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 2 - 1;
      const py = -((e.clientY - r.top) / r.height) * 2 + 1;
      return new THREE.Vector2(px, py);
    };

    const pickInteractive = (pointerVec: THREE.Vector2) => {
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointerVec, camera);
      const hits = raycaster.intersectObjects(interactivesRef.current, true);
      for (const h of hits) {
        let o: THREE.Object3D | null = h.object;
        while (o && !o.userData.id) o = o.parent;
        if (o && o.userData.id) return o;
      }
      return null;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isBusyRef.current || currentStepRef.current > 6) return;
      const p = setPointer(e);
      const o = pickInteractive(p);
      if (!o) return;

      dragRef.current.obj = o;
      dragRef.current.moved = false;
      dragRef.current.downAt.set(e.clientX, e.clientY);

      if (o.userData.draggable) {
        controls.enabled = false;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.obj || !drag.obj.userData.draggable) return;
      if (drag.downAt.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 7) {
        drag.moved = true;
      }
      if (!drag.moved) return;

      const p = setPointer(e);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(p, camera);
      const intersectPos = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(drag.plane, intersectPos)) {
        drag.obj.position.x = THREE.MathUtils.clamp(intersectPos.x, -10.5, 10.5);
        drag.obj.position.z = THREE.MathUtils.clamp(intersectPos.z, -4.3, 4.0);
        drag.obj.position.y = 1.7;
      }
    };

    const handlePointerUp = () => {
      const drag = dragRef.current;
      const o = drag.obj;
      drag.obj = null;
      controls.enabled = true;

      if (!o) return;

      if (!drag.moved) {
        // Handle clicks
        if (o.userData.clickable) {
          const stepIdx = currentStepRef.current;
          const steps = [
            { src: 'oil', dst: 'beaker', type: 'pour' },
            { src: 'naoh', dst: 'beaker', type: 'pour' },
            { id: 'lamp', type: 'click' },
            { src: 'rod', dst: 'beaker', type: 'stir' },
            { src: 'nacl', dst: 'beaker', type: 'pour' },
            { id: 'beaker', type: 'click' },
          ];
          const curStepItem = steps[stepIdx - 1];
          if (curStepItem && curStepItem.type === 'click' && curStepItem.id === o.userData.id) {
            executeStep(stepIdx);
          } else {
            playSound('err');
          }
        }
        return;
      }

      // Handle drop matching
      let best: TargetItem | null = null;
      let bestD = 1.9;

      for (const t of targetsRef.current) {
        if (t.id === o.userData.id) continue;
        const aw = targetAnchorWorld(t.id);
        const d = Math.hypot(aw.x - o.position.x, aw.z - o.position.z);
        if (d < bestD) { bestD = d; best = t; }
      }

      if (best) {
        const stepIdx = currentStepRef.current;
        const steps = [
          { src: 'oil', dst: 'beaker', type: 'pour' },
          { src: 'naoh', dst: 'beaker', type: 'pour' },
          { id: 'lamp', type: 'click' },
          { src: 'rod', dst: 'beaker', type: 'stir' },
          { src: 'nacl', dst: 'beaker', type: 'pour' },
          { type: 'wait' },
        ];
        const curStepItem = steps[stepIdx - 1];
        if (curStepItem && curStepItem.src === o.userData.id && curStepItem.dst === best.id) {
          executeStep(stepIdx);
          return;
        }
      }

      playSound('err');
      snapBack(o);
    };

    canvasElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Animation Loop
    let lastTime = 0;
    let reqId = 0;

    const animate = (timestamp: number) => {
      reqId = requestAnimationFrame(animate);
      if (!lastTime) lastTime = timestamp;
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      // Update Tweens
      const tweens = tweensRef.current;
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        if (tw.delay > 0) {
          tw.delay -= dt;
          continue;
        }
        if (!tw.started) {
          tw.started = true;
          for (const k in tw.to) {
            tw.from[k] = tw.target[k];
          }
        }
        tw.t += dt;
        const p = Math.min(tw.t / tw.dur, 1);
        const e = tw.ease(p);
        for (const k in tw.to) {
          tw.target[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
        }
        if (tw.onUpdate) tw.onUpdate(e);
        if (p >= 1) {
          tweens.splice(i, 1);
          if (tw.onDone) tw.onDone();
        }
      }

      // Update Emitters
      const emitters = emittersRef.current;
      for (let i = emitters.length - 1; i >= 0; i--) {
        if (emitters[i].update(dt) === false) {
          emitters.splice(i, 1);
        }
      }

      // Update generic updatables
      const updatables = updatablesRef.current;
      for (let i = updatables.length - 1; i >= 0; i--) {
        if (updatables[i](dt) === false) {
          updatables.splice(i, 1);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      canvasElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      // Dispose resources
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          if (node.geometry) node.geometry.dispose();
          if (node.material) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach((m: any) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        }
      });
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '18px',
          overflow: 'hidden',
          background: '#0e1a2a',
        }}
      />
      {/* Dynamic Action Trigger from React Panel */}
      <div style={{ display: 'none' }} id="sim-trigger" onClick={() => executeStep(currentStepRef.current)} />
    </div>
  );
}
