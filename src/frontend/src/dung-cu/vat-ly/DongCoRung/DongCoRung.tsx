import NutBam from '@/dung-cu/dung-chung/NutBam';
import DoiTuongKeoTha, { getSnapPointsForModel } from '@/simulations/engine/DraggablePhysicsObject';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}
const DongCoRung: React.FC<Props> = ({ doiTuong, dangChay = false, capNhatViTri, doThiScene }) => {
	const banhXeRef = useRef<THREE.Mesh>(null);
	const thanhTruotRef = useRef<THREE.Mesh>(null);
	const thoiGianRef = useRef(0);

	const thuocTinh = doiTuong.thuocTinh || doiTuong.properties || {};
	const dangBat = thuocTinh.dangBat ?? true;

	useFrame((_, delta) => {
		if (dangChay && dangBat) {
			thoiGianRef.current += delta;
			const tanSo = thuocTinh.tanSo || thuocTinh.frequency || 2;
			const bienDo = thuocTinh.bienDo || thuocTinh.amplitude || 0.3;
			const goc = thoiGianRef.current * tanSo * Math.PI * 2;
			if (banhXeRef.current) banhXeRef.current.rotation.z = goc;
			if (thanhTruotRef.current) thanhTruotRef.current.position.y = bienDo * Math.sin(goc);
		}
	});

	const handleToggle = () => {
		const props = doiTuong.thuocTinh || doiTuong.properties;
		if (props) props.dangBat = !dangBat;
	};

	return (
		<DoiTuongKeoTha
			doiTuong={doiTuong}
			nhan='Động Cơ Rung'
			kichThuocVaCham={[0.4, 0.3, 0.3]}
			dangChay={dangChay}
			capNhatViTri={capNhatViTri}
			doThiScene={doThiScene}
			diemSnap={getSnapPointsForModel('DrivingMotor', thuocTinh)}
		>
			<group>
				<mesh castShadow receiveShadow>
					<boxGeometry args={[0.8, 0.6, 0.6]} />
					<meshPhysicalMaterial color='#475569' roughness={0.2} metalness={0.9} clearcoat={0.2} />
				</mesh>
				<mesh ref={banhXeRef} position={[0.45, 0, 0]} castShadow>
					<cylinderGeometry args={[0.15, 0.15, 0.08, 32]} />
					<meshPhysicalMaterial color={dangBat ? '#ef4444' : '#64748b'} roughness={0.15} metalness={0.95} />
				</mesh>
				<mesh ref={thanhTruotRef} position={[0, 0.3, 0]} castShadow>
					<cylinderGeometry args={[0.04, 0.04, 0.5]} />
					<meshPhysicalMaterial color='#94a3b8' metalness={0.95} roughness={0.08} />
				</mesh>
				<mesh position={[0, 0.55, 0]} castShadow>
					<torusGeometry args={[0.12, 0.04, 8, 16]} />
					<meshStandardMaterial color='#f59e0b' metalness={0.9} roughness={0.1} />
				</mesh>
				<NutBam
					viTri={[-0.4, 0.05, 0.32]}
					kichThuoc={0.03}
					mau={dangBat ? '#22c55e' : '#ef4444'}
					mauKhiBam='#991b1b'
					dangBam={!dangBat}
					khiBam={handleToggle}
				/>
			</group>
		</DoiTuongKeoTha>
	);
};
export default React.memo(DongCoRung);
