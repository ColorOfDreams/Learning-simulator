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
import { findChemical, findReaction, findCompoundChemical } from '@/simulations/chemicals-catalog';
import type { ReactionRule } from '@/simulations/chemicals-catalog';
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
  'HCl': '#ffffff',
  'H2SO4': '#ffffff',
  'HNO3': '#ffffff',
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
  'phenolphtalein': '#ffffff',
  'quy-tim': '#8b5cf6',
};

const COMPOUND_NAMES: Record<string, string> = {
  'H2O': 'Nước cất',
  'HCl': 'Axit clohiđric',
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
  'phenolphtalein': 'Phenolphtalein',
  'quy-tim': 'Quỳ tím',
};
const useChemColor = (doiTuong: Scene.Object, fallback: string) => {
  const rawSymbol = doiTuong.thuocTinh?.kyHieu || doiTuong.properties?.kyHieu || doiTuong.properties?.symbol;
  if (!rawSymbol) return fallback;
  const symbol = String(rawSymbol).trim();
  if (COMPOUND_COLORS[symbol]) return COMPOUND_COLORS[symbol];
  const comp = findCompoundChemical(symbol);
  if (comp) return comp.color;
  const chem = findChemical(symbol);
  return chem && chem.color !== 'transparent' ? chem.color : fallback;
};

export const getChemColor = (rawSymbol: string, fallback: string = '#00a8ff') => {
  if (!rawSymbol) return fallback;
  const symbol = String(rawSymbol).trim();
  if (COMPOUND_COLORS[symbol]) return COMPOUND_COLORS[symbol];
  const comp = findCompoundChemical(symbol);
  if (comp) return comp.color;
  const chem = findChemical(symbol);
  return chem && chem.color !== 'transparent' ? chem.color : fallback;
};

const resolveChemSymbol = (obj: Scene.Object | null, props?: Record<string, any>): string => {
  if (!obj && !props) return '';
  const p = props || {};
  return (String((obj as any)?.thuocTinh?.kyHieu || (obj as any)?.properties?.symbol || (obj as any)?.properties?.kyHieu || p.symbol || p.kyHieu || '')).trim();
};

export const resolveChemColor = (symbol: string, fallback: string = '#00a8ff') => getChemColor(symbol, fallback);

export const processPouring = (sourceProps: Record<string, any>, targetProps: Record<string, any>, equipmentContext?: { hasHeat?: boolean; hasCatalyst?: string | null; temperature?: number }) => {
  const sSym = (sourceProps.symbol || sourceProps.kyHieu || '').trim();
  const tSym = (targetProps.symbol || targetProps.kyHieu || '').trim();

  const sVol = sourceProps.theTich || sourceProps.khoiLuong || sourceProps.liquidVolume || sourceProps.chemicalLevel || 100;
  const tVol = targetProps.theTich || targetProps.khoiLuong || targetProps.liquidVolume || targetProps.chemicalLevel || 0;

  // Find chemical definitions (elements + compounds)
  const sElem = findChemical(sSym);
  const sComp = findCompoundChemical(sSym);
  const sChem = sElem || (sComp ? { state: sComp.state === 'solution' ? 'liquid' as const : sComp.state as 'solid'|'liquid'|'gas', color: sComp.color } : undefined);
  const tElem = findChemical(tSym);
  const tComp = findCompoundChemical(tSym);
  const tChem = tElem || (tComp ? { state: tComp.state === 'solution' ? 'liquid' as const : tComp.state as 'solid'|'liquid'|'gas', color: tComp.color } : undefined);

  // Temperature from equipment context or default
  const ambientTemp = equipmentContext?.temperature || 25;
  const hasHeat = equipmentContext?.hasHeat || false;
  const hasCatalyst = equipmentContext?.hasCatalyst || null;

  // Check for reaction BEFORE any early returns
  let rxnMatch: ReactionRule | undefined;
  if (tSym && tSym !== sSym) {
    rxnMatch = findReaction([sSym, tSym]);
  }
  // Also check single-reactant reactions (decomposition, indicator tests)
  if (!rxnMatch && sSym) {
    rxnMatch = findReaction([sSym]);
  }

  // Filter out reactions requiring heat/catalyst that aren't available
  if (rxnMatch) {
    if (rxnMatch.requiresHeat && !hasHeat) {
      rxnMatch = undefined;
    }
    if (rxnMatch && rxnMatch.requiresCatalyst && hasCatalyst !== rxnMatch.requiresCatalyst) {
      rxnMatch = undefined;
    }
  }

  if (rxnMatch) {
    const rxn = rxnMatch;
    const prodSym = rxn.products[0] || sSym;
    const newColor = rxn.newColor || rxn.precipitateColor || getChemColor(prodSym);
    const prodComp = findCompoundChemical(prodSym);
    const prodElem = findChemical(prodSym);
    const prodState = prodElem?.state || prodComp?.state === 'solution' ? 'liquid' : (prodComp?.state || 'liquid');
    return {
      symbol: prodSym,
      kyHieu: prodSym,
      liquidColor: newColor,
      mauChatLong: newColor,
      chemicalLevel: Math.min(100, tVol + sVol),
      liquidVolume: Math.min(500, tVol + sVol),
      theTich: Math.min(500, tVol + sVol),
      reactionEffect: rxn.effect,
      reactionDescription: rxn.description,
      precipitateColor: rxn.precipitateColor || rxn.newColor || '#ffffff',
      state: prodState
    };
  }

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
    symbol: tSym || sSym,
    kyHieu: tSym || sSym,
    chemicalLevel: Math.min(100, tVol + sVol),
    liquidVolume: Math.min(500, tVol + sVol),
    theTich: Math.min(500, tVol + sVol),
    state: tChem?.state || sChem?.state || 'liquid'
  };
};

