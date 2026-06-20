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

const Spring: React.FC<Props> = ({ object, isPlaying = false, onUpdatePosition, sceneGraph }) => {
  const length = object.properties?.length || 2;
  const stiffness = object.properties?.stiffness || 50;
  const color = object.properties?.color || '#64748b';

  const springRef = useRef<THREE.Mesh>(null);
  const hookRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying && springRef.current && hookRef.current) {
      // Check if attached to stand
      const allObjs = sceneGraph?.objects || [];
      const anchored = allObjs.some((o) => o.modelName === 'Stand' && 
        Math.abs(o.position[0] + 1.6 - object.position[0]) < 0.3 &&
        Math.abs(o.position[1] + 2.0 - (object.position[1] + length / 2)) < 0.3
      );
      if (!anchored) { timeRef.current = 0; return; }
      timeRef.current += delta;
      const omega = Math.sqrt(stiffness / 1);
      const displacement = 0.3 * Math.sin(timeRef.current * omega);
      const cl = length + displacement;
      springRef.current.scale.set(1, cl / length, 1);
      springRef.current.position.y = length / 2 - cl / 2;
      hookRef.current.position.y = length / 2 - cl;
    } else if (!isPlaying && springRef.current) {
      springRef.current.scale.y = THREE.MathUtils.lerp(springRef.current.scale.y, 1, 0.1);
      const cl = length * springRef.current.scale.y;
      springRef.current.position.y = length / 2 - cl / 2;
      if (hookRef.current) hookRef.current.position.y = length / 2 - cl;
    }
  });

  return (
    <DraggablePhysicsObject object={object} label="Lò Xo" colliderArgs={[0.3, length / 2, 0.3]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}
      snapPoints={getSnapPointsForModel('Spring', object.properties)}>
      <group>
        <mesh position={[0, length / 2, 0]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh ref={springRef} position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, length, 16]} />
          <meshStandardMaterial color={color} wireframe />
        </mesh>
        <mesh ref={hookRef} position={[0, -length / 2, 0]} castShadow>
          <torusGeometry args={[0.15, 0.04, 8, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </DraggablePhysicsObject>
  );
};

export default React.memo(Spring);
