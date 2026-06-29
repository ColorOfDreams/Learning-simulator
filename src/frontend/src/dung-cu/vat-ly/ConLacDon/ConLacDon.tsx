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

const ConLacDon: React.FC<Props> = ({ doiTuong, dangChay = false, capNhatViTri, doThiScene }) => {
  const { heSoTatDan, setIsDragging } = useInteraction();
  const [isDraggingBob, setIsDraggingBob] = useState(false);
  const initialAngleRef = useRef(0);

  const chieuDai = doiTuong.thuocTinh?.chieuDai || doiTuong.properties?.length || 2;
  const mauSac = doiTuong.thuocTinh?.mauSac || doiTuong.properties?.color || '#ef4444';
  const tayDoRef = useRef<THREE.Group>(null);
  const thoiGianRef = useRef(0);
  const vetRef = useRef<[number, number, number][]>([]);

  const normalizeProps = () => ({
    length: chieuDai,
    color: mauSac,
  });

  const onBobPointerDown = (e: any) => {
    if (e.button !== 2) return; // Chỉ cho phép chuột phải để kéo tạo biên độ
    e.stopPropagation();
    setIsDraggingBob(true);
    setIsDragging(true);
    try { e.target.setPointerCapture(e.pointerId); } catch {}
  };

  const onBobPointerMove = (e: any) => {
    if (!isDraggingBob) return;
    e.stopPropagation();
    if (tayDoRef.current && tayDoRef.current.parent) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      plane.applyMatrix4(tayDoRef.current.parent.matrixWorld);
      const intersect = new THREE.Vector3();
      e.ray.intersectPlane(plane, intersect);
      if (intersect) {
        const localPt = tayDoRef.current.parent.worldToLocal(intersect);
        let angle = Math.atan2(localPt.x, -localPt.y);
        angle = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angle));
        initialAngleRef.current = angle;
        tayDoRef.current.rotation.z = angle;
      }
    }
  };

  const onBobPointerUp = (e: any) => {
    if (!isDraggingBob) return;
    e.stopPropagation();
    setIsDraggingBob(false);
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch {}
  };

  useFrame((_, delta) => {
    if (dangChay && tayDoRef.current) {
      const tatCa = doThiScene?.doiTuong || doThiScene?.objects || [];
      const daGan = tatCa.some((o: any) => {
        const mn = o.maDungCu || o.modelName;
        return mn === 'Stand' &&
          Math.abs((o.viTri?.[0] ?? o.position?.[0] ?? 0) + 1.6 - ((doiTuong.viTri?.[0] ?? doiTuong.position?.[0] ?? 0))) < 0.25 &&
          Math.abs(((o.viTri?.[1] ?? o.position?.[1] ?? 0)) + 2.0 - (((doiTuong.viTri?.[1] ?? doiTuong.position?.[1] ?? 0)) + chieuDai / 2)) < 0.25;
      });
      if (!daGan) { thoiGianRef.current = 0; vetRef.current = []; return; }
      
      if (isDraggingBob) {
        thoiGianRef.current = 0;
        vetRef.current = [];
        return;
      }
      let activeDamping = heSoTatDan; // Mặc định lấy từ môi trường
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
      const omega = Math.sqrt(9.81 / chieuDai);
      const amplitude = initialAngleRef.current * Math.exp(-activeDamping * thoiGianRef.current);
      tayDoRef.current.rotation.z = amplitude * Math.cos(thoiGianRef.current * omega);
      const localBob: [number, number, number] = [
        Math.sin(tayDoRef.current.rotation.z) * chieuDai,
        chieuDai / 2 - Math.cos(tayDoRef.current.rotation.z) * chieuDai,
        0
      ];
      vetRef.current.push(localBob);
      if (vetRef.current.length > 20) vetRef.current.shift();
    } else if (!dangChay && tayDoRef.current) {
      if (!isDraggingBob) {
        tayDoRef.current.rotation.z = THREE.MathUtils.lerp(tayDoRef.current.rotation.z, initialAngleRef.current, 0.1);
      }
      thoiGianRef.current = 0;
      vetRef.current = [];
    }
  });

  const snapPoints = getSnapPointsForModel('SimplePendulum', normalizeProps());

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Con Lắc Đơn" kichThuocVaCham={[0.5, chieuDai / 2, 0.5]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}
      diemSnap={snapPoints}>
      <group>
        <mesh position={[0, chieuDai / 2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.4]} />
          <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
        </mesh>
        <group ref={tayDoRef} position={[0, chieuDai / 2, 0]}>
          <mesh position={[0, -chieuDai / 2, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, chieuDai, 8]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.1} />
          </mesh>
          <mesh position={[0, -chieuDai, 0]} castShadow receiveShadow
            onPointerDown={onBobPointerDown}
            onPointerMove={onBobPointerMove}
            onPointerUp={onBobPointerUp}
            onPointerCancel={onBobPointerUp}
          >
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshPhysicalMaterial color={mauSac} roughness={0.15} metalness={0.9} clearcoat={0.3} />
          </mesh>
        </group>
      </group>
      {vetRef.current.length > 2 && (
        <Line points={vetRef.current} color={mauSac} lineWidth={1.5} opacity={0.25} transparent />
      )}
    </DoiTuongKeoTha>
  );
};

export default React.memo(ConLacDon);
