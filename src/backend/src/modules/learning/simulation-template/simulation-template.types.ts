export type SimulationParameter = {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
};

export type SimulationOutput =
  | string
  | 'motion_animation'
  | 'x_t_graph'
  | 'v_t_graph'
  | 'a_t_graph'
  | 'energy_bar'
  | 'kinetic_energy'
  | 'potential_energy'
  | 'total_energy';
