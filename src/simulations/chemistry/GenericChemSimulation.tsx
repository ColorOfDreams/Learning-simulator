import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../types';
import { CHEM_EXPERIMENT_ALIASES, EXPERIMENTS_CONFIG } from './experiments';

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
  const rawLines = String(text).split('\n');
  const fs = opts.fs || (rawLines.length > 1 ? 38 : 44);
  g.font = `bold ${fs}px "Be Vietnam Pro","Segoe UI",sans-serif`;
  const maxWidth = opts.maxWidth || c.width - 38;
  const lines = rawLines.flatMap((line) => {
    if (!opts.wrap || g.measureText(line).width <= maxWidth) return [line];
    const words = line.split(' ');
    const wrapped: string[] = [];
    let current = '';
    words.forEach((word) => {
      const next = current ? `${current} ${word}` : word;
      if (current && g.measureText(next).width > maxWidth) {
        wrapped.push(current);
        current = word;
      } else {
        current = next;
      }
    });
    if (current) wrapped.push(current);
    return wrapped;
  });
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
  copper() {
    return new THREE.MeshPhongMaterial({ color: 0xc26a3a, shininess: 90, specular: 0xffd0a0, emissive: 0x36180a });
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

// Custom textures references
let _glowTex: THREE.CanvasTexture | null = null;
let _smokeTex: THREE.CanvasTexture | null = null;
function getGlowTex() {
  if (!_glowTex) _glowTex = glowTexture('rgba(255,235,180,1)', 'rgba(255,160,40,0)');
  return _glowTex;
}
function getSmokeTex() {
  if (!_smokeTex) _smokeTex = glowTexture('rgba(240,240,245,0.85)', 'rgba(240,240,245,0)');
  return _smokeTex;
}

export default function GenericChemSimulation({
  config,
  currentStep = 1,
  onStepChange,
  onThumbnail,
}: SimulationProps & { currentStep?: number; onStepChange?: (step: number) => void; onThumbnail?: (simId: string, dataUrl: string) => void }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const tweensRef = useRef<TweenItem[]>([]);
  const emittersRef = useRef<EmitterItem[]>([]);
  const updatablesRef = useRef<((dt: number) => boolean)[]>([]);

  const objMapRef = useRef<Record<string, THREE.Object3D>>({});
  const targetsRef = useRef<TargetItem[]>([]);
  const interactivesRef = useRef<THREE.Object3D[]>([]);

  // Local active simulation config
  const requestedSimId = config.simulation_id;
  const simId = CHEM_EXPERIMENT_ALIASES[requestedSimId] || requestedSimId;
  const simDef = EXPERIMENTS_CONFIG[simId] || EXPERIMENTS_CONFIG['CHEM11-01'];

  const dragRef = useRef({
    obj: null as THREE.Object3D | null,
    moved: false,
    plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.7),
    downAt: new THREE.Vector2(),
    lastNDC: new THREE.Vector2(),
  });

  const isBusyRef = useRef<boolean>(false);
  const autoWaitStepRef = useRef<string>('');
  const currentStepRef = useRef<number>(currentStep);
  currentStepRef.current = currentStep;

  // Custom audio playback
  const playSound = (type: 'step' | 'err' | 'pour') => {
    Snd.init();
    if (type === 'step') Snd.step();
    else if (type === 'err') Snd.err();
    else if (type === 'pour') Snd.pour();
  };

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

  const snapBack = (o: THREE.Object3D) => {
    const home = o.userData.home;
    if (home) {
      addTween(o.position, { x: home.x, y: home.y, z: home.z }, 0.5, { ease: 'backOut' });
      addTween(o.rotation, { z: home.rz || 0 }, 0.3);
    }
  };

  const targetAnchorWorld = (id: string) => {
    const t = targetsRef.current.find(target => target.id === id);
    if (!t) return new THREE.Vector3();
    const v = new THREE.Vector3();
    t.obj.getWorldPosition(v);
    return v.add(t.offset);
  };

  const highlightMeshesRef = useRef<THREE.Object3D[]>([]);
  const clearHighlights = () => {
    highlightMeshesRef.current.forEach(h => {
      if (h.parent) h.parent.remove(h);
    });
    highlightMeshesRef.current = [];
  };

  const makeHighlightsForStep = (stepIdx: number) => {
    clearHighlights();
    const step = simDef.steps[stepIdx - 1];
    if (!step) return;

    const scene = sceneRef.current;
    if (!scene) return;

    const srcId = step.src || step.id;
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

    if (step.dst) {
      const dstId = step.dst;
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

  // Custom dynamic animations/effects library
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
        },
        stop() { stopped = true; }
      };
      emittersRef.current.push(e);
      return e;
    },

    bubblesAt(parent: THREE.Object3D, getPos: any, topY: number, opts: any = {}) {
      const rate = opts.rate || 18;
      const jr = opts.r || 0.12;
      const speed = opts.speed || 1.4;
      const dur = opts.dur != null ? opts.dur : 999;
      const mat = new THREE.MeshBasicMaterial({ color: opts.color || 0xffffff, transparent: true, opacity: 0.8 });
      const grp = new THREE.Group();
      parent.add(grp);

      const bubbleGeo = new THREE.SphereGeometry(1, 8, 6);
      const parts: THREE.Mesh[] = [];
      let t = 0, acc = 0, stopped = false;

      const e: EmitterItem = {
        update(dt) {
          t += dt;
          if (!stopped && t < dur) {
            acc += dt * rate;
            while (acc > 1) {
              acc--;
              const p = (typeof getPos === 'function') ? getPos() : getPos;
              const m = new THREE.Mesh(bubbleGeo, mat);
              m.position.set(p.x + (Math.random() - 0.5) * 2 * jr, p.y, p.z + (Math.random() - 0.5) * 2 * jr);
              m.scale.setScalar(0.035 + Math.random() * 0.05);
              m.userData.v = speed * (0.7 + Math.random() * 0.6);
              m.renderOrder = 2;
              grp.add(m); parts.push(m);
            }
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const m = parts[i];
            m.position.y += m.userData.v * dt;
            if (m.position.y >= topY) {
              grp.remove(m);
              parts.splice(i, 1);
            }
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

    stream(getFrom: () => THREE.Vector3, toY: number, opts: any = {}) {
      const dur = opts.dur || 1.15;
      const rate = opts.rate || 42;
      const color = opts.color != null ? opts.color : 0x9fd0ff;
      const geo = opts.powder ? new THREE.BoxGeometry(0.09, 0.09, 0.09) : new THREE.SphereGeometry(0.06, 6, 5);
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
              if (opts.powder) m.rotation.set(Math.random() * 3, Math.random() * 3, 0);
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

      const tex = opts.dark ? glowTexture('rgba(110,110,120,0.7)', 'rgba(110,110,120,0)') : getSmokeTex();
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

    sparks(worldPos: THREE.Vector3, opts: any = {}) {
      const count = opts.count || 90;
      const life = opts.life || 1.1;
      const speed = opts.speed || 6.5;
      const up = opts.up != null ? opts.up : 0.65;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const vel: THREE.Vector3[] = [];

      for (let i = 0; i < count; i++) {
        pos[i * 3] = worldPos.x; pos[i * 3 + 1] = worldPos.y; pos[i * 3 + 2] = worldPos.z;
        const a = Math.random() * 6.283;
        const b = Math.random() * Math.PI * up;
        const sp = speed * (0.35 + Math.random() * 0.75);
        vel.push(new THREE.Vector3(Math.cos(a) * Math.sin(b) * sp, Math.cos(b) * sp, Math.sin(a) * Math.sin(b) * sp));
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        size: opts.size || 0.22, map: getGlowTex(), transparent: true, opacity: 1,
        color: opts.color || 0xffc060, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const pts = new THREE.Points(geo, mat);
      const scene = sceneRef.current;
      if (scene) scene.add(pts);

      let t = 0;
      emittersRef.current.push({
        update(dt) {
          t += dt;
          const arr = geo.attributes.position.array as Float32Array;
          for (let i = 0; i < count; i++) {
            vel[i].y -= 10 * dt;
            arr[i * 3] += vel[i].x * dt;
            arr[i * 3 + 1] += vel[i].y * dt;
            arr[i * 3 + 2] += vel[i].z * dt;
            if (arr[i * 3 + 1] < 0.05) {
              arr[i * 3 + 1] = 0.05;
              vel[i].y *= -0.3;
              vel[i].x *= 0.7;
              vel[i].z *= 0.7;
            }
          }
          geo.attributes.position.needsUpdate = true;
          mat.opacity = Math.max(0, 1 - t / life);
          if (t >= life) {
            if (scene) scene.remove(pts);
            geo.dispose();
            mat.dispose();
            return false;
          }
          return true;
        }
      });
    },

    sparkler(parent: THREE.Object3D, localPos: THREE.Vector3, dur = 1.6) {
      const wp = parent.localToWorld(localPos.clone());
      let t = 0;
      emittersRef.current.push({
        update(dt) {
          t += dt;
          if (t < dur && Math.random() < 0.65) {
            Effects.sparks(wp, { count: 10, speed: 2.2, life: 0.45, size: 0.14, color: 0xffffff, up: 1 });
          }
          return t < dur;
        }
      });
    },

    precip(container: THREE.Object3D, opts: any = {}) {
      const liq = container.userData.liq;
      if (!liq) return Promise.resolve();
      const color = opts.color != null ? opts.color : 0xffffff;
      const dur = opts.dur || 1.8;
      liq.pileMat.color.setHex(color);
      liq.pile.visible = true;
      liq.pile.scale.set(0.01, 0.01, 0.01);
      return addTweenPromise(liq.pile.scale, { x: 1.0, y: 0.38, z: 1.0 }, dur);
    },

    dissolvePile(container: THREE.Object3D, opts: any = {}) {
      const liq = container.userData.liq;
      if (!liq) return Promise.resolve();
      const dur = opts.dur || 1.5;
      const color = opts.color || 0x1f4fc8;

      addTween(liq.mat.color, { r: ((color >> 16) & 255) / 255, g: ((color >> 8) & 255) / 255, b: (color & 255) / 255 }, dur);
      addTween(liq.mat, { opacity: opts.opacity || 0.8 }, dur);

      return addTweenPromise(liq.pile.scale, { x: 0.01, y: 0.01, z: 0.01 }, dur).then(() => {
        liq.pile.visible = false;
      });
    },

    mirror(container: THREE.Object3D, dur = 3.2) {
      const mir = container.userData.mirror;
      if (!mir) return Promise.resolve();
      mir.visible = true;
      mir.material.opacity = 0;
      return addTweenPromise(mir.material, { opacity: 0.95 }, dur);
    },

    sparkle(parent: THREE.Object3D, pos: THREE.Vector3, opts: any = {}) {
      const dur = opts.dur || 2.5;
      const rate = opts.rate || 6;
      const size = opts.size || 0.32;
      const tex = glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
      const parts: THREE.Sprite[] = [];
      const grp = new THREE.Group();
      grp.position.copy(pos);
      parent.add(grp);

      let t = 0, acc = 0;
      emittersRef.current.push({
        update(dt) {
          t += dt;
          if (t < dur) {
            acc += dt * rate;
            while (acc > 1) {
              acc--;
              const sm = new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
              const s = new THREE.Sprite(sm);
              s.position.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 0.8);
              s.scale.setScalar(size * (0.5 + Math.random()));
              s.userData = { life: 0, max: 0.6 + Math.random() * 0.4 };
              grp.add(s); parts.push(s);
            }
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const s = parts[i];
            s.userData.life += dt;
            const k = s.userData.life / s.userData.max;
            s.scale.setScalar(s.scale.x - dt * 0.12);
            s.material.opacity = 0.9 * (1 - k);
            if (k >= 1) { s.material.dispose(); grp.remove(s); parts.splice(i, 1); }
          }
          if (t >= dur && parts.length === 0) {
            if (grp.parent) grp.parent.remove(grp);
            tex.dispose();
            return false;
          }
          return true;
        }
      });
    },

    tint(container: THREE.Object3D, opts: any = {}) {
      const liq = container.userData.liq;
      if (!liq) return Promise.resolve();
      const color = opts.color || 0xffffff;
      const dur = opts.dur || 2.0;
      const targetOpacity = opts.opacity != null ? opts.opacity : 0.8;

      addTween(liq.mat, { opacity: targetOpacity }, dur);
      return addTweenPromise(liq.mat.color, { r: ((color >> 16) & 255) / 255, g: ((color >> 8) & 255) / 255, b: (color & 255) / 255 }, dur);
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
      m.name = 'ester-layer';
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
    },

    pileColor(container: THREE.Object3D, color: number, dur = 4) {
      const liq = container.userData.liq;
      if (!liq || !liq.pileMat) return Promise.resolve();
      return addTweenPromise(liq.pileMat.color, { r: ((color >> 16) & 255) / 255, g: ((color >> 8) & 255) / 255, b: (color & 255) / 255 }, dur);
    },

    naDance(ball: THREE.Object3D, basin: THREE.Object3D, opts: any = {}) {
      const dur = opts.dur || 5;
      const liq = basin.userData.liq;
      const topVal = liq ? liq.y0 + liq.level * liq.hMax : 0.65;
      const basinWorld = basin.getWorldPosition(new THREE.Vector3());
      ball.position.set(basinWorld.x, basinWorld.y + topVal + 0.05, basinWorld.z + 0.4);

      let t = 0;
      Effects.bubblesAt(sceneRef.current!, () => ball.position, topVal + 0.02, { rate: 24, r: 0.08, dur });
      Effects.steam(sceneRef.current!, ball.position, { rate: 2.2, size: 0.26, rise: 0.5, dur });

      return addTweenPromise(ball.position, { x: 0 }, dur, {
        ease: 'linear',
        onUpdate: (e: number) => {
          t = e * dur;
          ball.position.x = basinWorld.x + Math.cos(t * 7.5) * 1.35;
          ball.position.z = basinWorld.z + 0.4 + Math.sin(t * 5.2) * 0.95;
          ball.scale.setScalar(Math.max(0.01, 1 - e));
        }
      }).then(() => {
        ball.visible = false;
      });
    },

    thermite(container: THREE.Object3D, sandPos: THREE.Vector3) {
      // sparks & flare
      const wp = container.getWorldPosition(new THREE.Vector3());
      Effects.sparks(new THREE.Vector3(wp.x, wp.y + 0.6, wp.z), { count: 180, speed: 7.5, life: 1.5, size: 0.35, color: 0xffa020 });
      Effects.steam(container, new THREE.Vector3(0, 0.6, 0), { rate: 10, dur: 2.8, size: 0.65, dark: true });

      // drop molten iron
      const streamGeo = new THREE.SphereGeometry(0.09, 8, 6);
      const streamMat = new THREE.MeshBasicMaterial({ color: 0xffd24d });
      const stream = new THREE.Mesh(streamGeo, streamMat);
      stream.position.set(wp.x, wp.y + 0.9, wp.z);
      sceneRef.current!.add(stream);

      // sandbox reaction site
      const globMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 2.0 });
      const glob = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), globMat);
      glob.position.copy(sandPos);
      glob.scale.setScalar(0.01);
      sceneRef.current!.add(glob);

      return addTweenPromise(stream.position, { y: sandPos.y }, 0.45, { ease: 'quadIn' }).then(() => {
        sceneRef.current!.remove(stream);
        addTween(glob.scale, { x: 1, y: 1, z: 1 }, 0.5);
        addTween(globMat.color, { r: 0.3, g: 0.3, b: 0.35 }, 4.0, { delay: 1.0 });
        addTween(globMat, { emissiveIntensity: 0 }, 4.0, { delay: 1.0 });
      });
    }
  };

  const executeStep = async (stepIdx: number) => {
    if (isBusyRef.current) return;
    const step = simDef.steps[stepIdx - 1];
    if (!step) return;

    isBusyRef.current = true;

    if (step.type === 'pour' && step.src && step.dst) {
      playSound('pour');
      const src = objMapRef.current[step.src];
      const dst = objMapRef.current[step.dst];
      const home = src.userData.home;
      const aw = targetAnchorWorld(step.dst);

      await addTweenPromise(src.position, { x: aw.x + 2.35, y: aw.y + 1.62, z: aw.z }, 0.42);
      await addTweenPromise(src.rotation, { z: 1.78 }, 0.3);

      const liq = dst.userData.liq;
      let toY = aw.y - 0.9;
      if (liq) {
        const wp = dst.getWorldPosition(new THREE.Vector3());
        toY = wp.y + liq.y0 + liq.level * liq.hMax + 0.05;
      }

      Effects.stream(
        () => new THREE.Vector3(aw.x + (Math.random() - 0.5) * 0.1, aw.y + 1.12, aw.z + (Math.random() - 0.5) * 0.1),
        toY,
        { color: src.userData.dropColor, dur: 1.15, powder: src.userData.powder }
      );

      if (liq && step.pour) {
        const l0 = liq.level;
        const o0 = liq.mat.opacity;
        const pr = { t: 0 };
        const targetColor = step.pour.color != null ? step.pour.color : src.userData.dropColor;
        const targetOpacity = step.pour.opacity != null ? step.pour.opacity : 0.8;
        const targetLevel = step.pour.level;

        await addTweenPromise(pr, { t: 1 }, 1.15, {
          onUpdate: (e: number) => {
            liq.mat.color.copy(new THREE.Color(targetColor)).lerp(new THREE.Color(targetColor), e);
            liq.mat.opacity = o0 + (targetOpacity - o0) * e;
            const h = Math.max(0.001, (l0 + (targetLevel - l0) * e) * liq.hMax);
            liq.mesh.visible = true;
            liq.mesh.scale.set(1, h, 1);
            liq.mesh.position.y = liq.y0 + h / 2;
            liq.level = l0 + (targetLevel - l0) * e;
          }
        });
      } else {
        await delaySeconds(1.15);
      }

      await addTweenPromise(src.rotation, { z: 0 }, 0.28);
      await addTweenPromise(src.position, { x: home.x, y: home.y, z: home.z }, 0.5);
    }

    else if (step.type === 'move' && step.src && step.dst) {
      const src = objMapRef.current[step.src];
      const aw = targetAnchorWorld(step.dst);
      const offset = step.moveOffset || {};
      const targetY = aw.y + (offset.y || 0);
      const targetX = aw.x + (offset.dx || 0);

      await addTweenPromise(src.position, { x: targetX, y: targetY + 1.2, z: aw.z }, 0.5);
      await addTweenPromise(src.position, { y: targetY }, 0.35, { ease: 'quadIn' });
      if (offset.rotZ != null) {
        await addTweenPromise(src.rotation, { z: offset.rotZ }, 0.2);
      }
      src.userData.home = { x: targetX, y: targetY, z: aw.z, rz: offset.rotZ || 0 };
    }

    else if (step.type === 'shake' && step.id) {
      const o = objMapRef.current[step.id];
      const home = o.userData.home;
      const pr = { t: 0 };
      await addTweenPromise(pr, { t: 1 }, 1.5, {
        ease: 'linear',
        onUpdate: (e: number) => {
          o.position.x = home.x + Math.sin(e * Math.PI * 12) * 0.18;
        }
      });
      o.position.x = home.x;
    }

    else if (step.type === 'drop' && step.src && step.dst) {
      const src = objMapRef.current[step.src];
      const dst = objMapRef.current[step.dst];
      const aw = targetAnchorWorld(step.dst);
      const offset = step.dropOffset || {};
      const item = src.userData.itemMesh as THREE.Object3D | undefined;
      const home = src.userData.home;
      const detachItem = Boolean(item) && offset.attach !== true;

      await addTweenPromise(src.position, { x: aw.x, y: aw.y + 1.6, z: aw.z }, 0.5);
      await addTweenPromise(src.position, { y: aw.y + (offset.y || 0.15) }, 0.3, { ease: 'quadIn' });
      if (!detachItem && offset.rotZ != null) {
        await addTweenPromise(src.rotation, { z: offset.rotZ }, 0.25);
      }
      if (!detachItem && offset.scale != null) {
        await addTweenPromise(src.scale, { x: offset.scale, y: offset.scale, z: offset.scale }, 0.25);
      }

      if (detachItem) {
        src.remove(item!);

        if (step.dst === 'basin') {
          const scene = sceneRef.current;
          const liq = dst.userData.liq;
          const topVal = liq ? liq.y0 + liq.level * liq.hMax : 0.65;
          const dstWorld = dst.getWorldPosition(new THREE.Vector3());
          scene?.add(item!);
          item!.position.set(dstWorld.x + (offset.x || 0), dstWorld.y + topVal + 0.05, dstWorld.z + (offset.z || 0.4));
        } else {
          dst.add(item!);
          item!.position.set(offset.x || 0, offset.y || 0.4, offset.z || 0);
        }

        item!.rotation.set(0, 0, offset.rotZ || 0);
        if (offset.scale != null) {
          item!.scale.setScalar(offset.scale);
        }
        item!.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.renderOrder = 4;
          }
        });
        item!.userData.detached = true;
        item!.userData.basinId = step.dst;
        await Promise.all([
          addTweenPromise(src.position, { x: home.x, y: home.y, z: home.z }, 0.45),
          addTweenPromise(src.rotation, { z: home.rz || 0 }, 0.25),
        ]);
      } else {
        src.userData.home = { x: src.position.x, y: src.position.y, z: src.position.z, rz: offset.rotZ || 0 };
      }
    }

    else if (step.type === 'click' && step.id) {
      if (step.id === 'lamp') {
        const lamp = objMapRef.current['lamp'];
        const flame = lamp.userData.flame;
        if (flame) flame.visible = true;
      } else if (step.id === 'power') {
        const power = objMapRef.current['power'];
        const led = power.userData.led;
        if (led) {
          led.material.emissive.setHex(0x30ff60);
          led.material.color.setHex(0x60ff90);
        }
      } else if (step.id === 'switch') {
        const sw = objMapRef.current['switch'];
        // rotate lever
        const lever = sw.children[1];
        if (lever) addTween(lever.rotation, { z: -0.5 }, 0.25);
      } else if (step.id === 'source') {
        const src = objMapRef.current['source'];
        const hatch = src.userData.hatch;
        if (hatch) await addTweenPromise(hatch.position, { y: 2.62 }, 0.5);
      }
    }

    // Run custom reaction effects callback
    if (step.fx) {
      const beaker = objMapRef.current['beaker'] || objMapRef.current['cell'] || objMapRef.current['crucible'];
      const tube = objMapRef.current['tube'] || objMapRef.current['tube1'];
      const tube2 = objMapRef.current['tube2'];
      const basin = objMapRef.current['basin'];

      if (step.fx === 'precip_blue') {
        await Effects.precip(tube, { color: 0x3f9be0, tint: 0.5 });
      } else if (step.fx === 'tube_bubbles') {
        Effects.bubbles(tube, { dur: 1.0, rate: 8, r: 0.04 });
        await delaySeconds(1.0);
      } else if (step.fx === 'boil_tube') {
        await Effects.boil(tube, 2.5);
      } else if (step.fx === 'boil_beaker') {
        await Effects.boil(beaker, 2.2);
      } else if (step.fx === 'ester_layer') {
        const lamp = objMapRef.current['lamp'];
        if (lamp && lamp.userData.flame) lamp.userData.flame.visible = false;
        await Effects.layer(tube, { color: 0xfbf3c0, h: 0.18, opacity: 0.85, dur: 1.6 });
        Effects.sparkle(tube, new THREE.Vector3(0, 3.8, 0), { dur: 2.0 });
      } else if (step.fx === 'soap_layer') {
        const lamp = objMapRef.current['lamp'];
        if (lamp && lamp.userData.flame) lamp.userData.flame.visible = false;
        await Effects.layer(beaker, { color: 0xf6f3e4, h: 0.35, opacity: 0.95, dur: 2.0 });
      } else if (step.fx === 'dissolve_blue') {
        await Effects.dissolvePile(tube, { color: 0x1f4fc8, opacity: 0.8, dur: 1.4 });
      } else if (step.fx === 'precip_red') {
        const lamp = objMapRef.current['lamp'];
        if (lamp && lamp.userData.flame) lamp.userData.flame.visible = false;
        await Promise.all([
          Effects.precip(tube, { color: 0xc0392b, tint: 0.6, dur: 2.0 }),
          Effects.tint(tube, { color: 0xd07a50, opacity: 0.75, dur: 2.0 })
        ]);
      } else if (step.fx === 'precip_nh3_tan') {
        await Effects.precip(tube, { color: 0xb8aa96, tint: 0.4, dur: 0.7 });
        await Effects.dissolvePile(tube, { color: 0xe2ecf2, opacity: 0.5, dur: 1.0 });
      } else if (step.fx === 'silver_mirror') {
        await Effects.mirror(tube, 3.5);
        Effects.sparkle(tube, new THREE.Vector3(0, 2.2, 0), { dur: 2.5, rate: 9 });
      } else if (step.fx === 'starch_fade') {
        Effects.boil(tube, 2.2);
        await Effects.tint(tube, { color: 0xd8dde2, opacity: 0.55, dur: 2.2 });
      } else if (step.fx === 'starch_cool') {
        const lamp = objMapRef.current['lamp'];
        if (lamp && lamp.userData.flame) lamp.userData.flame.visible = false;
        await delaySeconds(1.0);
        await Effects.tint(tube, { color: 0x35307d, opacity: 0.9, dur: 2.2 });
      } else if (step.fx === 'biuret_violet') {
        await Effects.tint(tube, { color: 0x8e44ad, opacity: 0.85, dur: 1.6 });
        Effects.sparkle(tube, new THREE.Vector3(0, 3.7, 0), { dur: 1.6 });
      } else if (step.fx === 'na_dance') {
        const dish = objMapRef.current['na'];
        const ball = dish.userData.itemMesh;
        Effects.tint(basin, { color: 0xe87fb4, opacity: 0.55, dur: 4.5 });
        const home = dish.userData.home;
        const dance = Effects.naDance(ball, basin, { dur: 5.0 });
        addTween(dish.position, { x: home.x, y: home.y, z: home.z }, 0.6);
        await dance;
      } else if (step.fx === 'basin_sparkle') {
        const sparkleTarget = basin || beaker;
        if (sparkleTarget) Effects.sparkle(sparkleTarget, new THREE.Vector3(0, 1.3, 0), { dur: 1.5 });
      } else if (step.fx === 'nail_coat') {
        const nail = objMapRef.current['nail'];
        const coat = nail.userData.itemMesh.userData.coat;
        coat.visible = true;
        await Promise.all([
          addTweenPromise(coat.material, { opacity: 0.9 }, 4.0),
          Effects.tint(tube, { color: 0xaed4dc, opacity: 0.6, dur: 4.0 })
        ]);
      } else if (step.fx === 'al_react') {
        const al = objMapRef.current['al'];
        const chips = al.userData.itemMesh;
        Effects.bubbles(tube, { dur: 5.0, rate: 34, r: 0.055, speed: 1.8 });
        Effects.steam(tube, new THREE.Vector3(0, 3.6, 0), { dur: 4.0, rate: 2.5, size: 0.35 });
        await addTweenPromise(chips.scale, { x: 0.06, y: 0.06, z: 0.06 }, 4.5);
        chips.visible = false;
      } else if (step.fx === 'thermite_ignite') {
        const crucible = objMapRef.current['crucible'];
        const mg = objMapRef.current['mg'].userData.itemMesh || objMapRef.current['mg'];
        Effects.sparkler(crucible, new THREE.Vector3(0, 1.3, 0), 1.7);
        await delaySeconds(1.7);
        mg.visible = false;
        await Effects.thermite(crucible, new THREE.Vector3(0, 0.3, 1.2));
      } else if (step.fx === 'feoh2_ppt') {
        await Effects.precip(tube, { color: 0xc9d8cc, tint: 0.5 });
      } else if (step.fx === 'feoh3_ppt') {
        await Effects.precip(tube2, { color: 0x96402a, tint: 0.55 });
      } else if (step.fx === 'feoh2_oxidize') {
        await Effects.pileColor(tube, 0x96402a, 4.0);
        await Effects.tint(tube, { color: 0xc4a290, opacity: 0.7, dur: 1.0 });
      } else if (step.fx === 'electrolysis_start') {
        const coat = objMapRef.current['cell'].userData.coat;
        coat.visible = true;
        Effects.bubblesAt(sceneRef.current!, new THREE.Vector3(0.6, 0.5, 0.4), 1.25, { rate: 22, r: 0.1, dur: 7 });
        addTween(coat.material, { opacity: 0.9 }, 6.0);
        Effects.tint(beaker, { color: 0xa8cce4, opacity: 0.6, dur: 6.5 });
        await delaySeconds(3.0);
      } else if (step.fx === 'galvanic_cell') {
        const cell = objMapRef.current['cell'];
        const wire = cell.userData.wire;
        const bulb = cell.userData.bulb;
        if (wire) wire.visible = true;
        if (bulb?.material) {
          bulb.material.emissive.setHex(0xffd24a);
          bulb.material.color.setHex(0xfff0a0);
        }
        // Electron dots traveling Zn→arc peak→Cu along wire
        const cw = cell.getWorldPosition(new THREE.Vector3());
        const eMat = new THREE.MeshStandardMaterial({ color: 0xaaddff, emissive: 0x4488ff, emissiveIntensity: 3.0 });
        const eGeo = new THREE.SphereGeometry(0.09, 6, 5);
        const p0 = { x: cw.x - 0.7, y: cw.y + 2.65, z: cw.z + 0.4 };
        const p1 = { x: cw.x,       y: cw.y + 3.95, z: cw.z + 0.4 };
        const p2 = { x: cw.x + 0.7, y: cw.y + 2.65, z: cw.z + 0.4 };
        const fireE = (delay: number) => setTimeout(() => {
          if (!sceneRef.current) return;
          const e = new THREE.Mesh(eGeo, eMat);
          e.position.set(p0.x, p0.y, p0.z);
          sceneRef.current.add(e);
          addTweenPromise(e.position, p1, 0.32)
            .then(() => addTweenPromise(e.position, p2, 0.32))
            .then(() => sceneRef.current?.remove(e));
        }, delay);
        [0, 340, 680, 1020, 1360].forEach(fireE);
        await delaySeconds(2.4);
      } else if (step.fx === 'cu_bubbles') {
        // Bubbles at Cu strip (right side) — result of galvanic corrosion
        const cell = objMapRef.current['cell'];
        const cw = cell.getWorldPosition(new THREE.Vector3());
        Effects.bubblesAt(sceneRef.current!, new THREE.Vector3(cw.x + 0.85, 0.4, cw.z + 0.4), 1.15, { rate: 20, r: 0.11, dur: 4.0 });
        await delaySeconds(3.0);
      } else if (step.fx === 'zn_bubbles') {
        Effects.bubblesAt(sceneRef.current!, new THREE.Vector3(-0.85, 0.4, 0.4), 1.15, { rate: 14, r: 0.12, dur: 3.0 });
        await delaySeconds(2.0);
      } else if (step.fx === 'ind_acid') {
        await Effects.tint(objMapRef.current['tube1'], { color: 0xe0392b, opacity: 0.8, dur: 1.0 });
      } else if (step.fx === 'ind_neutral') {
        await Effects.tint(objMapRef.current['tube2'], { color: 0x4caf50, opacity: 0.7, dur: 1.0 });
      } else if (step.fx === 'ind_base') {
        await Effects.tint(objMapRef.current['tube3'], { color: 0x3a4ec0, opacity: 0.8, dur: 1.0 });
      } else if (step.fx === 'titration_end') {
        await Effects.tint(beaker, { color: 0xef6aa8, opacity: 0.7, dur: 2.0 });
        Effects.sparkle(beaker, new THREE.Vector3(0, 2.2, 0), { dur: 1.5 });
      } else if (step.fx === 'cu_hno3_react') {
        const cu = objMapRef.current['cu'];
        const chips = cu.userData.itemMesh;
        Effects.bubbles(tube, { dur: 5.0, rate: 26, r: 0.05, color: 0xb05a2a, speed: 1.6 });
        Effects.steam(tube, new THREE.Vector3(0, 3.4, 0), { dur: 5.0, rate: 4, size: 0.45, dark: true });
        Effects.bubblesAt(sceneRef.current!, () => tube.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 3.4, 0)), 6.5, { rate: 8, r: 0.25, speed: 1.2, color: 0xa85228, dur: 5.0 });
        await Effects.tint(tube, { color: 0x2e86de, opacity: 0.8, dur: 4.0 });
        await addTweenPromise(chips.scale, { x: 0.1, y: 0.1, z: 0.1 }, 4.0);
        chips.visible = false;
      } else if (step.fx === 'nh3_vapor') {
        Effects.steam(objMapRef.current['jar1'], new THREE.Vector3(0, 1.9, 0), { dur: 15.0, rate: 1.5, size: 0.3 });
      } else if (step.fx === 'hcl_vapor') {
        Effects.steam(objMapRef.current['jar2'], new THREE.Vector3(0, 1.9, 0), { dur: 15.0, rate: 1.5, size: 0.3 });
      } else if (step.fx === 'smoke_puff') {
        const jar1 = objMapRef.current['jar1'];
        const jar2 = objMapRef.current['jar2'];
        const home1 = jar1.userData.initHome;
        const home2 = jar2.userData.initHome;
        await Promise.all([
          addTweenPromise(jar1.position, { x: -0.6 }, 1.2),
          addTweenPromise(jar2.position, { x: 0.6 }, 1.2)
        ]);
        const mid = new THREE.Vector3(0, 2.2, 0.4);
        for (let i = 0; i < 5; i++) {
          Effects.steam(sceneRef.current!, mid.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.3, 0)), { rate: 8, size: 0.6, dur: 1.5 });
          await delaySeconds(0.35);
        }
        await delaySeconds(1.0);
        await Promise.all([
          addTweenPromise(jar1.position, { x: home1.x, y: home1.y, z: home1.z }, 1.0),
          addTweenPromise(jar2.position, { x: home2.x, y: home2.y, z: home2.z }, 1.0)
        ]);
        jar1.userData.home = { ...home1 };
        jar2.userData.home = { ...home2 };
      } else if (step.fx === 'sugar_carbon') {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.78, 0.85, 1.0, 16),
          new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 1.0 })
        );
        col.position.set(0, 0.5, 0);
        col.scale.set(1, 0.01, 1);
        beaker.add(col);
        Effects.steam(beaker, new THREE.Vector3(0, 2.6, 0), { dur: 5.0, rate: 5, size: 0.6, dark: true, rise: 1.4 });
        Effects.bubbles(beaker, { dur: 3.0, rate: 10, r: 0.05, color: 0x222222 });
        await addTweenPromise(col.scale, { y: 3.4 }, 4.0, { ease: 'quadOut' });
        await delaySeconds(1.0);
      } else if (step.fx === 'ethylene_bleach') {
        Effects.bubbles(tube, { dur: 4.0, rate: 16, r: 0.045 });
        await Effects.tint(tube, { color: 0xdde9f2, opacity: 0.4, dur: 3.5 });
      } else if (step.fx === 'acetylene_ppt') {
        Effects.bubbles(tube, { dur: 2.0, rate: 12, r: 0.04 });
        await Effects.precip(tube, { color: 0xf0e0a0, tint: 0.55 });
      } else if (step.fx === 'etoh_na_react') {
        const na = objMapRef.current['na'];
        const ball = na.userData.itemMesh;
        Effects.bubbles(tube, { dur: 5.0, rate: 18, r: 0.045, speed: 1.4 });
        await addTweenPromise(ball.scale, { x: 0.08, y: 0.08, z: 0.08 }, 4.5);
        ball.visible = false;
      } else if (step.fx === 'phenol_ppt') {
        await Effects.precip(tube, { color: 0xf4f4f4, tint: 0.5, dur: 1.6 });
      } else if (step.fx === 'gly_precip') {
        await Effects.precip(tube, { color: 0x3f9be0, tint: 0.5 });
      } else if (step.fx === 'gly_dissolve') {
        await Effects.dissolvePile(tube, { color: 0x1f4fc8, opacity: 0.85, dur: 1.5 });
      } else if (step.fx === 'acid_litmus') {
        await Effects.tint(objMapRef.current['tube1'], { color: 0xe0392b, opacity: 0.65, dur: 1.2 });
      } else if (step.fx === 'acid_caco3') {
        Effects.bubbles(objMapRef.current['tube2'], { dur: 5.0, rate: 30, r: 0.05, speed: 1.6 });
        Effects.steam(objMapRef.current['tube2'], new THREE.Vector3(0, 3.5, 0), { dur: 4.0, rate: 2, size: 0.3 });
        await delaySeconds(2.5);

      // ── Hóa học lớp 10 fx ──────────────────────────────────────────────

      } else if (step.fx === 'rutherford_beam') {
        const source = objMapRef.current['source'];
        const counter = objMapRef.current['cell']?.userData?.coat;
        if (!source) { await delaySeconds(1.0); }
        else {
          const hatch = source.userData.hatch as THREE.Mesh | undefined;
          if (hatch) await addTweenPromise(hatch.position, { y: hatch.position.y + 0.62 }, 0.5);
          const beam = alphaBeam(sceneRef.current!, counter);
          source.userData.beam = beam;
          emittersRef.current.push({ update: (dt: number) => beam.update(dt) });
          await delaySeconds(5.0);
        }

      } else if (step.fx === 'atom_model') {
        const source = objMapRef.current['source'];
        if (source?.userData?.beam) source.userData.beam.stop();
        const modelGrp = buildAtomModel();
        modelGrp.scale.setScalar(0.01);
        modelGrp.position.set(0, 5.1, 0.9);
        sceneRef.current!.add(modelGrp);
        objMapRef.current['atom_model'] = modelGrp;
        if (modelGrp.userData.loop) updatablesRef.current.push(modelGrp.userData.loop);
        Effects.sparkle(modelGrp, new THREE.Vector3(0, 0, 0), { dur: 2, rate: 9 });
        await addTweenPromise(modelGrp.scale, { x: 1.8, y: 1.8, z: 1.8 }, 0.9, { ease: 'backOut' });
        await delaySeconds(2.2);

      } else if (step.fx === 'flame_yellow' || step.fx === 'flame_purple' || step.fx === 'flame_cyan' || step.fx === 'flame_red') {
        const lamp = objMapRef.current['lamp'];
        const flame = lamp?.userData?.flame as THREE.Group | undefined;
        if (flame && flame.visible) {
          const fOuter = flame.children[0] as THREE.Mesh;
          const fLight = flame.children[2] as THREE.PointLight;
          const targetHex = step.fx === 'flame_yellow' ? 0xffcf3a :
                            step.fx === 'flame_purple' ? 0xb46ce0 :
                            step.fx === 'flame_cyan'   ? 0x35d6a0 : 0xff6a3a;
          const tc = new THREE.Color(targetHex);
          const startC = (fOuter.material as THREE.MeshBasicMaterial).color.clone();
          const proxy = { t: 0 };
          await addTweenPromise(proxy, { t: 1 }, 2.4, {
            onUpdate: (e: number) => {
              const c = startC.clone().lerp(tc, e);
              (fOuter.material as THREE.MeshBasicMaterial).color.copy(c);
              if (fLight) fLight.color.copy(c);
            }
          });
          if (step.fx === 'flame_red') {
            await delaySeconds(0.5);
            flame.visible = false;
          }
        } else {
          await delaySeconds(2.4);
        }

      } else if (step.fx === 'flame_test_yellow' || step.fx === 'flame_test_purple' ||
                 step.fx === 'flame_test_cyan'   || step.fx === 'flame_test_red') {
        const wire = objMapRef.current['wire'];
        const lamp  = objMapRef.current['lamp'];
        const flame = lamp?.userData?.flame as THREE.Group | undefined;
        if (!wire || !lamp) { await delaySeconds(3.0); }
        else {
          const lampWp = lamp.getWorldPosition(new THREE.Vector3());
          const flameTipY = lampWp.y + 1.35;
          const initHome  = wire.userData.initHome as { x: number; y: number; z: number };
          const savedY    = wire.position.y;

          // open bottle cap
          const bottle = step.dst ? objMapRef.current[step.dst] : null;
          const cap = bottle?.userData?.cap as THREE.Mesh | undefined;
          if (cap) {
            await Promise.all([
              addTweenPromise(cap.position, { y: cap.position.y + 1.6 }, 0.22, { ease: 'quadOut' }),
              addTweenPromise(cap.rotation, { z: 0.4 }, 0.22),
            ]);
          }

          // dip into bottle
          await addTweenPromise(wire.position, { y: savedY - 0.55 }, 0.3, { ease: 'quadIn' });
          await addTweenPromise(wire.position, { y: savedY }, 0.28, { ease: 'quadOut' });

          // close bottle cap while wire lifts
          if (cap) {
            addTween(cap.position, { y: 2.34 }, 0.28, { ease: 'quadIn' });
            addTween(cap.rotation, { z: 0 }, 0.28);
          }

          // lift
          await addTweenPromise(wire.position, { y: savedY + 2.5 }, 0.4, { ease: 'quadOut' });

          // arc to above flame, then lower loop into flame
          await addTweenPromise(wire.position, { x: lampWp.x, y: flameTipY + 1.2, z: lampWp.z }, 0.55);
          await addTweenPromise(wire.position, { y: flameTipY - 0.15 }, 0.32, { ease: 'quadIn' });

          // change flame color
          if (flame && flame.visible) {
            const fOuter = flame.children[0] as THREE.Mesh;
            const fLight = flame.children[2] as THREE.PointLight;
            const targetHex = step.fx === 'flame_test_yellow' ? 0xffcf3a :
                              step.fx === 'flame_test_purple' ? 0xb46ce0 :
                              step.fx === 'flame_test_cyan'   ? 0x35d6a0 : 0xff6a3a;
            const tc = new THREE.Color(targetHex);
            const startC = (fOuter.material as THREE.MeshBasicMaterial).color.clone();
            const proxy2 = { t: 0 };
            await addTweenPromise(proxy2, { t: 1 }, 1.8, {
              onUpdate: (e: number) => {
                const c = startC.clone().lerp(tc, e);
                (fOuter.material as THREE.MeshBasicMaterial).color.copy(c);
                if (fLight) fLight.color.copy(c);
              }
            });
          }
          await delaySeconds(0.6);

          // return wire to initial home position
          await addTweenPromise(wire.position, { y: flameTipY + 1.8 }, 0.3, { ease: 'quadOut' });
          await addTweenPromise(wire.position, { x: initHome.x, y: initHome.y, z: initHome.z }, 0.7);
          wire.userData.home = { x: initHome.x, y: initHome.y, z: initHome.z, rz: 0 };
        }

      } else if (step.fx === 'zn_dissolve') {
        const zn = objMapRef.current['zn'];
        const chips = zn?.userData?.itemMesh as THREE.Object3D | undefined;
        Effects.bubbles(tube, { dur: 5.0, rate: 30, r: 0.05, speed: 1.7 });
        Effects.steam(tube, new THREE.Vector3(0, 3.6, 0), { dur: 4.5, rate: 2, size: 0.3 });
        if (chips) await addTweenPromise(chips.scale, { x: 0.1, y: 0.1, z: 0.1 }, 4.5);
        if (chips) chips.visible = false;
        await delaySeconds(0.5);

      } else if (step.fx === 'mg_burn_flash') {
        const mgDish = objMapRef.current['mg'];
        const wp = mgDish ? mgDish.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 3, 0);
        const flashLight = new THREE.AmbientLight(0xffffff, 9.0);
        sceneRef.current!.add(flashLight);
        addTween(flashLight, { intensity: 0 }, 0.85, { ease: 'quadIn', onDone: () => sceneRef.current?.remove(flashLight) });
        Effects.sparkler(mgDish || sceneRef.current!, new THREE.Vector3(0, 1.2, 0), 1.8);
        const gLight = new THREE.PointLight(0xffffff, 5.5, 12);
        gLight.position.copy(wp);
        sceneRef.current!.add(gLight);
        for (let s = 0; s < 6; s++) {
          await delaySeconds(0.32);
          Effects.sparks(wp.clone().add(new THREE.Vector3(0, 1.0, 0)), { count: 50, speed: 4.5, life: 0.9, size: 0.35, color: 0xffffff });
        }
        addTween(gLight, { intensity: 0 }, 1.2);
        // hide entire Mg group (strip + clip base)
        if (mgDish) mgDish.visible = false;
        // small white ash cloud at tip of strip, fades out
        const ashMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f2, roughness: 1.0, transparent: true, opacity: 0.85 });
        const ash = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), ashMat);
        ash.scale.set(1.4, 0.6, 1.4);
        ash.position.copy(wp).add(new THREE.Vector3(0, 0.95, 0));
        sceneRef.current!.add(ash);
        await delaySeconds(0.8);
        addTween(ashMat, { opacity: 0 }, 1.2, { onDone: () => sceneRef.current?.remove(ash) });

      } else if (step.fx === 'quicklime_react') {
        const gLight2 = new THREE.PointLight(0xffb060, 2.5, 10);
        const bwp = beaker ? beaker.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 1.5, 0);
        gLight2.position.set(bwp.x, bwp.y + 2.0, bwp.z);
        sceneRef.current!.add(gLight2);
        Effects.bubbles(beaker, { dur: 4.0, rate: 12, r: 0.05 });
        Effects.steam(beaker, new THREE.Vector3(0, 2.4, 0), { dur: 5.0, rate: 6, size: 0.6, rise: 1.4 });
        await Effects.tint(beaker, { color: 0xeef0ee, opacity: 0.9, dur: 3.0 });
        addTween(gLight2, { intensity: 0 }, 1.5);
        await delaySeconds(1.0);

      } else if (step.fx === 'endotherm_react') {
        Effects.steam(beaker, new THREE.Vector3(0, 2.4, 0), { dur: 4.0, rate: 3, size: 0.45, rise: 0.9 });
        await Effects.layer(beaker, { color: 0xdfeef4, h: 0.22, opacity: 0.65, dur: 1.5 });
        await delaySeconds(1.2);

      } else if (step.fx === 'rate_conc_react') {
        const t1 = objMapRef.current['tube1'];
        const t2 = objMapRef.current['tube2'];
        await Promise.all([
          Effects.tint(t1, { color: 0xe7e0c0, opacity: 0.95, dur: 1.4 }),
          Effects.tint(t2, { color: 0xe7e0c0, opacity: 0.95, dur: 3.8 })
        ]);

      } else if (step.fx === 'h2o2_slow') {
        Effects.bubbles(tube, { dur: 2.0, rate: 2, r: 0.03 });
        await delaySeconds(0.6);

      } else if (step.fx === 'rate_cat_burst') {
        Effects.bubbles(tube, { dur: 5.0, rate: 42, r: 0.055, speed: 1.9 });
        Effects.steam(tube, new THREE.Vector3(0, 3.5, 0), { dur: 4.5, rate: 2.5, size: 0.32 });
        await delaySeconds(2.5);

      } else if (step.fx === 'rate_surface_react') {
        const t1b = objMapRef.current['tube1'];
        const t2b = objMapRef.current['tube2'];
        Effects.bubbles(t1b, { dur: 5.0, rate: 9, r: 0.045 });
        Effects.bubbles(t2b, { dur: 5.0, rate: 44, r: 0.055, speed: 1.9 });
        Effects.steam(t2b, new THREE.Vector3(0, 3.5, 0), { dur: 4.0, rate: 2, size: 0.3 });
        await delaySeconds(2.5);

      } else if (step.fx === 'halide_white') {
        const t1c = objMapRef.current['tube1'];
        await Effects.precip(t1c, { color: 0xf2f2f2, tint: 0.55 });

      } else if (step.fx === 'halide_pale_yellow') {
        const t2c = objMapRef.current['tube2'];
        await Effects.precip(t2c, { color: 0xf0e6a8, tint: 0.55 });

      } else if (step.fx === 'halide_yellow') {
        const tube3 = objMapRef.current['tube3'];
        await Effects.precip(tube3, { color: 0xf2d23a, tint: 0.6 });

      } else if (step.fx === 'chlorine_decolor') {
        await Effects.tint(tube, { color: 0xdde9f2, opacity: 0.4, dur: 3.0 });
        Effects.sparkle(tube, new THREE.Vector3(0, 3.6, 0), { dur: 1.5 });

      } else if (step.fx === 'halogen_orange') {
        await Effects.tint(tube, { color: 0xe88a2a, opacity: 0.8, dur: 2.5 });
      }
    }

    isBusyRef.current = false;
    playSound('step');
    if (onStepChange) onStepChange(currentStepRef.current + 1);
  };

  const resetSimulation = () => {
    // 1. Restore positions
    Object.keys(objMapRef.current).forEach(id => {
      const o = objMapRef.current[id];
      const ih = o.userData.initHome;
      if (ih) {
        o.position.set(ih.x, ih.y, ih.z);
        o.rotation.set(0, 0, ih.rz || 0);
        o.scale.setScalar(ih.scale || 1.0);
        o.userData.home = { ...ih };
      }
      o.visible = true;

      const item = o.userData.itemMesh as THREE.Object3D | undefined;
      const itemHome = o.userData.itemHome;
      if (item && itemHome) {
        if (item.parent !== o) {
          item.parent?.remove(item);
          o.add(item);
        }
        item.position.set(itemHome.x, itemHome.y, itemHome.z);
        item.rotation.set(itemHome.rx || 0, itemHome.ry || 0, itemHome.rz || 0);
        item.scale.setScalar(itemHome.scale || 1);
        item.visible = true;
        item.userData.detached = false;
      }

      // Reset dynamic internal objects
      const liq = o.userData.liq;
      if (liq) {
        liq.level = 0;
        liq.mesh.visible = false;
        liq.mesh.scale.set(1, 0.001, 1);
        liq.mesh.position.y = liq.y0;
        liq.mat.opacity = 0.1;
        liq.mat.color.set(0xffffff);
        if (liq.pile) liq.pile.visible = false;
      }

      if (o.userData.mirror) o.userData.mirror.visible = false;
      if (o.userData.flame) o.userData.flame.visible = false;
      if (o.userData.led) {
        o.userData.led.material.emissive.setHex(0x000000);
        o.userData.led.material.color.setHex(0x224422);
      }
      if (o.userData.coat) o.userData.coat.material.opacity = 0;
      if (o.userData.znBub) o.userData.znBub.stop();
      if (o.userData.beam) o.userData.beam.stop();
    });

    // Remove dynamic layers and objects
    const scene = sceneRef.current;
    if (scene) {
      const layers: THREE.Object3D[] = [];
      scene.traverse(node => {
        if (node.name === 'ester-layer' || node.name === 'atom-model-mesh') {
          layers.push(node);
        }
      });
      layers.forEach(l => {
        if (l.parent) l.parent.remove(l);
      });
      if (objMapRef.current['atom_model']) {
        scene.remove(objMapRef.current['atom_model']);
      }
    }

    // Reset switch lever
    const sw = objMapRef.current['switch'];
    if (sw) {
      const lever = sw.children[1];
      if (lever) lever.rotation.z = 0.5;
    }
    const cell = objMapRef.current['cell'];
    if (cell && cell.userData.wire) cell.userData.wire.visible = false;
    const hatch = objMapRef.current['source']?.userData.hatch;
    if (hatch) hatch.position.y = 2.0;

    tweensRef.current = [];
    emittersRef.current = [];
    isBusyRef.current = false;
  };

  useEffect(() => {
    makeHighlightsForStep(currentStep);
    if (currentStep === 1) {
      resetSimulation();
    }
  }, [currentStep]);

  useEffect(() => {
    const step = simDef.steps[currentStep - 1];
    if (!step || step.type !== 'wait') return;

    const autoKey = `${simId}:${currentStep}`;
    if (autoWaitStepRef.current === autoKey) return;
    autoWaitStepRef.current = autoKey;

    const timer = window.setTimeout(() => {
      if (currentStepRef.current === currentStep && !isBusyRef.current) {
        executeStep(currentStep);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [currentStep, simId]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Standard Room Scene Initialization
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e1a2a);
    scene.fog = new THREE.Fog(0x0e1a2a, 34, 75);

    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 200);
    camera.position.set(0, 7, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
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
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    scene.add(new THREE.HemisphereLight(0xdcecff, 0x33414f, 1.25));
    const dir = new THREE.DirectionalLight(0xfff2dd, 1.45);
    dir.position.set(9, 17, 9);
    dir.castShadow = true;
    scene.add(dir);
    scene.add(new THREE.PointLight(0x6db4ff, 0.75, 40));

    // Floor, Table, Shelves
    const floorGeo = new THREE.PlaneGeometry(95, 70);
    const floorCanvas = document.createElement('canvas'); floorCanvas.width = floorCanvas.height = 256;
    const fg = floorCanvas.getContext('2d')!;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        fg.fillStyle = (x + y) % 2 ? '#26394d' : '#2e455d';
        fg.fillRect(x * 64, y * 64, 64, 64);
      }
    }
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(9, 7);
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -7.4;
    scene.add(floor);

    const top = new THREE.Mesh(new THREE.BoxGeometry(27, 0.6, 9.4), new THREE.MeshStandardMaterial({ color: 0x223844, roughness: 0.5, metalness: 0.1 }));
    top.position.y = -0.3; scene.add(top);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(25.8, 6.6, 8.6), new THREE.MeshStandardMaterial({ color: 0x3d6b75, roughness: 0.8 }));
    cab.position.y = -3.95; scene.add(cab);

    const shelf = new THREE.Mesh(new THREE.BoxGeometry(21, 0.28, 2.1), new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: 0.7 }));
    shelf.position.set(0, 3.86, -3.05); scene.add(shelf);
    const placard = (text: string, x: number, z: number, w = 1.4) => {
      const lines = String(text).split('\n');
      const autoWidth = Math.min(4.2, Math.max(1.95, w, ...lines.map((line) => line.length * 0.17)));
      const planeH = Math.max(0.68, autoWidth * (lines.length > 1 ? 0.34 : 0.28));
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(autoWidth, planeH),
        new THREE.MeshBasicMaterial({
          map: textTexture(text, {
            fs: lines.length > 1 ? 50 : 56,
            h: lines.length > 1 ? 174 : 146,
            w: 768,
            bd: '#88a7c5',
            wrap: true,
            maxWidth: 640,
          }),
          transparent: true,
          side: THREE.DoubleSide,
        })
      );
      p.position.set(x, 0.18, z);
      p.rotation.x = -Math.PI / 2 + 0.5;
      scene.add(p);
      return p;
    };
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

    const addTarget = (id: string, obj: THREE.Object3D, offset: THREE.Vector3) => {
      targetsRef.current.push({ id, obj, offset });
    };

    // Object creation factory helpers
    let shelfX = -6.5;
    const addBottle = (id: string, label: string, color: number, opts: any = {}) => {
      const g = new THREE.Group();
      const liqMat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: opts.op != null ? opts.op : 0.82, shininess: 80 });
      const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.45, 20), liqMat);
      bBody.position.y = 0.76; bBody.castShadow = true;
      const bShoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 0.4, 20), liqMat);
      bShoulder.position.y = 1.68;
      const bNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 16), MAT.glass(0xeaf6ff, 0.35));
      bNeck.position.y = 2.07; bNeck.renderOrder = 3;
      const bCap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.3, 16), MAT.plastic(opts.cap || 0x37577a));
      bCap.position.y = 2.34; bCap.castShadow = true;
      const lbl = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.5),
        new THREE.MeshBasicMaterial({ map: textTexture(label, { fs: opts.fs || 40 }), transparent: true })
      );
      lbl.position.set(0, 0.82, 0.505);
      g.add(bBody, bShoulder, bNeck, bCap, lbl);
      g.userData.dropColor = color;
      g.userData.powder = !!opts.powder;
      g.userData.cap = bCap;
      g.userData.h = 2.5;

      g.position.set(opts.x != null ? opts.x : shelfX, opts.y ?? 4.05, opts.z ?? -3.0);
      if (opts.x == null) shelfX += 2.0;

      registerObj(id, g, { draggable: true });
      addTarget(id, g, new THREE.Vector3(0, 3.5, 0));
    };

    let rackSlots: { x: number; z: number }[] = [];
    let tubeCount = 0;
    const addRack = (rx: number, rz: number, n: number) => {
      const g = new THREE.Group();
      const wood = MAT.plastic(0x8a5a30);
      const spacing = n > 1 ? 2.05 : 0.95;
      const rackWidth = spacing * Math.max(n - 1, 0) + 1.55;
      const base = new THREE.Mesh(new THREE.BoxGeometry(rackWidth, 0.22, 1.25), wood);
      base.position.y = 0.11;
      const back = new THREE.Mesh(new THREE.BoxGeometry(rackWidth, 1.5, 0.14), wood);
      back.position.set(0, 0.97, -0.68);
      const top = new THREE.Mesh(new THREE.BoxGeometry(rackWidth, 0.12, 0.16), wood);
      top.position.set(0, 1.7, -0.58);
      g.add(base, back, top);

      for (let i = 0; i < n; i++) {
        const hx = -(n - 1) * spacing / 2 + i * spacing;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.055, 8, 18), wood);
        ring.rotation.x = Math.PI / 2; ring.position.set(hx, 1.7, 0.04);
        g.add(ring);
        rackSlots.push({ x: rx + hx, z: rz + 0.06 });
      }
      g.position.set(rx, 0, rz);
      scene.add(g);
    };

    const addTube = (id: string, opts: any = {}) => {
      if (rackSlots.length === 0) addRack(-1.6, 0.5, 1);
      const slot = rackSlots[tubeCount % rackSlots.length];
      tubeCount++;

      const g = new THREE.Group();
      const glassMat = MAT.glass();
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3.0, 24, 1, true), glassMat);
      wall.position.y = 1.92; wall.renderOrder = 3;
      const bot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glassMat);
      bot.position.y = 0.42; bot.renderOrder = 3;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 10, 24), glassMat.clone());
      rim.rotation.x = Math.PI / 2; rim.position.y = 3.42; rim.renderOrder = 3;
      g.add(wall, bot, rim);
      attachLiquid(g, { r: 0.345, y0: 0.14, hMax: 2.85 });

      const mir = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 2.4, 20),
        new THREE.MeshPhongMaterial({ color: 0xdde2ea, shininess: 140, specular: 0xffffff, transparent: true, opacity: 0 }));
      mir.position.y = 1.45; mir.visible = false; mir.renderOrder = 2;
      g.add(mir);

      g.userData.mirror = mir;
      g.userData.h = 3.45;
      g.position.set(slot.x, 0.32, slot.z);

      registerObj(id, g, { draggable: true, clickable: true });
      addTarget(id, g, new THREE.Vector3(0, 3.5, 0));
      if (opts.label) placard(opts.label, slot.x, slot.z + 1.15, 0.9);
    };

    const addBeaker = (id: string, bx: number, bz: number, opts: any = {}) => {
      const r = opts.r || 1.05;
      const h = opts.h || 2.1;
      const g = new THREE.Group();
      const glassMat = MAT.glass();
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.94, h, 28, 1, true), glassMat);
      wall.position.y = h / 2; wall.renderOrder = 3;
      const bot = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r * 0.94, 0.07, 28), glassMat);
      bot.position.y = 0.035; bot.renderOrder = 3;
      g.add(wall, bot);
      attachLiquid(g, { r: r * 0.88, y0: 0.1, hMax: h * 0.82 });
      g.userData.h = h;
      g.position.set(bx, 0, bz);

      registerObj(id, g, { clickable: !!opts.clickable });
      addTarget(id, g, new THREE.Vector3(0, h + 0.05, 0));
    };

    const addBasin = (id: string, bx = 0, bz = 0.4) => {
      const g = new THREE.Group();
      const glassMat = MAT.glass(0xd8f2ff, 0.25);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.9, 1.15, 36, 1, true), glassMat);
      wall.position.y = 0.58; wall.renderOrder = 3;
      const bot = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.08, 36), glassMat);
      bot.position.y = 0.04; bot.renderOrder = 3;
      g.add(wall, bot);
      attachLiquid(g, { r: 2.05, y0: 0.1, hMax: 0.9 });
      g.userData.h = 1.15;
      g.position.set(bx, 0, bz);

      registerObj(id, g, { clickable: true });
      addTarget(id, g, new THREE.Vector3(0, 1.25, 0));
      const liq = g.userData.liq;
      liq.mat.color.setHex(0xb9e0f0);
      liq.mat.opacity = 0.5;
      liq.mesh.visible = true;
      liq.mesh.scale.set(1, 0.62 * liq.hMax, 1);
      liq.mesh.position.y = liq.y0 + (0.62 * liq.hMax) / 2;
      liq.level = 0.62;
    };

    const addLampStand = (lx = 4.5, lz = -0.4) => {
      const g = new THREE.Group();
      const metal = MAT.metal(0x6a727c);
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.65), metal);
      base.position.set(0, 0.09, 0);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 5.2, 10), metal);
      rod.position.set(1.0, 2.6, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.95, 8), metal);
      arm.rotation.z = Math.PI / 2; arm.position.set(0.45, 3.25, 0);
      const clamp = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.06, 8, 20), metal);
      clamp.rotation.x = Math.PI / 2; clamp.position.set(-0.45, 3.25, 0);
      g.add(base, rod, arm, clamp);
      g.position.set(lx, 0, lz);
      scene.add(g);
      registerObj('standGroup', g, {});
      addTarget('stand', g, new THREE.Vector3(-0.45, 1.85, 0));

      const lamp = createLamp();
      lamp.position.set(lx - 0.45, 0, lz);
      registerObj('lamp', lamp, { clickable: true });
      placard('Đèn cồn\n+ giá đỡ', lx, lz + 1.7, 2.4);
    };

    const addBath = (bx = 4.6, bz = 0.3) => {
      addBeaker('bath', bx, bz, { r: 1.15, h: 2.3 });
      const b = objMapRef.current['bath'];
      const liq = b.userData.liq;
      liq.mat.color.setHex(0xd2ecf5);
      liq.mat.opacity = 0.5;
      liq.mesh.visible = true;
      liq.mesh.scale.set(1, 0.62 * liq.hMax, 1);
      liq.mesh.position.y = liq.y0 + (0.62 * liq.hMax) / 2;
      liq.level = 0.62;

      Effects.steam(b, new THREE.Vector3(0, 2.3, 0), { rate: 2.2, size: 0.5, dur: 9999 });
      placard('Cốc nước nóng 70°C', bx, bz + 1.7, 1.8);
      addTarget('bath', b, new THREE.Vector3(0, 1.4, 0));
    };

    const addDishItem = (id: string, itemMesh: THREE.Object3D, dx: number, dz: number, label?: string, dy = 0) => {
      const g = new THREE.Group();
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.52, 0.14, 24), MAT.plastic(0xf2f4f6));
      dish.position.y = 0.07; dish.castShadow = true;
      g.add(dish);
      itemMesh.position.y += 0.14;
      g.add(itemMesh);
      g.position.set(dx, dy, dz);
      registerObj(id, g, { draggable: true });
      if (label) { const lp = placard(label, dx, dz + 1.0, 1.5); if (dy) lp.position.y += dy; }
      g.userData.itemMesh = itemMesh;
      g.userData.itemHome = {
        x: itemMesh.position.x,
        y: itemMesh.position.y,
        z: itemMesh.position.z,
        rx: itemMesh.rotation.x,
        ry: itemMesh.rotation.y,
        rz: itemMesh.rotation.z,
        scale: itemMesh.scale.x,
      };
      g.userData.h = 1;
    };

    const createLamp = () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14),
        new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: 0.45, shininess: 90 }));
      body.position.y = 0.5; body.scale.y = 0.82;
      const fuel = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12),
        new THREE.MeshPhongMaterial({ color: 0xa9c8e8, transparent: true, opacity: 0.6 }));
      fuel.position.y = 0.42; fuel.scale.y = 0.6;
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.2, 14), MAT.metal(0xb8a44a));
      collar.position.y = 0.95;
      const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), MAT.plastic(0xf5f0e0));
      wick.position.y = 1.1;
      g.add(body, fuel, collar, wick);

      // Flame
      const flameG = new THREE.Group();
      const fOuter = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.72, 12), new THREE.MeshBasicMaterial({ color: 0xff9a30, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
      fOuter.position.y = 0.36;
      const fInner = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.34, 10), new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      fInner.position.y = 0.18;
      const fLight = new THREE.PointLight(0xffa040, 1.1, 7);
      fLight.position.y = 0.5;
      flameG.add(fOuter, fInner, fLight);
      flameG.visible = false;
      flameG.position.y = 1.2;
      g.add(flameG);

      g.userData.flame = flameG;
      g.userData.h = 1.3;

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

      return g;
    };

    const attachLiquid = (group: THREE.Group, bounds: { r: number; y0: number; hMax: number }) => {
      const geo = new THREE.CylinderGeometry(bounds.r, bounds.r * 0.86, 1, 24);
      const mat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, shininess: 95, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false; mesh.renderOrder = 1; group.add(mesh);
      const pileMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 });
      const pile = new THREE.Mesh(new THREE.SphereGeometry(bounds.r * 0.92, 16, 12), pileMat);
      pile.scale.set(1, 0.3, 1); pile.position.y = bounds.y0 + 0.04; pile.visible = false; pile.renderOrder = 1;
      group.add(pile);
      group.userData.liq = { mesh, mat, pile, pileMat, r: bounds.r, y0: bounds.y0, hMax: bounds.hMax, level: 0 };
    };

    const makeAlphaCounter = (parentScene: THREE.Scene, x: number, z: number, ry = 0) => {
      const c = document.createElement('canvas'); c.width = 512; c.height = 300;
      const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
      const counts = { straight: 0, lech: 0, back: 0 };
      const draw = () => {
        const g = c.getContext('2d')!;
        g.fillStyle = '#0e2238'; g.fillRect(0, 0, 512, 300);
        g.strokeStyle = '#5fb0e8'; g.lineWidth = 10; g.strokeRect(5, 5, 502, 290);
        g.textAlign = 'center'; g.fillStyle = '#cfe8ff';
        g.font = 'bold 40px "Be Vietnam Pro","Segoe UI",sans-serif';
        g.fillText('ĐẾM CHỚP SÁNG (hạt α)', 256, 62);
        g.textAlign = 'left'; g.font = 'bold 38px "Be Vietnam Pro","Segoe UI",sans-serif';
        g.fillStyle = '#8fd8ff'; g.fillText('→  Đi thẳng:  ' + counts.straight, 42, 135);
        g.fillStyle = '#ffc24a'; g.fillText('↗  Lệch hướng:  ' + counts.lech, 42, 200);
        g.fillStyle = '#ff7a64'; g.fillText('↩  Bật ngược:  ' + counts.back, 42, 265);
        tex.needsUpdate = true;
      };
      draw();

      const board = new THREE.Group();
      const backP = new THREE.Mesh(new THREE.BoxGeometry(3.45, 2.1, 0.12), MAT.plastic(0x24435e));
      backP.position.set(0, 2.5, -0.08);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.95), new THREE.MeshBasicMaterial({ map: tex }));
      panel.position.y = 2.5;
      board.add(backP, panel);
      for (const lx of [-1.3, 1.3]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 8), MAT.metal(0x6a727c));
        leg.position.set(lx, 0.77, -0.08);
        board.add(leg);
      }
      board.position.set(x, 0, z);
      board.rotation.y = ry;
      parentScene.add(board);
      return { add(k: 'straight' | 'lech' | 'back') { counts[k]++; draw(); }, counts };
    };

    // Execute declarative setup commands
    simDef.setup.forEach(cmd => {
      if (cmd.type === 'rack') {
        addRack(cmd.x!, cmd.z!, cmd.n!);
      } else if (cmd.type === 'tube') {
        addTube(cmd.id!, { label: cmd.label });
      } else if (cmd.type === 'bottle') {
        addBottle(cmd.id!, cmd.label!, cmd.color!, { op: cmd.op, cap: cmd.cap, fs: cmd.fs, powder: cmd.powder, x: cmd.x, y: cmd.y, z: cmd.z });
      } else if (cmd.type === 'beaker') {
        addBeaker(cmd.id!, cmd.x!, cmd.z!, { r: cmd.r, h: cmd.h, clickable: true });
      } else if (cmd.type === 'basin') {
        addBasin(cmd.id!, cmd.x, cmd.z);
      } else if (cmd.type === 'lampstand') {
        addLampStand(cmd.x, cmd.z);
      } else if (cmd.type === 'bath') {
        addBath(cmd.x, cmd.z);
      } else if (cmd.type === 'dish_sodium') {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: 0.35, roughness: 0.35 }));
        ball.position.y = 0.3;
        addDishItem(cmd.id!, ball, cmd.x!, cmd.z!, cmd.label);
      } else if (cmd.type === 'dish_nail') {
        const nail = new THREE.Group();
        const nBody = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1.6, 10), MAT.metal(0x7d8893));
        nBody.position.y = 0.8;
        const nHead = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.07, 10), MAT.metal(0x7d8893));
        nHead.position.y = 1.6;
        nail.add(nBody, nHead);
        const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.065, 1.1, 10), MAT.copper());
        coat.material.transparent = true; coat.material.opacity = 0;
        coat.position.y = 0.55; coat.visible = false;
        nail.add(coat);
        nail.userData.coat = coat;

        addDishItem(cmd.id!, nail, cmd.x!, cmd.z!, cmd.label);
      } else if (cmd.type === 'dish_marble') {
        const stones = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.92, metalness: 0.02 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0xcfc8ba, roughness: 0.95, metalness: 0.02 });
        const positions = [
          { x: -0.18, y: 0.11, z: -0.04, s: [0.38, 0.22, 0.3], r: [0.2, 0.4, -0.15] },
          { x: 0.16, y: 0.1, z: 0.08, s: [0.32, 0.2, 0.26], r: [-0.18, -0.25, 0.28] },
          { x: 0.0, y: 0.2, z: -0.18, s: [0.25, 0.16, 0.22], r: [0.35, 0.1, 0.1] },
        ];
        positions.forEach((p, i) => {
          const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), i === 1 ? darkMat : stoneMat);
          stone.position.set(p.x, p.y, p.z);
          stone.scale.set(p.s[0], p.s[1], p.s[2]);
          stone.rotation.set(p.r[0], p.r[1], p.r[2]);
          stone.castShadow = true;
          stones.add(stone);
        });
        addDishItem(cmd.id!, stones, cmd.x!, cmd.z!, cmd.label);
      } else if (cmd.type === 'dish_chips') {
        const chips = new THREE.Group();
        for (let i = 0; i < 3; i++) {
          const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.22), MAT.metal(0xc8cdd4));
          c.position.set((i - 1) * 0.22, 0.05, (i % 2) * 0.18 - 0.08);
          c.rotation.y = i * 1.1;
          chips.add(c);
        }
        addDishItem(cmd.id!, chips, cmd.x!, cmd.z!, cmd.label);
      } else if (cmd.type === 'dish_mg') {
        const g = new THREE.Group();
        // thin metallic ribbon standing upright
        const stripMat = new THREE.MeshStandardMaterial({ color: 0xd4d8e0, metalness: 0.88, roughness: 0.22 });
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.022), stripMat);
        strip.position.y = 0.5;
        g.add(strip);
        // small clip base
        const clip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.18), MAT.metal(0x8a8e96));
        clip.position.y = 0.03;
        g.add(clip);
        g.position.set(cmd.x!, 0, cmd.z!);
        g.userData.itemMesh = strip;
        g.userData.h = 1;
        registerObj(cmd.id!, g, { draggable: true });
        if (cmd.label) placard(cmd.label, cmd.x!, cmd.z! + 1.0, 1.5);
      } else if (cmd.type === 'dish_foil') {
        const foil = new THREE.Group();
        const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.92),
          new THREE.MeshStandardMaterial({ color: 0xffd24a, metalness: 0.92, roughness: 0.22, emissive: 0x3a2a06 }));
        sheet.position.y = 0.75;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 1.02), MAT.metal(0x6a727c));
        bar.position.y = 1.45;
        foil.add(sheet, bar);

        addDishItem(cmd.id!, foil, cmd.x!, cmd.z!, cmd.label, cmd.y ?? 0);
      } else if (cmd.type === 'wire_loop') {
        const g = new THREE.Group();
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 1.1, 8),
          new THREE.MeshPhongMaterial({ color: 0xd0e8f0, transparent: true, opacity: 0.65 })
        );
        handle.position.y = 0.6;
        const wireMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.28, 6),
          MAT.metal(0xc8c0b8)
        );
        wireMesh.position.y = 1.3;
        const loop = new THREE.Mesh(
          new THREE.TorusGeometry(0.055, 0.014, 6, 12),
          MAT.metal(0xc8c0b8)
        );
        loop.position.y = 1.5;
        loop.rotation.x = Math.PI / 2;
        g.add(handle, wireMesh, loop);
        g.position.set(cmd.x!, 0, cmd.z!);
        g.userData.h = 1.6;
        g.userData.initHome = { x: cmd.x!, y: 0, z: cmd.z! };
        registerObj(cmd.id!, g, { draggable: true });
        if (cmd.label) placard(cmd.label, cmd.x!, cmd.z! + 1.0, 1.5);
      } else if (cmd.type === 'electrolysis_cell') {
        // Special beaker with graphite electrodes
        addBeaker(cmd.id!, cmd.x!, cmd.z!, { r: 1.25, h: 2.4, clickable: true });
        const cell = objMapRef.current[cmd.id!];

        const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.3), MAT.plastic(0x3a3f46));
        bar.position.set(0, 2.85, 0);
        cell.add(bar);

        const gMat = new THREE.MeshStandardMaterial({ color: 0x2e3236, metalness: 0.25, roughness: 0.6 });
        const cath = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 10), gMat);
        cath.position.set(-0.6, 1.7, 0);
        const ano = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 10), gMat.clone());
        ano.position.set(0.6, 1.7, 0);
        cell.add(cath, ano);

        const coat = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 1.1, 10), MAT.copper());
        coat.material.transparent = true; coat.material.opacity = 0; coat.visible = false;
        coat.position.set(-0.6, 0.85, 0);
        cell.add(coat);
        cell.userData.coat = coat;

        // Wires
        const from1 = new THREE.Vector3(4.4 - 0.9, 1.4, -0.3);
        const to1 = new THREE.Vector3(-0.6, 2.85 + 0.22, 0.4);
        const mid1 = from1.clone().lerp(to1, 0.5); mid1.y += 1.1;
        const curve1 = new THREE.QuadraticBezierCurve3(from1, mid1, to1);
        const w1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 24, 0.045, 8), MAT.plastic(0x222a30));
        scene.add(w1);

        const from2 = new THREE.Vector3(4.4 + 0.9, 1.4, -0.3);
        const to2 = new THREE.Vector3(0.6, 2.85 + 0.22, 0.4);
        const mid2 = from2.clone().lerp(to2, 0.5); mid2.y += 1.1;
        const curve2 = new THREE.QuadraticBezierCurve3(from2, mid2, to2);
        const w2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, 24, 0.045, 8), MAT.plastic(0xc03030));
        scene.add(w2);
      } else if (cmd.type === 'power_supply') {
        const box = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.45, 1.2), MAT.plastic(0x2b3a4e));
        body.position.y = 0.73;
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5),
          new THREE.MeshBasicMaterial({ map: textTexture('DC 6V', { bg: '#0c2238', fg: '#5fe0ff', fs: 52, border: false }) }));
        screen.position.set(-0.25, 0.95, 0.61);
        const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.14, 14),
          new THREE.MeshStandardMaterial({ color: 0xd03a3a, roughness: 0.4 }));
        btn.rotation.x = Math.PI / 2; btn.position.set(0.62, 0.55, 0.61);
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8),
          new THREE.MeshStandardMaterial({ color: 0x224422, emissive: 0x000000 }));
        led.position.set(0.62, 0.95, 0.61);
        box.add(body, screen, btn, led);
        box.position.set(cmd.x!, 0, cmd.z!);
        box.userData.h = 1.6;
        box.userData.led = led;
        registerObj(cmd.id!, box, { clickable: true });
        placard('Nguồn điện DC — nhấp nút đỏ', cmd.x!, cmd.z! + 1.6, 2.2);
      } else if (cmd.type === 'zinc_copper_strips') {
        const cell = objMapRef.current['cell'];
        const zn = makeStrip(0x8d979e);
        zn.position.set(-0.7, 0.15, 0); zn.rotation.z = 0.18;
        cell.add(zn);
        const cu = makeStrip(0xc26a3a);
        cu.position.set(0.7, 0.15, 0); cu.rotation.z = -0.18;
        cell.add(cu);
        const cellWorld = cell.getWorldPosition(new THREE.Vector3());
        placard('Zn', cellWorld.x - 1.45, cellWorld.z + 1.85, 0.8);
        placard('Cu', cellWorld.x + 1.05, cellWorld.z + 1.85, 0.8);

        // wires and bulb model
        const wireGrp = new THREE.Group();
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-0.7, 2.6, 0.4), new THREE.Vector3(0, 3.9, 0.4), new THREE.Vector3(0.7, 2.6, 0.4));
        const w = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.045, 8), MAT.plastic(0xc03030));
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10),
          new THREE.MeshStandardMaterial({ color: 0x554422, emissive: 0x000000 }));
        bulb.position.set(0, 3.9, 0.4);
        wireGrp.add(w, bulb);
        wireGrp.visible = false;
        cell.add(wireGrp);
        cell.userData.wire = wireGrp;
        cell.userData.bulb = bulb;
      } else if (cmd.type === 'switch') {
        const sw = new THREE.Group();
        const swBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.8), MAT.plastic(0x37474f));
        swBody.position.y = 0.25;
        const lever = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), MAT.plastic(0xd03a3a));
        lever.position.set(0, 0.6, 0); lever.rotation.z = 0.5;
        sw.add(swBody, lever);
        sw.position.set(cmd.x!, 0, cmd.z!);
        sw.userData.h = 0.9;
        registerObj(cmd.id!, sw, { clickable: true });
        placard('Công tắc\nZn-Cu', cmd.x! + 0.15, cmd.z! + 1.25, 2.0);
      } else if (cmd.type === 'tray_sand') {
        const tray = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 3.2), MAT.plastic(0xd9c08a));
        tray.position.set(cmd.x!, 0.15, cmd.z!);
        scene.add(tray);
      } else if (cmd.type === 'crucible') {
        const cru = new THREE.Group();
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.4, 0.95, 20, 1, true), MAT.plastic(0xf0ece2));
        cup.material.side = THREE.DoubleSide;
        cup.position.y = 0.5;
        const cupBot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 20), MAT.plastic(0xf0ece2));
        cupBot.position.y = 0.06;
        cru.add(cup, cupBot);
        attachLiquid(cru, { r: 0.5, y0: 0.18, hMax: 0.6 });
        cru.position.set(cmd.x!, 0.32, cmd.z!);
        cru.userData.h = 1.1;

        registerObj(cmd.id!, cru, { clickable: true });
        addTarget(cmd.id!, cru, new THREE.Vector3(0, 1.05, 0));
        placard('Chén sứ', cmd.x! - 0.25, cmd.z! + 2.15, 1.5);
      } else if (cmd.type === 'rutherford_screen') {
        const R = 3.1, sh = 2.3;
        const gapA = THREE.MathUtils.degToRad(42);
        const start = Math.PI * 1.5 + gapA / 2, len = Math.PI * 2 - gapA;
        const scr = new THREE.Mesh(new THREE.CylinderGeometry(R, R, sh, 72, 1, true, start, len),
          new THREE.MeshPhysicalMaterial({ color: 0xb9f0cc, transparent: true, opacity: 0.15, roughness: 0.25, side: THREE.DoubleSide, depthWrite: false }));
        scr.position.set(cmd.x!, 2.0, cmd.z!); scr.renderOrder = 2;
        scene.add(scr);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x55606a, metalness: 0.5, roughness: 0.45, side: THREE.DoubleSide });
        for (const ry of [2.0 - sh / 2, 2.0 + sh / 2]) {
          const rim = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.04, R + 0.04, 0.09, 72, 1, true, start, len), rimMat);
          rim.position.set(cmd.x!, ry, cmd.z!);
          scene.add(rim);
        }
        for (const a of [90, 210, 330]) {
          const th = THREE.MathUtils.degToRad(a);
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8), rimMat);
          leg.position.set(cmd.x! + Math.sin(th) * R, 0.43, cmd.z! + Math.cos(th) * R);
          scene.add(leg);
        }
        placard('Màn huỳnh quang ZnS', cmd.x!, cmd.z! + 3.7, 2.3);
      } else if (cmd.type === 'rutherford_holder') {
        const holder = new THREE.Group();
        const hm = MAT.metal(0x6a727c);
        const hBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.16, 18), hm);
        hBase.position.y = 0.08;
        const hCol = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 10), hm);
        hCol.position.y = 0.7;
        const hTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 1.1), hm);
        hTop.position.y = 2.78;
        for (const hz of [-0.55, 0.55]) {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), hm);
          bar.position.set(0, 2.0, hz);
          holder.add(bar);
        }
        holder.add(hBase, hCol, hTop);
        holder.position.set(cmd.x!, 0, cmd.z!);
        registerObj(cmd.id!, holder, {});
        addTarget(cmd.id!, holder, new THREE.Vector3(0, 2.0, 0));
      } else if (cmd.type === 'rutherford_source') {
        const src = new THREE.Group();
        const ped = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 1.7), MAT.plastic(0x32465a));
        ped.position.y = 0.6;
        const lead = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), MAT.metal(0x4d565e));
        lead.position.y = 1.95; lead.castShadow = true;
        const colli = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1.0, 14), MAT.metal(0x7d8893));
        colli.rotation.z = Math.PI / 2;
        colli.position.set(1.1, 2.0, 0);
        const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.56, 0.56), MAT.plastic(0xc24a3a));
        hatch.position.set(1.66, 2.0, 0);
        const srcLbl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.65),
          new THREE.MeshBasicMaterial({ map: textTexture('☢ Nguồn α\n(radium)', { fs: 34, bd: '#d6a92a' }), transparent: true }));
        srcLbl.position.set(0, 1.95, 0.77);
        src.add(ped, lead, colli, hatch, srcLbl);
        src.position.set(cmd.x!, 0, cmd.z!);
        src.userData.h = 3.0;
        src.userData.hatch = hatch;

        registerObj(cmd.id!, src, { clickable: true });
        placard('Nguồn phóng xạ α — nhấp để mở khe', cmd.x!, cmd.z! + 1.6, 2.6);
      } else if (cmd.type === 'rutherford_scope') {
        const mic = new THREE.Group();
        const mBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 0.8), MAT.plastic(0x2b3a4e));
        mBase.position.y = 0.08;
        const mCol = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.5, 10), MAT.metal(0x8a929c));
        mCol.position.set(0.2, 0.9, 0); mCol.rotation.z = -0.25;
        const mTube = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.1, 14), MAT.metal(0x37474f));
        mTube.position.set(-0.15, 1.55, 0); mTube.rotation.z = 0.85;
        const mEye = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 12), MAT.metal(0xb8a44a));
        mEye.position.set(0.3, 1.95, 0); mEye.rotation.z = 0.85;
        mic.add(mBase, mCol, mTube, mEye);
        mic.position.set(cmd.x!, 0, cmd.z!);
        mic.rotation.y = 0.9;
        mic.userData.h = 2.3;

        registerObj(cmd.id!, mic, { clickable: true });
        placard('Kính hiển vi quan sát', cmd.x!, cmd.z! + 1.4, 2.2);

        // Counter Board inside cell
        const board = makeAlphaCounter(scene, 5.9, -1.6, -0.35);
        objMapRef.current['cell'] = { userData: { coat: board } } as any; // mock cell for counter board
      }
    });

    makeHighlightsForStep(currentStepRef.current);

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
      if (isBusyRef.current || currentStepRef.current > simDef.steps.length) return;
      const p = setPointer(e);
      const o = pickInteractive(p);
      if (!o) return;

      dragRef.current.obj = o;
      dragRef.current.moved = false;
      dragRef.current.downAt.set(e.clientX, e.clientY);

      // For move steps use a camera-facing plane so the wire can reach shelf objects
      const stepIdx = currentStepRef.current;
      const curStep = simDef.steps[stepIdx - 1];
      if ((curStep?.type === 'move' || curStep?.type === 'drop') && curStep.src === o.userData.id) {
        const wp = o.getWorldPosition(new THREE.Vector3());
        const normal = camera.position.clone().sub(wp).normalize();
        dragRef.current.plane.setFromNormalAndCoplanarPoint(normal, wp);
      } else {
        dragRef.current.plane.set(new THREE.Vector3(0, 1, 0), -1.7);
      }

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
      drag.lastNDC.copy(p);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(p, camera);
      const intersectPos = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(drag.plane, intersectPos)) {
        drag.obj.position.x = THREE.MathUtils.clamp(intersectPos.x, -11.0, 11.0);
        drag.obj.position.z = THREE.MathUtils.clamp(intersectPos.z, -6.0, 4.0);
        drag.obj.position.y = THREE.MathUtils.clamp(intersectPos.y, 0, 9.0);
      }
    };

    const handlePointerUp = () => {
      const drag = dragRef.current;
      const o = drag.obj;
      drag.obj = null;
      controls.enabled = true;

      if (!o) return;

      if (!drag.moved) {
        if (o.userData.clickable) {
          const stepIdx = currentStepRef.current;
          const curStepItem = simDef.steps[stepIdx - 1];
          if (
            curStepItem &&
            ['click', 'shake'].includes(curStepItem.type) &&
            (!curStepItem.id || curStepItem.id === o.userData.id)
          ) {
            executeStep(stepIdx);
          } else {
            playSound('err');
          }
        }
        return;
      }

      let best: TargetItem | null = null;
      let bestD = 2.2;

      for (const t of targetsRef.current) {
        if (t.id === o.userData.id) continue;
        const aw = targetAnchorWorld(t.id);
        const d = Math.hypot(aw.x - o.position.x, aw.z - o.position.z);
        if (d < bestD) { bestD = d; best = t; }
      }

      if (best) {
        const stepIdx = currentStepRef.current;
        const curStepItem = simDef.steps[stepIdx - 1];
        if (curStepItem && (curStepItem.type === 'pour' || curStepItem.type === 'move' || curStepItem.type === 'drop') && curStepItem.src === o.userData.id && curStepItem.dst === best.id) {
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

    const thumbnailTimer = setTimeout(() => {
      try {
        const dataUrl = renderer.domElement.toDataURL('image/webp', 0.75);
        if (dataUrl && dataUrl.length > 1000) {
          onThumbnail?.(simId, dataUrl);
        }
      } catch (_) {}
    }, 400);

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
      clearTimeout(thumbnailTimer);
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      canvasElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

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
  }, [simId]);

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
      <div style={{ display: 'none' }} id="sim-trigger" onClick={() => executeStep(currentStepRef.current)} />
    </div>
  );
}

