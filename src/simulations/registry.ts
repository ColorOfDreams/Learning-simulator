import type { ComponentType } from 'react'
import type { SimulationProps } from './types'
import EsterSimulation from './chemistry/SIM-01-ester'
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
import SoapSimulation from './chemistry/SIM-03-soap'
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


// Math 10 simulations
import QuadraticSimulation from './math/SIM-08-quadratic'
import ProjectileArchSimulation from './math/SIM-16-projectile-arch'
import InequalitySimulation from './math/SIM-17-inequality'
import TriangulationSimulation from './math/SIM-18-triangulation'
import ConicSimulation from './math/SIM-19-conic'
import StatisticsSimulation from './math/SIM-20-statistics'

const registry = new Map<string, ComponentType<SimulationProps>>()

export function registerSimulation(id: string, component: ComponentType<SimulationProps>) {
  registry.set(id, component)
}

export function getSimulation(id: string): ComponentType<SimulationProps> | undefined {
  return registry.get(id)
}

// Register simulations
registerSimulation('SIM-01', EsterSimulation)
registerSimulation('SIM-02', ProjectileSimulation)
registerSimulation('SIM-03', SoapSimulation)

// Register dynamic chemistry simulations SIM-04 through SIM-15
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
registerSimulation('SIM-08', QuadraticSimulation) // Overwrites chem SIM-08 in the registry, which is correct for Math 10 scope mapping
registerSimulation('SIM-16', ProjectileArchSimulation)
registerSimulation('SIM-17', InequalitySimulation)
registerSimulation('SIM-18', TriangulationSimulation)
registerSimulation('SIM-19', ConicSimulation)
registerSimulation('SIM-20', StatisticsSimulation)
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




