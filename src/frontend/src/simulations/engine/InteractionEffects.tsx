import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getEquipmentConfig } from './EquipmentRegistry';
import { useInteraction } from './InteractionContext';
import { getChemColor } from '@/dung-cu/hoa-hoc/dung-cu-hoa-hoc';

interface Props {
  objects: Scene.Object[];
  isPlaying: boolean;
}



const getInitY = (m: string) => {
  return 0; // replaced by registry, keeping stub just in case
};

const PouringParticles: React.FC<{ start: THREE.Vector3, end: THREE.Vector3, color: string }> = ({ start, end, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 80;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      progress: Math.random(),
      speed: 0.6 + Math.random() * 0.4,
      offset: new THREE.Vector3((Math.random() - 0.5) * 0.04, 0, (Math.random() - 0.5) * 0.04)
    }));
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.progress += delta * p.speed;
      if (p.progress > 1) p.progress = 0;

      const currentPos = new THREE.Vector3().lerpVectors(start, end, p.progress);
      // Simulate slight gravity curve
      const drop = p.progress * p.progress * 0.3;
      dummy.position.copy(currentPos).add(p.offset);
      dummy.position.y -= drop;
      dummy.scale.setScalar(Math.max(0.3, 1 - p.progress));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, particleCount]}>
      <sphereGeometry args={[0.025, 4, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
};

const PouringSolidParticles: React.FC<{ start: THREE.Vector3, end: THREE.Vector3, color: string }> = ({ start, end, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 20;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      progress: Math.random(),
      speed: 0.8 + Math.random() * 0.4,
      offset: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1),
      rotSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.1)
    }));
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.progress += delta * p.speed;
      if (p.progress > 1) p.progress = 0;

      const currentPos = new THREE.Vector3().lerpVectors(start, end, p.progress);
      const drop = p.progress * p.progress * 0.4;
      dummy.position.copy(currentPos).add(p.offset);
      dummy.position.y -= drop;
      dummy.rotation.x += p.rotSpeed.x;
      dummy.rotation.y += p.rotSpeed.y;
      dummy.rotation.z += p.rotSpeed.z;
      dummy.scale.setScalar(Math.max(0.4, 1 - p.progress * 0.5));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, particleCount]}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </instancedMesh>
  );
};

const PouringGasParticles: React.FC<{ start: THREE.Vector3, end: THREE.Vector3, color: string }> = ({ start, end, color }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = 40;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      progress: Math.random(),
      speed: 0.3 + Math.random() * 0.3,
      offset: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2),
    }));
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.progress += delta * p.speed;
      if (p.progress > 1) p.progress = 0;

      const currentPos = new THREE.Vector3().lerpVectors(start, end, p.progress);
      const spread = p.progress * 0.3;
      dummy.position.copy(currentPos).add(p.offset.clone().multiplyScalar(1 + spread));
      dummy.position.y += p.progress * 0.2;
      dummy.scale.setScalar(Math.max(0.5, p.progress * 2));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, particleCount]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
    </instancedMesh>
  );
};

const ReactionVisual: React.FC<{ objectId: string, effect: any, position: THREE.Vector3 }> = ({ objectId, effect, position }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particleCount = effect.effect === 'bubble' ? 50 : (effect.effect === 'precipitate' ? 100 : 0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      progress: Math.random(),
      speed: 0.2 + Math.random() * 0.4,
      offset: new THREE.Vector3((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.25),
    }));
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!meshRef.current || particleCount === 0) return;
    const isBubble = effect.effect === 'bubble';
    particles.forEach((p, i) => {
      p.progress += delta * p.speed;
      if (p.progress > 1) {
        p.progress = 0;
        p.offset.set((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.25);
      }
      
      dummy.position.copy(position).add(p.offset);
      if (isBubble) {
        dummy.position.y += p.progress * 0.4; // rise up
        dummy.scale.setScalar(0.4 + p.progress * 0.6);
      } else {
        dummy.position.y -= p.progress * 0.3; // fall down
        dummy.scale.setScalar(0.5);
      }
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (particleCount === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, particleCount]}>
      <sphereGeometry args={[effect.effect === 'bubble' ? 0.02 : 0.015, 8, 8]} />
      <meshStandardMaterial 
        color={effect.effect === 'bubble' ? '#ffffff' : (effect.precipitateColor || '#a8a29e')} 
        transparent 
        opacity={effect.effect === 'bubble' ? 0.6 : 0.9} 
      />
    </instancedMesh>
  );
};

