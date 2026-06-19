import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useInteraction } from './InteractionContext';

export interface SnapPoint {
  id: string;
  position: [number, number, number];
  type: string;
  label: string;
  connectsTo: string[];
}

interface Props {
  object: Scene.Object;
  label: string;
  colliderArgs?: [number, number, number];
  children: React.ReactNode;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
  snapPoints?: SnapPoint[];
  isKinematic?: boolean;
}

let globalDraggingId: string | null = null;

const getCollider = (modelName: string, props?: any): [number, number, number] => {
  const map: Record<string, [number, number, number]> = {
    WoodenBlock: [0.75, 0.75, 0.75],
    Beaker: [0.5, 1.0, 0.5],
    Stand: [1.0, 2.5, 1.0],
    SimplePendulum: [0.5, (props?.length || 2) / 2, 0.5],
    SpringPendulum: [0.5, (2 + ((props?.mass || 1) * 9.8) / (props?.stiffness || 50)) / 2, 0.5],
    Spring: [0.3, (props?.length || 2) / 2, 0.3],
    MassBlock: [0.4, 0.4, 0.4],
    Stopwatch: [0.15, 0.1, 0.25],
    Ruler: [0.5, 0.05, 0.05],
    Protractor: [0.3, 0.3, 0.05],
    Dashpot: [0.3, 1.0, 0.3],
    DrivingMotor: [0.4, 0.3, 0.3],
    EnergyMeter: [0.3, 0.2, 0.05],
  };
  return map[modelName] ?? [0.5, 0.5, 0.5];
};

const getInitY = (modelName: string) => {
  const map: Record<string, number> = {
    WoodenBlock: 0.15, Beaker: 0.4, Stand: 1.9,
    SimplePendulum: 1.5, SpringPendulum: 1.5, Spring: 1.5,
    MassBlock: 0.2, Stopwatch: 0.1, Ruler: 0.05, Protractor: 0.05,
    Dashpot: 0.5, DrivingMotor: 0.2, EnergyMeter: 0.05,
  };
  return map[modelName] ?? 0;
};

const resolveCollisions = (
  pos: [number, number, number], half: [number, number, number],
  excludeId: string, objects: Scene.Object[],
): [number, number, number] => {
  let [x, y, z] = pos;
  const hy = half[1];
  const tableY = -0.6 + hy;
  y = Math.max(tableY, y);
  x = Math.max(-9.5, Math.min(9.5, x));
  z = Math.max(-4.5, Math.min(4.5, z));

  for (let pass = 0; pass < 3; pass++) {
    let hit = false;
    for (const obj of objects) {
      if (obj.id === excludeId) continue;
      const oh = getCollider(obj.modelName, obj.properties);
      const op = [...obj.position] as [number, number, number];
      if (op[1] === 5) op[1] = getInitY(obj.modelName);

      const dx = x - op[0], dy = y - op[1], dz = z - op[2];
      const px = (half[0] + oh[0]) - Math.abs(dx);
      const py = (half[1] + oh[1]) - Math.abs(dy);
      const pz = (half[2] + oh[2]) - Math.abs(dz);

      if (px > 0 && py > 0 && pz > 0) {
        hit = true;
        if (px < py && px < pz) x += px * (dx >= 0 ? 1 : -1);
        else if (pz < px && pz < py) z += pz * (dz >= 0 ? 1 : -1);
        else y += py * (dy >= 0 ? 1 : -1);
      }
    }
    if (!hit) break;
  }
  y = Math.max(tableY, y);
  x = Math.max(-9.5, Math.min(9.5, x));
  z = Math.max(-4.5, Math.min(4.5, z));
  return [x, y, z];
};

