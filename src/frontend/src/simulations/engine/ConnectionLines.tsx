import { CubicBezierLine, Line } from '@react-three/drei';
import React, { useMemo } from 'react';
import { getEquipmentConfig } from './EquipmentRegistry';

interface Props {
	objects: Scene.Object[];
	hoveredObjectId: string | null;
}

const ConnectionLines: React.FC<Props> = ({ objects, hoveredObjectId }) => {
	const connections = useMemo(() => {
		const result: Array<{ from: [number, number, number]; to: [number, number, number]; snapped: boolean }> = [];
		for (let i = 0; i < objects.length; i++) {
			const a = objects[i];
			const aSnaps = getEquipmentConfig(a.modelName).getSnapPoints(a.properties);
			if (!aSnaps?.length) continue;
			const ap = [...a.position] as [number, number, number];
			if (ap[1] === 5) ap[1] = getEquipmentConfig(a.modelName).initY;
			for (const sa of aSnaps) {
				const aw: [number, number, number] = [ap[0] + sa.position[0], ap[1] + sa.position[1], ap[2] + sa.position[2]];
				for (let j = i + 1; j < objects.length; j++) {
					const b = objects[j];
					const bSnaps = getEquipmentConfig(b.modelName).getSnapPoints(b.properties);
					if (!bSnaps?.length) continue;
					const bp = [...b.position] as [number, number, number];
					if (bp[1] === 5) bp[1] = getEquipmentConfig(b.modelName).initY;
					for (const sb of bSnaps) {
						if (!sa.connectsTo.includes(sb.type) && !sb.connectsTo.includes(sa.type)) continue;
						const bw: [number, number, number] = [
							bp[0] + sb.position[0],
							bp[1] + sb.position[1],
							bp[2] + sb.position[2],
						];
						const dist = Math.sqrt((aw[0] - bw[0]) ** 2 + (aw[1] - bw[1]) ** 2 + (aw[2] - bw[2]) ** 2);
						const snapped = dist < 0.2;
						const hovered = hoveredObjectId === a.id || hoveredObjectId === b.id;
						if (snapped) {
							result.push({ from: aw, to: bw, snapped: true });
						} else if (hovered && dist < 1.5) {
							result.push({ from: aw, to: bw, snapped: false });
						}
					}
				}
			}
		}
		return result;
	}, [objects, hoveredObjectId]);

	return (
		<>
			{connections.map((c, i) => {
				if (!c.snapped) {
					return (
						<Line
							key={i}
							points={[c.from, c.to]}
							color='#94a3b8'
							lineWidth={1}
							dashed={true}
							dashScale={0.5}
							dashSize={0.3}
							opacity={0.35}
						/>
					);
				}

				// For connected cables, draw a beautiful sagging bezier curve
				const midX = (c.from[0] + c.to[0]) / 2;
				const midZ = (c.from[2] + c.to[2]) / 2;
				const sag = 0.3 + Math.abs(c.from[0] - c.to[0]) * 0.1;
				const midY = Math.min(c.from[1], c.to[1]) - sag;

				return (
					<CubicBezierLine
						key={i}
						start={c.from}
						end={c.to}
						midA={[midX, midY, midZ]}
						midB={[midX, midY, midZ]}
						color='#22c55e'
						lineWidth={3}
						opacity={0.85}
					/>
				);
			})}
		</>
	);
};

export default React.memo(ConnectionLines);
