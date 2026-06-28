import React, { Suspense, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useModel } from '@umijs/max';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import RoomEnvironment from '@/dung-cu/dung-chung/PhongThiNghiem';
import { InteractionContext } from './InteractionContext';
import ConnectionLines from './ConnectionLines';
import InteractionEffects from './InteractionEffects';
import InteractionGuideSystem from './InteractionGuideSystem';
import EquipmentHighlighter from './EquipmentHighlighter';
import { SnapIndicator } from './SnapIndicator';
import { layDungCu } from '@/dung-cu/thanh-ghi';
import { getEquipmentConfig } from './EquipmentRegistry';

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

function normalizeThuocTinh(obj: Scene.Object): Record<string, any> {
  return { ...(obj as any).thuocTinh, ...obj.properties };
}

const SceneObjects = React.memo(({
  objects, isPlaying, onUpdatePosition, sceneGraph,
}: {
  objects: Scene.Object[];
  isPlaying: boolean;
  onUpdatePosition?: (id: string, pos: [number, number, number]) => void;
  sceneGraph: Scene.IRecord | null;
}) => {
  useEffect(() => {
    if (!onUpdatePosition) return;
    let shelfX = -4.5;
    objects.forEach((obj) => {
      const pos = [...(obj.position || (obj as any).viTri || [0, 5, 0])] as [number, number, number];
      if (pos[1] === 5) {
        const mn = obj.modelName || (obj as any).maDungCu;
        onUpdatePosition(obj.id, [shelfX, getEquipmentConfig(mn).initY + 1.45, -2]);
      }
      if (pos[1] === 5 || pos[1] > 2) {
        shelfX += 1.2;
      }
    });
  }, [objects, onUpdatePosition]);

  const adapted = useMemo(() => {
    return objects.map((obj) => {
      const mn = obj.modelName || (obj as any).maDungCu;
      const pos = [...(obj.position || (obj as any).viTri || [0, 5, 0])] as [number, number, number];
      return {
        ...obj,
        modelName: mn,
        position: pos,
        viTri: pos,
        thuocTinh: normalizeThuocTinh(obj),
      };
    });
  }, [objects]);

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
    let dashpotDamping: number | null = null;
    for (const o of objs) {
      const mn = (o as any).modelName || (o as any).maDungCu;
      const nhan = (o as any).nhan || (o as any).tenDungCu;
      if (mn === 'Dashpot' || mn === 'BoGiamChan' || nhan === 'Bộ giảm chấn' || nhan === 'Giảm Chấn') {
        const pos = (o as any).viTri || (o as any).position || [0, 5, 0];
        if (pos[2] > -1.5) {
          let val = o.properties?.heSoTatDan ?? (o as any).thuocTinh?.heSoTatDan;
          if (typeof val === 'string') val = parseFloat(val);
          if (typeof val !== 'number' || isNaN(val)) val = 0.5;
          dashpotDamping = val;
          break;
        }
      }
    }
    if (dashpotDamping !== null) return dashpotDamping;
    return (sceneGraph as any)?.environment?.damping ?? 0.05;
  }, [sceneGraph?.objects, (sceneGraph as any)?.environment?.damping]);

  const { currentStepIndex, setStep: setCurrentStepIndex, updateObjectProperty, updateAllProperties, checkRuleAndAdvance } = useModel('useSimulationModel');

  const handleSelectEquipment = useCallback((id: string | null) => {
    setInternalSelectedId(id);
    onSelectEquipment?.(id);
  }, [onSelectEquipment]);

  const [pouringAction, setPouringAction] = useState<{ sourceId: string, targetId: string, startTime: number, sourcePos?: [number, number, number] } | null>(null);

  const objectsRef = useRef(sceneGraph?.objects || []);
  useEffect(() => {
    objectsRef.current = sceneGraph?.objects || [];
  }, [sceneGraph?.objects]);

  useEffect(() => {
    if (pouringAction) {
      const timer = setTimeout(() => {
        const objects = objectsRef.current;
        const sourceObj = objects.find((o: any) => o.id === pouringAction.sourceId);
        const targetObj = objects.find((o: any) => o.id === pouringAction.targetId);
        
        if (sourceObj && targetObj) {
          const sProps: any = sourceObj.properties || {};
          const tProps: any = targetObj.properties || {};
          
          let sChem = sProps.symbol || sProps.kyHieu;
          if (sourceObj.modelName === 'NuocCat') sChem = 'H2O';
          
          const tColor = tProps.liquidColor || tProps.mauChatLong || '#00a8ff';
          let tContents = Array.isArray(tProps.contents) ? tProps.contents : [];
          if (targetObj.modelName === 'Beaker' && tProps.liquidVolume > 0 && tContents.length === 0) {
            // Assume pre-filled beaker has H2O
            tContents = ['H2O'];
          }
          const tTemp = tProps.temperature || 25;
          
          if (sChem) {
            const { ChemicalEngine } = require('./ChemicalEngine');
            ChemicalEngine.mix(tContents, sChem, tTemp, tColor).then((result: any) => {
              const { updatedContents, updatedColor, effect } = result;
              updateObjectProperty(targetObj.id, 'contents', updatedContents);
              updateObjectProperty(targetObj.id, 'liquidColor', updatedColor);
              
              // Increment volume
              const curVol = tProps.liquidVolume || 0;
              if (curVol < 500) { // arbitrary max volume
                updateObjectProperty(targetObj.id, 'liquidVolume', curVol + 20);
              }
              
              if (effect) {
                 updateObjectProperty(targetObj.id, 'reactionEffect', { ...effect, timestamp: Date.now() });
              }
            });
          }
        }
        
        setPouringAction(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pouringAction, updateObjectProperty]);

  const [isDraggingPourable, setIsDraggingPourable] = useState<string | null>(null);

  const interaction = useMemo(() => ({
    hoveredObjectId, setHoveredObjectId, isDragging, setIsDragging,
    selectedEquipmentId, snapTargetId, setSnapTargetId,
    rotationAxis, setRotationAxis, heSoTatDan,
    currentStepIndex, setCurrentStepIndex,
    pouringAction, setPouringAction,
    updateObjectProperty,
    updateAllProperties,
    checkRuleAndAdvance,
    setSelectedEquipmentId: handleSelectEquipment,
    isDraggingPourable, setIsDraggingPourable,
  }), [hoveredObjectId, isDragging, selectedEquipmentId, snapTargetId, rotationAxis, heSoTatDan, currentStepIndex, setCurrentStepIndex, pouringAction, updateObjectProperty, updateAllProperties, checkRuleAndAdvance, handleSelectEquipment, isDraggingPourable]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#0f172a' }}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 5, 10], fov: 50 }}>
        <InteractionContext.Provider value={interaction}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 20, 10]} intensity={0.5} />
          <Environment preset="warehouse" backgroundBlurriness={0.5} />

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
                <SnapIndicator />
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

          <InteractionGuideSystem
            visible={(sceneGraph?.steps?.length ?? 0) > 0}
            onDismiss={onDismissGuide || (() => { })}
            sceneGraph={sceneGraph}
          />
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
          <OrbitControls
            makeDefault
            enabled={!hoveredObjectId && !isDragging}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={3}
            maxDistance={14}
            enableDamping
            dampingFactor={0.1}
          />
        </InteractionContext.Provider>
      </Canvas>
    </div>
  );
};

export default React.memo(SandboxEngine);
