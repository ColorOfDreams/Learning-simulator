import React, { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const vertexColors = ['#ef4444', '#22c55e', '#3b82f6'];

const GeometryTriangle: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const v1: [number, number, number] = object.properties?.v1 ?? [-2, 0, 0];
  const v2: [number, number, number] = object.properties?.v2 ?? [2, 0, 0];
  const v3: [number, number, number] = object.properties?.v3 ?? [0, 2.5, 0];

  const { edges, sideLengths, angles } = useMemo(() => {
    const edges: [number, number, number][][] = [[v1, v2], [v2, v3], [v3, v1]];
    const lens = edges.map(([a, b]) => {
      const dx = b[0] - a[0], dy = b[1] - a[1];
      return Math.sqrt(dx * dx + dy * dy);
    });

    const angle = (i: number) => {
      const a = lens[(i + 1) % 3], b = lens[(i + 2) % 3], c = lens[i];
      const cosVal = (a * a + b * b - c * c) / (2 * a * b);
      return (Math.acos(Math.max(-1, Math.min(1, cosVal))) * 180) / Math.PI;
    };

    const angles = [angle(0), angle(1), angle(2)];
    return { edges, sideLengths: lens, angles };
  }, [v1, v2, v3]);

  const labels = useMemo(() => {
    const result: { pos: [number, number, number]; text: string; color: string }[] = [];
    const vertices = [v1, v2, v3];
    const midpoints = edges.map(([a, b]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.12] as [number, number, number]);
    const offsets = [
      [0, -0.25, 0], [-0.25, 0, 0], [0.25, -0.1, 0],
    ];

    vertices.forEach((v, i) => {
      result.push({
        pos: [v[0] + offsets[i][0], v[1] + offsets[i][1], 0.1],
        text: `${angles[i].toFixed(0)}°`,
        color: '#ffffff',
      });
    });
    edges.forEach((_, i) => {
      result.push({
        pos: midpoints[i],
        text: sideLengths[i].toFixed(2),
        color: '#f59e0b',
      });
    });
    return result;
  }, [edges, sideLengths, angles, v1, v2, v3]);

  return (
    <DraggablePhysicsObject object={object} label="Tam Giác" colliderArgs={[2.5, 0.05, 1.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        {edges.map(([a, b], i) => (
          <Line key={i} points={[a, b]} color={vertexColors[i]} lineWidth={2} />
        ))}
        {[v1, v2, v3].map((v, i) => (
          <mesh key={`v-${i}`} position={[v[0], v[1], 0.05]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color={vertexColors[i]} emissive={vertexColors[i]} emissiveIntensity={0.4} />
          </mesh>
        ))}
        {labels.map((l, i) => (
          <Text key={i} position={l.pos} fontSize={0.15} color={l.color} anchorX="center" anchorY="middle">
            {l.text}
          </Text>
        ))}
      </group>
    </DraggablePhysicsObject>
  );
};

export default GeometryTriangle;
