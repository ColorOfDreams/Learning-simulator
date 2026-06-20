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
}

export const InteractionContext = createContext<InteractionState>({
  hoveredObjectId: null, setHoveredObjectId: () => {},
  isDragging: false, setIsDragging: () => {},
  selectedEquipmentId: null, setSelectedEquipmentId: () => {},
  snapTargetId: null, setSnapTargetId: () => {},
  rotationAxis: null, setRotationAxis: () => {},
  heSoTatDan: 0,
});

export const useInteraction = () => useContext(InteractionContext);
