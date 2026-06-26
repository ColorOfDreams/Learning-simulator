import React from 'react';
import * as THREE from 'three';
import DoiTuongKeoTha from '@/simulations/engine/DraggablePhysicsObject';
import { VatLieuThuyTinh } from '@/dung-cu/dung-chung/VatLieuThuyTinh';
import { Text, Sparkles } from '@react-three/drei';

const ongNghiemPoints = (() => {
  const pts = [];
  for(let i=0; i<=10; i++) {
    const a = (Math.PI/2) * (i/10);
    pts.push(new THREE.Vector2(0.06 * Math.sin(a), -0.52 - 0.06 * Math.cos(a)));
  }
  pts.push(new THREE.Vector2(0.06, 0.6));
  pts.push(new THREE.Vector2(0.08, 0.6));
  for(let i=10; i>=0; i--) {
    const a = (Math.PI/2) * (i/10);
    pts.push(new THREE.Vector2(0.08 * Math.sin(a), -0.52 - 0.08 * Math.cos(a)));
  }
  return pts;
})();

const binhTamGiacPoints = [
  new THREE.Vector2(0, -0.5),
  new THREE.Vector2(0.35, -0.5),
  new THREE.Vector2(0.09, 0.2),
  new THREE.Vector2(0.09, 0.5),
  new THREE.Vector2(0.07, 0.5),
  new THREE.Vector2(0.07, 0.2),
  new THREE.Vector2(0.33, -0.48),
  new THREE.Vector2(0, -0.48)
];

const binhCauPoints = (() => {
  const pts = [];
  pts.push(new THREE.Vector2(0, -0.33));
  for(let i=1; i<=20; i++) {
    const a = Math.PI * (i/20);
    const x = 0.33 * Math.sin(a);
    const y = -0.33 * Math.cos(a);
    if(x <= 0.05 && y > 0) {
      pts.push(new THREE.Vector2(0.05, y));
      break;
    }
    pts.push(new THREE.Vector2(x, y));
  }
  pts.push(new THREE.Vector2(0.05, 0.7));
  pts.push(new THREE.Vector2(0.08, 0.7));
  pts.push(new THREE.Vector2(0.06, 0.7));
  const intersectY = Math.sqrt(Math.max(0, 0.35*0.35 - 0.06*0.06));
  pts.push(new THREE.Vector2(0.06, intersectY));
  for(let i=20; i>=0; i--) {
    const a = Math.PI * (i/20);
    const x = 0.35 * Math.sin(a);
    const y = -0.35 * Math.cos(a);
    if (y > intersectY) continue;
    pts.push(new THREE.Vector2(x, y));
  }
  return pts;
})();

const buretPoints = [
  new THREE.Vector2(0.04, -1.5), new THREE.Vector2(0.05, -1.5),
  new THREE.Vector2(0.05, 1.5), new THREE.Vector2(0.04, 1.5)
];
const pipetPoints = [
  new THREE.Vector2(0.02, -0.8), new THREE.Vector2(0.03, -0.8),
  new THREE.Vector2(0.03, 0.8), new THREE.Vector2(0.02, 0.8)
];
const ongSinhHanPoints = [
  new THREE.Vector2(0.05, -0.6), new THREE.Vector2(0.06, -0.6),
  new THREE.Vector2(0.06, 0.6), new THREE.Vector2(0.05, 0.6)
];

interface Props { doiTuong: Scene.Object; dangChay?: boolean; capNhatViTri?: (id: string, viTri: [number, number, number]) => void; doThiScene?: Scene.IRecord | null; }