const DraggablePhysicsObject: React.FC<Props> = ({
  object, label, colliderArgs, children, isPlaying = false,
  onUpdatePosition, sceneGraph, snapPoints, isKinematic: forceKinematic,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [dragging, setDragging] = useState(false);
  const velRef = useRef({ x: 0, y: 0, z: 0 });
  const posRef = useRef<[number, number, number]>([...object.position]);
  const offsetRef = useRef({ x: 0, y: 0, z: 0 });
  const planeRef = useRef<THREE.Plane>(new THREE.Plane());

  const { camera, raycaster } = useThree();
  const { setHoveredObjectId, setIsDragging } = useInteraction();

  const half = colliderArgs ?? getCollider(object.modelName, object.properties);
  const kinematic = forceKinematic ?? ['Stand', 'SimplePendulum', 'SpringPendulum', 'Spring', 'Dashpot', 'DrivingMotor'].includes(object.modelName);
  const allObjects = sceneGraph?.objects || [];

  useEffect(() => {
    if (dragging) return;
    posRef.current = [...object.position];
    if (groupRef.current) groupRef.current.position.set(object.position[0], object.position[1], object.position[2]);
  }, [object.position, dragging]);

  const findSnapTarget = useCallback((targetX: number, targetY: number, targetZ: number): [number, number, number] | null => {
    if (!snapPoints?.length) return null;
    for (const sp of snapPoints) {
      const worldX = targetX + sp.position[0];
      const worldY = targetY + sp.position[1];
      const worldZ = targetZ + sp.position[2];

      for (const other of allObjects) {
        if (other.id === object.id) continue;
        const otherSnaps = getSnapPointsForModel(other.modelName, other.properties);
        if (!otherSnaps?.length) continue;

        const op = [...other.position] as [number, number, number];
        if (op[1] === 5) op[1] = getInitY(other.modelName);

        for (const os of otherSnaps) {
          if (!sp.connectsTo.includes(os.type) && !os.connectsTo.includes(sp.type)) continue;
          const ox = op[0] + os.position[0], oy = op[1] + os.position[1], oz = op[2] + os.position[2];
          const dist = Math.sqrt((worldX - ox) ** 2 + (worldY - oy) ** 2 + (worldZ - oz) ** 2);
          if (dist < 0.8) {
            return [ox - sp.position[0], oy - sp.position[1], oz - sp.position[2]];
          }
        }
      }
    }
    return null;
  }, [snapPoints, allObjects, object.id]);

  const onPointerDown = useCallback((e: any) => {
    if (globalDraggingId) return;
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    globalDraggingId = object.id;
    setDragging(true);
    setIsDragging(true);
    velRef.current = { x: 0, y: 0, z: 0 };

    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    normal.negate();
    const cp = groupRef.current ? groupRef.current.position : new THREE.Vector3(...object.position);
    planeRef.current.setFromNormalAndCoplanarPoint(normal, cp);

    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(planeRef.current, intersection)) {
      offsetRef.current = { x: cp.x - intersection.x, y: cp.y - intersection.y, z: cp.z - intersection.z };
    }
  }, [camera, raycaster, object, setIsDragging]);

  const onPointerUp = useCallback((e: any) => {
    if (globalDraggingId !== object.id) return;
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);
    globalDraggingId = null;
    setDragging(false);
    setIsDragging(false);
    onUpdatePosition?.(object.id, posRef.current);
  }, [object, onUpdatePosition, setIsDragging]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (dragging) {
      const ray = state.raycaster.ray;
      const intersection = new THREE.Vector3();
      if (ray.intersectPlane(planeRef.current, intersection)) {
        let tx = intersection.x + offsetRef.current.x;
        let ty = intersection.y + offsetRef.current.y;
        let tz = intersection.z + offsetRef.current.z;

        const snapped = findSnapTarget(tx, ty, tz);
        if (snapped) { tx = snapped[0]; ty = snapped[1]; tz = snapped[2]; }

        const resolved = resolveCollisions([tx, ty, tz], half, object.id, allObjects);
        posRef.current = resolved;
        groupRef.current.position.set(resolved[0], resolved[1], resolved[2]);
      }
    } else if (isPlaying && !kinematic) {
      let [x, y, z] = posRef.current;
      velRef.current.y -= 9.81 * delta;
      const py = y + velRef.current.y * delta;
      const resolved = resolveCollisions([x, py, z], half, object.id, allObjects);
      if (resolved[1] > py) velRef.current.y = 0;
      posRef.current = resolved;
      groupRef.current.position.set(resolved[0], resolved[1], resolved[2]);
    }

    groupRef.current.rotation.set(object.rotation[0], object.rotation[1], object.rotation[2]);
  });

  return (
    <group ref={groupRef} position={object.position} rotation={object.rotation}>
      <group
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerEnter={() => setHoveredObjectId(object.id)}
        onPointerLeave={() => { if (!dragging) setHoveredObjectId(null); }}
      >
        {children}
        {dragging && (
          <mesh>
            <boxGeometry args={[half[0] * 2 + 0.1, half[1] * 2 + 0.1, half[2] * 2 + 0.1]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
          </mesh>
        )}
        <Html position={[0, half[1] + 0.3, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div style={{
            background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 10px',
            borderRadius: '6px', fontSize: '12px', userSelect: 'none', pointerEvents: 'none',
            whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {label}
          </div>
        </Html>
      </group>
    </group>
  );
};

export function getSnapPointsForModel(modelName: string, properties?: any): SnapPoint[] | undefined {
  switch (modelName) {
    case 'Stand':
      return [{ id: 'clamp', position: [1.6, 2.0, 0], type: 'clamp', label: 'Kẹp', connectsTo: ['anchor', 'spring_top', 'dashpot_top'] }];
    case 'SimplePendulum': {
      const l = properties?.length || 2;
      return [{ id: 'anchor', position: [0, l / 2, 0], type: 'anchor', label: 'Điểm neo', connectsTo: ['clamp'] }];
    }
    case 'SpringPendulum': {
      const m = properties?.mass || 1;
      const k = properties?.stiffness || 50;
      const l = 2 + (m * 9.8) / k;
      return [{ id: 'anchor', position: [0, l / 2, 0], type: 'anchor', label: 'Điểm neo', connectsTo: ['clamp'] }];
    }
    case 'Spring': {
      const l = properties?.length || 2;
      return [
        { id: 'top', position: [0, l / 2, 0], type: 'spring_top', label: 'Đầu trên', connectsTo: ['clamp', 'hook'] },
        { id: 'bottom', position: [0, -l / 2, 0], type: 'spring_bottom', label: 'Đầu dưới', connectsTo: ['hook', 'motor_output'] },
      ];
    }
    case 'MassBlock':
      return [
        { id: 'hook_top', position: [0, 0.2, 0], type: 'hook', label: 'Móc trên', connectsTo: ['spring_bottom', 'dashpot_bottom'] },
        { id: 'hook_bottom', position: [0, -0.2, 0], type: 'hook', label: 'Móc dưới', connectsTo: ['spring_top'] },
      ];
    case 'Dashpot':
      return [
        { id: 'top', position: [0, 1.0, 0], type: 'dashpot_top', label: 'Đầu trên', connectsTo: ['clamp', 'hook'] },
        { id: 'bottom', position: [0, -1.0, 0], type: 'dashpot_bottom', label: 'Đầu dưới', connectsTo: ['hook'] },
      ];
    case 'DrivingMotor':
      return [{ id: 'output', position: [0, 0.3, 0], type: 'motor_output', label: 'Trục ra', connectsTo: ['hook', 'spring_bottom'] }];
    default:
      return undefined;
  }
}

export default DraggablePhysicsObject;
