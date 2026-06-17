import { LearningItemEntity } from './learning-item.entity';

export const learningItemSeed: Partial<LearningItemEntity>[] = [
  {
    id: 'osc_001',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    patternId: 'SHM_FIND_PERIOD_FROM_EQUATION',
    simulationId: 'SIM_SHM_BASIC',
    title: 'Tìm chu kì từ phương trình dao động',
    text: 'Một vật dao động điều hòa theo phương trình x = 5cos(4πt + π/3) cm. Tìm chu kì dao động.',
    parameters: [
      {
        key: 'A',
        label: 'Biên độ',
        value: 5,
        unit: 'cm',
      },
      {
        key: 'omega',
        label: 'Tần số góc',
        value: '4π',
        unit: 'rad/s',
      },
      {
        key: 'phi',
        label: 'Pha ban đầu',
        value: 'π/3',
        unit: 'rad',
      },
    ],
    target: [
      {
        key: 'T',
        label: 'Chu kì',
      },
    ],
    answer: {
      short: 'Chu kì dao động là T = 0,5 s.',
      steps: [
        {
          step: 1,
          content:
            'Từ phương trình x = 5cos(4πt + π/3), ta xác định được ω = 4π rad/s.',
        },
        {
          step: 2,
          content: 'Áp dụng công thức T = 2π / ω.',
        },
        {
          step: 3,
          content: 'Suy ra T = 2π / 4π = 0,5 s.',
        },
      ],
      finalValues: [
        {
          key: 'T',
          label: 'Chu kì',
          value: 0.5,
          unit: 's',
        },
      ],
    },
    difficulty: 'understanding',
    concepts: ['dao động điều hòa', 'chu kì', 'tần số góc'],
    skills: ['xác định chu kì từ phương trình dao động'],
    isActive: true,
  },

  {
    id: 'osc_002',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    patternId: 'SHM_IDENTIFY_PARAMETERS',
    simulationId: 'SIM_SHM_BASIC',
    title: 'Xác định tham số từ phương trình dao động',
    text: 'Một vật dao động điều hòa theo phương trình x = 10cos(2πt) cm. Xác định biên độ, tần số góc và chu kì.',
    parameters: [
      {
        key: 'A',
        label: 'Biên độ',
        value: 10,
        unit: 'cm',
      },
      {
        key: 'omega',
        label: 'Tần số góc',
        value: '2π',
        unit: 'rad/s',
      },
      {
        key: 'phi',
        label: 'Pha ban đầu',
        value: 0,
        unit: 'rad',
      },
    ],
    target: [
      {
        key: 'A',
        label: 'Biên độ',
      },
      {
        key: 'omega',
        label: 'Tần số góc',
      },
      {
        key: 'T',
        label: 'Chu kì',
      },
    ],
    answer: {
      short: 'Biên độ A = 10 cm, tần số góc ω = 2π rad/s và chu kì T = 1 s.',
      steps: [
        {
          step: 1,
          content: 'So sánh với dạng x = Acos(ωt + φ), ta có A = 10 cm.',
        },
        {
          step: 2,
          content: 'Tần số góc là ω = 2π rad/s.',
        },
        {
          step: 3,
          content: 'Chu kì T = 2π / ω = 2π / 2π = 1 s.',
        },
      ],
      finalValues: [
        {
          key: 'A',
          label: 'Biên độ',
          value: 10,
          unit: 'cm',
        },
        {
          key: 'omega',
          label: 'Tần số góc',
          value: '2π',
          unit: 'rad/s',
        },
        {
          key: 'T',
          label: 'Chu kì',
          value: 1,
          unit: 's',
        },
      ],
    },
    difficulty: 'recognition',
    concepts: ['dao động điều hòa', 'biên độ', 'tần số góc', 'chu kì'],
    skills: ['xác định tham số từ phương trình dao động'],
    isActive: true,
  },

  {
    id: 'osc_003',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    patternId: 'SHM_MAX_VELOCITY',
    simulationId: 'SIM_SHM_BASIC',
    title: 'Tính vận tốc cực đại',
    text: 'Một vật dao động điều hòa với biên độ A = 4 cm và tần số góc ω = 5 rad/s. Tính vận tốc cực đại.',
    parameters: [
      {
        key: 'A',
        label: 'Biên độ',
        value: 4,
        unit: 'cm',
      },
      {
        key: 'omega',
        label: 'Tần số góc',
        value: 5,
        unit: 'rad/s',
      },
    ],
    target: [
      {
        key: 'vmax',
        label: 'Vận tốc cực đại',
      },
    ],
    answer: {
      short: 'Vận tốc cực đại là vmax = 20 cm/s.',
      steps: [
        {
          step: 1,
          content:
            'Trong dao động điều hòa, vận tốc cực đại được tính bởi công thức vmax = ωA.',
        },
        {
          step: 2,
          content: 'Thay A = 4 cm và ω = 5 rad/s.',
        },
        {
          step: 3,
          content: 'Suy ra vmax = 5 × 4 = 20 cm/s.',
        },
      ],
      finalValues: [
        {
          key: 'vmax',
          label: 'Vận tốc cực đại',
          value: 20,
          unit: 'cm/s',
        },
      ],
    },
    difficulty: 'understanding',
    concepts: ['dao động điều hòa', 'vận tốc cực đại'],
    skills: ['tính vận tốc cực đại'],
    isActive: true,
  },

  {
    id: 'osc_004',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    patternId: 'SHM_POSITION_AT_TIME',
    simulationId: 'SIM_SHM_BASIC',
    title: 'Tính li độ tại một thời điểm',
    text: 'Một vật dao động điều hòa theo phương trình x = 6cos(πt) cm. Tính li độ của vật tại t = 1 s.',
    parameters: [
      {
        key: 'A',
        label: 'Biên độ',
        value: 6,
        unit: 'cm',
      },
      {
        key: 'omega',
        label: 'Tần số góc',
        value: 'π',
        unit: 'rad/s',
      },
      {
        key: 'phi',
        label: 'Pha ban đầu',
        value: 0,
        unit: 'rad',
      },
      {
        key: 't',
        label: 'Thời gian',
        value: 1,
        unit: 's',
      },
    ],
    target: [
      {
        key: 'x',
        label: 'Li độ',
      },
    ],
    answer: {
      short: 'Tại t = 1 s, li độ của vật là x = -6 cm.',
      steps: [
        {
          step: 1,
          content: 'Phương trình dao động là x = 6cos(πt) cm.',
        },
        {
          step: 2,
          content: 'Thay t = 1 s vào phương trình.',
        },
        {
          step: 3,
          content: 'Ta có x = 6cos(π) = 6 × (-1) = -6 cm.',
        },
      ],
      finalValues: [
        {
          key: 'x',
          label: 'Li độ',
          value: -6,
          unit: 'cm',
        },
      ],
    },
    difficulty: 'application',
    concepts: ['dao động điều hòa', 'li độ', 'pha dao động'],
    skills: ['tính li độ tại thời điểm cụ thể'],
    isActive: true,
  },

  {
    id: 'osc_005',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'shm_energy',
    patternId: 'SHM_ENERGY_BASIC',
    simulationId: 'SIM_SHM_ENERGY',
    title: 'Tính cơ năng dao động điều hòa',
    text: 'Một con lắc lò xo có độ cứng k = 20 N/m, dao động điều hòa với biên độ A = 0,1 m. Tính cơ năng của con lắc.',
    parameters: [
      {
        key: 'k',
        label: 'Độ cứng lò xo',
        value: 20,
        unit: 'N/m',
      },
      {
        key: 'A',
        label: 'Biên độ',
        value: 0.1,
        unit: 'm',
      },
    ],
    target: [
      {
        key: 'W',
        label: 'Cơ năng',
      },
    ],
    answer: {
      short: 'Cơ năng của con lắc là W = 0,1 J.',
      steps: [
        {
          step: 1,
          content:
            'Cơ năng của con lắc lò xo dao động điều hòa được tính bởi W = 1/2 kA².',
        },
        {
          step: 2,
          content: 'Thay k = 20 N/m và A = 0,1 m.',
        },
        {
          step: 3,
          content: 'W = 1/2 × 20 × (0,1)² = 0,1 J.',
        },
      ],
      finalValues: [
        {
          key: 'W',
          label: 'Cơ năng',
          value: 0.1,
          unit: 'J',
        },
      ],
    },
    difficulty: 'application',
    concepts: ['năng lượng dao động', 'cơ năng', 'con lắc lò xo'],
    skills: ['tính cơ năng dao động điều hòa'],
    isActive: true,
  },
];
