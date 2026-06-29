import React from 'react';
import DoiTuongKeoTha, { getSnapPointsForModel } from '@/simulations/engine/DraggablePhysicsObject';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const VatNang: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const mauSac = doiTuong.thuocTinh?.mauSac || doiTuong.properties?.color || '#f59e0b';
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Vật Nặng" kichThuocVaCham={[0.4, 0.4, 0.4]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}
      diemSnap={getSnapPointsForModel('MassBlock', doiTuong?.thuocTinh || doiTuong?.properties)}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshPhysicalMaterial color={mauSac} roughness={0.1} metalness={0.95} clearcoat={0.4} />
      </mesh>
    </DoiTuongKeoTha>
  );
};
export default React.memo(VatNang);
