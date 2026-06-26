import { createContext, useContext } from 'react';

export interface InteractionState {
  hoveredObjectId: string | null;
  setHoveredObjectId: (id: string | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
  snapTargetId: string | null;
  setSnapTargetId: (id: string | null) => void;
  rotationAxis: 'x' | 'y' | 'z' | null;
  setRotationAxis: (axis: 'x' | 'y' | 'z' | null) => void;
  heSoTatDan: number;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  pouringAction: { sourceId: string, targetId: string, startTime: number, sourcePos?: [number, number, number] } | null;
  setPouringAction: (action: { sourceId: string, targetId: string, startTime: number, sourcePos?: [number, number, number] } | null) => void;
  updateObjectProperty?: (id: string, key: string, value: any) => void;
  updateAllProperties?: (id: string, props: Record<string, any>) => void;
  checkRuleAndAdvance?: (actionType: string, sourceId?: string, targetId?: string) => void;
  isDraggingPourable: string | null;
  setIsDraggingPourable?: (val: string | null) => void;
}

export const InteractionContext = createContext<InteractionState>({
  hoveredObjectId: null, setHoveredObjectId: () => {},
  isDragging: false, setIsDragging: () => {},
  selectedEquipmentId: null, setSelectedEquipmentId: () => {},
  snapTargetId: null, setSnapTargetId: () => {},
  rotationAxis: null, setRotationAxis: () => {},
  heSoTatDan: 0,
  currentStepIndex: 0, setCurrentStepIndex: () => {},
  pouringAction: null, setPouringAction: () => {},
  updateObjectProperty: undefined,
  isDraggingPourable: null, setIsDraggingPourable: () => {},
});

export const useInteraction = () => useContext(InteractionContext);
