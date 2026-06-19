import React from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const RoundFlask: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const liquidVolume = object.properties?.liquidVolume || 0;
  const liquidScale = Math.min((liquidVolume / 250), 0.95);
  const liquidColor = object.properties?.liquidColor || '#00a8ff';

  return (
    <DraggablePhysicsObject object={object} label="Bình Cầu Đáy Tròn 250ml"
      colliderArgs={[0.5, 1.4, 0.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group position={[0, 0.15, 0]}>
        {/* Spherical body — ~85mm diameter borosilicate glass */}
        <mesh castShadow position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.45, 64, 64]} />
          <MeshTransmissionMaterial backside samples={8} thickness={0.3}
            chromaticAberration={0.03} anisotropy={0.15} clearcoat={1}
            attenuationDistance={0.5} attenuationColor="#ffffff"
            color="#d8f0ff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Inner sphere cavity — wall thickness ~1.5mm */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.435, 64, 64]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.015}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#e4f4ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Neck — borosilicate tube ~20mm OD, ~120mm long */}
        <mesh castShadow position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.2, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.1}
            chromaticAberration={0.03} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#d8f0ff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Neck inner cavity */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 1.18, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.015}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#e4f4ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Ground glass joint — slightly wider frosted section at top */}
        <mesh position={[0, 1.28, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.15, 48]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.04}
            attenuationDistance={0.3} attenuationColor="#ffffff"
            color="#eef6ff" roughness={0.25} ior={1.47} />
        </mesh>
        {/* Rim ring — top lip */}
        <mesh position={[0, 1.38, 0]}>
          <torusGeometry args={[0.115, 0.01, 12, 48]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.015}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#d4ecff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Flat bottom rest — small disc */}
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.02}
            attenuationDistance={0.3} attenuationColor="#ffffff"
            color="#c0dcf8" roughness={0.12} ior={1.47} />
        </mesh>
        {/* Liquid fill — sphere scaled to volume */}
        {liquidScale > 0 && (
          <mesh position={[0, -0.55, 0]} scale={[liquidScale, liquidScale, liquidScale]}>
            <sphereGeometry args={[0.43, 48, 48]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.75}
              roughness={0.08} />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default RoundFlask;
