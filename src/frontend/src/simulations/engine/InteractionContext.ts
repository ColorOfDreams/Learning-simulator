import { createContext, useContext } from 'react';

export interface InteractionState {
  hoveredObjectId: string | null;
  setHoveredObjectId: (id: string | null) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
}

export const InteractionContext = createContext<InteractionState>({
  hoveredObjectId: null,
  setHoveredObjectId: () => {},
  isDragging: false,
  setIsDragging: () => {},
});

export const useInteraction = () => useContext(InteractionContext);
