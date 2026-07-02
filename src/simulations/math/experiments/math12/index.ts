import type { ComponentType } from 'react';
import type { SimulationProps } from '../../types';

import Math12_01 from './math12-01-cubic';
import Math12_02 from './math12-02-rational';
import Math12_03 from './math12-03-exponential';
import Math12_04 from './math12-04-logarithm';
import Math12_05 from './math12-05-integral-area';
import Math12_06 from './math12-06-area-between';
import Math12_07 from './math12-07-complex';
import Math12_08 from './math12-08-revolution3d';
import Math12_09 from './math12-09-polyhedra3d';
import Math12_10 from './math12-10-plane3d';
import Math12_11 from './math12-11-line3d';

export const experiments: Record<string, ComponentType<SimulationProps>> = {
  'MATH12-01': Math12_01,
  'MATH12-02': Math12_02,
  'MATH12-03': Math12_03,
  'MATH12-04': Math12_04,
  'MATH12-05': Math12_05,
  'MATH12-06': Math12_06,
  'MATH12-07': Math12_07,
  'MATH12-08': Math12_08,
  'MATH12-09': Math12_09,
  'MATH12-10': Math12_10,
  'MATH12-11': Math12_11,
};
