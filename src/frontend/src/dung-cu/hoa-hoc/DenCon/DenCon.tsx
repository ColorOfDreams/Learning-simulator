import { VatLieuThuyTinh } from '@/dung-cu/dung-chung/VatLieuThuyTinh';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}

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
			khoiRefs.current.forEach((k) => {
				if (k) k.visible = false;
			});
			return;
		}

		// Kiểm tra xem có vật thể nào đang đặt lên đèn cồn không
		let isHeating = false;
		if (doThiScene?.objects) {
			isHeating = doThiScene.objects.some(
				(o) => o.properties?.attachedTo === doiTuong.id || (o as any).thuocTinh?.attachedTo === doiTuong.id,
			);
		}

		const t = state.clock.elapsedTime * 15;

		// Lerp factors for smooth transition
		const targetScaleY = isHeating ? 0.5 : 1.0;
		const targetScaleXZ = isHeating ? 1.8 : 1.0;

		const nhapNhay = (ref: THREE.Group | null, bienDo: number, offset: number) => {
			if (!ref) return;
			const noise = Math.sin(t + offset) * 0.5 + Math.sin(t * 0.7 + offset) * 0.5;

			// Smoothly interpolate scales
			const curScaleY = ref.userData.scaleY || 1.0;
			const curScaleXZ = ref.userData.scaleXZ || 1.0;
			ref.userData.scaleY = THREE.MathUtils.lerp(curScaleY, targetScaleY, 0.1);
			ref.userData.scaleXZ = THREE.MathUtils.lerp(curScaleXZ, targetScaleXZ, 0.1);

			ref.scale.set(
				kichThuocLua * ref.userData.scaleXZ * (0.95 + noise * bienDo * 0.3),
				kichThuocLua * ref.userData.scaleY * (0.9 + noise * bienDo),
				kichThuocLua * ref.userData.scaleXZ * (0.95 + noise * bienDo * 0.3),
			);

			// If heating, move the flame slightly up to touch the bottom
			ref.position.y = noise * 0.01 + (isHeating ? 0.05 : 0);
		};
		nhapNhay(trongRef.current, 0.2, 0);
		nhapNhay(giuaRef.current, 0.15, 2);
		nhapNhay(ngoaiRef.current, 0.25, 4);

		// Tối ưu hóa hiệu ứng khói/hơi nóng
		khoiRefs.current.forEach((khoi, i) => {
			if (!khoi) return;
			khoi.visible = true;
			khoi.position.y += 0.015 * kichThuocLua * (isHeating ? 0.5 : 1.0);

			// Spread out more if heating
			const spreadX = isHeating ? Math.sin(t * 0.5 + i) * 0.015 : Math.sin(t * 0.5 + i) * 0.005;
			const spreadZ = isHeating ? Math.cos(t * 0.4 + i) * 0.015 : 0;
			khoi.position.x += spreadX;
			khoi.position.z += spreadZ;

			const mat = khoi.material as THREE.MeshStandardMaterial;
			if (mat) mat.opacity = Math.max(0, mat.opacity - 0.01);

			khoi.scale.setScalar(khoi.scale.x * 0.98);

			const maxY = isHeating ? 0.2 * kichThuocLua : 0.4 * kichThuocLua;
			if (khoi.position.y > maxY) {
				khoi.position.y = 0.15;
				khoi.position.x = (Math.random() - 0.5) * (isHeating ? 0.15 : 0.05);
				khoi.position.z = (Math.random() - 0.5) * (isHeating ? 0.15 : 0.05);
				khoi.scale.setScalar(1 + Math.random() * 0.5);
				if (mat) mat.opacity = isHeating ? 0.2 : 0.4;
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
		<DoiTuongKeoTha
			doiTuong={doiTuong}
			nhan='Đèn Cồn'
			kichThuocVaCham={[0.8, 0.8, 0.8]}
			dangChay={dangChay}
			capNhatViTri={capNhatViTri}
			doThiScene={doThiScene}
		>
			<group position={[0, -0.4, 0]}>
				{/* Thân bình thủy tinh */}
				<mesh>
					<latheGeometry args={[points, 32]} />
					<VatLieuThuyTinh />
				</mesh>

				{/* Nước cồn màu xanh nhạt bên trong */}
				<mesh position={[0, 0.2, 0]}>
					<cylinderGeometry args={[0.22, 0.33, 0.38, 32]} />
					<meshPhysicalMaterial color='#3b82f6' transparent opacity={0.6} roughness={0.1} />
				</mesh>

				{/* Nắp kim loại (vặn) */}
				<mesh position={[0, 0.68, 0]}>
					<cylinderGeometry args={[0.13, 0.13, 0.1, 32]} />
					<meshStandardMaterial color='#cbd5e1' roughness={0.4} metalness={0.8} />
				</mesh>

				{/* Sợi bấc (wick) */}
				<mesh position={[0, 0.78, 0]}>
					<cylinderGeometry args={[0.04, 0.04, 0.15, 16]} />
					<meshStandardMaterial color='#fef08a' roughness={0.9} />
				</mesh>

				{/* Nút giả lập (để trang trí, ví dụ núm vặn nhỏ bên cạnh) */}
				<mesh position={[0.13, 0.68, 0]} rotation={[0, 0, Math.PI / 2]}>
					<cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
					<meshStandardMaterial color='#94a3b8' roughness={0.5} metalness={0.7} />
				</mesh>

				{/* Lửa và Khói */}
				{dangChayLua && (
					<group position={[0, 0.85, 0]}>
						{/* Lửa */}
						<group ref={trongRef} position={[0, 0.05, 0]}>
							<mesh>
								<sphereGeometry args={[0.03, 16, 16]} />
								<meshBasicMaterial color='#00ffff' transparent opacity={0.6} blending={THREE.AdditiveBlending} />
							</mesh>
						</group>
						<group ref={giuaRef} position={[0, 0.12, 0]}>
							<mesh>
								<sphereGeometry args={[0.045, 16, 16]} />
								<meshBasicMaterial color='#ffdd44' transparent opacity={0.8} blending={THREE.AdditiveBlending} />
							</mesh>
						</group>
						<group ref={ngoaiRef} position={[0, 0.18, 0]}>
							<mesh>
								<sphereGeometry args={[0.055, 16, 16]} />
								<meshBasicMaterial color='#ff6600' transparent opacity={0.4} blending={THREE.AdditiveBlending} />
							</mesh>
						</group>

						{/* Hơi nóng (thay cho khói đen) */}
						{[0, 1, 2].map((i) => (
							<mesh
								key={i}
								ref={(el) => {
									khoiRefs.current[i] = el;
								}}
								position={[0, 0.2 + i * 0.05, 0]}
							>
								<sphereGeometry args={[0.04, 8, 8]} />
								<meshBasicMaterial
									color='#ffffff'
									transparent
									opacity={0.1}
									depthWrite={false}
									blending={THREE.AdditiveBlending}
								/>
							</mesh>
						))}
					</group>
				)}

				{/* Kệ đỡ (Tripod) - Chân rộng hơn để bao ngoài đèn cồn */}
				<group position={[0, 0, 0]}>
					{/* Vòng đỡ phía trên */}
					<mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
						<torusGeometry args={[0.32, 0.02, 16, 32]} />
						<meshStandardMaterial color='#334155' roughness={0.8} metalness={0.7} />
					</mesh>
					{/* 3 chân đỡ (chạm đất tại Y=0) */}
					{[0, 1, 2].map((i) => {
						const angle = (i * Math.PI * 2) / 3;
						// Bán kính chân ở trên là 0.32 (bằng vòng đỡ)
						// Bán kính chân ở dưới là 0.42 (rộng hơn đáy đèn cồn)
						return (
							<mesh
								key={i}
								position={[Math.cos(angle) * 0.37, 0.55, Math.sin(angle) * 0.37]}
								rotation={[0, -angle + Math.PI / 2, 0]}
							>
								<cylinderGeometry args={[0.015, 0.015, 1.1, 8]} />
								<meshStandardMaterial color='#334155' roughness={0.8} metalness={0.7} />
							</mesh>
						);
					})}
				</group>
			</group>
		</DoiTuongKeoTha>
	);
};
export default React.memo(DenCon);
