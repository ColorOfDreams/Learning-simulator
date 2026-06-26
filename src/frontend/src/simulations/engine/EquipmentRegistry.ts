export interface SnapPoint {
  id: string;
  position: [number, number, number];
  type: string;
  label: string;
  connectsTo: string[];
}

export interface EquipmentConfig {
  getCollider: (props?: any) => [number, number, number];
  initY: number;
  getSnapPoints: (props?: any) => SnapPoint[];
  tags: string[]; // e.g., 'kinematic', 'pourable', 'container'
}

const defaultCollider: [number, number, number] = [0.5, 0.5, 0.5];

export const EquipmentRegistry: Record<string, EquipmentConfig> = {
  WoodenBlock: {
    getCollider: () => [0.75, 0.75, 0.75],
    initY: 0.15,
    getSnapPoints: () => [],
    tags: [],
  },
  Beaker: {
    getCollider: () => [0.5, 1.0, 0.5],
    initY: 0.4,
    getSnapPoints: () => [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Bình chứa', connectsTo: ['chemical'] }],
    tags: ['pourable', 'container'],
  },
  ChatLong: {
    getCollider: () => [0.4, 0.6, 0.4],
    initY: 0.25,
    getSnapPoints: () => [{ id: 'chemical', position: [0, 0, 0], type: 'chemical', label: 'Hóa chất', connectsTo: ['container'] }],
    tags: ['pourable'],
  },
  ChatRan: {
    getCollider: () => [0.4, 0.6, 0.4],
    initY: 0.25,
    getSnapPoints: () => [{ id: 'chemical', position: [0, 0, 0], type: 'chemical', label: 'Hóa chất', connectsTo: ['container'] }],
    tags: ['pourable'],
  },
  ChatKhi: {
    getCollider: () => [0.4, 0.6, 0.4],
    initY: 0.25,
    getSnapPoints: () => [{ id: 'chemical', position: [0, 0, 0], type: 'chemical', label: 'Hóa chất', connectsTo: ['container'] }],
    tags: ['pourable'],
  },
  ChatBot: {
    getCollider: () => [0.4, 0.6, 0.4],
    initY: 0.25,
    getSnapPoints: () => [{ id: 'chemical', position: [0, 0, 0], type: 'chemical', label: 'Hóa chất', connectsTo: ['container'] }],
    tags: ['pourable'],
  },
  Stand: {
    getCollider: () => [1.0, 2.5, 1.0],
    initY: 1.9,
    getSnapPoints: () => [
      { id: 'clamp_right', position: [1.6, 2.0, 0], type: 'clamp', label: 'Kẹp phải', connectsTo: ['anchor', 'spring_top', 'dashpot_top'] },
      { id: 'clamp_left', position: [-1.6, 2.0, 0], type: 'clamp', label: 'Kẹp trái', connectsTo: ['anchor', 'spring_top', 'dashpot_top'] },
    ],
    tags: ['kinematic'],
  },
  SimplePendulum: {
    getCollider: (props) => [0.5, (props?.length || 2) / 2, 0.5],
    initY: 1.5,
    getSnapPoints: (props) => [{ id: 'anchor', position: [0, (props?.length || 2) / 2, 0], type: 'anchor', label: 'Điểm neo', connectsTo: ['clamp'] }],
    tags: ['kinematic'],
  },
  SpringPendulum: {
    getCollider: (props) => [0.5, (2 + ((props?.mass || 1) * 9.8) / (props?.stiffness || 50)) / 2, 0.5],
    initY: 1.5,
    getSnapPoints: (props) => {
      const m = props?.mass || 1;
      const k = props?.stiffness || 50;
      const l = 2 + (m * 9.8) / k;
      return [{ id: 'anchor', position: [0, l / 2, 0], type: 'anchor', label: 'Điểm neo', connectsTo: ['clamp'] }];
    },
    tags: ['kinematic'],
  },
  Spring: {
    getCollider: (props) => [0.3, (props?.length || 2) / 2, 0.3],
    initY: 1.5,
    getSnapPoints: (props) => {
      const l = props?.length || 2;
      return [
        { id: 'top', position: [0, l / 2, 0], type: 'spring_top', label: 'Đầu trên', connectsTo: ['clamp', 'hook'] },
        { id: 'bottom', position: [0, -l / 2, 0], type: 'spring_bottom', label: 'Đầu dưới', connectsTo: ['hook', 'motor_output'] },
      ];
    },
    tags: ['kinematic'],
  },
  MassBlock: {
    getCollider: () => [0.4, 0.4, 0.4],
    initY: 0.2,
    getSnapPoints: () => [
      { id: 'hook_top', position: [0, 0.2, 0], type: 'hook', label: 'Móc trên', connectsTo: ['spring_bottom', 'dashpot_bottom'] },
      { id: 'hook_bottom', position: [0, -0.2, 0], type: 'hook', label: 'Móc dưới', connectsTo: ['spring_top'] },
    ],
    tags: [],
  },
  Stopwatch: {
    getCollider: () => [0.15, 0.1, 0.25],
    initY: 0.1,
    getSnapPoints: () => [],
    tags: [],
  },
  Ruler: {
    getCollider: () => [0.5, 0.05, 0.05],
    initY: 0.05,
    getSnapPoints: () => [],
    tags: [],
  },
  Protractor: {
    getCollider: () => [0.3, 0.3, 0.05],
    initY: 0.05,
    getSnapPoints: () => [],
    tags: [],
  },
  Dashpot: {
    getCollider: () => [0.3, 1.0, 0.3],
    initY: 0.5,
    getSnapPoints: () => [
      { id: 'top', position: [0, 1.0, 0], type: 'dashpot_top', label: 'Đầu trên', connectsTo: ['clamp', 'hook'] },
      { id: 'bottom', position: [0, -1.0, 0], type: 'dashpot_bottom', label: 'Đầu dưới', connectsTo: ['hook'] },
    ],
    tags: ['kinematic'],
  },
  DrivingMotor: {
    getCollider: () => [0.4, 0.3, 0.3],
    initY: 0.2,
    getSnapPoints: () => [{ id: 'output', position: [0, 0.3, 0], type: 'motor_output', label: 'Trục ra', connectsTo: ['hook', 'spring_bottom'] }],
    tags: ['kinematic'],
  },
  EnergyMeter: {
    getCollider: () => [0.3, 0.2, 0.05],
    initY: 0.05,
    getSnapPoints: () => [],
    tags: [],
  },
  ChemicalSolid: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'chem', position: [0, 0, 0], type: 'chemical', label: 'Chất', connectsTo: ['chemical', 'container'] }],
    tags: [],
  },
  ChemicalLiquid: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'chem', position: [0, 0, 0], type: 'chemical', label: 'Chất', connectsTo: ['chemical', 'container'] }],
    tags: ['pourable'],
  },
  ChemicalGas: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'chem', position: [0, 0, 0], type: 'chemical', label: 'Chất', connectsTo: ['chemical', 'container'] }],
    tags: [],
  },
  TestTube: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Bình chứa', connectsTo: ['chemical'] }],
    tags: ['pourable', 'container'],
  },
  ErlenmeyerFlask: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Bình chứa', connectsTo: ['chemical'] }],
    tags: ['pourable', 'container'],
  },
  RoundFlask: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Bình chứa', connectsTo: ['chemical'] }],
    tags: ['pourable', 'container'],
  },
  NuocCat: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'chem', position: [0, 0, 0], type: 'chemical', label: 'Chất', connectsTo: ['chemical', 'container'] }],
    tags: ['pourable'],
  },
  Burette: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Bình chứa', connectsTo: ['chemical'] }],
    tags: ['pourable', 'container'],
  },
  Pipette: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Bình chứa', connectsTo: ['chemical'] }],
    tags: ['pourable', 'container'],
  },
  Mortar: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [{ id: 'container', position: [0, -0.1, 0], type: 'container', label: 'Cối', connectsTo: ['chemical'] }],
    tags: ['container'],
  },
  BunsenBurner: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [],
    tags: [],
  },
  pHMeter: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [],
    tags: [],
  },
  Thermometer: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [],
    tags: [],
  },
  Condenser: {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [],
    tags: [],
  }
};

export const getEquipmentConfig = (modelName: string): EquipmentConfig => {
  // Alias mapping for Vietnamese names
  const aliasMap: Record<string, string> = {
    'CocThuyTinh': 'Beaker',
    'BinhTamGiac': 'ErlenmeyerFlask',
    'BinhCau': 'RoundFlask',
    'Buret': 'Burette',
    'Pipet': 'Pipette',
    'CoiChay': 'Mortar',
    'OngNghiem': 'TestTube',
    'GiaDo': 'Stand',
  };
  
  const resolvedName = aliasMap[modelName] || modelName;
  
  return EquipmentRegistry[resolvedName] || {
    getCollider: () => defaultCollider,
    initY: 0,
    getSnapPoints: () => [],
    tags: [],
  };
};