const _UP = new THREE.Vector3(0, 1, 0);
function alphaBeam(ctxScene: THREE.Scene, counter: any) {
  const C = new THREE.Vector3(0, 2.0, 0.4);
  const R = 3.04;
  const muzzle = new THREE.Vector3(-3.8, 2.0, 0.4);
  const geo = new THREE.SphereGeometry(0.07, 8, 6);
  const matOf: Record<string, THREE.MeshBasicMaterial> = {
    straight: new THREE.MeshBasicMaterial({ color: 0xcdeaff }),
    small: new THREE.MeshBasicMaterial({ color: 0xffc24a }),
    big: new THREE.MeshBasicMaterial({ color: 0xff9030 }),
    back: new THREE.MeshBasicMaterial({ color: 0xff5a48 }),
  };
  const trailTex = glowTexture('rgba(255,190,110,1)', 'rgba(255,120,40,0)');
  const flashTex = glowTexture('rgba(190,255,200,1)', 'rgba(60,220,120,0)');
  const grp = new THREE.Group();
  ctxScene.add(grp);

  const parts: THREE.Mesh[] = [];
  const fading: THREE.Sprite[] = [];
  let acc = 0, stopped = false;

  const puff = (pos: THREE.Vector3, tex: THREE.Texture, size: number, life: number) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.position.copy(pos);
    s.scale.setScalar(size);
    s.userData = { life: 0, max: life, grow: size * 1.7 };
    grp.add(s); fading.push(s);
  };

  const spawn = (fate: string) => {
    const m = new THREE.Mesh(geo, matOf[fate]);
    m.position.set(muzzle.x, muzzle.y + (Math.random() - 0.5) * 0.5, muzzle.z + (Math.random() - 0.5) * 0.36);
    m.userData = { v: new THREE.Vector3(6.2, 0, 0), fate, crossed: false, tAcc: 0 };
    grp.add(m); parts.push(m);
  };

  const decideFate = () => {
    const r = Math.random();
    return r < 0.9 ? 'straight' : r < 0.975 ? 'small' : r < 0.996 ? 'big' : 'back';
  };

  const e = {
    spawn,
    stop() { stopped = true; },
    update(dt: number) {
      if (!stopped) {
        acc += dt * 9;
        while (acc > 1) { acc--; spawn(decideFate()); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const m = parts[i];
        const u = m.userData;
        m.position.addScaledVector(u.v, dt);

        if (!u.crossed && m.position.x >= C.x) {
          u.crossed = true;
          let d = 0;
          if (u.fate === 'small') d = THREE.MathUtils.degToRad(9 + Math.random() * 22);
          else if (u.fate === 'big') d = THREE.MathUtils.degToRad(40 + Math.random() * 32);
          else if (u.fate === 'back') d = THREE.MathUtils.degToRad(140 + Math.random() * 14);
          if (d) {
            if (Math.random() < 0.5) d = -d;
            u.v.applyAxisAngle(_UP, d);
            u.v.y = (Math.random() - 0.5) * 0.6;
            puff(m.position.clone(), trailTex, 0.34, 0.4);
          }
        }

        if (u.crossed && u.fate !== 'straight') {
          u.tAcc += dt;
          if (u.tAcc > 0.045) { u.tAcc = 0; puff(m.position.clone(), trailTex, 0.2, 0.4); }
        }

        const dx = m.position.x - C.x, dz = m.position.z - C.z;
        if (u.crossed && dx * dx + dz * dz >= R * R) {
          const dir = new THREE.Vector3(dx, 0, dz).normalize();
          const p = C.clone().addScaledVector(dir, R - 0.06);
          p.y = THREE.MathUtils.clamp(m.position.y, 1.1, 2.9);
          puff(p, flashTex, 0.55, 0.8);
          if (counter) counter.add(u.fate === 'straight' ? 'straight' : (u.fate === 'back' ? 'back' : 'lech'));
          grp.remove(m); parts.splice(i, 1);
          continue;
        }
        if (m.position.x < muzzle.x - 0.4) { grp.remove(m); parts.splice(i, 1); }
      }
      for (let i = fading.length - 1; i >= 0; i--) {
        const s = fading[i];
        s.userData.life += dt;
        const k = s.userData.life / s.userData.max;
        s.scale.setScalar(s.scale.x + s.userData.grow * dt);
        s.material.opacity = Math.max(0, 1 - k);
        if (k >= 1) { s.material.dispose(); grp.remove(s); fading.splice(i, 1); }
      }
      if (stopped && parts.length === 0 && fading.length === 0) {
        if (grp.parent) grp.parent.remove(grp);
        return false;
      }
      return true;
    }
  };
  return e;
}

