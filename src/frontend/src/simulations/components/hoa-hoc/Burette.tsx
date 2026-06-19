import React from 'react';
import { MeshTransmissionMaterial, Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Burette: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const liquidVolume = object.properties?.liquidVolume || 0;
  const liquidHeight = Math.min((liquidVolume / 50) * 3.8, 3.8);
  const liquidColor = object.properties?.liquidColor || '#00a8ff';

  const tickMarks = [];
  for (let i = 0; i <= 100; i++) {
    const y = -1.9 + i * 0.038;
    const isMajor = i % 10 === 0;
    tickMarks.push(
      <mesh key={i} position={[0.05, y, 0]}>
        <boxGeometry args={[0.003, 0.001, isMajor ? 0.018 : 0.01]} />
        <meshStandardMaterial color="white" roughness={0.3}
          emissive="white" emissiveIntensity={0.4} />
      </mesh>,
    );
  }

  const labels = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((ml, i) => {
    const y = -1.9 + i * 0.38;
    return (
      <Text key={ml} position={[-0.06, y, 0]} fontSize={0.045} color="white"
        anchorX="right" anchorY="middle" fillOpacity={0.85}>
        {ml.toString()}
      </Text>
    );
  });

  return (
    <DraggablePhysicsObject object={object} label="Buret 50ml Lớp A"
      colliderArgs={[0.06, 2.1, 0.06]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group position={[0, 0.1, 0]}>
        {/* Main tube — precision bore glass, ~10mm ID */}
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 4.0, 48]} />
          <MeshTransmissionMaterial backside samples={8} thickness={0.1}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.5} attenuationColor="#ffffff"
            color="#e0f4ff" roughness={0.06} ior={1.47} />
        </mesh>
        {/* Inner bore */}
        <mesh>
          <cylinderGeometry args={[0.043, 0.043, 3.98, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.007}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={0.5}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#edf7ff" roughness={0.05} ior={1.47} />
        </mesh>
        {/* Filling funnel — wider opening at top */}
        <mesh position={[0, 2.05, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.1, 48]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.03}
            attenuationDistance={0.35} attenuationColor="#ffffff"
            color="#d0ecff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Funnel rim */}
        <mesh position={[0, 2.1, 0]}>
          <torusGeometry args={[0.058, 0.008, 12, 48]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.01}
            attenuationDistance={0.3} attenuationColor="#ffffff"
            color="#d0ecff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Graduation tick marks — white enamel every 0.5ml */}
        {tickMarks}
        {/* Volume labels */}
        {labels}
        {/* PTFE stopcock housing — white Teflon block */}
        <mesh position={[0, -2.1, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 32]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.25} metalness={0.1} />
        </mesh>
        {/* Stopcock plug — perpendicular PTFE cylinder */}
        <mesh position={[0.07, -2.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.14, 24]} />
          <meshStandardMaterial color="#f0f0ec" roughness={0.2} metalness={0.15} />
        </mesh>
        {/* Stopcock handle — small lever box */}
        <mesh position={[0.085, -2.1, 0.05]}>
          <boxGeometry args={[0.06, 0.04, 0.04]} />
          <meshStandardMaterial color="#e8e8e0" roughness={0.2} metalness={0.15} />
        </mesh>
        {/* Drip tip — narrow cone at bottom */}
        <mesh position={[0, -2.25, 0]}>
          <cylinderGeometry args={[0.01, 0.035, 0.2, 24]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.02}
            attenuationDistance={0.3} attenuationColor="#ffffff"
            color="#d0ecff" roughness={0.08} ior={1.47} />
        </mesh>
        {/* Liquid fill — inside bore */}
        {liquidHeight > 0 && (
          <mesh position={[0, -1.95 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, liquidHeight, 48]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.78}
              roughness={0.06} />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default Burette;
