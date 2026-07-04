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
  const sparkRef = useRef<THREE.InstancedMesh>(null);
  const smokeRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const eType = effect.effect || effect.type || 'none';

  const particleCount = eType === 'bubble' ? 60
    : eType === 'precipitate' ? 120
    : eType === 'color_change' ? 30
    : eType === 'dissolve' ? 50
    : eType === 'explosion' ? 80
    : eType === 'smoke' ? 50
    : eType === 'steam' ? 40
    : eType === 'flame' ? 60
    : eType === 'flash' ? 20
    : 0;

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      progress: Math.random(),
      speed: 0.15 + Math.random() * 0.45,
      angle: Math.random() * Math.PI * 2,
      radius: 0.05 + Math.random() * 0.25,
      offset: new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.3),
    }));
  }, [particleCount, eType]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!meshRef.current || particleCount === 0) return;

    particles.forEach((p, i) => {
      p.progress += delta * p.speed;
      if (p.progress > 1) {
        p.progress = 0;
        p.angle = Math.random() * Math.PI * 2;
        p.radius = 0.05 + Math.random() * 0.25;
        p.offset.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.3);
      }

      dummy.position.copy(position).add(p.offset);

      switch (eType) {
        case 'bubble':
          dummy.position.y += p.progress * 0.5;
          dummy.scale.setScalar(0.3 + p.progress * 0.7);
          break;
        case 'precipitate':
          dummy.position.y -= p.progress * 0.35;
          dummy.scale.setScalar(0.4);
          break;
        case 'color_change':
          dummy.position.x += Math.sin(p.angle + timeRef.current * 2) * p.radius * p.progress;
          dummy.position.y += p.progress * 0.15;
          dummy.scale.setScalar(0.3 + p.progress * 0.4);
          break;
        case 'dissolve':
          dummy.position.x += Math.sin(p.angle * 3 + timeRef.current) * p.radius * p.progress;
          dummy.position.y += p.progress * 0.1;
          dummy.position.z += Math.cos(p.angle * 3 + timeRef.current) * p.radius * p.progress;
          dummy.scale.setScalar(0.5 - p.progress * 0.3);
          break;
        case 'explosion':
          dummy.position.x += Math.cos(p.angle) * p.progress * 0.6;
          dummy.position.y += p.progress * 0.4 + Math.sin(p.progress * Math.PI) * 0.2;
          dummy.position.z += Math.sin(p.angle) * p.progress * 0.6;
          dummy.scale.setScalar(0.2 + p.progress * 0.5);
          break;
        case 'smoke':
          dummy.position.y += p.progress * 0.6;
          dummy.position.x += Math.sin(p.angle + timeRef.current) * p.radius * p.progress * 0.5;
          dummy.position.z += Math.cos(p.angle + timeRef.current) * p.radius * p.progress * 0.5;
          dummy.scale.setScalar(0.2 + p.progress * 2.5);
          break;
        case 'steam':
          dummy.position.y += p.progress * 0.8;
          dummy.position.x += Math.sin(p.angle * 0.5 + timeRef.current) * p.progress * 0.6;
          dummy.position.z += Math.cos(p.angle * 0.5 + timeRef.current * 0.7) * p.progress * 0.6;
          dummy.scale.setScalar(0.5 + p.progress * 1.5);
          break;
        case 'flame':
          dummy.position.y += p.progress * 0.35;
          dummy.position.x += Math.cos(p.angle) * (0.5 - p.progress * 0.3) * 0.3;
          dummy.position.z += Math.sin(p.angle) * (0.5 - p.progress * 0.3) * 0.3;
          dummy.scale.setScalar(0.4 + Math.sin(p.progress * Math.PI) * 0.6);
          break;
        case 'flash':
          dummy.position.y += p.progress * 0.2;
          dummy.position.x += Math.cos(p.angle) * p.progress * 0.4;
          dummy.position.z += Math.sin(p.angle) * p.progress * 0.4;
          dummy.scale.setScalar(1.0 + p.progress * 1.5);
          break;
      }

      dummy.rotation.x += delta * 2;
      dummy.rotation.y += delta * 1.5;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    if (sparkRef.current && (eType === 'explosion' || eType === 'flame')) {
      particles.forEach((p, i) => {
        const sp = p.progress;
        dummy.position.copy(position);
        dummy.position.x += Math.cos(p.angle) * sp * (eType === 'flame' ? 0.4 : 0.8);
        dummy.position.y += sp * 0.5 + Math.sin(sp * Math.PI) * 0.3;
        dummy.position.z += Math.sin(p.angle) * sp * (eType === 'flame' ? 0.4 : 0.8);
        dummy.scale.setScalar(Math.max(0, 1 - sp * 2) * 0.06);
        dummy.updateMatrix();
        sparkRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sparkRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (particleCount === 0) return null;

  const getColor = () => {
    switch (eType) {
      case 'bubble': return '#ffffff';
      case 'precipitate': return effect.precipitateColor || '#a8a29e';
      case 'color_change': return effect.color || effect.newColor || '#ffcc00';
      case 'dissolve': return effect.color || '#88ccff';
      case 'explosion': return '#ff6600';
      case 'smoke': return '#c8c8c8';
      case 'steam': return '#f0f0f0';
      case 'flame': return '#ffaa00';
      case 'flash': return '#ffffcc';
      default: return '#ffffff';
    }
  };

  const getOpacity = () => {
    switch (eType) {
      case 'bubble': return 0.5;
      case 'precipitate': return 0.85;
      case 'color_change': return 0.6;
      case 'dissolve': return 0.5;
      case 'explosion': return 0.7;
      case 'smoke': return 0.3;
      case 'steam': return 0.15;
      case 'flame': return 0.8;
      case 'flash': return 0.6;
      default: return 0.5;
    }
  };

  const getSize = () => {
    switch (eType) {
      case 'bubble': return 0.022;
      case 'precipitate': return 0.012;
      case 'color_change': return 0.015;
      case 'dissolve': return 0.018;
      case 'explosion': return 0.025;
      case 'smoke': return 0.035;
      case 'steam': return 0.03;
      case 'flame': return 0.02;
      case 'flash': return 0.015;
      default: return 0.015;
    }
  };

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, particleCount]}>
        <sphereGeometry args={[getSize(), 8, 8]} />
        <meshStandardMaterial color={getColor()} transparent opacity={getOpacity()} depthWrite={eType !== 'flame'} />
      </instancedMesh>
      {(eType === 'explosion' || eType === 'flame') && (
        <instancedMesh ref={sparkRef} args={[undefined as any, undefined as any, particleCount]}>
          <boxGeometry args={[0.015, 0.015, 0.015]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.9} />
        </instancedMesh>
      )}
    </group>
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
  }, [snaps]);

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
