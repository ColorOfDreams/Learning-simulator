/* global THREE, App, Effects, MAT, wait, tweenP, tween, createBeaker, setLevel */
/* ============================================================
   13 THÍ NGHIỆM HÓA HỌC 12 (GDPT 2018)
   ============================================================ */

const CLEAR = 0xdde9f2; // dung dịch không màu

/* ---------- vật phẩm nhỏ dùng chung ---------- */
function makeNail() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.07, .05, 1.6, 10), MAT.metal(0x7d8893));
  body.position.y = .8;
  const head = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .07, 10), MAT.metal(0x7d8893));
  head.position.y = 1.6;
  g.add(body, head);
  // lớp mạ đồng (ẩn)
  const coat = new THREE.Mesh(new THREE.CylinderGeometry(.085, .065, 1.1, 10), MAT.copper());
  coat.material.transparent = true; coat.material.opacity = 0;
  coat.position.y = .55; coat.visible = false;
  g.add(coat);
  g.userData.coat = coat;
  return g;
}

function makeChips(color) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(.3, .08, .22), MAT.metal(color));
    c.position.set((i - 1) * .22, .05, (i % 2) * .18 - .08);
    c.rotation.y = i * 1.1;
    g.add(c);
  }
  return g;
}

function makeStrip(color, w = .34, h = 2.5) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .07), MAT.metal(color));
  m.position.y = h / 2;
  const g = new THREE.Group();
  g.add(m);
  return g;
}

/* ---------- Thí nghiệm Rutherford (Hóa 10): dụng cụ & hiệu ứng ---------- */
const _UP = new THREE.Vector3(0, 1, 0);

function makeGoldFoil() {
  const g = new THREE.Group();
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(.04, 1.3, .92),
    new THREE.MeshStandardMaterial({ color: 0xffd24a, metalness: .92, roughness: .22, emissive: 0x3a2a06 }));
  sheet.position.y = .75;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(.12, .1, 1.02), MAT.metal(0x6a727c));
  bar.position.y = 1.45;
  g.add(sheet, bar);
  return g;
}

/* chùm hạt alpha: bắn từ nguồn, xuyên / lệch / bật ngược tại lá vàng,
   chớp sáng xanh lục khi chạm màn huỳnh quang */
function alphaBeam(ctx, counter) {
  const C = new THREE.Vector3(0, 2.0, .4);          // tâm lá vàng
  const R = 3.04;                                    // bán kính màn
  const muzzle = new THREE.Vector3(-3.8, 2.0, .4);   // miệng ống chuẩn trực
  const geo = new THREE.SphereGeometry(.07, 8, 6);
  const matOf = {
    straight: new THREE.MeshBasicMaterial({ color: 0xcdeaff }),
    small: new THREE.MeshBasicMaterial({ color: 0xffc24a }),
    big: new THREE.MeshBasicMaterial({ color: 0xff9030 }),
    back: new THREE.MeshBasicMaterial({ color: 0xff5a48 }),
  };
  const trailTex = glowTexture('rgba(255,190,110,1)', 'rgba(255,120,40,0)');
  const flashTex = glowTexture('rgba(190,255,200,1)', 'rgba(60,220,120,0)');
  const grp = new THREE.Group();
  ctx.add(grp);
  const parts = [], fading = [];
  let acc = 0, stopped = false;

  function puff(pos, tex, size, life) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.position.copy(pos);
    s.scale.setScalar(size);
    s.userData = { life: 0, max: life, grow: size * 1.7 };
    grp.add(s); fading.push(s);
  }
  function spawn(fate) {
    const m = new THREE.Mesh(geo, matOf[fate]);
    m.position.set(muzzle.x, muzzle.y + (Math.random() - .5) * .5, muzzle.z + (Math.random() - .5) * .36);
    m.userData = { v: new THREE.Vector3(6.2, 0, 0), fate, crossed: false, tAcc: 0 };
    grp.add(m); parts.push(m);
  }
  function decideFate() {
    const r = Math.random();
    return r < .9 ? 'straight' : r < .975 ? 'small' : r < .996 ? 'big' : 'back';
  }
  const e = {
    spawn,
    stop() { stopped = true; },
    update(dt) {
      if (!stopped) {
        acc += dt * 9;
        while (acc > 1) { acc--; spawn(decideFate()); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const m = parts[i], u = m.userData;
        m.position.addScaledVector(u.v, dt);
        // đi qua mặt phẳng lá vàng → quyết định số phận
        if (!u.crossed && m.position.x >= C.x) {
          u.crossed = true;
          let d = 0;
          if (u.fate === 'small') d = THREE.MathUtils.degToRad(9 + Math.random() * 22);
          else if (u.fate === 'big') d = THREE.MathUtils.degToRad(40 + Math.random() * 32);
          else if (u.fate === 'back') d = THREE.MathUtils.degToRad(140 + Math.random() * 14);
          if (d) {
            if (Math.random() < .5) d = -d;
            u.v.applyAxisAngle(_UP, d);
            u.v.y = (Math.random() - .5) * .6;
            puff(m.position.clone(), trailTex, .34, .4);
          }
        }
        // vệt đuôi cho hạt bị lệch hướng
        if (u.crossed && u.fate !== 'straight') {
          u.tAcc += dt;
          if (u.tAcc > .045) { u.tAcc = 0; puff(m.position.clone(), trailTex, .2, .4); }
        }
        // chạm màn huỳnh quang → chớp sáng + đếm (chỉ xét sau khi qua lá vàng,
        // vì điểm xuất phát của hạt nằm ngoài bán kính màn)
        const dx = m.position.x - C.x, dz = m.position.z - C.z;
        if (u.crossed && dx * dx + dz * dz >= R * R) {
          const dir = new THREE.Vector3(dx, 0, dz).normalize();
          const p = C.clone().addScaledVector(dir, R - .06);
          p.y = THREE.MathUtils.clamp(m.position.y, 1.1, 2.9);
          puff(p, flashTex, .55, .8);
          if (counter) counter.add(u.fate === 'straight' ? 'straight' : (u.fate === 'back' ? 'back' : 'lech'));
          grp.remove(m); parts.splice(i, 1);
          continue;
        }
        if (m.position.x < muzzle.x - .4) { grp.remove(m); parts.splice(i, 1); }
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
    },
  };
  App.emitters.push(e);
  return e;
}

/* bảng đếm chớp sáng (canvas cập nhật trực tiếp) */
function makeAlphaCounter(ctx, x, z, ry = 0) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 300;
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const counts = { straight: 0, lech: 0, back: 0 };
  function draw() {
    const g = c.getContext('2d');
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
  }
  draw();
  const board = new THREE.Group();
  const backP = new THREE.Mesh(new THREE.BoxGeometry(3.45, 2.1, .12), MAT.plastic(0x24435e));
  backP.position.set(0, 2.5, -.08);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.95), new THREE.MeshBasicMaterial({ map: tex }));
  panel.position.y = 2.5;
  board.add(backP, panel);
  for (const lx of [-1.3, 1.3]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.55, 8), MAT.metal(0x6a727c));
    leg.position.set(lx, .77, -.08);
    board.add(leg);
  }
  board.position.set(x, 0, z);
  board.rotation.y = ry;
  ctx.add(board);
  return { add(k) { counts[k]++; draw(); }, counts };
}

