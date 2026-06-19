import React from 'react';
import { Text, Line } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const pHMeter: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const pH = object.properties?.pH ?? 7;
  const clampedpH = Math.max(0, Math.min(14, pH));
  const color = clampedpH < 6.5 ? '#ff3333' : clampedpH > 7.5 ? '#3366ff' : '#33aa33';

  const cablePoints: [number, number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    cablePoints.push([0.3 * t + 0.05 * Math.sin(t * 4), -0.4 * t, 0.05 * Math.cos(t * 5)]);
  }

  return (
    <DraggablePhysicsObject object={object} label="Máy đo pH" colliderArgs={[0.3, 0.25, 0.1]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.3, 0.15]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.25} />
        </mesh>
        <mesh castShadow position={[-0.23, 0, 0]}>
          <boxGeometry args={[0.04, 0.3, 0.15]} />
          <meshStandardMaterial color="#cccccc" roughness={0.3} />
        </mesh>
        <mesh position={[0.05, 0.04, 0.08]}>
          <boxGeometry args={[0.28, 0.16, 0.005]} />
          <meshStandardMaterial color="#0d1b2a" roughness={0.05} />
        </mesh>
        <mesh position={[0.05, 0.04, 0.09]}>
          <boxGeometry args={[0.28, 0.16, 0.001]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.15} />
        </mesh>
        <Text position={[0.05, 0.04, 0.095]} fontSize={0.12} color={color}
          anchorX="center" anchorY="middle" fontWeight="bold">
          {clampedpH.toFixed(1)}
        </Text>
        {[
          { position: [0, -0.1, 0.085] as [number, number, number], color: '#ff4444', label: 'ON' },
          { position: [0.08, -0.1, 0.085] as [number, number, number], color: '#ffaa00', label: 'HLD' },
          { position: [0.16, -0.1, 0.085] as [number, number, number], color: '#44aaff', label: 'CAL' },
        ].map((btn, i) => (
          <group key={i} position={btn.position}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
              <meshStandardMaterial color={btn.color} roughness={0.2} />
            </mesh>
            <Text position={[0, 0, 0.006]} fontSize={0.025} color="#ffffff" anchorX="center" anchorY="middle">
              {btn.label}
            </Text>
          </group>
        ))}
        <mesh position={[0.26, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 16]} />
          <meshStandardMaterial color="#707070" roughness={0.4} metalness={0.8} />
        </mesh>
        <group position={[0.35, -0.25, 0.05]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 16]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color="#ddeeff" transparent opacity={0.55} roughness={0.05} />
          </mesh>
        </group>
        <Line points={cablePoints} color="#444444" lineWidth={1} />
      </group>
    </DraggablePhysicsObject>
  );
};

export default pHMeter;
