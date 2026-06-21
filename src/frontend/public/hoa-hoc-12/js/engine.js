/* global THREE, Effects, EXPERIMENTS, buildRoom */
/* ============================================================
   ENGINE — lõi mô phỏng: tween, vật thể, kéo thả, các bước
   ============================================================ */

const App = {
  scene: null, camera: null, renderer: null, controls: null,
  tweens: [], emitters: [], updatables: [],
  ctx: null, exp: null, stepIndex: 0, busy: false, finished: false,
  menuMode: true, menuAngle: 0, runId: 0,
  raycaster: new THREE.Raycaster(), pointer: new THREE.Vector2(),
  hl: [],
};

/* ---------------- Tween ---------------- */
const Ease = {
  linear: t => t,
  quadIn: t => t * t,
  quadOut: t => t * (2 - t),
  quadInOut: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  backOut: t => { const s = 1.35; t -= 1; return t * t * ((s + 1) * t + s) + 1; },
};

function tween(target, to, dur, opts = {}) {
  const tw = {
    target, to, from: {}, dur: Math.max(dur, .0001), t: 0,
    delay: opts.delay || 0, started: false,
    ease: Ease[opts.ease || 'quadInOut'],
    onDone: opts.onDone, onUpdate: opts.onUpdate,
  };
  App.tweens.push(tw);
  return tw;
}
function tweenP(target, to, dur, opts = {}) {
  return new Promise(res => {
    const prev = opts.onDone;
    tween(target, to, dur, { ...opts, onDone: () => { if (prev) prev(); res(); } });
  });
}
const wait = s => new Promise(r => setTimeout(r, s * 1000));

function updateTweens(dt) {
  for (let i = App.tweens.length - 1; i >= 0; i--) {
    const tw = App.tweens[i];
    if (tw.delay > 0) { tw.delay -= dt; continue; }
    if (!tw.started) { tw.started = true; for (const k in tw.to) tw.from[k] = tw.target[k]; }
    tw.t += dt;
    const p = Math.min(tw.t / tw.dur, 1), e = tw.ease(p);
    for (const k in tw.to) tw.target[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
    if (tw.onUpdate) tw.onUpdate(e);
    if (p >= 1) { App.tweens.splice(i, 1); if (tw.onDone) tw.onDone(); }
  }
}

/* ---------------- Âm thanh ---------------- */
const Snd = {
  ac: null,
  init() {
    if (!this.ac) { try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (this.ac && this.ac.state === 'suspended') this.ac.resume();
  },
  tone(f, t0, dur, vol = .12, type = 'sine') {
    if (!this.ac) return;
    try {
      const o = this.ac.createOscillator(), g = this.ac.createGain();
      o.type = type; o.frequency.value = f;
      const t = this.ac.currentTime + t0;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + .02);
      g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g); g.connect(this.ac.destination);
      o.start(t); o.stop(t + dur + .05);
    } catch (e) {}
  },
  step() { this.tone(660, 0, .12); this.tone(880, .1, .2); },
  err()  { this.tone(196, 0, .22, .08, 'square'); },
  pour() { this.tone(420, 0, .3, .05, 'triangle'); },
  win()  { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * .13, .32, .13)); },
};

