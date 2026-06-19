import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DraggablePhysicsObject from '../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const DrivingMotor: React.FC<Props> = ({ object, isPlaying = false, onUpdatePosition, sceneGraph }) => {
  const wheelRef = useRef<THREE.Mesh>(null);
  const rodRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying) {
      timeRef.current += delta;
      const freq = object.properties?.frequency || 2;
      const amp = object.properties?.amplitude || 0.3;
      const angle = timeRef.current * freq * Math.PI * 2;
      if (wheelRef.current) wheelRef.current.rotation.z = angle;
      if (rodRef.current) rodRef.current.position.y = amp * Math.sin(angle);
    }
  });

  return (
    <DraggablePhysicsObject object={object} label="Động Cơ Rung" colliderArgs={[0.4, 0.3, 0.3]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.6, 0.6]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh ref={wheelRef} position={[0.45, 0, 0]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.08, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh ref={rodRef} position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <torusGeometry args={[0.12, 0.04, 8, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </DraggablePhysicsObject>
  );
};

export default React.memo(DrivingMotor);
