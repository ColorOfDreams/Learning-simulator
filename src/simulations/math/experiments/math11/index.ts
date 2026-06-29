import type { ComponentType } from 'react';
import type { SimulationProps } from '../../types';

import Math11_01 from './math11-01-trig';
import Math11_02 from './math11-02-unit-circle';
import Math11_03 from './math11-03-combinatorics';
import Math11_04 from './math11-04-probability';
import Math11_05 from './math11-05-seq-limits';
import Math11_06 from './math11-06-func-limits';
import Math11_07 from './math11-07-derivatives';
import Math11_08 from './math11-08-transformations';
import Math11_09 from './math11-09-planes3d';
import Math11_10 from './math11-10-perpendicular3d';
import Math11_11 from './math11-11-polyhedra';

export const experiments: Record<string, ComponentType<SimulationProps>> = {
  'MATH11-01': Math11_01,
  'MATH11-02': Math11_02,
  'MATH11-03': Math11_03,
  'MATH11-04': Math11_04,
  'MATH11-05': Math11_05,
  'MATH11-06': Math11_06,
  'MATH11-07': Math11_07,
  'MATH11-08': Math11_08,
  'MATH11-09': Math11_09,
  'MATH11-10': Math11_10,
  'MATH11-11': Math11_11,
};
