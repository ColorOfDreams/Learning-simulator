import React from 'react';
import * as THREE from 'three';

export const VatLieuThuyTinh: React.FC<{
	mau?: string;
	day?: number;
	doNham?: number;
}> = ({ mau = '#ffffff', day = 0.05, doNham = 0.05 }) => (
	<meshPhysicalMaterial
		color={mau}
		opacity={0.3}
		metalness={0.1}
		roughness={doNham}
		clearcoat={1}
		clearcoatRoughness={0.1}
		envMapIntensity={1.0}
		side={THREE.DoubleSide}
		transparent={true}
		depthWrite={false}
	/>
);

export const VatLieuThuyTinhMong: React.FC<{ mau?: string }> = ({ mau = '#ffffff' }) => (
	<meshPhysicalMaterial
		color={mau}
		opacity={0.2}
		metalness={0.1}
		roughness={0.02}
		clearcoat={1}
		clearcoatRoughness={0.1}
		envMapIntensity={1.0}
		side={THREE.DoubleSide}
		transparent={true}
		depthWrite={false}
	/>
);