/* ---------------- Texture canvas ---------------- */
function glowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grd.addColorStop(0, inner); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function textTexture(text, opts = {}) {
  const c = document.createElement('canvas');
  c.width = opts.w || 256; c.height = opts.h || 128;
  const g = c.getContext('2d');
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

/* ---------------- Vật liệu ---------------- */
const MAT = {
  glass(tint = 0xdcf0fa, op = .2) {
    return new THREE.MeshPhysicalMaterial({
      color: tint, transparent: true, opacity: op, roughness: .06,
      metalness: 0, side: THREE.DoubleSide, depthWrite: false,
    });
  },
  metal(color = 0x9aa3ad) {
    return new THREE.MeshStandardMaterial({ color, metalness: .55, roughness: .4 });
  },
  silver() {
    return new THREE.MeshPhongMaterial({ color: 0xd9dde6, shininess: 130, specular: 0xffffff, emissive: 0x3a3f4a });
  },
  copper() {
    return new THREE.MeshPhongMaterial({ color: 0xc26a3a, shininess: 90, specular: 0xffd0a0, emissive: 0x36180a });
  },
  plastic(color) {
    return new THREE.MeshStandardMaterial({ color, metalness: .08, roughness: .55 });
  },
};

/* ---------------- Chất lỏng trong bình chứa ---------------- */
function attachLiquid(group, { r, y0, hMax }) {
  const geo = new THREE.CylinderGeometry(r, r * .86, 1, 24);
  const mat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: .85, shininess: 95 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false; mesh.renderOrder = 1; group.add(mesh);
  const pileMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 });
  const pile = new THREE.Mesh(new THREE.SphereGeometry(r * .92, 16, 12), pileMat);
  pile.scale.set(1, .3, 1); pile.position.y = y0 + .04; pile.visible = false; pile.renderOrder = 1;
  group.add(pile);
  const liq = { mesh, mat, pile, pileMat, r, y0, hMax, level: 0 };
  group.userData.liq = liq;
  return liq;
}
function setLevel(liq, level) {
  liq.level = level;
  const h = Math.max(.001, level * liq.hMax);
  liq.mesh.visible = level > .015;
  liq.mesh.scale.set(1, h, 1);
  liq.mesh.position.y = liq.y0 + h / 2;
}
function pourInto(liq, { level, color, opacity, dur = 1.1 }) {
  const c0 = liq.mat.color.clone();
  const c1 = (color != null) ? new THREE.Color(color) : c0.clone();
  const l0 = liq.level, l1 = (level != null) ? level : liq.level;
  const o0 = liq.mat.opacity, o1 = (opacity != null) ? opacity : o0;
  const pr = { t: 0 };
  return tweenP(pr, { t: 1 }, dur, {
    onUpdate: e => {
      liq.mat.color.copy(c0).lerp(c1, e);
      liq.mat.opacity = o0 + (o1 - o0) * e;
      setLevel(liq, l0 + (l1 - l0) * e);
    },
  });
}

/* ---------------- Dụng cụ thủy tinh ---------------- */
function createTube() {
  const g = new THREE.Group();
  const glassMat = MAT.glass();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 3.0, 24, 1, true), glassMat);
  wall.position.y = 1.92; wall.renderOrder = 3;
  const bot = new THREE.Mesh(new THREE.SphereGeometry(.42, 24, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), glassMat);
  bot.position.y = .42; bot.renderOrder = 3;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.43, .035, 10, 24), glassMat.clone());
  rim.rotation.x = Math.PI / 2; rim.position.y = 3.42; rim.renderOrder = 3;
  g.add(wall, bot, rim);
  attachLiquid(g, { r: .345, y0: .14, hMax: 2.85 });
  // lớp "tráng gương" ẩn sẵn
  const mir = new THREE.Mesh(new THREE.CylinderGeometry(.39, .39, 2.4, 20),
    new THREE.MeshPhongMaterial({ color: 0xdde2ea, shininess: 140, specular: 0xffffff, emissive: 0x3c424e, transparent: true, opacity: 0 }));
  mir.position.y = 1.45; mir.visible = false; mir.renderOrder = 2;
  g.add(mir);
  g.userData.mirror = mir;
  g.userData.glassMat = glassMat;
  g.userData.h = 3.45;
  return g;
}

function createBottle(label, color, opts = {}) {
  const g = new THREE.Group();
  const liqMat = new THREE.MeshPhongMaterial({
    color, transparent: true, opacity: opts.op != null ? opts.op : .82, shininess: 80,
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 1.45, 20), liqMat);
  body.position.y = .76; body.castShadow = true;
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(.2, .5, .4, 20), liqMat);
  shoulder.position.y = 1.68;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .42, 16), MAT.glass(0xeaf6ff, .35));
  neck.position.y = 2.07; neck.renderOrder = 3;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.23, .23, .3, 16), MAT.plastic(opts.cap || 0x37577a));
  cap.position.y = 2.34; cap.castShadow = true;
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(.95, .5),
    new THREE.MeshBasicMaterial({ map: textTexture(label, { fs: opts.fs || 40 }), transparent: true })
  );
  lbl.position.set(0, .82, .505);
  g.add(body, shoulder, neck, cap, lbl);
  g.userData.dropColor = opts.dropColor != null ? opts.dropColor : color;
  g.userData.powder = !!opts.powder;
  g.userData.h = 2.5;
  return g;
}

function createBeaker(opts = {}) {
  const r = opts.r || 1.05, h = opts.h || 2.1;
  const g = new THREE.Group();
  const glassMat = MAT.glass();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r * .94, h, 28, 1, true), glassMat);
  wall.position.y = h / 2; wall.renderOrder = 3;
  const botGeo = new THREE.CylinderGeometry(r * .94, r * .94, .07, 28);
  const bot = new THREE.Mesh(botGeo, glassMat);
  bot.position.y = .035; bot.renderOrder = 3;
  g.add(wall, bot);
  attachLiquid(g, { r: r * .88, y0: .1, hMax: h * .82 });
  g.userData.h = h;
  return g;
}

