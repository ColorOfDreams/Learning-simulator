import React, { Suspense, useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import RoomEnvironment from '../components/RoomEnvironment';
import { InteractionContext } from './InteractionContext';
import ConnectionLines from './ConnectionLines';
import InteractionEffects from './InteractionEffects';
import InteractionGuideSystem from './InteractionGuideSystem';
import EquipmentHighlighter from './EquipmentHighlighter';

import { Stand, SimplePendulum, SpringPendulum, Spring, MassBlock, WoodenBlock, Stopwatch, Ruler, Protractor, Dashpot, DrivingMotor, EnergyMeter } from '../components/vat-ly';
import { Beaker, TestTube, ErlenmeyerFlask, RoundFlask, Burette, Pipette, Thermometer, BunsenBurner, pHMeter, Condenser, Mortar, PeriodicTable, ChemicalSolid, ChemicalLiquid, ChemicalGas, ReactionSystem } from '../components/hoa-hoc';
import { CoordinatePlane, ParabolaGraph, TrigWave, GeometryTriangle, GeometryCircle, Vector2D, FunctionPlotter, StatisticsChart } from '../components/toan-hoc';

const COMPONENT_MAP: Record<string, React.FC<any>> = {
  // Physics
  WoodenBlock, SimplePendulum, SpringPendulum, Stand,
  Spring, MassBlock, Stopwatch, Ruler, Protractor,
  Dashpot, DrivingMotor, EnergyMeter,
  // Chemistry
  TestTube, ErlenmeyerFlask, RoundFlask, Burette, Pipette,
  Thermometer, BunsenBurner, pHMeter, Condenser, Mortar,
  PeriodicTable, ChemicalSolid, ChemicalLiquid, ChemicalGas, ReactionSystem,
  // Math
  CoordinatePlane, ParabolaGraph, TrigWave, GeometryTriangle,
  GeometryCircle, Vector2D, FunctionPlotter, StatisticsChart,
  // hoa-hoc Beaker replaces old
  Beaker,
};

const getInitialY = (modelName: string) => {
  const map: Record<string, number> = {
    // Physics
    WoodenBlock: 0.15, Stand: 1.9,
    SimplePendulum: 1.5, SpringPendulum: 1.5, Spring: 1.5,
    MassBlock: 0.2, Stopwatch: 0.1, Ruler: 0.05, Protractor: 0.05,
    Dashpot: 0.5, DrivingMotor: 0.2, EnergyMeter: 0.05,
    // Chemistry
    Beaker: 0.4, TestTube: 0.2, ErlenmeyerFlask: 0.3, RoundFlask: 0.4,
    Burette: 1.5, Pipette: 0.05, Thermometer: 0.05, BunsenBurner: 0.1,
    pHMeter: 0.05, Condenser: 0.3, Mortar: 0.05, PeriodicTable: 1.5,
    ChemicalSolid: 0.1, ChemicalLiquid: 0.2, ChemicalGas: 0.5,
    ReactionSystem: 0.3,
    // Math
    CoordinatePlane: 0.05, ParabolaGraph: 0.05, TrigWave: 0.05,
    GeometryTriangle: 0.05, GeometryCircle: 0.05, Vector2D: 0.05,
    FunctionPlotter: 0.05, StatisticsChart: 0.05,
  };
  return map[modelName] ?? 0;
};

const SceneObjects = React.memo(({
  objects, isPlaying, onUpdatePosition, sceneGraph,
}: {
  objects: Scene.Object[];
  isPlaying: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph: Scene.IRecord | null;
}) => (
  <>
    {objects.map((obj) => {
      const Comp = COMPONENT_MAP[obj.modelName];
      if (!Comp) return null;
      const pos = [...obj.position] as [number, number, number];
      if (pos[1] === 5) pos[1] = getInitialY(obj.modelName);
      return (
        <Comp
          key={obj.id}
          object={{ ...obj, position: pos }}
          isPlaying={isPlaying}
          onUpdatePosition={onUpdatePosition}
          sceneGraph={sceneGraph}
        />
      );
    })}
  </>
));

interface Props {
  sceneGraph: Scene.IRecord | null;
  isPlaying: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  showGuide?: boolean;
  onDismissGuide?: () => void;
  highlightedObjectId?: string | null;
  highlightLabel?: string;
  highlightColor?: string;
  selectedEquipmentId?: string | null;
  onSelectEquipment?: (id: string | null) => void;
}

const SandboxEngine: React.FC<Props> = ({ sceneGraph, isPlaying, onUpdatePosition, showGuide, onDismissGuide, highlightedObjectId, highlightLabel, highlightColor, selectedEquipmentId: externalSelectedId, onSelectEquipment }) => {
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const selectedEquipmentId = onSelectEquipment ? (externalSelectedId ?? null) : internalSelectedId;

  const handleSelectEquipment = useCallback((id: string | null) => {
    setInternalSelectedId(id);
    onSelectEquipment?.(id);
  }, [onSelectEquipment]);

  const interaction = useMemo(() => ({
    hoveredObjectId, setHoveredObjectId, isDragging, setIsDragging,
    selectedEquipmentId,
    setSelectedEquipmentId: handleSelectEquipment,
  }), [hoveredObjectId, isDragging, selectedEquipmentId, handleSelectEquipment]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f2f5' }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <InteractionContext.Provider value={interaction}>
          <color attach="background" args={['#f0f2f5']} />
          <ambientLight intensity={0.6} />
          <directionalLight castShadow position={[10, 20, 10]} intensity={1.2} />

          {sceneGraph && (
            <>
              <RoomEnvironment roomType={sceneGraph.roomType} />
              <Suspense fallback={null}>
                <SceneObjects
                  objects={sceneGraph.objects || []}
                  isPlaying={isPlaying}
                  onUpdatePosition={onUpdatePosition}
                  sceneGraph={sceneGraph}
                />
                <ConnectionLines
                  objects={sceneGraph.objects || []}
                  hoveredObjectId={hoveredObjectId}
                />
                <InteractionEffects
                  objects={sceneGraph.objects || []}
                  isPlaying={isPlaying}
                />
              </Suspense>
            </>
          )}

          <InteractionGuideSystem visible={!!showGuide} onDismiss={onDismissGuide || (() => {})} />
          {highlightedObjectId && sceneGraph && (
            <EquipmentHighlighter
              objectId={highlightedObjectId}
              color={highlightColor || '#f59e0b'}
              label={highlightLabel}
              objects={sceneGraph.objects || []}
            />
          )}
          {!hoveredObjectId && (
            <OrbitControls
              makeDefault
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2.1}
              minDistance={3}
              maxDistance={14}
              enableDamping
              dampingFactor={0.1}
            />
          )}
        </InteractionContext.Provider>
      </Canvas>
    </div>
  );
};

export default React.memo(SandboxEngine);
