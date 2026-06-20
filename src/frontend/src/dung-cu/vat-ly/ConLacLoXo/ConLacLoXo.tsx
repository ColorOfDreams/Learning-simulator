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

const ConLacLoXo: React.FC<Props> = ({ doiTuong, dangChay = false, capNhatViTri, doThiScene }) => {
  const khoiLuong = doiTuong.thuocTinh?.khoiLuong || doiTuong.properties?.mass || 1;
  const doCung = doiTuong.thuocTinh?.doCung || doiTuong.properties?.stiffness || 50;
  const mauSac = doiTuong.thuocTinh?.mauSac || doiTuong.properties?.color || '#3b82f6';
  const chieuDai = 2 + (khoiLuong * 9.8) / doCung;

  const loXoRef = useRef<THREE.Mesh>(null);
  const vatNangRef = useRef<THREE.Mesh>(null);
  const thoiGianRef = useRef(0);
  const vetRef = useRef<[number, number, number][]>([]);
  const { heSoTatDan } = useInteraction();

  const normalizeProps = () => ({ mass: khoiLuong, stiffness: doCung });

  useFrame((_, delta) => {
    if (!dangChay) {
      thoiGianRef.current = 0;
      vetRef.current = [];
      if (loXoRef.current) {
        loXoRef.current.scale.y = THREE.MathUtils.lerp(loXoRef.current.scale.y, 1, 0.1);
        const cl = chieuDai * loXoRef.current.scale.y;
        loXoRef.current.position.y = chieuDai / 2 - cl / 2;
        if (vatNangRef.current) vatNangRef.current.position.y = chieuDai / 2 - cl;
      }
      return;
    }

    thoiGianRef.current += delta;
    const t = thoiGianRef.current;
    const omega = Math.sqrt(doCung / khoiLuong);

    let activeDamping = 0;
    const tatCa = doThiScene?.doiTuong || doThiScene?.objects || [];
    const dashpot = tatCa.find((o: any) => {
      const mn = o.maDungCu || o.modelName;
      return mn === 'Dashpot' || mn === 'BoGiamChan' || o.nhan === 'Bộ giảm chấn';
    });
    if (dashpot) {
      const dp = dashpot.viTri || dashpot.position || [0,0,0];
      const pp = doiTuong.viTri || doiTuong.position || [0,0,0];
      if (Math.abs(dp[0] - pp[0]) < 1.5) activeDamping = heSoTatDan;
    }

    let doLech: number;
    if (activeDamping > 0.01 && activeDamping < omega * 0.99) {
      const omegaD = Math.sqrt(Math.max(0.01, omega * omega - activeDamping * activeDamping));
      doLech = 0.4 * Math.exp(-activeDamping * t) * Math.sin(t * omegaD);
    } else if (activeDamping >= omega) {
      doLech = 0.4 * Math.exp(-activeDamping * t * 0.3) * Math.sin(t * 0.5);
    } else {
      doLech = 0.4 * Math.sin(t * omega);
    }

    const cl = chieuDai + doLech;
    if (loXoRef.current) {
      loXoRef.current.scale.set(1, Math.max(0.3, cl / chieuDai), 1);
      loXoRef.current.position.y = chieuDai / 2 - cl / 2;
    }
    if (vatNangRef.current) {
      vatNangRef.current.position.y = chieuDai / 2 - cl;
      vetRef.current.push([0, vatNangRef.current.position.y, 0]);
      if (vetRef.current.length > 20) vetRef.current.shift();
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
        <mesh ref={vatNangRef} position={[0, -chieuDai / 2, 0]} castShadow receiveShadow>
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