function createBasin() {
  const g = new THREE.Group();
  const glassMat = MAT.glass(0xd8f2ff, .25);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.9, 1.15, 36, 1, true), glassMat);
  wall.position.y = .58; wall.renderOrder = 3;
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, .08, 36), glassMat);
  bot.position.y = .04; bot.renderOrder = 3;
  g.add(wall, bot);
  attachLiquid(g, { r: 2.05, y0: .1, hMax: .9 });
  g.userData.h = 1.15;
  return g;
}

function createFlame(scale = 1) {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(
    new THREE.ConeGeometry(.2 * scale, .72 * scale, 12),
    new THREE.MeshBasicMaterial({ color: 0xff9a30, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  outer.position.y = .36 * scale;
  const inner = new THREE.Mesh(
    new THREE.ConeGeometry(.09 * scale, .34 * scale, 10),
    new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  inner.position.y = .18 * scale;
  const light = new THREE.PointLight(0xffa040, 1.1, 7);
  light.position.y = .5;
  g.add(outer, inner, light);
  g.visible = false;
  // nhấp nháy
  let t = Math.random() * 10;
  App.updatables.push(dt => {
    if (!g.parent) return false;
    if (g.visible) {
      t += dt;
      const f = 1 + Math.sin(t * 14) * .12 + Math.sin(t * 23) * .07;
      outer.scale.set(f, f * (1 + Math.sin(t * 9) * .1), f);
      light.intensity = .9 + Math.sin(t * 17) * .25;
    }
    return true;
  });
  return g;
}

function createLamp() {
  // đèn cồn
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(.55, 20, 14),
    new THREE.MeshPhongMaterial({ color: 0xbfe3ee, transparent: true, opacity: .45, shininess: 90 }));
  body.position.y = .5; body.scale.y = .82;
  const fuel = new THREE.Mesh(new THREE.SphereGeometry(.46, 16, 12),
    new THREE.MeshPhongMaterial({ color: 0xa9c8e8, transparent: true, opacity: .6 }));
  fuel.position.y = .42; fuel.scale.y = .6;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .2, 14), MAT.metal(0xb8a44a));
  collar.position.y = .95;
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .24, 8), MAT.plastic(0xf5f0e0));
  wick.position.y = 1.1;
  g.add(body, fuel, collar, wick);
  const flame = createFlame(1);
  flame.position.y = 1.2;
  g.add(flame);
  g.userData.flame = flame;
  g.userData.h = 1.3;
  return g;
}

function createDish() {
  const d = new THREE.Mesh(new THREE.CylinderGeometry(.62, .52, .14, 24), MAT.plastic(0xf2f4f6));
  d.position.y = .07; d.castShadow = true;
  return d;
}

/* ============================================================
   NGỮ CẢNH THÍ NGHIỆM (ctx)
   ============================================================ */
