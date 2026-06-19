import React, { useMemo, useState } from 'react';
import { Line, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const TrigWave: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const func = object.properties?.func ?? 'sin';
  const amplitude = object.properties?.amplitude ?? 2;
  const frequency = object.properties?.frequency ?? 1;
  const [phase, setPhase] = useState(object.properties?.phase ?? 0);

  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const x = -4 + (i / steps) * 8;
      const y = func === 'cos'
        ? amplitude * Math.cos(frequency * x + phase)
        : amplitude * Math.sin(frequency * x + phase);
      pts.push([x, y, 0]);
    }
    return pts;
  }, [func, amplitude, frequency, phase]);

  useFrame((_, delta) => {
    if (isPlaying) {
      setPhase((p: number) => p + delta * 0.8);
    }
  });

  const color = func === 'cos' ? '#8b5cf6' : '#3b82f6';

  return (
    <DraggablePhysicsObject object={object} label={`${func}(x)`} colliderArgs={[4, 0.05, 0.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[8, 0.02, 0.03]} />
          <meshBasicMaterial color="#555" />
        </mesh>
        <Line points={curvePoints} color={color} lineWidth={2} />
        <Text position={[4.3, 0, 0]} fontSize={0.16} color={color} anchorX="left">
          {`A=${amplitude} f=${frequency}`}
        </Text>
      </group>
    </DraggablePhysicsObject>
  );
};

export default TrigWave;
