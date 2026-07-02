import { VatLieuThuyTinh } from '@/dung-cu/dung-chung/VatLieuThuyTinh';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { Text } from '@react-three/drei';
import React from 'react';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}

const NhietKe: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
	const thuocTinh = doiTuong.thuocTinh || doiTuong.properties || {};
	const nhietDo = (thuocTinh.nhietDo || thuocTinh.temperature || 25) as number;
	const chieuCaoHg = Math.min(1.0, Math.max(0, (nhietDo + 10) / 120));

	return (
		<DoiTuongKeoTha
			doiTuong={doiTuong}
			nhan='Nhiệt Kế'
			kichThuocVaCham={[0.05, 0.6, 0.05]}
			dangChay={dangChay}
			capNhatViTri={capNhatViTri}
			doThiScene={doThiScene}
			coDinh
		>
			<group>
				<mesh castShadow position={[0, 0, 0]}>
					<cylinderGeometry args={[0.04, 0.04, 1.2, 16]} />
					<VatLieuThuyTinh />
				</mesh>
				<mesh position={[0, -0.5 + chieuCaoHg / 2, 0]}>
					<cylinderGeometry args={[0.015, 0.015, chieuCaoHg, 8]} />
					<meshStandardMaterial color='#ef4444' emissive='#991b1b' emissiveIntensity={0.3} roughness={0.05} />
				</mesh>
				<mesh position={[0, -0.6, 0]}>
					<sphereGeometry args={[0.025, 16, 16]} />
					<meshStandardMaterial color='#ef4444' emissive='#991b1b' emissiveIntensity={0.3} roughness={0.05} />
				</mesh>
				{[0, 20, 40, 60, 80, 100].map((t) => {
					const y = -0.5 + (t / 100) * 1.0;
					return (
						<group key={t}>
							<mesh position={[0.04, y, 0]}>
								<boxGeometry args={[0.008, 0.002, 0.002]} />
								<meshStandardMaterial color='#1e293b' roughness={0.5} />
							</mesh>
							<Text position={[0.06, y, 0]} fontSize={0.03} color='#1e293b' anchorX='left' anchorY='middle'>
								{t}°
							</Text>
						</group>
					);
				})}
			</group>
		</DoiTuongKeoTha>
	);
};
export default React.memo(NhietKe);
