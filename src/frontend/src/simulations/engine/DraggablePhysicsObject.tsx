import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface DraggablePhysicsObjectProps {
  object: Scene.Object;
  label: string;
  colliderArgs?: [number, number, number];
  children: React.ReactNode;
  isPlaying?: boolean;
  interactionMode?: 'observe' | 'practice';
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

let globalDraggingId: string | null = null;

const getObjectColliderArgs = (modelName: string, properties?: any): [number, number, number] => {
  switch (modelName) {
    case 'WoodenBlock':
      return [0.75, 0.75, 0.75];
    case 'Beaker':
      return [0.5, 1.0, 0.5];
    case 'Stand':
      return [1.0, 2.5, 1.0];
    case 'SimplePendulum': {
      const length = properties?.length || 2;
      return [0.5, length / 2, 0.5];
    }
    case 'SpringPendulum': {
      const mass = properties?.mass || 1;
      const stiffness = properties?.stiffness || 50;
      const length = 2 + (mass * 9.8) / stiffness;
      return [0.5, length / 2, 0.5];
    }
    default:
      return [0.5, 0.5, 0.5];
  }
};

const getInitialY = (modelName: string) => {
  switch (modelName) {
    case 'WoodenBlock': return 0.15;
    case 'Beaker': return 0.4;
    case 'Stand': return 1.9;
    case 'SimplePendulum': return 1.5;
    case 'SpringPendulum': return 1.5;
    default: return 0;
  }
};

const checkAndResolveCollisions = (
  proposedPos: [number, number, number],
  halfSize: [number, number, number],
  excludeId: string,
  objects: Scene.Object[]
): [number, number, number] => {
  let [x, y, z] = proposedPos;
  
  // Table top surface is at -0.6
  const hy = halfSize[1];
  const tableY = -0.6 + hy;
  y = Math.max(tableY, y);
  
  // Room walls clamping
  x = Math.max(-9.5, Math.min(9.5, x));
  z = Math.max(-4.5, Math.min(4.5, z));

  // Run up to 3 resolution passes
  for (let pass = 0; pass < 3; pass++) {
    let collided = false;
    for (const obj of objects) {
      if (obj.id === excludeId) continue;
      
      const otherHalfSize = getObjectColliderArgs(obj.modelName, obj.properties);
      const otherPos = [...obj.position] as [number, number, number];
      if (otherPos[1] === 5) {
        otherPos[1] = getInitialY(obj.modelName);
      }
      
      const dx = x - otherPos[0];
      const dy = y - otherPos[1];
      const dz = z - otherPos[2];

      const px = (halfSize[0] + otherHalfSize[0]) - Math.abs(dx);
      const py = (halfSize[1] + otherHalfSize[1]) - Math.abs(dy);
      const pz = (halfSize[2] + otherHalfSize[2]) - Math.abs(dz);

      if (px > 0 && py > 0 && pz > 0) {
        collided = true;
        // Resolve along axis of minimum penetration
        if (px < py && px < pz) {
          x += px * (dx >= 0 ? 1 : -1);
        } else if (pz < px && pz < py) {
          z += pz * (dz >= 0 ? 1 : -1);
        } else {
          y += py * (dy >= 0 ? 1 : -1);
        }
      }
    }
    if (!collided) break;
  }
  
  y = Math.max(tableY, y);
  x = Math.max(-9.5, Math.min(9.5, x));
  z = Math.max(-4.5, Math.min(4.5, z));
  
  return [x, y, z];
};

const DraggablePhysicsObject: React.FC<DraggablePhysicsObjectProps> = ({ 
  object, 
  label, 
  colliderArgs = [0.5, 0.5, 0.5], 
  children,
  isPlaying = false,
  interactionMode = 'observe',
  onUpdatePosition,
  sceneGraph
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const velocityRef = useRef({ x: 0, y: 0, z: 0 });
  const positionRef = useRef<[number, number, number]>([...object.position]);
  const dragOffsetRef = useRef({ x: 0, y: 0, z: 0 });
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane());

  const { camera, raycaster } = useThree();

  const isKinematic = object.modelName === 'Stand' || object.modelName === 'SimplePendulum' || object.modelName === 'SpringPendulum';
  const minY = -0.6 + colliderArgs[1]; // Table surface is at -0.6

  // Sync with initial object position changes (only when not dragging)
  useEffect(() => {
    if (isDragging) return;
    positionRef.current = [...object.position];
    if (groupRef.current) {
      groupRef.current.position.set(object.position[0], object.position[1], object.position[2]);
    }
  }, [object.position, isDragging]);

  const handlePointerDown = (e: any) => {
    if (interactionMode !== 'practice') return; // Dragging is disabled in observe mode
    if (globalDraggingId !== null) return;
    
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    globalDraggingId = object.id;
    setIsDragging(true);
    velocityRef.current = { x: 0, y: 0, z: 0 };

    // Get camera look direction
    const planeNormal = new THREE.Vector3();
    camera.getWorldDirection(planeNormal);
    planeNormal.negate(); // Face the camera
    
    const currentPos = groupRef.current ? groupRef.current.position : new THREE.Vector3(...object.position);
    
    // Set drag plane passing through current position
    dragPlaneRef.current.setFromNormalAndCoplanarPoint(planeNormal, currentPos);

    // Project click ray onto the plane
    const ray = raycaster.ray;
    const intersection = new THREE.Vector3();
    if (ray.intersectPlane(dragPlaneRef.current, intersection)) {
      dragOffsetRef.current = {
        x: currentPos.x - intersection.x,
        y: currentPos.y - intersection.y,
        z: currentPos.z - intersection.z
      };
    } else {
      dragOffsetRef.current = { x: 0, y: 0, z: 0 };
    }
  };

  const handlePointerUp = (e: any) => {
    if (globalDraggingId !== object.id) return;
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);
    globalDraggingId = null;
    setIsDragging(false);

    // Save final position to parent state
    if (onUpdatePosition) {
      onUpdatePosition(object.id, positionRef.current);
    }
  };

  useFrame((state, delta) => {
    if (groupRef.current) {
      const otherObjects = sceneGraph?.objects || [];

      // If dragging, update position using the frame's raycaster
      if (isDragging) {
        const ray = state.raycaster.ray;
        const intersection = new THREE.Vector3();
        if (ray.intersectPlane(dragPlaneRef.current, intersection)) {
          let targetX = intersection.x + dragOffsetRef.current.x;
          let targetY = intersection.y + dragOffsetRef.current.y;
          let targetZ = intersection.z + dragOffsetRef.current.z;

          // 1. Snapping Logic for Pendulums to Stand clamps
          const isPendulum = object.modelName === 'SimplePendulum' || object.modelName === 'SpringPendulum';
          if (isPendulum) {
            const halfY = colliderArgs[1];
            const pivotX = targetX;
            const pivotY = targetY + halfY;
            const pivotZ = targetZ;

            // Find closest Stand
            let closestStand: Scene.Object | null = null;
            let minDistance = Infinity;
            let standClampPos = new THREE.Vector3();

            for (const obj of otherObjects) {
              if (obj.modelName === 'Stand') {
                const standPos = [...obj.position] as [number, number, number];
                if (standPos[1] === 5) {
                  standPos[1] = getInitialY(obj.modelName);
                }
                // Stand clamp is at [1.6, 2.0, 0] relative to stand center
                const clampX = standPos[0] + 1.6;
                const clampY = standPos[1] + 2.0;
                const clampZ = standPos[2];

                const dist = Math.sqrt(
                  (pivotX - clampX) ** 2 +
                  (pivotY - clampY) ** 2 +
                  (pivotZ - clampZ) ** 2
                );

                if (dist < minDistance) {
                  minDistance = dist;
                  closestStand = obj;
                  standClampPos.set(clampX, clampY, clampZ);
                }
              }
            }

            // Snap if within 0.8 units
            if (closestStand && minDistance < 0.8) {
              targetX = standClampPos.x;
              targetY = standClampPos.y - halfY;
              targetZ = standClampPos.z;
            }
          }

          // 2. Collision resolution (against other objects + table/walls boundaries)
          const resolved = checkAndResolveCollisions([targetX, targetY, targetZ], colliderArgs, object.id, otherObjects);

          positionRef.current = resolved;
          groupRef.current.position.set(resolved[0], resolved[1], resolved[2]);
        }
      } else if (isPlaying && !isKinematic) {
        // Apply gravity if isPlaying, not dragging, and not kinematic
        let [x, y, z] = positionRef.current;
        
        velocityRef.current.y -= 9.81 * delta;
        const proposedY = y + velocityRef.current.y * delta;
        
        // Resolve collisions with gravity fall proposed position
        const resolved = checkAndResolveCollisions([x, proposedY, z], colliderArgs, object.id, otherObjects);
        
        // If resolved Y is greater than proposedY, we hit something beneath us (landed)
        if (resolved[1] > proposedY) {
          velocityRef.current.y = 0;
        }
        
        positionRef.current = resolved;
        groupRef.current.position.set(resolved[0], resolved[1], resolved[2]);
      }
      
      // Keep rotation synced
      groupRef.current.rotation.set(object.rotation[0], object.rotation[1], object.rotation[2]);
    }
  });

  return (
    <group
      ref={groupRef}
      position={object.position}
      rotation={object.rotation}
    >
      <group 
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {children}
        
        {/* Draw outline indicator when dragging */}
        {isDragging && (
          <mesh>
            <boxGeometry args={[colliderArgs[0] * 2 + 0.1, colliderArgs[1] * 2 + 0.1, colliderArgs[2] * 2 + 0.1]} />
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
          </mesh>
        )}
        
        <Html position={[0, colliderArgs[1] + 0.3, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.75)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.2)' }}>
            {label}
          </div>
        </Html>
      </group>
    </group>
  );
};

export default DraggablePhysicsObject;
