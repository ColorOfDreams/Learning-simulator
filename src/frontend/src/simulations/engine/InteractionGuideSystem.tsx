import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props { visible: boolean; onDismiss: () => void; }

const InteractionGuideSystem: React.FC<Props> = ({ visible, onDismiss }) => {
  const timeRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const autoDismissRef = useRef(false);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (visible && timeRef.current > 5 && !autoDismissRef.current) {
      autoDismissRef.current = true;
      onDismiss();
    }
    if (groupRef.current && visible) {
      groupRef.current.children.forEach((child: any) => {
        if (child.userData?.pulse) {
          const t = timeRef.current;
          child.material.opacity = 0.3 + Math.sin(t * 3) * 0.3;
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Semi-transparent overlay */}
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[30, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} depthTest={false} depthWrite={false} />
      </mesh>

      {/* Arrow pointing to first equipment area */}
      <mesh position={[0, 0.5, 0]} userData={{ pulse: true }}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} depthTest={false} depthWrite={false} />
      </mesh>

      {/* Floating instruction text */}
      <Html position={[0, 2.5, 0]} center zIndexRange={[200, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(15,23,42,0.9)', color: '#fff', padding: '12px 24px',
          borderRadius: 12, fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', letterSpacing: '0.3px',
          animation: 'guidePulse 1.5s ease-in-out infinite',
        }}>
          👆 Bắt đầu bằng cách kéo dụng cụ vào bàn thí nghiệm
        </div>
        <style>{`
          @keyframes guidePulse {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </Html>

      {/* Arrow 1: nút Play */}
      <Html position={[0, -3, 0]} center zIndexRange={[200, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#22c55e', fontSize: 24, animation: 'bounce 1s infinite' }}>▼</div>
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }`}</style>
      </Html>

      {/* Arrow 2: ChatSidebar */}
      <Html position={[-6, 1, 0]} center zIndexRange={[200, 0]} style={{ pointerEvents: 'none' }}>
        <div style={{ color: '#3b82f6', fontSize: 24, animation: 'bounce 1s infinite', animationDelay: '0.3s' }}>◀</div>
      </Html>
    </group>
  );
};

export default InteractionGuideSystem;