/* mô hình nguyên tử Rutherford phóng to (bước giải thích) */
function buildAtomModel() {
  const g = new THREE.Group();
  const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.55, 28, 20),
    new THREE.MeshPhysicalMaterial({ color: 0x86c2ff, transparent: true, opacity: .13, roughness: .25, depthWrite: false }));
  cloud.renderOrder = 2;
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(.15, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xff5a40, emissive: 0xff2200, emissiveIntensity: 1.3 }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(255,140,90,.95)', 'rgba(255,80,30,0)'), transparent: true, depthWrite: false }));
  glow.scale.setScalar(.85);
  g.add(cloud, nuc, glow);
  // 2 electron quay quanh hạt nhân
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: .3 });
  const eMat = new THREE.MeshStandardMaterial({ color: 0x46b4ff, emissive: 0x1060c0, emissiveIntensity: .9 });
  const electrons = [];
  [[1.25, .35, 0], [.65, -.5, 2.1]].forEach(([rx, rz, phase]) => {
    const h = new THREE.Group();
    h.rotation.set(rx, 0, rz);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.28, .015, 6, 48), orbitMat);
    const el = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), eMat);
    h.add(ring, el);
    g.add(h);
    electrons.push({ el, phase });
  });
  // quỹ đạo hạt alpha: 3 xuyên thẳng, 1 lệch, 1 bật ngược
  const mkPath = (curve, color) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .022, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .6 }));
    g.add(m);
    return curve;
  };
  const curves = [];
  for (const [y0, z0] of [[.6, .3], [-.55, -.25], [1.0, -.4]]) {
    curves.push(mkPath(new THREE.LineCurve3(
      new THREE.Vector3(-2.6, y0, z0), new THREE.Vector3(2.6, y0, z0)), 0x9fe0ff));
  }
  curves.push(mkPath(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.6, .3, 0), new THREE.Vector3(-.1, .12, 0), new THREE.Vector3(2.3, 1.7, 0)), 0xffb040));
  curves.push(mkPath(new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-2.6, -.12, 0), new THREE.Vector3(.35, -.06, 0), new THREE.Vector3(-2.6, -1.0, 0)), 0xff5a48));
  // chấm sáng chạy dọc quỹ đạo
  const dots = curves.map((curve, i) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6),
      new THREE.MeshBasicMaterial({ color: i < 3 ? 0xdff2ff : (i === 3 ? 0xffd080 : 0xff8070) }));
    g.add(d);
    return { m: d, curve, off: i * .23 };
  });
  // nhãn chú thích
  const lbl1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .48),
    new THREE.MeshBasicMaterial({ map: textTexture('Hạt nhân (+)', { fs: 42, bd: '#e06a4a' }), transparent: true }));
  lbl1.position.set(1.45, -.75, .45);
  const lbl2 = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .55),
    new THREE.MeshBasicMaterial({ map: textTexture('Electron (–)', { fs: 42, bd: '#5aa0e0' }), transparent: true }));
  lbl2.position.set(-1.45, 1.5, .45);
  g.add(lbl1, lbl2);
  // hoạt ảnh
  let t = 0;
  App.updatables.push(dt => {
    if (!g.parent) return false;
    t += dt;
    electrons.forEach((o, i) => {
      const a = t * (1.6 + i * .5) + o.phase;
      o.el.position.set(Math.cos(a) * 1.28, Math.sin(a) * 1.28, 0);
    });
    glow.scale.setScalar(.8 + Math.sin(t * 6) * .08);
    dots.forEach(d => d.m.position.copy(d.curve.getPoint((t * .22 + d.off) % 1)));
    return true;
  });
  return g;
}

/* ============================================================ */
const EXPERIMENTS = [

/* ========== 1. ĐIỀU CHẾ ETHYL ACETATE ========== */
{
  id: 'ester', icon: '🌸', group: 'Ester – Lipid',
  title: 'Điều chế ethyl acetate (phản ứng ester hóa)',
  desc: 'Đun nóng hỗn hợp ethanol và acetic acid với xúc tác H₂SO₄ đặc để tạo ra ester có mùi thơm đặc trưng.',
  tools: ['Ống nghiệm, giá đỡ, đèn cồn', 'Ethanol C₂H₅OH', 'Acetic acid CH₃COOH', 'H₂SO₄ đặc (xúc tác)'],
  setup(ctx) {
    ctx.addRack(-2.2, .5, 1);
    ctx.addTube('tube', { label: 'Ống nghiệm' });
    ctx.addBottle('ancol', 'C₂H₅OH', 0xe8f0f8, { op: .55 });
    ctx.addBottle('axit', 'CH₃COOH', 0xeef2e6, { op: .55, cap: 0x8a4a4a });
    ctx.addBottle('h2so4', 'H₂SO₄ đặc', 0xf0ead0, { op: .6, cap: 0xc24a3a });
    ctx.addLampStand(4.5, -.4);
  },
  steps: [
    { text: 'Rót 1 ml ethanol (C₂H₅OH) vào ống nghiệm.',
      action: { type: 'pour', src: 'ancol', dst: 'tube' },
      pour: { level: .2, color: 0xe4eef6, opacity: .5 } },
    { text: 'Rót tiếp 1 ml acetic acid (CH₃COOH).',
      action: { type: 'pour', src: 'axit', dst: 'tube' },
      pour: { level: .38, color: 0xe6eee2, opacity: .55 } },
    { text: 'Nhỏ vài giọt H₂SO₄ đặc làm xúc tác (cẩn thận!).',
      action: { type: 'pour', src: 'h2so4', dst: 'tube' },
      pour: { level: .44, color: 0xeeeacc, opacity: .6 },
      fx: ctx => Effects.bubbles(ctx.obj.tube, { dur: 1, rate: 8, r: .04 }) },
    { text: 'Kéo ống nghiệm sang giá đỡ phía trên đèn cồn.',
      action: { type: 'move', src: 'tube', dst: 'stand' } },
    { text: 'Nhấp vào đèn cồn để châm lửa, đun nóng nhẹ hỗn hợp.',
      action: { type: 'click', id: 'lamp' },
      fx: async ctx => { await Effects.boil(ctx.obj.tube, 3); } },
    { text: 'Quan sát: lớp chất lỏng mùi thơm nổi lên trên!',
      action: { type: 'wait', dur: .6 },
      fx: async ctx => {
        await Effects.layer(ctx.obj.tube, { color: 0xfbf3c0, h: .18, opacity: .85 });
        Effects.sparkle(ctx.obj.tube, new THREE.Vector3(0, 3.8, 0), { dur: 2.5 });
        ctx.setFlame('lamp', false);
        await wait(1.2);
      },
      eq: 'CH₃COOH + C₂H₅OH ⇌ (H₂SO₄ đặc, t°) CH₃COOC₂H₅ + H₂O' },
  ],
  done: {
    pheno: 'Xuất hiện <b>lớp chất lỏng không màu, nhẹ, nổi lên trên</b> có <b>mùi thơm đặc trưng</b> (giống mùi chuối chín) — đó là ethyl acetate.',
    eqs: ['CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O (H₂SO₄ đặc, t°)'],
    note: 'H₂SO₄ đặc vừa là xúc tác, vừa hút nước làm cân bằng chuyển dịch theo chiều tạo ester. Ester nhẹ hơn nước và rất ít tan trong nước nên nổi lên trên.',
  },
},

/* ========== 2. XÀ PHÒNG HÓA CHẤT BÉO ========== */
{
  id: 'soap', icon: '🧼', group: 'Ester – Lipid',
  title: 'Phản ứng xà phòng hóa chất béo',
  desc: 'Đun chất béo (dầu ăn) với dung dịch NaOH để điều chế xà phòng — phản ứng thủy phân ester trong môi trường kiềm.',
  tools: ['Cốc thủy tinh, kiềng 3 chân, đèn cồn', 'Đũa thủy tinh', 'Dầu ăn (chất béo)', 'Dung dịch NaOH 40%', 'Dung dịch NaCl bão hòa'],
  setup(ctx) {
    // kiềng 3 chân + lưới + cốc
    const metal = MAT.metal(0x5f6770);
    const tri = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.55, 8), metal);
      leg.position.set(Math.cos(a) * 1.05, .78, Math.sin(a) * 1.05);
      tri.add(leg);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, .06, 8, 24), metal);
    ring.rotation.x = Math.PI / 2; ring.position.y = 1.52;
    const gauze = new THREE.Mesh(new THREE.BoxGeometry(1.7, .05, 1.7), MAT.metal(0x8a9098));
    gauze.position.y = 1.57;
    tri.add(ring, gauze);
    tri.position.set(0, 0, .3);
    ctx.add(tri);
    const beaker = createBeaker({ r: 1.05, h: 2.1 });
    beaker.position.set(0, 1.6, .3);
    ctx.register('beaker', beaker, {});
    ctx.addTarget('beaker', beaker, new THREE.Vector3(0, 2.2, 0));
    ctx.addLamp('lamp', 0, .3);
    ctx.placard('Bộ đun cách lưới', 0, 2.1, 1.7);
    // đũa thủy tinh
    const rod = new THREE.Group();
    const rm = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.5, 10), MAT.glass(0xcfe8f0, .5));
    rm.rotation.z = 1.35; rm.position.y = .12;
    rod.add(rm);
    rod.position.set(-4.8, 0, 1.7);
    rod.userData.h = .8;
    ctx.register('rod', rod, { draggable: true });
    ctx.placard('Đũa thủy tinh', -4.8, 2.6, 1.4);
    ctx.addBottle('oil', 'Dầu ăn', 0xe9c63f, { op: .85, cap: 0xd6a92a });
    ctx.addBottle('naoh', 'NaOH 40%', CLEAR, { op: .5 });
    ctx.addBottle('nacl', 'NaCl\nbão hòa', 0xe6eef4, { op: .55, fs: 34, cap: 0x4a8a5a });
  },
  steps: [
    { text: 'Rót dầu ăn (chất béo) vào cốc thủy tinh.',
      action: { type: 'pour', src: 'oil', dst: 'beaker' },
      pour: { level: .25, color: 0xe9c63f, opacity: .85 } },
    { text: 'Thêm dung dịch NaOH 40% vào cốc.',
      action: { type: 'pour', src: 'naoh', dst: 'beaker' },
      pour: { level: .45, color: 0xdfc870, opacity: .8 } },
    { text: 'Nhấp vào đèn cồn để đun nóng hỗn hợp.',
      action: { type: 'click', id: 'lamp' },
      fx: async ctx => { Effects.bubbles(ctx.obj.beaker, { dur: 2.2, rate: 14 }); await wait(1.2); } },
    { text: 'Kéo đũa thủy tinh vào cốc để khuấy đều liên tục.',
      action: { type: 'stir', src: 'rod', dst: 'beaker' },
      fx: async ctx => { await Effects.boil(ctx.obj.beaker, 2.5); } },
    { text: 'Rót thêm dung dịch NaCl bão hòa nóng rồi để nguội.',
      action: { type: 'pour', src: 'nacl', dst: 'beaker' },
      pour: { level: .62, color: 0xd8cfa0, opacity: .75 } },
    { text: 'Quan sát: xà phòng rắn màu trắng nổi lên trên!',
      action: { type: 'wait', dur: .5 },
      fx: async ctx => {
        ctx.setFlame('lamp', false);
        await Effects.layer(ctx.obj.beaker, { color: 0xf6f3e4, h: .35, opacity: .95, dur: 2 });
      },
      eq: '(C₁₇H₃₅COO)₃C₃H₅ + 3NaOH → (t°) 3C₁₇H₃₅COONa + C₃H₅(OH)₃' },
  ],
  done: {
    pheno: 'Có <b>lớp chất rắn màu trắng nhẹ nổi lên trên</b> — đó là muối sodium stearate (xà phòng). NaCl bão hòa giúp tách xà phòng ra khỏi dung dịch.',
    eqs: ['(C₁₇H₃₅COO)₃C₃H₅ + 3NaOH → 3C₁₇H₃₅COONa + C₃H₅(OH)₃'],
    note: 'Đây là phản ứng thủy phân ester trong môi trường kiềm (xà phòng hóa) — phản ứng một chiều, dùng để sản xuất xà phòng và glycerol.',
  },
},

