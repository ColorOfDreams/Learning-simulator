import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { SimulationProps } from '../../types';

export default function PolyhedraSim({ config }: SimulationProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const polyType = config.parameters?.find(p => p.key === 'polyType')?.value ?? 0;
  const n = Math.round(config.parameters?.find(p => p.key === 'n')?.value ?? 4);
  const baseR = config.parameters?.find(p => p.key === 'baseR')?.value ?? 1.5;
  const height = config.parameters?.find(p => p.key === 'height')?.value ?? 2.5;

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
    camera.position.set(5, 4, 8);
    camera.lookAt(0, height / 2, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    scene.add(new THREE.AmbientLight(0x334155, 2));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 8, 5);
    scene.add(dl);

    const sides = Math.max(3, Math.min(6, n));
    const baseVerts: THREE.Vector2[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
      baseVerts.push(new THREE.Vector2(Math.cos(angle) * baseR, Math.sin(angle) * baseR));
    }

    const base3D = (y: number) => baseVerts.map(v => new THREE.Vector3(v.x, y, v.y));

    const faceMat = (color: number, opacity: number) =>
      new THREE.MeshPhongMaterial({ color, opacity, transparent: true, side: THREE.DoubleSide, depthWrite: false });

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });

    const addFace = (pts: THREE.Vector3[], color: number, opacity: number) => {
      const shape = new THREE.Shape(pts.map(p => new THREE.Vector2(p.x, p.z)));
      const geo = new THREE.ShapeGeometry(shape);
      const posArr = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < posArr.length / 3; i++) {
        const x = posArr[i * 3];
        const z = posArr[i * 3 + 1];
        posArr[i * 3] = x;
        posArr[i * 3 + 1] = pts[0].y;
        posArr[i * 3 + 2] = z;
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
      scene.add(new THREE.Mesh(geo, faceMat(color, opacity)));
    };

    const addEdgeLoop = (pts: THREE.Vector3[]) => {
      const closed = [...pts, pts[0]];
      const geo = new THREE.BufferGeometry().setFromPoints(closed);
      scene.add(new THREE.Line(geo, edgeMat));
    };

    const addEdge = (a: THREE.Vector3, b: THREE.Vector3) => {
      const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
      scene.add(new THREE.Line(geo, edgeMat));
    };

    const bottomVerts = base3D(0);
    addFace(bottomVerts, 0x14532d, 0.4);
    addEdgeLoop(bottomVerts);

    if (Math.round(polyType) === 0) {
      const topVerts = base3D(height);
      addFace(topVerts, 0x14532d, 0.4);
      addEdgeLoop(topVerts);

      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        const bl = bottomVerts[i];
        const br = bottomVerts[next];
        const tr = topVerts[next];
        const tl = topVerts[i];

        const quad = [bl, br, tr, tl];
        const shape = new THREE.Shape([
          new THREE.Vector2(0, 0),
          new THREE.Vector2(1, 0),
          new THREE.Vector2(1, 1),
          new THREE.Vector2(0, 1),
        ]);
        const geoQ = new THREE.ShapeGeometry(shape);
        const posArr = geoQ.attributes.position.array as Float32Array;
        const corners = [bl, br, tr, tl];
        const uvArr = geoQ.attributes.uv.array as Float32Array;
        const newPos = new Float32Array(posArr.length);
        for (let v = 0; v < posArr.length / 3; v++) {
          const u = uvArr[v * 2];
          const vt = uvArr[v * 2 + 1];
          const p = new THREE.Vector3()
            .addScaledVector(corners[0], (1 - u) * (1 - vt))
            .addScaledVector(corners[1], u * (1 - vt))
            .addScaledVector(corners[3], (1 - u) * vt)
            .addScaledVector(corners[2], u * vt);
          newPos[v * 3] = p.x;
          newPos[v * 3 + 1] = p.y;
          newPos[v * 3 + 2] = p.z;
        }
        geoQ.setAttribute('position', new THREE.Float32BufferAttribute(newPos, 3));
        geoQ.computeVertexNormals();
        scene.add(new THREE.Mesh(geoQ, faceMat(0x1e40af, 0.3)));

        addEdge(bl, tl);
        addEdge(quad[0], quad[0]);
      }

      for (let i = 0; i < sides; i++) {
        addEdge(bottomVerts[i], topVerts[i]);
      }

    } else {
      const apex = new THREE.Vector3(0, height, 0);

      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        const a = bottomVerts[i];
        const b = bottomVerts[next];

        const triPos = new Float32Array([
          a.x, a.y, a.z,
          b.x, b.y, b.z,
          apex.x, apex.y, apex.z,
        ]);
        const triGeo = new THREE.BufferGeometry();
        triGeo.setAttribute('position', new THREE.Float32BufferAttribute(triPos, 3));
        triGeo.setIndex([0, 1, 2]);
        triGeo.computeVertexNormals();
        scene.add(new THREE.Mesh(triGeo, faceMat(0x1e40af, 0.3)));

        addEdge(a, apex);
        addEdge(b, apex);
      }
    }

    const Sn = (sides * baseR * baseR * Math.sin((2 * Math.PI) / sides)) / 2;
    const a = 2 * baseR * Math.sin(Math.PI / sides);
    let statsLines: string[] = [];

    if (Math.round(polyType) === 0) {
      const Xq = sides * a * height;
      const Stp = Xq + 2 * Sn;
      const V = Sn * height;
      statsLines = [
        `Đáy: đa giác đều ${sides} cạnh`,
        `S_đáy = ${Sn.toFixed(2)} đvdt`,
        `H = ${height.toFixed(2)}`,
        `V = S_đáy × H = ${V.toFixed(2)} đvtt`,
        `S_xq = ${Xq.toFixed(2)},  S_tp = ${Stp.toFixed(2)}`,
        `V = S_đáy × h`,
      ];
    } else {
      const V = (Sn * height) / 3;
      const slant = Math.sqrt(baseR * baseR + height * height);
      const Sxq = (sides * a * slant) / 2;
      const Stp = Sxq + Sn;
      statsLines = [
        `Đáy: đa giác đều ${sides} cạnh`,
        `S_đáy = ${Sn.toFixed(2)} đvdt`,
        `H = ${height.toFixed(2)}, l = ${slant.toFixed(2)}`,
        `V = ⅓ × S_đáy × H = ${V.toFixed(2)} đvtt`,
        `S_xq = ${Sxq.toFixed(2)},  S_tp = ${Stp.toFixed(2)}`,
        `V = ⅓ · S_đáy · h`,
      ];
    }

    const statsCanvas = document.createElement('canvas');
    statsCanvas.width = 340;
    statsCanvas.height = 220;
    const statsTex = new THREE.CanvasTexture(statsCanvas);
    const statsPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.9),
      new THREE.MeshBasicMaterial({ map: statsTex, transparent: true, depthWrite: false })
    );
    statsPlane.position.set(-4.5, 3.5, 0);
    scene.add(statsPlane);

    const g2d = statsCanvas.getContext('2d')!;
    g2d.clearRect(0, 0, 340, 220);
    g2d.fillStyle = 'rgba(9,13,22,0.85)';
    g2d.roundRect(0, 0, 340, 220, 10);
    g2d.fill();

    const title = Math.round(polyType) === 0 ? 'LĂNG TRỤ ĐỀU' : 'HÌNH CHÓP ĐỀU';
    g2d.font = 'bold 15px monospace';
    g2d.fillStyle = '#38bdf8';
    g2d.fillText(title, 10, 26);

    g2d.font = '13px monospace';
    statsLines.forEach((line, i) => {
      const isFormula = i === statsLines.length - 1;
      g2d.fillStyle = isFormula ? '#fbbf24' : '#e2e8f0';
      g2d.fillText(line, 10, 52 + i * 27);
    });

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
  }, [polyType, n, baseR, height]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
