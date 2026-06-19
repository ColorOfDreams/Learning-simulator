import React, { useRef, useMemo, useState } from 'react';
import { Line, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const GeometryCircle: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const radius = object.properties?.radius ?? 2;
  const [angle, setAngle] = useState(0);
  const lineRef = useRef<THREE.Group>(null);

  const circlePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      pts.push([radius * Math.cos(a), radius * Math.sin(a), 0]);
    }
    return pts;
  }, [radius]);

  const circumference = (2 * Math.PI * radius).toFixed(2);

  useFrame((_, delta) => {
    if (isPlaying) {
      setAngle((a) => a + delta * 1.5);
    }
  });

  const radiusEnd: [number, number, number] = [radius * Math.cos(angle), radius * Math.sin(angle), 0];

  return (
    <DraggablePhysicsObject object={object} label="Đường Tròn" colliderArgs={[radius + 0.3, 0.05, radius + 0.3]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <Line points={circlePoints} color="#22c55e" lineWidth={2} />
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <group ref={lineRef}>
          <Line points={[[0, 0, 0.02], radiusEnd]} color="#f59e0b" lineWidth={1.5} />
        </group>
        <Text position={[radius + 0.4, 0, 0]} fontSize={0.16} color="#22c55e" anchorX="left">
          {`r=${radius} C=${circumference}`}
        </Text>
      </group>
    </DraggablePhysicsObject>
  );
};

export default GeometryCircle;