const ContainerLiquid: React.FC<{ doiTuong: Scene.Object, radius: number, maxH: number, offsetY: number, shape?: 'cylinder' | 'cone' | 'sphere' }> = ({ doiTuong, radius, maxH, offsetY, shape = 'cylinder' }) => {
  const level = doiTuong.properties?.chemicalLevel || doiTuong.thuocTinh?.chemicalLevel || 0;
  if (level <= 0) return null;
  
  const color = useChemColor(doiTuong, '#3b82f6');
  const effect = doiTuong.properties?.reactionEffect;
  const precipitateColor = doiTuong.properties?.precipitateColor || '#ffffff';
  const state = doiTuong.properties?.state || doiTuong.thuocTinh?.state || 'liquid';
  const temperature = doiTuong.properties?.temperature || doiTuong.thuocTinh?.nhietDo || 25;
  const isHeated = temperature > 80;

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
      
      {/* Heat steam / boiling indicator */}
      {isHeated && !isSolid && !isGas && (
        <group position={[0, h / 2, 0]}>
          <Sparkles count={20} scale={[radius * 1.0, h * 0.4, radius * 1.0]} size={5} speed={1.8} opacity={0.3} color="#ffffff" />
        </group>
      )}
      
      {/* Bubbles */}
      {effect === 'bubble' && (
        <Sparkles count={isGas ? 50 : 40} scale={[radius * 1.5, h, radius * 1.5]} size={isGas ? 6 : 4} speed={0.8} opacity={0.6} position={[0, h / 2, 0]} color="#ffffff" />
      )}
      
      {/* Precipitate - enhanced cloud formation at bottom */}
      {effect === 'precipitate' && !isSolid && !isGas && (
        <group position={[0, h * 0.03, 0]}>
          <mesh>
            <cylinderGeometry args={[radius * 0.85, radius * 0.92, h * 0.12, 32]} />
            <meshStandardMaterial color={precipitateColor} roughness={0.85} />
          </mesh>
          <Sparkles count={20} scale={[radius * 1.2, h * 0.15, radius * 1.2]} size={2} speed={0.3} opacity={0.5} color={precipitateColor} />
        </group>
      )}
      
      {/* Color Change - lighting sparkle overlay */}
      {effect === 'color_change' && !isSolid && !isGas && (
        <group position={[0, h / 2, 0]}>
          <Sparkles count={25} scale={[radius * 1.3, h * 0.8, radius * 1.3]} size={3} speed={0.5} opacity={0.4} color={precipitateColor || color} />
        </group>
      )}
      
      {/* Dissolve - swirling effect at bottom */}
      {effect === 'dissolve' && !isSolid && !isGas && (
        <group position={[0, h * 0.1, 0]}>
          <Sparkles count={30} scale={[radius * 1.0, h * 0.3, radius * 1.0]} size={5} speed={1.2} opacity={0.5} color={precipitateColor || color} />
        </group>
      )}
      
      {/* Explosion - intense spark burst */}
      {effect === 'explosion' && !isSolid && !isGas && (
        <group position={[0, h / 2, 0]}>
          <Sparkles count={60} scale={[radius * 1.5, h, radius * 1.5]} size={8} speed={2.5} opacity={0.8} color="#ff6600" />
          <Sparkles count={30} scale={[radius * 1.0, h * 0.5, radius * 1.0]} size={3} speed={1.5} opacity={0.5} color="#ffcc00" />
        </group>
      )}
    </group>
  );
};


