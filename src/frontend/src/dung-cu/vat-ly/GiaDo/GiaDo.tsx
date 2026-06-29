import React from 'react';
import DoiTuongKeoTha, { getSnapPointsForModel } from '@/simulations/engine/DraggablePhysicsObject';

interface Props {
  doiTuong: Scene.Object;
  dangChay?: boolean;
  capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
  doThiScene?: Scene.IRecord | null;
}

const GiaDo: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Giá Đỡ" kichThuocVaCham={[1, 2.5, 1]}
    dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}
    diemSnap={getSnapPointsForModel('Stand', doiTuong?.thuocTinh || doiTuong?.properties)}
    coDinh>
    <group>
      <mesh position={[0, -2.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshPhysicalMaterial color="#1f2937" metalness={0.85} roughness={0.2} clearcoat={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 5, 24]} />
        <meshPhysicalMaterial color="#d1d5db" metalness={0.95} roughness={0.08} />
      </mesh>
      <mesh position={[0.8, 2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.6, 16]} />
        <meshPhysicalMaterial color="#d1d5db" metalness={0.95} roughness={0.08} />
      </mesh>
      <mesh position={[1.6, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshPhysicalMaterial color="#ef4444" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  </DoiTuongKeoTha>
);

export default React.memo(GiaDo);
