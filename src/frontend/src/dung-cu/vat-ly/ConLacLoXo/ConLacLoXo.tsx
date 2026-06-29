import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import DoiTuongKeoTha, { getSnapPointsForModel } from '@/simulations/engine/DraggablePhysicsObject';
import { useInteraction } from '@/simulations/engine/InteractionContext';

interface Props {
  doiTuong: Scene.Object;
  dangChay?: boolean;
  capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
  doThiScene?: Scene.IRecord | null;
}

const ConLacLoXo: React.FC<Props> = ({ doiTuong, dangChay = false, capNhatViTri, doThiScene }) => {
  const khoiLuong = doiTuong.thuocTinh?.khoiLuong || doiTuong.properties?.mass || 1;
  const doCung = doiTuong.thuocTinh?.doCung || doiTuong.properties?.stiffness || 50;
  const mauSac = doiTuong.thuocTinh?.mauSac || doiTuong.properties?.color || '#3b82f6';
  const chieuDai = 2 + (khoiLuong * 9.8) / doCung;

  const loXoRef = useRef<THREE.Mesh>(null);
  const vatNangRef = useRef<THREE.Mesh>(null);
  const thoiGianRef = useRef(0);
  const vetRef = useRef<[number, number, number][]>([]);
  const { heSoTatDan, setIsDragging } = useInteraction();
  
  const [isDraggingBob, setIsDraggingBob] = useState(false);
  const initialStretchRef = useRef(0);

  const normalizeProps = () => ({ mass: khoiLuong, stiffness: doCung });

  const onPointerDown = (e: any) => {
    if (e.button !== 2) return;
    e.stopPropagation();
    setIsDraggingBob(true);
    setIsDragging(true);
    try { e.target.setPointerCapture(e.pointerId); } catch {}
  };

  const onPointerMove = (e: any) => {
    if (!isDraggingBob) return;
    e.stopPropagation();
    if (loXoRef.current && loXoRef.current.parent) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      plane.applyMatrix4(loXoRef.current.parent.matrixWorld);
      const intersect = new THREE.Vector3();
      e.ray.intersectPlane(plane, intersect);
      if (intersect) {
        const localPt = loXoRef.current.parent.worldToLocal(intersect);
        const topY = chieuDai / 2;
        const stretchedLen = topY - localPt.y;
        
        let stretch = stretchedLen - chieuDai;
        stretch = Math.max(-chieuDai * 0.5, Math.min(chieuDai * 1.5, stretch));
        initialStretchRef.current = stretch;
        
        const cl = chieuDai + stretch;
        loXoRef.current.scale.set(1, Math.max(0.01, cl / chieuDai), 1);
        loXoRef.current.position.y = topY - cl / 2;
        if (vatNangRef.current) vatNangRef.current.position.y = topY - cl;
      }
    }
  };

  const onPointerUp = (e: any) => {
    if (!isDraggingBob) return;
    e.stopPropagation();
    setIsDraggingBob(false);
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch {}
  };

  useFrame((_, delta) => {
    const tatCa = doThiScene?.doiTuong || doThiScene?.objects || [];
    const daGan = tatCa.some((o: any) => {
      const mn = o.maDungCu || o.modelName;
      return mn === 'Stand' &&
        Math.abs((o.viTri?.[0] ?? o.position?.[0] ?? 0) + 1.6 - ((doiTuong.viTri?.[0] ?? doiTuong.position?.[0] ?? 0))) < 0.25 &&
        Math.abs(((o.viTri?.[1] ?? o.position?.[1] ?? 0)) + 2.0 - (((doiTuong.viTri?.[1] ?? doiTuong.position?.[1] ?? 0)) + chieuDai / 2)) < 0.25;
    });

    if (dangChay && daGan) {
      if (isDraggingBob) {
        thoiGianRef.current = 0;
        vetRef.current = [];
        return;
      }
      let activeDamping = heSoTatDan;
      const dashpot = tatCa.find((o: any) => {
        const mn = o.maDungCu || o.modelName;
        return mn === 'Dashpot' || mn === 'BoGiamChan' || o.nhan === 'Bộ giảm chấn';
      });
      if (dashpot) {
        const dp = dashpot.viTri || dashpot.position || [0,0,0];
        const pp = doiTuong.viTri || doiTuong.position || [0,0,0];
        if (dp[2] > -1.5 && Math.abs(dp[0] - pp[0]) < 1.5) {
          let val = dashpot.properties?.heSoTatDan ?? dashpot.thuocTinh?.heSoTatDan;
          if (typeof val === 'string') val = parseFloat(val);
          if (typeof val === 'number' && !isNaN(val)) activeDamping = val;
        }
      }

      thoiGianRef.current += delta;
      const t = thoiGianRef.current;
      const omega = Math.sqrt(doCung / khoiLuong);

      let doLech = initialStretchRef.current * Math.exp(-activeDamping * t) * Math.cos(t * omega);
      const cl = chieuDai + doLech;

      if (loXoRef.current) {
        loXoRef.current.scale.set(1, Math.max(0.01, cl / chieuDai), 1);
        loXoRef.current.position.y = chieuDai / 2 - cl / 2;
      }
      if (vatNangRef.current) {
        vatNangRef.current.position.y = chieuDai / 2 - cl;
        vetRef.current.push([0, vatNangRef.current.position.y, 0]);
        if (vetRef.current.length > 20) vetRef.current.shift();
      }
    } else if (!dangChay) {
      thoiGianRef.current = 0;
      vetRef.current = [];
      if (loXoRef.current && !isDraggingBob) {
        const currentStretch = (loXoRef.current.scale.y * chieuDai) - chieuDai;
        const newStretch = THREE.MathUtils.lerp(currentStretch, initialStretchRef.current, 0.1);
        const cl = chieuDai + newStretch;
        
        loXoRef.current.scale.set(1, Math.max(0.01, cl / chieuDai), 1);
        loXoRef.current.position.y = chieuDai / 2 - cl / 2;
        if (vatNangRef.current) vatNangRef.current.position.y = chieuDai / 2 - cl;
      }
    } else if (dangChay && !daGan) {
      thoiGianRef.current = 0;
      vetRef.current = [];
      // Trở về trạng thái tĩnh khi không gắn
      if (loXoRef.current) {
        loXoRef.current.scale.set(1, 1, 1);
        loXoRef.current.position.y = 0;
        if (vatNangRef.current) vatNangRef.current.position.y = -chieuDai / 2;
      }
    }
  });

  const snapPoints = getSnapPointsForModel('SpringPendulum', normalizeProps());

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={heSoTatDan > 0 ? `Con Lắc Lò Xo (β=${heSoTatDan.toFixed(1)})` : 'Con Lắc Lò Xo'} kichThuocVaCham={[0.5, chieuDai / 2, 0.5]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}
      diemSnap={snapPoints}>
      <group>
        <mesh position={[0, chieuDai / 2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshPhysicalMaterial color="#1f2937" metalness={0.9} roughness={0.2} clearcoat={0.2} />
        </mesh>
        <mesh ref={loXoRef} position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, chieuDai, 16]} />
          <meshStandardMaterial color="#94a3b8" wireframe />
        </mesh>
        <mesh ref={vatNangRef} position={[0, -chieuDai / 2, 0]} castShadow receiveShadow
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshPhysicalMaterial color={mauSac} roughness={0.15} metalness={0.9} clearcoat={0.3} />
        </mesh>
      </group>
      {vetRef.current.length > 2 && (
        <Line points={vetRef.current} color={mauSac} lineWidth={1.5} opacity={0.2} transparent />
      )}
    </DoiTuongKeoTha>
  );
};

export default React.memo(ConLacLoXo);