function buildAtomModel() {
  const g = new THREE.Group();
  g.name = 'atom-model-mesh';
  const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.55, 28, 20),
    new THREE.MeshPhysicalMaterial({ color: 0x86c2ff, transparent: true, opacity: 0.13, roughness: 0.25, depthWrite: false }));
  cloud.renderOrder = 2;
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xff5a40, emissive: 0xff2200, emissiveIntensity: 1.3 }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(255,140,90,.95)', 'rgba(255,80,30,0)'), transparent: true, depthWrite: false }));
  glow.scale.setScalar(0.85);
  g.add(cloud, nuc, glow);

  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0.3 });
  const eMat = new THREE.MeshStandardMaterial({ color: 0x46b4ff, emissive: 0x1060c0, emissiveIntensity: 0.9 });
  const electrons: { el: THREE.Mesh; phase: number }[] = [];
  [[1.25, 0.35, 0], [0.65, -0.5, 2.1]].forEach(([rx, rz, phase]) => {
    const h = new THREE.Group();
    h.rotation.set(rx, 0, rz);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.015, 6, 48), orbitMat);
    const el = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), eMat);
    h.add(ring, el);
    g.add(h);
    electrons.push({ el, phase });
  });

  const mkPath = (curve: THREE.Curve<THREE.Vector3>, color: number) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.022, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }));
    g.add(m);
    return curve;
  };
  const curves: THREE.Curve<THREE.Vector3>[] = [];
  for (const [y0, z0] of [[0.6, 0.3], [-0.55, -0.25], [1.0, -0.4]]) {
    curves.push(mkPath(new THREE.LineCurve3(
      new THREE.Vector3(-2.6, y0, z0), new THREE.Vector3(2.6, y0, z0)), 0x9fe0ff));
  }
  curves.push(mkPath(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.6, 0.3, 0), new THREE.Vector3(-0.1, 0.12, 0), new THREE.Vector3(2.3, 1.7, 0)), 0xffb040));
  curves.push(mkPath(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.6, -0.12, 0), new THREE.Vector3(0.35, -0.06, 0), new THREE.Vector3(-2.6, -1.0, 0)), 0xff5a48));

  const dots = curves.map((curve, i) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshBasicMaterial({ color: i < 3 ? 0xdff2ff : (i === 3 ? 0xffd080 : 0xff8070) }));
    g.add(d);
    return { m: d, curve, off: i * 0.23 };
  });

  const lbl1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.48),
    new THREE.MeshBasicMaterial({ map: textTexture('Hạt nhân (+)', { fs: 42, bd: '#e06a4a' }), transparent: true }));
  lbl1.position.set(1.45, -0.75, 0.45);
  const lbl2 = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.55),
    new THREE.MeshBasicMaterial({ map: textTexture('Electron (–)', { fs: 42, bd: '#5aa0e0' }), transparent: true }));
  lbl2.position.set(-1.45, 1.5, 0.45);
  g.add(lbl1, lbl2);

  // Animate atom internally
  let t = 0;
  const loopFunc = (dt: number) => {
    if (!g.parent) return false;
    t += dt;
    electrons.forEach((o, i) => {
      const a = t * (1.6 + i * 0.5) + o.phase;
      o.el.position.set(Math.cos(a) * 1.28, Math.sin(a) * 1.28, 0);
    });
    glow.scale.setScalar(0.8 + Math.sin(t * 6) * 0.08);
    dots.forEach(d => d.m.position.copy(d.curve.getPoint((t * 0.22 + d.off) % 1)));
    return true;
  };
  g.userData.loop = loopFunc;

  return g;
}

function makeStrip(color: number, w = 0.34, h = 2.5) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.07), MAT.metal(color));
  m.position.y = h / 2;
  const g = new THREE.Group();
  g.add(m);
  return g;
}
