import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../../types';

export default function Perpendicular3DSim({ config }: SimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const normalX = config.parameters?.find(p => p.key === 'normalX')?.value ?? 0;
  const normalY = config.parameters?.find(p => p.key === 'normalY')?.value ?? 1;
  const normalZ = config.parameters?.find(p => p.key === 'normalZ')?.value ?? 0;
  const showDihedral = config.parameters?.find(p => p.key === 'showDihedral')?.value ?? 1;

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
    camera.position.set(6, 5, 9);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    scene.add(new THREE.AmbientLight(0x334155, 2));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 8, 5);
    scene.add(dl);

    const rawNormal = new THREE.Vector3(normalX, normalY, normalZ);
    const len = rawNormal.length();
    const n1 = len < 0.001 ? new THREE.Vector3(0, 1, 0) : rawNormal.clone().normalize();

    const n2 = new THREE.Vector3(1, 0, 0);

    const makeSemiTransparentPlane = (normal: THREE.Vector3, color: number, opacity: number, position: THREE.Vector3) => {
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
      mesh.position.copy(position);
      return mesh;
    };

    scene.add(makeSemiTransparentPlane(n1, 0x3b82f6, 0.4, new THREE.Vector3(0, 0, 0)));
    scene.add(makeSemiTransparentPlane(n2, 0x8b5cf6, 0.3, new THREE.Vector3(0, 0, 0)));

    const normalArrow = new THREE.ArrowHelper(n1.clone(), new THREE.Vector3(0, 0, 0), 2, 0xfbbf24, 0.35, 0.18);
    scene.add(normalArrow);

    const perpDir = n1.clone();
    const perpPoints = [
      new THREE.Vector3(0, 0, 0),
      perpDir.clone().multiplyScalar(2.5),
    ];
    const perpGeo = new THREE.BufferGeometry().setFromPoints(perpPoints);
    const perpMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
    scene.add(new THREE.Line(perpGeo, perpMat));

    const intersectDir = new THREE.Vector3().crossVectors(n1, n2);
    if (intersectDir.length() > 0.001) {
      intersectDir.normalize();
      const pts = [
        intersectDir.clone().multiplyScalar(-2.5),
        intersectDir.clone().multiplyScalar(2.5),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0x4ade80, linewidth: 2 });
      scene.add(new THREE.Line(geo, mat));
    }

    if (showDihedral === 1 && intersectDir.length() > 0.001) {
      const iDir = intersectDir.clone().normalize();
      const inPlane1 = new THREE.Vector3().crossVectors(iDir, n1).normalize();
      const inPlane2 = new THREE.Vector3().crossVectors(iDir, n2).normalize();
      const dot = Math.min(1, Math.max(-1, inPlane1.dot(inPlane2)));
      const dihedral = Math.acos(dot);
      const arcPoints: THREE.Vector3[] = [];
      const steps = 32;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * dihedral;
        const p = inPlane1.clone().multiplyScalar(Math.cos(t)).addScaledVector(inPlane2, Math.sin(t));
        arcPoints.push(p.multiplyScalar(1.2));
      }
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const arcMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 });
      scene.add(new THREE.Line(arcGeo, arcMat));
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
    scene.add(new THREE.LineSegments(axesGeo, new THREE.LineBasicMaterial({ vertexColors: true })));

    const nx = n1.x, ny = n1.y, nz = n1.z;

    let dihedralDeg = 0;
    if (intersectDir.length() > 0.001) {
      const iDir = intersectDir.clone().normalize();
      const inPlane1 = new THREE.Vector3().crossVectors(iDir, n1).normalize();
      const inPlane2 = new THREE.Vector3().crossVectors(iDir, n2).normalize();
      const dot = Math.min(1, Math.max(-1, inPlane1.dot(inPlane2)));
      dihedralDeg = (Math.acos(dot) * 180) / Math.PI;
    }

    const statsCanvas = document.createElement('canvas');
    statsCanvas.width = 320;
    statsCanvas.height = 210;
    const statsTex = new THREE.CanvasTexture(statsCanvas);
    const statsPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 2.7),
      new THREE.MeshBasicMaterial({ map: statsTex, transparent: true, depthWrite: false })
    );
    statsPlane.position.set(-4.5, 3, 0);
    scene.add(statsPlane);

    const g2d = statsCanvas.getContext('2d')!;
    g2d.clearRect(0, 0, 320, 210);
    g2d.fillStyle = 'rgba(9,13,22,0.82)';
    g2d.roundRect(0, 0, 320, 210, 10);
    g2d.fill();

    g2d.font = 'bold 14px monospace';
    g2d.fillStyle = '#fbbf24';
    g2d.fillText(`n⃗ = (${nx.toFixed(1)}, ${ny.toFixed(1)}, ${nz.toFixed(1)})`, 10, 30);
    g2d.fillStyle = '#ef4444';
    g2d.fillText('d ⊥ α', 10, 60);
    g2d.fillStyle = '#e2e8f0';
    g2d.fillText('d ⊥ α ⟺ d ⊥ mọi đường trong α', 10, 90);
    if (showDihedral === 1) {
      g2d.fillStyle = '#fbbf24';
      g2d.fillText(`Góc nhị diện = ${dihedralDeg.toFixed(1)}°`, 10, 122);
    }
    g2d.fillStyle = '#8b5cf6';
    g2d.fillText('mp β: pháp vectơ (1, 0, 0)', 10, 154);
    g2d.fillStyle = '#4ade80';
    g2d.fillText('Giao tuyến α ∩ β', 10, 184);

    statsTex.needsUpdate = true;

    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
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
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current)
        mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [normalX, normalY, normalZ, showDihedral]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
