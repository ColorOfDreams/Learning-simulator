import React from 'react';
import DraggablePhysicsObject from '../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const MassBlock: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const mass = object.properties?.mass || 1;
  const color = object.properties?.color || '#f97316';
  const s = 0.3 + mass * 0.1;

  return (
    <DraggablePhysicsObject object={object} label={`Vật Nặng (${mass}kg)`} colliderArgs={[s, s, s]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group>
        <mesh position={[0, s, 0]} castShadow>
          <torusGeometry args={[0.12, 0.04, 8, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[s * 2, s * 2, s * 2]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, -s, 0]} castShadow>
          <torusGeometry args={[0.12, 0.04, 8, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </DraggablePhysicsObject>
  );
};

export default MassBlock;
