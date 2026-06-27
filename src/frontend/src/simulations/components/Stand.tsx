import React from 'react';
import DraggablePhysicsObject from '../engine/DraggablePhysicsObject';

interface Props {
	object: Scene.Object;
	isPlaying?: boolean;
	interactionMode?: 'observe' | 'practice';
	onUpdatePosition?: (id: string, position: [number, number, number]) => void;
	sceneGraph?: Scene.IRecord | null;
}

const Stand: React.FC<Props> = ({ object, isPlaying, interactionMode, onUpdatePosition, sceneGraph }) => {
	return (
		<DraggablePhysicsObject
			object={object}
			label='Giá Đỡ'
			colliderArgs={[1, 2.5, 1]}
			isPlaying={isPlaying}
			interactionMode={interactionMode}
			onUpdatePosition={onUpdatePosition}
			sceneGraph={sceneGraph}
		>
			<group>
				{/* Đế nặng */}
				<mesh position={[0, -2.4, 0]} castShadow receiveShadow>
					<boxGeometry args={[2, 0.2, 2]} />
					<meshStandardMaterial color='#1f2937' metalness={0.8} roughness={0.2} />
				</mesh>

				{/* Cột dọc */}
				<mesh position={[0, 0, 0]} castShadow receiveShadow>
					<cylinderGeometry args={[0.1, 0.1, 5]} />
					<meshStandardMaterial color='#d1d5db' metalness={0.9} roughness={0.1} />
				</mesh>

				{/* Thanh ngang */}
				<mesh position={[0.8, 2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
					<cylinderGeometry args={[0.08, 0.08, 1.6]} />
					<meshStandardMaterial color='#d1d5db' metalness={0.9} roughness={0.1} />
				</mesh>

				{/* Kẹp */}
				<mesh position={[1.6, 2, 0]} castShadow receiveShadow>
					<boxGeometry args={[0.3, 0.3, 0.3]} />
					<meshStandardMaterial color='#ef4444' roughness={0.5} />
				</mesh>
			</group>
		</DraggablePhysicsObject>
	);
};

export default Stand;