/* ========== 3. GLUCOSE + Cu(OH)2 ========== */
{
  id: 'glucu', icon: '🍇', group: 'Carbohydrate',
  title: 'Glucose tác dụng với Cu(OH)₂',
  desc: 'Chứng minh glucose có nhiều nhóm –OH kề nhau (hòa tan Cu(OH)₂ tạo phức xanh lam) và có nhóm –CHO (tạo kết tủa đỏ gạch khi đun).',
  tools: ['Ống nghiệm, giá đỡ, đèn cồn', 'Dung dịch NaOH 10%', 'Dung dịch CuSO₄ 5%', 'Dung dịch glucose 5%'],
  setup(ctx) {
    ctx.addRack(-2.2, .5, 1);
    ctx.addTube('tube', { label: 'Ống nghiệm' });
    ctx.addBottle('naoh', 'NaOH 10%', CLEAR, { op: .5 });
    ctx.addBottle('cuso4', 'CuSO₄ 5%', 0x2e86de, { op: .85, cap: 0x2a5a9a });
    ctx.addBottle('glu', 'Glucose 5%', 0xeaf2f0, { op: .5, cap: 0x4a8a5a });
    ctx.addLampStand(4.5, -.4);
  },
  steps: [
    { text: 'Rót 1 ml dung dịch NaOH 10% vào ống nghiệm.',
      action: { type: 'pour', src: 'naoh', dst: 'tube' },
      pour: { level: .18, color: 0xe0ecf4, opacity: .5 } },
    { text: 'Nhỏ vài giọt CuSO₄ 5% — xuất hiện kết tủa xanh Cu(OH)₂.',
      action: { type: 'pour', src: 'cuso4', dst: 'tube' },
      pour: { level: .26, color: 0x9fc8e8, opacity: .7 },
      fx: async ctx => { await Effects.precip(ctx.obj.tube, { color: 0x3f9be0, tint: .5 }); },
      eq: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄' },
    { text: 'Thêm 2 ml dung dịch glucose 5%.',
      action: { type: 'pour', src: 'glu', dst: 'tube' },
      pour: { level: .42 } },
    { text: 'Nhấp vào ống nghiệm để lắc đều.',
      action: { type: 'shake', id: 'tube' },
      fx: async ctx => {
        await Effects.dissolvePile(ctx.obj.tube, { color: 0x1f4fc8, opacity: .8, dur: 1.4 });
      },
      eq: '2C₆H₁₂O₆ + Cu(OH)₂ → (C₆H₁₁O₆)₂Cu + 2H₂O (phức xanh lam)' },
    { text: 'Kéo ống nghiệm sang giá đỡ trên đèn cồn.',
      action: { type: 'move', src: 'tube', dst: 'stand' } },
    { text: 'Nhấp đèn cồn để đun nóng phần trên ống nghiệm.',
      action: { type: 'click', id: 'lamp' },
      fx: async ctx => { await Effects.boil(ctx.obj.tube, 2.5); } },
    { text: 'Quan sát: kết tủa đỏ gạch Cu₂O xuất hiện!',
      action: { type: 'wait', dur: .5 },
      fx: async ctx => {
        ctx.setFlame('lamp', false);
        await Promise.all([
          Effects.precip(ctx.obj.tube, { color: 0xc0392b, tint: .6, dur: 2 }),
          Effects.tint(ctx.obj.tube, { color: 0xd07a50, opacity: .75, dur: 2 }),
        ]);
      },
      eq: 'CH₂OH[CHOH]₄CHO + 2Cu(OH)₂ + NaOH → (t°) CH₂OH[CHOH]₄COONa + Cu₂O↓ + 3H₂O' },
  ],
  done: {
    pheno: 'Ở nhiệt độ thường, kết tủa xanh tan tạo <b>dung dịch xanh lam thẫm</b> (glucose có nhiều nhóm –OH kề nhau). Khi đun nóng tạo <b>kết tủa đỏ gạch Cu₂O</b> (glucose có nhóm –CHO).',
    eqs: ['2C₆H₁₂O₆ + Cu(OH)₂ → (C₆H₁₁O₆)₂Cu + 2H₂O',
          'CH₂OH[CHOH]₄CHO + 2Cu(OH)₂ + NaOH → CH₂OH[CHOH]₄COONa + Cu₂O↓ + 3H₂O'],
    note: 'Glucose vừa có tính chất của polyalcohol, vừa có tính khử của aldehyde — đây là thí nghiệm "2 trong 1" kinh điển của chương Carbohydrate.',
  },
},

/* ========== 4. PHẢN ỨNG TRÁNG BẠC ========== */
{
  id: 'silver', icon: '🪞', group: 'Carbohydrate',
  title: 'Phản ứng tráng bạc của glucose',
  desc: 'Glucose khử ion bạc trong thuốc thử Tollens tạo lớp bạc kim loại sáng bóng bám trên thành ống nghiệm.',
  tools: ['Ống nghiệm sạch', 'Cốc nước nóng ~70°C', 'Dung dịch AgNO₃ 1%', 'Dung dịch NH₃ 5%', 'Dung dịch glucose 5%'],
  setup(ctx) {
    ctx.addRack(-2.2, .5, 1);
    ctx.addTube('tube', { label: 'Ống nghiệm' });
    ctx.addBottle('agno3', 'AgNO₃ 1%', CLEAR, { op: .5, cap: 0x8a8a92 });
    ctx.addBottle('nh3', 'NH₃ 5%', 0xe6f0ea, { op: .45 });
    ctx.addBottle('glu', 'Glucose 5%', 0xeaf2f0, { op: .5, cap: 0x4a8a5a });
    ctx.addBath(4.6, .3);
  },
  steps: [
    { text: 'Rót 1 ml dung dịch AgNO₃ 1% vào ống nghiệm sạch.',
      action: { type: 'pour', src: 'agno3', dst: 'tube' },
      pour: { level: .18, color: 0xe2ecf2, opacity: .5 } },
    { text: 'Nhỏ từ từ NH₃ — kết tủa xuất hiện rồi tan hết.',
      action: { type: 'pour', src: 'nh3', dst: 'tube' },
      pour: { level: .28 },
      fx: async ctx => {
        await Effects.precip(ctx.obj.tube, { color: 0xb8aa96, tint: .4, dur: .7 });
        await Effects.dissolvePile(ctx.obj.tube, { color: 0xe2ecf2, opacity: .5, dur: 1 });
      },
      eq: 'AgNO₃ + 3NH₃ + H₂O → [Ag(NH₃)₂]OH + NH₄NO₃' },
    { text: 'Thêm 1 ml dung dịch glucose 5%.',
      action: { type: 'pour', src: 'glu', dst: 'tube' },
      pour: { level: .42 } },
    { text: 'Đặt ống nghiệm vào cốc nước nóng (không lắc!).',
      action: { type: 'move', src: 'tube', dst: 'bath' },
      move: { y: .3, dx: -.1, rotZ: .18 } },
    { text: 'Quan sát: lớp bạc sáng như gương bám lên thành ống!',
      action: { type: 'wait', dur: .5 },
      fx: async ctx => {
        await Effects.mirror(ctx.obj.tube, 3.5);
        Effects.sparkle(ctx.obj.tube, new THREE.Vector3(0, 2.2, 0), { dur: 2.5, rate: 9 });
        await wait(1);
      },
      eq: 'CH₂OH[CHOH]₄CHO + 2[Ag(NH₃)₂]OH → (t°) CH₂OH[CHOH]₄COONH₄ + 2Ag↓ + 3NH₃ + H₂O' },
  ],
  done: {
    pheno: 'Thành ống nghiệm được phủ <b>lớp bạc kim loại sáng bóng như gương</b>. Phản ứng cần đun nóng nhẹ (cách thủy) và không được lắc ống.',
    eqs: ['CH₂OH[CHOH]₄CHO + 2[Ag(NH₃)₂]OH → CH₂OH[CHOH]₄COONH₄ + 2Ag↓ + 3NH₃ + H₂O'],
    note: 'Đây là phản ứng dùng để tráng gương, tráng ruột phích trong công nghiệp. Glucose đóng vai trò chất khử.',
  },
},

/* ========== 5. TINH BỘT + IODINE ========== */
{
  id: 'starch', icon: '🥔', group: 'Carbohydrate',
  title: 'Phản ứng màu của tinh bột với iodine',
  desc: 'Hồ tinh bột tác dụng với iodine tạo hợp chất màu xanh tím đặc trưng — màu biến mất khi đun nóng và hiện lại khi để nguội.',
  tools: ['Ống nghiệm, giá đỡ, đèn cồn', 'Hồ tinh bột 2%', 'Dung dịch iodine (I₂)'],
  setup(ctx) {
    ctx.addRack(-2.2, .5, 1);
    ctx.addTube('tube', { label: 'Ống nghiệm' });
    ctx.addBottle('starch', 'Hồ tinh bột', 0xedf1f2, { op: .8 });
    ctx.addBottle('i2', 'Dung dịch I₂', 0x9a5a18, { op: .85, cap: 0x6a3a10 });
    ctx.addLampStand(4.5, -.4);
  },
  steps: [
    { text: 'Rót 2 ml hồ tinh bột vào ống nghiệm.',
      action: { type: 'pour', src: 'starch', dst: 'tube' },
      pour: { level: .32, color: 0xedf1f0, opacity: .8 } },
    { text: 'Nhỏ vài giọt dung dịch iodine vào — màu xanh tím xuất hiện!',
      action: { type: 'pour', src: 'i2', dst: 'tube' },
      pour: { level: .38, color: 0x35307d, opacity: .9 },
      eq: 'Hồ tinh bột + I₂ → hợp chất bọc màu xanh tím' },
    { text: 'Kéo ống nghiệm sang giá đỡ trên đèn cồn.',
      action: { type: 'move', src: 'tube', dst: 'stand' } },
    { text: 'Nhấp đèn cồn để đun nóng — màu xanh tím biến mất!',
      action: { type: 'click', id: 'lamp' },
      fx: async ctx => {
        Effects.boil(ctx.obj.tube, 2.2);
        await Effects.tint(ctx.obj.tube, { color: 0xd8dde2, opacity: .55, dur: 2.2 });
      } },
    { text: 'Tắt đèn, để nguội — màu xanh tím hiện trở lại!',
      action: { type: 'wait', dur: .4 },
      fx: async ctx => {
        ctx.setFlame('lamp', false);
        await wait(1);
        await Effects.tint(ctx.obj.tube, { color: 0x35307d, opacity: .9, dur: 2.2 });
      } },
  ],
  done: {
    pheno: 'Tinh bột + I₂ cho <b>màu xanh tím</b>. Khi <b>đun nóng màu biến mất</b>, khi <b>để nguội màu xuất hiện lại</b>.',
    eqs: ['Tinh bột + I₂ → hợp chất màu xanh tím (không phải phản ứng oxi hóa – khử)'],
    note: 'Phân tử amylose có dạng xoắn lò xo, "nhốt" các phân tử I₂ tạo màu xanh tím. Đun nóng làm duỗi xoắn → I₂ thoát ra → mất màu. Đây là thuốc thử nhận biết tinh bột.',
  },
},

/* ========== 6. PHẢN ỨNG MÀU BIURET ========== */
{
  id: 'biuret', icon: '🥚', group: 'Hợp chất chứa nitrogen',
  title: 'Phản ứng màu biuret của protein',
  desc: 'Protein (lòng trắng trứng) tác dụng với Cu(OH)₂ trong môi trường kiềm tạo phức màu tím đặc trưng.',
  tools: ['Ống nghiệm', 'Dung dịch lòng trắng trứng (protein)', 'Dung dịch NaOH 30%', 'Dung dịch CuSO₄ 2%'],
  setup(ctx) {
    ctx.addRack(-1.6, .5, 1);
    ctx.addTube('tube', { label: 'Ống nghiệm' });
    ctx.addBottle('egg', 'Lòng trắng\ntrứng', 0xf3ecc8, { op: .6, fs: 32, cap: 0xd6c25a });
    ctx.addBottle('naoh', 'NaOH 30%', CLEAR, { op: .5 });
    ctx.addBottle('cuso4', 'CuSO₄ 2%', 0x2e86de, { op: .85, cap: 0x2a5a9a });
  },
  steps: [
    { text: 'Rót 1 ml dung dịch lòng trắng trứng vào ống nghiệm.',
      action: { type: 'pour', src: 'egg', dst: 'tube' },
      pour: { level: .25, color: 0xf2ecca, opacity: .6 } },
    { text: 'Thêm 1 ml dung dịch NaOH 30%.',
      action: { type: 'pour', src: 'naoh', dst: 'tube' },
      pour: { level: .4, color: 0xeeeccc, opacity: .55 } },
    { text: 'Nhỏ vài giọt dung dịch CuSO₄ 2%.',
      action: { type: 'pour', src: 'cuso4', dst: 'tube' },
      pour: { level: .46, color: 0xc5d4e2, opacity: .65 } },
    { text: 'Nhấp vào ống nghiệm để lắc đều — màu tím xuất hiện!',
      action: { type: 'shake', id: 'tube' },
      fx: async ctx => {
        await Effects.tint(ctx.obj.tube, { color: 0x8e44ad, opacity: .85, dur: 1.6 });
        Effects.sparkle(ctx.obj.tube, new THREE.Vector3(0, 3.7, 0), { dur: 1.6 });
      },
      eq: 'Protein + Cu(OH)₂/OH⁻ → phức chất màu tím (phản ứng biuret)' },
  ],
  done: {
    pheno: 'Dung dịch chuyển sang <b>màu tím đặc trưng</b> — do liên kết peptide trong protein tạo phức với ion Cu²⁺ trong môi trường kiềm.',
    eqs: ['Protein có từ 2 liên kết peptide trở lên + Cu(OH)₂ → phức màu tím'],
    note: 'Phản ứng màu biuret dùng để nhận biết protein. Dipeptide (chỉ 1 liên kết peptide) KHÔNG cho phản ứng này.',
  },
},

/* ========== 7. SODIUM + NƯỚC ========== */
{
  id: 'sodium', icon: '💥', group: 'Kim loại nhóm IA – IIA',
  title: 'Sodium tác dụng với nước',
  desc: 'Kim loại kiềm Na phản ứng mãnh liệt với nước, chạy tròn trên mặt nước, tỏa nhiệt và làm phenolphthalein hóa hồng.',
  tools: ['Chậu thủy tinh đựng nước', 'Mẩu sodium (bảo quản trong dầu hỏa)', 'Phenolphthalein', 'Kẹp sắt, dao'],
  setup(ctx) {
    ctx.addBasin('basin', .2, .4);
    ctx.placard('Chậu nước', .2, 3, 1.3);
    ctx.addBottle('pp', 'Phenol-\nphthalein', 0xf2e6ee, { op: .5, fs: 30, cap: 0xc05a8a });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: .35, roughness: .35 }));
    ball.position.y = .3;
    ctx.refs = ctx.refs || {};
    ctx.refs.na = ball;
    ctx.addDishItem('na', ball, -4.8, 1.7, 'Mẩu sodium (Na)');
  },
  steps: [
    { text: 'Nhỏ vài giọt phenolphthalein vào chậu nước.',
      action: { type: 'pour', src: 'pp', dst: 'basin' },
      pour: { level: .62, color: 0xbfe2f0, opacity: .5 } },
    { text: 'Gắp mẩu Na (bằng hạt đậu) thả vào chậu nước. Lùi lại quan sát!',
      action: { type: 'drop', src: 'na', dst: 'basin' },
      drop: { attach: false },
      fx: async ctx => {
        const dish = ctx.obj.na;
        const ball = ctx.refs.na;
        Effects.tint(ctx.obj.basin, { color: 0xe87fb4, opacity: .55, dur: 4.5 });
        const p = dish.userData.home;
        const dance = Effects.naDance(ball, ctx.obj.basin, { dur: 5 });
        tween(dish.position, { x: p.x, y: p.y, z: p.z }, .6);
        await dance;
      },
      eq: '2Na + 2H₂O → 2NaOH + H₂↑' },
    { text: 'Quan sát: nước chuyển màu hồng — môi trường kiềm!',
      action: { type: 'wait', dur: 1.2 },
      fx: async ctx => { Effects.sparkle(ctx.obj.basin, new THREE.Vector3(0, 1.3, 0), { dur: 1.5 }); } },
  ],
  done: {
    pheno: 'Mẩu Na <b>nóng chảy thành giọt tròn, chạy trên mặt nước</b>, có khí thoát ra, tan dần đến hết. Dung dịch chuyển <b>màu hồng</b> do tạo NaOH (base kiềm).',
    eqs: ['2Na + 2H₂O → 2NaOH + H₂↑'],
    note: 'Phản ứng tỏa nhiệt mạnh làm Na nóng chảy (t°nc thấp). Kim loại kiềm phải bảo quản trong dầu hỏa và chỉ dùng mẩu nhỏ khi thí nghiệm!',
  },
},

