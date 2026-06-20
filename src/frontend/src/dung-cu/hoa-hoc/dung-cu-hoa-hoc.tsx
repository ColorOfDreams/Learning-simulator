import React from 'react';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { VatLieuThuyTinh } from '@/dung-cu/dung-chung/VatLieuThuyTinh';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

export const OngNghiem: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Ống Nghiệm" kichThuocVaCham={[0.1, 0.6, 0.1]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <mesh castShadow><cylinderGeometry args={[0.08, 0.06, 1.2, 32]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const BinhTamGiac: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bình Tam Giác" kichThuocVaCham={[0.35, 0.5, 0.35]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <mesh castShadow><coneGeometry args={[0.35, 1.0, 32]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const BinhCau: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bình Cầu" kichThuocVaCham={[0.35, 0.5, 0.35]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <group><mesh castShadow position={[0, 0.3, 0]}><cylinderGeometry args={[0.06, 0.06, 0.4, 16]} /><VatLieuThuyTinh /></mesh>
    <mesh castShadow position={[0, -0.3, 0]}><sphereGeometry args={[0.35, 32, 32]} /><VatLieuThuyTinh /></mesh></group>
  </DoiTuongKeoTha>
);
export const Buret: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Buret" kichThuocVaCham={[0.06, 1.5, 0.06]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><cylinderGeometry args={[0.05, 0.05, 3.0, 16]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const Pipet: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Pipet" kichThuocVaCham={[0.04, 0.8, 0.04]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><cylinderGeometry args={[0.03, 0.03, 1.6, 16]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const NhietKe: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const nhietDo = doiTuong.thuocTinh?.nhietDo || doiTuong.properties?.temperature || 25;
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Nhiệt Kế" kichThuocVaCham={[0.05, 0.6, 0.05]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
      <mesh castShadow><cylinderGeometry args={[0.04, 0.04, 1.2, 16]} /><VatLieuThuyTinh /></mesh>
    </DoiTuongKeoTha>
  );
};
export const OngSinhHan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Ống Sinh Hàn" kichThuocVaCham={[0.08, 0.6, 0.08]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><cylinderGeometry args={[0.06, 0.06, 1.2, 16]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const CoiChay: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Cối Chày" kichThuocVaCham={[0.2, 0.15, 0.2]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <mesh castShadow><cylinderGeometry args={[0.2, 0.15, 0.3, 32]} /><meshStandardMaterial color="#e2e8f0" roughness={0.3} /></mesh>
  </DoiTuongKeoTha>
);
export const ChatRan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Chất Rắn" kichThuocVaCham={[0.15, 0.15, 0.15]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <mesh castShadow><icosahedronGeometry args={[0.15, 1]} /><meshStandardMaterial color="#a855f7" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);
export const ChatLong: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Chất Lỏng" kichThuocVaCham={[0.15, 0.15, 0.15]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <mesh castShadow><sphereGeometry args={[0.15, 16, 16]} /><meshPhysicalMaterial color="#06b6d4" roughness={0.1} transparent opacity={0.7} /></mesh>
  </DoiTuongKeoTha>
);
export const ChatKhi: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Chất Khí" kichThuocVaCham={[0.15, 0.15, 0.15]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <mesh castShadow><sphereGeometry args={[0.2, 8, 8]} /><meshStandardMaterial color="#e0f2fe" roughness={0.1} transparent opacity={0.3} /></mesh>
  </DoiTuongKeoTha>
);
export const BangTuanHoan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bảng Tuần Hoàn" kichThuocVaCham={[1.5, 1.0, 0.05]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[3.0, 2.0, 0.05]} /><meshStandardMaterial color="#f8fafc" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);
