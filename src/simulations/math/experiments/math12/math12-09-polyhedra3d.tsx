import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../../types';

function buildPrism(n: number, R: number, h: number): THREE.BufferGeometry {
  const verts: number[] = []; const indices: number[] = [];
  const angleStep = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const a = i * angleStep;
    verts.push(R * Math.cos(a), 0,   R * Math.sin(a));
    verts.push(R * Math.cos(a), h, R * Math.sin(a));
  }
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    indices.push(i*2, j*2, j*2+1, i*2, j*2+1, i*2+1);
  }
  // top & bottom caps
  const bot = verts.length / 3; verts.push(0, 0, 0);
  const top = verts.length / 3; verts.push(0, h, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    indices.push(bot, j*2, i*2);
    indices.push(top, i*2+1, j*2+1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildPyramid(n: number, R: number, h: number): THREE.BufferGeometry {
  const verts: number[] = []; const indices: number[] = [];
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    verts.push(R * Math.cos(a), 0, R * Math.sin(a));
  }
  const apex = verts.length / 3; verts.push(0, h, 0);
  const ctr  = verts.length / 3; verts.push(0, 0, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    indices.push(i, j, apex);
    indices.push(ctr, j, i);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildFrustum(n: number, R: number, r: number, h: number): THREE.BufferGeometry {
  const verts: number[] = []; const indices: number[] = [];
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    verts.push(R * Math.cos(a), 0, R * Math.sin(a));
    verts.push(r * Math.cos(a), h, r * Math.sin(a));
  }
  const bot = verts.length / 3; verts.push(0, 0, 0);
  const top = verts.length / 3; verts.push(0, h, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    indices.push(i*2, j*2, j*2+1, i*2, j*2+1, i*2+1);
    indices.push(bot, j*2, i*2);
    indices.push(top, i*2+1, j*2+1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export default function Polyhedra3DSim({ config }: SimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<{ pos: THREE.Vector3Tuple; target: THREE.Vector3Tuple } | null>(null);

  const type = Math.round(config.parameters?.find(p => p.key === 'type')?.value ?? 0); // 0=prism,1=pyramid,2=frustum
  const n    = Math.max(3, Math.round(config.parameters?.find(p => p.key === 'n')?.value ?? 4));
  const R    = Math.max(0.3, config.parameters?.find(p => p.key === 'R')?.value ?? 2);
  const H    = Math.max(0.3, config.parameters?.find(p => p.key === 'H')?.value ?? 3);
  const R2   = Math.max(0.01, config.parameters?.find(p => p.key === 'R2')?.value ?? 1);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const w = el.clientWidth  || 600;
    const h = el.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(6, 5, 8);
    camera.lookAt(0, H/2, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.1;
    if (cameraRef.current) {
      camera.position.set(...cameraRef.current.pos);
      controls.target.set(...cameraRef.current.target);
      controls.update();
    }

    scene.add(new THREE.AmbientLight(0x334155, 3));
    const dl = new THREE.DirectionalLight(0xffffff, 1.5);
    dl.position.set(5, 8, 5);
    scene.add(dl);

    // Axes
    const axPts = [0,0,0,4,0,0, 0,0,0,0,4,0, 0,0,0,0,0,4];
    const axCol = [1,0,0,1,0,0, 0,1,0,0,1,0, 0,0,1,0,0,1];
    const axG = new THREE.BufferGeometry();
    axG.setAttribute('position', new THREE.Float32BufferAttribute(axPts, 3));
    axG.setAttribute('color',    new THREE.Float32BufferAttribute(axCol, 3));
    scene.add(new THREE.LineSegments(axG, new THREE.LineBasicMaterial({ vertexColors: true })));

    let geo: THREE.BufferGeometry;
    let V = 0;
    const Sbase = n * R * R * Math.sin(2 * Math.PI / n) / 2;

    if (type === 0) {
      geo = buildPrism(n, R, H);
      V = Sbase * H;
    } else if (type === 1) {
      geo = buildPyramid(n, R, H);
      V = Sbase * H / 3;
    } else {
      const Sbase2 = n * R2 * R2 * Math.sin(2 * Math.PI / n) / 2;
      geo = buildFrustum(n, R, R2, H);
      V = H / 3 * (Sbase + Sbase2 + Math.sqrt(Sbase * Sbase2));
    }

    const mat = new THREE.MeshPhongMaterial({
      color: 0xa78bfa, opacity: 0.78, transparent: true,
      side: THREE.DoubleSide, shininess: 50,
    });
    const wire = new THREE.MeshBasicMaterial({ color: 0xc4b5fd, wireframe: true, opacity: 0.25, transparent: true });
    scene.add(new THREE.Mesh(geo, mat));
    scene.add(new THREE.Mesh(geo, wire));

    // Stats canvas
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 360; canvas2d.height = 200;
    const ctx = canvas2d.getContext('2d')!;
    ctx.fillStyle = 'rgba(9,13,22,0.85)';
    ctx.roundRect(0, 0, 360, 200, 10); ctx.fill();
    ctx.font = 'bold 14px monospace';
    const labels = ['Lăng trụ đều', 'Chóp đều', 'Chóp cụt đều'];
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(`${labels[type]} (n=${n})`, 10, 28);
    ctx.font = '13px monospace'; ctx.fillStyle = '#94a3b8';
    ctx.fillText(`R=${R.toFixed(2)}  H=${H.toFixed(2)}${type===2?`  r=${R2.toFixed(2)}`:''}`, 10, 56);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`V ≈ ${V.toFixed(3)}`, 10, 86);
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`S_đáy ≈ ${Sbase.toFixed(3)}`, 10, 116);
    ctx.fillStyle = '#64748b'; ctx.font = '11px monospace';
    const fmls = [
      'V = S_đáy · h', 'V = 1/3 · S_đáy · h', 'V = h/3(S₁+S₂+√(S₁S₂))',
    ];
    ctx.fillText(fmls[type], 10, 148);

    const tex = new THREE.CanvasTexture(canvas2d);
    const sp = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    sp.position.set(-5, 3.5, 0);
    scene.add(sp);

    let reqId = 0;
    const animate = () => { reqId = requestAnimationFrame(animate); controls.update(); sp.quaternion.copy(camera.quaternion); renderer.render(scene, camera); };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cameraRef.current = { pos: camera.position.toArray() as THREE.Vector3Tuple, target: controls.target.toArray() as THREE.Vector3Tuple };
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [type, n, R, H, R2]);

  return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}
