import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const SimplePendulum: React.FC<Props> = ({ object, isPlaying = false, onUpdatePosition, sceneGraph }) => {
  const length = object.properties?.length || 2;
  const color = object.properties?.color || '#ff0000';
  const armRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying && armRef.current) {
      timeRef.current += delta;
      const omega = Math.sqrt(9.81 / length);
      armRef.current.rotation.z = 0.5 * Math.sin(timeRef.current * omega);
    } else if (!isPlaying && armRef.current) {
      armRef.current.rotation.z = THREE.MathUtils.lerp(armRef.current.rotation.z, 0, 0.1);
      timeRef.current = 0;
    }
  });

  return (
    <DraggablePhysicsObject object={object} label="Con Lắc Đơn" colliderArgs={[0.5, length / 2, 0.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group>
        <mesh position={[0, length / 2, 0]} castShadow>
          <boxGeometry args={[0.4, 0.1, 0.4]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
        </mesh>
        <group ref={armRef} position={[0, length / 2, 0]}>
          <mesh position={[0, -length / 2, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, length, 8]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.1} />
          </mesh>
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