const InteractionEffects: React.FC<Props> = ({ objects, isPlaying }) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const snaps = useMemo(() => {
    const result: { pos: [number, number, number]; fresh: boolean }[] = [];
    for (let i = 0; i < objects.length; i++) {
      const a = objects[i];
      const aSnaps = getEquipmentConfig(a.modelName).getSnapPoints(a.properties);
      if (!aSnaps?.length) continue;
      const ap = [...a.position] as [number, number, number];
      if (ap[1] === 5) ap[1] = getEquipmentConfig(a.modelName).initY;
      for (const sa of aSnaps) {
        const aw: [number, number, number] = [ap[0] + sa.position[0], ap[1] + sa.position[1], ap[2] + sa.position[2]];
        for (let j = i + 1; j < objects.length; j++) {
          const b = objects[j];
          const bSnaps = getEquipmentConfig(b.modelName).getSnapPoints(b.properties);
          if (!bSnaps?.length) continue;
          const bp = [...b.position] as [number, number, number];
          if (bp[1] === 5) bp[1] = getEquipmentConfig(b.modelName).initY;
          for (const sb of bSnaps) {
            if (!sa.connectsTo.includes(sb.type) && !sb.connectsTo.includes(sa.type)) continue;
            const bw: [number, number, number] = [bp[0] + sb.position[0], bp[1] + sb.position[1], bp[2] + sb.position[2]];
            const dist = Math.sqrt((aw[0] - bw[0]) ** 2 + (aw[1] - bw[1]) ** 2 + (aw[2] - bw[2]) ** 2);
            if (dist < 0.1) result.push({ pos: [(aw[0] + bw[0]) / 2, (aw[1] + bw[1]) / 2, (aw[2] + bw[2]) / 2], fresh: true });
          }
        }
      }
    }
    return result;
  }, [objects]);

  const { pouringAction, setPouringAction, checkRuleAndAdvance, updateObjectProperty } = useInteraction();

  const heatTimerRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!groupRef.current) return;

    if (isPlaying) {
      heatTimerRef.current += delta;
      if (heatTimerRef.current > 1.0) {
        heatTimerRef.current = 0;
        const burners = objects.filter(o => (o.modelName === 'BunsenBurner' || o.modelName === 'DenCon') && (o.properties?.batDen || (o as any).thuocTinh?.batDen));
        if (burners.length > 0) {
          burners.forEach(burner => {
            const bp = [...(burner.position || (burner as any).viTri || [0,0,0])];
            objects.forEach(target => {
              if (target.id === burner.id) return;
              const targetModel = target.modelName || (target as any).maDungCu;
              if (!getEquipmentConfig(targetModel).tags.includes('container')) return;
              const tp = [...(target.position || (target as any).viTri || [0,0,0])];
              const distXZ = Math.sqrt((bp[0] - tp[0])**2 + (bp[2] - tp[2])**2);
              const dy = tp[1] - bp[1];
              if (distXZ < 0.6 && dy > 0 && dy < 2.0) {
                if (checkRuleAndAdvance) checkRuleAndAdvance('heat', burner.id, target.id);
                if (updateObjectProperty) {
                  const curTemp = target.properties?.temperature || 25;
                  if (curTemp < 100) {
                    updateObjectProperty(target.id, 'temperature', curTemp + 5);
                  }
                }
              }
            });
          });
        }
      }
    }

    // Auto-dismiss pouring action after 2.5 seconds

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

      if (child.userData?.type === 'pour-particle') {
        const elapsed = performance.now() - (child.userData.birth || 0);
        const life = child.userData.life || 800; // ms
        if (elapsed > life) { child.visible = false; return; }
        const t = elapsed / life;
        // Gravity effect
        child.userData.vy -= 9.8 * delta;
        child.position.x += child.userData.vx * delta;
        child.position.y += child.userData.vy * delta;
        child.position.z += child.userData.vz * delta;
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
              vx: (Math.random() - 0.5) * 0.8, vy: Math.random() * 0.6 + 0.2, vz: (Math.random() - 0.5) * 0.8,
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

      {/* Liquid Stream for pouring action */}
      {pouringAction && (() => {
        const sourceObj = objects.find(o => o.id === pouringAction.sourceId);
        const targetObj = objects.find(o => o.id === pouringAction.targetId);
        if (!sourceObj || !targetObj) return null;

        const sp = pouringAction.sourcePos || ([...sourceObj.position] as [number, number, number]);
        const tp = [...targetObj.position] as [number, number, number];
        const sy = sp[1] === 5 ? getEquipmentConfig(sourceObj.modelName).initY : sp[1];
        const ty = tp[1] === 5 ? getEquipmentConfig(targetObj.modelName).initY : tp[1];

        // Stream from source spout to target center
        // The source is tilted -45 deg, and its center is shifted -0.25 on X and +0.5 on Y relative to the beaker.
        // The spout is approximately at X + 0.35, Y + 0.1 relative to its shifted center.
        const streamStart = new THREE.Vector3(sp[0] + 0.15, sy + 0.15, sp[2]);
        const streamEnd = new THREE.Vector3(tp[0], ty + 0.4, tp[2]);
        const sourceProps = (sourceObj as any).properties || (sourceObj as any).thuocTinh || {};
        const chemSymbol = sourceProps.kyHieu || sourceProps.symbol;
        const fallbackColor = sourceProps.liquidColor || sourceProps.mauChatLong || '#3b82f6';
        const liquidColor = chemSymbol ? getChemColor(chemSymbol, fallbackColor) : fallbackColor;

        if (sourceObj.modelName === 'ChemicalSolid') {
          return <PouringSolidParticles start={streamStart} end={streamEnd} color={liquidColor} />;
        } else if (sourceObj.modelName === 'ChemicalGas') {
          return <PouringGasParticles start={streamStart} end={streamEnd} color={liquidColor} />;
        }
        return <PouringParticles start={streamStart} end={streamEnd} color={liquidColor} />;
      })()}

      {/* Reaction Visuals */}
      {objects.map(obj => {
        const effect = obj.properties?.reactionEffect;
        if (!effect) return null;
        const elapsed = (Date.now() - (effect.timestamp || 0)) / 1000;
        if (elapsed > (effect.durationLeft || 5)) return null;

        const p = [...obj.position] as [number, number, number];
        const y = p[1] === 5 ? getEquipmentConfig(obj.modelName).initY : p[1];
        const pos = new THREE.Vector3(p[0], y + 0.2, p[2]); // render inside container
        
        return <ReactionVisual key={`rxn-${obj.id}`} objectId={obj.id} effect={effect} position={pos} />;
      })}
    </group>
  );
};

export default React.memo(InteractionEffects);
