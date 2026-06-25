import React from 'react';
import * as THREE from 'three';

export const VatLieuThuyTinh: React.FC<{
  mau?: string;
  day?: number;
  doNham?: number;
}> = ({ mau = '#d4edff', day = 0.25, doNham = 0.08 }) => (
  <meshStandardMaterial
    color={mau}
    transparent={true}
    opacity={0.25}
    roughness={0.3}
    metalness={0.1}
    envMapIntensity={0}
    side={THREE.DoubleSide}
    depthWrite={false}
  />
);

export const VatLieuThuyTinhMong: React.FC<{ mau?: string }> = ({ mau = '#e8f4ff' }) => (
  <meshStandardMaterial
    color={mau}
    transparent={true}
    opacity={0.15}
    roughness={0.2}
    metalness={0.05}
    envMapIntensity={0}
    side={THREE.DoubleSide}
    depthWrite={false}
  />
);
