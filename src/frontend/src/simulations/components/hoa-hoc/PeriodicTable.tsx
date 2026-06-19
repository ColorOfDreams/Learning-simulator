import React from 'react';
import { Text } from '@react-three/drei';
import DraggablePhysicsObject from '../../engine/DraggablePhysicsObject';
import { ALL_CHEMICALS, GROUP_COLORS } from '../../chemicals-catalog';

interface Props {
  object: Scene.Object;
  isPlaying?: boolean;
  onUpdatePosition?: (id: string, position: [number, number, number]) => void;
  sceneGraph?: Scene.IRecord | null;
}

const CELL = 0.18;
const GAP = 0.01;
const COLS = 18;
const ROWS = 4;
const TW = COLS * CELL + (COLS - 1) * GAP;
const TH = ROWS * CELL + (ROWS - 1) * GAP;
const LEGEND_W = 1.0;

const grid: Record<number, [number, number]> = {};
const specialLayers: Record<number, [number, number]> = {};

for (let n = 1; n <= 36; n++) {
  if (n === 1) grid[n] = [0, 0];
  else if (n === 2) grid[n] = [17, 0];
  else if (n >= 3 && n <= 4) grid[n] = [n - 3, 1];
  else if (n >= 5 && n <= 10) grid[n] = [n + 7, 1];
  else if (n >= 11 && n <= 12) grid[n] = [n - 11, 2];
  else if (n >= 13 && n <= 18) grid[n] = [n - 1, 2];
  else if (n >= 19 && n <= 20) grid[n] = [n - 19, 3];
  else if (n >= 21 && n <= 30) grid[n] = [n - 19, 3];
  else if (n >= 31 && n <= 36) grid[n] = [n - 19, 3];
}

specialLayers[57] = [2, 5]; specialLayers[58] = [3, 5];
specialLayers[89] = [2, 6]; specialLayers[90] = [3, 6];

const legendItems: [string, string][] = [
  ['Kim loại kiềm', GROUP_COLORS['kim-loai-kiem']],
  ['Kim loại kiềm thổ', GROUP_COLORS['kim-loai-kiem-tho']],
  ['Kim loại chuyển tiếp', GROUP_COLORS['kim-loai-chuyen-tiep']],
  ['Kim loại', GROUP_COLORS['kim-loai']],
  ['Phi kim', GROUP_COLORS['phi-kim']],
  ['Halogen', GROUP_COLORS['halogen']],
  ['Khí hiếm', GROUP_COLORS['khi-hiem']],
];

const PeriodicTable: React.FC<Props> = ({ object, isPlaying, onUpdatePosition, sceneGraph }) => {
  const offsetX = -TW / 2 + CELL / 2;
  const offsetY = TH / 2 - CELL / 2 - 0.15;

  return (
    <DraggablePhysicsObject object={object} label="Bảng tuần hoàn" colliderArgs={[2.0, 1.3, 0.05]}
      isPlaying={isPlaying} onUpdatePosition={onUpdatePosition} sceneGraph={sceneGraph} isKinematic>
      <group>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[TW + 0.3, TH + 0.6, 0.03]} />
          <meshStandardMaterial color="#fcfcfc" roughness={0.2} />
        </mesh>
        <Text position={[0, TH / 2 + 0.1, 0.02]} fontSize={0.08} color="#1a1a2e"
          anchorX="center" anchorY="bottom" fontWeight="bold">
          BẢNG TUẦN HOÀN CÁC NGUYÊN TỐ HÓA HỌC
        </Text>
        {ALL_CHEMICALS.filter((c) => c.atomicNumber <= 36 && grid[c.atomicNumber]).map((chem) => {
          const [col, row] = grid[chem.atomicNumber];
          const x = col * (CELL + GAP) + offsetX;
          const y = -(row * (CELL + GAP)) + offsetY;
          const bg = GROUP_COLORS[chem.group] || '#cccccc';
          return (
            <group key={chem.symbol} position={[x, y, 0]}>
              <mesh>
                <boxGeometry args={[CELL, CELL, 0.02]} />
                <meshStandardMaterial color={bg} roughness={0.25} />
              </mesh>
              <Text position={[-CELL / 3.5, CELL / 3.5, 0.015]} fontSize={0.028} color="#ffffff"
                anchorX="left" anchorY="top">{chem.atomicNumber}</Text>
              <Text position={[0, 0.02, 0.015]} fontSize={0.055} color="#ffffff"
                anchorX="center" anchorY="middle" fontWeight="bold">{chem.symbol}</Text>
              <Text position={[0, -CELL / 3.5, 0.015]} fontSize={0.022} color="#eeeeee"
                anchorX="center" anchorY="bottom">{chem.name}</Text>
              <Text position={[CELL / 3.5, -CELL / 4, 0.015]} fontSize={0.016} color="#ddddddaa"
                anchorX="right" anchorY="top">{chem.atomicMass.toFixed(1)}</Text>
            </group>
          );
        })}
        <group position={[TW / 2 - LEGEND_W / 2, -TH / 2 - 0.2, 0.02]}>
          <mesh>
            <boxGeometry args={[LEGEND_W, 0.35, 0.005]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
          </mesh>
          <Text position={[0, 0.14, 0.005]} fontSize={0.04} color="#333333"
            anchorX="center" anchorY="middle" fontWeight="bold">Chú thích</Text>
          {legendItems.map(([label, color], i) => {
            const lx = (i % 4) * 0.24 - 0.36;
            const ly = 0.06 - Math.floor(i / 4) * 0.07;
            return (
              <group key={i} position={[lx, ly, 0.005]}>
                <mesh position={[-0.09, 0, 0]}>
                  <boxGeometry args={[0.04, 0.03, 0.002]} />
                  <meshStandardMaterial color={color} roughness={0.3} />
                </mesh>
                <Text position={[-0.04, 0, 0]} fontSize={0.022} color="#555555"
                  anchorX="left" anchorY="middle">{label}</Text>
              </group>
            );
          })}
          </group>
      </group>
    </DraggablePhysicsObject>
  );
};

export default PeriodicTable;
