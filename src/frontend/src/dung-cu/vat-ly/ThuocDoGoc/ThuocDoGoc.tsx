import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { Text } from '@react-three/drei';
import React from 'react';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}
const ThuocDoGoc: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Thước Đo Góc'
		kichThuocVaCham={[0.3, 0.3, 0.05]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<group>
			<mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
				<torusGeometry args={[0.28, 0.02, 8, 32, Math.PI]} />
				<meshPhysicalMaterial color='#e2e8f0' roughness={0.15} metalness={0.5} clearcoat={0.3} />
			</mesh>
			{[0, 30, 60, 90, 120, 150, 180].map((deg) => {
				const rad = (deg * Math.PI) / 180;
				const r = 0.26;
				return (
					<group key={deg}>
						<mesh position={[Math.sin(rad) * r, 0, Math.cos(rad) * r]} rotation={[-Math.PI / 2, 0, rad]}>
							<boxGeometry args={[0.015, 0.003, 0.002]} />
							<meshStandardMaterial color='#1e293b' roughness={0.5} />
						</mesh>
						<Text
							position={[Math.sin(rad) * 0.22, 0.015, Math.cos(rad) * 0.22]}
							fontSize={0.03}
							color='#475569'
							anchorX='center'
							anchorY='middle'
						>
							{deg}°
						</Text>
					</group>
				);
			})}
		</group>
	</DoiTuongKeoTha>
);
export default React.memo(ThuocDoGoc);