/* ========== 8. Fe + CuSO4 ========== */
{
  id: 'fecuso4', icon: '🔩', group: 'Đại cương kim loại',
  title: 'Đinh sắt tác dụng với dung dịch CuSO₄',
  desc: 'Kim loại mạnh hơn đẩy kim loại yếu hơn ra khỏi dung dịch muối — minh họa dãy điện hóa của kim loại.',
  tools: ['Ống nghiệm', 'Đinh sắt sạch', 'Dung dịch CuSO₄'],
  setup(ctx) {
    ctx.addRack(-1.6, .5, 1);
    ctx.addTube('tube', { label: 'Ống nghiệm' });
    ctx.addBottle('cuso4', 'CuSO₄', 0x2e86de, { op: .85, cap: 0x2a5a9a });
    const nail = makeNail();
    ctx.refs = ctx.refs || {};
    ctx.refs.nail = nail;
    ctx.addDishItem('nail', nail, -4.8, 1.7, 'Đinh sắt (Fe)');
  },
  steps: [
    { text: 'Rót dung dịch CuSO₄ màu xanh vào ống nghiệm.',
      action: { type: 'pour', src: 'cuso4', dst: 'tube' },
      pour: { level: .5, color: 0x2e86de, opacity: .85 } },
    { text: 'Thả đinh sắt vào ống nghiệm.',
      action: { type: 'drop', src: 'nail', dst: 'tube' },
      drop: { local: { x: 0, y: .18, z: 0 }, rotZ: .1 } },
    { text: 'Quan sát: lớp đồng đỏ bám vào đinh, màu xanh nhạt dần!',
      action: { type: 'wait', dur: .5 },
      fx: async ctx => {
        const coat = ctx.refs.nail.userData.coat;
        await Promise.all([
          Effects.fadeInMesh(coat, 4),
          Effects.tint(ctx.obj.tube, { color: 0xaed4dc, opacity: .6, dur: 4 }),
        ]);
      },
      eq: 'Fe + CuSO₄ → FeSO₄ + Cu↓' },
  ],
  done: {
    pheno: 'Có <b>lớp kim loại màu đỏ (Cu) bám trên đinh sắt</b>, màu xanh của dung dịch <b>nhạt dần</b> (CuSO₄ chuyển thành FeSO₄ màu lục nhạt).',
    eqs: ['Fe + CuSO₄ → FeSO₄ + Cu↓'],
    note: 'Fe đứng trước Cu trong dãy điện hóa nên khử được Cu²⁺. Đây là cơ sở của phương pháp thủy luyện điều chế kim loại.',
  },
},

