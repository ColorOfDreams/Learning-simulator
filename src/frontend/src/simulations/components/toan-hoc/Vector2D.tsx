import React from 'react';
import { Line, Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Vector2D: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const startX = object.properties?.startX ?? 0;
  const startY = object.properties?.startY ?? 0;
  const endX = object.properties?.endX ?? 2;
  const endY = object.properties?.endY ?? 2;

  const dx = endX - startX;
  const dy = endY - startY;
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  const arrowColor = '#f59e0b';

  return (
    <DraggablePhysicsObject object={object} label={`Vector(${dx.toFixed(1)}, ${dy.toFixed(1)})`}
      colliderArgs={[Math.abs(dx) / 2 + 0.5, 0.05, Math.abs(dy) / 2 + 0.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <Line points={[[startX, startY, 0.02], [endX, endY, 0.02]]} color={arrowColor} lineWidth={2} />
        <mesh position={[endX, endY, 0.02]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 3]}>
          <coneGeometry args={[0.15, 0.35, 8]} />
          <meshStandardMaterial color={arrowColor} />
        </mesh>
        <mesh position={[endX, endY, 0.02]} rotation={[0, 0, Math.atan2(dy, dx) + Math.PI / 3]}>
          <coneGeometry args={[0.15, 0.35, 8]} />
          <meshStandardMaterial color={arrowColor} />
        </mesh>
        <Text position={[(startX + endX) / 2, (startY + endY) / 2 + 0.25, 0.05]}
          fontSize={0.18} color="#ffffff" anchorX="center">
          {`|v|=${magnitude.toFixed(1)} ∠${angleDeg.toFixed(0)}°`}
        </Text>
      </group>
    </DraggablePhysicsObject>
  );
};

export default Vector2D;
