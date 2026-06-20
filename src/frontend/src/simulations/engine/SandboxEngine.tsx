import React, { Suspense, useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RoomEnvironment from '@/dung-cu/dung-chung/PhongThiNghiem';
import { InteractionContext } from './InteractionContext';
import ConnectionLines from './ConnectionLines';
import InteractionEffects from './InteractionEffects';
import InteractionGuideSystem from './InteractionGuideSystem';
import EquipmentHighlighter from './EquipmentHighlighter';
import { layDungCu } from '@/dung-cu/thanh-ghi';

const COMPONENT_MAP: Record<string, React.FC<any>> = {};

const getComponent = (modelName: string): React.FC<any> | undefined => {
  if (COMPONENT_MAP[modelName]) return COMPONENT_MAP[modelName];
  const def = layDungCu(modelName);
  if (def) {
    COMPONENT_MAP[modelName] = def.component as unknown as React.FC<any>;
    return COMPONENT_MAP[modelName];
  }
  return undefined;
};

const getInitialY = (modelName: string): number => {
  const def = layDungCu(modelName);
  if (def) return def.viTriY;
  return 0;
};

function normalizeThuocTinh(obj: Scene.Object): Record<string, any> {
  const tt: Record<string, any> = { ...(obj as any).thuocTinh, ...obj.properties };
  if ((obj as any).thuocTinh) return (obj as any).thuocTinh;
  return obj.properties || {};
}

const SceneObjects = React.memo(({
  objects, isPlaying, onUpdatePosition, sceneGraph,
}: {
  objects: Scene.Object[];
  isPlaying: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph: Scene.IRecord | null;
}) => {
  const adapted = useMemo(() => objects.map((obj) => {
    const mn = obj.modelName || (obj as any).maDungCu;
    const pos = [...(obj.position || (obj as any).viTri || [0, 5, 0])] as [number, number, number];
    if (pos[1] === 5) pos[1] = getInitialY(mn);
    return {
      ...obj,
      modelName: mn,
      position: pos,
      viTri: pos,
      thuocTinh: normalizeThuocTinh(obj),
    };
  }), [objects]);

  return (
    <>
      {adapted.map((obj) => {
        const Comp = getComponent(obj.modelName);
        if (!Comp) return null;
        return (
          <Suspense key={obj.id} fallback={null}>
            <Comp
              key={obj.id}
              object={obj}
              doiTuong={obj}
              isPlaying={isPlaying}
              dangChay={isPlaying}
              onUpdatePosition={onUpdatePosition}
              capNhatViTri={onUpdatePosition}
              sceneGraph={sceneGraph}
              doThiScene={sceneGraph}
            />
          </Suspense>
        );
      })}
    </>
  );
});

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
  rotationAxis?: 'x' | 'y' | 'z' | null;
  onSetRotationAxis?: (axis: 'x' | 'y' | 'z' | null) => void;
}

const SandboxEngine: React.FC<Props> = ({ sceneGraph, isPlaying, onUpdatePosition, showGuide, onDismissGuide, highlightedObjectId, highlightLabel, highlightColor, selectedEquipmentId: externalSelectedId, onSelectEquipment, rotationAxis: externalRotationAxis, onSetRotationAxis }) => {
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [snapTargetId, setSnapTargetId] = useState<string | null>(null);
  const [internalRotationAxis, setInternalRotationAxis] = useState<'x' | 'y' | 'z' | null>(null);

  const selectedEquipmentId = onSelectEquipment ? (externalSelectedId ?? null) : internalSelectedId;
  const rotationAxis = onSetRotationAxis ? (externalRotationAxis ?? null) : internalRotationAxis;
  const setRotationAxis = onSetRotationAxis || setInternalRotationAxis;

  const heSoTatDan = useMemo(() => {
    const objs = sceneGraph?.objects || [];
    let found = 0;
    for (const o of objs) {
      const mn = (o as any).modelName || (o as any).maDungCu;
      const nhan = (o as any).nhan || (o as any).tenDungCu;
      if (mn === 'Dashpot' || mn === 'BoGiamChan' || nhan === 'Bộ giảm chấn' || nhan === 'Giảm Chấn') {
        let val = o.properties?.heSoTatDan ?? (o as any).thuocTinh?.heSoTatDan;
        if (typeof val === 'string') val = parseFloat(val);
        if (typeof val !== 'number' || isNaN(val)) val = 0.5;
        found = val;
        break;
      }
    }
    return found;
  }, [sceneGraph?.objects]);

  const handleSelectEquipment = useCallback((id: string | null) => {
    setInternalSelectedId(id);
    onSelectEquipment?.(id);
  }, [onSelectEquipment]);

  const interaction = useMemo(() => ({
    hoveredObjectId, setHoveredObjectId, isDragging, setIsDragging,
    selectedEquipmentId, snapTargetId, setSnapTargetId,
    rotationAxis, setRotationAxis, heSoTatDan,
    setSelectedEquipmentId: handleSelectEquipment,
  }), [hoveredObjectId, isDragging, selectedEquipmentId, snapTargetId, rotationAxis, heSoTatDan, handleSelectEquipment]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f2f5' }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <InteractionContext.Provider value={interaction}>
          <color attach="background" args={['#f0f2f5']} />
          <ambientLight intensity={0.5} />
          <directionalLight castShadow position={[10, 20, 10]} intensity={1.0}
            shadow-mapSize={2048} shadow-camera-near={0.5} shadow-camera-far={50}
            shadow-camera-left={-15} shadow-camera-right={15}
            shadow-camera-top={15} shadow-camera-bottom={-15} />
          <spotLight position={[0, 8, 0]} intensity={0.4} angle={Math.PI / 4} penumbra={0.5} castShadow />
          <Environment preset="warehouse" />

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
          {snapTargetId && sceneGraph && (
            <EquipmentHighlighter
              objectId={snapTargetId}
              color="#22c55e"
              label="Thả để gắn"
              objects={sceneGraph.objects || []}
            />
          )}
          {!hoveredObjectId && !isDragging && (
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