/* ========== 9. Al + NaOH ========== */
{
  id: 'alnaoh', icon: '🫧', group: 'Kim loại nhóm IA – IIA',
  title: 'Nhôm tác dụng với dung dịch NaOH',
  desc: 'Al là kim loại lưỡng tính về mặt hóa học: lớp oxide bị kiềm phá hủy, sau đó Al phản ứng giải phóng khí H₂.',
  tools: ['Ống nghiệm', 'Vài mảnh nhôm (Al)', 'Dung dịch NaOH đặc'],
  setup(ctx) {
    ctx.addRack(-1.6, .5, 1);
    ctx.addTube('tube', { label: 'Ống nghiệm' });
    ctx.addBottle('naoh', 'NaOH đặc', CLEAR, { op: .5 });
    const chips = makeChips(0xc8cdd4);
    ctx.refs = ctx.refs || {};
    ctx.refs.chips = chips;
    ctx.addDishItem('al', chips, -4.8, 1.7, 'Mảnh nhôm (Al)');
  },
  steps: [
    { text: 'Rót 2 ml dung dịch NaOH đặc vào ống nghiệm.',
      action: { type: 'pour', src: 'naoh', dst: 'tube' },
      pour: { level: .4, color: 0xe0ecf4, opacity: .5 } },
    { text: 'Thả vài mảnh nhôm vào ống nghiệm.',
      action: { type: 'drop', src: 'al', dst: 'tube' },
      drop: { local: { x: 0, y: .16, z: 0 }, scale: .8 } },
    { text: 'Quan sát: khí thoát ra mạnh, mảnh nhôm tan dần!',
      action: { type: 'wait', dur: .5 },
      fx: async ctx => {
        Effects.bubbles(ctx.obj.tube, { dur: 5, rate: 34, r: .055, speed: 1.8 });
        Effects.steam(ctx.obj.tube, new THREE.Vector3(0, 3.6, 0), { dur: 4, rate: 2.5, size: .35 });
        await tweenP(ctx.refs.chips.scale, { x: .06, y: .06, z: .06 }, 4.5);
        ctx.refs.chips.visible = false;
      },
      eq: '2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂↑' },
  ],
  done: {
    pheno: 'Mảnh nhôm <b>tan dần</b>, có <b>bọt khí H₂ thoát ra mạnh</b>. Phản ứng xảy ra được vì kiềm hòa tan lớp Al₂O₃ bảo vệ rồi tác dụng tiếp với Al.',
    eqs: ['Al₂O₃ + 2NaOH + 3H₂O → 2Na[Al(OH)₄]', '2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂↑'],
    note: 'Vì vậy không dùng đồ nhôm để đựng dung dịch kiềm, nước vôi. Al không tác dụng trực tiếp với NaOH mà với nước, NaOH hòa tan lớp hydroxide tạo thành.',
  },
},

