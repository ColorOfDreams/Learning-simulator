import React from 'react';
import DoiTuongKeoTha, { getSnapPointsForModel } from '@/simulations/engine/DraggablePhysicsObject';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const LoXo: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const chieuDai = doiTuong.thuocTinh?.chieuDai || doiTuong.properties?.length || 2;
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Lò Xo" kichThuocVaCham={[0.3, chieuDai / 2, 0.3]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}
      diemSnap={getSnapPointsForModel('Spring', doiTuong?.thuocTinh || doiTuong?.properties)}>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, chieuDai, 16]} />
        <meshStandardMaterial color="#94a3b8" wireframe />
      </mesh>
    </DoiTuongKeoTha>
  );
};
export default React.memo(LoXo);
