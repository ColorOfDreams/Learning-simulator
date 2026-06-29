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
      <ContainerLiquid doiTuong={doiTuong} radius={0.3} maxH={0.6} offsetY={-0.45} shape="cone" />
    </group>
  </DoiTuongKeoTha>
);
export const BinhCau: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => (
  <DoiTuongKeoTha doiTuong={doiTuong} nhan="Bình Cầu" kichThuocVaCham={[0.35, 0.5, 0.35]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
    <group>
      <mesh castShadow><latheGeometry args={[binhCauPoints, 64]} /><VatLieuThuyTinh /></mesh>
      <ContainerLiquid doiTuong={doiTuong} radius={0.3} maxH={0.6} offsetY={-0.3} shape="sphere" />
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
  'NaOH': 'Natri hiđroxit',
  'Ca(OH)2': 'Canxi hiđroxit',
  'NaCl': 'Natri clorua',
  'CuSO4': 'Đồng (II) sunfat',
  'KMnO4': 'Thuốc tím',
  'BaCl2': 'Bari clorua',
  'AgNO3': 'Bạc nitrat',
  'HNO3': 'Axit nitric',
  'CaCO3': 'Canxi cacbonat',
  'CO2': 'Cacbon đioxit',
  'SO2': 'Lưu huỳnh đioxit',
  'CuO': 'Đồng (II) oxit',
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
  
  const sVol = sourceProps.theTich || sourceProps.khoiLuong || sourceProps.liquidVolume || sourceProps.chemicalLevel || 100;
  const tVol = targetProps.theTich || targetProps.khoiLuong || targetProps.liquidVolume || targetProps.chemicalLevel || 0;
  
  // Find chemical definitions
  const sChem = findChemical(sSym);
  const tChem = findChemical(tSym);

  // If target is empty, just copy source properties
  if (tVol === 0 || !tSym) {
    return {
      symbol: sSym,
      kyHieu: sSym,
      liquidColor: getChemColor(sSym, sourceProps.liquidColor || sourceProps.mauChatLong),
      mauChatLong: getChemColor(sSym, sourceProps.liquidColor || sourceProps.mauChatLong),
      chemicalLevel: Math.min(100, tVol + sVol),
      liquidVolume: Math.min(500, tVol + sVol),
      theTich: Math.min(500, tVol + sVol),
      state: sChem?.state || 'liquid'
    };
  }

  // Check for reaction
  const rxn = findReaction([sSym, tSym]);
  if (rxn) {
    // A reaction occurred! We use the first product as the new symbol
    const prodSym = rxn.products[0];
    const newColor = rxn.newColor || rxn.precipitateColor || getChemColor(prodSym);
    const prodChem = findChemical(prodSym);
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
      state: prodChem?.state || 'liquid'
    };
  }

  // No reaction
  const sIsSolid = sChem?.state === 'solid';
  const tIsSolid = tChem?.state === 'solid';
  const sIsGas = sChem?.state === 'gas';
  const tIsGas = tChem?.state === 'gas';

  if (sIsSolid && !tIsSolid && !tIsGas) {
    // Solid poured into Liquid -> stays as solid at the bottom
    return {
      symbol: tSym,
      kyHieu: tSym,
      liquidColor: getChemColor(tSym, targetProps.liquidColor || targetProps.mauChatLong),
      mauChatLong: getChemColor(tSym, targetProps.liquidColor || targetProps.mauChatLong),
      chemicalLevel: Math.min(100, tVol + sVol),
      liquidVolume: Math.min(500, tVol + sVol),
      theTich: Math.min(500, tVol + sVol),
      reactionEffect: 'precipitate',
      precipitateColor: getChemColor(sSym),
      state: 'liquid'
    };
  } else if (!sIsSolid && !sIsGas && tIsSolid) {
    // Liquid poured into Solid -> solid stays at bottom
    return {
      symbol: sSym,
      kyHieu: sSym,
      liquidColor: getChemColor(sSym, sourceProps.liquidColor || sourceProps.mauChatLong),
      mauChatLong: getChemColor(sSym, sourceProps.liquidColor || sourceProps.mauChatLong),
      chemicalLevel: Math.min(100, tVol + sVol),
      liquidVolume: Math.min(500, tVol + sVol),
      theTich: Math.min(500, tVol + sVol),
      reactionEffect: 'precipitate',
      precipitateColor: getChemColor(tSym),
      state: 'liquid'
    };
  } else if (sIsGas && !tIsGas && !tIsSolid) {
    // Gas poured into Liquid -> bubbles through but volume unchanged
    return {
      symbol: tSym,
      kyHieu: tSym,
      liquidColor: getChemColor(tSym, targetProps.liquidColor || targetProps.mauChatLong),
      mauChatLong: getChemColor(tSym, targetProps.liquidColor || targetProps.mauChatLong),
      chemicalLevel: tVol,
      liquidVolume: tVol,
      theTich: tVol,
      reactionEffect: 'bubble',
      state: 'liquid'
    };
  }

  // Default fallback (liquid into liquid, solid into solid, etc.)
  return {
    symbol: tSym,
    kyHieu: tSym,
    chemicalLevel: Math.min(100, tVol + sVol),
    liquidVolume: Math.min(500, tVol + sVol),
    theTich: Math.min(500, tVol + sVol),
    state: tChem?.state || 'liquid'
  };
};