/* ========== 10. NHIỆT NHÔM ========== */
{
  id: 'thermite', icon: '🌋', group: 'Đại cương kim loại',
  title: 'Phản ứng nhiệt nhôm (Al + Fe₂O₃)',
  desc: 'Phản ứng tỏa nhiệt cực mạnh giữa bột nhôm và iron(III) oxide, tạo ra sắt nóng chảy — ứng dụng hàn đường ray.',
  tools: ['Chén sứ chịu nhiệt, kiềng, khay cát', 'Bột Fe₂O₃', 'Bột Al', 'Dải băng Mg làm mồi'],
  setup(ctx) {
    ctx.refs = ctx.refs || {};
    // khay cát
    const tray = new THREE.Mesh(new THREE.BoxGeometry(4.6, .3, 3.2), MAT.plastic(0xd9c08a));
    tray.position.set(0, .15, .4);
    tray.receiveShadow = true;
    ctx.add(tray);
    // kiềng
    const metal = MAT.metal(0x5f6770);
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 + .5;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.7, 8), metal);
      leg.position.set(Math.cos(a) * .85, 1.15, Math.sin(a) * .85 + .4);
      ctx.add(leg);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.62, .06, 8, 22), metal);
    ring.rotation.x = Math.PI / 2; ring.position.set(0, 2.0, .4);
    ctx.add(ring);
    // chén sứ
    const cru = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.72, .4, .95, 20, 1, true), MAT.plastic(0xf0ece2));
    cup.material.side = THREE.DoubleSide;
    cup.position.y = .5;
    const cupBot = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .08, 20), MAT.plastic(0xf0ece2));
    cupBot.position.y = .06;
    cru.add(cup, cupBot);
    const liqHolder = { r: .5, y0: .18, hMax: .6 };
    attachLiquid(cru, liqHolder);
    cru.position.set(0, 1.62, .4);
    cru.userData.h = 1.1;
    ctx.register('crucible', cru, { clickable: true });
    ctx.addTarget('crucible', cru, new THREE.Vector3(0, 1.05, 0));
    ctx.placard('Chén sứ trên khay cát', 0, 2.4, 2);
    ctx.addBottle('fe2o3', 'Bột Fe₂O₃', 0x8a3b22, { op: 1, powder: true, cap: 0x6a2a18 });
    ctx.addBottle('alp', 'Bột Al', 0xb8bcc4, { op: 1, powder: true, cap: 0x7a8088 });
    const mg = new THREE.Mesh(new THREE.BoxGeometry(.07, .85, .03), MAT.metal(0xe8eaf0));
    mg.position.y = .42;
    const mgGroup = new THREE.Group(); mgGroup.add(mg);
    ctx.refs.mg = mgGroup;
    ctx.addDishItem('mg', mgGroup, -4.8, 1.7, 'Dải băng Mg');
  },
  steps: [
    { text: 'Đổ bột Fe₂O₃ (màu nâu đỏ) vào chén sứ.',
      action: { type: 'pour', src: 'fe2o3', dst: 'crucible' },
      pour: { level: .45, color: 0x8a3b22, opacity: 1 } },
    { text: 'Đổ tiếp bột Al và trộn đều hỗn hợp tecmit.',
      action: { type: 'pour', src: 'alp', dst: 'crucible' },
      pour: { level: .8, color: 0x77564a, opacity: 1 } },
    { text: 'Cắm dải băng Mg vào giữa hỗn hợp làm mồi.',
      action: { type: 'drop', src: 'mg', dst: 'crucible' },
      drop: { local: { x: .05, y: .55, z: 0 }, rotZ: .12 } },
    { text: 'Nhấp vào chén sứ để châm lửa dải Mg. Lùi xa quan sát!',
      action: { type: 'click', id: 'crucible' },
      fx: async ctx => {
        Effects.sparkler(ctx.obj.crucible, new THREE.Vector3(0, 1.3, 0), 1.7);
        await wait(1.7);
        ctx.refs.mg.visible = false;
        await Effects.thermite(ctx.obj.crucible, new THREE.Vector3(1.5, .3, 1.1));
      },
      eq: '2Al + Fe₂O₃ → (t°) Al₂O₃ + 2Fe' },
    { text: 'Quan sát: sắt nóng chảy sáng rực chảy xuống khay cát!',
      action: { type: 'wait', dur: 1.2 } },
  ],
  done: {
    pheno: 'Hỗn hợp cháy <b>sáng chói, tỏa nhiệt cực mạnh</b> (~2500°C), tạo ra <b>sắt nóng chảy</b> rơi xuống khay cát và xỉ Al₂O₃.',
    eqs: ['2Al + Fe₂O₃ → Al₂O₃ + 2Fe (phản ứng nhiệt nhôm)'],
    note: 'Phản ứng nhiệt nhôm dùng để hàn đường ray tàu hỏa, điều chế các kim loại khó nóng chảy (Cr, Mn...). Al là chất khử mạnh ở nhiệt độ cao.',
  },
},

/* ========== 11. Fe(OH)2 và Fe(OH)3 ========== */
{
  id: 'feoh', icon: '🟢', group: 'Sắt và hợp chất',
  title: 'Điều chế Fe(OH)₂ và Fe(OH)₃',
  desc: 'Điều chế hai hydroxide của sắt từ muối Fe²⁺, Fe³⁺ và quan sát Fe(OH)₂ bị oxi hóa chuyển màu trong không khí.',
  tools: ['2 ống nghiệm', 'Dung dịch FeCl₂ (mới pha)', 'Dung dịch FeCl₃', 'Dung dịch NaOH'],
  setup(ctx) {
    ctx.addRack(-1.8, .5, 2);
    ctx.addTube('tube1', { label: 'Ống 1: FeCl₂' });
    ctx.addTube('tube2', { label: 'Ống 2: FeCl₃' });
    ctx.addBottle('fecl2', 'FeCl₂', 0xb9dcc4, { op: .6, cap: 0x4a8a5a });
    ctx.addBottle('fecl3', 'FeCl₃', 0xc78a32, { op: .75, cap: 0x9a6a20 });
    ctx.addBottle('naoh', 'NaOH', CLEAR, { op: .5 });
  },
  steps: [
    { text: 'Rót dung dịch FeCl₂ (lục nhạt) vào ống nghiệm 1.',
      action: { type: 'pour', src: 'fecl2', dst: 'tube1' },
      pour: { level: .35, color: 0xb9dcc4, opacity: .55 } },
    { text: 'Rót dung dịch FeCl₃ (vàng nâu) vào ống nghiệm 2.',
      action: { type: 'pour', src: 'fecl3', dst: 'tube2' },
      pour: { level: .35, color: 0xc78a32, opacity: .7 } },
    { text: 'Nhỏ NaOH vào ống 1 — kết tủa trắng hơi xanh xuất hiện!',
      action: { type: 'pour', src: 'naoh', dst: 'tube1' },
      pour: { level: .48 },
      fx: async ctx => { await Effects.precip(ctx.obj.tube1, { color: 0xc9d8cc, tint: .5 }); },
      eq: 'FeCl₂ + 2NaOH → Fe(OH)₂↓ (trắng xanh) + 2NaCl' },
    { text: 'Nhỏ NaOH vào ống 2 — kết tủa nâu đỏ xuất hiện!',
      action: { type: 'pour', src: 'naoh', dst: 'tube2' },
      pour: { level: .48 },
      fx: async ctx => { await Effects.precip(ctx.obj.tube2, { color: 0x96402a, tint: .55 }); },
      eq: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ (nâu đỏ) + 3NaCl' },
    { text: 'Để ống 1 ngoài không khí — kết tủa chuyển dần sang nâu đỏ!',
      action: { type: 'wait', dur: .5 },
      fx: async ctx => {
        await Effects.pileColor(ctx.obj.tube1, 0x96402a, 4);
        await Effects.tint(ctx.obj.tube1, { color: 0xc4a290, opacity: .7, dur: 1 });
      },
      eq: '4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃' },
  ],
  done: {
    pheno: 'Ống 1: kết tủa <b>trắng hơi xanh Fe(OH)₂</b> rồi <b>hóa nâu đỏ dần</b> trong không khí. Ống 2: kết tủa <b>nâu đỏ Fe(OH)₃</b> ngay lập tức.',
    eqs: ['FeCl₂ + 2NaOH → Fe(OH)₂↓ + 2NaCl', 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl', '4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃'],
    note: 'Fe(OH)₂ có tính khử, dễ bị O₂ không khí oxi hóa thành Fe(OH)₃ — minh họa hợp chất Fe(II) kém bền, vừa có tính khử vừa có tính oxi hóa.',
  },
},

/* ========== 12. ĐIỆN PHÂN DUNG DỊCH CuSO4 ========== */
{
  id: 'dienphan', icon: '🔋', group: 'Pin điện và điện phân',
  title: 'Điện phân dung dịch CuSO₄',
  desc: 'Dòng điện một chiều phân hủy dung dịch CuSO₄: đồng bám vào cathode, khí oxygen thoát ra ở anode.',
  tools: ['Nguồn điện một chiều 6V', '2 điện cực than chì (graphite)', 'Cốc thủy tinh', 'Dung dịch CuSO₄'],
  setup(ctx) {
    ctx.refs = ctx.refs || {};
    ctx.addBeaker('cell', 0, .4, { r: 1.25, h: 2.4 });
    ctx.placard('Bình điện phân', 0, 2.3, 1.6);
    // thanh ngang giữ điện cực
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, .14, .3), MAT.plastic(0x3a3f46));
    bar.position.set(0, 2.85, .4);
    ctx.add(bar);
    const gMat = new THREE.MeshStandardMaterial({ color: 0x2e3236, metalness: .25, roughness: .6 });
    const cath = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 2.4, 10), gMat);
    cath.position.set(-.6, 1.7, .4);
    const ano = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 2.4, 10), gMat.clone());
    ano.position.set(.6, 1.7, .4);
    ctx.add(cath); ctx.add(ano);
    ctx.refs.ano = ano;
    // lớp đồng bám cathode (ẩn)
    const coat = new THREE.Mesh(new THREE.CylinderGeometry(.125, .125, 1.1, 10), MAT.copper());
    coat.material.transparent = true; coat.material.opacity = 0; coat.visible = false;
    coat.position.set(-.6, .85, .4);
    ctx.add(coat);
    ctx.refs.coat = coat;
    // nguồn điện
    const box = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.45, 1.2), MAT.plastic(0x2b3a4e));
    body.position.y = .73;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .5),
      new THREE.MeshBasicMaterial({ map: textTexture('DC 6V', { bg: '#0c2238', fg: '#5fe0ff', fs: 52, border: false }) }));
    screen.position.set(-.25, .95, .61);
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(.17, .19, .14, 14),
      new THREE.MeshStandardMaterial({ color: 0xd03a3a, roughness: .4 }));
    btn.rotation.x = Math.PI / 2; btn.position.set(.62, .55, .61);
    const led = new THREE.Mesh(new THREE.SphereGeometry(.08, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x224422, emissive: 0x000000 }));
    led.position.set(.62, .95, .61);
    box.add(body, screen, btn, led);
    box.position.set(4.4, 0, -.3);
    box.userData.h = 1.6;
    ctx.refs.led = led;
    ctx.register('power', box, { clickable: true });
    ctx.placard('Nguồn điện DC — nhấp nút đỏ', 4.4, 1.3, 2.2);
    // dây dẫn
    function wire(from, to, color) {
      const mid = from.clone().lerp(to, .5); mid.y += 1.1;
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const w = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .045, 8), MAT.plastic(color));
      ctx.add(w);
    }
    wire(new THREE.Vector3(3.5, 1.4, -.3), new THREE.Vector3(-.6, 2.95, .4), 0x222a30);
    wire(new THREE.Vector3(5.3, 1.4, -.3), new THREE.Vector3(.6, 2.95, .4), 0xc03030);
    ctx.addBottle('cuso4', 'CuSO₄', 0x2e86de, { op: .85, cap: 0x2a5a9a });
  },
  steps: [
    { text: 'Rót dung dịch CuSO₄ vào bình điện phân.',
      action: { type: 'pour', src: 'cuso4', dst: 'cell' },
      pour: { level: .55, color: 0x2e86de, opacity: .85 } },
    { text: 'Nhấp nút đỏ trên nguồn điện để bắt đầu điện phân.',
      action: { type: 'click', id: 'power' },
      fx: async ctx => {
        ctx.refs.led.material.emissive.setHex(0x30ff60);
        ctx.refs.led.material.color.setHex(0x60ff90);
        Effects.bubblesAt(App.scene, new THREE.Vector3(.6, .5, .4), 1.25, { rate: 22, r: .1, dur: 7 });
        Effects.fadeInMesh(ctx.refs.coat, 6);
        Effects.tint(ctx.obj.cell, { color: 0xa8cce4, opacity: .6, dur: 6.5 });
        await wait(3);
      },
      eq: '2CuSO₄ + 2H₂O → (điện phân) 2Cu↓ + O₂↑ + 2H₂SO₄' },
    { text: 'Quan sát: Cu đỏ bám vào cathode, khí O₂ sủi ở anode!',
      action: { type: 'wait', dur: 3.5 } },
  ],
  done: {
    pheno: 'Ở <b>cathode (cực –)</b>: lớp <b>đồng màu đỏ</b> bám lên điện cực. Ở <b>anode (cực +)</b>: <b>khí O₂</b> thoát ra. Màu xanh dung dịch <b>nhạt dần</b>.',
    eqs: ['Cathode: Cu²⁺ + 2e → Cu', 'Anode: 2H₂O → O₂↑ + 4H⁺ + 4e', '2CuSO₄ + 2H₂O → 2Cu + O₂↑ + 2H₂SO₄'],
    note: 'Điện phân dung dịch với điện cực trơ — ứng dụng trong tinh luyện đồng, mạ điện, điều chế kim loại sau Al.',
  },
},

