import React, { useRef, useEffect, Suspense, lazy } from 'react';
import type { SimulationProps } from './types';

type SimComponent = React.ComponentType<SimulationProps>;

const PHYSICS_REGISTRY: Record<string, React.LazyExoticComponent<SimComponent>> = {
  'SIM-02': lazy(() => import('./physics/SIM-02-projectile')),
  'SIM-21': lazy(() => import('./physics/SIM-21-kinematics')),
  'SIM-22': lazy(() => import('./physics/SIM-22-freefall')),
  'SIM-23': lazy(() => import('./physics/SIM-23-horizontal')),
  'SIM-24': lazy(() => import('./physics/SIM-24-newton2')),
  'SIM-25': lazy(() => import('./physics/SIM-25-incline')),
  'SIM-26': lazy(() => import('./physics/SIM-26-spring')),
  'SIM-27': lazy(() => import('./physics/SIM-27-pendulum')),
  'SIM-28': lazy(() => import('./physics/SIM-28-circular')),
  'SIM-29': lazy(() => import('./physics/SIM-29-collision')),
  'SIM-30': lazy(() => import('./physics/SIM-30-energy')),
  'SIM-31': lazy(() => import('./physics/SIM-31-boyle')),
  'SIM-32': lazy(() => import('./physics/SIM-32-charles')),
  'SIM-33': lazy(() => import('./physics/SIM-33-kinetic')),
  'SIM-34': lazy(() => import('./physics/SIM-34-statechange')),
  'SIM-35': lazy(() => import('./physics/SIM-35-magforce')),
  'SIM-36': lazy(() => import('./physics/SIM-36-lorentz')),
  'SIM-37': lazy(() => import('./physics/SIM-37-induction')),
  'SIM-38': lazy(() => import('./physics/SIM-38-acgen')),
  'SIM-39': lazy(() => import('./physics/SIM-39-radioactive')),
  'SIM-40': lazy(() => import('./physics/SIM-40-nuclear')),
  'SIM-41': lazy(() => import('./physics/SIM-41-bindingenergy')),
  'SIM-42': lazy(() => import('./physics/SIM-42-shm')),
  'SIM-43': lazy(() => import('./physics/SIM-43-damped')),
  'SIM-44': lazy(() => import('./physics/SIM-44-resonance')),
  'SIM-45': lazy(() => import('./physics/SIM-45-wave')),
  'SIM-46': lazy(() => import('./physics/SIM-46-standing')),
  'SIM-47': lazy(() => import('./physics/SIM-47-interference')),
  'SIM-48': lazy(() => import('./physics/SIM-48-coulomb')),
  'SIM-49': lazy(() => import('./physics/SIM-49-efield')),
  'SIM-50': lazy(() => import('./physics/SIM-50-ohm')),
  'SIM-51': lazy(() => import('./physics/SIM-51-resistors')),
  'SIM-52': lazy(() => import('./physics/SIM-52-fullcircuit')),
};

const MATH_3D_SIMS = new Set([
  'MATH11-09', 'MATH11-10', 'MATH11-11',
  'MATH12-08', 'MATH12-09', 'MATH12-10', 'MATH12-11',
]);

