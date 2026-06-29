import React from 'react';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const KhoiGo: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const mauSac = doiTuong.thuocTinh?.mauSac || doiTuong.properties?.color || '#d4a76a';
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Khối Gỗ" kichThuocVaCham={[0.75, 0.75, 0.75]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshPhysicalMaterial color={mauSac} roughness={0.65} metalness={0.02} clearcoat={0.1} />
      </mesh>
    </DoiTuongKeoTha>
  );
};
export default React.memo(KhoiGo);
