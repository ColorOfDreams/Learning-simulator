import React from 'react';
import { Text } from '@react-three/drei';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';

import { useFrame } from '@react-three/fiber';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }
const DongHoNangLuong: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const textRef = React.useRef<any>(null);

  useFrame(() => {
    if (dangChay) {
      const props = doiTuong.thuocTinh || doiTuong.properties;
      const nangLuong = props?.nangLuong || props?.energy || 0;
      if (textRef.current) textRef.current.text = `E=${nangLuong.toFixed(1)}J`;
    }
  });

  return (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Đồng Hồ Năng Lượng" kichThuocVaCham={[0.3, 0.2, 0.05]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.35, 0.08]} />
        <meshPhysicalMaterial color="#1e293b" roughness={0.15} metalness={0.6} />
      </mesh>
      <Text ref={textRef} position={[0, 0.02, 0.05]} fontSize={0.1} color="#22d3ee" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf">
        E=0J
      </Text>
    </group>
    </DoiTuongKeoTha>
  );
};
export default React.memo(DongHoNangLuong);
