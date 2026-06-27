import type { ChemExperimentDef } from './types';
import { experiments as chem10Experiments } from './chem10';
import { experiments as chem11Experiments } from './chem11';
import { experiments as chem12Experiments } from './chem12';

export type { ChemExperimentDef, ChemSetupItem, ChemStep } from './types';

export const CHEM_EXPERIMENT_ALIASES: Record<string, string> = {
  'SIM-01': 'CHEM12-01',
  'SIM-03': 'CHEM12-02',
  'SIM-04': 'CHEM11-01',
  'SIM-05': 'CHEM11-02',
  'SIM-06': 'CHEM11-03',
  'SIM-07': 'CHEM11-04',
  'SIM-09': 'CHEM11-05',
  'SIM-10': 'CHEM11-06',
  'SIM-11': 'CHEM11-07',
  'SIM-12': 'CHEM11-08',
  'SIM-13': 'CHEM11-09',
  'SIM-14': 'CHEM11-10',
  'SIM-15': 'CHEM11-11',
};

export const EXPERIMENTS_CONFIG: Record<string, ChemExperimentDef> = {
  ...chem12Experiments,
  ...chem11Experiments,
  ...chem10Experiments,
};
