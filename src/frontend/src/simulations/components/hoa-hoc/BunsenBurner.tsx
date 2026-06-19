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

const BunsenBurner: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const innerRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!isPlaying) return;
    const flicker = (ref: THREE.Group | null, amp: number) => {
      if (!ref) return;
      const s = 0.85 + Math.random() * amp;
      ref.scale.setScalar(s);
      ref.position.y += (Math.random() - 0.5) * 0.02;
    };
    flicker(innerRef.current, 0.3);
    flicker(midRef.current, 0.25);
    flicker(outerRef.current, 0.35);
  });

  return (
    <DraggablePhysicsObject object={object} label="Đèn Cồn Bunsen" colliderArgs={[0.3, 0.9, 0.3]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group>
        <mesh castShadow position={[0, -0.85, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.06, 32]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.7} metalness={0.6} />
        </mesh>
        <mesh castShadow position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.5, 24]} />
          <meshStandardMaterial color="#c4a44a" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh castShadow position={[0, -0.75, 0]}>
          <torusGeometry args={[0.09, 0.025, 8, 32]} />
          <meshStandardMaterial color="#b89a40" roughness={0.3} metalness={0.85} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.09, -0.75, Math.sin(angle) * 0.09]}>
              <boxGeometry args={[0.03, 0.06, 0.01]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          );
        })}
        <mesh castShadow position={[0.09, -0.71, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
          <meshStandardMaterial color="#8a7a3a" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh castShadow position={[0.24, -0.71, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.025, 0.06, 12]} />
          <meshStandardMaterial color="#333333" roughness={0.8} />
        </mesh>
        <group position={[0, 0.74, 0]}>
          <group ref={innerRef}>
            <mesh>
              <coneGeometry args={[0.02, 0.25, 12]} />
              <meshStandardMaterial color="#0066ff" emissive="#0044cc" emissiveIntensity={1.2} transparent opacity={0.85} />
            </mesh>
          </group>
          <group ref={midRef}>
            <mesh>
              <coneGeometry args={[0.04, 0.22, 14]} />
              <meshStandardMaterial color="#3399ff" emissive="#1166cc" emissiveIntensity={0.8} transparent opacity={0.6} />
            </mesh>
          </group>
          <group ref={outerRef}>
            <mesh>
              <coneGeometry args={[0.06, 0.32, 16]} />
              <meshStandardMaterial color="#ff8800" emissive="#cc5500" emissiveIntensity={0.6} transparent opacity={0.7} />
            </mesh>
          </group>
          <mesh position={[0, 0.18, 0]}>
            <coneGeometry args={[0.055, 0.08, 16]} />
            <meshStandardMaterial color="#ffcc00" emissive="#ff8800" emissiveIntensity={0.4} transparent opacity={0.5} />
          </mesh>
        </group>
      </group>
    </DraggablePhysicsObject>
  );
};

export default BunsenBurner;
