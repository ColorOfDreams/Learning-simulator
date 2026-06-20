import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DraggablePhysicsObject, { getSnapPointsForModel } from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Dashpot: React.FC<Props> = ({ object, isPlaying = false, onUpdatePosition, sceneGraph }) => {
  const pistonRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying && pistonRef.current) {
      timeRef.current += delta;
      const d = 0.15 * Math.sin(timeRef.current * 3);
      pistonRef.current.position.y = d;
    } else if (!isPlaying && pistonRef.current) {
      pistonRef.current.position.y = THREE.MathUtils.lerp(pistonRef.current.position.y, 0, 0.1);
    }
  });

  return (
    <DraggablePhysicsObject object={object} label="Giảm Chấn" colliderArgs={[0.3, 1.0, 0.3]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}
      snapPoints={getSnapPointsForModel('Dashpot', object.properties)}>
      <group>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 1.0]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} transparent opacity={0.7} />
        </mesh>
        <mesh ref={pistonRef} position={[0, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.6]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -1.0, 0]} castShadow>
          <torusGeometry args={[0.15, 0.04, 8, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </DraggablePhysicsObject>
  );
};

export default React.memo(Dashpot);
