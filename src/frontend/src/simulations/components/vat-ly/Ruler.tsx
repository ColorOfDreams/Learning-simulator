import React from 'react';
import { Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const Ruler: React.FC<Props> = ({ object, onUpdatePosition, sceneGraph }) => (
  <DraggablePhysicsObject object={object} label="Thước Đo" colliderArgs={[0.5, 0.05, 0.05]}
    onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.1, 0.1]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.4} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[-0.5 + i * 0.1, 0.06, 0]}>
          <boxGeometry args={[0.01, 0.02, 0.11]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
      <Text position={[0, 0.1, 0.06]} fontSize={0.08} color="#000" anchorX="center" anchorY="middle">
        0 1 2 3 4 5 6 7 8 9 10 cm
      </Text>
    </group>
  </DraggablePhysicsObject>
);

export default React.memo(Ruler);
