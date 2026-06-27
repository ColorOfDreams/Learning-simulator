import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useInteraction } from './InteractionContext';
import { processPouring } from '@/dung-cu/hoa-hoc/dung-cu-hoa-hoc';

import { getEquipmentConfig, SnapPoint } from './EquipmentRegistry';

interface Props {
  object?: Scene.Object;
  doiTuong?: Scene.Object;
  label?: string;
  nhan?: string;
  colliderArgs?: [number, number, number];
  kichThuocVaCham?: [number, number, number];
  children: React.ReactNode;
  isPlaying?: boolean;
  dangChay?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  capNhatViTri?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
  doThiScene?: Scene.IRecord | null;
  snapPoints?: SnapPoint[];
  diemSnap?: SnapPoint[];
  isKinematic?: boolean;
  coDinh?: boolean;
  interactionMode?: 'observe' | 'practice';
}

let globalDraggingId: string | null = null;

const getModel = (obj: any) => obj.modelName || obj.maDungCu || obj.loai || '';
const getPos = (obj: any): [number, number, number] => [...(obj.position || obj.viTri || [0, 5, 0])] as [number, number, number];



const resolveCollisions = (
  pos: [number, number, number], half: [number, number, number],
  excludeId: string, objects: Scene.Object[],
  ignoreId?: string | null
): [number, number, number] => {
  let [x, y, z] = pos;
  const hy = half[1];
  const hx = half[0];
  const hz = half[2];

  x = Math.max(-9.5, Math.min(9.5, x));
  z = Math.max(-2.5, Math.min(4.5, z));

  let floorY = -0.6;
  if (x + hx > -6 && x - hx < 6 && z + hz > -2.6 && z - hz < -1.4) {
    floorY = 0.85;
  }

  const tableY = floorY + hy;
  y = Math.max(tableY, y);

  for (let pass = 0; pass < 3; pass++) {
    let hit = false;
    for (const obj of objects) {
      if (obj.id === excludeId || obj.id === ignoreId) continue;
      const oh = getEquipmentConfig(getModel(obj)).getCollider(obj.properties);
      const op = getPos(obj);
      if (op[1] === 5) op[1] = getEquipmentConfig(getModel(obj)).initY;

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
  z = Math.max(-2.5, Math.min(4.5, z));
  return [x, y, z];
};

const DraggablePhysicsObject: React.FC<Props> = (props) => {
  const object = (props.object ?? props.doiTuong)!;
  const label = props.label ?? props.nhan ?? '';
  const colliderArgs = props.colliderArgs ?? props.kichThuocVaCham;
  const isPlaying = props.isPlaying ?? props.dangChay ?? false;
  const onUpdatePosition = props.onUpdatePosition ?? props.capNhatViTri;
  const sceneGraph = props.sceneGraph ?? props.doThiScene ?? null;
  const snapPoints = props.snapPoints ?? props.diemSnap ?? getEquipmentConfig(getModel(object)).getSnapPoints(object.properties);
  const forceKinematic = props.isKinematic ?? props.coDinh;
  const interactionMode = props.interactionMode;
  const { children } = props;
  const groupRef = useRef<THREE.Group>(null);
  const [dragging, setDragging] = useState(false);
  const velRef = useRef({ x: 0, y: 0, z: 0 });
  const posRef = useRef<[number, number, number]>([...object.position]);
  const offsetRef = useRef({ x: 0, y: 0, z: 0 });
  const planeRef = useRef<THREE.Plane>(new THREE.Plane());
  const pointerStart = useRef({ x: 0, y: 0 });
  const rotStartRef = useRef({ x: 0, y: 0 });
  const snapTargetRef = useRef<string | null>(null);
  const pourTargetRef = useRef<string | null>(null);
  const lastPourRef = useRef<string | null>(null);

  const { camera, raycaster } = useThree();
  const { setHoveredObjectId, setIsDragging, setSelectedEquipmentId, selectedEquipmentId, snapTargetId, setSnapTargetId, rotationAxis, pouringAction, setPouringAction, updateObjectProperty, updateAllProperties, checkRuleAndAdvance, isDraggingPourable, setIsDraggingPourable } = useInteraction();

  const half = colliderArgs ?? getEquipmentConfig(object.modelName).getCollider(object.properties);
  const kinematic = forceKinematic ?? getEquipmentConfig(object.modelName).tags.includes('kinematic');
  const allObjects = sceneGraph?.objects || [];

  useEffect(() => {
    if (dragging) return;
    posRef.current = [...object.position];
    if (groupRef.current) groupRef.current.position.set(object.position[0], object.position[1], object.position[2]);
  }, [object.position, dragging]);

  const findSnapTarget = useCallback((targetX: number, targetY: number, targetZ: number): [number, number, number] | null => {
    snapTargetRef.current = null;
    if (!snapPoints?.length) return null;
    let bestDist = 1.0; // Reduced distance so user has to drag it closer
    let bestPos: [number, number, number] | null = null;

    for (const sp of snapPoints) {
      const worldX = targetX + sp.position[0];
      const worldY = targetY + sp.position[1];
      const worldZ = targetZ + sp.position[2];

      for (const other of allObjects) {
        if (other.id === object.id) continue;
        const otherModel = getModel(other);
        const otherSnaps = getEquipmentConfig(otherModel).getSnapPoints(other.properties);
        if (!otherSnaps?.length) continue;

        const op = getPos(other);
        if (op[1] === 5) op[1] = getEquipmentConfig(otherModel).initY;
        
        // Items on the shelf (Z <= -1.5) should not be interacted with
        // Removed op[1] > 1.2 because Stand and Burette have Y > 1.2 naturally
        if (op[2] <= -1.5) continue;

        for (const os of otherSnaps) {
          if (!sp.connectsTo.includes(os.type) && !os.connectsTo.includes(sp.type)) continue;
          
          const ox = op[0] + os.position[0], oy = op[1] + os.position[1], oz = op[2] + os.position[2];
          
          // 2.5D Mode: Calculate distance primarily based on X and Z, but also factor in Y for pouring
          const dist2D = Math.sqrt((worldX - ox) ** 2 + (worldZ - oz) ** 2);
          const distY = Math.abs(worldY - oy);
          
          const isPouringRelated = sp.type === 'chemical' || os.type === 'chemical' || sp.type === 'container' || os.type === 'container';
          if (dist2D < bestDist && (distY < 1.5 || !isPouringRelated)) {
            bestDist = dist2D;
            
            const isPourable = getEquipmentConfig(getModel(object)).tags.includes('pourable');
            const isContainer = getEquipmentConfig(otherModel).tags.includes('container');
            
            if (isPourable && isContainer) {
              pourTargetRef.current = other.id;
              snapTargetRef.current = null;
            } else {
              snapTargetRef.current = other.id;
              pourTargetRef.current = null;
            }

            const t = Math.max(0, Math.min(1, (3.0 - dist2D) / 2.0));
            const pullX = targetX + (ox - sp.position[0] - targetX) * t;
            const pullY = targetY + (oy - sp.position[1] - targetY) * t;
            const pullZ = targetZ + (oz - sp.position[2] - targetZ) * t;
            
            if (pourTargetRef.current) {
              // Hover above the container to pour (shifted left because of 45-deg tilt)
              bestPos = [ox - sp.position[0] - 0.2, oy - sp.position[1] + 1.0, oz - sp.position[2]];
            } else if (dist2D < 1.5) {
              bestPos = [ox - sp.position[0], oy - sp.position[1], oz - sp.position[2]];
            } else {
              bestPos = [pullX, pullY, pullZ];
            }
          }
        }
      }
    }
    return bestPos;
  }, [snapPoints, allObjects, object.id, object.modelName, updateObjectProperty, setPouringAction]);



  const startPosRef = useRef<[number, number, number]>([...object.position]);

  const onPointerDown = useCallback((e: any) => {
    if (interactionMode === 'observe') return;
    if (globalDraggingId) return;
    if (e.button !== 0) return; // Only left-click — let right/middle pass to OrbitControls
    e.stopPropagation();
    try { e.target.setPointerCapture(e.pointerId); } catch { }
    globalDraggingId = object.id;
    setDragging(true);
    setIsDragging(true);
    
    // Check if pourable
    if (setIsDraggingPourable && getEquipmentConfig(getModel(object)).tags.includes('pourable')) {
      setIsDraggingPourable(object.id);
    }

    pointerStart.current = { x: e.clientX, y: e.clientY };
    rotStartRef.current = { x: e.clientX, y: e.clientY };
    velRef.current = { x: 0, y: 0, z: 0 };
    startPosRef.current = [...posRef.current];

    const normal = new THREE.Vector3(0, 1, 0); // 2.5D Mode: Raycast against Horizontal desk plane (Y=0)
    const cp = groupRef.current ? groupRef.current.position : new THREE.Vector3(...object.position);
    // Force the interaction plane to Y = cp.y (lock Y instead of Z)
    planeRef.current.setFromNormalAndCoplanarPoint(normal, cp);

    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(planeRef.current, intersection)) {
      offsetRef.current = { x: cp.x - intersection.x, y: cp.y - intersection.y, z: cp.z - intersection.z };
    }
  }, [raycaster, object, setIsDragging, setIsDraggingPourable]);

  const onPointerMove = useCallback((e: any) => {
    if (!dragging || !rotationAxis || selectedEquipmentId !== object.id) return;
    e.stopPropagation();
    e.preventDefault();
    const dx = e.clientX - rotStartRef.current.x;
    const dy = e.clientY - rotStartRef.current.y;
    rotStartRef.current = { x: e.clientX, y: e.clientY };

    const rot = [
      groupRef.current?.rotation.x ?? 0,
      groupRef.current?.rotation.y ?? 0,
      groupRef.current?.rotation.z ?? 0,
    ];
    const speed = 0.01;
    if (rotationAxis === 'x') rot[0] += dy * speed;
    if (rotationAxis === 'y') rot[1] -= dx * speed;
    if (rotationAxis === 'z') rot[2] += dx * speed;

    if (groupRef.current) {
      groupRef.current.rotation.set(rot[0], rot[1], rot[2]);
    }
  }, [dragging, rotationAxis, selectedEquipmentId, object.id]);

  const onPointerUp = useCallback((e: any) => {
    if (globalDraggingId !== object.id) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    try { e.target.releasePointerCapture(e.pointerId); } catch { }
    globalDraggingId = null;
    setDragging(false);
    setIsDragging(false);
    if (setIsDraggingPourable) setIsDraggingPourable(null);

    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const isClick = Math.abs(dx) < 4 && Math.abs(dy) < 4;

    if (isClick) {
      setSelectedEquipmentId(selectedEquipmentId === object.id ? null : object.id);
    }

    if (rotationAxis && selectedEquipmentId === object.id && groupRef.current) {
      const rot = [
        groupRef.current.rotation.x,
        groupRef.current.rotation.y,
        groupRef.current.rotation.z,
      ] as [number, number, number];
      (object as any).rotation = rot;
      onUpdatePosition?.(object.id, rot as unknown as [number, number, number]);
    } else if (!isClick) {
      onUpdatePosition?.(object.id, posRef.current);
      if (snapTargetRef.current && updateObjectProperty) {
        updateObjectProperty(object.id, 'attachedTo', snapTargetRef.current);
        if (checkRuleAndAdvance) checkRuleAndAdvance('drag_and_drop', object.id, snapTargetRef.current);
      } else if (pourTargetRef.current && updateObjectProperty && updateAllProperties) {
        // If released while pouring, trigger pour action once
        const targetObj = allObjects.find(o => o.id === pourTargetRef.current);
        const targetProps = targetObj ? { ...(targetObj as any).thuocTinh, ...targetObj.properties } : {};
        const sourceProps = { ...(object as any).thuocTinh, ...object.properties };
        
        const mixedProps = processPouring(sourceProps, targetProps);
        updateAllProperties(pourTargetRef.current, mixedProps);
        
        updateObjectProperty(object.id, 'chemicalLevel', 0);
        updateObjectProperty(object.id, 'liquidVolume', 0);
        updateObjectProperty(object.id, 'theTich', 0);
        updateObjectProperty(object.id, 'khoiLuong', 0);
        if (checkRuleAndAdvance) checkRuleAndAdvance('pour', object.id, pourTargetRef.current);

        // Return the bottle to its original position
        posRef.current = [...startPosRef.current];
        if (groupRef.current) {
          groupRef.current.position.set(startPosRef.current[0], startPosRef.current[1], startPosRef.current[2]);
        }
        onUpdatePosition?.(object.id, startPosRef.current);
      } else if (updateObjectProperty) {
        updateObjectProperty(object.id, 'attachedTo', null);
      }
    }
  }, [object, rotationAxis, selectedEquipmentId, onUpdatePosition, setIsDragging, setSelectedEquipmentId, updateObjectProperty, checkRuleAndAdvance]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (dragging) {
      if (rotationAxis && selectedEquipmentId === object.id) {
        return; // Rotation handled by onPointerMove — don't move position
      }

      const ray = state.raycaster.ray;
      const intersection = new THREE.Vector3();
      if (ray.intersectPlane(planeRef.current, intersection)) {
        let tx = intersection.x + offsetRef.current.x;
        let tz = intersection.z + offsetRef.current.z;
        let ty = -10; // Start at floor to let resolveCollisions push it up

        // First resolve to find the actual floor/desk height
        const tempResolved = resolveCollisions([tx, ty, tz], half, object.id, allObjects, null);
        
        const snapped = findSnapTarget(tx, tempResolved[1], tz);
        if (snapped) { 
          tx = snapped[0]; 
          ty = snapped[1]; 
          tz = snapped[2]; 
        } else {
          ty = tempResolved[1];
        }

        if (snapTargetRef.current !== lastPourRef.current) {
          // just to avoid another ref
        }

        setSnapTargetId(snapTargetRef.current);

        const targetIdToIgnore = snapTargetRef.current || pourTargetRef.current;
        const resolved = resolveCollisions([tx, ty, tz], half, object.id, allObjects, targetIdToIgnore);
        posRef.current = resolved;
        groupRef.current.position.set(resolved[0], resolved[1], resolved[2]);

        if (pourTargetRef.current !== lastPourRef.current) {
          lastPourRef.current = pourTargetRef.current;
          if (pourTargetRef.current && setPouringAction) {
            // Wait for position to be resolved so sourcePos is accurate
            setPouringAction({ sourceId: object.id, targetId: pourTargetRef.current, startTime: performance.now(), sourcePos: [...resolved] as [number, number, number] });
          } else if (!pourTargetRef.current && setPouringAction) {
            setPouringAction(null);
          }
        }
      }
    } else {
      if (snapTargetRef.current || pourTargetRef.current) {
        snapTargetRef.current = null;
        if (pourTargetRef.current) {
          pourTargetRef.current = null;
          if (lastPourRef.current && setPouringAction) setPouringAction(null);
          lastPourRef.current = null;
        }
        setSnapTargetId(null);
      }
      if (isPlaying && !kinematic && !((object as any).thuocTinh?.attachedTo || object.properties?.attachedTo)) {
        let [x, y, z] = posRef.current;
        velRef.current.y -= 9.81 * delta;
        const py = y + velRef.current.y * delta;
        const resolved = resolveCollisions([x, py, z], half, object.id, allObjects);
        if (resolved[1] > py) velRef.current.y = 0;
        posRef.current = resolved;
        groupRef.current.position.set(resolved[0], resolved[1], resolved[2]);
      } else {
        const targetObjId = (object as any).thuocTinh?.attachedTo || object.properties?.attachedTo;
        if (targetObjId) {
          import('@/simulations/engine/InteractionContext').then(({ dynamicOffsets }) => {
            const offset = dynamicOffsets[targetObjId];
            if (offset && groupRef.current) {
              groupRef.current.position.set(posRef.current[0] + offset[0], posRef.current[1] + offset[1], posRef.current[2] + offset[2]);
            } else if (groupRef.current) {
              groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
            }
          });
        } else if (groupRef.current) {
          groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
        }
      }
    }

    const rot = object.rotation || (object as any).gocXoay || [0, 0, 0];
    
    // Auto tilt if pouring
    if (dragging && pourTargetRef.current) {
      groupRef.current.rotation.set(rot[0], rot[1], rot[2] - Math.PI / 4);
    } else {
      groupRef.current.rotation.set(rot[0], rot[1], rot[2]);
    }
  });

  return (
    <group ref={groupRef} position={object.position} rotation={object.rotation}>
      <group
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={() => setHoveredObjectId(object.id)}
        onPointerLeave={(e) => { 
          if (!dragging) setHoveredObjectId(null);
        }}
      >
        {children}
        {/* Hide label if this object is being dragged, or if it's the target of a snap or pour action */}
        {label && !(dragging || snapTargetId === object.id || pouringAction?.targetId === object.id) && (
          <Html position={[0, half[1] + 0.3, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
            <div style={{
              background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 10px',
              borderRadius: '6px', fontSize: '12px', userSelect: 'none', pointerEvents: 'none',
              whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {label}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
};

export function getSnapPointsForModel(modelName: string, properties?: any): SnapPoint[] | undefined {
  switch (modelName) {
    case 'Stand':
      return [
        { id: 'clamp_right', position: [1.6, 2.0, 0], type: 'clamp', label: 'Kẹp phải', connectsTo: [] },
        { id: 'clamp_left', position: [-1.6, 2.0, 0], type: 'clamp', label: 'Kẹp trái', connectsTo: [] },
      ];
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
        { id: 'top', position: [0, l / 2, 0], type: 'spring_top', label: 'Đầu trên', connectsTo: ['clamp'] },
        { id: 'bottom', position: [0, -l / 2, 0], type: 'spring_bottom', label: 'Đầu dưới', connectsTo: ['hook', 'motor_output'] },
      ];
    }
    case 'MassBlock':
      return [
        { id: 'hook_top', position: [0, 0.2, 0], type: 'hook', label: 'Móc trên', connectsTo: ['spring_bottom', 'dashpot_bottom'] },
        { id: 'hook_bottom', position: [0, -0.2, 0], type: 'hook', label: 'Móc dưới', connectsTo: ['hook'] },
      ];
    case 'Dashpot':
      return [
        { id: 'top', position: [0, 1.0, 0], type: 'dashpot_top', label: 'Đầu trên', connectsTo: ['clamp'] },
        { id: 'bottom', position: [0, -1.0, 0], type: 'dashpot_bottom', label: 'Đầu dưới', connectsTo: ['hook'] },
      ];
    case 'DrivingMotor':
      return [{ id: 'output', position: [0, 0.3, 0], type: 'motor_output', label: 'Trục ra', connectsTo: ['hook', 'spring_bottom'] }];
    case 'ChemicalSolid':
    case 'ChemicalLiquid':
    case 'ChemicalGas':
      return [{ id: 'chem', position: [0, 0, 0], type: 'chemical', label: 'Chất', connectsTo: ['container'] }];
    case 'Beaker':
    case 'TestTube':
    case 'ErlenmeyerFlask':
    case 'RoundFlask':
      return [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Bình chứa', connectsTo: ['chemical'] }];
    default:
      return undefined;
  }
}

export default DraggablePhysicsObject;
