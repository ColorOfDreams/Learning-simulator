import React from 'react';
import { MeshTransmissionMaterial } from '@react-three/drei';

const presetThuyTinh = {
  backside: true,
  samples: 8,
  thickness: 0.25,
  chromaticAberration: 0.03,
  anisotropy: 0.15,
  clearcoat: 1,
  attenuationDistance: 0.5,
  attenuationColor: '#ffffff',
  ior: 1.47,
  roughness: 0.08,
} as const;

export const VatLieuThuyTinh: React.FC<{
  mau?: string;
  day?: number;
  doNham?: number;
}> = ({ mau = '#d4edff', day = 0.25, doNham = 0.08 }) => (
  <MeshTransmissionMaterial
    {...presetThuyTinh}
    color={mau}
    thickness={day}
    roughness={doNham}
  />
);

export const VatLieuThuyTinhMong: React.FC<{ mau?: string }> = ({ mau = '#e8f4ff' }) => (
  <MeshTransmissionMaterial
    {...presetThuyTinh}
    color={mau}
    thickness={0.015}
    roughness={0.06}
    clearcoat={0.5}
    samples={6}
  />
);
