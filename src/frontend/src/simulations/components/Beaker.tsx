import React from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';
import DraggablePhysicsObject from '../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  interactionMode?: 'observe' | 'practice';
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Beaker: React.FC<Props> = ({ object, isPlaying, interactionMode, onUpdatePosition, sceneGraph }) => {
  const liquidVolume = object.properties?.liquidVolume || 0; // 0 to 500 ml
  const liquidHeight = (liquidVolume / 500) * 1.8;

  return (
    <DraggablePhysicsObject 
      object={object} 
      label="Cốc Hóa Chất" 
      colliderArgs={[0.5, 1, 0.5]} 
      isPlaying={isPlaying}
      interactionMode={interactionMode}
      onUpdatePosition={onUpdatePosition}
      sceneGraph={sceneGraph}
    >
      <group>
        {/* Vỏ cốc thủy tinh */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.1}
            chromaticAberration={0.05}
            anisotropy={0.1}
            distortion={0}
            distortionScale={0}
            temporalDistortion={0}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#ffffff"
            color="#c9f1ff"
          />
        </mesh>

        {/* Nước bên trong cốc */}
        {liquidHeight > 0 && (
          <mesh position={[0, -1 + liquidHeight / 2 + 0.1, 0]}>
            <cylinderGeometry args={[0.45, 0.45, liquidHeight, 32]} />
            <meshStandardMaterial
              color="#00a8ff"
              transparent
              opacity={0.8}
              roughness={0.1}
            />
          </mesh>
        )}
      </group>
    </DraggablePhysicsObject>
  );
};

export default Beaker;
