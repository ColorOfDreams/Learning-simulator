import React from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Condenser: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  return (
    <DraggablePhysicsObject object={object} label="Ống sinh hàn Liebig" colliderArgs={[0.2, 2.2, 0.2]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.15, 3.5, 48]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.05}
            chromaticAberration={0.04} anisotropy={0.15} clearcoat={1}
            attenuationDistance={0.6} attenuationColor="#ffffff" color="#d8f0ff" />
        </mesh>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.05, 4.0, 32]} />
          <MeshTransmissionMaterial backside samples={4} thickness={0.04}
            chromaticAberration={0.02} anisotropy={0.1} clearcoat={1}
            attenuationDistance={0.4} attenuationColor="#ffffff" color="#e8f8ff" />
        </mesh>
        {isPlaying && (
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 3.4, 32]} />
            <meshStandardMaterial color="#2299ee" transparent opacity={0.08} roughness={0.05} />
          </mesh>
        )}
        <mesh position={[0, 1.75, 0]}>
          <torusGeometry args={[0.15, 0.015, 8, 48]} />
          <meshStandardMaterial color="#d0e8f8" roughness={0.15} />
        </mesh>
        <mesh position={[0, -1.75, 0]}>
          <torusGeometry args={[0.15, 0.015, 8, 48]} />
          <meshStandardMaterial color="#d0e8f8" roughness={0.15} />
        </mesh>
        <mesh position={[0, 2.05, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.2, 24]} />
          <meshStandardMaterial color="#e8f4ff" roughness={0.1} />
        </mesh>
        <mesh position={[0, -2.05, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.2, 24]} />
          <meshStandardMaterial color="#e8f4ff" roughness={0.1} />
        </mesh>
        <group position={[0.18, 1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
            <meshStandardMaterial color="#c8e0f0" roughness={0.12} />
          </mesh>
          <mesh position={[0.18, 0, 0]}>
            <torusGeometry args={[0.044, 0.01, 8, 16]} />
            <meshStandardMaterial color="#d0e8f8" roughness={0.15} />
          </mesh>
        </group>
        <group position={[-0.18, -1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 16]} />
            <meshStandardMaterial color="#c8e0f0" roughness={0.12} />
          </mesh>
          <mesh position={[-0.18, 0, 0]}>
            <torusGeometry args={[0.044, 0.01, 8, 16]} />
            <meshStandardMaterial color="#d0e8f8" roughness={0.15} />
          </mesh>
        </group>
      </group>
    </DraggablePhysicsObject>
  );
};

export default Condenser;