export const ChatRan: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const color = useChemColor(doiTuong, '#a855f7');
  const symbol = doiTuong.properties?.symbol || doiTuong.thuocTinh?.kyHieu;
  const chem = symbol ? findChemical(symbol) : null;
  const comp = symbol ? findCompoundChemical(symbol) : null;
  const compoundName = symbol ? COMPOUND_NAMES[symbol] : null;
  const displayName = chem?.name || comp?.name || compoundName || doiTuong.properties?.name;
  const nhan = displayName ? (symbol ? `${displayName} (${symbol})` : displayName as string) : (doiTuong.nhan || "Chat ran");
  const level = doiTuong.properties?.khoiLuong ?? doiTuong.thuocTinh?.khoiLuong ?? doiTuong.properties?.chemicalLevel ?? doiTuong.thuocTinh?.chemicalLevel ?? 100;
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol || (doiTuong.properties?.name as string)}>
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
  const comp = symbol ? findCompoundChemical(symbol) : null;
  const compoundName = symbol ? COMPOUND_NAMES[symbol] : null;
  const displayName = chem?.name || comp?.name || compoundName || doiTuong.properties?.name;
  const nhan = displayName ? (symbol ? `${displayName} (${symbol})` : displayName as string) : (doiTuong.nhan || "Chat long");
  const level = doiTuong.properties?.theTich ?? doiTuong.thuocTinh?.theTich ?? doiTuong.properties?.chemicalLevel ?? doiTuong.thuocTinh?.chemicalLevel ?? 100;
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan={nhan} kichThuocVaCham={[0.4, 0.6, 0.4]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      <ChemicalJar label={symbol || (doiTuong.properties?.name as string)} isGas>
        {level > 0 && (() => {
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

export const ChatKhi: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const color = useChemColor(doiTuong, '#ffffff');
  const symbol = doiTuong.properties?.symbol || doiTuong.thuocTinh?.kyHieu;
  const chem = symbol ? findChemical(symbol) : null;
  const comp = symbol ? findCompoundChemical(symbol) : null;
  const compoundName = symbol ? COMPOUND_NAMES[symbol] : null;
  const displayName = chem?.name || comp?.name || compoundName;
  const nhan = displayName ? `${displayName} (${symbol})` : (doiTuong.nhan || "Chat khi");
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


export const GiayQuy: React.FC<Props> = ({ doiTuong, dangChay, capNhatViTri, doThiScene }) => {
  const color = doiTuong.properties?.color || '#a855f7'; // Purple default
  return (
    <DoiTuongKeoTha doiTuong={doiTuong} nhan="Qu? t�m" kichThuocVaCham={[0.1, 0.02, 0.3]} dangChay={dangChay} capNhatViTri={capNhatViTri} doThiScene={doThiScene}>
      {/* Strip of paper */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 0.005, 0.25]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {/* Small label or grip area */}
      <mesh position={[0, 0.0026, 0.1]} castShadow>
        <boxGeometry args={[0.082, 0.001, 0.05]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
    </DoiTuongKeoTha>
  );
};

