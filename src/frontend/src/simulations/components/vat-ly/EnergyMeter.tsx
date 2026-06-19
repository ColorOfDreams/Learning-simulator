import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const EnergyMeter: React.FC<Props> = ({ object, isPlaying = false, onUpdatePosition, sceneGraph }) => {
  const kinRef = useRef<THREE.Mesh>(null);
  const potRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying) {
      timeRef.current += delta;
      const t = timeRef.current;
      const ke = 0.5 * (1 + Math.cos(2 * t));
      const pe = 0.5 * (1 - Math.cos(2 * t));
      if (kinRef.current) kinRef.current.scale.y = ke;
      if (potRef.current) potRef.current.scale.y = pe;
    } else {
      if (kinRef.current) kinRef.current.scale.y = THREE.MathUtils.lerp(kinRef.current.scale.y, 0.5, 0.1);
      if (potRef.current) potRef.current.scale.y = THREE.MathUtils.lerp(potRef.current.scale.y, 0.5, 0.1);
    }
  });

  return (
    <DraggablePhysicsObject object={object} label="Năng Lượng" colliderArgs={[0.3, 0.2, 0.05]}
      onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
    <group>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh ref={kinRef} position={[-0.15, -0.2, 0.06]}>
        <boxGeometry args={[0.15, 0.4, 0.02]} />
        <meshStandardMaterial color="#ef4444" roughness={0.2} />
      </mesh>
      <mesh ref={potRef} position={[0.15, -0.2, 0.06]}>
        <boxGeometry args={[0.15, 0.4, 0.02]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.2} />
      </mesh>
      <Text position={[-0.15, 0.25, 0.06]} fontSize={0.05} color="#ef4444" anchorX="center">Wđ</Text>
      <Text position={[0.15, 0.25, 0.06]} fontSize={0.05} color="#3b82f6" anchorX="center">Wt</Text>
    </group>
  </DraggablePhysicsObject>
  );
};

export default React.memo(EnergyMeter);
