import React from 'react';
import { Text } from '@react-three/drei';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }
const DongHoNangLuong: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Đồng Hồ Năng Lượng" kichThuocVaCham={[0.3, 0.2, 0.05]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.35, 0.08]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.15} metalness={0.6} />
      </mesh>
      <Text position={[0, 0.02, 0.05]} fontSize={0.1} color="#22d3ee" anchorX="center" anchorY="middle" fontWeight="bold">
        E=0J
      </Text>
    </group>
  </DoiTuongKeoTha>
);
export default React.memo(DongHoNangLuong);
