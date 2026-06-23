import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense } from 'react';
import RoomEnvironment from '../components/RoomEnvironment';

import Beaker from '../components/Beaker';
import SimplePendulum from '../components/SimplePendulum';
import SpringPendulum from '../components/SpringPendulum';
import Stand from '../components/Stand';
import WoodenBlock from '../components/WoodenBlock';

const COMPONENT_MAP: Record<
	string,
	React.FC<{
		object: Scene.Object;
		isPlaying?: boolean;
		interactionMode?: 'observe' | 'practice';
		onUpdatePosition?: (id: string, position: [number, number, number]) => void;
		sceneGraph?: Scene.IRecord | null;
	}>
> = {
	WoodenBlock,
	Beaker,
	SimplePendulum,
	SpringPendulum,
	Stand,
};

const getInitialY = (modelName: string) => {
	switch (modelName) {
		case 'WoodenBlock':
			return 0.15;
		case 'Beaker':
			return 0.4;
		case 'Stand':
			return 1.9;
		case 'SimplePendulum':
			return 1.5;
		case 'SpringPendulum':
			return 1.5;
		default:
			return 0;
	}
};

const renderObject = (
	obj: Scene.Object,
	isPlaying: boolean,
	interactionMode: 'observe' | 'practice',
	onUpdatePosition?: (id: string, position: [number, number, number]) => void,
	sceneGraph?: Scene.IRecord | null,
) => {
	const ObjectComponent = COMPONENT_MAP[obj.modelName];
	if (!ObjectComponent) return null;

	// Override Y position if it was saved as the sky position (Y = 5)
	const position = [...obj.position] as [number, number, number];
	if (position[1] === 5) {
		position[1] = getInitialY(obj.modelName);
	}

	const adjustedObj = { ...obj, position };
	return (
		<ObjectComponent
			key={obj.id}
			object={adjustedObj}
			isPlaying={isPlaying}
			interactionMode={interactionMode}
			onUpdatePosition={onUpdatePosition}
			sceneGraph={sceneGraph}
		/>
	);
};

interface SandboxEngineProps {
	sceneGraph: Scene.IRecord | null;
	isPlaying: boolean;
	interactionMode: 'observe' | 'practice';
	onUpdatePosition?: (id: string, position: [number, number, number]) => void;
}

const SandboxEngine: React.FC<SandboxEngineProps> = ({ sceneGraph, isPlaying, interactionMode, onUpdatePosition }) => {
	return (
		<div style={{ width: '100%', height: '100%', background: '#f0f2f5' }}>
			<Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
				<color attach='background' args={['#f0f2f5']} />
				<ambientLight intensity={0.6} />
				<directionalLight castShadow position={[10, 20, 10]} intensity={1.2} />

				{sceneGraph && (
					<>
						<RoomEnvironment roomType={sceneGraph.roomType} />
						<Suspense fallback={null}>
							{(sceneGraph.objects || []).map((obj) =>
								renderObject(obj, isPlaying, interactionMode, onUpdatePosition, sceneGraph),
							)}
						</Suspense>
					</>
				)}
				{interactionMode === 'observe' && (
					<OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} minDistance={3} maxDistance={14} />
				)}
			</Canvas>
		</div>
	);
};

export default React.memo(SandboxEngine);
