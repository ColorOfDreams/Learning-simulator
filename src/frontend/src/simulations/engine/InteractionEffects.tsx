import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSnapPointsForModel } from './DraggablePhysicsObject';

interface Props {
  objects: Scene.Object[];
  isPlaying: boolean;
}

const getInitY = (m: string) => {
  const map: Record<string, number> = { WoodenBlock:0.15, Beaker:0.4, Stand:1.9, SimplePendulum:1.5, SpringPendulum:1.5, Spring:1.5, MassBlock:0.2, Dashpot:0.5, DrivingMotor:0.2 };
  return map[m] ?? 0;
};

const InteractionEffects: React.FC<Props> = ({ objects, isPlaying }) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const snaps = useMemo(() => {
    const result: { pos: [number,number,number]; fresh: boolean }[] = [];
    for (let i = 0; i < objects.length; i++) {
      const a = objects[i];
      const aSnaps = getSnapPointsForModel(a.modelName, a.properties);
      if (!aSnaps?.length) continue;
      const ap = [...a.position] as [number,number,number];
      if (ap[1] === 5) ap[1] = getInitY(a.modelName);
      for (const sa of aSnaps) {
        const aw: [number,number,number] = [ap[0]+sa.position[0], ap[1]+sa.position[1], ap[2]+sa.position[2]];
        for (let j = i+1; j < objects.length; j++) {
          const b = objects[j];
          const bSnaps = getSnapPointsForModel(b.modelName, b.properties);
          if (!bSnaps?.length) continue;
          const bp = [...b.position] as [number,number,number];
          if (bp[1] === 5) bp[1] = getInitY(b.modelName);
          for (const sb of bSnaps) {
            if (!sa.connectsTo.includes(sb.type) && !sb.connectsTo.includes(sa.type)) continue;
            const bw: [number,number,number] = [bp[0]+sb.position[0], bp[1]+sb.position[1], bp[2]+sb.position[2]];
            const dist = Math.sqrt((aw[0]-bw[0])**2 + (aw[1]-bw[1])**2 + (aw[2]-bw[2])**2);
            if (dist < 0.1) result.push({ pos: [(aw[0]+bw[0])/2, (aw[1]+bw[1])/2, (aw[2]+bw[2])/2], fresh: true });
          }
        }
      }
    }
    return result;
  }, [objects]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child: any) => {
      if (child.userData?.type === 'snap-particle') {
        const elapsed = timeRef.current - (child.userData.birth || 0);
        const life = child.userData.life || 0.8;
        if (elapsed > life) { child.visible = false; return; }
        const t = elapsed / life;
        child.position.x += child.userData.vx * delta;
        child.position.y += child.userData.vy * delta;
        child.position.z += child.userData.vz * delta;
        child.material.opacity = 1 - t;
        child.scale.setScalar(1 - t * 0.7);
      }
    });
  });

  const particles = useMemo(() => {
    const result: React.ReactNode[] = [];
    snaps.forEach((snap, si) => {
      for (let j = 0; j < 12; j++) {
        result.push(
          <mesh key={`sp-${si}-${j}`} position={snap.pos}
            userData={{
              type: 'snap-particle', birth: timeRef.current, life: 0.8,
              vx: (Math.random()-0.5)*0.8, vy: Math.random()*0.6+0.2, vz: (Math.random()-0.5)*0.8,
            }}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} transparent opacity={0.8} depthWrite={false} />
          </mesh>,
        );
      }
    });
    return result;
  }, [snaps.length]);

  return (
    <group ref={groupRef}>
      {particles}
      {snaps.map((snap, i) => (
        <mesh key={`snap-flash-${i}`} position={snap.pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

export default React.memo(InteractionEffects);
