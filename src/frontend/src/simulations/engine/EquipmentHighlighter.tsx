import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface Props {
  objectId: string | null;
  color: string;
  label?: string;
  objects: Scene.Object[];
}

const getInitY = (m: string) => {
  const map: Record<string, number> = { WoodenBlock:0.15, Beaker:0.4, Stand:1.9, SimplePendulum:1.5, SpringPendulum:1.5, Spring:1.5, MassBlock:0.2, Dashpot:0.5, DrivingMotor:0.2, Stopwatch:0.1, EnergyMeter:0.05, TestTube:0.2, ErlenmeyerFlask:0.3, RoundFlask:0.4, BunsenBurner:0.1, ChemicalSolid:0.1, ChemicalLiquid:0.2, ChemicalGas:0.5, ChatLong:0.2, ChatRan:0.25, ChatKhi:0.25, NuocCat:0.2, AxitClohidric:0.2, NatriHidroxit:0.2, AxitSunfuric:0.2, DongSunfat:0.2, Phenolphtalein:0.2, QuyTim:0.2 };
  return map[m] ?? 0;
};

const EquipmentHighlighter: React.FC<Props> = ({ objectId, color, label, objects }) => {
  const glowRef = useRef<any>(null);
  const target = useMemo(() => objects.find((o) => o.id === objectId), [objects, objectId]);

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 2.5) * 0.06;
      glowRef.current.scale.setScalar(s);
    }
  });

  if (!target) return null;

  const targetModel = (target as any).modelName || (target as any).maDungCu || '';
  const targetPos = (target.position || (target as any).viTri || [0, 0, 0]) as [number, number, number];
  const pos = [...targetPos] as [number, number, number];
  if (pos[1] === 5) pos[1] = getInitY(targetModel);

  const half = [0.4, 0.4, 0.4] as [number, number, number];
  return (
    <group position={[pos[0], pos[1], pos[2]]}>
      <mesh ref={glowRef}>
        <boxGeometry args={[half[0] * 2 + 0.3, half[1] * 2 + 0.3, half[2] * 2 + 0.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthTest={false} depthWrite={false} />
      </mesh>
      {label && (
        <Html position={[0, half[1] + 0.8, 0]} center zIndexRange={[200, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            background: '#1e293b', color: '#fff', padding: '4px 12px', borderRadius: 8,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', animation: 'labelFloat 2s ease-in-out infinite',
          }}>
            {label}
          </div>
          <style>{`@keyframes labelFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }`}</style>
        </Html>
      )}
    </group>
  );
};

export default EquipmentHighlighter;
