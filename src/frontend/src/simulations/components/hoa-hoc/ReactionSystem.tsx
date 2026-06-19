import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { findReaction } from '../../chemicals-catalog';

interface Props {
  objects: Scene.Object[];
  isPlaying: boolean;
}

const ReactionSystem: React.FC<Props> = ({ objects, isPlaying }) => {
  const particlesRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const activeReactions = useMemo(() => {
    if (!isPlaying) return [];
    const results: { pos: [number, number, number]; rule: any; key: string }[] = [];
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const a = objects[i], b = objects[j];
        const symA = a.properties?.symbol;
        const symB = b.properties?.symbol;
        if (!symA || !symB) continue;

        const dx = a.position[0] - b.position[0];
        const dy = a.position[1] - b.position[1];
        const dz = a.position[2] - b.position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist > 1.2) continue;

        const rule = findReaction([symA, symB]);
        if (!rule) continue;

        const mx = (a.position[0] + b.position[0]) / 2;
        const my = (a.position[1] + b.position[1]) / 2 + 0.25;
        const mz = (a.position[2] + b.position[2]) / 2;
        results.push({ pos: [mx, my, mz], rule, key: `${i}_${j}` });
      }
    }
    return results;
  }, [objects, isPlaying]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!particlesRef.current) return;
    const t = timeRef.current;
    particlesRef.current.children.forEach((child: any) => {
      if (child.userData?.type === 'bubble') {
        child.position.y += delta * 0.3;
        child.position.x += Math.sin(t * 3 + child.userData.offset) * 0.003;
        if (child.position.y > 1.5) child.position.y = -0.2;
      } else if (child.userData?.type === 'precipitate') {
        child.position.y -= delta * 0.15;
        if (child.position.y < -0.5) child.position.y = -0.5;
      } else if (child.userData?.type === 'color_change') {
        child.material.opacity = 0.3 + Math.sin(t * 2 + child.userData.offset) * 0.15;
      }
    });
  });

  if (activeReactions.length === 0) return null;

  return (
    <group ref={particlesRef}>
      {activeReactions.map((reaction, ri) => {
        const [mx, my, mz] = reaction.pos;
        const { effect, precipitateColor, newColor } = reaction.rule;
        const dots: React.ReactNode[] = [];

        if (effect === 'bubble') {
          for (let j = 0; j < 8; j++) {
            dots.push(
              <mesh key={`b${j}`} position={[mx + (Math.random() - 0.5) * 0.2, my - 0.3 + j * 0.18, mz + (Math.random() - 0.5) * 0.2]}
                userData={{ type: 'bubble', offset: j }}>
                <sphereGeometry args={[0.015 + Math.random() * 0.025, 8, 8]} />
                <meshStandardMaterial color="#e0f0ff" transparent opacity={0.6} depthWrite={false} />
              </mesh>,
            );
          }
        }

        if (effect === 'precipitate') {
          const pcolor = precipitateColor || '#ffffff';
          for (let j = 0; j < 15; j++) {
            dots.push(
              <mesh key={`p${j}`} position={[mx + (Math.random() - 0.5) * 0.15, my - 0.1 + Math.random() * 0.2, mz + (Math.random() - 0.5) * 0.15]}
                userData={{ type: 'precipitate', offset: j }}>
                <sphereGeometry args={[0.01 + Math.random() * 0.025, 6, 6]} />
                <meshStandardMaterial color={pcolor} roughness={0.6} depthWrite={false} />
              </mesh>,
            );
          }
        }

        if (effect === 'color_change' && newColor) {
          dots.push(
            <mesh key="cc" position={[mx, my, mz]} userData={{ type: 'color_change', offset: ri }}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color={newColor} transparent opacity={0.3} depthWrite={false} />
            </mesh>,
          );
        }

        return <group key={reaction.key}>{dots}</group>;
      })}
    </group>
  );
};

export default ReactionSystem;
