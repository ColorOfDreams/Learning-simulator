import React from 'react';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const ErlenmeyerFlask: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const liquidVolume = object.properties?.liquidVolume || 0;
  const liquidHeight = Math.min((liquidVolume / 250) * 1.4, 1.4);
  const liquidColor = object.properties?.liquidColor || '#00a8ff';

  const graduations = [100, 150, 200, 250].map((ml, i) => {
    const y = -0.7 + (i + 1) * 0.33;
    const r = 0.55 - (0.55 - 0.15) * ((y + 0.7) / 1.6);
    return (
      <group key={ml}>
        <mesh position={[0, y, r + 0.005]}>
          <boxGeometry args={[0.06, 0.002, 0.003]} />
          <meshStandardMaterial color="white" roughness={0.3}
            emissive="white" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, y, r + 0.025]} fontSize={0.045} color="white"
          anchorX="center" anchorY="middle" fillOpacity={0.85}>
          {ml.toString()}
        </Text>
      </group>
    );
  });

  return (
    <DraggablePhysicsObject object={object} label="Bình Tam Giác 250ml"
      colliderArgs={[0.55, 1.0, 0.55]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group position={[0, 0.1, 0]}>
        {/* Conical body — rTop=0.15, rBottom=0.55, h=1.6 */}
        <mesh castShadow position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.15, 0.55, 1.6, 64]} />
          <MeshTransmissionMaterial backside samples={8} thickness={0.2}
            chromaticAberration={0.03} anisotropy={0.15} clearcoat={1}
            attenuationDistance={0.5} attenuationColor="#ffffff"
            color="#dff5ff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Inner conical cavity — wall thickness ~1.5mm */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.135, 0.535, 1.58, 64]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.015}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#eaf6ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Neck — narrow cylinder above cone */}
        <mesh castShadow position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.6, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.08}
            chromaticAberration={0.03} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#dff5ff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Neck inner cavity */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.58, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.015}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#eaf6ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Rim — torus at neck opening */}
        <mesh position={[0, 1.25, 0]}>
          <torusGeometry args={[0.13, 0.014, 16, 48]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.02}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#d5efff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Flat glass base disc */}
        <mesh position={[0, -1.4, 0]}>
          <cylinderGeometry args={[0.56, 0.56, 0.03, 64]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.03}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#c8e0f8" roughness={0.12} ior={1.47} />
        </mesh>
        {/* Graduation markings */}
        {graduations}
        {/* Liquid fill — conical shape matching flask body */}
        {liquidHeight > 0 && (
          <mesh position={[0, -1.38 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.15, 0.15, liquidHeight, 48]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.75}
              roughness={0.08} />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default ErlenmeyerFlask;
