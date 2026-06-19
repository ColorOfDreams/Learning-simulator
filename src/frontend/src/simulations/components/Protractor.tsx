import React from 'react';
import DraggablePhysicsObject from '../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Protractor: React.FC<Props> = ({ object, onUpdatePosition, sceneGraph }) => (
  <DraggablePhysicsObject object={object} label="Thước Đo Góc" colliderArgs={[0.3, 0.3, 0.05]}
    onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
    <group rotation={[0, 0, -Math.PI / 2]}>
      <mesh castShadow>
        <ringGeometry args={[0.25, 0.3, 64, 1, Math.PI]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.3} side={2} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.25, 0.26, 64]} />
        <meshStandardMaterial color="#d97706" roughness={0.2} side={2} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.06]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  </DraggablePhysicsObject>
);

export default Protractor;
