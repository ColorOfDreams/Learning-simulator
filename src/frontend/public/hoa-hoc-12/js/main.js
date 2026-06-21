/* global THREE, App, EXPERIMENTS, MAT, cacheUI, UI, bindInput, loadExperiment,
   backToMenu, reloadExp, showModal, hideModal, updateTweens, textTexture, glowTexture, resetCamera, Snd */
/* ============================================================
   MAIN — phòng lab 3D, menu, vòng lặp
   ============================================================ */

/* ---------- Texture nền ---------- */
function floorTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++) {
      g.fillStyle = (x + y) % 2 ? '#26394d' : '#2e455d';
      g.fillRect(x * 64, y * 64, 64, 64);
    }
  g.strokeStyle = 'rgba(140,180,220,.18)'; g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) {
    g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.stroke();
    g.beginPath(); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(9, 7);
  return t;
}

function posterTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 360;
  const g = c.getContext('2d');
  g.fillStyle = '#f4f1e6'; g.fillRect(0, 0, 512, 360);
  g.fillStyle = '#26394d'; g.font = 'bold 34px "Be Vietnam Pro", sans-serif';
  g.textAlign = 'center';
  g.fillText('BẢNG TUẦN HOÀN', 256, 48);
  const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e84393'];
  let i = 0;
  for (let r = 0; r < 5; r++)
    for (let col = 0; col < 11; col++) {
      if (r < 2 && col > 1 && col < 9) continue;
      g.fillStyle = colors[(r * 3 + col) % colors.length];
      g.fillRect(28 + col * 42, 78 + r * 52, 36, 44);
      i++;
    }
  return new THREE.CanvasTexture(c);
}

function bannerTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 1024, 0);
  grd.addColorStop(0, '#2563ab'); grd.addColorStop(.5, '#7c3aed'); grd.addColorStop(1, '#2563ab');
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 128);
  g.fillStyle = '#fff'; g.font = 'bold 58px "Be Vietnam Pro", sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('⚗ PHÒNG THÍ NGHIỆM HÓA HỌC 12 ⚗', 512, 66);
  return new THREE.CanvasTexture(c);
}

/* ---------- Bình trang trí ---------- */
function decorFlask(color, x, z, s = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(.85 * s, 1.9 * s, 20),
    new THREE.MeshPhysicalMaterial({ color: 0xe8f4fa, transparent: true, opacity: .25, roughness: .05, side: THREE.DoubleSide, depthWrite: false }));
  body.position.y = .95 * s; body.renderOrder = 3;
  const liq = new THREE.Mesh(new THREE.ConeGeometry(.74 * s, .85 * s, 20),
    new THREE.MeshPhongMaterial({ color, transparent: true, opacity: .85, shininess: 90 }));
  liq.position.y = .46 * s; liq.renderOrder = 1;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.16 * s, .16 * s, .8 * s, 12),
    body.material);
  neck.position.y = 2.2 * s; neck.renderOrder = 3;
  g.add(body, liq, neck);
  g.position.set(x, 0, z);
  return g;
}

/* ---------- Dựng phòng ---------- */
function buildRoom() {
  const sc = App.scene;
  sc.background = new THREE.Color(0x0e1a2a);
  sc.fog = new THREE.Fog(0x0e1a2a, 34, 75);

  // ánh sáng
  const hemi = new THREE.HemisphereLight(0xdcecff, 0x33414f, .85);
  sc.add(hemi);
  const dir = new THREE.DirectionalLight(0xfff2dd, .95);
  dir.position.set(9, 17, 9);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  dir.shadow.camera.left = -16; dir.shadow.camera.right = 16;
  dir.shadow.camera.top = 16; dir.shadow.camera.bottom = -16;
  sc.add(dir);
  const accent = new THREE.PointLight(0x6db4ff, .5, 40);
  accent.position.set(-10, 9, 4);
  sc.add(accent);

  // sàn
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(95, 70),
    new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: .85 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -7.4;
  floor.receiveShadow = true;
  sc.add(floor);

  // tường sau
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(95, 30),
    new THREE.MeshStandardMaterial({ color: 0x3a5066, roughness: .95 }));
  wall.position.set(0, 7.5, -13.5);
  sc.add(wall);
  // cửa sổ phát sáng
  for (const wx of [-13, 0, 13]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 4.6),
      new THREE.MeshBasicMaterial({ color: 0xaed6f5 }));
    win.position.set(wx, 8.6, -13.4);
    sc.add(win);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.2),
      new THREE.MeshStandardMaterial({ color: 0xeef2f5 }));
    frame.position.set(wx, 8.6, -13.45);
    sc.add(frame);
  }
  // băng rôn + poster
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(20, 2.4),
    new THREE.MeshBasicMaterial({ map: bannerTexture(), transparent: true }));
  banner.position.set(0, 13.2, -13.3);
  sc.add(banner);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 5),
    new THREE.MeshBasicMaterial({ map: posterTexture() }));
  poster.position.set(-20, 7.8, -13.35);
  sc.add(poster);

  // bàn thí nghiệm (mặt bàn = y 0)
  const top = new THREE.Mesh(new THREE.BoxGeometry(27, .6, 9.4),
    new THREE.MeshStandardMaterial({ color: 0x223844, roughness: .5, metalness: .1 }));
  top.position.y = -.3;
  top.receiveShadow = true;
  sc.add(top);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(25.8, 6.6, 8.6),
    new THREE.MeshStandardMaterial({ color: 0x3d6b75, roughness: .8 }));
  cab.position.y = -3.95;
  sc.add(cab);
  // tay nắm tủ
  for (let i = -4; i <= 4; i += 2) {
    const knob = new THREE.Mesh(new THREE.BoxGeometry(.7, .12, .12), MAT.metal(0xc9d2da));
    knob.position.set(i * 2.6, -2.4, 4.32);
    sc.add(knob);
  }

  // kệ hóa chất
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(21, .28, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x9a6a3a, roughness: .7 }));
  shelf.position.set(0, 3.86, -3.05);
  shelf.receiveShadow = true;
  sc.add(shelf);
  for (const sx of [-10.2, 10.2]) {
    const sup = new THREE.Mesh(new THREE.BoxGeometry(.3, 3.9, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x82552c, roughness: .7 }));
    sup.position.set(sx, 1.95, -3.05);
    sc.add(sup);
  }
  const shelfLbl = new THREE.Mesh(new THREE.PlaneGeometry(4.6, .85),
    new THREE.MeshBasicMaterial({ map: textTexture('KỆ HÓA CHẤT', { fs: 40, bd: '#b07a3a' }), transparent: true }));
  shelfLbl.position.set(0, 5.6, -3.4);
  sc.add(shelfLbl);

  // bình trang trí 2 góc bàn
  sc.add(decorFlask(0x44d0a0, -11.6, -2.6, 1.1));
  sc.add(decorFlask(0xe06aa8, 11.8, -2.7, .9));
  sc.add(decorFlask(0xf3c34f, 12.6, -1.5, .65));
}

