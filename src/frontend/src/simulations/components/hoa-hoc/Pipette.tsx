import React from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Pipette: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const liquidVolume = object.properties?.liquidVolume || 0;
  const liquidHeight = Math.min((liquidVolume / 25) * 0.6, 0.6);
  const liquidColor = object.properties?.liquidColor || '#00a8ff';

  return (
    <DraggablePhysicsObject object={object} label="Pipet Định Mức 25ml"
      colliderArgs={[0.09, 1.3, 0.09]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group position={[0, 0.1, 0]}>
        {/* Top thin stem — precision bore tube */}
        <mesh castShadow position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 32]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.04}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#e0f5ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Top stem inner bore */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.58, 32]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.004}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.3} attenuationColor="#ffffff"
            color="#edf9ff" roughness={0.05} ior={1.47} />
        </mesh>
        {/* Suction bulb — red rubber at top */}
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.07, 32, 32]} />
          <meshStandardMaterial color="#cc3333" roughness={0.6} metalness={0.05} />
        </mesh>
        {/* Bulbous middle section — glass reservoir */}
        <mesh castShadow position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.08, 48, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.1}
            chromaticAberration={0.03} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.45} attenuationColor="#ffffff"
            color="#e0f5ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Bulb inner cavity */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.07, 48, 48]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.01}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#edf9ff" roughness={0.05} ior={1.47} />
        </mesh>
        {/* Bottom thin stem — precision bore tube */}
        <mesh castShadow position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 32]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.04}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#e0f5ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Bottom stem inner bore */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.78, 32]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.004}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.3} attenuationColor="#ffffff"
            color="#edf9ff" roughness={0.05} ior={1.47} />
        </mesh>
        {/* Calibration ring — white enamel ring on top stem */}
        <mesh position={[0, 0.5, 0]}>
          <ringGeometry args={[0.019, 0.022, 48]} />
          <meshStandardMaterial color="white" roughness={0.3}
            emissive="white" emissiveIntensity={0.3} side={2} />
        </mesh>
        {/* Tapered tip — fine dispensing cone */}
        <mesh position={[0, -1.0, 0]}>
          <cylinderGeometry args={[0.006, 0.02, 0.15, 24]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.015}
            attenuationDistance={0.3} attenuationColor="#ffffff"
            color="#daf0ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Liquid fill — visible in bulb and bottom stem */}
        {liquidHeight > 0 && (
          <mesh position={[0, -0.85 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.015, 0.015, liquidHeight, 32]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.78}
              roughness={0.06} />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default Pipette;
