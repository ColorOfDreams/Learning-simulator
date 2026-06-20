import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import NutBam from '@/dung-cu/dung-chung/NutBam';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const DenCon: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const trongRef = useRef<THREE.Group>(null);
  const giuaRef = useRef<THREE.Group>(null);
  const ngoaiRef = useRef<THREE.Group>(null);
  const dangChayLua = dangChay; // lửa chạy khi isPlaying

  useFrame(() => {
    if (!dangChayLua) return;
    const nhapNhay = (ref: THREE.Group | null, bienDo: number) => {
      if (!ref) return;
      ref.scale.setScalar(0.85 + Math.random() * bienDo);
      ref.position.y += (Math.random() - 0.5) * 0.02;
    };
    nhapNhay(trongRef.current, 0.3);
    nhapNhay(giuaRef.current, 0.25);
    nhapNhay(ngoaiRef.current, 0.35);
  });

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Đèn Cồn Bunsen" kichThuocVaCham={[0.3, 0.9, 0.3]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <group>
        <mesh castShadow position={[0, -0.85, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.06, 32]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.7} metalness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.5, 24]} />
          <meshPhysicalMaterial color="#c4a44a" roughness={0.25} metalness={0.9} clearcoat={0.2} />
        </mesh>
        <mesh castShadow position={[0, -0.75, 0]}>
          <torusGeometry args={[0.09, 0.025, 8, 32]} />
          <meshPhysicalMaterial color="#b89a40" roughness={0.2} metalness={0.9} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.09, -0.75, Math.sin(angle) * 0.09]}>
              <boxGeometry args={[0.03, 0.06, 0.01]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          );
        })}
        <mesh castShadow position={[0.09, -0.71, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
          <meshPhysicalMaterial color="#8a7a3a" roughness={0.3} metalness={0.7} />
        </mesh>
        <NutBam viTri={[0.24, -0.71, 0.06]} kichThuoc={0.025}
          mau="#333" mauKhiBam="#111" khiBam={() => {}} />
        {dangChayLua && (
          <group position={[0, 0.74, 0]}>
            <group ref={trongRef}><mesh><coneGeometry args={[0.02, 0.25, 12]} /><meshStandardMaterial color="#0066ff" emissive="#0044cc" emissiveIntensity={1.2} transparent opacity={0.85} /></mesh></group>
            <group ref={giuaRef}><mesh><coneGeometry args={[0.04, 0.22, 14]} /><meshStandardMaterial color="#3399ff" emissive="#1166cc" emissiveIntensity={0.8} transparent opacity={0.6} /></mesh></group>
            <group ref={ngoaiRef}><mesh><coneGeometry args={[0.06, 0.32, 16]} /><meshStandardMaterial color="#ff8800" emissive="#cc5500" emissiveIntensity={0.6} transparent opacity={0.7} /></mesh></group>
            <mesh position={[0, 0.18, 0]}><coneGeometry args={[0.055, 0.08, 16]} /><meshStandardMaterial color="#ffcc00" emissive="#ff8800" emissiveIntensity={0.4} transparent opacity={0.5} /></mesh>
          </group>
        )}
      </group>
    </DoiTuongKeoTha>
  );
};
export default React.memo(DenCon);
