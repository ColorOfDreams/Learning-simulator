import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import DraggablePhysicsObject from '../engine/DraggablePhysicsObject';

interface Props {
	object: Scene.Object;
	isPlaying?: boolean;
	interactionMode?: 'observe' | 'practice';
	onUpdatePosition?: (id: string, position: [number, number, number]) => void;
	sceneGraph?: Scene.IRecord | null;
}

const SimplePendulum: React.FC<Props> = ({
	object,
	isPlaying = false,
	interactionMode,
	onUpdatePosition,
	sceneGraph,
}) => {
	const color = object.properties?.color || '#ff0000';
	const length = object.properties?.length || 2;

	const armRef = useRef<THREE.Group>(null);
	const timeRef = useRef(0);

	useFrame((state, delta) => {
		if (isPlaying && armRef.current) {
			timeRef.current += delta;
			// Pendulum physical swing equation: theta = theta_max * sin(t * sqrt(g / L))
			// g = 9.81, theta_max = 0.5 radians (~30 degrees)
			const omega = Math.sqrt(9.81 / length);
			const theta = 0.5 * Math.sin(timeRef.current * omega);
			armRef.current.rotation.z = theta;
		} else if (!isPlaying && armRef.current) {
			// Return slowly to rest position (theta = 0)
			armRef.current.rotation.z = THREE.MathUtils.lerp(armRef.current.rotation.z, 0, 0.1);
			timeRef.current = 0;
		}
	});

	return (
		<DraggablePhysicsObject
			object={object}
			label='Con Lắc Đơn'
			colliderArgs={[0.5, length / 2, 0.5]}
			isPlaying={isPlaying}
			interactionMode={interactionMode}
			onUpdatePosition={onUpdatePosition}
			sceneGraph={sceneGraph}
		>
			<group>
				{/* Điểm neo (không chuyển động) */}
				<mesh position={[0, length / 2, 0]} castShadow>
					<boxGeometry args={[0.4, 0.1, 0.4]} />
					<meshStandardMaterial color='#374151' metalness={0.5} roughness={0.5} />
				</mesh>

				{/* Nhánh dao động xoay quanh điểm neo */}
				<group ref={armRef} position={[0, length / 2, 0]}>
					{/* Dây nối: Dịch chuyển tâm dây xuống phía dưới điểm neo */}
					<mesh position={[0, -length / 2, 0]} castShadow>
						<cylinderGeometry args={[0.015, 0.015, length, 8]} />
						<meshStandardMaterial color='#9ca3af' roughness={0.1} />
					</mesh>

					{/* Quả nặng: Đặt ở cuối dây nối */}
					<mesh position={[0, -length, 0]} castShadow receiveShadow>
						<sphereGeometry args={[0.3, 32, 32]} />
						<meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
					</mesh>
				</group>
			</group>
		</DraggablePhysicsObject>
	);
};

export default SimplePendulum;
