import DoiTuongKeoTha, { getSnapPointsForModel } from '@/simulations/engine/DraggablePhysicsObject';
import React from 'react';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}
const BoGiamChan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Bộ Giảm Chấn'
		kichThuocVaCham={[0.3, 1.0, 0.3]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
		diemSnap={getSnapPointsForModel('Dashpot', doiTuong?.thuocTinh || doiTuong?.properties)}
	>
		<group>
			<mesh castShadow position={[0, 0.8, 0]}>
				<cylinderGeometry args={[0.2, 0.2, 0.4, 24]} />
				<meshPhysicalMaterial color='#475569' metalness={0.9} roughness={0.2} />
			</mesh>
			<mesh castShadow position={[0, -0.8, 0]}>
				<cylinderGeometry args={[0.18, 0.18, 0.4, 24]} />
				<meshPhysicalMaterial color='#64748b' metalness={0.85} roughness={0.25} />
			</mesh>
			<mesh castShadow position={[0, 0, 0]}>
				<cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
				<meshStandardMaterial color='#94a3b8' metalness={0.7} roughness={0.3} />
			</mesh>
		</group>
	</DoiTuongKeoTha>
);
export default React.memo(BoGiamChan);