/* ========== 13. ĂN MÒN ĐIỆN HÓA ========== */
{
  id: 'anmon', icon: '⚡', group: 'Pin điện và điện phân',
  title: 'Ăn mòn điện hóa học (pin Zn – Cu)',
  desc: 'So sánh ăn mòn hóa học và ăn mòn điện hóa: khi nối Zn với Cu trong dung dịch điện li, khí H₂ chuyển sang thoát ra ở thanh Cu.',
  tools: ['Cốc thủy tinh', 'Thanh kẽm (Zn), thanh đồng (Cu)', 'Dây dẫn + đèn LED', 'Dung dịch H₂SO₄ loãng'],
  setup(ctx) {
    ctx.refs = ctx.refs || {};
    ctx.addBeaker('cell', 0, .4, { r: 1.25, h: 2.4 });
    const zn = makeStrip(0x8d979e);
    zn.position.set(-.7, .15, .4); zn.rotation.z = .18;
    ctx.add(zn);
    const cu = makeStrip(0xc26a3a);
    cu.position.set(.7, .15, .4); cu.rotation.z = -.18;
    ctx.add(cu);
    ctx.placard('Zn', -1.3, 2.2, .5);
    ctx.placard('Cu', 1.3, 2.2, .5);
    // dây nối + đèn (ẩn)
    const wireGrp = new THREE.Group();
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.12, 2.6, .4), new THREE.Vector3(0, 3.9, .4), new THREE.Vector3(1.12, 2.6, .4));
    const w = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .045, 8), MAT.plastic(0xc03030));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x554422, emissive: 0x000000 }));
    bulb.position.set(0, 3.9, .4);
    wireGrp.add(w, bulb);
    wireGrp.visible = false;
    ctx.add(wireGrp);
    ctx.refs.wire = wireGrp;
    ctx.refs.bulb = bulb;
    // công tắc
    const sw = new THREE.Group();
    const swBody = new THREE.Mesh(new THREE.BoxGeometry(1.1, .5, .8), MAT.plastic(0x37474f));
    swBody.position.y = .25;
    const lever = new THREE.Mesh(new THREE.BoxGeometry(.14, .55, .14), MAT.plastic(0xd03a3a));
    lever.position.set(0, .6, 0); lever.rotation.z = .5;
    sw.add(swBody, lever);
    sw.position.set(4.2, 0, .8);
    sw.userData.h = .9;
    ctx.register('switch', sw, { clickable: true });
    ctx.placard('Công tắc nối dây Zn–Cu', 4.2, 1.5, 2.2);
    ctx.addBottle('h2so4', 'H₂SO₄ loãng', 0xeef2e0, { op: .5, cap: 0xc24a3a });
  },
  steps: [
    { text: 'Rót dung dịch H₂SO₄ loãng vào cốc chứa 2 thanh Zn, Cu.',
      action: { type: 'pour', src: 'h2so4', dst: 'cell' },
      pour: { level: .5, color: 0xdfe8e2, opacity: .5 } },
    { text: 'Quan sát: bọt khí H₂ chỉ thoát ra ở thanh Zn (ăn mòn hóa học).',
      action: { type: 'wait', dur: 3 },
      fx: async ctx => {
        ctx.refs.znBub = Effects.bubblesAt(App.scene, new THREE.Vector3(-.85, .4, .4), 1.15, { rate: 14, r: .12 });
      },
      eq: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑' },
    { text: 'Nhấp công tắc để nối thanh Zn với thanh Cu bằng dây dẫn.',
      action: { type: 'click', id: 'switch' },
      fx: async ctx => {
        ctx.refs.wire.visible = true;
        ctx.refs.bulb.material.emissive.setHex(0xffc830);
        ctx.refs.bulb.material.color.setHex(0xffe080);
        if (ctx.refs.znBub) ctx.refs.znBub.stop();
        Effects.bubblesAt(App.scene, new THREE.Vector3(.85, .4, .4), 1.15, { rate: 30, r: .12, dur: 8 });
        await wait(1.5);
      } },
    { text: 'Quan sát: đèn sáng, khí H₂ thoát ra mạnh ở thanh Cu!',
      action: { type: 'wait', dur: 3.5 },
      fx: async ctx => { Effects.sparkle(ctx.refs.wire, new THREE.Vector3(0, 3.9, .4), { dur: 1.5 }); } },
  ],
  done: {
    pheno: 'Trước khi nối dây: khí thoát ra <b>trên thanh Zn</b>. Sau khi nối: <b>đèn sáng</b> (có dòng điện) và khí H₂ thoát ra chủ yếu <b>trên thanh Cu</b> — Zn bị ăn mòn nhanh hơn.',
    eqs: ['Cực âm (Zn): Zn → Zn²⁺ + 2e', 'Cực dương (Cu): 2H⁺ + 2e → H₂↑'],
    note: 'Đã hình thành pin điện hóa Zn–Cu: Zn là cực âm bị ăn mòn điện hóa. Đây là nguyên tắc bảo vệ kim loại bằng phương pháp điện hóa (gắn Zn vào vỏ tàu biển bằng thép).',
  },
},

