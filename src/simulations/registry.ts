import type { ComponentType } from 'react'
import type { SimulationProps } from './types'
import ProjectileSimulation from './physics/SIM-02-projectile'
import KinematicsSimulation from './physics/SIM-21-kinematics'
import FreefallSimulation from './physics/SIM-22-freefall'
import HorizontalSimulation from './physics/SIM-23-horizontal'
import Newton2Simulation from './physics/SIM-24-newton2'
import InclineSimulation from './physics/SIM-25-incline'
import SpringSimulation from './physics/SIM-26-spring'
import PendulumSimulation from './physics/SIM-27-pendulum'
import CircularSimulation from './physics/SIM-28-circular'
import CollisionSimulation from './physics/SIM-29-collision'
import EnergySimulation from './physics/SIM-30-energy'
import GenericChemSimulation from './chemistry/GenericChemSimulation'
import BoyleSimulation from './physics/SIM-31-boyle'
import CharlesSimulation from './physics/SIM-32-charles'
import KineticSimulation from './physics/SIM-33-kinetic'
import StateChangeSimulation from './physics/SIM-34-statechange'
import MagForceSimulation from './physics/SIM-35-magforce'
import LorentzSimulation from './physics/SIM-36-lorentz'
import InductionSimulation from './physics/SIM-37-induction'
import ACGenSimulation from './physics/SIM-38-acgen'
import RadioactiveSimulation from './physics/SIM-39-radioactive'
import NuclearSimulation from './physics/SIM-40-nuclear'
import BindingEnergySimulation from './physics/SIM-41-bindingenergy'
import ShmSimulation from './physics/SIM-42-shm'
import DampedSimulation from './physics/SIM-43-damped'
import ResonanceSimulation from './physics/SIM-44-resonance'
import WaveSimulation from './physics/SIM-45-wave'
import StandingSimulation from './physics/SIM-46-standing'
import InterferenceSimulation from './physics/SIM-47-interference'
import CoulombSimulation from './physics/SIM-48-coulomb'
import EFieldSimulation from './physics/SIM-49-efield'
import OhmSimulation from './physics/SIM-50-ohm'
import ResistorsSimulation from './physics/SIM-51-resistors'
import FullCircuitSimulation from './physics/SIM-52-fullcircuit'


import GenericMathSimulation from './math/GenericMathSimulation'
const registry = new Map<string, ComponentType<SimulationProps>>()

export function registerSimulation(id: string, component: ComponentType<SimulationProps>) {
  registry.set(id, component)
}

export function getSimulation(id: string): ComponentType<SimulationProps> | undefined {
  return registry.get(id)
}

// Register simulations
registerSimulation('SIM-01', GenericChemSimulation)
registerSimulation('SIM-02', ProjectileSimulation)
registerSimulation('SIM-03', GenericChemSimulation)

// Chemistry 10 experiments
registerSimulation('CHEM10-01', GenericChemSimulation)
registerSimulation('CHEM10-02', GenericChemSimulation)
registerSimulation('CHEM10-03', GenericChemSimulation)
registerSimulation('CHEM10-04', GenericChemSimulation)
registerSimulation('CHEM10-05', GenericChemSimulation)
registerSimulation('CHEM10-06', GenericChemSimulation)
registerSimulation('CHEM10-07', GenericChemSimulation)
registerSimulation('CHEM10-08', GenericChemSimulation)
registerSimulation('CHEM10-09', GenericChemSimulation)
registerSimulation('CHEM10-10', GenericChemSimulation)
registerSimulation('CHEM10-11', GenericChemSimulation)
registerSimulation('CHEM10-12', GenericChemSimulation)

// Native Chemistry 12 experiments imported from hoa-hoc-12
registerSimulation('CHEM12-01', GenericChemSimulation)
registerSimulation('CHEM12-02', GenericChemSimulation)
registerSimulation('CHEM12-03', GenericChemSimulation)
registerSimulation('CHEM12-04', GenericChemSimulation)
registerSimulation('CHEM12-05', GenericChemSimulation)
registerSimulation('CHEM12-06', GenericChemSimulation)
registerSimulation('CHEM12-07', GenericChemSimulation)
registerSimulation('CHEM12-08', GenericChemSimulation)
registerSimulation('CHEM12-09', GenericChemSimulation)
registerSimulation('CHEM12-10', GenericChemSimulation)
registerSimulation('CHEM12-11', GenericChemSimulation)
registerSimulation('CHEM12-12', GenericChemSimulation)
registerSimulation('CHEM12-13', GenericChemSimulation)

