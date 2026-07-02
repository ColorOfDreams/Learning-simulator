import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../../types';

export default function Planes3DSim({ config }: SimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<{ pos: THREE.Vector3Tuple; target: THREE.Vector3Tuple } | null>(null);

  const alpha = config.parameters?.find(p => p.key === 'alpha')?.value ?? 20;
  const beta = config.parameters?.find(p => p.key === 'beta')?.value ?? 50;
  const parallel = config.parameters?.find(p => p.key === 'parallel')?.value ?? 0;

  useEffect(() => {
    if (!mountRef.current) return;
    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(7, 5, 9);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    if (cameraRef.current) {
      camera.position.set(...cameraRef.current.pos);
      controls.target.set(...cameraRef.current.target);
      controls.update();
    }

    scene.add(new THREE.AmbientLight(0x334155, 2));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 8, 5);
    scene.add(dl);

    const aRad = (alpha * Math.PI) / 180;
    const bRad = (beta * Math.PI) / 180;

    const n1 = new THREE.Vector3(Math.sin(aRad), Math.cos(aRad), 0).normalize();
    const n2 = parallel === 1
      ? n1.clone()
      : new THREE.Vector3(Math.sin(bRad), Math.cos(bRad), 0).normalize();

    const makePlane = (normal: THREE.Vector3, color: number, opacity: number, offset: THREE.Vector3) => {
      const geo = new THREE.PlaneGeometry(5, 5, 4, 4);
      const mat = new THREE.MeshPhongMaterial({
        color,
        opacity,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const up = new THREE.Vector3(0, 0, 1);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
      mesh.quaternion.copy(quat);
      mesh.position.copy(offset);
      return mesh;
    };

    const planeAlpha = makePlane(n1, 0x3b82f6, 0.35, new THREE.Vector3(0, 0, 0));
    scene.add(planeAlpha);

    const offset2 = parallel === 1 ? new THREE.Vector3(0, 2, 0) : new THREE.Vector3(0, 0, 0);
    const planeBeta = makePlane(n2, 0xfb923c, 0.35, offset2);
    scene.add(planeBeta);

    const makeGridLines = (normal: THREE.Vector3, offset: THREE.Vector3, color: number) => {
      const tangent1 = new THREE.Vector3();
      const tangent2 = new THREE.Vector3();
      const up = new THREE.Vector3(0, 0, 1);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
      tangent1.set(1, 0, 0).applyQuaternion(quat);
      tangent2.set(0, 1, 0).applyQuaternion(quat);
      const points: number[] = [];
      [-1.5, 0, 1.5].forEach(t => {
        const c = offset.clone().addScaledVector(tangent2, t);
        const a = c.clone().addScaledVector(tangent1, -2.5);
        const b = c.clone().addScaledVector(tangent1, 2.5);
        points.push(a.x, a.y, a.z, b.x, b.y, b.z);
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      const mat = new THREE.LineBasicMaterial({ color, opacity: 0.5, transparent: true });
      return new THREE.LineSegments(geo, mat);
    };

    scene.add(makeGridLines(n1, new THREE.Vector3(0, 0, 0), 0x93c5fd));
    scene.add(makeGridLines(n2, offset2, 0xfed7aa));

    const makeArrow = (dir: THREE.Vector3, origin: THREE.Vector3, color: number) => {
      const arrow = new THREE.ArrowHelper(dir.clone().normalize(), origin, 1.5, color, 0.3, 0.15);
      return arrow;
    };

    scene.add(makeArrow(n1, new THREE.Vector3(0, 0, 0), 0x60a5fa));
    scene.add(makeArrow(n2, offset2, 0xfb923c));

    if (parallel === 0) {
      const intersectionDir = new THREE.Vector3().crossVectors(n1, n2);
      if (intersectionDir.length() > 0.001) {
        intersectionDir.normalize();
        const points = [
          intersectionDir.clone().multiplyScalar(-3),
          intersectionDir.clone().multiplyScalar(3),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
        scene.add(new THREE.Line(geo, mat));
      }
    }

    const axesPoints = [
      0, 0, 0, 2, 0, 0,
      0, 0, 0, 0, 2, 0,
      0, 0, 0, 0, 0, 2,
    ];
    const axesColors = [
      1, 0, 0, 1, 0, 0,
      0, 1, 0, 0, 1, 0,
      0, 0, 1, 0, 0, 1,
    ];
    const axesGeo = new THREE.BufferGeometry();
    axesGeo.setAttribute('position', new THREE.Float32BufferAttribute(axesPoints, 3));
    axesGeo.setAttribute('color', new THREE.Float32BufferAttribute(axesColors, 3));
    const axesMat = new THREE.LineBasicMaterial({ vertexColors: true });
    scene.add(new THREE.LineSegments(axesGeo, axesMat));

    const statsCanvas = document.createElement('canvas');
    statsCanvas.width = 320;
    statsCanvas.height = 200;
    const statsTex = new THREE.CanvasTexture(statsCanvas);
    const statsPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 2.5),
      new THREE.MeshBasicMaterial({ map: statsTex, transparent: true, depthWrite: false })
    );
    statsPlane.position.set(-4.5, 3, 0);
    scene.add(statsPlane);

    const g2d = statsCanvas.getContext('2d')!;
    g2d.clearRect(0, 0, 320, 200);
    g2d.fillStyle = 'rgba(9,13,22,0.82)';
    g2d.roundRect(0, 0, 320, 200, 10);
    g2d.fill();

    g2d.font = 'bold 15px monospace';
    g2d.fillStyle = '#93c5fd';
    g2d.fillText(`Mặt phẳng α: n₁ = (${n1.x.toFixed(2)}, ${n1.y.toFixed(2)}, ${n1.z.toFixed(2)})`, 10, 30);
    g2d.fillStyle = '#fed7aa';
    g2d.fillText(`Mặt phẳng β: n₂ = (${n2.x.toFixed(2)}, ${n2.y.toFixed(2)}, ${n2.z.toFixed(2)})`, 10, 58);

    if (parallel === 1) {
      g2d.fillStyle = '#4ade80';
      g2d.fillText('α // β', 10, 90);
      g2d.fillStyle = '#e2e8f0';
      g2d.fillText('n₁ // n₂  (pháp vectơ song song)', 10, 118);
    } else {
      const crossDir = new THREE.Vector3().crossVectors(n1, n2);
      const dot = Math.min(1, Math.max(-1, n1.dot(n2)));
      const angleDeg = (Math.acos(Math.abs(dot)) * 180) / Math.PI;
      g2d.fillStyle = '#4ade80';
      g2d.fillText('α ∩ β = d  (giao tuyến)', 10, 90);
      if (crossDir.length() > 0.001) {
        const cd = crossDir.normalize();
        g2d.fillStyle = '#ef4444';
        g2d.fillText(`d: (${cd.x.toFixed(2)}, ${cd.y.toFixed(2)}, ${cd.z.toFixed(2)})`, 10, 118);
      }
      g2d.fillStyle = '#e2e8f0';
      g2d.fillText(`Góc giữa 2 mp: ${angleDeg.toFixed(1)}°`, 10, 148);
    }

    statsTex.needsUpdate = true;

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
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current)
        mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [alpha, beta, parallel]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
