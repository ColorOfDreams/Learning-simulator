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

const SpringPendulum: React.FC<Props> = ({ object, isPlaying = false, onUpdatePosition, sceneGraph }) => {
  const mass = object.properties?.mass || 1;
  const stiffness = object.properties?.stiffness || 50;
  const color = object.properties?.color || '#3b82f6';
  const length = 2 + (mass * 9.8) / stiffness;

  const springRef = useRef<THREE.Mesh>(null);
  const bobRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const trailRef = useRef<[number,number,number][]>([]);

  useFrame((_, delta) => {
    if (isPlaying) {
      // Check attached to stand
      const allObjs = sceneGraph?.objects || [];
      const attached = allObjs.some((o) => o.modelName === 'Stand' && 
        Math.abs(o.position[0] + 1.6 - object.position[0]) < 0.25 &&
        Math.abs(o.position[1] + 2.0 - (object.position[1] + length / 2)) < 0.25
      );
      if (!attached) { timeRef.current = 0; trailRef.current = []; return; }
      timeRef.current += delta;
      const omega = Math.sqrt(stiffness / mass);
      const displacement = 0.4 * Math.sin(timeRef.current * omega);
      const cl = length + displacement;
      if (springRef.current) {
        springRef.current.scale.set(1, cl / length, 1);
        springRef.current.position.y = length / 2 - cl / 2;
      }
      if (bobRef.current) {
        bobRef.current.position.y = length / 2 - cl;
        trailRef.current.push([0, bobRef.current.position.y, 0]);
        if (trailRef.current.length > 20) trailRef.current.shift();
      }
    } else {
      timeRef.current = 0;
      trailRef.current = [];
      if (springRef.current) {
        springRef.current.scale.y = THREE.MathUtils.lerp(springRef.current.scale.y, 1, 0.1);
        const cl = length * springRef.current.scale.y;
        springRef.current.position.y = length / 2 - cl / 2;
        if (bobRef.current) bobRef.current.position.y = length / 2 - cl;
      }
    }
  });

  return (
    <DraggablePhysicsObject object={object} label="Con Lắc Lò Xo" colliderArgs={[0.5, length / 2, 0.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}
      snapPoints={getSnapPointsForModel('SpringPendulum', object.properties)}>
      <group>
        <mesh position={[0, length / 2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 0.6]} />
          <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={springRef} position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, length, 16]} />
          <meshStandardMaterial color="#94a3b8" wireframe />
        </mesh>
        <mesh ref={bobRef} position={[0, -length / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
      {trailRef.current.length > 2 && (
        <Line points={trailRef.current} color={color} lineWidth={1.5} opacity={0.2} transparent />
      )}
    </DraggablePhysicsObject>
  );
};

export default React.memo(SpringPendulum);
