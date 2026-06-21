/* global THREE, App, tween, tweenP, wait, glowTexture, setLevel, pourInto */
/* ============================================================
   EFFECTS — hiệu ứng phản ứng hóa học
   ============================================================ */

const Effects = {};

(function () {
  let _glowTex = null, _smokeTex = null;
  function glowTex() { if (!_glowTex) _glowTex = glowTexture('rgba(255,235,180,1)', 'rgba(255,160,40,0)'); return _glowTex; }
  function smokeTex() { if (!_smokeTex) _smokeTex = glowTexture('rgba(240,240,245,0.85)', 'rgba(240,240,245,0)'); return _smokeTex; }

  const bubbleGeo = new THREE.SphereGeometry(1, 8, 6);

  /* ---------- Bọt khí trong bình chứa ---------- */
  Effects.bubbles = function (container, opts = {}) {
    const liq = container.userData.liq;
    if (!liq) return { stop() {} };
    const o = {
      dur: opts.dur != null ? opts.dur : 2.5,
      rate: opts.rate || 16,
      r: opts.r || .05,
      color: opts.color != null ? opts.color : 0xffffff,
      speed: opts.speed || 1.3,
      at: opts.at || null, // {x,z,r} vùng sinh bọt cục bộ
    };
    const grp = new THREE.Group();
    container.add(grp);
    const mat = new THREE.MeshBasicMaterial({ color: o.color, transparent: true, opacity: .75 });
    const parts = [];
    let t = 0, acc = 0, stopped = false;
    const e = {
      update(dt) {
        t += dt;
        if (!stopped && t < o.dur) {
          acc += dt * o.rate;
          while (acc > 1) {
            acc--;
            if (liq.level > .02) {
              const m = new THREE.Mesh(bubbleGeo, mat);
              let px, pz;
              if (o.at) {
                px = o.at.x + (Math.random() - .5) * 2 * (o.at.r || .12);
                pz = o.at.z + (Math.random() - .5) * 2 * (o.at.r || .12);
              } else {
                const rr = Math.random() * liq.r * .72, a = Math.random() * 6.283;
                px = Math.cos(a) * rr; pz = Math.sin(a) * rr;
              }
              m.position.set(px, (o.at && o.at.y != null ? o.at.y : liq.y0 + .08) + Math.random() * .15, pz);
              m.scale.setScalar(o.r * (.5 + Math.random()));
              m.userData.v = o.speed * (.7 + Math.random() * .6);
              m.renderOrder = 2;
              grp.add(m); parts.push(m);
            }
          }
        }
        const top = liq.y0 + liq.level * liq.hMax;
        for (let i = parts.length - 1; i >= 0; i--) {
          const m = parts[i];
          m.position.y += m.userData.v * dt;
          m.position.x += Math.sin(t * 9 + i * 1.7) * .0025;
          if (m.position.y >= top || m.position.y < liq.y0 - .05) { grp.remove(m); parts.splice(i, 1); }
        }
        if ((stopped || t >= o.dur) && parts.length === 0) {
          if (grp.parent) grp.parent.remove(grp);
          return false;
        }
        return true;
      },
      stop() { stopped = true; },
    };
    App.emitters.push(e);
    return e;
  };

  /* ---------- Bọt khí tại 1 điểm thế giới (điện cực, thanh kim loại, viên Na) ---------- */
  Effects.bubblesAt = function (parent, getPos, topY, opts = {}) {
    const rate = opts.rate || 18, jr = opts.r || .12, speed = opts.speed || 1.4;
    const dur = opts.dur != null ? opts.dur : 1e9;
    const mat = new THREE.MeshBasicMaterial({ color: opts.color || 0xffffff, transparent: true, opacity: .8 });
    const grp = new THREE.Group();
    parent.add(grp);
    const parts = [];
    let t = 0, acc = 0, stopped = false;
    const e = {
      update(dt) {
        t += dt;
        if (!stopped && t < dur) {
          acc += dt * rate;
          while (acc > 1) {
            acc--;
            const p = (typeof getPos === 'function') ? getPos() : getPos;
            const m = new THREE.Mesh(bubbleGeo, mat);
            m.position.set(p.x + (Math.random() - .5) * 2 * jr, p.y, p.z + (Math.random() - .5) * 2 * jr);
            m.scale.setScalar(.035 + Math.random() * .05);
            m.userData.v = speed * (.7 + Math.random() * .6);
            m.renderOrder = 2;
            grp.add(m); parts.push(m);
          }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const m = parts[i];
          m.position.y += m.userData.v * dt;
          if (m.position.y >= topY) { grp.remove(m); parts.splice(i, 1); }
        }
        if ((stopped || t >= dur) && parts.length === 0) {
          if (grp.parent) grp.parent.remove(grp);
          return false;
        }
        return true;
      },
      stop() { stopped = true; },
    };
    App.emitters.push(e);
    return e;
  };

  /* ---------- Dòng chất lỏng / bột rơi khi rót ---------- */
  Effects.stream = function (getFrom, toY, opts = {}) {
    const dur = opts.dur || 1.1, rate = opts.rate || 42;
    const color = opts.color != null ? opts.color : 0x9fd0ff;
    const geo = opts.powder ? new THREE.BoxGeometry(.09, .09, .09) : new THREE.SphereGeometry(.06, 6, 5);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9 });
    const grp = new THREE.Group();
    App.scene.add(grp);
    const parts = [];
    let t = 0, acc = 0;
    App.emitters.push({
      update(dt) {
        t += dt;
        if (t < dur) {
          acc += dt * rate;
          while (acc > 1) {
            acc--;
            const f = getFrom();
            const m = new THREE.Mesh(geo, mat);
            m.position.copy(f);
            m.userData.vy = -.5;
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
        if (t >= dur && parts.length === 0) { App.scene.remove(grp); return false; }
        return true;
      },
    });
  };

  /* ---------- Hơi nước / khói ---------- */
  Effects.steam = function (parent, localPos, opts = {}) {
    const rate = opts.rate || 3, dur = opts.dur != null ? opts.dur : 3,
      size = opts.size || .55, rise = opts.rise || 1.1;
    const grp = new THREE.Group();
    grp.position.copy(localPos);
    parent.add(grp);
    const tex = opts.dark ? glowTexture('rgba(110,110,120,0.7)', 'rgba(110,110,120,0)') : smokeTex();
    const parts = [];
    let t = 0, acc = 0, stopped = false;
    const e = {
      update(dt) {
        t += dt;
        if (!stopped && t < dur) {
          acc += dt * rate;
          while (acc > 1) {
            acc--;
            const sm = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: .55, depthWrite: false });
            const s = new THREE.Sprite(sm);
            s.position.set((Math.random() - .5) * .3, 0, (Math.random() - .5) * .3);
            s.scale.setScalar(size * (.6 + Math.random() * .5));
            s.userData = { life: 0, max: 1.6 + Math.random() * .8, drift: (Math.random() - .5) * .25 };
            grp.add(s); parts.push(s);
          }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const s = parts[i];
          s.userData.life += dt;
          const k = s.userData.life / s.userData.max;
          s.position.y += rise * dt;
          s.position.x += s.userData.drift * dt;
          s.scale.setScalar(s.scale.x + dt * .55);
          s.material.opacity = .55 * (1 - k);
          if (k >= 1) { s.material.dispose(); grp.remove(s); parts.splice(i, 1); }
        }
        if ((stopped || t >= dur) && parts.length === 0) {
          if (grp.parent) grp.parent.remove(grp);
          return false;
        }
        return true;
      },
      stop() { stopped = true; },
    };
    App.emitters.push(e);
    return e;
  };

  Effects.smokePuff = function (worldPos, opts = {}) {
    const holder = new THREE.Group();
    holder.position.copy(worldPos);
    App.scene.add(holder);
    Effects.steam(holder, new THREE.Vector3(0, 0, 0), { rate: opts.rate || 9, dur: opts.dur || .9, size: opts.size || .7, dark: opts.dark });
    setTimeout(() => { if (holder.parent) App.scene.remove(holder); }, ((opts.dur || .9) + 3) * 1000);
  };

  /* ---------- Tia lửa (nhiệt nhôm, Mg cháy) ---------- */
  Effects.sparks = function (worldPos, opts = {}) {
    const count = opts.count || 90, life = opts.life || 1.1;
    const speed = opts.speed || 6.5, up = opts.up != null ? opts.up : .65;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = worldPos.x; pos[i * 3 + 1] = worldPos.y; pos[i * 3 + 2] = worldPos.z;
      const a = Math.random() * 6.283, b = Math.random() * Math.PI * up;
      const sp = speed * (.35 + Math.random() * .75);
      vel.push(new THREE.Vector3(Math.cos(a) * Math.sin(b) * sp, Math.cos(b) * sp, Math.sin(a) * Math.sin(b) * sp));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: opts.size || .22, map: glowTex(), transparent: true, opacity: 1,
      color: opts.color || 0xffc060, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    App.scene.add(pts);
    let t = 0;
    App.emitters.push({
      update(dt) {
        t += dt;
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vel[i].y -= 10 * dt;
          arr[i * 3] += vel[i].x * dt;
          arr[i * 3 + 1] += vel[i].y * dt;
          arr[i * 3 + 2] += vel[i].z * dt;
          if (arr[i * 3 + 1] < .05) { arr[i * 3 + 1] = .05; vel[i].y *= -.3; vel[i].x *= .7; vel[i].z *= .7; }
        }
        geo.attributes.position.needsUpdate = true;
        mat.opacity = Math.max(0, 1 - t / life);
        if (t >= life) { App.scene.remove(pts); geo.dispose(); mat.dispose(); return false; }
        return true;
      },
    });
  };

  /* ---------- Pháo hoa nhỏ liên tục (mồi Mg) ---------- */
  Effects.sparkler = function (parent, localPos, dur = 1.6) {
    const wp = parent.localToWorld(localPos.clone());
    let t = 0;
    App.emitters.push({
      update(dt) {
        t += dt;
        if (t < dur && Math.random() < .65) {
          Effects.sparks(wp, { count: 10, speed: 2.2, life: .45, size: .14, color: 0xffffff, up: 1 });
        }
        return t < dur;
      },
    });
  };

  /* ---------- Ánh sáng rực (lò phản ứng) ---------- */
  Effects.glowLight = function (worldPos, color = 0xff9020, intensity = 4, dist = 12) {
    const l = new THREE.PointLight(color, intensity, dist);
    l.position.copy(worldPos);
    App.scene.add(l);
    let t = 0;
    const e = {
      stopped: false,
      update(dt) {
        t += dt;
        if (!this.stopped) l.intensity = intensity * (1 + Math.sin(t * 20) * .25);
        else { l.intensity -= dt * 4; if (l.intensity <= 0) { App.scene.remove(l); return false; } }
        return true;
      },
      stop() { this.stopped = true; },
    };
    App.emitters.push(e);
    return e;
  };

  /* ---------- Chớp sáng toàn màn hình ---------- */
  Effects.flash = function (strength = .85) {
    const f = document.getElementById('flash');
    f.style.transition = 'none';
    f.style.opacity = strength;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      f.style.transition = 'opacity 1.1s ease';
      f.style.opacity = 0;
    }));
  };

  /* ---------- Kết tủa ---------- */
  Effects.precip = function (container, opts = {}) {
    const liq = container.userData.liq;
    if (!liq) return Promise.resolve();
    const color = opts.color != null ? opts.color : 0xffffff;
    liq.pile.visible = true;
    liq.pileMat.color.set(color);
    liq.pile.scale.set(.01, .01, .01);
    // hạt lơ lửng rơi xuống từ gần mặt thoáng
    const topLocal = liq.y0 + liq.level * liq.hMax - .12;
    Effects.bubbles(container, { dur: 1.6, rate: 22, r: .04, color, speed: -.55, at: { x: 0, z: 0, r: liq.r * .6, y: topLocal } });
    const pr = { t: 0 };
    const c0 = liq.mat.color.clone(), c1 = c0.clone().lerp(new THREE.Color(color), opts.tint != null ? opts.tint : .55);
    const o0 = liq.mat.opacity, o1 = opts.opacity != null ? opts.opacity : .9;
    return tweenP(pr, { t: 1 }, opts.dur || 1.6, {
      onUpdate: e => {
        liq.pile.scale.set(e, .3 * e + .01, e);
        liq.mat.color.copy(c0).lerp(c1, e);
        liq.mat.opacity = o0 + (o1 - o0) * e;
      },
    });
  };

  Effects.pileColor = function (container, color, dur = 2) {
    const liq = container.userData.liq;
    const c0 = liq.pileMat.color.clone(), c1 = new THREE.Color(color);
    const pr = { t: 0 };
    return tweenP(pr, { t: 1 }, dur, { onUpdate: e => liq.pileMat.color.copy(c0).lerp(c1, e) });
  };

  Effects.dissolvePile = function (container, opts = {}) {
    const liq = container.userData.liq;
    const pr = { t: 0 };
    const c0 = liq.mat.color.clone();
    const c1 = opts.color != null ? new THREE.Color(opts.color) : c0.clone();
    const o0 = liq.mat.opacity, o1 = opts.opacity != null ? opts.opacity : o0;
    const s0 = liq.pile.scale.x;
    return tweenP(pr, { t: 1 }, opts.dur || 1.2, {
      onUpdate: e => {
        const s = s0 * (1 - e);
        liq.pile.scale.set(Math.max(s, .01), Math.max(s * .3, .01), Math.max(s, .01));
        liq.mat.color.copy(c0).lerp(c1, e);
        liq.mat.opacity = o0 + (o1 - o0) * e;
      },
      onDone: () => { liq.pile.visible = false; },
    });
  };

  /* ---------- Đổi màu dung dịch ---------- */
  Effects.tint = function (container, opts) {
    const liq = container.userData.liq;
    if (!liq) return Promise.resolve();
    return pourInto(liq, opts);
  };

  /* ---------- Lớp chất lỏng/rắn nổi lên trên (este, xà phòng) ---------- */
  Effects.layer = function (container, opts = {}) {
    const liq = container.userData.liq;
    const top = liq.y0 + liq.level * liq.hMax;
    const mat = new THREE.MeshPhongMaterial({
      color: opts.color != null ? opts.color : 0xf7eeb5,
      transparent: true, opacity: 0, shininess: 70,
    });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(liq.r * .98, liq.r * .98, opts.h || .16, 20), mat);
    m.position.y = top + (opts.h || .16) / 2 - .02;
    m.renderOrder = 2;
    container.add(m);
    const pr = { t: 0 };
    return tweenP(pr, { t: 1 }, opts.dur || 1.4, {
      onUpdate: e => { mat.opacity = (opts.opacity != null ? opts.opacity : .88) * e; },
    });
  };

  /* ---------- Tráng gương ---------- */
  Effects.mirror = function (tube, dur = 3) {
    const mir = tube.userData.mirror;
    if (!mir) return Promise.resolve();
    mir.visible = true;
    const pr = { t: 0 };
    return tweenP(pr, { t: 1 }, dur, {
      onUpdate: e => { mir.material.opacity = e * .96; },
    });
  };

  /* ---------- Lấp lánh (mùi thơm, thành công) ---------- */
  Effects.sparkle = function (parent, localPos, opts = {}) {
    const grp = new THREE.Group();
    grp.position.copy(localPos);
    parent.add(grp);
    const tex = glowTexture('rgba(255,250,200,1)', 'rgba(255,220,120,0)');
    const dur = opts.dur || 2.2;
    const parts = [];
    let t = 0, acc = 0;
    App.emitters.push({
      update(dt) {
        t += dt;
        if (t < dur) {
          acc += dt * (opts.rate || 7);
          while (acc > 1) {
            acc--;
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
            s.position.set((Math.random() - .5) * 1.1, Math.random() * .4, (Math.random() - .5) * 1.1);
            s.scale.setScalar(.12 + Math.random() * .2);
            s.userData = { life: 0, max: .8 + Math.random() * .6 };
            grp.add(s); parts.push(s);
          }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const s = parts[i];
          s.userData.life += dt;
          const k = s.userData.life / s.userData.max;
          s.position.y += dt * .8;
          s.material.opacity = 1 - k;
          if (k >= 1) { s.material.dispose(); grp.remove(s); parts.splice(i, 1); }
        }
        if (t >= dur && parts.length === 0) { if (grp.parent) grp.parent.remove(grp); return false; }
        return true;
      },
    });
  };

  /* ---------- Đun sôi ---------- */
  Effects.boil = function (container, dur = 3) {
    Effects.bubbles(container, { dur, rate: 26, r: .05, speed: 1.6 });
    const liq = container.userData.liq;
    const top = liq ? liq.y0 + liq.level * liq.hMax : 2;
    Effects.steam(container, new THREE.Vector3(0, (container.userData.h || top) + .15, 0), { dur, rate: 3.5, size: .42 });
    return wait(dur);
  };

  /* ---------- Lớp phủ kim loại (mạ đồng, bám bạc) ---------- */
  Effects.fadeInMesh = function (mesh, dur = 3, finalOp = 1) {
    mesh.visible = true;
    mesh.material.transparent = true;
    mesh.material.opacity = 0;
    const pr = { t: 0 };
    return tweenP(pr, { t: 1 }, dur, { onUpdate: e => { mesh.material.opacity = finalOp * e; } });
  };

  /* ---------- Natri nhảy múa trên mặt nước ---------- */
  Effects.naDance = async function (ball, basin, opts = {}) {
    const dur = opts.dur || 5;
    const center = basin.getWorldPosition(new THREE.Vector3());
    const liq = basin.userData.liq;
    const surfaceY = center.y + liq.y0 + liq.level * liq.hMax + .06;
    App.scene.attach(ball);
    ball.position.set(center.x, surfaceY, center.z);
    // lửa vàng nhỏ trên viên Na
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(.16, .45, 10),
      new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    flame.position.y = .35;
    ball.add(flame);
    const fizz = Effects.bubblesAt(App.scene, () => ball.position.clone(), surfaceY + .5, { rate: 30, r: .2, speed: 2 });
    const steamH = Effects.steam(ball, new THREE.Vector3(0, .2, 0), { dur: 1e9, rate: 5, size: .35, rise: 1.4 });
    const pr = { t: 0 };
    let flick = 0;
    await tweenP(pr, { t: 1 }, dur, {
      ease: 'linear',
      onUpdate: e => {
        const ang = e * Math.PI * 7;
        const rad = (1.5 - e * 1.1) * (0.85 + Math.sin(e * 31) * .12);
        ball.position.set(center.x + Math.cos(ang) * rad, surfaceY, center.z + Math.sin(ang) * rad);
        ball.scale.setScalar(Math.max(.08, 1 - e * .95));
        flick += .35;
        flame.scale.setScalar(1 + Math.sin(flick) * .3);
      },
    });
    fizz.stop(); steamH.stop();
    Effects.smokePuff(ball.position.clone(), { rate: 8, dur: .6, size: .5 });
    ball.visible = false;
  };

  /* ---------- Phản ứng nhiệt nhôm trọn gói ---------- */
  Effects.thermite = async function (crucible, trayPos) {
    const p = crucible.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 1.15, 0));
    Effects.flash(.9);
    const glow = Effects.glowLight(p, 0xffa030, 5, 14);
    Effects.steam(App.scene, p.clone().add(new THREE.Vector3(0, .4, 0)), { dur: 4, rate: 6, size: .8, dark: true });
    for (let i = 0; i < 11; i++) {
      Effects.sparks(p, { count: 70, speed: 7, life: 1.1, color: i % 3 ? 0xffc060 : 0xfff0c0 });
      if (i === 4) Effects.flash(.5);
      await wait(.27);
    }
    // sắt nóng chảy nhỏ giọt xuống khay cát
    Effects.stream(() => p.clone().add(new THREE.Vector3((Math.random() - .5) * .2, -.6, 0)), trayPos.y + .15,
      { color: 0xff7020, dur: 1.6, rate: 16 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0xff6a20, emissive: 0xff3300, emissiveIntensity: 1.2, roughness: .6 });
    const iron = new THREE.Mesh(new THREE.SphereGeometry(.34, 14, 10), ironMat);
    iron.position.copy(trayPos).add(new THREE.Vector3(0, .25, 0));
    iron.scale.y = .6;
    App.scene.add(iron);
    await wait(1.6);
    glow.stop();
    // nguội dần
    const pr = { t: 0 };
    await tweenP(pr, { t: 1 }, 2.5, {
      onUpdate: e => {
        ironMat.emissiveIntensity = 1.2 * (1 - e);
        ironMat.color.lerpColors(new THREE.Color(0xff6a20), new THREE.Color(0x6d6f73), e);
      },
    });
    return iron;
  };
})();