export const OngNghiem: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Ống Nghiệm" kichThuocVaCham={[0.1, 0.6, 0.1]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <group>
      <mesh castShadow><latheGeometry args={[ongNghiemPoints, 32]} /><VatLieuThuyTinh /></mesh>
      <ContainerLiquid doiTuong={doiTuong} radius={0.06} maxH={0.9} offsetY={-0.45} />
    </group>
  </DoiTuongKeoTha>
);
export const BinhTamGiac: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bình Tam Giác" kichThuocVaCham={[0.35, 0.5, 0.35]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <group>
      <mesh castShadow><latheGeometry args={[binhTamGiacPoints, 64]} /><VatLieuThuyTinh /></mesh>
      <ContainerLiquid doiTuong={doiTuong} radius={0.3} maxH={0.6} offsetY={-0.45} />
    </group>
  </DoiTuongKeoTha>
);
export const BinhCau: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bình Cầu" kichThuocVaCham={[0.35, 0.5, 0.35]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <group>
      <mesh castShadow><latheGeometry args={[binhCauPoints, 64]} /><VatLieuThuyTinh /></mesh>
      <ContainerLiquid doiTuong={doiTuong} radius={0.3} maxH={0.6} offsetY={-0.3} />
    </group>
  </DoiTuongKeoTha>
);
export const Buret: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Buret" kichThuocVaCham={[0.06, 1.5, 0.06]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><latheGeometry args={[buretPoints, 16]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const Pipet: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Pipet" kichThuocVaCham={[0.04, 0.8, 0.04]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><latheGeometry args={[pipetPoints, 16]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const NhietKe: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const nhietDo = doiTuong.thuocTinh?.nhietDo || doiTuong.properties?.temperature || 25;
  const height = 1.2;
  const redHeight = (nhietDo / 100) * (height * 0.8) + 0.1;

  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Nhiệt Kế" kichThuocVaCham={[0.05, height / 2, 0.05]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
      <group>
        {/* Outer glass tube */}
        <mesh castShadow><cylinderGeometry args={[0.04, 0.04, height, 16]} /><VatLieuThuyTinh /></mesh>
        
        {/* Red liquid inside */}
        <mesh position={[0, -height / 2 + redHeight / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, redHeight, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        
        {/* Bottom bulb */}
        <mesh position={[0, -height / 2, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Temperature Text */}
        <Text
          position={[0, height / 2 + 0.1, 0]}
          fontSize={0.15}
          color="#ef4444"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#ffffff"
        >
          {`${nhietDo}°C`}
        </Text>
      </group>
    </DoiTuongKeoTha>
  );
};
export const OngSinhHan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Ống Sinh Hàn" kichThuocVaCham={[0.08, 0.6, 0.08]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><latheGeometry args={[ongSinhHanPoints, 16]} /><VatLieuThuyTinh /></mesh>
  </DoiTuongKeoTha>
);
export const CoiChay: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Cối Chày" kichThuocVaCham={[0.2, 0.15, 0.2]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <mesh castShadow><cylinderGeometry args={[0.2, 0.15, 0.3, 32]} /><meshStandardMaterial color="#e2e8f0" roughness={0.3} /></mesh>
  </DoiTuongKeoTha>
);
import { findChemical, findReaction } from '@/simulations/chemicals-catalog';
const ChemicalJar: React.FC<{ children: React.ReactNode; label?: string; isGas?: boolean }> = ({ children, label, isGas }) => (
  <group position={[0, -0.25, 0]}>
    {/* Vỏ bình thủy tinh (lọ đựng hóa chất) */}
    <mesh>
      <cylinderGeometry args={[0.2, 0.2, 0.5, 32]} />
      <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    {/* Nắp đậy */}
    <mesh position={[0, 0.27, 0]}>
      <cylinderGeometry args={[0.21, 0.21, 0.06, 32]} />
      <meshStandardMaterial color="#334155" roughness={0.6} />
    </mesh>
    {/* Nhãn dán */}
    <group position={[0, 0, 0.201]}>
      <mesh>
        <planeGeometry args={[0.25, 0.15]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      {label && (
        <Text
          position={[0, 0, 0.002]}
          fontSize={0.045}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.24}
        >
          {label}
        </Text>
      )}
    </group>
    {children}
  </group>
);

const COMPOUND_COLORS: Record<string, string> = {
  'H2O': '#38bdf8',
  'HCl': '#f8fafc',
  'H2SO4': '#ffffff',
  'HNO3': '#fef08a',
  'NaOH': '#ffffff',
  'CuSO4': '#2563eb',
  'NaCl': '#ffffff',
  'CaCO3': '#f1f5f9',
  'AgNO3': '#ffffff',
  'FeCl2': '#b0e0b0',
  'Cu(NO3)2': '#4444ff',
  'KMnO4': '#8b5cf6',
  'C': '#1a1a1a',
  'S': '#facc15',
  'P': '#ef4444',
};

const COMPOUND_NAMES: Record<string, string> = {
  'H2O': 'Nước cất',
  'HCl': 'Axit clohidric',
  'H2SO4': 'Axit sunfuric',
  'HNO3': 'Axit nitric',
  'NaOH': 'Natri hiđroxit',
  'CuSO4': 'Đồng(II) sunfat',
  'NaCl': 'Natri clorua',
  'CaCO3': 'Canxi cacbonat',
  'AgNO3': 'Bạc nitrat',
  'FeCl2': 'Sắt(II) clorua',
  'Cu(NO3)2': 'Đồng(II) nitrat',
  'KMnO4': 'Thuốc tím',
};
const useChemColor = (doiTuong: Scene.Object, fallback: string) => {
  const symbol = doiTuong.thuocTinh?.kyHieu || doiTuong.properties?.kyHieu || doiTuong.properties?.symbol;
  if (!symbol) return fallback;
  if (COMPOUND_COLORS[symbol]) return COMPOUND_COLORS[symbol];
  const chem = findChemical(symbol);
  return chem && chem.color !== 'transparent' ? chem.color : fallback;
};

export const getChemColor = (symbol: string, fallback: string = '#00a8ff') => {
  if (!symbol) return fallback;
  if (COMPOUND_COLORS[symbol]) return COMPOUND_COLORS[symbol];
  const chem = findChemical(symbol);
  return chem && chem.color !== 'transparent' ? chem.color : fallback;
};

export const processPouring = (sourceProps: Record<string, any>, targetProps: Record<string, any>) => {
  const sSym = sourceProps.symbol || sourceProps.kyHieu;
  const tSym = targetProps.symbol || targetProps.kyHieu;
  
  const sVol = sourceProps.theTich || sourceProps.liquidVolume || sourceProps.chemicalLevel || 100;
  const tVol = targetProps.theTich || targetProps.liquidVolume || targetProps.chemicalLevel || 0;
  
  // If target is empty, just copy source properties
  if (tVol === 0 || !tSym) {
    return {
      symbol: sSym,
      kyHieu: sSym,
      liquidColor: getChemColor(sSym, sourceProps.liquidColor || sourceProps.mauChatLong),
      mauChatLong: getChemColor(sSym, sourceProps.liquidColor || sourceProps.mauChatLong),
      chemicalLevel: Math.min(100, tVol + sVol),
      liquidVolume: Math.min(500, tVol + sVol),
      theTich: Math.min(500, tVol + sVol)
    };
  }

  // Check for reaction
  const rxn = findReaction([sSym, tSym]);
  if (rxn) {
    // A reaction occurred! We use the first product as the new symbol
    const prodSym = rxn.products[0];
    const newColor = rxn.newColor || rxn.precipitateColor || getChemColor(prodSym);
    return {
      symbol: prodSym,
      kyHieu: prodSym,
      liquidColor: newColor,
      mauChatLong: newColor,
      chemicalLevel: Math.min(100, tVol + sVol),
      liquidVolume: Math.min(500, tVol + sVol),
      theTich: Math.min(500, tVol + sVol),
      reactionEffect: rxn.effect,
      precipitateColor: rxn.precipitateColor || rxn.newColor || '#ffffff',
    };
  }

  // No reaction, just keep target symbol but update volume
  return {
    symbol: tSym,
    kyHieu: tSym,
    chemicalLevel: Math.min(100, tVol + sVol),
    liquidVolume: Math.min(500, tVol + sVol),
    theTich: Math.min(500, tVol + sVol)
  };
};

const ContainerLiquid: React.FC<{ doiTuong: Scene.Object, radius: number, maxH: number, offsetY: number }> = ({ doiTuong, radius, maxH, offsetY }) => {
  const level = doiTuong.properties?.chemicalLevel || doiTuong.thuocTinh?.chemicalLevel || 0;
  if (level <= 0) return null;
  const h = (level / 100) * maxH;
  const color = useChemColor(doiTuong, '#3b82f6');
  
  const effect = doiTuong.properties?.reactionEffect;
  const precipitateColor = doiTuong.properties?.precipitateColor || '#ffffff';

  return (
    <group position={[0, offsetY, 0]}>
      {/* Liquid Body */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 0.9, h, 32]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.7} roughness={0.1} />
      </mesh>
      
      {/* Bubbles */}
      {effect === 'bubble' && (
        <Sparkles count={40} scale={[radius * 1.5, h, radius * 1.5]} size={4} speed={0.8} opacity={0.6} position={[0, h / 2, 0]} color="#ffffff" />
      )}
      
      {/* Precipitate */}
      {effect === 'precipitate' && (
        <mesh position={[0, h * 0.05, 0]}>
          <cylinderGeometry args={[radius * 0.9, radius * 0.9, h * 0.1, 32]} />
          <meshStandardMaterial color={precipitateColor} roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};


export const ChatRan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const color = useChemColor(doiTuong, '#a855f7');
  const symbol = doiTuong.properties?.symbol || doiTuong.thuocTinh?.kyHieu;
  const chem = symbol ? findChemical(symbol) : null;
  const compoundName = symbol ? COMPOUND_NAMES[symbol] : null;
  const displayName = chem ? chem.name : compoundName;
  const nhan = displayName ? `${displayName} (${symbol})` : (doiTuong.nhan || "Chất rắn");
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.2, 32]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      </ChemicalJar>
    </DoiTuongKeoTha>
  );
};

