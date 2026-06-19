import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const AXIS_COLORS: Record<string, string> = { x: '#ef4444', y: '#3b82f6' };

const CoordinatePlane: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const gridLines = useMemo(() => {
    const lines: { pos: [number, number, number]; direction: 'x' | 'z'; val: number }[] = [];
    for (let i = -5; i <= 5; i++) {
      lines.push({ pos: [i, 0, 0], direction: 'z', val: i });
      lines.push({ pos: [0, 0, i], direction: 'x', val: i });
    }
    return lines;
  }, []);

  const labels = useMemo(() => {
    const result: { pos: [number, number, number]; text: string; color: string }[] = [];
    for (let i = -4; i <= 4; i += 2) {
      if (i !== 0) {
        result.push({ pos: [i, 0.05, 0.15], text: String(i), color: AXIS_COLORS.x });
        result.push({ pos: [0.15, 0.05, i], text: String(i), color: AXIS_COLORS.y });
      }
    }
    result.push({ pos: [0.15, 0.05, 0.25], text: 'O', color: '#ffffff' });
    return result;
  }, []);

  return (
    <DraggablePhysicsObject object={object} label="Mặt Phẳng Tọa Độ" colliderArgs={[5, 0.05, 5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#1a1a2e" transparent opacity={0.6} />
        </mesh>
        {gridLines.map((g, i) => (
          <mesh key={i} position={[0, 0.005, 0]}>
            <boxGeometry args={g.direction === 'x' ? [10, 0.005, 0.03] : [0.03, 0.005, 10]}
            />
            <meshBasicMaterial color={g.val === 0 ? '#ffffff' : '#444466'} />
          </mesh>
        ))}
        {labels.map((l, i) => (
          <Text key={i} position={l.pos} fontSize={0.2} color={l.color} anchorX="center" anchorY="middle">
            {l.text}
          </Text>
        ))}
      </group>
    </DraggablePhysicsObject>
  );
};

export default CoordinatePlane;
