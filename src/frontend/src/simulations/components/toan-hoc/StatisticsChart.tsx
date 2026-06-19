import React, { useMemo } from 'react';
import { Text, Line } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const BAR_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const StatisticsChart: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const chartType = object.properties?.chartType ?? 'bar';
  const data: number[] = object.properties?.data ?? [3, 7, 2, 9, 5, 6];
  const maxVal = Math.max(...data, 1);
  const barWidth = 0.6;
  const spacing = 1.1;
  const totalWidth = data.length * spacing;

  const bars = useMemo(() => data.map((val, i) => {
    const x = -totalWidth / 2 + i * spacing + spacing / 2;
    const h = (val / maxVal) * 4;
    return { x, h, val, color: BAR_COLORS[i % BAR_COLORS.length] };
  }), [data, maxVal, totalWidth]);

  const linePoints = useMemo((): [number, number, number][] => {
    return data.map((val, i) => {
      const x = -totalWidth / 2 + i * spacing + spacing / 2;
      const y = (val / maxVal) * 4;
      return [x, y, 0.05];
    });
  }, [data, maxVal, totalWidth]);

  const yLabels = useMemo(() => {
    const labels: { pos: [number, number, number]; text: string }[] = [];
    for (let i = 0; i <= 4; i++) {
      labels.push({ pos: [-totalWidth / 2 - 0.35, (i / 4) * 4, 0.05], text: ((i / 4) * maxVal).toFixed(1) });
    }
    return labels;
  }, [maxVal, totalWidth]);

  return (
    <DraggablePhysicsObject object={object} label={chartType === 'bar' ? 'Biểu Đồ Cột' : 'Biểu Đồ Đường'}
      colliderArgs={[totalWidth / 2 + 0.5, 0.05, 2.5]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <Line points={[[-totalWidth / 2, 0, 0.01], [totalWidth / 2 + 0.1, 0, 0.01]]} color="#666" lineWidth={1} />
        <Line points={[[-totalWidth / 2, 0, 0.01], [-totalWidth / 2, 4.1, 0.01]]} color="#666" lineWidth={1} />
        {chartType === 'bar'
          ? bars.map((bar, i) => (
            <mesh key={i} position={[bar.x, bar.h / 2, 0.03]}>
              <boxGeometry args={[barWidth, bar.h, 0.1]} />
              <meshStandardMaterial color={bar.color} roughness={0.4} />
            </mesh>
          ))
          : <Line points={linePoints} color="#3b82f6" lineWidth={2} />
        }
        {chartType === 'line' && data.map((_, i) => (
          <mesh key={i} position={[linePoints[i][0], linePoints[i][1], 0.06]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
          </mesh>
        ))}
        {bars.map((bar, i) => (
          <Text key={`t-${i}`} position={[bar.x, bar.h + 0.2, 0.05]} fontSize={0.18} color="#fff" anchorX="center">
            {bar.val}
          </Text>
        ))}
        {yLabels.map((l, i) => (
          <Text key={`y-${i}`} position={l.pos} fontSize={0.14} color="#999" anchorX="right" anchorY="middle">
            {l.text}
          </Text>
        ))}
      </group>
    </DraggablePhysicsObject>
  );
};

export default StatisticsChart;
