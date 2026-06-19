import React, { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const evaluateExpr = (expr: string, x: number): number => {
  const e = expr.replace(/\^/g, '**').replace(/(\d)(x)/g, '$1*$2').replace(/\)\(/g, ')*(');
  const safe = e.replace(/x/g, `(${x})`);
  try {
    const val = Function(`'use strict'; return (${safe})`)();
    return isNaN(val) || !isFinite(val) ? 0 : val;
  } catch {
    return 0;
  }
};

const FunctionPlotter: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const expression = object.properties?.expression ?? 'x^2';
  const xMin = object.properties?.xMin ?? -4;
  const xMax = object.properties?.xMax ?? 4;

  const curvePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evaluateExpr(expression, x);
      pts.push([x, Math.max(-5, Math.min(5, y)), 0]);
    }
    return pts;
  }, [expression, xMin, xMax]);

  return (
    <DraggablePhysicsObject object={object} label={`f(x)=${expression}`} colliderArgs={[4, 0.05, 3]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh position={[0, -0.01, -0.05]}>
          <planeGeometry args={[8, 6]} />
          <meshStandardMaterial color="#111122" transparent opacity={0.5} />
        </mesh>
        <Line points={[[-4, 0, 0.01], [4, 0, 0.01]]} color="#ef4444" lineWidth={1} />
        <Line points={[[0, -3, 0.01], [0, 3, 0.01]]} color="#3b82f6" lineWidth={1} />
        <Line points={curvePoints} color="#f59e0b" lineWidth={2} />
        <Text position={[4.3, 0, 0]} fontSize={0.14} color="#ef4444" anchorX="left">x</Text>
        <Text position={[0, 3.3, 0]} fontSize={0.14} color="#3b82f6" anchorX="center">y</Text>
      </group>
    </DraggablePhysicsObject>
  );
};

export default FunctionPlotter;
