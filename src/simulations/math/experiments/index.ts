import { experiments as math10Experiments } from './math10';
import { experiments as math11Experiments } from './math11';
import { experiments as math12Experiments } from './math12';
import type { ComponentType } from 'react';
import type { SimulationProps } from '../types';

export const MATH_EXPERIMENT_ALIASES: Record<string, string> = {
  'SIM-08': 'MATH10-01',
  'SIM-16': 'MATH10-02',
  'SIM-17': 'MATH10-03',
  'SIM-18': 'MATH10-04',
  'SIM-19': 'MATH10-05',
  'SIM-20': 'MATH10-06',
};

export const EXPERIMENTS_CONFIG: Record<string, ComponentType<SimulationProps>> = {
  ...math10Experiments,
  ...math11Experiments,
  ...math12Experiments,
};
