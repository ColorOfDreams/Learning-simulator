import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';
import { findChemical } from '../../chemicals-catalog';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const ChemicalGas: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const symbol = object.properties?.symbol;
  const chemical = symbol ? findChemical(symbol) : undefined;
  const color = chemical?.color || '#a0ffa0';
  const isHeavy = chemical?.density && chemical.density > 0.002;
  const isColorless = chemical?.color === 'transparent';

  const cloudRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const timeRef = useRef(0);

  const particleCount = isHeavy ? 20 : 12;
  const particles: { pos: [number, number, number]; speed: number; phase: number; amp: number }[] = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      pos: [(Math.random() - 0.5) * 0.45, (Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.45],
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      amp: 0.02 + Math.random() * 0.04,
    });
  }

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (cloudRef.current && isPlaying) {
      const t = timeRef.current;
      const pulse = 1 + Math.sin(t * 1.5) * 0.06;
      cloudRef.current.scale.setScalar(pulse);
      if (isColorless) {
        cloudRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.02;
      } else {
        cloudRef.current.material.opacity = 0.2 + Math.sin(t * 1.5) * 0.06;
      }
    }
    if (groupRef.current && isPlaying) {
      const t = timeRef.current;
      groupRef.current.children.forEach((child: any, i: number) => {
        if (child.position && i < particles.length) {
          const p = particles[i];
          child.position.y += Math.sin(t * p.speed + p.phase) * 0.002;
          if (i % 2 === 0) child.position.x += Math.cos(t * 0.5 + p.phase) * 0.001;
        }
      });
      if (isHeavy) {
        groupRef.current.position.y = -0.1 + Math.sin(t * 0.5) * 0.03;
      } else {
        groupRef.current.position.y = 0.05 + Math.sin(t * 0.8) * 0.05;
      }
    }
  });

  const cloudOpacity = isColorless ? 0.1 : 0.25;
  const label = chemical ? `${chemical.name} (${chemical.symbol})` : 'Chất Khí';

  return (
    <DraggablePhysicsObject object={object} label={label} colliderArgs={[0.35, 0.35, 0.35]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group ref={groupRef}>
        {/* Main cloud */}
        <mesh ref={cloudRef}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color={color} transparent opacity={cloudOpacity}
            roughness={0.6} depthWrite={false} />
        </mesh>

        {/* Inner dense core */}
        {!isColorless && (
          <mesh position={[0, isHeavy ? -0.08 : 0, 0]}>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color={color} transparent opacity={0.15} roughness={0.5} depthWrite={false} />
          </mesh>
        )}

        {/* Floating particles */}
        <group ref={groupRef}>
          {particles.map((p, i) => (
            <mesh key={i} position={p.pos}>
              <sphereGeometry args={[0.02 + Math.random() * 0.02, 6, 6]} />
              <meshStandardMaterial color={color} transparent opacity={isColorless ? 0.15 : 0.45}
                roughness={0.4} depthWrite={false} />
            </mesh>
          ))}
        </group>

        {/* Outer wispy layer */}
        {!isColorless && isPlaying && (
          <mesh>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color={color} transparent opacity={0.06} roughness={0.8} depthWrite={false} />
          </mesh>
        )}

        {/* Label for heavy gases */}
        {chemical && isHeavy && (
          <Text position={[0, -0.35, 0]} fontSize={0.05} color="#64748b" anchorX="center">
            Nặng hơn kk ({chemical.density?.toFixed(1)} g/L)
          </Text>
        )}
        {chemical && (
          <Text position={[0, 0.35, 0]} fontSize={0.06} color={isColorless ? '#94a3b8' : '#334155'} anchorX="center">
            {chemical.symbol}{chemical.symbol === 'Cl' ? '₂' : ''}{chemical.symbol === 'I' ? '₂' : ''}
          </Text>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default ChemicalGas;
