import React, { useState } from 'react';

interface Props {
	viTri: [number, number, number];
	kichThuoc?: number;
	mau: string;
	mauKhiBam?: string;
	dangBam?: boolean;
	nhan?: string;
	khiBam: () => void;
}

const NutBam: React.FC<Props> = ({
	viTri,
	kichThuoc = 0.025,
	mau,
	mauKhiBam = '#1a1a1a',
	dangBam = false,
	nhan,
	khiBam,
}) => {
	const [hover, setHover] = useState(false);
	const r = kichThuoc;
	const color = dangBam ? mauKhiBam : hover ? '#555' : mau;

	return (
		<mesh
			position={viTri}
			onPointerDown={(e) => {
				e.stopPropagation();
				khiBam();
			}}
			onPointerEnter={() => setHover(true)}
			onPointerLeave={() => setHover(false)}
			castShadow
		>
			<cylinderGeometry args={[r, r, 0.015, 24]} />
			<meshStandardMaterial
				color={color}
				roughness={0.2}
				metalness={0.6}
				emissive={hover && !dangBam ? '#222' : '#000'}
				emissiveIntensity={hover ? 0.3 : 0}
			/>
		</mesh>
	);
};

export default React.memo(NutBam);
