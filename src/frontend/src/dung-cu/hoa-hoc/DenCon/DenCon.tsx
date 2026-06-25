import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import NutBam from '@/dung-cu/dung-chung/NutBam';
import { VatLieuThuyTinh } from '@/dung-cu/dung-chung/VatLieuThuyTinh';

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

const DenCon: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const trongRef = useRef<THREE.Group>(null);
  const giuaRef = useRef<THREE.Group>(null);
  const ngoaiRef = useRef<THREE.Group>(null);

  const khoiRefs = useRef<(THREE.Mesh | null)[]>([]);

  const batDen = doiTuong.thuocTinh?.batDen ?? doiTuong.properties?.batDen ?? false;
  const kichThuocLua = doiTuong.thuocTinh?.kichThuocLua ?? doiTuong.properties?.kichThuocLua ?? 1;

  const dangChayLua = batDen;

  useFrame((state) => {
    if (!dangChayLua) {
      // Hide smoke when off
      khoiRefs.current.forEach(k => { if (k) k.visible = false; });
      return;
    }
    
    const t = state.clock.elapsedTime * 15;
    const nhapNhay = (ref: THREE.Group | null, bienDo: number, offset: number) => {
      if (!ref) return;
      const noise = Math.sin(t + offset) * 0.5 + Math.sin(t * 0.7 + offset) * 0.5;
      ref.scale.set(
        kichThuocLua * (0.95 + noise * bienDo * 0.3),
        kichThuocLua * (0.9 + noise * bienDo),
        kichThuocLua * (0.95 + noise * bienDo * 0.3)
      );
      ref.position.y = noise * 0.01;
    };
    nhapNhay(trongRef.current, 0.2, 0);
    nhapNhay(giuaRef.current, 0.15, 2);
    nhapNhay(ngoaiRef.current, 0.25, 4);

    // Smoke animation
    khoiRefs.current.forEach((khoi, i) => {
      if (!khoi) return;
      khoi.visible = true;
      khoi.position.y += 0.015 * kichThuocLua;
      khoi.position.x += Math.sin(t * 0.5 + i) * 0.005;
      
      const mat = khoi.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = Math.max(0, mat.opacity - 0.01);
      
      khoi.scale.setScalar(khoi.scale.x * 0.98);
      
      if (khoi.position.y > 0.4 * kichThuocLua) {
        khoi.position.y = 0.15;
        khoi.position.x = (Math.random() - 0.5) * 0.05;
        khoi.scale.setScalar(1 + Math.random() * 0.5);
        if (mat) mat.opacity = 0.4;
      }
    });
  });

  // Tạo điểm cho thân bình thủy tinh
  const points = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector2(0, 0)); // Tâm đáy
    pts.push(new THREE.Vector2(0.35, 0)); // Rìa đáy
    pts.push(new THREE.Vector2(0.35, 0.1)); // Bo lên
    pts.push(new THREE.Vector2(0.15, 0.5)); // Thu nhỏ lên cổ bình
    pts.push(new THREE.Vector2(0.12, 0.55)); // Cổ bình thẳng
    pts.push(new THREE.Vector2(0.12, 0.65)); // Miệng bình
    return pts;
  }, []);

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Đèn Cồn" kichThuocVaCham={[0.8, 0.8, 0.8]}
      dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <group position={[0, -0.4, 0]}>
        {/* Thân bình thủy tinh */}
        <mesh>
          <latheGeometry args={[points, 32]} />
          <VatLieuThuyTinh />
        </mesh>

        {/* Nước cồn màu xanh nhạt bên trong */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.22, 0.33, 0.38, 32]} />
          <meshPhysicalMaterial color="#3b82f6" transparent opacity={0.6} roughness={0.1} />
        </mesh>

        {/* Nắp kim loại (vặn) */}
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 32]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.8} />
        </mesh>

        {/* Sợi bấc (wick) */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.15, 16]} />
          <meshStandardMaterial color="#fef08a" roughness={0.9} />
        </mesh>

        {/* Nút giả lập (để trang trí, ví dụ núm vặn nhỏ bên cạnh) */}
        <mesh position={[0.13, 0.68, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Lửa và Khói */}
        {dangChayLua && (
          <group position={[0, 0.85, 0]}>
            {/* Lửa */}
            <group ref={trongRef} position={[0, 0.05, 0]}><mesh><sphereGeometry args={[0.025, 16, 16]} /><meshStandardMaterial color="#0066ff" emissive="#0044cc" emissiveIntensity={2} transparent opacity={0.9} /></mesh></group>
            <group ref={giuaRef} position={[0, 0.1, 0]}><mesh><coneGeometry args={[0.035, 0.2, 16]} /><meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={1.5} transparent opacity={0.8} /></mesh></group>
            <group ref={ngoaiRef} position={[0, 0.12, 0]}><mesh><coneGeometry args={[0.05, 0.28, 16]} /><meshStandardMaterial color="#ff6600" emissive="#cc3300" emissiveIntensity={1} transparent opacity={0.6} /></mesh></group>
            
            {/* Khói */}
            {[0, 1, 2, 3, 4].map(i => (
              <mesh key={i} ref={el => { khoiRefs.current[i] = el; }} position={[0, 0.2 + i * 0.05, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#444444" transparent opacity={0.4} depthWrite={false} />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </DoiTuongKeoTha>
  );
};
export default React.memo(DenCon);