const ContainerLiquid: React.FC<{ doiTuong: Scene.Object, radius: number, maxH: number, offsetY: number, shape?: 'cylinder' | 'cone' | 'sphere' }> = ({ doiTuong, radius, maxH, offsetY, shape = 'cylinder' }) => {
  const level = doiTuong.properties?.chemicalLevel || doiTuong.thuocTinh?.chemicalLevel || 0;
  if (level <= 0) return null;
  
  const color = useChemColor(doiTuong, '#3b82f6');
  const effect = doiTuong.properties?.reactionEffect;
  const precipitateColor = doiTuong.properties?.precipitateColor || '#ffffff';
  const state = doiTuong.properties?.state || doiTuong.thuocTinh?.state || 'liquid';

  const isGas = state === 'gas';
  const isSolid = state === 'solid';
  
  const h = isGas ? maxH : (isSolid ? (level / 100) * maxH * 0.5 : (level / 100) * maxH);
  
  const radiusTop = shape === 'cone' ? radius - (h / maxH) * (radius - 0.05) : shape === 'sphere' ? Math.max(0.01, Math.sqrt(Math.max(0, radius * radius - Math.pow(h - radius, 2)))) : (isSolid ? radius * 0.8 : radius);
  const radiusBottom = shape === 'cone' ? radius : shape === 'sphere' ? Math.max(0.01, Math.sqrt(Math.max(0, radius * radius - Math.pow(-radius, 2)))) : (isSolid ? radius : radius * 0.9);

  return (
    <group position={[0, offsetY, 0]}>
      {/* Chemical Body */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[radiusTop, radiusBottom, h, 32]} />
        {isGas ? (
          <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} />
        ) : isSolid ? (
          <meshStandardMaterial color={color} roughness={0.9} />
        ) : (
          <meshPhysicalMaterial color={color} transparent opacity={0.7} roughness={0.1} />
        )}
      </mesh>
      
      {/* Bubbles */}
      {effect === 'bubble' && (
        <Sparkles count={isGas ? 50 : 40} scale={[radius * 1.5, h, radius * 1.5]} size={isGas ? 6 : 4} speed={0.8} opacity={0.6} position={[0, h / 2, 0]} color="#ffffff" />
      )}
      
      {/* Precipitate */}
      {effect === 'precipitate' && !isSolid && !isGas && (
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
  const level = doiTuong.properties?.khoiLuong ?? doiTuong.thuocTinh?.khoiLuong ?? doiTuong.properties?.chemicalLevel ?? doiTuong.thuocTinh?.chemicalLevel ?? 100;
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol}>
        {level > 0 && (() => {
          const h = (level / 500) * 0.2;
          return (
            <mesh position={[0, -0.25 + h / 2, 0]}>
              <cylinderGeometry args={[0.18, 0.18, h, 32]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
          );
        })()}
      </ChemicalJar>
    </DoiTuongKeoTha>
  );
};

export const ChatLong: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const color = useChemColor(doiTuong, '#3b82f6');
  let symbol = doiTuong.properties?.symbol || doiTuong.thuocTinh?.kyHieu;
  if (!symbol && doiTuong.modelName === 'NuocCat') symbol = 'H2O';
  const chem = symbol ? findChemical(symbol) : null;
  const compoundName = symbol ? COMPOUND_NAMES[symbol] : null;
  const displayName = chem ? chem.name : compoundName;
  const nhan = displayName ? `${displayName} (${symbol})` : (doiTuong.nhan || "Chất lỏng");
  const level = doiTuong.properties?.theTich ?? doiTuong.thuocTinh?.theTich ?? doiTuong.properties?.chemicalLevel ?? doiTuong.thuocTinh?.chemicalLevel ?? 100;
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol}>
        {level > 0 && (() => {
          const h = (level / 500) * 0.3;
          return (
            <mesh position={[0, -0.25 + h / 2, 0]}>
              <cylinderGeometry args={[0.18, 0.18, h, 32]} />
              <meshPhysicalMaterial color={color} transparent opacity={0.7} roughness={0.1} />
            </mesh>
          );
        })()}
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
  const level = doiTuong.properties?.theTich ?? doiTuong.thuocTinh?.theTich ?? doiTuong.properties?.chemicalLevel ?? doiTuong.thuocTinh?.chemicalLevel ?? 100;
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol} isGas>
        {level > 0 && (() => {
          // Gas expands to fill the available space, but we change its opacity based on level
          const opacity = 0.1 + (level / 500) * 0.4;
          return (
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.4, 32]} />
              <meshPhysicalMaterial color={color} transparent opacity={opacity} roughness={0.1} />
            </mesh>
          );
        })()}
      </ChemicalJar>
    </DoiTuongKeoTha>
  );
};

