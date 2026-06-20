import { createContext, useContext } from 'react';

export interface InteractionState {
  hoveredObjectId: string | null;
  setHoveredObjectId: (id: string | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
}

export const InteractionContext = createContext<InteractionState>({
  hoveredObjectId: null, setHoveredObjectId: () => {},
  isDragging: false, setIsDragging: () => {},
  selectedEquipmentId: null, setSelectedEquipmentId: () => {},
});

export const useInteraction = () => useContext(InteractionContext);
