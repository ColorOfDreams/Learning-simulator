declare module Scene {
  export type RoomType = 'physics' | 'chemistry' | 'math';

  export interface Object {
    id: string;
    modelName: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    properties: Record<string, any>;
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
  }
}
