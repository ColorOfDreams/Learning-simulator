import React, { useRef, useMemo } from 'react';
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

const ParabolaGraph: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const a = object.properties?.a ?? 1;
  const b = object.properties?.b ?? 0;
  const c = object.properties?.c ?? 0;
  const xMin = object.properties?.xMin ?? -3;
  const xMax = object.properties?.xMax ?? 3;
  const glowRef = useRef<THREE.Mesh>(null);

  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = a * x * x + b * x + c;
      pts.push([x, y, 0]);
    }
    return pts;
  }, [a, b, c, xMin, xMax]);

  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  useFrame((_, delta) => {
    if (isPlaying && glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.3;
    }
  });

  return (
    <DraggablePhysicsObject object={object} label={`y=${a}x²+${b}x+${c}`} colliderArgs={[3, 0.05, 0.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <Line points={curvePoints} color="#f59e0b" lineWidth={2} />
        <mesh ref={glowRef} position={[vertexX, vertexY, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
        </mesh>
        <Text position={[vertexX, vertexY + 0.3, 0]} fontSize={0.18} color="#ef4444" anchorX="center">
          {`(${vertexX.toFixed(1)}, ${vertexY.toFixed(1)})`}
        </Text>
      </group>
    </DraggablePhysicsObject>
  );
};

export default ParabolaGraph;
