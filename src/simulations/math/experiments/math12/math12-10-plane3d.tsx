import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../../types';

export default function Plane3DSim({ config }: SimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<{ pos: THREE.Vector3Tuple; target: THREE.Vector3Tuple } | null>(null);

  const nx = config.parameters?.find(p => p.key === 'nx')?.value ?? 1;
  const ny = config.parameters?.find(p => p.key === 'ny')?.value ?? 1;
  const nz = config.parameters?.find(p => p.key === 'nz')?.value ?? 1;
  const d  = config.parameters?.find(p => p.key === 'd')?.value  ?? 0;

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
    camera.position.set(7, 5, 9);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.1;
    if (cameraRef.current) {
      camera.position.set(...cameraRef.current.pos);
      controls.target.set(...cameraRef.current.target);
      controls.update();
    }

    scene.add(new THREE.AmbientLight(0x334155, 3));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 8, 5);
    scene.add(dl);

    // Axes
    const axPts = [0,0,0,3,0,0, 0,0,0,0,3,0, 0,0,0,0,0,3];
    const axCol = [1,0,0,1,0,0, 0,1,0,0,1,0, 0,0,1,0,0,1];
    const axG = new THREE.BufferGeometry();
    axG.setAttribute('position', new THREE.Float32BufferAttribute(axPts, 3));
    axG.setAttribute('color',    new THREE.Float32BufferAttribute(axCol, 3));
    scene.add(new THREE.LineSegments(axG, new THREE.LineBasicMaterial({ vertexColors: true })));
    ['x','y','z'].forEach((lbl, i) => {
      const pos = [new THREE.Vector3(3.2,0,0), new THREE.Vector3(0,3.2,0), new THREE.Vector3(0,0,3.2)][i];
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: [0xff4444,0x44ff44,0x4488ff][i] }));
      sprite.position.copy(pos);
      sprite.scale.set(0.4,0.4,1);
      scene.add(sprite);
    });

    const normal = new THREE.Vector3(nx, ny, nz);
    const len = normal.length();
    const nHat = len > 0.001 ? normal.clone().normalize() : new THREE.Vector3(0, 1, 0);

    // Point on plane closest to origin (if d != 0): p0 = -d/len² * n
    const p0 = len > 0.001 ? nHat.clone().multiplyScalar(-d / len) : new THREE.Vector3(0,0,0);

    // Build plane mesh aligned to normal
    const geo = new THREE.PlaneGeometry(6, 6, 6, 6);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8, opacity: 0.35, transparent: true,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const planeMesh = new THREE.Mesh(geo, mat);
    const up = new THREE.Vector3(0, 0, 1);
    planeMesh.quaternion.setFromUnitVectors(up, nHat);
    planeMesh.position.copy(p0);
    scene.add(planeMesh);

    // Wireframe grid on plane
    const wGeo = new THREE.PlaneGeometry(6, 6, 6, 6);
    const wMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, opacity: 0.18, transparent: true });
    const wMesh = new THREE.Mesh(wGeo, wMat);
    wMesh.quaternion.copy(planeMesh.quaternion);
    wMesh.position.copy(p0);
    scene.add(wMesh);

    // Normal arrow
    const arrow = new THREE.ArrowHelper(nHat, p0, 2, 0xfb923c, 0.35, 0.15);
    scene.add(arrow);

    // Distance line from origin to plane (foot)
    const distPts = [new THREE.Vector3(0,0,0), p0];
    const distGeo = new THREE.BufferGeometry().setFromPoints(distPts);
    const distLine = new THREE.Line(distGeo, new THREE.LineBasicMaterial({ color: 0xef4444 }));
    scene.add(distLine);

    // Origin point
    const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
    scene.add(new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xffffff })));

    // Foot point
    const footGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const footMesh = new THREE.Mesh(footGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    footMesh.position.copy(p0);
    scene.add(footMesh);

    // Distance from origin to plane
    const distVal = Math.abs(d) / (len > 0.001 ? len : 1);

    // Stats canvas
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 380; canvas2d.height = 200;
    const ctx = canvas2d.getContext('2d')!;
    ctx.fillStyle = 'rgba(9,13,22,0.85)';
    ctx.roundRect(0, 0, 380, 200, 10); ctx.fill();
    ctx.font = 'bold 14px monospace'; ctx.fillStyle = '#38bdf8';
    ctx.fillText('Phương trình mặt phẳng', 10, 28);
    ctx.font = '13px monospace'; ctx.fillStyle = '#f8fafc';
    const eq = `${nx}x + ${ny}y + ${nz}z + ${d} = 0`;
    ctx.fillText(eq, 10, 56);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Pháp vectơ n = (${nx}, ${ny}, ${nz})`, 10, 84);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`d(O, P) = |${d}| / |n| = ${distVal.toFixed(3)}`, 10, 114);
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`Chân đường vuông góc: (${p0.x.toFixed(2)}, ${p0.y.toFixed(2)}, ${p0.z.toFixed(2)})`, 10, 144);
    ctx.fillStyle = '#64748b'; ctx.font = '11px monospace';
    ctx.fillText('d(M,P) = |ax₀+by₀+cz₀+d| / √(a²+b²+c²)', 10, 174);

    const tex = new THREE.CanvasTexture(canvas2d);
    const sp = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 2.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    sp.position.set(-5.5, 3.5, 0);
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
  }, [nx, ny, nz, d]);

  return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}
