import React from 'react';
import { Text, Line } from '@react-three/drei';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import NutBam from '@/dung-cu/dung-chung/NutBam';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }
const MayDoPH: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const thuocTinh = doiTuong.thuocTinh || doiTuong.properties || {};
  const doPH = (thuocTinh.doPH || thuocTinh.pH || 7) as number;
  const pH = Math.max(0, Math.min(14, doPH));
  const mau = pH < 6.5 ? '#ff3333' : pH > 7.5 ? '#3366ff' : '#33aa33';
  const cable: [number, number, number][] = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; cable.push([0.3 * t + 0.05 * Math.sin(t * 4), -0.4 * t, 0.05 * Math.cos(t * 5)]); }

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Máy đo pH" kichThuocVaCham={[0.3, 0.25, 0.1]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
      <group>
        <mesh castShadow><boxGeometry args={[0.5, 0.3, 0.15]} /><meshPhysicalMaterial color="#e8e8e8" roughness={0.2} metalness={0.1} /></mesh>
        <mesh castShadow position={[-0.23, 0, 0]}><boxGeometry args={[0.04, 0.3, 0.15]} /><meshStandardMaterial color="#ccc" roughness={0.3} /></mesh>
        <mesh position={[0.05, 0.04, 0.08]}><boxGeometry args={[0.28, 0.16, 0.005]} /><meshStandardMaterial color="#0d1b2a" roughness={0.05} /></mesh>
        <mesh position={[0.05, 0.04, 0.09]}><boxGeometry args={[0.28, 0.16, 0.001]} /><meshBasicMaterial color="#00ff88" transparent opacity={0.15} /></mesh>
        <Text position={[0.05, 0.04, 0.095]} fontSize={0.12} color={mau} anchorX="center" anchorY="middle" fontWeight="bold">{pH.toFixed(1)}</Text>
        <NutBam viTri={[0, -0.1, 0.085]} kichThuoc={0.02} mau="#ff4444" khiBam={() => {}} />
        <NutBam viTri={[0.08, -0.1, 0.085]} kichThuoc={0.02} mau="#ffaa00" khiBam={() => {}} />
        <NutBam viTri={[0.16, -0.1, 0.085]} kichThuoc={0.02} mau="#44aaff" khiBam={() => {}} />
        <mesh position={[0.26, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 0.08, 16]} /><meshStandardMaterial color="#707070" roughness={0.4} metalness={0.8} /></mesh>
        <group position={[0.35, -0.25, 0.05]}>
          <mesh><cylinderGeometry args={[0.025, 0.025, 0.5, 16]} /><meshStandardMaterial color="#f8f8f8" roughness={0.3} /></mesh>
          <mesh position={[0, -0.28, 0]}><sphereGeometry args={[0.028, 16, 16]} /><meshPhysicalMaterial color="#ddeeff" transparent opacity={0.55} roughness={0.05} /></mesh>
        </group>
        <Line points={cable} color="#444" lineWidth={1} />
      </group>
    </DoiTuongKeoTha>
  );
};
export default React.memo(MayDoPH);
