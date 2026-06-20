import React, { Suspense, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const PreviewModel: React.FC<{ modelName: string }> = ({ modelName }) => {
  switch (modelName) {
    case 'Stand':
      return (
        <group position={[0, 1.4, 0]}>
          <mesh position={[0, -2.5, 0]}><boxGeometry args={[1.6, 0.15, 1.6]} /><meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 4.5]} /><meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} /></mesh>
          <mesh position={[0.7, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 1.4]} /><meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.1} /></mesh>
          <mesh position={[1.4, 1.8, 0]}><boxGeometry args={[0.25, 0.25, 0.25]} /><meshStandardMaterial color="#ef4444" roughness={0.5} /></mesh>
        </group>
      );
    case 'SimplePendulum':
      return (
        <group position={[0, 1.5, 0]}>
          <mesh position={[0, 1, 0]}><boxGeometry args={[0.3, 0.08, 0.3]} /><meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} /></mesh>
          <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.012, 0.012, 2, 8]} /><meshStandardMaterial color="#9ca3af" roughness={0.1} /></mesh>
          <mesh position={[0, -1, 0]}><sphereGeometry args={[0.25, 32, 32]} /><meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.8} /></mesh>
        </group>
      );
    case 'SpringPendulum':
      return (
        <group position={[0, 1.5, 0]}>
          <mesh position={[0, 1.2, 0]}><boxGeometry args={[0.5, 0.08, 0.5]} /><meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} /></mesh>
          <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 2.3, 16]} /><meshStandardMaterial color="#94a3b8" wireframe /></mesh>
          <mesh position={[0, -1.15, 0]}><boxGeometry args={[0.35, 0.35, 0.35]} /><meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} /></mesh>
        </group>
      );
    case 'Spring': return (<group position={[0, 1.2, 0]}><mesh position={[0, 1.1, 0]}><boxGeometry args={[0.4, 0.06, 0.4]} /><meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} /></mesh><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 2.2, 16]} /><meshStandardMaterial color="#64748b" wireframe /></mesh><mesh position={[0, -1.1, 0]}><torusGeometry args={[0.12, 0.03, 8, 12]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} /></mesh></group>);
    case 'MassBlock': return (<group position={[0, 0, 0]}><mesh position={[0, 0.35, 0]}><torusGeometry args={[0.1, 0.03, 8, 12]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} /></mesh><mesh><boxGeometry args={[0.7, 0.7, 0.7]} /><meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.6} /></mesh><mesh position={[0, -0.35, 0]}><torusGeometry args={[0.1, 0.03, 8, 12]} /><meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} /></mesh></group>);
    case 'WoodenBlock': return (<mesh><boxGeometry args={[1.2, 1.2, 1.2]} /><meshStandardMaterial color="#feca57" roughness={0.6} metalness={0.1} /></mesh>);
    case 'Stopwatch': return (<group><mesh><boxGeometry args={[0.25, 0.16, 0.4]} /><meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} /></mesh><mesh position={[0, 0.1, 0]}><boxGeometry args={[0.18, 0.03, 0.28]} /><meshStandardMaterial color="#0f172a" roughness={0.1} /></mesh></group>);
    case 'Ruler': return (<mesh><boxGeometry args={[0.8, 0.08, 0.08]} /><meshStandardMaterial color="#fef3c7" roughness={0.4} /></mesh>);
    case 'Protractor': return (<group rotation={[0, 0, -Math.PI / 2]}><mesh><ringGeometry args={[0.2, 0.24, 64, 1, Math.PI]} /><meshStandardMaterial color="#fef3c7" roughness={0.3} side={2} /></mesh><mesh><cylinderGeometry args={[0.015, 0.015, 0.05]} /><meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} /></mesh></group>);
    case 'Dashpot': return (<group position={[0, 0.8, 0]}><mesh position={[0, 0.8, 0]}><boxGeometry args={[0.4, 0.06, 0.4]} /><meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} /></mesh><mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.2, 0.2, 1.0]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} transparent opacity={0.6} /></mesh><mesh position={[0, -0.5, 0]}><cylinderGeometry args={[0.1, 0.1, 0.5]} /><meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} /></mesh></group>);
    case 'DrivingMotor': return (<group><mesh><boxGeometry args={[0.6, 0.5, 0.5]} /><meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} /></mesh><mesh position={[0.35, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.06, 32]} /><meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.9} /></mesh></group>);
    case 'EnergyMeter': return (<group><mesh><boxGeometry args={[0.5, 0.35, 0.08]} /><meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} /></mesh><mesh position={[-0.12, -0.17, 0.05]}><boxGeometry args={[0.12, 0.35, 0.015]} /><meshStandardMaterial color="#ef4444" roughness={0.2} /></mesh><mesh position={[0.12, -0.17, 0.05]}><boxGeometry args={[0.12, 0.35, 0.015]} /><meshStandardMaterial color="#3b82f6" roughness={0.2} /></mesh></group>);
    case 'Beaker':
      return (<group position={[0, 0.3, 0]}><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.39, 0.39, 1.2, 32]} /><meshStandardMaterial color="#c9f1ff" roughness={0.05} metalness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, 0.6, 0]}><torusGeometry args={[0.39, 0.02, 16, 32]} /><meshStandardMaterial color="#bae6fd" roughness={0.1} /></mesh><mesh position={[0, -0.4, 0]}><cylinderGeometry args={[0.36, 0.36, 0.6, 32]} /><meshStandardMaterial color="#00a8ff" transparent opacity={0.7} roughness={0.1} /></mesh></group>);
    case 'TestTube':
      return (<group><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 1.5, 32]} /><meshStandardMaterial color="#e0f7ff" roughness={0.05} metalness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, -0.75, 0]}><sphereGeometry args={[0.08, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#e0f7ff" roughness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, 0.78, 0]}><torusGeometry args={[0.08, 0.008, 8, 32]} /><meshStandardMaterial color="#e0f4ff" roughness={0.1} /></mesh></group>);
    case 'ErlenmeyerFlask':
      return (<group position={[0, 0.1, 0]}><mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.15, 0.55, 1.6, 32]} /><meshStandardMaterial color="#e0f4ff" roughness={0.05} metalness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.13, 0.13, 0.6, 32]} /><meshStandardMaterial color="#e0f4ff" roughness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, 1.5, 0]}><torusGeometry args={[0.13, 0.015, 16, 32]} /><meshStandardMaterial color="#e0f0ff" roughness={0.1} /></mesh></group>);
    case 'RoundFlask':
      return (<group position={[0, 0.1, 0]}><mesh position={[0, -0.1, 0]}><sphereGeometry args={[0.45, 32, 32]} /><meshStandardMaterial color="#e0f4ff" roughness={0.05} metalness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.1, 0.1, 1.2, 32]} /><meshStandardMaterial color="#e0f4ff" roughness={0.05} transparent opacity={0.55} /></mesh></group>);
    case 'Burette':
      return (<group><mesh><cylinderGeometry args={[0.05, 0.05, 4, 32]} /><meshStandardMaterial color="#e8f6ff" roughness={0.05} metalness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, -2.1, 0]}><cylinderGeometry args={[0.05, 0.05, 0.2, 32]} /><meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.5} /></mesh><mesh position={[0, -2.25, 0]}><cylinderGeometry args={[0.01, 0.03, 0.15, 16]} /><meshStandardMaterial color="#e8f6ff" /></mesh></group>);
    case 'Pipette':
      return (<group><mesh><cylinderGeometry args={[0.02, 0.02, 1.5, 32]} /><meshStandardMaterial color="#e8f6ff" roughness={0.05} transparent opacity={0.55} /></mesh><mesh position={[0, 0.8, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#e8f6ff" roughness={0.05} transparent opacity={0.55} /></mesh></group>);
    case 'Thermometer':
      return (<group position={[0, 0.2, 0]}><mesh><cylinderGeometry args={[0.03, 0.03, 3.0, 32]} /><meshStandardMaterial color="#f0f8ff" transparent opacity={0.6} roughness={0.1} /></mesh><mesh position={[0, -1.5, 0]}><sphereGeometry args={[0.04, 16, 16]} /><meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={0.3} /></mesh><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.008, 0.008, 1.8, 16]} /><meshStandardMaterial color="#ff2020" emissive="#ff0000" emissiveIntensity={0.3} /></mesh></group>);
    case 'BunsenBurner':
      return (<group position={[0, 0.6, 0]}><mesh position={[0, -1.0, 0]}><cylinderGeometry args={[0.25, 0.25, 0.2, 32]} /><meshStandardMaterial color="#555" roughness={0.5} metalness={0.3} /></mesh><mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.06, 0.06, 1.5, 32]} /><meshStandardMaterial color="#b8860b" roughness={0.3} metalness={0.7} /></mesh><mesh position={[0, 0.8, 0]}><coneGeometry args={[0.02, 0.25, 16]} /><meshStandardMaterial color="#0066ff" emissive="#0022cc" emissiveIntensity={0.6} transparent opacity={0.7} /></mesh><mesh position={[0, 1.0, 0]}><coneGeometry args={[0.04, 0.2, 16]} /><meshStandardMaterial color="#ff8800" emissive="#ff4400" emissiveIntensity={0.4} transparent opacity={0.7} /></mesh></group>);
    case 'pHMeter': return (<group><mesh><boxGeometry args={[0.5, 0.3, 0.15]} /><meshStandardMaterial color="#e0e0e0" roughness={0.2} /></mesh><mesh position={[0, 0, 0.08]}><boxGeometry args={[0.3, 0.2, 0.01]} /><meshStandardMaterial color="#1a3a1a" /></mesh><mesh position={[0, -0.24, 0.05]}><cylinderGeometry args={[0.025, 0.025, 0.5, 16]} /><meshStandardMaterial color="#f0f0f0" /></mesh></group>);
    case 'Condenser': return (<group><mesh><cylinderGeometry args={[0.15, 0.15, 3.5, 32]} /><meshStandardMaterial color="#e0f4ff" roughness={0.05} transparent opacity={0.4} /></mesh><mesh position={[0, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 4.0, 32]} /><meshStandardMaterial color="#e0f4ff" roughness={0.05} transparent opacity={0.4} /></mesh></group>);
    case 'Mortar': return (<group position={[0, -0.1, 0]}><mesh><sphereGeometry args={[0.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#f5f0e8" roughness={0.5} /></mesh><mesh position={[0.15, 0.2, 0.1]} rotation={[0.3, 0, 0.1]}><cylinderGeometry args={[0.04, 0.05, 0.7, 16]} /><meshStandardMaterial color="#faf5f0" roughness={0.3} /></mesh></group>);
    case 'PeriodicTable': return (<mesh><boxGeometry args={[3.5, 2.0, 0.05]} /><meshStandardMaterial color="#f8f8f8" roughness={0.2} /></mesh>);
    case 'ChemicalSolid': return (<group>{[[0, 0, 0], [0.08, 0.03, 0.05], [0.03, 0.05, -0.06], [-0.07, 0.01, 0.04], [-0.04, 0.04, -0.03], [0.06, 0.02, -0.04], [-0.05, 0.02, 0.06], [0.01, 0.06, 0.02]].map((p, i) => (<mesh key={i} position={[p[0], p[1] + 0.05, p[2]]} rotation={[0.3, 0.4, 0.2]}><boxGeometry args={[0.05, 0.04, 0.05]} /><meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.5} /></mesh>))}</group>);
    case 'ChemicalLiquid': return (<group><mesh><cylinderGeometry args={[0.25, 0.25, 1.2, 32]} /><meshStandardMaterial color="#e0f0ff" roughness={0.05} transparent opacity={0.5} /></mesh><mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.22, 0.22, 0.6, 32]} /><meshStandardMaterial color="#00a8ff" transparent opacity={0.75} roughness={0.1} /></mesh></group>);
    case 'ChemicalGas': return (<group><mesh><sphereGeometry args={[0.28, 32, 32]} /><meshStandardMaterial color="#a0ffa0" transparent opacity={0.2} roughness={0.5} depthWrite={false} /></mesh></group>);
    case 'CoordinatePlane': return (<group><gridHelper args={[10, 20, '#cbd5e1', '#e2e8f0']} position={[0, 0, 0]} /><mesh><boxGeometry args={[10, 0.02, 10]} /><meshStandardMaterial color="#f8fafc" roughness={0.5} /></mesh></group>);
    case 'ParabolaGraph': return (<group><gridHelper args={[8, 16, '#cbd5e1', '#e2e8f0']} position={[0, 0, 0]} /><mesh><boxGeometry args={[8, 0.02, 8]} /><meshStandardMaterial color="#f8fafc" /></mesh></group>);
    case 'TrigWave': return (<group><gridHelper args={[8, 16, '#cbd5e1', '#e2e8f0']} position={[0, 0, 0]} /><mesh><boxGeometry args={[8, 0.02, 8]} /><meshStandardMaterial color="#f8fafc" /></mesh></group>);
    case 'GeometryTriangle': return (<group><mesh position={[-1.5, 0, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh><mesh position={[1.5, 0, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><mesh position={[0, 2, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#22c55e" /></mesh></group>);
    case 'GeometryCircle': return (<group><mesh position={[0, 0, 0]}><sphereGeometry args={[0.06, 16, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><mesh position={[0, 0, 0]}><torusGeometry args={[1.2, 0.02, 16, 64]} /><meshStandardMaterial color="#3b82f6" roughness={0.2} /></mesh></group>);
    case 'Vector2D': return (<group><mesh position={[0, 0, 0]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#3b82f6" /></mesh><mesh position={[1.5, 0.8, 0]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#ef4444" /></mesh></group>);
    case 'FunctionPlotter': return (<group><gridHelper args={[8, 16, '#cbd5e1', '#e2e8f0']} position={[0, 0, 0]} /><mesh><boxGeometry args={[8, 0.02, 8]} /><meshStandardMaterial color="#f8fafc" /></mesh></group>);
    case 'StatisticsChart': return (<group>{[0.3, 1.2, 0.6, 1.5, 0.8].map((h, i) => (<mesh key={i} position={[-1.5 + i * 0.7, h / 2, 0]}><boxGeometry args={[0.4, h, 0.3]} /><meshStandardMaterial color={['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'][i]} roughness={0.2} /></mesh>))}</group>);
    default: return (<mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.5} /></mesh>);
  }
};

interface Props { modelName: string; size?: number; rotation?: [number, number, number]; onRotate?: (rot: [number, number, number]) => void; }

const MiniPreview: React.FC<Props> = ({ modelName, size = 200, rotation = [0, 0, 0], onRotate }) => {
  const dragRef = useRef({ active: false, prevX: 0, prevY: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!onRotate) return;
    dragRef.current = { active: true, prevX: e.clientX, prevY: e.clientY };
  }, [onRotate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active || !onRotate) return;
    const dx = e.clientX - dragRef.current.prevX;
    const dy = e.clientY - dragRef.current.prevY;
    dragRef.current.prevX = e.clientX;
    dragRef.current.prevY = e.clientY;
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
    onRotate([
      (rotation[0] + dy * 0.008) % (Math.PI * 2),
      (rotation[1] + dx * 0.008) % (Math.PI * 2),
      rotation[2],
    ]);
  }, [onRotate, rotation]);

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  return (
    <div style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden', background: '#f1f5f9', cursor: onRotate ? 'grab' : 'default' }}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      <Canvas camera={{ position: [2.5, 2, 4], fov: 30 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[8, 10, 6]} intensity={1.2} />
        <directionalLight position={[-4, 2, -2]} intensity={0.5} />
        <Suspense fallback={null}>
          <group rotation={rotation as [number, number, number]}>
            <PreviewModel modelName={modelName} />
          </group>
        </Suspense>
        {!onRotate && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2.5} />}
      </Canvas>
    </div>
  );
};

export default MiniPreview;
