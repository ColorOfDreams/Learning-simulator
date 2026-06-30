import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../../types';

export default function Line3DSim({ config }: SimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const mx = config.parameters?.find(p => p.key === 'mx')?.value ?? 0;
  const my = config.parameters?.find(p => p.key === 'my')?.value ?? 0;
  const mz = config.parameters?.find(p => p.key === 'mz')?.value ?? 0;
  const ux = config.parameters?.find(p => p.key === 'ux')?.value ?? 1;
  const uy = config.parameters?.find(p => p.key === 'uy')?.value ?? 2;
  const uz = config.parameters?.find(p => p.key === 'uz')?.value ?? 1;

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

    scene.add(new THREE.AmbientLight(0x334155, 3));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 8, 5);
    scene.add(dl);

    // Axes
    const axPts = [0,0,0,4,0,0, 0,0,0,0,4,0, 0,0,0,0,0,4];
    const axCol = [1,0,0,1,0,0, 0,1,0,0,1,0, 0,0,1,0,0,1];
    const axG = new THREE.BufferGeometry();
    axG.setAttribute('position', new THREE.Float32BufferAttribute(axPts, 3));
    axG.setAttribute('color',    new THREE.Float32BufferAttribute(axCol, 3));
    scene.add(new THREE.LineSegments(axG, new THREE.LineBasicMaterial({ vertexColors: true })));

    const M  = new THREE.Vector3(mx, my, mz);
    const uVec = new THREE.Vector3(ux, uy, uz);
    const uLen = uVec.length();
    const uHat = uLen > 0.001 ? uVec.clone().normalize() : new THREE.Vector3(1, 0, 0);

    // Line from M - 4u to M + 4u
    const linePts = [
      M.clone().addScaledVector(uHat, -4),
      M.clone().addScaledVector(uHat,  4),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    scene.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })));

    // Direction arrow at M
    scene.add(new THREE.ArrowHelper(uHat, M, 1.8, 0xfb923c, 0.3, 0.12));

    // Point M
    const mSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x4ade80 })
    );
    mSphere.position.copy(M);
    scene.add(mSphere);

    // Origin
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    ));

    // Distance from origin to line
    // d(O, d) = |OM × u| / |u|
    const OM = M.clone().negate();
    const cross = new THREE.Vector3().crossVectors(OM, uVec);
    const distToLine = uLen > 0.001 ? cross.length() / uLen : 0;

    // Foot of perpendicular from O to line
    // t = -M·u / |u|²
    const t = uLen > 0.001 ? -M.dot(uVec) / (uLen * uLen) : 0;
    const foot = M.clone().addScaledVector(uVec, t);

    // Dashed line from O to foot
    if (distToLine > 0.05) {
      const perpGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), foot]);
      scene.add(new THREE.Line(perpGeo, new THREE.LineBasicMaterial({ color: 0xef4444 })));
      const fSph = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      fSph.position.copy(foot);
      scene.add(fSph);
    }

    // Stats
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 400; canvas2d.height = 220;
    const ctx = canvas2d.getContext('2d')!;
    ctx.fillStyle = 'rgba(9,13,22,0.85)';
    ctx.roundRect(0, 0, 400, 220, 10); ctx.fill();
    ctx.font = 'bold 14px monospace'; ctx.fillStyle = '#38bdf8';
    ctx.fillText('Đường thẳng trong không gian', 10, 28);
    ctx.font = '12px monospace'; ctx.fillStyle = '#f8fafc';
    ctx.fillText(`M = (${mx}, ${my}, ${mz})   u = (${ux}, ${uy}, ${uz})`, 10, 56);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Phương trình chính tắc:`, 10, 82);
    const denom = [ux, uy, uz].map(v => v === 0 ? '0' : v).join('/');
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`(x−${mx})/${ux} = (y−${my})/${uy} = (z−${mz})/${uz}`, 10, 106);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`d(O, d) = |OM × u| / |u| = ${distToLine.toFixed(3)}`, 10, 136);
    ctx.fillStyle = '#fb923c';
    if (distToLine > 0.05)
      ctx.fillText(`Chân đ.v.góc: (${foot.x.toFixed(2)}, ${foot.y.toFixed(2)}, ${foot.z.toFixed(2)})`, 10, 164);
    ctx.fillStyle = '#64748b'; ctx.font = '11px monospace';
    ctx.fillText('Tham số: r = M + t·u, t ∈ ℝ', 10, 196);

    const tex = new THREE.CanvasTexture(canvas2d);
    const sp = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 2.8),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    sp.position.set(-5.5, 3.8, 0);
    scene.add(sp);

    let reqId = 0;
    const animate = () => { reqId = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [mx, my, mz, ux, uy, uz]);

  return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}
