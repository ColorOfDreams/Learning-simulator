import React from 'react';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

export const MatPhangToaDo: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Mặt Phẳng Tọa Độ" kichThuocVaCham={[1.5, 0.05, 1.5]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3, 3]} />
      <meshStandardMaterial color="#f1f5f9" roughness={0.8} side={2} />
    </mesh>
  </DoiTuongKeoTha>
);

export const DoThiParabol: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Đồ Thị Parabol" kichThuocVaCham={[1.0, 0.05, 1.0]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow>
      <boxGeometry args={[2, 0.05, 2]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
    </mesh>
  </DoiTuongKeoTha>
);

export const SongLuongGiac: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Sóng Lượng Giác" kichThuocVaCham={[1.0, 0.05, 1.0]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[2, 0.05, 2]} /><meshStandardMaterial color="#fef3c7" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);

export const TamGiac: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Tam Giác" kichThuocVaCham={[1.0, 0.05, 1.0]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[2, 0.05, 2]} /><meshStandardMaterial color="#dcfce7" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);

export const DuongTron: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Đường Tròn" kichThuocVaCham={[1.0, 0.05, 1.0]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[2, 0.05, 2]} /><meshStandardMaterial color="#dbeafe" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);

export const Vector2D: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Vector 2D" kichThuocVaCham={[0.5, 0.05, 0.5]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[1, 0.05, 1]} /><meshStandardMaterial color="#f3e8ff" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);

export const BangVeDoThi: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bảng Vẽ Đồ Thị" kichThuocVaCham={[1.0, 0.05, 1.0]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[2, 0.05, 2]} /><meshStandardMaterial color="#fce7f3" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);

export const BieuDoThongKe: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Biểu Đồ Thống Kê" kichThuocVaCham={[1.0, 0.05, 1.0]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[2, 0.05, 2]} /><meshStandardMaterial color="#ffedd5" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);
