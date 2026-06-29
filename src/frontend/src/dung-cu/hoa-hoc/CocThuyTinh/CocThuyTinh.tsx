import React from 'react';
import * as THREE from 'three';
import { Text, Sparkles } from '@react-three/drei';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { VatLieuThuyTinh } from '@/dung-cu/dung-chung/VatLieuThuyTinh';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const CocThuyTinh: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const theTich = doiTuong.thuocTinh?.theTich || doiTuong.properties?.liquidVolume || 0;
  const chieuCaoChatLong = Math.min((theTich / 500) * 1.0, 1.0);
  const mauChatLong = doiTuong.thuocTinh?.mauChatLong || doiTuong.properties?.liquidColor || '#00a8ff';
  const effect = doiTuong.properties?.reactionEffect;
  const precipitateColor = doiTuong.properties?.precipitateColor || '#ffffff';

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Cốc Thủy Tinh 500ml" kichThuocVaCham={[0.4, 0.65, 0.4]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <group position={[0, 0.1, 0]}>
        <mesh castShadow>
          <latheGeometry args={[
            [
              new THREE.Vector2(0, -0.6),
              new THREE.Vector2(0.39, -0.6),
              new THREE.Vector2(0.39, 0.6),
              new THREE.Vector2(0.37, 0.6),
              new THREE.Vector2(0.37, -0.56),
              new THREE.Vector2(0, -0.56)
            ],
            64
          ]} />
          <VatLieuThuyTinh />
        </mesh>
        {/* Lip / Torus for smooth rim */}
        <mesh position={[0, 0.6, 0]}>
          <torusGeometry args={[0.38, 0.01, 16, 64]} />
          <VatLieuThuyTinh doNham={0.1} />
        </mesh>
        {/* Spout */}
        <mesh position={[0, 0.605, 0.38]} rotation={[0.2, 0, 0]}>
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
        {chieuCaoChatLong > 0 && (() => {
          const state = doiTuong.properties?.state || doiTuong.thuocTinh?.state || 'liquid';
          if (state === 'solid') {
            return (
              <group position={[0, -0.57 + chieuCaoChatLong / 4, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.3, 0.36, chieuCaoChatLong / 2, 64]} />
                  <meshStandardMaterial color={mauChatLong} roughness={0.9} />
                </mesh>
                {effect === 'bubble' && (
                  <Sparkles count={50} scale={[0.6, chieuCaoChatLong, 0.6]} size={4} speed={0.8} opacity={0.6} color="#ffffff" />
                )}
              </group>
            );
          } else if (state === 'gas') {
            return (
              <group position={[0, 0, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.37, 0.37, 1.1, 64]} />
                  <meshBasicMaterial color={mauChatLong} transparent opacity={0.6} depthWrite={false} />
                </mesh>
                {effect === 'bubble' && (
                  <Sparkles count={50} scale={[0.6, 1.1, 0.6]} size={4} speed={0.8} opacity={0.6} color="#ffffff" />
                )}
              </group>
            );
          }

          return (
            <group position={[0, -0.57 + chieuCaoChatLong / 2, 0]}>
              <mesh>
                <cylinderGeometry args={[0.37, 0.37, chieuCaoChatLong, 64]} />
                <meshPhysicalMaterial color={mauChatLong} transparent opacity={0.75} roughness={0.08} metalness={0.1} />
              </mesh>
              
              {/* Bubbles */}
              {effect === 'bubble' && (
                <Sparkles count={50} scale={[0.6, chieuCaoChatLong, 0.6]} size={4} speed={0.8} opacity={0.6} color="#ffffff" />
              )}
              
              {/* Precipitate */}
              {effect === 'precipitate' && (
                <mesh position={[0, -chieuCaoChatLong / 2 + 0.05, 0]}>
                  <cylinderGeometry args={[0.36, 0.36, 0.1, 64]} />
                  <meshStandardMaterial color={precipitateColor} roughness={0.9} />
                </mesh>
              )}
            </group>
          );
        })()}
      </group>
    </DoiTuongKeoTha>
  );
};
export default React.memo(CocThuyTinh);
