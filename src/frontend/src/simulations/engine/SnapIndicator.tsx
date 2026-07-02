import { useModel } from '@umijs/max';
import React from 'react';
import { getEquipmentConfig } from './EquipmentRegistry';
import { useInteraction } from './InteractionContext';

export const SnapIndicator: React.FC = () => {
	const { isDraggingPourable } = useInteraction();
	const { sceneGraph } = useModel('useSimulationModel');

	if (!isDraggingPourable || !sceneGraph?.objects) return null;

	const containers = sceneGraph.objects.filter((obj: any) => {
		if (obj.id === isDraggingPourable) return false; // Hide on the dragged object itself!
		const model = obj.modelName || obj.loai;
		return getEquipmentConfig(model).tags.includes('container');
	});

	return (
		<>
			{containers.map((container: any) => {
				const model = container.modelName || container.loai;
				const config = getEquipmentConfig(model);
				const snaps = config.getSnapPoints(container.properties);
				const containerSnap = snaps.find((s) => s.type === 'container');

				if (!containerSnap) return null;

				const pos = container.position || container.viTri || [0, 0, 0];

				// Hover indicator slightly above container
				const finalPos: [number, number, number] = [
					pos[0] + containerSnap.position[0],
					pos[1] + containerSnap.position[1] + 0.6,
					pos[2] + containerSnap.position[2],
				];

				return (
					<group key={`indicator-${container.id}`} position={finalPos}>
						<mesh rotation={[Math.PI / 2, 0, 0]}>
							<torusGeometry args={[0.3, 0.02, 16, 100]} />
							<meshStandardMaterial
								color='#22c55e'
								emissive='#22c55e'
								emissiveIntensity={2.0}
								transparent
								opacity={0.8}
								depthTest={false}
							/>
						</mesh>
					</group>
				);
			})}
		</>
	);
};
