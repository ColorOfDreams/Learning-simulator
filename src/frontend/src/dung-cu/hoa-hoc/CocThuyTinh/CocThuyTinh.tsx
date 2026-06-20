import React from 'react';
import { Text } from '@react-three/drei';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { VatLieuThuyTinh, VatLieuThuyTinhMong } from '@/dung-cu/dung-chung/VatLieuThuyTinh';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const CocThuyTinh: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const theTich = doiTuong.thuocTinh?.theTich || doiTuong.properties?.liquidVolume || 0;
  const chieuCaoChatLong = Math.min((theTich / 500) * 1.0, 1.0);
  const mauChatLong = doiTuong.thuocTinh?.mauChatLong || doiTuong.properties?.liquidColor || '#00a8ff';

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Cốc Thủy Tinh 500ml" kichThuocVaCham={[0.4, 0.65, 0.4]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <group position={[0, 0.1, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.39, 0.39, 1.2, 64]} />
          <VatLieuThuyTinh />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.37, 0.37, 1.14, 64]} />
          <VatLieuThuyTinhMong />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 64]} />
          <VatLieuThuyTinh mau="#c8dff8" doNham={0.12} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <torusGeometry args={[0.39, 0.016, 16, 64]} />
          <VatLieuThuyTinh doNham={0.1} />
        </mesh>
        <mesh position={[0, 0.605, 0.37]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.07, 0.025, 0.03]} />
          <VatLieuThuyTinh mau="#cce4ff" day={0.02} doNham={0.1} />
        </mesh>
        {[100, 200, 300, 400, 500].map((ml, i) => {
          const y = -0.5 + (i + 1) * 0.2;
          return (
            <group key={ml}>
              <mesh position={[0, y, 0.39]}>
                <boxGeometry args={[0.05, 0.002, 0.003]} />
                <meshStandardMaterial color="white" roughness={0.3} emissive="white" emissiveIntensity={0.4} />
              </mesh>
              <Text position={[0, y, 0.42]} fontSize={0.055} color="white" anchorX="center" anchorY="middle" fillOpacity={0.9}>{ml.toString()}</Text>
            </group>
          );
        })}
        {chieuCaoChatLong > 0 && (
          <mesh position={[0, -0.57 + chieuCaoChatLong / 2, 0]}>
            <cylinderGeometry args={[0.37, 0.37, chieuCaoChatLong, 64]} />
            <meshPhysicalMaterial color={mauChatLong} transparent opacity={0.75} roughness={0.08} metalness={0.1} />
          </mesh>
        )}
      </group>
    </DoiTuongKeoTha>
  );
};
export default React.memo(CocThuyTinh);