function makeCtx() {
  const group = new THREE.Group();
  App.scene.add(group);
  const ctx = {
    group, obj: {}, targets: [], interactives: [],
    shelfX: -7.4, rack: null, rackSlots: [], tubeCount: 0,

    add(o) { group.add(o); return o; },

    register(id, o, opts = {}) {
      o.userData.id = id;
      o.userData.draggable = !!opts.draggable;
      o.userData.clickable = !!opts.clickable;
      ctx.obj[id] = o;
      if (opts.draggable || opts.clickable) ctx.interactives.push(o);
      if (!o.parent) group.add(o);
      o.userData.home = { x: o.position.x, y: o.position.y, z: o.position.z, rz: o.rotation.z };
      return o;
    },

    addTarget(id, obj, offset, ringY) {
      ctx.targets.push({ id, obj, offset: offset.clone(), ringY });
    },

    addBottle(id, label, color, opts = {}) {
      const b = createBottle(label, color, opts);
      b.position.set(opts.x != null ? opts.x : ctx.shelfX, 4.05, -3.0);
      if (opts.x == null) ctx.shelfX += 1.95;
      b.castShadow = true;
      ctx.register(id, b, { draggable: true });
      return b;
    },

    addRack(x = -1.6, z = .5, n = 3) {
      const g = new THREE.Group();
      const wood = MAT.plastic(0x8a5a30);
      const base = new THREE.Mesh(new THREE.BoxGeometry(.95 * n + .6, .22, 1.25), wood);
      base.position.y = .11; base.castShadow = true; base.receiveShadow = true;
      const back = new THREE.Mesh(new THREE.BoxGeometry(.95 * n + .6, 1.5, .14), wood);
      back.position.set(0, .97, -.55);
      const top = new THREE.Mesh(new THREE.BoxGeometry(.95 * n + .6, .12, .9), wood);
      top.position.set(0, 1.7, -.12);
      g.add(base, back, top);
      // lỗ giữ ống trên thanh ngang
      for (let i = 0; i < n; i++) {
        const hx = -(n - 1) * .475 + i * .95;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.5, .055, 8, 18), wood);
        ring.rotation.x = Math.PI / 2; ring.position.set(hx, 1.7, -.12);
        g.add(ring);
        ctx.rackSlots.push({ x: x + hx, z: z - .12 });
      }
      g.position.set(x, 0, z);
      group.add(g);
      ctx.rack = g;
      return g;
    },

    addTube(id, opts = {}) {
      if (!ctx.rack) ctx.addRack();
      const slot = ctx.rackSlots[ctx.tubeCount % ctx.rackSlots.length];
      ctx.tubeCount++;
      const t = createTube();
      t.position.set(slot.x, .22, slot.z);
      ctx.register(id, t, { draggable: true, clickable: true });
      ctx.addTarget(id, t, new THREE.Vector3(0, 3.5, 0));
      if (opts.label) ctx.placard(opts.label, slot.x, slot.z + 1.15, .9);
      return t;
    },

    addBeaker(id, x, z, opts = {}) {
      const b = createBeaker(opts);
      b.position.set(x, 0, z);
      ctx.register(id, b, { clickable: !!opts.clickable });
      ctx.addTarget(id, b, new THREE.Vector3(0, (opts.h || 2.1) + .05, 0));
      return b;
    },

    addBasin(id, x = 0, z = .6) {
      const b = createBasin();
      b.position.set(x, 0, z);
      ctx.register(id, b, {});
      ctx.addTarget(id, b, new THREE.Vector3(0, 1.25, 0));
      const liq = b.userData.liq;
      liq.mat.color.set(0xb9e0f0); liq.mat.opacity = .5; setLevel(liq, .62);
      return b;
    },

    addLampStand(x = 4.5, z = -.4) {
      const g = new THREE.Group();
      const metal = MAT.metal(0x6a727c);
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, .18, 1.6), metal);
      base.position.set(.9, .09, 0); base.castShadow = true;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 5.2, 10), metal);
      rod.position.set(1.7, 2.6, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.9, 8), metal);
      arm.rotation.z = Math.PI / 2; arm.position.set(.85, 3.25, 0);
      const clamp = new THREE.Mesh(new THREE.TorusGeometry(.48, .06, 8, 20), metal);
      clamp.rotation.x = Math.PI / 2; clamp.position.set(0, 3.25, 0);
      g.add(base, rod, arm, clamp);
      g.position.set(x, 0, z);
      group.add(g);
      ctx.register('standGroup', g, {});
      ctx.addTarget('stand', g, new THREE.Vector3(0, 1.85, 0));
      const lamp = createLamp();
      lamp.position.set(x, 0, z);
      ctx.register('lamp', lamp, { clickable: true });
      ctx.placard('Đèn cồn + giá đỡ', x + .2, z + 1.6, 1.6);
      return g;
    },

    addLamp(id, x, z) {
      const lamp = createLamp();
      lamp.position.set(x, 0, z);
      ctx.register(id, lamp, { clickable: true });
      return lamp;
    },

    addBath(x = 4.6, z = .3) {
      const b = createBeaker({ r: 1.15, h: 2.3 });
      b.position.set(x, 0, z);
      ctx.register('bath', b, {});
      ctx.addTarget('bath', b, new THREE.Vector3(0, 1.4, 0));
      const liq = b.userData.liq;
      liq.mat.color.set(0xd2ecf5); liq.mat.opacity = .5; setLevel(liq, .62);
      Effects.steam(b, new THREE.Vector3(0, 2.3, 0), { rate: 2.2, size: .5, dur: 1e9 });
      ctx.placard('Cốc nước nóng 70°C', x, z + 1.7, 1.8);
      return b;
    },

    addDishItem(id, mesh, x, z, label) {
      const g = new THREE.Group();
      g.add(createDish());
      mesh.position.y += .14;
      g.add(mesh);
      g.position.set(x, 0, z);
      ctx.register(id, g, { draggable: true });
      if (label) ctx.placard(label, x, z + 1.0, 1.5);
      g.userData.itemMesh = mesh;
      g.userData.h = 1;
      return g;
    },

    placard(text, x, z, w = 1.4) {
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(w, w * .3),
        new THREE.MeshBasicMaterial({ map: textTexture(text, { fs: 34, h: 78, w: 256, bd: '#88a7c5' }), transparent: true })
      );
      p.position.set(x, .16, z);
      p.rotation.x = -Math.PI / 2 + .5;
      group.add(p);
      return p;
    },

    setFlame(id, on) {
      const o = ctx.obj[id];
      if (o && o.userData.flame) o.userData.flame.visible = on;
    },
  };
  return ctx;
}

