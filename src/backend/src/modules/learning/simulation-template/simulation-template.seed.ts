import { SimulationTemplateEntity } from './simulation-template.entity';

export const simulationTemplateSeed: Partial<SimulationTemplateEntity>[] = [
  {
    simulationId: 'SIM_SHM_BASIC',
    subject: 'physics',
    topic: 'simple_harmonic_motion',
    title: 'Mô phỏng dao động điều hòa',
    description:
      'Mô phỏng chuyển động dao động điều hòa với biên độ, tần số góc và pha ban đầu.',
    requiredParameters: ['A', 'omega', 'phi'],
    defaultParameters: [
      {
        key: 'A',
        label: 'Biên độ',
        value: 5,
        unit: 'cm',
      },
      {
        key: 'omega',
        label: 'Tần số góc',
        value: 6.28,
        unit: 'rad/s',
      },
      {
        key: 'phi',
        label: 'Pha ban đầu',
        value: 0,
        unit: 'rad',
      },
    ],
    outputs: ['motion_animation', 'x_t_graph', 'v_t_graph', 'a_t_graph'],
    isActive: true,
  },

  {
    simulationId: 'SIM_SHM_ENERGY',
    subject: 'physics',
    topic: 'shm_energy',
    title: 'Mô phỏng năng lượng trong dao động điều hòa',
    description:
      'Mô phỏng sự chuyển hóa giữa động năng, thế năng và cơ năng trong dao động điều hòa.',
    requiredParameters: ['A', 'k'],
    defaultParameters: [
      {
        key: 'A',
        label: 'Biên độ',
        value: 5,
        unit: 'cm',
      },
      {
        key: 'k',
        label: 'Độ cứng lò xo',
        value: 10,
        unit: 'N/m',
      },
    ],
    outputs: [
      'energy_bar',
      'kinetic_energy',
      'potential_energy',
      'total_energy',
    ],
    isActive: true,
  },
];
