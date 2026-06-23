import React from 'react';

interface RoomEnvironmentProps {
	roomType: 'physics' | 'chemistry' | 'math';
}

const RoomEnvironment: React.FC<RoomEnvironmentProps> = ({ roomType }) => {
	// Render bàn và môi trường tùy theo môn học
	const renderChemistryRoom = () => (
		<group>
			{/* Tường gạch men trắng sáng */}
			<mesh position={[0, 5, -8]} receiveShadow>
				<boxGeometry args={[40, 15, 0.5]} />
				<meshStandardMaterial color='#ffffff' roughness={0.2} metalness={0.1} />
			</mesh>

			{/* Bảng tuần hoàn (Bảng trắng lớn có viền bạc) */}
			<group position={[0, 5, -7.7]}>
				<mesh receiveShadow>
					<planeGeometry args={[14, 7]} />
					<meshStandardMaterial color='#f8fafc' roughness={0.4} />
				</mesh>
				{/* Khung nhôm */}
				<mesh position={[0, 3.6, 0.1]}>
					<boxGeometry args={[14.2, 0.2, 0.1]} />
					<meshStandardMaterial color='#94a3b8' metalness={0.8} roughness={0.2} />
				</mesh>
				<mesh position={[0, -3.6, 0.1]}>
					<boxGeometry args={[14.2, 0.2, 0.1]} />
					<meshStandardMaterial color='#94a3b8' metalness={0.8} roughness={0.2} />
				</mesh>
				<mesh position={[-7.1, 0, 0.1]}>
					<boxGeometry args={[0.2, 7, 0.1]} />
					<meshStandardMaterial color='#94a3b8' metalness={0.8} roughness={0.2} />
				</mesh>
				<mesh position={[7.1, 0, 0.1]}>
					<boxGeometry args={[0.2, 7, 0.1]} />
					<meshStandardMaterial color='#94a3b8' metalness={0.8} roughness={0.2} />
				</mesh>
			</group>

			{/* Bàn đá Granite đen nguyên khối, chống ăn mòn */}
			<mesh receiveShadow castShadow position={[0, -1, 0]}>
				<boxGeometry args={[20, 0.8, 10]} />
				<meshStandardMaterial color='#111827' roughness={0.1} metalness={0.5} />
			</mesh>

			{/* Khối đế bàn xây bằng gạch men trắng */}
			<mesh receiveShadow castShadow position={[0, -1.9, 0]}>
				<boxGeometry args={[18, 1.0, 8]} />
				<meshStandardMaterial color='#f1f5f9' roughness={0.3} />
			</mesh>

			{/* Sàn gạch men xám nhạt */}
			<mesh receiveShadow position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[50, 50]} />
				<meshStandardMaterial color='#e2e8f0' roughness={0.3} metalness={0.1} />
			</mesh>
		</group>
	);

	const renderPhysicsRoom = () => (
		<group>
			{/* Tường bê tông mài xám nhạt */}
			<mesh position={[0, 5, -8]} receiveShadow>
				<boxGeometry args={[40, 15, 0.5]} />
				<meshStandardMaterial color='#cbd5e1' roughness={0.9} />
			</mesh>

			{/* Bảng đen (Blackboard) lớn có viền gỗ */}
			<group position={[0, 5, -7.7]}>
				<mesh receiveShadow>
					<planeGeometry args={[16, 6]} />
					<meshStandardMaterial color='#064e3b' roughness={0.9} />
				</mesh>
				{/* Viền bảng */}
				<mesh position={[0, 3.1, 0.1]} receiveShadow>
					<boxGeometry args={[16.4, 0.2, 0.2]} />
					<meshStandardMaterial color='#8b5a2b' roughness={0.8} />
				</mesh>
				<mesh position={[0, -3.1, 0.1]} receiveShadow>
					<boxGeometry args={[16.4, 0.2, 0.2]} />
					<meshStandardMaterial color='#8b5a2b' roughness={0.8} />
				</mesh>
				<mesh position={[-8.1, 0, 0.1]} receiveShadow>
					<boxGeometry args={[0.2, 6, 0.2]} />
					<meshStandardMaterial color='#8b5a2b' roughness={0.8} />
				</mesh>
				<mesh position={[8.1, 0, 0.1]} receiveShadow>
					<boxGeometry args={[0.2, 6, 0.2]} />
					<meshStandardMaterial color='#8b5a2b' roughness={0.8} />
				</mesh>
			</group>

			{/* Bàn gỗ ép xám nhạt (Mặt bàn) */}
			<mesh receiveShadow castShadow position={[0, -1, 0]}>
				<boxGeometry args={[20, 0.5, 10]} />
				<meshStandardMaterial color='#e5e7eb' roughness={0.7} metalness={0.1} />
			</mesh>

			{/* Chân bàn bằng thép đen */}
			<mesh receiveShadow castShadow position={[-9, -1.75, -4]}>
				<boxGeometry args={[0.5, 1.5, 0.5]} />
				<meshStandardMaterial color='#1f2937' metalness={0.6} roughness={0.4} />
			</mesh>
			<mesh receiveShadow castShadow position={[9, -1.75, -4]}>
				<boxGeometry args={[0.5, 1.5, 0.5]} />
				<meshStandardMaterial color='#1f2937' metalness={0.6} roughness={0.4} />
			</mesh>
			<mesh receiveShadow castShadow position={[-9, -1.75, 4]}>
				<boxGeometry args={[0.5, 1.5, 0.5]} />
				<meshStandardMaterial color='#1f2937' metalness={0.6} roughness={0.4} />
			</mesh>
			<mesh receiveShadow castShadow position={[9, -1.75, 4]}>
				<boxGeometry args={[0.5, 1.5, 0.5]} />
				<meshStandardMaterial color='#1f2937' metalness={0.6} roughness={0.4} />
			</mesh>

			{/* Sàn gỗ dán */}
			<mesh receiveShadow position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[50, 50]} />
				<meshStandardMaterial color='#d97706' roughness={0.6} metalness={0.1} />
			</mesh>
		</group>
	);

	const renderMathRoom = () => (
		<group>
			{/* Tường hiện đại màu xanh nhạt */}
			<mesh position={[0, 5, -8]} receiveShadow>
				<boxGeometry args={[40, 15, 0.5]} />
				<meshStandardMaterial color='#e0f2fe' roughness={0.9} />
			</mesh>

			{/* Bảng kính trong suốt vẽ hệ tọa độ */}
			<group position={[0, 5, -7.5]}>
				<mesh receiveShadow>
					<planeGeometry args={[18, 8]} />
					<meshStandardMaterial color='#ffffff' roughness={0.1} metalness={0.3} transparent opacity={0.6} />
				</mesh>
				<gridHelper args={[18, 18, '#3b82f6', '#93c5fd']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} />
			</group>

			{/* Bàn làm việc kính */}
			<mesh receiveShadow castShadow position={[0, -1, 0]}>
				<boxGeometry args={[22, 0.2, 12]} />
				<meshStandardMaterial color='#ffffff' roughness={0.05} metalness={0.2} transparent opacity={0.5} />
			</mesh>

			{/* Khung bàn gỗ */}
			<mesh receiveShadow castShadow position={[0, -1.2, 0]}>
				<boxGeometry args={[22, 0.2, 12]} />
				<meshStandardMaterial color='#fcd34d' roughness={0.8} />
			</mesh>
			{/* Chân bàn gỗ xéo */}
			<mesh receiveShadow castShadow position={[-10, -1.85, -5]}>
				<boxGeometry args={[0.4, 1.3, 0.4]} />
				<meshStandardMaterial color='#fcd34d' roughness={0.8} />
			</mesh>
			<mesh receiveShadow castShadow position={[10, -1.85, -5]}>
				<boxGeometry args={[0.4, 1.3, 0.4]} />
				<meshStandardMaterial color='#fcd34d' roughness={0.8} />
			</mesh>
			<mesh receiveShadow castShadow position={[-10, -1.85, 5]}>
				<boxGeometry args={[0.4, 1.3, 0.4]} />
				<meshStandardMaterial color='#fcd34d' roughness={0.8} />
			</mesh>
			<mesh receiveShadow castShadow position={[10, -1.85, 5]}>
				<boxGeometry args={[0.4, 1.3, 0.4]} />
				<meshStandardMaterial color='#fcd34d' roughness={0.8} />
			</mesh>

			{/* Sàn lót thảm màu xanh dương đậm */}
			<mesh receiveShadow position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[50, 50]} />
				<meshStandardMaterial color='#1e3a8a' roughness={0.9} />
			</mesh>
		</group>
	);

	return (
		<>
			{roomType === 'chemistry' && renderChemistryRoom()}
			{roomType === 'physics' && renderPhysicsRoom()}
			{roomType === 'math' && renderMathRoom()}
		</>
	);
};

export default React.memo(RoomEnvironment);