/* ========== 14. THÍ NGHIỆM BẮN PHÁ LÁ VÀNG (HÓA 10) ========== */
{
  id: 'rutherford', icon: '⚛️', group: 'Hóa học 10 — Cấu tạo nguyên tử',
  title: 'Thí nghiệm bắn phá lá vàng (Rutherford, 1911)',
  desc: 'Bắn chùm hạt α xuyên qua lá vàng siêu mỏng và quan sát chớp sáng trên màn huỳnh quang — thí nghiệm lịch sử khám phá ra hạt nhân nguyên tử.',
  tools: ['Nguồn phóng xạ α (radium) đặt trong hộp chì có khe chuẩn trực',
          'Lá vàng (Au) siêu mỏng, dày ~10⁻⁴ mm',
          'Màn huỳnh quang ZnS hình cung bao quanh',
          'Kính hiển vi quan sát & bảng đếm chớp sáng'],
  setup(ctx) {
    ctx.refs = ctx.refs || {};
    /* màn huỳnh quang hình cung (hở phía nguồn) */
    const R = 3.1, sh = 2.3;
    const gapA = THREE.MathUtils.degToRad(42);
    const start = Math.PI * 1.5 + gapA / 2, len = Math.PI * 2 - gapA;
    const scr = new THREE.Mesh(new THREE.CylinderGeometry(R, R, sh, 72, 1, true, start, len),
      new THREE.MeshPhysicalMaterial({ color: 0xb9f0cc, transparent: true, opacity: .15, roughness: .25, side: THREE.DoubleSide, depthWrite: false }));
    scr.position.set(0, 2.0, .4); scr.renderOrder = 2;
    ctx.add(scr);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x55606a, metalness: .5, roughness: .45, side: THREE.DoubleSide });
    for (const ry of [2.0 - sh / 2, 2.0 + sh / 2]) {
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(R + .04, R + .04, .09, 72, 1, true, start, len), rimMat);
      rim.position.set(0, ry, .4);
      ctx.add(rim);
    }
    for (const a of [90, 210, 330]) {
      const th = THREE.MathUtils.degToRad(a);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .85, 8), rimMat);
      leg.position.set(Math.sin(th) * R, .43, Math.cos(th) * R + .4);
      ctx.add(leg);
    }
    ctx.placard('Màn huỳnh quang ZnS', 0, 4.1, 2.3);
    /* giá đỡ lá vàng ở tâm */
    const holder = new THREE.Group();
    const hm = MAT.metal(0x6a727c);
    const hBase = new THREE.Mesh(new THREE.CylinderGeometry(.5, .62, .16, 18), hm);
    hBase.position.y = .08;
    const hCol = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.1, 10), hm);
    hCol.position.y = .7;
    const hTop = new THREE.Mesh(new THREE.BoxGeometry(.1, .08, 1.1), hm);
    hTop.position.y = 2.78;
    for (const hz of [-.55, .55]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.6, .08), hm);
      bar.position.set(0, 2.0, hz);
      holder.add(bar);
    }
    holder.add(hBase, hCol, hTop);
    holder.position.set(0, 0, .4);
    ctx.register('holder', holder, {});
    ctx.addTarget('holder', holder, new THREE.Vector3(0, 2.0, 0), .3);
    /* nguồn phóng xạ alpha trong hộp chì */
    const src = new THREE.Group();
    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 1.7), MAT.plastic(0x32465a));
    ped.position.y = .6;
    const lead = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), MAT.metal(0x4d565e));
    lead.position.y = 1.95; lead.castShadow = true;
    const colli = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, 1.0, 14), MAT.metal(0x7d8893));
    colli.rotation.z = Math.PI / 2;
    colli.position.set(1.1, 2.0, 0);
    const hatch = new THREE.Mesh(new THREE.BoxGeometry(.1, .56, .56), MAT.plastic(0xc24a3a));
    hatch.position.set(1.66, 2.0, 0);
    const srcLbl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .65),
      new THREE.MeshBasicMaterial({ map: textTexture('☢ Nguồn α\n(radium)', { fs: 34, bd: '#d6a92a' }), transparent: true }));
    srcLbl.position.set(0, 1.95, .77);
    src.add(ped, lead, colli, hatch, srcLbl);
    src.position.set(-5.3, 0, .4);
    src.userData.h = 3.0;
    ctx.register('source', src, { clickable: true });
    ctx.refs.hatch = hatch;
    ctx.placard('Nguồn phóng xạ α — nhấp để mở khe', -5.3, 2.0, 2.6);
    /* kính hiển vi quan sát */
    const mic = new THREE.Group();
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, .16, .8), MAT.plastic(0x2b3a4e));
    mBase.position.y = .08;
    const mCol = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.5, 10), MAT.metal(0x8a929c));
    mCol.position.set(.2, .9, 0); mCol.rotation.z = -.25;
    const mTube = new THREE.Mesh(new THREE.CylinderGeometry(.13, .17, 1.1, 14), MAT.metal(0x37474f));
    mTube.position.set(-.15, 1.55, 0); mTube.rotation.z = .85;
    const mEye = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .22, 12), MAT.metal(0xb8a44a));
    mEye.position.set(.3, 1.95, 0); mEye.rotation.z = .85;
    mic.add(mBase, mCol, mTube, mEye);
    mic.position.set(5.1, 0, 2.3);
    mic.rotation.y = .9;
    mic.userData.h = 2.3;
    ctx.register('scope', mic, { clickable: true });
    ctx.placard('Kính hiển vi quan sát', 5.1, 3.7, 2.2);
    /* bảng đếm + lá vàng trên đĩa */
    ctx.refs.counter = makeAlphaCounter(ctx, 5.9, -1.6, -.35);
    const foil = makeGoldFoil();
    ctx.refs.foil = foil;
    ctx.addDishItem('foil', foil, -2.3, 2.9, 'Lá vàng (Au) siêu mỏng');
  },
  steps: [
    { text: 'Kéo lá vàng siêu mỏng (dày ~10⁻⁴ mm ≈ 1000 lớp nguyên tử) gắn vào giá đỡ ở tâm màn.',
      action: { type: 'drop', src: 'foil', dst: 'holder' },
      drop: { local: { x: 0, y: 1.25, z: 0 } } },
    { text: 'Nhấp vào nguồn phóng xạ để mở khe chắn, bắn chùm hạt α về phía lá vàng.',
      action: { type: 'click', id: 'source' },
      fx: async ctx => {
        await tweenP(ctx.refs.hatch.position, { y: 2.62 }, .5);
        ctx.refs.beam = alphaBeam(ctx, ctx.refs.counter);
        await wait(3.2);
      },
      eq: 'Hạt α = hạt nhân helium (⁴₂He²⁺), mang điện tích dương, bay với tốc độ rất lớn' },
    { text: 'Quan sát màn huỳnh quang: hầu hết hạt α đi thẳng xuyên qua lá vàng!',
      action: { type: 'wait', dur: 4.5 },
      eq: 'Hầu hết hạt α xuyên thẳng qua lá vàng → nguyên tử có cấu tạo RỖNG' },
    { text: 'Quan sát kỹ: một số ít hạt bị lệch hướng, cá biệt có hạt bật ngược trở lại!',
      action: { type: 'wait', dur: .5 },
      fx: async ctx => {
        const b = ctx.refs.beam;
        for (const f of ['small', 'big', 'small', 'back', 'big', 'small', 'back', 'big', 'small', 'back']) {
          b.spawn(f);
          await wait(.45);
        }
        await wait(1.4);
      },
      eq: 'Khoảng 1/8000 hạt α bị bật ngược → trong nguyên tử có HẠT NHÂN (+) rất nhỏ, rất nặng' },
    { text: 'Nhấp vào kính hiển vi để phóng to, xem điều gì xảy ra bên trong lá vàng.',
      action: { type: 'click', id: 'scope' },
      fx: async ctx => {
        ctx.refs.beam.stop();
        const model = buildAtomModel();
        model.position.set(0, 5.1, .9);
        model.scale.setScalar(.01);
        ctx.add(model);
        Effects.sparkle(model, new THREE.Vector3(0, 0, 0), { dur: 2, rate: 9 });
        await tweenP(model.scale, { x: 1, y: 1, z: 1 }, .9, { ease: 'backOut' });
        await wait(2.2);
      },
      eq: 'Mô hình Rutherford: hạt nhân (+) ở tâm, các electron (–) chuyển động xung quanh' },
    { text: 'Quan sát mô hình: hạt α chỉ bật ngược khi va đúng hạt nhân bé xíu ở tâm — nguyên tử chủ yếu là khoảng trống!',
      action: { type: 'wait', dur: 4.5 } },
  ],
  done: {
    pheno: 'Hầu hết hạt α <b>đi thẳng</b> xuyên qua lá vàng; <b>một số ít bị lệch hướng</b> và khoảng <b>1/8000 hạt bật ngược trở lại</b> — quan sát được nhờ chớp sáng trên màn huỳnh quang ZnS.',
    eqs: ['Hạt α đi thẳng → nguyên tử có cấu tạo rỗng',
          'Hạt α lệch hướng / bật ngược → hạt nhân mang điện (+), kích thước rất nhỏ, chứa hầu hết khối lượng nguyên tử'],
    note: 'Thí nghiệm Rutherford (1911) bác bỏ mô hình "bánh mì nho khô" của Thomson và khai sinh mô hình nguyên tử có hạt nhân: đường kính hạt nhân chỉ bằng ~1/10 000 đường kính nguyên tử (nếu nguyên tử to bằng sân vận động thì hạt nhân chỉ như hòn bi ở giữa sân).',
  },
},
];
