import React from 'react';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Beaker: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const liquidVolume = object.properties?.liquidVolume || 0;
  const liquidHeight = Math.min((liquidVolume / 500) * 1.0, 1.0);
  const liquidColor = object.properties?.liquidColor || '#00a8ff';

  const graduations = [100, 200, 300, 400, 500].map((ml, i) => {
    const y = -0.5 + (i + 1) * 0.2;
    return (
      <group key={ml}>
        <mesh position={[0, y, 0.39]}>
          <boxGeometry args={[0.05, 0.002, 0.003]} />
          <meshStandardMaterial color="white" roughness={0.3} emissive="white" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, y, 0.42]} fontSize={0.055} color="white"
          anchorX="center" anchorY="middle" fillOpacity={0.9}>
          {ml.toString()}
        </Text>
      </group>
    );
  });

  return (
    <DraggablePhysicsObject object={object} label="Cốc Thủy Tinh 500ml"
      colliderArgs={[0.4, 0.65, 0.4]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group position={[0, 0.1, 0]}>
        {/* Outer cylinder — clear borosilicate glass */}
        <mesh castShadow>
          <cylinderGeometry args={[0.39, 0.39, 1.2, 64]} />
          <MeshTransmissionMaterial backside samples={8} thickness={0.25}
            chromaticAberration={0.03} anisotropy={0.15} clearcoat={1}
            attenuationDistance={0.5} attenuationColor="#ffffff"
            color="#d4edff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Inner cavity — glass inner wall surface */}
        <mesh>
          <cylinderGeometry args={[0.375, 0.375, 1.14, 64]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.015}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#e8f4ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Thick glass base — slightly wider */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 64]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.04}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#c8dff8" roughness={0.12} ior={1.47} />
        </mesh>
        {/* Reinforced rim — torus lip */}
        <mesh position={[0, 0.6, 0]}>
          <torusGeometry args={[0.39, 0.016, 16, 64]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.02}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#d4edff" roughness={0.1} ior={1.47} />
        </mesh>
        {/* Pouring spout — small triangular notch at rim */}
        <mesh position={[0, 0.605, 0.37]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.07, 0.025, 0.03]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.02}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#cce4ff" roughness={0.1} ior={1.47} />
        </mesh>
        {/* White enamel graduation markings */}
        {graduations}
        {/* Liquid fill — inside inner cavity */}
        {liquidHeight > 0 && (
          <mesh position={[0, -0.55 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.37, 0.37, liquidHeight, 64]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.75}
              roughness={0.08} metalness={0.1} />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default Beaker;