/* ---------- Menu ---------- */
function buildMenu() {
  const groups = [];
  EXPERIMENTS.forEach(e => { if (!groups.includes(e.group)) groups.push(e.group); });
  let html = '';
  groups.forEach(gr => {
    html += `<div class="group-title">${gr}</div><div class="cards">`;
    EXPERIMENTS.forEach((e, i) => {
      if (e.group !== gr) return;
      html += `
        <div class="card" data-i="${i}">
          <div class="icon">${e.icon}</div>
          <h3>${e.title}</h3>
          <p>${e.desc}</p>
          <div class="meta">
            <span class="badge">🧪 ${e.steps.length} bước</span>
            <span class="go">Bắt đầu →</span>
          </div>
        </div>`;
    });
    html += '</div>';
  });
  UI.grid.innerHTML = html;
  UI.grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      Snd.init();
      loadExperiment(EXPERIMENTS[+card.dataset.i]);
    });
  });
}

/* ---------- Khởi tạo ---------- */
function init() {
  cacheUI();

  App.scene = new THREE.Scene();
  App.camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, .1, 200);
  App.camera.position.set(0, 7, 14);

  App.renderer = new THREE.WebGLRenderer({ antialias: true });
  App.renderer.setSize(innerWidth, innerHeight);
  App.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  App.renderer.shadowMap.enabled = true;
  App.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  App.renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(App.renderer.domElement);

  App.controls = new THREE.OrbitControls(App.camera, App.renderer.domElement);
  App.controls.enableDamping = true;
  App.controls.dampingFactor = .07;
  App.controls.target.set(0, 2, 0);
  App.controls.minDistance = 5.5;
  App.controls.maxDistance = 26;
  App.controls.maxPolarAngle = 1.5;
  App.controls.minPolarAngle = .2;

  bindInput();
  buildRoom();
  buildMenu();

  document.getElementById('btn-back').addEventListener('click', backToMenu);
  document.getElementById('btn-reset').addEventListener('click', () => { if (App.exp) loadExperiment(App.exp); });
  document.getElementById('btn-help').addEventListener('click', () => {
    showModal(`
      <div class="m-icon">🎮</div>
      <h2>Hướng dẫn thao tác</h2>
      <div class="m-section m-desc">
        🫗 <b>Đổ hóa chất:</b> kéo chai từ kệ thả vào ống nghiệm/cốc (vòng sáng xanh).<br><br>
        👆 <b>Nhấp:</b> đèn cồn, công tắc, ống nghiệm (để lắc)... theo gợi ý mũi tên vàng.<br><br>
        🔄 <b>Xoay nhìn:</b> kéo chuột vùng trống · <b>Zoom:</b> lăn chuột.<br><br>
        📋 Làm đúng thứ tự các bước ở bảng bên trái — sai bước sẽ có cảnh báo!
      </div>
      <div class="m-btns"><button class="btn-primary" onclick="hideModal()">Đã hiểu!</button></div>
    `);
  });

  addEventListener('resize', () => {
    App.camera.aspect = innerWidth / innerHeight;
    App.camera.updateProjectionMatrix();
    App.renderer.setSize(innerWidth, innerHeight);
  });

  animate();
}

/* ---------- Vòng lặp ---------- */
const _clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(_clock.getDelta(), .05);

  updateTweens(dt);
  for (let i = App.emitters.length - 1; i >= 0; i--) {
    if (App.emitters[i].update(dt) === false) App.emitters.splice(i, 1);
  }
  for (let i = App.updatables.length - 1; i >= 0; i--) {
    if (App.updatables[i](dt) === false) App.updatables.splice(i, 1);
  }

  if (App.menuMode) {
    App.menuAngle += dt * .07;
    App.camera.position.set(Math.sin(App.menuAngle) * 17, 8, Math.cos(App.menuAngle) * 17);
    App.camera.lookAt(0, 2.5, 0);
  } else {
    App.controls.update();
  }

  App.renderer.render(App.scene, App.camera);
}

init();