function targetAnchorWorld(id) {
  const t = App.ctx.targets.find(t => t.id === id);
  if (!t) return new THREE.Vector3();
  const v = new THREE.Vector3();
  t.obj.getWorldPosition(v);
  return v.add(t.offset);
}

/* ============================================================
   MÁY TRẠNG THÁI CÁC BƯỚC
   ============================================================ */
const UI = {};
function cacheUI() {
  ['menu', 'grid', 'lab', 'exp-title', 'progress', 'steps', 'eqcard', 'eqs',
   'hint', 'hint-icon', 'hint-text', 'toast', 'modal-wrap', 'modal', 'flash']
    .forEach(id => UI[id.replace(/-/g, '_')] = document.getElementById(id));
}

const STEP_ICONS = { pour: '💧', drop: '👇', move: '✋', click: '👆', shake: '🌀', stir: '🥄', wait: '⏳' };

function curStep() { return App.exp ? App.exp.steps[App.stepIndex] : null; }

function loadExperiment(exp) {
  App.exp = exp; App.stepIndex = 0; App.busy = false; App.finished = false; App.menuMode = false;
  App.runId++;
  clearDynamic();
  buildRoom();
  App.ctx = makeCtx();
  exp.setup(App.ctx);
  UI.menu.classList.add('hidden');
  UI.lab.classList.remove('hidden');
  UI.exp_title.textContent = exp.icon + ' ' + exp.title;
  UI.eqcard.classList.add('hidden');
  UI.eqs.innerHTML = '';
  buildStepPanel();
  resetCamera();
  showIntro(exp);
}

function clearDynamic() {
  App.tweens.length = 0;
  App.emitters.length = 0;
  App.updatables.length = 0;
  clearHighlights();
  const sc = App.scene;
  while (sc.children.length) {
    const o = sc.children[0];
    sc.remove(o);
    o.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      if (n.material) {
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      }
    });
  }
}

