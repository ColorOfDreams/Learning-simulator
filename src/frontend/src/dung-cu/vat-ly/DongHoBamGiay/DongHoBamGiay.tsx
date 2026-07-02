import NutBam from '@/dung-cu/dung-chung/NutBam';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React from 'react';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}

const DongHoBamGiay: React.FC<Props> = ({ doiTuong, dangChay = false, capNhatViTri, doThiScene }) => {
	const thuocTinh = doiTuong.thuocTinh || doiTuong.properties || {};
	const dangChayDongHo = thuocTinh.dangChay ?? thuocTinh.running ?? false;
	const thoiGianDaTroi = thuocTinh.thoiGian ?? thuocTinh.elapsed ?? 0;

	const textRef = React.useRef<any>(null);

	useFrame((_, delta) => {
		if (dangChay && dangChayDongHo) {
			const props = doiTuong.thuocTinh || doiTuong.properties;
			const cur = (props?.thoiGian || props?.elapsed || 0) as number;
			const newTime = cur + delta;
			if (doiTuong.thuocTinh) doiTuong.thuocTinh.thoiGian = newTime;
			else if (doiTuong.properties) doiTuong.properties.elapsed = newTime;

			if (textRef.current) {
				textRef.current.text = `${newTime.toFixed(2)}s`;
			}
		}
	});

	const handleBatTat = () => {
		const props = doiTuong.thuocTinh || doiTuong.properties;
		const dangChay = props?.dangChay ?? props?.running ?? false;
		if (doiTuong.thuocTinh) doiTuong.thuocTinh.dangChay = !dangChay;
		else if (doiTuong.properties) doiTuong.properties.running = !dangChay;
	};

	const handleLap = () => {
		const props = doiTuong.thuocTinh || doiTuong.properties;
		if (!props) return;
		const elapsed = (props.thoiGian || props.elapsed || 0) as number;
		if (elapsed <= 0) return;
		const doDac = (props.ketQuaDo || props.measurements || []) as any[];
		const count = doDac.filter((m: any) => m.loai === 'lap' || m.type === 'lap').length + 1;
		doDac.push({
			id: Date.now().toString(),
			loai: 'lap',
			type: 'lap',
			nhan: 'Lần ' + count,
			label: 'Lần ' + count,
			giaTri: parseFloat(elapsed.toFixed(3)),
			value: parseFloat(elapsed.toFixed(3)),
			thoiGian: Date.now(),
			timestamp: Date.now(),
		});
		if (doiTuong.thuocTinh) doiTuong.thuocTinh.ketQuaDo = doDac;
		else if (doiTuong.properties) doiTuong.properties.measurements = doDac;
	};

	const handleReset = () => {
		if (doiTuong.thuocTinh) {
			doiTuong.thuocTinh.thoiGian = 0;
			doiTuong.thuocTinh.dangChay = false;
			doiTuong.thuocTinh.ketQuaDo = [];
		} else if (doiTuong.properties) {
			doiTuong.properties.elapsed = 0;
			doiTuong.properties.running = false;
			doiTuong.properties.measurements = [];
		}
	};

	return (
		<DoiTuongKeoTha
			doiTuong={doiTuong}
			nhan='Đồng Hồ Bấm Giây'
			kichThuocVaCham={[0.15, 0.1, 0.25]}
			dangChay={dangChay}
			capNhatViTri={capNhatViTri}
			doThiScene={doThiScene}
			coDinh
		>
			<group>
				<mesh castShadow receiveShadow>
					<boxGeometry args={[0.3, 0.2, 0.5]} />
					<meshPhysicalMaterial color='#1e293b' roughness={0.15} metalness={0.6} clearcoat={0.4} />
				</mesh>
				<mesh position={[0, 0.12, 0]}>
					<boxGeometry args={[0.22, 0.04, 0.35]} />
					<meshStandardMaterial color='#0f172a' roughness={0.05} />
				</mesh>
				<Text
					ref={textRef}
					position={[0, 0.13, 0.01]}
					fontSize={0.08}
					color='#22d3ee'
					anchorX='center'
					anchorY='middle'
					font='https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf'
				>
					{thoiGianDaTroi.toFixed(2)}s
				</Text>
				<NutBam
					viTri={[0.08, -0.05, 0.26]}
					kichThuoc={0.025}
					mau={dangChayDongHo ? '#ef4444' : '#22c55e'}
					mauKhiBam='#991b1b'
					dangBam={dangChayDongHo}
					khiBam={handleBatTat}
				/>
				<NutBam viTri={[0.16, -0.05, 0.26]} kichThuoc={0.02} mau='#f59e0b' mauKhiBam='#b45309' khiBam={handleLap} />
				<NutBam viTri={[0.0, -0.05, 0.26]} kichThuoc={0.02} mau='#6366f1' mauKhiBam='#4338ca' khiBam={handleReset} />
				<mesh position={[0, -0.12, 0]}>
					<cylinderGeometry args={[0.06, 0.06, 0.04]} />
					<meshStandardMaterial color='#475569' metalness={0.9} roughness={0.1} />
				</mesh>
			</group>
		</DoiTuongKeoTha>
	);
};

export default React.memo(DongHoBamGiay);
