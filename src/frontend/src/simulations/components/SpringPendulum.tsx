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

const SpringPendulum: React.FC<Props> = ({
	object,
	isPlaying = false,
	interactionMode,
	onUpdatePosition,
	sceneGraph,
}) => {
	const mass = object.properties?.mass || 1;
	const stiffness = object.properties?.stiffness || 50;
	const color = object.properties?.color || '#3b82f6';

	const length = 2 + (mass * 9.8) / stiffness;

	const springRef = useRef<THREE.Mesh>(null);
	const bobRef = useRef<THREE.Mesh>(null);
	const timeRef = useRef(0);

	useFrame((state, delta) => {
		if (isPlaying) {
			timeRef.current += delta;
			const omega = Math.sqrt(stiffness / mass);
			// spring displacement: y(t) = A * sin(omega * t)
			// A = 0.4 units amplitude
			const displacement = 0.4 * Math.sin(timeRef.current * omega);
			const currentLength = length + displacement;

			// Update spring scale and position
			if (springRef.current) {
				springRef.current.scale.set(1, currentLength / length, 1);
				springRef.current.position.y = length / 2 - currentLength / 2;
			}

			// Update bob position
			if (bobRef.current) {
				bobRef.current.position.y = length / 2 - currentLength;
			}
		} else {
			// Lerp back to rest state
			timeRef.current = 0;
			if (springRef.current) {
				springRef.current.scale.y = THREE.MathUtils.lerp(springRef.current.scale.y, 1, 0.1);
				const currentLength = length * springRef.current.scale.y;
				springRef.current.position.y = length / 2 - currentLength / 2;
				if (bobRef.current) {
					bobRef.current.position.y = length / 2 - currentLength;
				}
			}
		}
	});

	return (
		<DraggablePhysicsObject
			object={object}
			label='Con Lắc Lò Xo'
			colliderArgs={[0.5, length / 2, 0.5]}
			isPlaying={isPlaying}
			interactionMode={interactionMode}
			onUpdatePosition={onUpdatePosition}
			sceneGraph={sceneGraph}
		>
			<group>
				{/* Điểm neo (không di chuyển) */}
				<mesh position={[0, length / 2, 0]} castShadow>
					<boxGeometry args={[0.6, 0.1, 0.6]} />
					<meshStandardMaterial color='#1f2937' metalness={0.7} roughness={0.3} />
				</mesh>

				{/* Lò xo (co giãn) */}
				<mesh ref={springRef} position={[0, 0, 0]} castShadow>
					<cylinderGeometry args={[0.15, 0.15, length, 16]} />
					<meshStandardMaterial color='#94a3b8' wireframe={true} />
				</mesh>

				{/* Quả nặng (di chuyển theo lò xo) */}
				<mesh ref={bobRef} position={[0, -length / 2, 0]} castShadow receiveShadow>
					<boxGeometry args={[0.4, 0.4, 0.4]} />
					<meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
				</mesh>
			</group>
		</DraggablePhysicsObject>
	);
};

export default React.memo(SpringPendulum);