function buildStepPanel() {
  UI.steps.innerHTML = '';
  App.exp.steps.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="num">${i + 1}</span><span>${STEP_ICONS[s.action.type] || '🔹'} ${s.text}</span>`;
    UI.steps.appendChild(li);
  });
}

function setStep(i) {
  App.stepIndex = i;
  const step = App.exp.steps[i];
  [...UI.steps.children].forEach((li, k) => {
    li.classList.toggle('current', k === i);
    li.classList.toggle('done', k < i);
  });
  UI.progress.textContent = `Bước ${i + 1}/${App.exp.steps.length}`;
  UI.hint_icon.textContent = STEP_ICONS[step.action.type] || '👉';
  UI.hint_text.textContent = step.text;
  const cur = UI.steps.children[i];
  if (cur) cur.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  makeHighlights(step);
  if (step.action.type === 'wait') runWait(step);
}

async function runWait(step) {
  App.busy = true;
  const run = App.runId;
  try {
    if (step.fx) await step.fx(App.ctx);
    if (step.action.dur) await wait(step.action.dur);
  } finally { App.busy = false; }
  if (run === App.runId) completeStep();
}

function completeStep() {
  if (!App.exp || App.menuMode) return;
  const step = curStep();
  if (!step) return;
  Snd.step();
  if (step.eq) showEq(step.eq);
  clearHighlights();
  const next = App.stepIndex + 1;
  if (next >= App.exp.steps.length) {
    [...UI.steps.children].forEach(li => { li.classList.remove('current'); li.classList.add('done'); });
    UI.progress.textContent = 'Hoàn thành ✔';
    finishExperiment();
  } else {
    setStep(next);
  }
}

function showEq(eq) {
  UI.eqcard.classList.remove('hidden');
  const eqs = Array.isArray(eq) ? eq : [eq];
  eqs.forEach(e => {
    const d = document.createElement('div');
    d.className = 'eq';
    d.textContent = e;
    UI.eqs.appendChild(d);
  });
}

function finishExperiment() {
  App.finished = true;
  setTimeout(() => {
    Snd.win();
    const d = App.exp.done || {};
    let html = `<div class="m-icon">🎉</div><h2>Thí nghiệm thành công!</h2>`;
    if (d.pheno) html += `<div class="m-section m-pheno"><b>👀 Hiện tượng:</b> ${d.pheno}</div>`;
    (d.eqs || []).forEach(e => html += `<div class="m-section m-eq">${e}</div>`);
    if (d.note) html += `<div class="m-section m-note">💡 ${d.note}</div>`;
    html += `<div class="m-btns">
      <button class="btn-ghost" onclick="backToMenu()">📚 Danh sách</button>
      <button class="btn-primary" onclick="reloadExp()">↺ Làm lại</button>
    </div>`;
    showModal(html);
  }, 900);
}

function showIntro(exp) {
  let tools = '';
  (exp.tools || []).forEach(t => tools += `<li>${t}</li>`);
  showModal(`
    <div class="m-icon">${exp.icon}</div>
    <h2>${exp.title}</h2>
    <div class="m-section m-desc">${exp.desc}</div>
    <div class="m-section m-desc"><b>🧰 Dụng cụ & hóa chất:</b><ul class="tools">${tools}</ul></div>
    <div class="m-btns"><button class="btn-primary" onclick="startExp()">🚀 Bắt đầu thí nghiệm</button></div>
  `);
}

function startExp() { hideModal(); setStep(0); }
function reloadExp() { hideModal(); loadExperiment(App.exp); }
function backToMenu() {
  hideModal();
  UI.lab.classList.add('hidden');
  UI.menu.classList.remove('hidden');
  App.menuMode = true;
  App.exp = null;
}

function showModal(html) { UI.modal.innerHTML = html; UI.modal_wrap.classList.remove('hidden'); }
function hideModal() { UI.modal_wrap.classList.add('hidden'); }

let toastTimer = null;
function showToast(msg, ok = false) {
  UI.toast.textContent = msg;
  UI.toast.className = ok ? 'ok' : '';
  UI.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => UI.toast.classList.add('hidden'), 2200);
}

const WRONG_MSGS = [
  '⚠️ Chưa đúng bước! Hãy làm theo hướng dẫn bên dưới nhé.',
  '🧐 Khoan đã! Xem lại bước hiện tại trong bảng các bước.',
  '❌ Thao tác chưa đúng thứ tự. Thử lại nào!',
];
function wrongAction() {
  Snd.err();
  showToast(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]);
}

/* ---------------- Gợi ý trực quan (mũi tên + vòng sáng) ---------------- */
function clearHighlights() {
  App.hl.forEach(o => { if (o.parent) o.parent.remove(o); });
  App.hl.length = 0;
}

function makeHighlights(step) {
  clearHighlights();
  const a = step.action;
  const ctx = App.ctx;
  const srcId = a.src || a.id;
  if (srcId && ctx.obj[srcId]) {
    const o = ctx.obj[srcId];
    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(.26, .62, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd84a })
    );
    arrow.rotation.x = Math.PI;
    const wp = o.getWorldPosition(new THREE.Vector3());
    const baseY = wp.y + (o.userData.h || 2.5) + .75;
    arrow.position.set(wp.x, baseY, wp.z);
    App.scene.add(arrow);
    App.hl.push(arrow);
    let t = 0;
    App.updatables.push(dt => {
      if (!arrow.parent) return false;
      t += dt;
      const w2 = o.getWorldPosition(new THREE.Vector3());
      arrow.position.set(w2.x, w2.y + (o.userData.h || 2.5) + .75 + Math.sin(t * 4) * .17, w2.z);
      arrow.rotation.y += dt * 2;
      return true;
    });
  }
  if (a.dst) {
    const aw = targetAnchorWorld(a.dst);
    const tdef = ctx.targets.find(t => t.id === a.dst);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(.85, .055, 8, 36),
      new THREE.MeshBasicMaterial({ color: 0x5ee1a0, transparent: true, opacity: .9 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(aw.x, (tdef && tdef.ringY != null) ? tdef.ringY : aw.y + .12, aw.z);
    App.scene.add(ring);
    App.hl.push(ring);
    let t = 0;
    App.updatables.push(dt => {
      if (!ring.parent) return false;
      t += dt;
      const s = 1 + Math.sin(t * 5) * .12;
      ring.scale.set(s, s, s);
      ring.material.opacity = .65 + Math.sin(t * 5) * .3;
      return true;
    });
  }
}

/* ============================================================
   HÀNH ĐỘNG (đổ, thả, di chuyển, nhấp, lắc, khuấy)
   ============================================================ */
async function doPour(step) {
  App.busy = true;
  const run = App.runId;
  const ctx = App.ctx;
  const src = ctx.obj[step.action.src];
  const dst = ctx.obj[step.action.dst];
  try {
    const aw = targetAnchorWorld(step.action.dst);
    Snd.pour();
    await tweenP(src.position, { x: aw.x + 2.35, y: aw.y + 1.62, z: aw.z }, .42);
    await tweenP(src.rotation, { z: 1.78 }, .3);
    const liq = dst.userData.liq;
    let toY = aw.y - .9;
    if (liq) {
      const wp = dst.getWorldPosition(new THREE.Vector3());
      toY = wp.y + liq.y0 + liq.level * liq.hMax + .05;
    }
    Effects.stream(
      () => new THREE.Vector3(aw.x + (Math.random() - .5) * .1, aw.y + 1.12, aw.z + (Math.random() - .5) * .1),
      toY,
      { color: src.userData.dropColor, powder: src.userData.powder, dur: 1.15 }
    );
    if (liq && step.pour) await pourInto(liq, { ...step.pour, dur: 1.15 });
    else await wait(1.15);
    await tweenP(src.rotation, { z: 0 }, .28);
    const h = src.userData.home;
    await tweenP(src.position, { x: h.x, y: h.y, z: h.z }, .5);
    if (step.fx) await step.fx(ctx);
  } finally { App.busy = false; }
  if (run === App.runId) completeStep();
}

async function doDrop(step) {
  App.busy = true;
  const run = App.runId;
  const ctx = App.ctx;
  const src = ctx.obj[step.action.src];
  const dst = ctx.obj[step.action.dst];
  try {
    const aw = targetAnchorWorld(step.action.dst);
    await tweenP(src.position, { x: aw.x, y: aw.y + 1.5, z: aw.z }, .45);
    await tweenP(src.position, { y: aw.y + .15 }, .26, { ease: 'quadIn' });
    const d = step.drop || {};
    const item = src.userData.itemMesh || src;
    if (d.attach !== false) {
      // chỉ thả vật phẩm vào bình, bỏ lại đĩa
      if (src.userData.itemMesh) {
        const dish = src;
        if (item.parent) item.parent.remove(item);
        dst.add(item);
        tween(dish.position, { x: dish.userData.home.x, y: dish.userData.home.y, z: dish.userData.home.z }, .5);
      } else {
        dst.add(src);
      }
      const lp = d.local || { x: 0, y: .4, z: 0 };
      item.position.set(lp.x, lp.y, lp.z);
      item.rotation.set(0, 0, d.rotZ || 0);
      if (d.scale) item.scale.setScalar(d.scale);
    }
    if (step.fx) await step.fx(ctx, item);
  } finally { App.busy = false; }
  if (run === App.runId) completeStep();
}

async function doMove(step) {
  App.busy = true;
  const run = App.runId;
  const ctx = App.ctx;
  const src = ctx.obj[step.action.src];
  try {
    const aw = targetAnchorWorld(step.action.dst);
    const m = step.move || {};
    const tx = aw.x + (m.dx || 0), ty = (m.y != null ? m.y : aw.y), tz = aw.z + (m.dz || 0);
    await tweenP(src.position, { x: tx, y: ty + 1.2, z: tz }, .5);
    await tweenP(src.position, { y: ty }, .35, { ease: 'quadIn' });
    if (m.rotZ != null) await tweenP(src.rotation, { z: m.rotZ }, .25);
    src.userData.home = { x: tx, y: ty, z: tz, rz: m.rotZ || 0 };
    if (step.fx) await step.fx(ctx);
  } finally { App.busy = false; }
  if (run === App.runId) completeStep();
}

async function doClick(step) {
  App.busy = true;
  const run = App.runId;
  const ctx = App.ctx;
  try {
    const o = ctx.obj[step.action.id];
    if (o && o.userData.flame) ctx.setFlame(step.action.id, true);
    if (step.fx) await step.fx(ctx);
  } finally { App.busy = false; }
  if (run === App.runId) completeStep();
}

async function doShake(step) {
  App.busy = true;
  const run = App.runId;
  const ctx = App.ctx;
  try {
    const o = ctx.obj[step.action.id];
    const rz = o.userData.home.rz || 0;
    for (const a of [.28, -.28, .2, -.2, .12, -.12, 0]) {
      await tweenP(o.rotation, { z: rz + a }, .085);
    }
    if (step.fx) await step.fx(ctx);
  } finally { App.busy = false; }
  if (run === App.runId) completeStep();
}

async function doStir(step) {
  App.busy = true;
  const run = App.runId;
  const ctx = App.ctx;
  const rod = ctx.obj[step.action.src];
  try {
    const aw = targetAnchorWorld(step.action.dst);
    await tweenP(rod.position, { x: aw.x + .35, y: aw.y - .4, z: aw.z }, .4);
    await tweenP(rod.rotation, { z: .35 }, .2);
    const pr = { t: 0 };
    await tweenP(pr, { t: 1 }, 2.4, {
      ease: 'linear',
      onUpdate: e => {
        rod.position.x = aw.x + Math.cos(e * Math.PI * 6) * .35;
        rod.position.z = aw.z + Math.sin(e * Math.PI * 6) * .35;
      },
    });
    await tweenP(rod.rotation, { z: 0 }, .2);
    const h = rod.userData.home;
    await tweenP(rod.position, { x: h.x, y: h.y, z: h.z }, .5);
    if (step.fx) await step.fx(ctx);
  } finally { App.busy = false; }
  if (run === App.runId) completeStep();
}

/* ---------------- Phân phối thao tác của người dùng ---------------- */
function tryClick(id) {
  const step = curStep();
  if (!step || App.busy || App.finished) return;
  const a = step.action;
  if (a.type === 'click' && a.id === id) { doClick(step); return; }
  if (a.type === 'shake' && a.id === id) { doShake(step); return; }
  wrongAction();
}

function tryDrop(objId, targetId) {
  const step = curStep();
  if (!step || App.busy || App.finished) return false;
  const a = step.action;
  if (a.src !== objId || a.dst !== targetId) { wrongAction(); return false; }
  if (a.type === 'pour') { doPour(step); return true; }
  if (a.type === 'drop') { doDrop(step); return true; }
  if (a.type === 'move') { doMove(step); return true; }
  if (a.type === 'stir') { doStir(step); return true; }
  wrongAction();
  return false;
}

/* ============================================================
   KÉO THẢ + NHẤP CHUỘT (raycast)
   ============================================================ */
const Drag = { obj: null, moved: false, plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.7), downAt: new THREE.Vector2() };

function setPointer(e) {
  const r = App.renderer.domElement.getBoundingClientRect();
  App.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  App.pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
}

function pickInteractive() {
  if (!App.ctx) return null;
  App.raycaster.setFromCamera(App.pointer, App.camera);
  const hits = App.raycaster.intersectObjects(App.ctx.interactives, true);
  for (const h of hits) {
    let o = h.object;
    while (o && !o.userData.id) o = o.parent;
    if (o && o.userData.id) return o;
  }
  return null;
}

function onPointerDown(e) {
  Snd.init();
  if (App.menuMode || App.finished) return;
  setPointer(e);
  const o = pickInteractive();
  if (!o) return;
  if (App.busy) return;
  Drag.obj = o;
  Drag.moved = false;
  Drag.downAt.set(e.clientX, e.clientY);
  if (o.userData.draggable) App.controls.enabled = false;
}

function onPointerMove(e) {
  if (!Drag.obj || !Drag.obj.userData.draggable) return;
  if (Drag.downAt.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 7) Drag.moved = true;
  if (!Drag.moved) return;
  setPointer(e);
  App.raycaster.setFromCamera(App.pointer, App.camera);
  const p = new THREE.Vector3();
  if (App.raycaster.ray.intersectPlane(Drag.plane, p)) {
    Drag.obj.position.x = THREE.MathUtils.clamp(p.x, -10.5, 10.5);
    Drag.obj.position.z = THREE.MathUtils.clamp(p.z, -4.3, 4.0);
    Drag.obj.position.y = 1.7;
  }
}

function onPointerUp() {
  const o = Drag.obj;
  Drag.obj = null;
  App.controls.enabled = true;
  if (!o) return;
  if (!Drag.moved) {
    if (o.userData.clickable) tryClick(o.userData.id);
    return;
  }
  // tìm đích gần nhất
  let best = null, bestD = 1.9;
  for (const t of App.ctx.targets) {
    if (t.id === o.userData.id) continue;
    const aw = targetAnchorWorld(t.id);
    const d = Math.hypot(aw.x - o.position.x, aw.z - o.position.z);
    if (d < bestD) { bestD = d; best = t; }
  }
  if (best) {
    if (tryDrop(o.userData.id, best.id)) return;
  }
  snapBack(o);
}

function snapBack(o) {
  const h = o.userData.home;
  tween(o.position, { x: h.x, y: h.y, z: h.z }, .5, { ease: 'backOut' });
  tween(o.rotation, { z: h.rz || 0 }, .3);
}

function bindInput() {
  const el = App.renderer.domElement;
  el.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

function resetCamera() {
  App.camera.position.set(0, 6.8, 13.5);
  App.controls.target.set(0, 2.0, 0);
  App.controls.update();
}
