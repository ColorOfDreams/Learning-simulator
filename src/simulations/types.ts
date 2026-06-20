export interface SimulationParam {
  key: string
  value: number
  unit: string
  label: string
}

export interface SimulationConfig {
  simulation_id: string
  subject: 'physics' | 'chemistry' | 'math'
  topic: string
  parameters: SimulationParam[]
}

export interface SimulationProps {
  config: SimulationConfig
  onParamChange?: (key: string, value: number) => void
  isPlaying?: boolean
  isSlow?: boolean
  onAnimationEnd?: () => void
}
