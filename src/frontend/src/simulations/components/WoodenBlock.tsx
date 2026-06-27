import React from 'react';
import DraggablePhysicsObject from '../engine/DraggablePhysicsObject';

interface Props {
	object: Scene.Object;
	isPlaying?: boolean;
	interactionMode?: 'observe' | 'practice';
	onUpdatePosition?: (id: string, position: [number, number, number]) => void;
	sceneGraph?: Scene.IRecord | null;
}

const WoodenBlock: React.FC<Props> = ({ object, isPlaying, interactionMode, onUpdatePosition, sceneGraph }) => {
	const color = object.properties?.color || '#feca57';

	return (
		<DraggablePhysicsObject
			object={object}
			label='Khối Gỗ'
			colliderArgs={[0.75, 0.75, 0.75]}
			isPlaying={isPlaying}
			interactionMode={interactionMode}
			onUpdatePosition={onUpdatePosition}
			sceneGraph={sceneGraph}
		>
			<mesh castShadow receiveShadow>
				<boxGeometry args={[1.5, 1.5, 1.5]} />
				<meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
			</mesh>
		</DraggablePhysicsObject>
	);
};

export default WoodenBlock;
