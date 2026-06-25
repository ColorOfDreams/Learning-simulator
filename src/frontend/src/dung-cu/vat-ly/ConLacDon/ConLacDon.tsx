import React, { useRef } from 'react';
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
  const { heSoTatDan } = useInteraction();
  const chieuDai = doiTuong.thuocTinh?.chieuDai || doiTuong.properties?.length || 2;
  const mauSac = doiTuong.thuocTinh?.mauSac || doiTuong.properties?.color || '#ef4444';
  const tayDoRef = useRef<THREE.Group>(null);
  const thoiGianRef = useRef(0);
  const vetRef = useRef<[number, number, number][]>([]);

  const normalizeProps = () => ({
    length: chieuDai,
    color: mauSac,
  });

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
      let activeDamping = 0;
      const dashpot = tatCa.find((o: any) => {
        const mn = o.maDungCu || o.modelName;
        return mn === 'Dashpot' || mn === 'BoGiamChan' || o.nhan === 'Bộ giảm chấn';
      });
      if (dashpot) {
        const dp = dashpot.viTri || dashpot.position || [0,0,0];
        const pp = doiTuong.viTri || doiTuong.position || [0,0,0];
        if (Math.abs(dp[0] - pp[0]) < 1.5) activeDamping = heSoTatDan;
      }

      thoiGianRef.current += delta;
      const omega = Math.sqrt(9.81 / chieuDai);
      const amplitude = 0.5 * Math.exp(-activeDamping * thoiGianRef.current);
      tayDoRef.current.rotation.z = amplitude * Math.sin(thoiGianRef.current * omega);
      const localBob: [number, number, number] = [0, chieuDai / 2 - chieuDai, 0];
      vetRef.current.push(localBob);
      if (vetRef.current.length > 20) vetRef.current.shift();
    } else if (!dangChay && tayDoRef.current) {
      tayDoRef.current.rotation.z = THREE.MathUtils.lerp(tayDoRef.current.rotation.z, 0, 0.1);
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
          <mesh position={[0, -chieuDai, 0]} castShadow receiveShadow>
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
