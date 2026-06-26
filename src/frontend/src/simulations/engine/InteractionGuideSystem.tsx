import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInteraction } from './InteractionContext';

interface Props { visible: boolean; onDismiss: () => void; sceneGraph?: Scene.IRecord | null; }

const InteractionGuideSystem: React.FC<Props> = ({ visible, onDismiss, sceneGraph }) => {
  const timeRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const autoDismissRef = useRef(false);
  const { currentStepIndex } = useInteraction();

  const isMatch = (o: any, targetStr: string) => {
    if (!targetStr) return false;
    const str = targetStr.toLowerCase();
    const check = (val: string) => val && (val.toLowerCase().includes(str) || str.includes(val.toLowerCase()));
    return check(o.modelName) || check(o.maDungCu) || check(o.nhan) || check(o.id);
  };
  const currentStep = sceneGraph?.steps?.[currentStepIndex];
  
  // Try exact match first, then fuzzy match
  let sourceObj = currentStep?.expectedAction?.sourceModel 
    ? sceneGraph?.objects?.find(o => o.modelName === currentStep.expectedAction?.sourceModel || o.maDungCu === currentStep.expectedAction?.sourceModel)
    : null;
  if (!sourceObj && currentStep?.expectedAction?.sourceModel) {
    sourceObj = sceneGraph?.objects?.find(o => isMatch(o, currentStep.expectedAction!.sourceModel!));
  }

  let targetObj = currentStep?.expectedAction?.targetModel
    ? sceneGraph?.objects?.find(o => o.modelName === currentStep.expectedAction?.targetModel || o.maDungCu === currentStep.expectedAction?.targetModel)
    : null;
  if (!targetObj && currentStep?.expectedAction?.targetModel) {
    targetObj = sceneGraph?.objects?.find(o => isMatch(o, currentStep.expectedAction!.targetModel!));
  }

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (groupRef.current) {
      groupRef.current.children.forEach((child: any) => {
        if (child.userData?.pulse) {
          const t = timeRef.current;
          child.material.opacity = 0.3 + Math.sin(t * 5) * 0.4;
        }
        if (child.userData?.bounce) {
          child.position.y = (child.userData.baseY || 0) + Math.sin(timeRef.current * 4) * 0.2;
        }
      });
    }
  });

  if (!visible || !currentStep) return null;

  const getPos = (obj: any): [number, number, number] => [...(obj?.position || [0, 5, 0])] as [number, number, number];
  const sourcePos: [number, number, number] = sourceObj ? getPos(sourceObj) : [0, 0, 0];
  const targetPos: [number, number, number] = targetObj ? getPos(targetObj) : [0, 0, 0];

  return (
    <group ref={groupRef}>

      {currentStep && sourceObj && (
        <>
          <mesh position={sourcePos} userData={{ pulse: true }}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} depthTest={false} depthWrite={false} />
          </mesh>
          <Html position={[sourcePos[0], sourcePos[1] + 1, sourcePos[2]]} center zIndexRange={[200, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ color: '#3b82f6', fontSize: 24, animation: 'bounce 1s infinite' }}>▼</div>
          </Html>
        </>
      )}

      {currentStep && targetObj && (
        <>
          <mesh position={targetPos} userData={{ pulse: true }}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.5} depthTest={false} depthWrite={false} />
          </mesh>
          <Html position={[targetPos[0], targetPos[1] + 1, targetPos[2]]} center zIndexRange={[200, 0]} style={{ pointerEvents: 'none' }}>
            <div style={{ color: '#22c55e', fontSize: 24, animation: 'bounce 1s infinite' }}>▼</div>
          </Html>
        </>
      )}

      {currentStep && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[200, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(15,23,42,0.9)', color: '#fff', padding: '12px 24px',
            borderRadius: 12, fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)', letterSpacing: '0.3px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <span style={{ color: '#f59e0b', marginRight: 8 }}>Bước {currentStepIndex + 1}:</span>
            {currentStep.title}
          </div>
        </Html>
      )}

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }`}</style>
    </group>
  );
};

export default InteractionGuideSystem;
