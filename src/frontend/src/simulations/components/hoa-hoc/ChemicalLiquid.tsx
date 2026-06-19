import React, { useRef } from 'react';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';
import { findChemical } from '../../chemicals-catalog';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const ChemicalLiquid: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const symbol = object.properties?.symbol;
  const chemical = symbol ? findChemical(symbol) : undefined;
  const color = chemical?.color || object.properties?.color || '#00a8ff';
  const volume = object.properties?.volume || 250;
  const liquidHeight = Math.max(0, Math.min(0.9, (volume / 500) * 0.9));
  const isDense = chemical?.symbol === 'Hg' || chemical?.symbol === 'Br';
  const isConcentrated = object.properties?.concentrated;

  const surfaceRef = useRef<any>(null);
  useFrame(({ clock }) => {
    if (surfaceRef.current && isPlaying) {
      const t = clock.getElapsedTime();
      surfaceRef.current.position.y = -0.6 + liquidHeight + Math.sin(t * 2) * 0.005;
      if (isDense) {
        surfaceRef.current.material.opacity = 0.9;
      }
    }
  });

  const label = chemical ? `${chemical.name} (${chemical.symbol})` : 'Chất Lỏng';
  const bottleColor = isConcentrated ? '#fef3c7' : '#e8f4ff';

  return (
    <DraggablePhysicsObject object={object} label={label} colliderArgs={[0.3, 0.45, 0.3]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group>
        {/* Bottle body - outer glass */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 1.2, 32]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.06} ior={1.47}
            chromaticAberration={0.03} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.5} attenuationColor="#ffffff" color={bottleColor} />
        </mesh>
        {/* Inner hollow */}
        <mesh>
          <cylinderGeometry args={[0.235, 0.235, 1.15, 32]} />
          <meshBasicMaterial color="#fff" visible={false} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.35, 32]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.04} ior={1.47}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.5} attenuationColor="#ffffff" color={bottleColor} />
        </mesh>
        {/* Rim/mouth */}
        <mesh position={[0, 0.88, 0]}>
          <torusGeometry args={[0.1, 0.015, 16, 32]} />
          <meshStandardMaterial color="#e0e8f0" roughness={0.2} />
        </mesh>
        {/* Cap */}
        <mesh position={[0, 0.92, 0]} castShadow>
          <cylinderGeometry args={[0.105, 0.105, 0.08, 32]} />
          <meshStandardMaterial color={isConcentrated ? '#d97706' : '#3b82f6'} roughness={0.3} />
        </mesh>

        {/* Liquid fill */}
        {liquidHeight > 0 && (
          <mesh position={[0, -0.6 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.23, 0.23, liquidHeight, 32]} />
            <meshStandardMaterial color={color} transparent opacity={isDense ? 0.9 : 0.75} roughness={0.1} />
          </mesh>
        )}
        {/* Liquid surface meniscus */}
        {liquidHeight > 0 && (
          <mesh ref={surfaceRef} position={[0, -0.6 + liquidHeight, 0]}>
            <cylinderGeometry args={[0.225, 0.225, 0.01, 32]} />
            <meshStandardMaterial color={color} transparent opacity={0.4} roughness={0.05} />
          </mesh>
        )}

        {/* Volume label */}
        {chemical && (
          <Text position={[0.28, 0, 0]} rotation={[0, 0, 0]} fontSize={0.05} color="#334155" anchorX="left">
            {chemical.symbol}
          </Text>
        )}
        {/* Meniscus detail */}
        {liquidHeight > 0 && isPlaying && (
          <mesh position={[0, -0.6 + liquidHeight + 0.01, 0]}>
            <torusGeometry args={[0.22, 0.002, 16, 32]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default ChemicalLiquid;
