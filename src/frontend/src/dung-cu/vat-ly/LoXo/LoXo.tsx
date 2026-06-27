import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DoiTuongKeoTha, { getSnapPointsForModel } from '@/simulations/engine/DraggablePhysicsObject';
import { useInteraction } from '@/simulations/engine/InteractionContext';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const LoXo: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const { heSoTatDan, setIsDragging } = useInteraction();
  const chieuDai = doiTuong.thuocTinh?.chieuDai || doiTuong.properties?.length || 2;
  const doCung = doiTuong.thuocTinh?.doCung || doiTuong.properties?.stiffness || 50;
  
  const [isDraggingBob, setIsDraggingBob] = useState(false);
  const initialStretchRef = useRef(0);
  const thoiGianRef = useRef(0);
  const scaleRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Mesh>(null);

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
    if (scaleRef.current && scaleRef.current.parent) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      plane.applyMatrix4(scaleRef.current.parent.matrixWorld);
      const intersect = new THREE.Vector3();
      e.ray.intersectPlane(plane, intersect);
      if (intersect) {
        const localPt = scaleRef.current.parent.worldToLocal(intersect);
        const topY = chieuDai / 2;
        const stretchedLen = topY - localPt.y;
        
        let stretch = stretchedLen - chieuDai;
        stretch = Math.max(-chieuDai * 0.5, Math.min(chieuDai * 1.5, stretch));
        initialStretchRef.current = stretch;
        
        const currentLen = chieuDai + stretch;
        scaleRef.current.scale.y = currentLen / chieuDai;
        scaleRef.current.position.y = topY - currentLen / 2;
        if (bobRef.current) bobRef.current.position.y = topY - currentLen;
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
    let currentStretch = 0;
    if (dangChay && scaleRef.current) {
      const tatCa = doThiScene?.doiTuong || doThiScene?.objects || [];
      const daGan = tatCa.some((o: any) => {
        const mn = o.maDungCu || o.modelName;
        return mn === 'Stand' &&
          Math.abs((o.viTri?.[0] ?? o.position?.[0] ?? 0) + 1.6 - ((doiTuong.viTri?.[0] ?? doiTuong.position?.[0] ?? 0))) < 0.25 &&
          Math.abs(((o.viTri?.[1] ?? o.position?.[1] ?? 0)) + 2.0 - (((doiTuong.viTri?.[1] ?? doiTuong.position?.[1] ?? 0)) + chieuDai / 2)) < 0.25;
      });
      if (!daGan) { thoiGianRef.current = 0; return; }
      
      if (isDraggingBob) {
        thoiGianRef.current = 0;
        currentStretch = initialStretchRef.current;
        import('@/simulations/engine/InteractionContext').then(({ dynamicOffsets }) => {
          dynamicOffsets[doiTuong.id] = [0, -currentStretch, 0];
        });
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
      const m = 1; 
      const omega = Math.sqrt(doCung / m);
      currentStretch = initialStretchRef.current * Math.exp(-activeDamping * thoiGianRef.current) * Math.cos(thoiGianRef.current * omega);
      
      const currentLen = chieuDai + currentStretch;
      scaleRef.current.scale.y = currentLen / chieuDai;
      scaleRef.current.position.y = chieuDai / 2 - currentLen / 2;
      if (bobRef.current) bobRef.current.position.y = chieuDai / 2 - currentLen;
    } else if (!dangChay && scaleRef.current) {
      if (!isDraggingBob) {
        const curStretch = (scaleRef.current.scale.y * chieuDai) - chieuDai;
        currentStretch = THREE.MathUtils.lerp(curStretch, initialStretchRef.current, 0.1);
        const currentLen = chieuDai + currentStretch;
        scaleRef.current.scale.y = currentLen / chieuDai;
        scaleRef.current.position.y = chieuDai / 2 - currentLen / 2;
        if (bobRef.current) bobRef.current.position.y = chieuDai / 2 - currentLen;
      } else {
        currentStretch = (scaleRef.current.scale.y * chieuDai) - chieuDai;
      }
      thoiGianRef.current = 0;
    }
    
    // Ghi nhận độ lệch để các vật thể gắn vào (MassBlock, SimplePendulum) có thể dao động theo
    import('@/simulations/engine/InteractionContext').then(({ dynamicOffsets }) => {
      dynamicOffsets[doiTuong.id] = [0, -currentStretch, 0];
    });
  });

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Lò Xo" kichThuocVaCham={[0.3, chieuDai / 2, 0.3]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}
      diemSnap={getSnapPointsForModel('Spring', doiTuong?.thuocTinh || doiTuong?.properties)}>
      <group>
        {/* Móc trên (tĩnh) */}
        <mesh position={[0, chieuDai / 2, 0]}>
          <torusGeometry args={[0.08, 0.015, 16, 50]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        
        <group ref={scaleRef} position={[0, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.15, chieuDai, 16]} />
            <meshStandardMaterial color="#94a3b8" wireframe />
          </mesh>
        </group>
        
        {/* Móc dưới (động, dùng thay cho bobRef) */}
        <mesh ref={bobRef} position={[0, -chieuDai / 2, 0]} rotation={[0, 0, Math.PI]}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <torusGeometry args={[0.08, 0.015, 16, 50]} />
          <meshStandardMaterial color="#64748b" />
          {/* Hit box vô hình bọc ngoài để dễ nắm lấy bằng chuột */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="red" transparent opacity={0} />
          </mesh>
        </mesh>
      </group>
    </DoiTuongKeoTha>
  );
};
export default React.memo(LoXo);
