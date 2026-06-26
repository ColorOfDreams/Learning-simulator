declare module Scene {
  export type RoomType = 'physics' | 'chemistry' | 'math';

  export interface Object {
    id: string;
    modelName: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    properties: Record<string, any>;
    
    // Vietnamese properties
    maDungCu?: string;
    viTri?: [number, number, number];
    gocXoay?: [number, number, number];
    tiLe?: [number, number, number];
    thuocTinh?: Record<string, any>;
    nhan?: string;
  }

  export interface Step {
    id: string;
    title: string;
    description: string;
    expectedAction?: {
      type: 'drag_and_drop' | 'click' | 'wait';
      sourceModel?: string;
      targetModel?: string;
      targetId?: string; // Optional if we want to snap to a specific instance
    };
  }

  export interface IRecord {
    id?: string;
    name?: string;
    simulation_id?: string;
    roomType: RoomType;
    environment: {
      gravity?: number;
      temperature?: number;
    };
    objects: Object[];
    steps?: Step[];
    
    // Vietnamese properties
    doiTuong?: Object[];
    moiTruong?: {
      trongLuc?: number;
      nhietDo?: number;
    };
  }
}