export const ChatLong: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const color = useChemColor(doiTuong, '#3b82f6');
  const symbol = doiTuong.properties?.symbol || doiTuong.thuocTinh?.kyHieu;
  const chem = symbol ? findChemical(symbol) : null;
  const compoundName = symbol ? COMPOUND_NAMES[symbol] : null;
  const displayName = chem ? chem.name : compoundName;
  const nhan = displayName ? `${displayName} (${symbol})` : (doiTuong.nhan || "Chất lỏng");
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol}>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.3, 32]} />
          <meshPhysicalMaterial color={color} transparent opacity={0.7} roughness={0.1} />
        </mesh>
      </ChemicalJar>
    </DoiTuongKeoTha>
  );
};

export const ChatKhi: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const color = useChemColor(doiTuong, '#ffffff');
  const symbol = doiTuong.properties?.symbol || doiTuong.thuocTinh?.kyHieu;
  const chem = symbol ? findChemical(symbol) : null;
  const compoundName = symbol ? COMPOUND_NAMES[symbol] : null;
  const displayName = chem ? chem.name : compoundName;
  const nhan = displayName ? `${displayName} (${symbol})` : (doiTuong.nhan || "Chất khí");
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol} isGas>
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.4, 32]} />
          <meshPhysicalMaterial color={color} transparent opacity={0.3} roughness={0.1} />
        </mesh>
      </ChemicalJar>
    </DoiTuongKeoTha>
  );
};
export const BangTuanHoan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bảng Tuần Hoàn" kichThuocVaCham={[1.5, 1.0, 0.05]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene} coDinh>
    <mesh castShadow><boxGeometry args={[3.0, 2.0, 0.05]} /><meshStandardMaterial color="#f8fafc" roughness={0.5} /></mesh>
  </DoiTuongKeoTha>
);
