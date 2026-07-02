import { useMemo } from 'react';
import type { SimulationProps } from '../../types';
import { useMathPanZoom } from '../../useMathPanZoom';

export default function ProbabilitySimulation({ config }: SimulationProps) {
  const params = config.parameters;
  const PA = Math.max(0.05, Math.min(0.95, params.find(p => p.key === 'PA')?.value ?? 0.5));
  const PB = Math.max(0.05, Math.min(0.95, params.find(p => p.key === 'PB')?.value ?? 0.4));
  const PABraw = params.find(p => p.key === 'PAB')?.value ?? 0.15;
  const PAB = Math.max(0, Math.min(Math.min(PA, PB), PABraw));

  const W = 600;
  const H = 400;
  const { svgHandlers, groupTransform, resetView, isDirty } = useMathPanZoom(1, W, H);

  const vennCX = 200;
  const vennCY = 195;
  const maxR = 130;

  const rA = useMemo(() => Math.sqrt(PA) * maxR, [PA]);
  const rB = useMemo(() => Math.sqrt(PB) * maxR, [PB]);

  const overlapFraction = PAB / Math.min(PA, PB);
  const dist = useMemo(() => {
    const minD = Math.abs(rA - rB);
    const maxD = rA + rB;
    const d = minD + (1 - overlapFraction) * (maxD - minD);
    return Math.max(minD, Math.min(maxD - 0.5, d));
  }, [rA, rB, overlapFraction]);

  const cxA = vennCX - dist / 2;
  const cxB = vennCX + dist / 2;

  const PAuB = Math.min(1, PA + PB - PAB);
  const PAgivenB = PB > 0.001 ? PAB / PB : 0;
  const PBgivenA = PA > 0.001 ? PAB / PA : 0;
  const PAc = 1 - PA;
  const PBc = 1 - PB;

  const fmt = (v: number) => v.toFixed(4);
  const fmtPct = (v: number) => (v * 100).toFixed(1) + '%';

  const panelX = 390;
  const panelW = 200;

  const interactiveId = `venn-inter-${Math.round(PAB * 100)}`;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#090d16', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" {...svgHandlers}>
        <rect width={W} height={H} fill="#090d16" />
        <g transform={groupTransform}>
        <defs>
          <clipPath id={`clipA-${interactiveId}`}>
            <circle cx={cxA} cy={vennCY} r={rA} />
          </clipPath>
          <clipPath id={`clipB-${interactiveId}`}>
            <circle cx={cxB} cy={vennCY} r={rB} />
          </clipPath>
        </defs>

        <rect x={2} y={2} width={panelX - 12} height={H - 4} rx="8"
          fill="rgba(15,23,42,0.5)" stroke="#1e293b" strokeWidth="1" />

        <text x={vennCX} y={22} fill="#f8fafc" fontSize="13" fontWeight="700" textAnchor="middle">
          Sơ đồ Venn — Không gian mẫu Ω
        </text>

        <text x={60} y={H - 14} fill="#475569" fontSize="10">Ω (toàn bộ xác suất = 1)</text>

        <circle cx={cxA} cy={vennCY} r={rA}
          fill="#3b82f6" fillOpacity="0.25"
          stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.8" />

        <circle cx={cxB} cy={vennCY} r={rB}
          fill="#8b5cf6" fillOpacity="0.25"
          stroke="#8b5cf6" strokeWidth="2" strokeOpacity="0.8" />

        <circle cx={cxB} cy={vennCY} r={rB}
          fill="#a78bfa" fillOpacity="0.22"
          stroke="none"
          clipPath={`url(#clipA-${interactiveId})`} />

        {cxA - rA + 8 < cxB && (
          <text x={cxA - rA * 0.55} y={vennCY + 5} fill="#93c5fd" fontSize="15" fontWeight="700" textAnchor="middle">A</text>
        )}
        {cxB + rB - 8 > cxA && (
          <text x={cxB + rB * 0.55} y={vennCY + 5} fill="#c4b5fd" fontSize="15" fontWeight="700" textAnchor="middle">B</text>
        )}

        {dist < rA + rB && PAB > 0.001 && (
          <text x={vennCX} y={vennCY + 5} fill="#fde68a" fontSize="11" fontWeight="600" textAnchor="middle">
            A∩B
          </text>
        )}

        {rA > 20 && (
          <text x={cxA - rA * 0.3} y={vennCY + 22} fill="#60a5fa" fontSize="10" textAnchor="middle" opacity="0.8">
            {fmtPct(PA)}
          </text>
        )}
        {rB > 20 && (
          <text x={cxB + rB * 0.3} y={vennCY + 22} fill="#a78bfa" fontSize="10" textAnchor="middle" opacity="0.8">
            {fmtPct(PB)}
          </text>
        )}
        {dist < rA + rB && PAB > 0.01 && (
          <text x={vennCX} y={vennCY + 20} fill="#fbbf24" fontSize="9" textAnchor="middle" opacity="0.9">
            {fmtPct(PAB)}
          </text>
        )}

        <rect x={panelX} y={2} width={panelW} height={H - 4} rx="8"
          fill="rgba(15,23,42,0.9)" stroke="#1e293b" strokeWidth="1" />

        <text x={panelX + panelW / 2} y={24} fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">
          Kết quả tính toán
        </text>

        <line x1={panelX + 8} y1={32} x2={panelX + panelW - 8} y2={32} stroke="#1e293b" strokeWidth="1" />

        {[
          { label: 'P(A)', value: fmt(PA), color: '#60a5fa' },
          { label: 'P(B)', value: fmt(PB), color: '#a78bfa' },
          { label: 'P(A∩B)', value: fmt(PAB), color: '#fbbf24' },
        ].map((row, i) => (
          <g key={row.label}>
            <text x={panelX + 12} y={52 + i * 22} fill="#94a3b8" fontSize="11">{row.label} =</text>
            <text x={panelX + panelW - 12} y={52 + i * 22} fill={row.color} fontSize="12"
              fontWeight="600" textAnchor="end">{row.value}</text>
          </g>
        ))}

        <line x1={panelX + 8} y1={122} x2={panelX + panelW - 8} y2={122} stroke="#1e293b" strokeWidth="1" />

        <text x={panelX + 12} y={140} fill="#94a3b8" fontSize="10">P(A∪B) = P(A)+P(B)−P(A∩B)</text>
        <text x={panelX + 12} y={156} fill="#94a3b8" fontSize="10">
          = {fmt(PA)}+{fmt(PB)}−{fmt(PAB)}
        </text>
        <text x={panelX + panelW - 12} y={170} fill="#4ade80" fontSize="13" fontWeight="700" textAnchor="end">
          = {fmt(PAuB)}
        </text>

        <line x1={panelX + 8} y1={180} x2={panelX + panelW - 8} y2={180} stroke="#1e293b" strokeWidth="1" />

        <text x={panelX + 12} y={198} fill="#94a3b8" fontSize="10">P(A|B) = P(A∩B)/P(B)</text>
        <text x={panelX + panelW - 12} y={215} fill="#38bdf8" fontSize="13" fontWeight="700" textAnchor="end">
          {fmt(PAgivenB)}
        </text>

        <text x={panelX + 12} y={236} fill="#94a3b8" fontSize="10">P(B|A) = P(A∩B)/P(A)</text>
        <text x={panelX + panelW - 12} y={253} fill="#38bdf8" fontSize="12" fontWeight="600" textAnchor="end">
          {fmt(PBgivenA)}
        </text>

        <line x1={panelX + 8} y1={263} x2={panelX + panelW - 8} y2={263} stroke="#1e293b" strokeWidth="1" />

        <text x={panelX + 12} y={281} fill="#94a3b8" fontSize="10">P(Ā) = 1 − P(A)</text>
        <text x={panelX + panelW - 12} y={298} fill="#f472b6" fontSize="13" fontWeight="700" textAnchor="end">
          {fmt(PAc)}
        </text>

        <text x={panelX + 12} y={320} fill="#94a3b8" fontSize="10">P(B̄) = 1 − P(B)</text>
        <text x={panelX + panelW - 12} y={337} fill="#f472b6" fontSize="12" fontWeight="600" textAnchor="end">
          {fmt(PBc)}
        </text>

        <line x1={panelX + 8} y1={348} x2={panelX + panelW - 8} y2={348} stroke="#1e293b" strokeWidth="1" />

        {Math.abs(PA * PB - PAB) < 0.01 ? (
          <text x={panelX + panelW / 2} y={368} fill="#4ade80" fontSize="10" textAnchor="middle">
            A, B độc lập (P(A∩B)=P(A)·P(B))
          </text>
        ) : (
          <text x={panelX + panelW / 2} y={368} fill="#fb923c" fontSize="10" textAnchor="middle">
            A, B không độc lập
          </text>
        )}
        <text x={panelX + panelW / 2} y={386} fill="#475569" fontSize="9" textAnchor="middle">
          P(A)·P(B) = {fmt(PA * PB)}
        </text>

        <text x={vennCX} y={H - 10} fill="#334155" fontSize="9" textAnchor="middle">
          Thu nhỏ / phóng to: điều chỉnh PA, PB, P(A∩B)
        </text>
        </g>
      </svg>
      {isDirty && (
        <button onClick={resetView} style={{
          position: 'absolute', bottom: 8, right: 8, zIndex: 10,
          padding: '3px 10px', background: 'rgba(15,23,42,0.9)',
          border: '1px solid #334155', borderRadius: 6,
          color: '#94a3b8', fontSize: 12, cursor: 'pointer',
        }}>↺ Reset</button>
      )}
    </div>
  );
}
