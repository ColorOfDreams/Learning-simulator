import type { ComponentType } from 'react'
import type { SimulationProps } from './types'

// Populated as each simulation is implemented (ASS-012, ASS-013, ASS-019, ASS-020, ASS-021)
const registry = new Map<string, ComponentType<SimulationProps>>()

export function registerSimulation(id: string, component: ComponentType<SimulationProps>) {
  registry.set(id, component)
}

export function getSimulation(id: string): ComponentType<SimulationProps> | undefined {
  return registry.get(id)
}
