declare module Ai {
  export type GivenValue = {
    key: string;
    value: number | string;
    unit?: string;
    label: string;
  };

  export interface IRecord {
    intent: string;
    subject: string;
    topic: string;
    confidence: number;
    analysis: {
      concepts: string[];
      skills: string[];
      given: GivenValue[];
      target: string[];
      pattern_id?: string;
    };
    answer: {
      short_answer: string;
      steps: string[];
    };
    simulation?: {
      simulation_id: string;
      title: string;
      parameters: GivenValue[];
    };
    render_blocks: { type: string }[];
    references: { id: string; title: string; source?: string }[];
    used_llm?: boolean;
  }

  export type AnalyzeRequest = {
    message: string;
    subject?: string;
    grade?: number;
  };
}

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
    environment: { gravity?: number; temperature?: number };
    objects: Object[];
  }
}