const MATH_REGISTRY: Record<string, React.LazyExoticComponent<SimComponent>> = {
  'MATH10-01': lazy(() => import('./math/experiments/math10/math10-01')),
  'MATH10-02': lazy(() => import('./math/experiments/math10/math10-02')),
  'MATH10-03': lazy(() => import('./math/experiments/math10/math10-03')),
  'MATH10-04': lazy(() => import('./math/experiments/math10/math10-04')),
  'MATH10-05': lazy(() => import('./math/experiments/math10/math10-05')),
  'MATH10-06': lazy(() => import('./math/experiments/math10/math10-06')),

  'MATH11-01': lazy(() => import('./math/experiments/math11/math11-01-trig')),
  'MATH11-02': lazy(() => import('./math/experiments/math11/math11-02-unit-circle')),
  'MATH11-03': lazy(() => import('./math/experiments/math11/math11-03-combinatorics')),
  'MATH11-04': lazy(() => import('./math/experiments/math11/math11-04-probability')),
  'MATH11-05': lazy(() => import('./math/experiments/math11/math11-05-seq-limits')),
  'MATH11-06': lazy(() => import('./math/experiments/math11/math11-06-func-limits')),
  'MATH11-07': lazy(() => import('./math/experiments/math11/math11-07-derivatives')),
  'MATH11-08': lazy(() => import('./math/experiments/math11/math11-08-transformations')),
  'MATH11-09': lazy(() => import('./math/experiments/math11/math11-09-planes3d')),
  'MATH11-10': lazy(() => import('./math/experiments/math11/math11-10-perpendicular3d')),
  'MATH11-11': lazy(() => import('./math/experiments/math11/math11-11-polyhedra')),

  'MATH12-01': lazy(() => import('./math/experiments/math12/math12-01-cubic')),
  'MATH12-02': lazy(() => import('./math/experiments/math12/math12-02-rational')),
  'MATH12-03': lazy(() => import('./math/experiments/math12/math12-03-exponential')),
  'MATH12-04': lazy(() => import('./math/experiments/math12/math12-04-logarithm')),
  'MATH12-05': lazy(() => import('./math/experiments/math12/math12-05-integral-area')),
  'MATH12-06': lazy(() => import('./math/experiments/math12/math12-06-area-between')),
  'MATH12-07': lazy(() => import('./math/experiments/math12/math12-07-complex')),
  'MATH12-08': lazy(() => import('./math/experiments/math12/math12-08-revolution3d')),
  'MATH12-09': lazy(() => import('./math/experiments/math12/math12-09-polyhedra3d')),
  'MATH12-10': lazy(() => import('./math/experiments/math12/math12-10-plane3d')),
  'MATH12-11': lazy(() => import('./math/experiments/math12/math12-11-line3d')),

  // Legacy Math aliases for backwards compatibility
  'SIM-08': lazy(() => import('./math/experiments/math10/math10-01')),
  'SIM-16': lazy(() => import('./math/experiments/math10/math10-02')),
  'SIM-17': lazy(() => import('./math/experiments/math10/math10-03')),
  'SIM-18': lazy(() => import('./math/experiments/math10/math10-04')),
  'SIM-19': lazy(() => import('./math/experiments/math10/math10-05')),
  'SIM-20': lazy(() => import('./math/experiments/math10/math10-06')),
};

interface SimThumbCaptureProps {
  simId: string;
  subject: 'physics' | 'math';
  onCapture: (simId: string, dataUrl: string) => void;
}

function captureSvg(container: HTMLElement): string {
  const svg = container.querySelector('svg');
  if (!svg) return '';
  try {
    const svgStr = new XMLSerializer().serializeToString(svg);
    const b64 = btoa(unescape(encodeURIComponent(svgStr)));
    return `data:image/svg+xml;base64,${b64}`;
  } catch {
    return '';
  }
}

function captureCanvas(container: HTMLElement): string {
  const canvas = container.querySelector('canvas');
  if (!canvas) return '';
  try {
    return canvas.toDataURL('image/webp', 0.75);
  } catch {
    return '';
  }
}

const SimThumbCaptureInner: React.FC<SimThumbCaptureProps & { SimComp: React.LazyExoticComponent<SimComponent> }> = ({
  simId,
  subject,
  onCapture,
  SimComp,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMath3D = subject === 'math' && MATH_3D_SIMS.has(simId);
    const delay = isMath3D ? 600 : subject === 'math' ? 200 : 600;
    const timer = setTimeout(() => {
      if (!mountRef.current) return;
      const dataUrl = (isMath3D || subject === 'physics')
        ? captureCanvas(mountRef.current)
        : captureSvg(mountRef.current);
      if (dataUrl && dataUrl.length > 500) {
        onCapture(simId, dataUrl);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [simId, subject, onCapture]);

  const minConfig: SimulationProps['config'] = {
    simulation_id: simId,
    subject: 'math',
    topic: 'generic',
    parameters: [],
  };

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={null}>
        <SimComp config={minConfig} />
      </Suspense>
    </div>
  );
};

const SimThumbCapture: React.FC<SimThumbCaptureProps> = ({ simId, subject, onCapture }) => {
  const registry = subject === 'math' ? MATH_REGISTRY : PHYSICS_REGISTRY;
  const SimComp = registry[simId];
  if (!SimComp) return null;
  return <SimThumbCaptureInner simId={simId} subject={subject} onCapture={onCapture} SimComp={SimComp} />;
};

export default SimThumbCapture;
