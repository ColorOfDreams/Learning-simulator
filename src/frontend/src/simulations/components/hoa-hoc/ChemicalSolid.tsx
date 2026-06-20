import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import DraggablePhysicsObject, { getSnapPointsForModel } from '../../engine/DraggablePhysicsObject';
import { findChemical } from '../../chemicals-catalog';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const ChemicalSolid: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const symbol = object.properties?.symbol;
  const chemical = symbol ? findChemical(symbol) : undefined;
  const color = chemical?.color || object.properties?.color || '#c0c0c0';
  const isCrystal = chemical?.group === 'halogen';
  const isPowder = chemical?.symbol === 'S' || chemical?.symbol === 'P';

  const crystalRef = useRef<any>(null);
  useFrame(({ clock }) => {
    if (crystalRef.current && isPlaying) {
      crystalRef.current.rotation.y += 0.003;
    }
  });

  const count = isPowder ? 40 : isCrystal ? 12 : 15;
  const pieces: React.ReactNode[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const rad = 0.08 + Math.random() * 0.15;
    const y = Math.random() * 0.12;
    const rx = Math.random() * 0.5;
    const ry = Math.random() * 0.5;
    const rz = Math.random() * 0.5;

    if (isCrystal) {
      pieces.push(
        <mesh key={i} position={[Math.cos(angle) * rad * 0.7, y, Math.sin(angle) * rad * 0.7]} rotation={[rx, ry, rz]}>
          <octahedronGeometry args={[0.04 + Math.random() * 0.03, 0]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
        </mesh>,
      );
    } else if (isPowder) {
      pieces.push(
        <mesh key={i} position={[Math.cos(angle) * rad, y, Math.sin(angle) * rad]}>
          <sphereGeometry args={[0.015 + Math.random() * 0.02, 6, 6]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>,
      );
    } else {
      pieces.push(
        <mesh key={i} position={[Math.cos(angle) * rad, y, Math.sin(angle) * rad]} rotation={[rx, ry, rz]}>
          <boxGeometry args={[0.04 + Math.random() * 0.04, 0.03 + Math.random() * 0.04, 0.04 + Math.random() * 0.04]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.4} />
        </mesh>,
      );
    }
  }

  const label = chemical ? `${chemical.name} (${chemical.symbol})` : 'Chất Rắn';

  return (
    <DraggablePhysicsObject object={object} label={label} colliderArgs={[0.25, 0.12, 0.25]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}
      snapPoints={getSnapPointsForModel('ChemicalSolid', object.properties)}>
      <group ref={crystalRef}>
        {pieces}
        {chemical && (
          <Text position={[0, 0.18, 0]} fontSize={0.06} color="#334155" anchorX="center" anchorY="middle">
            {chemical.symbol}
          </Text>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default ChemicalSolid;
