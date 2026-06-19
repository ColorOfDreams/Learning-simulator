import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Thermometer: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const targetTemp = object.properties?.temperature ?? 25;
  const tempRef = useRef(25);
  const mercuryRef = useRef<THREE.Group>(null);

  const mercuryMaxHeight = 2.8;
  const mercuryBaseY = -1.5 + 0.04;

  useFrame((_, delta) => {
    if (isPlaying) {
      const direction = object.properties?.temperature ? targetTemp - tempRef.current : 0;
      if (Math.abs(direction) < 0.1) {
        tempRef.current = targetTemp;
      } else {
        tempRef.current += direction * delta * 60;
      }
    }
    const h = Math.max(0, Math.min(mercuryMaxHeight, (tempRef.current / 200) * mercuryMaxHeight));
    if (mercuryRef.current) {
      mercuryRef.current.scale.y = h > 0.001 ? h / mercuryMaxHeight : 0.001;
      mercuryRef.current.position.y = mercuryBaseY + h / 2;
    }
  });

  const marks = [];
  for (let t = 0; t <= 200; t++) {
    const isMajor = t % 10 === 0;
    const isLabel = t % 20 === 0;
    const y = mercuryBaseY + (t / 200) * mercuryMaxHeight;
    marks.push(
      <mesh key={t} position={[0.035, y, 0.005]}>
        <boxGeometry args={[isMajor ? 0.04 : 0.02, 0.003, 0.003]} />
        <meshStandardMaterial color={isMajor ? '#cc0000' : '#666666'} />
      </mesh>,
    );
    if (isLabel) {
      marks.push(
        <Text key={`t${t}`} position={[0.07, y, 0.006]} fontSize={0.045} color="#333333"
          anchorX="left" anchorY="middle">{t}</Text>,
      );
    }
  }

  return (
    <DraggablePhysicsObject object={object} label="Nhiệt kế" colliderArgs={[0.05, 1.6, 0.05]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group rotation={[0, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.03, 0.03, 3.0, 32]} />
          <meshStandardMaterial color="#f0f8ff" transparent opacity={0.55} roughness={0.05} metalness={0.1} />
        </mesh>
        <mesh position={[0, -0.02, 0.02]}>
          <boxGeometry args={[0.02, 2.8, 0.005]} />
          <meshStandardMaterial color="#fafafa" roughness={0.2} />
        </mesh>
        <mesh position={[0, -1.52, 0]}>
          <sphereGeometry args={[0.04, 20, 20]} />
          <meshStandardMaterial color="#cc1111" emissive="#880000" emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
        {marks}
        <group ref={mercuryRef}>
          <mesh position={[0, mercuryBaseY, 0]}>
            <cylinderGeometry args={[0.008, 0.008, mercuryMaxHeight, 16]} />
            <meshStandardMaterial color="#cc1111" emissive="#880000" emissiveIntensity={0.3} roughness={0.1} />
          </mesh>
        </group>
      </group>
    </DraggablePhysicsObject>
  );
};

export default Thermometer;
