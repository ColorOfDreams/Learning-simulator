import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import DraggablePhysicsObject, { getSnapPointsForModel } from '../../engine/DraggablePhysicsObject';

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
  const trailRef = useRef<[number,number,number][]>([]);

  useFrame((_, delta) => {
    if (isPlaying && armRef.current) {
      // Check attached to stand
      const allObjs = sceneGraph?.objects || [];
      const attached = allObjs.some((o) => o.modelName === 'Stand' && 
        Math.abs(o.position[0] + 1.6 - object.position[0]) < 0.25 &&
        Math.abs(o.position[1] + 2.0 - (object.position[1] + length / 2)) < 0.25
      );
      if (!attached) { timeRef.current = 0; trailRef.current = []; return; }
      timeRef.current += delta;
      const omega = Math.sqrt(9.81 / length);
      armRef.current.rotation.z = 0.5 * Math.sin(timeRef.current * omega);
      const localBob: [number,number,number] = [0, length/2 - length, 0];
      trailRef.current.push(localBob);
      if (trailRef.current.length > 20) trailRef.current.shift();
    } else if (!isPlaying && armRef.current) {
      armRef.current.rotation.z = THREE.MathUtils.lerp(armRef.current.rotation.z, 0, 0.1);
      timeRef.current = 0;
      trailRef.current = [];
    }
  });

  return (
    <DraggablePhysicsObject object={object} label="Con Lắc Đơn" colliderArgs={[0.5, length / 2, 0.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}
      snapPoints={getSnapPointsForModel('SimplePendulum', object.properties)}>
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
      {trailRef.current.length > 2 && (
        <Line points={trailRef.current} color={color} lineWidth={1.5} opacity={0.25} transparent />
      )}
    </DraggablePhysicsObject>
  );
};

export default SimplePendulum;
