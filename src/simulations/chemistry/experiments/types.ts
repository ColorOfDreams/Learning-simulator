export type ChemActionType = 'pour' | 'drop' | 'move' | 'click' | 'shake' | 'wait';

export interface ChemStep {
  text: string;
  type: ChemActionType;
  src?: string;
  dst?: string;
  id?: string;
  pour?: { level: number; color?: number; opacity?: number };
  dropOffset?: { x?: number; y?: number; z?: number; rotZ?: number; scale?: number; attach?: boolean };
  moveOffset?: { y?: number; dx?: number; rotZ?: number };
  fx?: string;
}

export interface ChemSetupItem {
  type: string;
  id?: string;
  x?: number;
  y?: number;
  z?: number;
  n?: number;
  label?: string;
  color?: number;
  op?: number;
  cap?: number;
  fs?: number;
  powder?: boolean;
  h?: number;
  r?: number;
}

export interface ChemExperimentDef {
  id: string;
  setup: ChemSetupItem[];
  steps: ChemStep[];
}