// Chemistry 11 experiments
registerSimulation('CHEM11-01', GenericChemSimulation)
registerSimulation('CHEM11-02', GenericChemSimulation)
registerSimulation('CHEM11-03', GenericChemSimulation)
registerSimulation('CHEM11-04', GenericChemSimulation)
registerSimulation('CHEM11-05', GenericChemSimulation)
registerSimulation('CHEM11-06', GenericChemSimulation)
registerSimulation('CHEM11-07', GenericChemSimulation)
registerSimulation('CHEM11-08', GenericChemSimulation)
registerSimulation('CHEM11-09', GenericChemSimulation)
registerSimulation('CHEM11-10', GenericChemSimulation)
registerSimulation('CHEM11-11', GenericChemSimulation)

// Legacy Chemistry 11 aliases for old links/sessions
registerSimulation('SIM-04', GenericChemSimulation)
registerSimulation('SIM-05', GenericChemSimulation)
registerSimulation('SIM-06', GenericChemSimulation)
registerSimulation('SIM-07', GenericChemSimulation)
registerSimulation('SIM-09', GenericChemSimulation)
registerSimulation('SIM-10', GenericChemSimulation)
registerSimulation('SIM-11', GenericChemSimulation)
registerSimulation('SIM-12', GenericChemSimulation)
registerSimulation('SIM-13', GenericChemSimulation)
registerSimulation('SIM-14', GenericChemSimulation)
registerSimulation('SIM-15', GenericChemSimulation)

// Register Math simulations
registerSimulation('MATH10-01', GenericMathSimulation)
registerSimulation('MATH10-02', GenericMathSimulation)
registerSimulation('MATH10-03', GenericMathSimulation)
registerSimulation('MATH10-04', GenericMathSimulation)
registerSimulation('MATH10-05', GenericMathSimulation)
registerSimulation('MATH10-06', GenericMathSimulation)

// Legacy Math aliases for backwards compatibility
registerSimulation('SIM-08', GenericMathSimulation) // Overwrites chem SIM-08 in the registry, which is correct for Math 10 scope mapping
registerSimulation('SIM-16', GenericMathSimulation)
registerSimulation('SIM-17', GenericMathSimulation)
registerSimulation('SIM-18', GenericMathSimulation)
registerSimulation('SIM-19', GenericMathSimulation)
registerSimulation('SIM-20', GenericMathSimulation)
registerSimulation('SIM-21', KinematicsSimulation)
registerSimulation('SIM-22', FreefallSimulation)
registerSimulation('SIM-23', HorizontalSimulation)
registerSimulation('SIM-24', Newton2Simulation)
registerSimulation('SIM-25', InclineSimulation)
registerSimulation('SIM-26', SpringSimulation)
registerSimulation('SIM-27', PendulumSimulation)
registerSimulation('SIM-28', CircularSimulation)
registerSimulation('SIM-29', CollisionSimulation)
registerSimulation('SIM-30', EnergySimulation)
registerSimulation('SIM-31', BoyleSimulation)
registerSimulation('SIM-32', CharlesSimulation)
registerSimulation('SIM-33', KineticSimulation)
registerSimulation('SIM-34', StateChangeSimulation)
registerSimulation('SIM-35', MagForceSimulation)
registerSimulation('SIM-36', LorentzSimulation)
registerSimulation('SIM-37', InductionSimulation)
registerSimulation('SIM-38', ACGenSimulation)
registerSimulation('SIM-39', RadioactiveSimulation)
registerSimulation('SIM-40', NuclearSimulation)
registerSimulation('SIM-41', BindingEnergySimulation)
registerSimulation('SIM-42', ShmSimulation)
registerSimulation('SIM-43', DampedSimulation)
registerSimulation('SIM-44', ResonanceSimulation)
registerSimulation('SIM-45', WaveSimulation)
registerSimulation('SIM-46', StandingSimulation)
registerSimulation('SIM-47', InterferenceSimulation)
registerSimulation('SIM-48', CoulombSimulation)
registerSimulation('SIM-49', EFieldSimulation)
registerSimulation('SIM-50', OhmSimulation)
registerSimulation('SIM-51', ResistorsSimulation)
registerSimulation('SIM-52', FullCircuitSimulation)
