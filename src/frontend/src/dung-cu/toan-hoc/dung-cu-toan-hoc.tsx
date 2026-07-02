import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { Line, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Props {
	doiTuong: Scene.Object;
	dangChay?: boolean;
	capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
	doThiScene?: Scene.IRecord | null;
}

const MathBoard = ({ children, title }: { children: React.ReactNode; title: string }) => (
	<group>
		{/* Bảng đen */}
		<mesh castShadow receiveShadow position={[0, 0, -0.05]}>
			<boxGeometry args={[4, 3, 0.1]} />
			<meshStandardMaterial color='#1e293b' roughness={0.9} />
		</mesh>
		{/* Viền gỗ */}
		<mesh position={[0, 0, -0.05]}>
			<boxGeometry args={[4.2, 3.2, 0.15]} />
			<meshStandardMaterial color='#8b5cf6' roughness={0.7} />
		</mesh>
		<Text position={[0, 1.3, 0.01]} fontSize={0.2} color='#f8fafc' anchorX='center' anchorY='middle'>
			{title}
		</Text>
		{/* Lưới trục tọa độ */}
		<group position={[0, -0.2, 0.01]}>
			<gridHelper args={[3.8, 10, '#334155', '#334155']} rotation={[Math.PI / 2, 0, 0]} />
			{/* Trục x, y */}
			<Line
				points={[
					[-1.9, 0, 0],
					[1.9, 0, 0],
				]}
				color='#94a3b8'
				lineWidth={2}
			/>
			<Line
				points={[
					[0, -1.4, 0],
					[0, 1.2, 0],
				]}
				color='#94a3b8'
				lineWidth={2}
			/>
			{children}
		</group>
	</group>
);

export const MatPhangToaDo: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Mặt Phẳng Tọa Độ'
		kichThuocVaCham={[1.5, 0.05, 1.5]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[3, 3]} />
			<meshStandardMaterial color='#f1f5f9' roughness={0.8} side={2} />
		</mesh>
	</DoiTuongKeoTha>
);

export const DoThiParabol: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
	const a = doiTuong.thuocTinh?.a ?? doiTuong.properties?.a ?? 1;
	const b = doiTuong.thuocTinh?.b ?? doiTuong.properties?.b ?? 0;
	const c = doiTuong.thuocTinh?.c ?? doiTuong.properties?.c ?? 0;

	const points = useMemo(() => {
		const pts = [];
		for (let x = -3.8; x <= 3.8; x += 0.1) {
			const y = a * x * x + b * x + c;
			// Scale down by 0.5 to fit on the board nicer
			pts.push(new THREE.Vector3(x * 0.5, y * 0.5, 0));
		}
		return pts;
	}, [a, b, c]);

	return (
		<DoiTuongKeoTha
			doiTuong={doiTuong}
			nhan='Đồ Thị Parabol'
			kichThuocVaCham={[4.0, 3.0, 0.2]}
			dangChay={dangChay}
			capNhatViTri={capNhatViTri}
			doThiScene={doThiScene}
			coDinh
		>
			<MathBoard title={`y = ${a}x² + ${b}x + ${c}`}>
				{points.length > 1 && <Line points={points} color='#4ade80' lineWidth={3} />}
			</MathBoard>
		</DoiTuongKeoTha>
	);
};

export const SongLuongGiac: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
	const A = doiTuong.thuocTinh?.A ?? doiTuong.properties?.A ?? 1;
	const omega = doiTuong.thuocTinh?.omega ?? doiTuong.properties?.omega ?? 1;
	const phi = doiTuong.thuocTinh?.phi ?? doiTuong.properties?.phi ?? 0;

	const timeRef = useRef(0);
	const dotRef = useRef<THREE.Mesh>(null);

	const points = useMemo(() => {
		const pts = [];
		for (let x = -1.9; x <= 1.9; x += 0.05) {
			pts.push(new THREE.Vector3(x, A * Math.sin(omega * x + phi), 0));
		}
		return pts;
	}, [A, omega, phi]);

	useFrame((_, delta) => {
		if (dangChay) {
			timeRef.current += delta;
		}
		if (dotRef.current) {
			const cycle = 3.8;
			const t = timeRef.current;
			const x = ((t * 1.5) % cycle) - 1.9;
			const y = A * Math.sin(omega * x + phi);
			dotRef.current.position.set(x, y, 0.02);
		}
	});

	return (
		<DoiTuongKeoTha
			doiTuong={doiTuong}
			nhan='Sóng Lượng Giác'
			kichThuocVaCham={[4.0, 3.0, 0.2]}
			dangChay={dangChay}
			capNhatViTri={capNhatViTri}
			doThiScene={doThiScene}
			coDinh
		>
			<MathBoard title={`y = ${A} sin(${omega}x + ${phi})`}>
				{points.length > 1 && <Line points={points} color='#fb923c' lineWidth={3} />}
				<mesh ref={dotRef}>
					<sphereGeometry args={[0.08, 16, 16]} />
					<meshStandardMaterial color='#ef4444' />
				</mesh>
			</MathBoard>
		</DoiTuongKeoTha>
	);
};

export const TamGiac: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Tam Giác'
		kichThuocVaCham={[1.0, 0.05, 1.0]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<mesh castShadow>
			<boxGeometry args={[2, 0.05, 2]} />
			<meshStandardMaterial color='#dcfce7' roughness={0.5} />
		</mesh>
	</DoiTuongKeoTha>
);

export const DuongTron: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Đường Tròn'
		kichThuocVaCham={[1.0, 0.05, 1.0]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<mesh castShadow>
			<boxGeometry args={[2, 0.05, 2]} />
			<meshStandardMaterial color='#dbeafe' roughness={0.5} />
		</mesh>
	</DoiTuongKeoTha>
);

export const Vector2D: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Vector 2D'
		kichThuocVaCham={[0.5, 0.05, 0.5]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<mesh castShadow>
			<boxGeometry args={[1, 0.05, 1]} />
			<meshStandardMaterial color='#f3e8ff' roughness={0.5} />
		</mesh>
	</DoiTuongKeoTha>
);

export const BangVeDoThi: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Bảng Vẽ Đồ Thị'
		kichThuocVaCham={[1.0, 0.05, 1.0]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<mesh castShadow>
			<boxGeometry args={[2, 0.05, 2]} />
			<meshStandardMaterial color='#fce7f3' roughness={0.5} />
		</mesh>
	</DoiTuongKeoTha>
);

export const BieuDoThongKe: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
	<DoiTuongKeoTha
		doiTuong={doiTuong}
		nhan='Biểu Đồ Thống Kê'
		kichThuocVaCham={[1.0, 0.05, 1.0]}
		dangChay={dangChay}
		capNhatViTri={capNhatViTri}
		doThiScene={doThiScene}
		coDinh
	>
		<mesh castShadow>
			<boxGeometry args={[2, 0.05, 2]} />
			<meshStandardMaterial color='#ffedd5' roughness={0.5} />
		</mesh>
	</DoiTuongKeoTha>
);
