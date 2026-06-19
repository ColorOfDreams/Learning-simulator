import React from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const TestTube: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const liquidVolume = object.properties?.liquidVolume || 0;
  const liquidHeight = Math.min((liquidVolume / 30) * 1.2, 1.2);
  const liquidColor = object.properties?.liquidColor || '#00a8ff';

  return (
    <DraggablePhysicsObject object={object} label="Ống Nghiệm 16×150mm"
      colliderArgs={[0.09, 0.8, 0.09]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph}>
      <group position={[0, 0.05, 0]}>
        {/* Cylinder body — borosilicate glass tube */}
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.5, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.08}
            chromaticAberration={0.03} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#dff4ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Inner cavity — glass inner surface */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 1.48, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.01}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#edf7ff" roughness={0.05} ior={1.47} />
        </mesh>
        {/* Rounded bottom — hemisphere */}
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.08, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.08}
            chromaticAberration={0.03} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.4} attenuationColor="#ffffff"
            color="#dff4ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Inner bottom — hemisphere inner cavity */}
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.07, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.01}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#edf7ff" roughness={0.05} ior={1.47} />
        </mesh>
        {/* Rim/Flange — torus at top */}
        <mesh position={[0, 0.75, 0]}>
          <torusGeometry args={[0.08, 0.01, 12, 48]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.015}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#cfe8ff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Volume markings — thin white enamel rings */}
        {[0.2, 0.5, 0.8, 1.1].map((y, i) => (
          <mesh key={i} position={[0, -0.65 + y, 0]}>
            <ringGeometry args={[0.069, 0.08, 48]} />
            <meshStandardMaterial color="white" roughness={0.3}
              emissive="white" emissiveIntensity={0.3} side={2} />
          </mesh>
        ))}
        {/* Liquid fill — inside inner cavity */}
        {liquidHeight > 0 && (
          <mesh position={[0, -0.68 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.065, 0.065, liquidHeight, 48]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.75}
              roughness={0.08} />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default TestTube;
