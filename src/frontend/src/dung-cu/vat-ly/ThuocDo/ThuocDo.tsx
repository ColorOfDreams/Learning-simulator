import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { Text } from '@react-three/drei';
import React from 'react';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}
const ThuocDo: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Thước Đo'
		kichThuocVaCham={[0.5, 0.05, 0.05]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<group>
			<mesh castShadow>
				<boxGeometry args={[1.0, 0.03, 0.04]} />
				<meshPhysicalMaterial color='#fbbf24' roughness={0.2} metalness={0.5} clearcoat={0.4} />
			</mesh>
			{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cm) => (
				<group key={cm}>
					<mesh position={[cm * 0.09 - 0.45, 0.017, 0.02]}>
						<boxGeometry args={[0.002, 0.005, 0.002]} />
						<meshStandardMaterial color='#1e293b' roughness={0.5} />
					</mesh>
					{cm % 5 === 0 && (
						<Text
							position={[cm * 0.09 - 0.45, 0.025, 0.02]}
							fontSize={0.03}
							color='#1e293b'
							anchorX='center'
							anchorY='middle'
						>
							{cm}
						</Text>
					)}
				</group>
			))}
		</group>
	</DoiTuongKeoTha>
);
export default React.memo(ThuocDo);
