import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Stopwatch: React.FC<Props> = ({ object, isPlaying = false, onUpdatePosition, sceneGraph }) => {
  useFrame((_, delta) => {
    if (!object.properties) return;
    const running = object.properties.running ?? false;
    if (isPlaying && running) {
      object.properties.elapsed = (object.properties.elapsed || 0) + delta;
    }
    if (!isPlaying && !running) {
      // Keep elapsed when paused, only reset on explicit action
    }
  });

  const elapsed = object.properties?.elapsed || 0;

  return (
    <DraggablePhysicsObject object={object} label="Đồng Hồ" colliderArgs={[0.15, 0.1, 0.25]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.2, 0.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.22, 0.04, 0.35]} />
          <meshStandardMaterial color="#0f172a" roughness={0.1} />
        </mesh>
        <Text position={[0, 0.13, 0.01]} fontSize={0.08} color="#22d3ee" anchorX="center" anchorY="middle">
          {elapsed.toFixed(2)}s
        </Text>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </DraggablePhysicsObject>
  );
};

export default React.memo(Stopwatch);
