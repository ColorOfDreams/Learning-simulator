import type { ComponentType } from 'react'
import type { SimulationProps } from './types'
import EsterSimulation from './chemistry/SIM-01-ester'
import ProjectileSimulation from './physics/SIM-02-projectile'
import SoapSimulation from './chemistry/SIM-03-soap'
import GenericChemSimulation from './chemistry/GenericChemSimulation'

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



