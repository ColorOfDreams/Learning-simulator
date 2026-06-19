import React from 'react';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Mortar: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const powderParticles = [];
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.15;
    powderParticles.push(
      <mesh key={i} position={[Math.cos(angle) * r, -0.3 + Math.random() * 0.04, Math.sin(angle) * r]}>
        <sphereGeometry args={[0.008 + Math.random() * 0.012, 6, 6]} />
        <meshStandardMaterial color={i % 3 === 0 ? '#f5f0e0' : '#e8dcc8'} roughness={0.9} />
      </mesh>,
    );
  }

  return (
    <DraggablePhysicsObject object={object} label="Cối chày sứ" colliderArgs={[0.4, 0.4, 0.4]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh castShadow position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.28, 0.3, 0.08, 32]} />
          <meshStandardMaterial color="#e0d8c8" roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.35, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.32, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
          <meshStandardMaterial color="#fafaf5" roughness={0.1} />
        </mesh>
        <mesh castShadow position={[0, 0.05, 0]}>
          <torusGeometry args={[0.35, 0.04, 12, 48]} />
          <meshStandardMaterial color="#e8e0d0" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.05, 0]}>
          <torusGeometry args={[0.34, 0.015, 8, 48]} />
          <meshStandardMaterial color="#fafaf5" roughness={0.15} />
        </mesh>
        {powderParticles}
        <group position={[0.12, 0.1, 0.08]} rotation={[0.35, 0, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.35, 24]} />
            <meshStandardMaterial color="#f8f3e8" roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3, 20]} />
            <meshStandardMaterial color="#f8f3e8" roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.05, 20, 20]} />
            <meshStandardMaterial color="#f5f0e0" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.06, 20, 20]} />
            <meshStandardMaterial color="#f5f0e0" roughness={0.3} />
          </mesh>
        </group>
      </group>
    </DraggablePhysicsObject>
  );
};

export default Mortar;
