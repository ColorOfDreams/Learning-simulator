import type { SimulationProps } from '../types';
import { EXPERIMENTS_CONFIG, MATH_EXPERIMENT_ALIASES } from './experiments';

export default function GenericMathSimulation(props: SimulationProps) {
  const requestedSimId = props.config.simulation_id;
  const simId = MATH_EXPERIMENT_ALIASES[requestedSimId] || requestedSimId;
  const Comp = EXPERIMENTS_CONFIG[simId];
  if (!Comp) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', borderRadius: '18px', color: '#64748b' }}>
        Không tìm thấy mô phỏng Toán học tương ứng ({simId})
      </div>
    );
  }
  return <Comp {...props} />;
}
