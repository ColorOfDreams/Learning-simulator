import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { getSnapPointsForModel } from './DraggablePhysicsObject';

const getInitY = (m: string) => {
  const map: Record<string, number> = {
    WoodenBlock: 0.15, Beaker: 0.4, Stand: 1.9,
    SimplePendulum: 1.5, SpringPendulum: 1.5, Spring: 1.5,
    MassBlock: 0.2, Dashpot: 0.5, DrivingMotor: 0.2,
  };
  return map[m] ?? 0;
};

interface Props {
  objects: Scene.Object[];
  hoveredObjectId: string | null;
}

const ConnectionLines: React.FC<Props> = ({ objects, hoveredObjectId }) => {
  const connections = useMemo(() => {
    const result: Array<{ from: [number, number, number]; to: [number, number, number]; active: boolean }> = [];

    for (let i = 0; i < objects.length; i++) {
      const a = objects[i];
      const aSnaps = getSnapPointsForModel(a.modelName, a.properties);
      if (!aSnaps?.length) continue;
      const ap = [...a.position] as [number, number, number];
      if (ap[1] === 5) ap[1] = getInitY(a.modelName);

      for (const sa of aSnaps) {
        const aw: [number, number, number] = [ap[0] + sa.position[0], ap[1] + sa.position[1], ap[2] + sa.position[2]];

        for (let j = i + 1; j < objects.length; j++) {
          const b = objects[j];
          const bSnaps = getSnapPointsForModel(b.modelName, b.properties);
          if (!bSnaps?.length) continue;
          const bp = [...b.position] as [number, number, number];
          if (bp[1] === 5) bp[1] = getInitY(b.modelName);

          for (const sb of bSnaps) {
            const compatible = sa.connectsTo.includes(sb.type) || sb.connectsTo.includes(sa.type);
            if (!compatible) continue;

            const bw: [number, number, number] = [bp[0] + sb.position[0], bp[1] + sb.position[1], bp[2] + sb.position[2]];
            const dist = Math.sqrt((aw[0] - bw[0]) ** 2 + (aw[1] - bw[1]) ** 2 + (aw[2] - bw[2]) ** 2);
            const snapped = dist < 0.15;

            const isHovered = hoveredObjectId === a.id || hoveredObjectId === b.id;
            if (snapped || (isHovered && dist < 1.5)) {
              result.push({ from: aw, to: bw, active: snapped });
            }
          }
        }
      }
    }
    return result;
  }, [objects, hoveredObjectId]);

  return (
    <>
      {connections.map((c, i) => (
        <Line
          key={i}
          points={[c.from, c.to]}
          color={c.active ? '#22c55e' : '#94a3b8'}
          lineWidth={c.active ? 2.5 : 1}
          dashed={!c.active}
          dashScale={0.5}
          dashSize={0.3}
          opacity={c.active ? 0.9 : 0.4}
        />
      ))}
    </>
  );
};

export default React.memo(ConnectionLines);
