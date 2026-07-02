import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../../types';

export default function Revolution3DSim({ config }: SimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<{ pos: THREE.Vector3Tuple; target: THREE.Vector3Tuple } | null>(null);

  const shape = Math.round(config.parameters?.find(p => p.key === 'shape')?.value ?? 0); // 0=sphere,1=cyl,2=cone
  const R     = Math.max(0.2, config.parameters?.find(p => p.key === 'R')?.value ?? 2);
  const H     = Math.max(0.2, config.parameters?.find(p => p.key === 'H')?.value ?? 4);

  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const w = el.clientWidth  || 600;
    const h = el.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(6, 5, 8);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
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
    const axPts = [0,0,0,3,0,0, 0,0,0,0,3,0, 0,0,0,0,0,3];
    const axCol = [1,0,0,1,0,0, 0,1,0,0,1,0, 0,0,1,0,0,1];
    const axG = new THREE.BufferGeometry();
    axG.setAttribute('position', new THREE.Float32BufferAttribute(axPts, 3));
    axG.setAttribute('color',    new THREE.Float32BufferAttribute(axCol, 3));
    scene.add(new THREE.LineSegments(axG, new THREE.LineBasicMaterial({ vertexColors: true })));

    const mat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8, opacity: 0.75, transparent: true,
      side: THREE.DoubleSide, shininess: 60,
    });
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, wireframe: true, opacity: 0.2, transparent: true });

    let geo: THREE.BufferGeometry;
    let V = 0; let Sxq = 0;

    if (shape === 0) {
      // Sphere
      geo = new THREE.SphereGeometry(R, 32, 24);
      V   = (4/3) * Math.PI * R * R * R;
      Sxq = 4 * Math.PI * R * R;
    } else if (shape === 1) {
      // Cylinder
      geo = new THREE.CylinderGeometry(R, R, H, 32, 1, false);
      V   = Math.PI * R * R * H;
      Sxq = 2 * Math.PI * R * H;
    } else {
      // Cone
      geo = new THREE.ConeGeometry(R, H, 32, 1, false);
      const l = Math.sqrt(R*R + H*H);
      V   = (1/3) * Math.PI * R * R * H;
      Sxq = Math.PI * R * l;
    }

    const mesh = new THREE.Mesh(geo, mat);
    const wire = new THREE.Mesh(geo, wireMat);
    scene.add(mesh);
    scene.add(wire);

    // Stats canvas
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 360; canvas2d.height = 200;
    const ctx = canvas2d.getContext('2d')!;
    ctx.fillStyle = 'rgba(9,13,22,0.85)';
    ctx.roundRect(0, 0, 360, 200, 10);
    ctx.fill();
    ctx.font = 'bold 14px monospace';
    const label = ['Mặt cầu', 'Mặt trụ', 'Mặt nón'][shape];
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(label, 10, 28);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(`R = ${R.toFixed(2)}${shape !== 0 ? `    H = ${H.toFixed(2)}` : ''}`, 10, 56);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`V = ${V.toFixed(3)}`, 10, 86);
    ctx.fillStyle = '#fb923c';
    ctx.fillText(`S_xq = ${Sxq.toFixed(3)}`, 10, 116);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    const formulas = [
      'V=4/3·π·R³    S=4πR²',
      'V=πR²h    S_xq=2πRh',
      'V=1/3·πR²h    S_xq=πRl',
    ];
    ctx.fillText(formulas[shape], 10, 148);

    const tex = new THREE.CanvasTexture(canvas2d);
    const statsPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    statsPlane.position.set(-5, 3.5, 0);
    scene.add(statsPlane);

    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      statsPlane.quaternion.copy(camera.quaternion);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cameraRef.current = { pos: camera.position.toArray() as THREE.Vector3Tuple, target: controls.target.toArray() as THREE.Vector3Tuple };
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [shape, R, H]);

  return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}
