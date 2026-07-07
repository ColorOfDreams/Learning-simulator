import React, { useEffect, useState, useMemo, useRef } from 'react';
import { levelFloorXp, nextThresholdXp, formatElapsed } from '@/utils/xp';
import './index.less';

interface CelebrationOverlayProps {
	score: number; // percentage (0 - 100)
	onClose: () => void;
	icon?: string;
	title?: string;
	message?: string;
	showScore?: boolean;
	closeLabel?: string;
	// Dynamic configurations
	subject?: 'chem' | 'physics' | 'math' | string;
	mode?: 'A' | 'B';
	labName?: string;
	quizName?: string;
	levelUp?: boolean; // fallback cũ; ưu tiên levelBefore/levelAfter khi có
	// ── Dữ liệu THẬT cho mode B (nếu không truyền sẽ fallback an toàn) ──
	xpEarned?: number; // XP thật vừa cộng
	xpBefore?: number; // tổng XP trước khi cộng
	xpAfter?: number; // tổng XP sau khi cộng
	levelBefore?: number;
	levelAfter?: number;
	levelTitle?: string; // danh hiệu ứng với levelAfter
	stepsDone?: number;
	stepsTotal?: number;
	elapsedSeconds?: number;
}

const SUBJECT_CONFIGS = {
	toan: {
		label: 'Toán',
		word: 'bài toán',
		acc: 'oklch(0.55 0.19 275)',
		accD: 'oklch(0.72 0.15 275)',
		accWeak: 'oklch(0.55 0.19 275 / .14)',
		grad: 'linear-gradient(150deg, oklch(0.52 0.2 265), oklch(0.38 0.18 285))',
		ag: 'oklch(0.55 0.19 275 / .5)',
		agz: 'oklch(0.55 0.19 275 / 0)',
		ag2: 'oklch(0.52 0.2 285 / .6)',
		ring: 'oklch(0.6 0.18 275)',
		hues: [275, 268, 255, 300, 210],
	},
	ly: {
		label: 'Lý',
		word: 'thí nghiệm',
		acc: 'oklch(0.5 0.14 210)',
		accD: 'oklch(0.72 0.13 210)',
		accWeak: 'oklch(0.5 0.14 210 / .15)',
		grad: 'linear-gradient(150deg, oklch(0.72 0.14 185), oklch(0.42 0.15 245))',
		ag: 'oklch(0.5 0.14 210 / .5)',
		agz: 'oklch(0.5 0.14 210 / 0)',
		ag2: 'oklch(0.5 0.14 220 / .6)',
		ring: 'oklch(0.6 0.15 205)',
		hues: [200, 210, 230, 180, 70],
	},
	hoa: {
		label: 'Hóa',
		word: 'thí nghiệm',
		acc: 'oklch(0.55 0.17 300)',
		accD: 'oklch(0.74 0.14 300)',
		accWeak: 'oklch(0.55 0.17 300 / .14)',
		grad: 'linear-gradient(150deg, oklch(0.58 0.18 305), oklch(0.62 0.2 350))',
		ag: 'oklch(0.55 0.17 300 / .5)',
		agz: 'oklch(0.55 0.17 300 / 0)',
		ag2: 'oklch(0.6 0.16 285 / .6)',
		ring: 'oklch(0.62 0.16 285)',
		hues: [264, 300, 320, 70, 350],
	},
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
	score = 0,
	onClose,
	icon,
	title,
	message,
	showScore,
	closeLabel,
	subject,
	mode,
	labName,
	quizName,
	levelUp = false,
	xpEarned,
	xpBefore,
	levelBefore,
	levelAfter,
	levelTitle,
	stepsDone,
	stepsTotal,
	elapsedSeconds,
}) => {
	// 1. Detect System Theme
	const [theme, setTheme] = useState<'light' | 'dark'>(() => {
		if (typeof window !== 'undefined' && window.matchMedia) {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return 'light';
	});

	useEffect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return;
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e: MediaQueryListEvent) => {
			setTheme(e.matches ? 'dark' : 'light');
		};
		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	}, []);

	// 2. Map subject keys
	const subKey = useMemo(() => {
		const s = (subject || '').toLowerCase();
		if (s === 'math' || s === 'toan') return 'toan';
		if (s === 'physics' || s === 'ly') return 'ly';
		return 'hoa'; // defaults to Hóa/Chemistry
	}, [subject]);

	const sub = SUBJECT_CONFIGS[subKey];

	// 3. Resolve Mode (A vs B)
	const isModeB = useMemo(() => {
		return mode === 'B' || (mode !== 'A' && (showScore ?? true));
	}, [mode, showScore]);

	// ── Dữ liệu THẬT (không phụ thuộc animation) ──
	const lvlBefore = levelBefore ?? 1;
	const lvlAfter = levelAfter ?? lvlBefore;
	const hasRealLevels = levelBefore != null && levelAfter != null;
	// Ưu tiên phát hiện lên cấp thật; nếu không có dữ liệu level thì fallback prop cũ.
	const isLvlUp = hasRealLevels ? lvlAfter > lvlBefore : levelUp;
	const earnedXp = Math.max(0, Math.round(xpEarned ?? 0));
	const xpB = Math.max(0, Math.round(xpBefore ?? levelFloorXp(lvlBefore)));

	const [runId] = useState(() => Math.floor(Math.random() * 1000));
	const [progress, setProgress] = useState(0);
	const [counting, setCounting] = useState(false);
	const [xpPop, setXpPop] = useState(false);
	const [sparkOn, setSparkOn] = useState(false);
	const [xpFloat, setXpFloat] = useState(false);
	
	const [showLevel, setShowLevel] = useState(false);
	const [flash, setFlash] = useState(false);
	const [showOldBadge, setShowOldBadge] = useState(false);
	const [showNewBadge, setShowNewBadge] = useState(false);
	const [shake, setShake] = useState(false);
	const [rays, setRays] = useState(false);
	const [ringDone, setRingDone] = useState(false);

	const timers = useRef<NodeJS.Timeout[]>([]);
	const rafRef = useRef<number | null>(null);

	const cleanTimers = () => {
		timers.current.forEach(clearTimeout);
		timers.current = [];
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	};

	const addTimer = (fn: () => void, ms: number) => {
		timers.current.push(setTimeout(fn, ms));
	};

	// Start counting animations on mount for Mode B
	useEffect(() => {
		cleanTimers();
		
		// Event listener for Esc key to close overlay
		const escHandler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', escHandler);

		if (isModeB) {
			addTimer(() => startXPEffects(), 340);
		}

		return () => {
			window.removeEventListener('keydown', escHandler);
			cleanTimers();
		};
	}, [isModeB]);

	const startXPEffects = () => {
		const dur = 1650;
		const t0 = performance.now();
		setCounting(true);
		let last = 0;

		const tick = (now: number) => {
			const elapsed = now - t0;
			const p = Math.min(1, elapsed / dur);
			// cubic ease-out
			const e = 1 - Math.pow(1 - p, 3);
			
			if (now - last > 32 || p >= 1) {
				last = now;
				setProgress(e);
			}

			if (p < 1) {
				rafRef.current = requestAnimationFrame(tick);
			} else {
				setCounting(false);
				setXpPop(true);
				setSparkOn(true);
				setRingDone(true);
				setXpFloat(true);

				addTimer(() => setXpPop(false), 420);
				addTimer(() => setSparkOn(false), 700);
				addTimer(() => setXpFloat(false), 1200);

				if (isLvlUp) {
					addTimer(() => triggerLevelUp(), 620);
				}
			}
		};
		rafRef.current = requestAnimationFrame(tick);
	};

	const triggerLevelUp = () => {
		setShowLevel(true);
		setFlash(true);
		setShake(true);
		setShowOldBadge(true);
		setRays(true);

		addTimer(() => setFlash(false), 340);
		addTimer(() => setShake(false), 560);
		addTimer(() => {
			setShowOldBadge(false);
			setShowNewBadge(true);
			// Fire extra center confetti
			setCustomConfetti(centerConfetti);
		}, 330);
	};

	// 4. Generate Particles & Confetti
	const dust = useMemo(() => {
		const hues = sub.hues;
		const arr = [];
		for (let i = 0; i < 20; i++) {
			const size = rand(3, 7);
			const left = rand(4, 96);
			const dur = rand(3.4, 6.2);
			const delay = rand(0, 5);
			const hue = hues[Math.floor(Math.random() * hues.length)];
			arr.push({
				style: {
					position: 'fixed' as const,
					bottom: '-10px',
					left: `${left}%`,
					width: `${size}px`,
					height: `${size}px`,
					borderRadius: '50%',
					background: `oklch(0.72 0.16 ${hue})`,
					boxShadow: `0 0 ${size * 2}px oklch(0.72 0.16 ${hue} / .8)`,
					pointerEvents: 'none' as const,
					zIndex: 905,
					animation: `dust ${dur}s ${delay}s linear infinite`,
				}
			});
		}
		return arr;
	}, [sub, runId]);

	const stars = useMemo(() => {
		const arr = [];
		const isDarkTheme = theme === 'dark';
		for (let i = 0; i < 7; i++) {
			const size = rand(8, 13);
			const top = rand(4, 30);
			const left = rand(4, 92);
			const delay = rand(0, 2.4);
			arr.push({
				style: {
					position: 'absolute' as const,
					top: `${top}%`,
					left: `${left}%`,
					fontSize: `${size}px`,
					color: isDarkTheme ? 'oklch(0.8 0.12 90 / .8)' : 'oklch(0.7 0.14 90 / .7)',
					pointerEvents: 'none' as const,
					zIndex: 1,
					animation: `dustTw ${rand(1.6, 2.8)}s ${delay}s ease-in-out infinite`,
				}
			});
		}
		return arr;
	}, [theme, runId]);

	const motifs = useMemo(() => {
		const isDarkTheme = theme === 'dark';
		const arr = [];
		const base = (extraStyle: React.CSSProperties, dur: number, delay: number) => ({
			position: 'absolute' as const,
			zIndex: 1,
			pointerEvents: 'none' as const,
			animation: `orbFloat ${dur}s ${delay}s ease-in-out infinite`,
			...extraStyle,
		});

		if (subKey === 'toan') {
			const chars = ['π', '√x', '÷', '∞', 'x²', '∑', 'θ', '≠'];
			for (let i = 0; i < 8; i++) {
				arr.push({
					char: chars[i],
					style: base({
						top: `${rand(5, 86).toFixed(0)}%`,
						left: `${rand(3, 88).toFixed(0)}%`,
						fontFamily: "'IBM Plex Mono', monospace",
						fontWeight: 700,
						fontSize: `${rand(13, 21).toFixed(0)}px`,
						color: `oklch(0.55 0.19 275 / ${isDarkTheme ? '.4' : '.2'})`,
					}, rand(6, 11), rand(0, 3)),
				});
			}
		} else if (subKey === 'ly') {
			const chars = ['λ', 'Ω', '∿', 'Hz', 'm/s²', 'eV', 'ω'];
			for (let i = 0; i < 7; i++) {
				arr.push({
					char: chars[i],
					style: base({
						top: `${rand(5, 86).toFixed(0)}%`,
						left: `${rand(3, 88).toFixed(0)}%`,
						fontFamily: "'IBM Plex Mono', monospace",
						fontWeight: 700,
						fontSize: `${rand(13, 20).toFixed(0)}px`,
						color: `oklch(0.55 0.14 210 / ${isDarkTheme ? '.45' : '.22'})`,
					}, rand(6, 11), rand(0, 3)),
				});
			}
		} else {
			const chars = ['H₂O', 'CO₂', 'NaCl', 'O₂'];
			for (let i = 0; i < 4; i++) {
				arr.push({
					char: chars[i],
					style: base({
						top: `${rand(6, 80).toFixed(0)}%`,
						left: `${rand(4, 82).toFixed(0)}%`,
						fontFamily: "'IBM Plex Mono', monospace",
						fontWeight: 700,
						fontSize: `${rand(11, 15).toFixed(0)}px`,
						color: `oklch(0.58 0.17 320 / ${isDarkTheme ? '.45' : '.24'})`,
					}, rand(6, 11), rand(0, 3)),
				});
			}
			for (let i = 0; i < 7; i++) {
				const sz = rand(8, 22).toFixed(0);
				arr.push({
					char: '',
					style: base({
						top: `${rand(5, 88).toFixed(0)}%`,
						left: `${rand(3, 92).toFixed(0)}%`,
						width: `${sz}px`,
						height: `${sz}px`,
						borderRadius: '50%',
						border: `1.5px solid oklch(0.62 0.19 345 / ${isDarkTheme ? '.5' : '.3'})`,
					}, rand(4, 8), rand(0, 3)),
				});
			}
		}
		return arr;
	}, [subKey, theme, runId]);

	const cornerConfetti = useMemo(() => {
		const arr = [];
		const colors = sub.hues.map(h => `oklch(0.68 0.17 ${h})`).concat(['#fff']);
		const burst = (side: 'L' | 'R') => {
			for (let i = 0; i < 28; i++) {
				const baseAng = side === 'L' ? rand(-78, -20) : rand(-160, -102);
				const dist = rand(240, 540);
				const rad = (baseAng * Math.PI) / 180;
				const tx = Math.cos(rad) * dist;
				const ty = Math.sin(rad) * dist;
				const size = rand(6, 12);
				const dur = rand(1.1, 1.9);
				const delay = rand(0, 0.12);
				const col = colors[Math.floor(Math.random() * colors.length)];
				
				let pieceChar = '';
				let pieceStyle: React.CSSProperties = {};
				if (subKey === 'toan') {
					pieceChar = ['π', '√', '÷', '+', '∞', 'Σ'][Math.floor(Math.random() * 6)];
					pieceStyle = {
						fontFamily: "'IBM Plex Mono', monospace",
						fontWeight: 700,
						fontSize: `${(size + 6).toFixed(0)}px`,
						lineHeight: 1,
						color: col,
					};
				} else if (subKey === 'ly') {
					pieceStyle = {
						width: '3px',
						height: `${(size + 8).toFixed(0)}px`,
						background: col,
						borderRadius: '2px',
						boxShadow: `0 0 6px ${col}`,
					};
				} else {
					const round = Math.random() < 0.65;
					if (round) {
						pieceStyle = {
							width: `${size.toFixed(0)}px`,
							height: `${size.toFixed(0)}px`,
							borderRadius: '50%',
							background: col,
						};
					} else {
						pieceStyle = {
							width: `${size.toFixed(0)}px`,
							height: `${size.toFixed(0)}px`,
							borderRadius: '50%',
							background: 'transparent',
							border: `2px solid ${col}`,
						};
					}
				}

				arr.push({
					char: pieceChar,
					style: {
						position: 'fixed' as const,
						bottom: '6px',
						...(side === 'L' ? { left: '8px' } : { right: '8px' }),
						...pieceStyle,
						zIndex: 920,
						pointerEvents: 'none' as const,
						['--tx2' as any]: `${tx.toFixed(0)}px`,
						['--ty2' as any]: `${ty.toFixed(0)}px`,
						['--rot' as any]: `${rand(180, 900).toFixed(0)}deg`,
						animation: `conf ${dur}s ${delay}s cubic-bezier(.15,.6,.3,1) forwards`,
					}
				});
			}
		};
		burst('L');
		burst('R');
		return arr;
	}, [sub, subKey, runId]);

	const centerConfetti = useMemo(() => {
		const arr = [];
		const colors = sub.hues.map(h => `oklch(0.68 0.17 ${h})`).concat(['#fff']);
		for (let i = 0; i < 64; i++) {
			const ang = rand(0, 360) * Math.PI / 180;
			const dist = rand(180, 480);
			const tx = Math.cos(ang) * dist;
			const ty = Math.sin(ang) * dist;
			const size = rand(6, 13);
			const dur = rand(1.1, 2.0);
			const delay = rand(0, 0.15);
			const col = colors[Math.floor(Math.random() * colors.length)];

			let pieceChar = '';
			let pieceStyle: React.CSSProperties = {};
			if (subKey === 'toan') {
				pieceChar = ['π', '√', '÷', '+', '∞', 'Σ'][Math.floor(Math.random() * 6)];
				pieceStyle = {
					fontFamily: "'IBM Plex Mono', monospace",
					fontWeight: 700,
					fontSize: `${(size + 6).toFixed(0)}px`,
					lineHeight: 1,
					color: col,
				};
			} else if (subKey === 'ly') {
				pieceStyle = {
					width: '3px',
					height: `${(size + 8).toFixed(0)}px`,
					background: col,
					borderRadius: '2px',
					boxShadow: `0 0 6px ${col}`,
				};
			} else {
				const round = Math.random() < 0.65;
				if (round) {
					pieceStyle = {
						width: `${size.toFixed(0)}px`,
						height: `${size.toFixed(0)}px`,
						borderRadius: '50%',
						background: col,
					};
				} else {
					pieceStyle = {
						width: `${size.toFixed(0)}px`,
						height: `${size.toFixed(0)}px`,
						borderRadius: '50%',
						background: 'transparent',
						border: `2px solid ${col}`,
					};
				}
			}

			arr.push({
				char: pieceChar,
				style: {
					position: 'fixed' as const,
					top: '50%',
					left: '50%',
					...pieceStyle,
					zIndex: 940,
					pointerEvents: 'none' as const,
					['--tx2' as any]: `${tx.toFixed(0)}px`,
					['--ty2' as any]: `${ty.toFixed(0)}px`,
					['--rot' as any]: `${rand(180, 900).toFixed(0)}deg`,
					animation: `conf ${dur}s ${delay}s cubic-bezier(.1,.7,.3,1) forwards`,
				}
			});
		}
		return arr;
	}, [sub, subKey, runId]);

	const [customConfetti, setCustomConfetti] = useState<any[]>(() => cornerConfetti);

	const xpOrbs = useMemo(() => {
		const arr = [];
		const c = sub.ring;
		for (let i = 0; i < 10; i++) {
			const left = rand(30, 72).toFixed(0);
			const delay = (0.34 + i * 0.15 + rand(0, 0.06)).toFixed(2);
			const sz = rand(4, 7).toFixed(0);
			arr.push({
				style: {
					position: 'absolute' as const,
					bottom: '26px',
					left: `${left}%`,
					width: `${sz}px`,
					height: `${sz}px`,
					borderRadius: '50%',
					background: c,
					boxShadow: `0 0 8px ${c}`,
					opacity: 0,
					pointerEvents: 'none' as const,
					zIndex: 5,
					animation: `xpDrop .55s ${delay}s cubic-bezier(.4,0,.8,1) forwards`,
				}
			});
		}
		return arr;
	}, [sub, runId]);

	// 5. Dynamic CSS values & theme resolution
	const dark = theme === 'dark';
	const acc = dark ? sub.accD : sub.acc;

	const T = useMemo(() => {
		return dark
			? {
					bg: '#141416',
					sf: '#26262b',
					sf2: '#1c1c20',
					tx: '#ededee',
					mut: '#9b9ba4',
					mut2: '#7f7f89',
					bd: '#34343b',
					track: '#34343b',
					pageBgExtra:
						'radial-gradient(900px 540px at 12% -8%, oklch(0.4 0.1 275 / .3), transparent 60%), radial-gradient(760px 480px at 100% 0%, oklch(0.4 0.12 330 / .2), transparent 55%)',
					overlay: 'oklch(0.12 0.02 285 / .6)',
				}
			: {
					bg: '#f2f1ec',
					sf: '#ffffff',
					sf2: '#faf9f5',
					tx: '#2f2e2b',
					mut: '#7d7b73',
					mut2: '#9a988f',
					bd: '#e6e4dd',
					track: '#efece4',
					pageBgExtra:
						'radial-gradient(900px 540px at 12% -8%, oklch(0.66 0.16 264 / .12), transparent 60%), radial-gradient(760px 480px at 100% 0%, oklch(0.6 0.18 350 / .09), transparent 55%)',
					overlay: 'oklch(0.25 0.05 285 / .45)',
				};
	}, [dark]);

	const pat = useMemo(() => {
		if (subKey === 'toan') {
			const gl = dark ? 'rgba(255,255,255,.035)' : 'oklch(0.55 0.19 275 / .06)';
			return `repeating-linear-gradient(0deg, ${gl} 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, ${gl} 0 1px, transparent 1px 22px), `;
		} else if (subKey === 'ly') {
			const gl = dark ? 'rgba(255,255,255,.05)' : 'oklch(0.5 0.14 210 / .08)';
			return `repeating-radial-gradient(circle at 50% 26%, transparent 0 42px, ${gl} 42px 43px), `;
		} else {
			const gl = dark ? 'rgba(255,255,255,.045)' : 'oklch(0.6 0.19 345 / .08)';
			return `repeating-radial-gradient(circle at 88% 12%, transparent 0 20px, ${gl} 20px 21px), `;
		}
	}, [subKey, dark]);

	const vars = {
		'--acc': acc,
		'--accWeak': sub.accWeak,
		'--grad': sub.grad,
		'--ag': sub.ag,
		'--agz': sub.agz,
		'--ag2': sub.ag2,
		'--bg': T.bg,
		'--sf': T.sf,
		'--sf2': T.sf2,
		'--tx': T.tx,
		'--mut': T.mut,
		'--mut2': T.mut2,
		'--bd': T.bd,
		'--track': T.track,
		'--ring-color': sub.ring,
	} as React.CSSProperties;

	const cardInnerStyle: React.CSSProperties = {
		backgroundImage: `${pat} linear-gradient(${T.sf}, ${T.sf})`,
	};

	const ribbonText = isModeB
		? `${sub.label} · Kết quả`
		: `${sub.label} · Hoàn thành`;

	// Cụm 3 ô thống kê — DỮ LIỆU THẬT: số bước/câu, thời gian làm bài, độ chính xác.
	const statsDisplay = useMemo(() => {
		const stepLabel = subKey === 'toan' ? 'Câu' : 'Bước';
		const done = stepsDone ?? 0;
		const total = stepsTotal ?? 0;
		return [
			{ v: total > 0 ? `${done}/${total}` : `${done}`, l: stepLabel, c: sub.ring },
			{ v: formatElapsed(elapsedSeconds ?? 0), l: 'Thời gian', c: 'oklch(0.62 0.15 264)' },
			{ v: `${Math.round(score)}%`, l: 'Chính xác', c: 'oklch(0.6 0.15 145)' },
		];
	}, [subKey, sub, stepsDone, stepsTotal, elapsedSeconds, score]);

	// XP & Ring Calculations — chạy theo `progress` của animation, số đích là THẬT.
	const targetPct = score;
	const xpTargetValue = earnedXp; // XP thật vừa cộng

	const xpDisplay = Math.round(progress * xpTargetValue);
	const pctDisplay = Math.round(progress * targetPct);
	const xpTotal = Math.round(xpB + progress * xpTargetValue).toLocaleString(); // tổng XP thật chạy dần

	const C = 2 * Math.PI * 52;
	const ringOffset = (C * (1 - (progress * targetPct) / 100)).toFixed(1);

	// Thanh cấp độ theo ngưỡng THẬT: cấp L cần level²×100 XP để lên cấp kế tiếp.
	const curXp = xpB + progress * xpTargetValue; // tổng XP đang chạy
	const beforeNext = nextThresholdXp(lvlBefore); // ngưỡng để rời khỏi cấp hiện tại
	const crossed = isLvlUp && curXp >= beforeNext;
	// Đoạn cấp đang hiển thị: khi đã vượt ngưỡng thì chuyển sang khoe cấp mới.
	const displayLevel = crossed ? lvlAfter : lvlBefore;
	const segFloor = levelFloorXp(displayLevel);
	const segNext = nextThresholdXp(displayLevel);
	const segSpan = Math.max(1, segNext - segFloor);
	const barPct = Math.min(100, Math.max(0, ((curXp - segFloor) / segSpan) * 100));
	const barLeftLvl = displayLevel;
	const barRightLvl = displayLevel + 1;
	const barXpText = `${Math.round(Math.max(0, curXp - segFloor))} / ${segNext - segFloor} XP`;
	const barHint = crossed
		? 'Vượt mốc — lên cấp mới!'
		: ringDone
			? `Còn ${Math.max(0, Math.round(segNext - curXp))} XP nữa để lên cấp ${displayLevel + 1}`
			: 'Đang cộng XP…';

	const activeLabName = labName || 'bài thực hành';
	const activeQuizName = quizName || 'bài làm';
	const activeLevelTitle = levelTitle || '';

	// Render custom SVGs
	const renderMathIcon = () => (
		<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 7c1.2-1.3 2.6-1.8 5-1.8h11"></path>
			<path d="M9 5.5v13"></path>
			<path d="M15.5 5.5V15c0 2.2.9 3.5 2.8 3.5"></path>
		</svg>
	);

	const renderPhysicsIcon = () => (
		<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
			<circle cx="12" cy="12" r="1.4" fill="#fff"></circle>
			<ellipse cx="12" cy="12" rx="9" ry="3.6"></ellipse>
			<ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"></ellipse>
			<ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"></ellipse>
		</svg>
	);

	const renderChemistryIcon = () => (
		<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
			<path d="M9 3h6M10 3v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V3"></path>
			<path d="M7 14h10"></path>
		</svg>
	);

	return (
		<div className="celebration-overlay" style={vars} onClick={onClose}>
			{/* Ambient glow behind card */}
			<div className="celebration-overlay__ambient-glow"></div>

			{/* Floating background particles */}
			{dust.map((d, i) => (
				<div key={`d-${i}`} style={d.style}></div>
			))}
			{customConfetti.map((c, i) => (
				<div key={`c-${i}`} style={c.style}>
					{c.char}
				</div>
			))}

			{/* Card container */}
			<div 
				className={`celebration-overlay__card-outer ${shake ? 'shake' : ''}`} 
				onClick={(e) => e.stopPropagation()}
			>
				<div className="celebration-overlay__border-spin"></div>
				<div 
					className={`celebration-overlay__card-inner ${showLevel ? 'compact' : ''}`}
					style={cardInnerStyle}
				>
					<div className={`celebration-overlay__flash ${flash ? 'active' : ''}`}></div>
					<div className="celebration-overlay__ambient-orb-1"></div>
					<div className="celebration-overlay__ambient-orb-2"></div>

					{/* Twinkling stars & rotating motifs */}
					{stars.map((s, i) => (
						<div key={`s-${i}`} style={s.style}>✦</div>
					))}
					{motifs.map((m, i) => (
						<div key={`m-${i}`} style={m.style}>
							{m.char}
						</div>
					))}

					{/* Header ribbon */}
					<div className="celebration-overlay__header">
						<div className="celebration-overlay__header-line"></div>
						<div className="celebration-overlay__ribbon-text">{ribbonText}</div>
						<div className="celebration-overlay__header-line celebration-overlay__header-line--reverse"></div>
					</div>

					{/* Subject Icon (Hidden when level expander is active to save vertical space) */}
					<div className={`celebration-overlay__icon-area ${showLevel ? 'hidden' : ''}`}>
						<div className="celebration-overlay__icon-ring" style={{ animationDelay: '0.35s' }}></div>
						<div className="celebration-overlay__icon-ring" style={{ animationDelay: '0.6s' }}></div>
						<div className="celebration-overlay__icon-ring" style={{ animationDelay: '0.85s' }}></div>
						
						{/* Orbiting particles */}
						<div className="celebration-overlay__icon-orbit-1">
							<div className="celebration-overlay__icon-orbit-dot-1"></div>
						</div>
						<div className="celebration-overlay__icon-orbit-2">
							<div className="celebration-overlay__icon-orbit-dot-2"></div>
						</div>

						<div className="celebration-overlay__icon-wrap">
							{icon ? (
								<span style={{ fontSize: '38px', color: '#fff' }}>{icon}</span>
							) : isModeB ? (
								<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M20 6 9 17l-5-5"></path>
								</svg>
							) : subKey === 'toan' ? (
								renderMathIcon()
							) : subKey === 'ly' ? (
								renderPhysicsIcon()
							) : (
								renderChemistryIcon()
							)}
						</div>
					</div>

					{/* ── MODAL A BODY (Experiment Completion) ── */}
					{!isModeB && (
						<>
							<div className="celebration-overlay__title-wrap-a">
								<div className="celebration-overlay__title-a">
									{title || `Hoàn thành ${sub.word}!`}
								</div>
								<div className="celebration-overlay__title-shine-a"></div>
							</div>
							<div className="celebration-overlay__message-a">
								{message || (
									<>
										Bạn đã hoàn tất <b style={{ color: 'var(--tx)' }}>{activeLabName}</b>. Làm tốt lắm!
									</>
								)}
							</div>

							<button className="celebration-overlay__action-btn" onClick={onClose}>
								{closeLabel || 'Tiếp tục'}
								<div className="celebration-overlay__btn-shine"></div>
							</button>
						</>
					)}

					{/* ── MODAL B BODY (Submission & Score) ── */}
					{isModeB && (
						<>
							<div className="celebration-overlay__title-b">
								{title || 'Đã nộp bài!'}
							</div>
							<div className="celebration-overlay__message-b">
								Bài <b style={{ color: 'var(--tx)' }}>{activeQuizName}</b> đã chấm xong.
							</div>

							{/* Real stats strip: số bước/câu · thời gian · độ chính xác (dữ liệu thật) */}
							<div
								style={{
									display: 'flex',
									gap: '10px',
									justifyContent: 'center',
									margin: '4px 0 14px',
									flexWrap: 'wrap',
								}}
							>
								{statsDisplay.map((st, i) => (
									<div
										key={`st-${i}`}
										style={{
											flex: '1 1 0',
											minWidth: '84px',
											maxWidth: '130px',
											padding: '8px 10px',
											borderRadius: '12px',
											background: 'var(--sf2)',
											border: '1px solid var(--bd)',
											textAlign: 'center',
										}}
									>
										<div style={{ fontSize: '17px', fontWeight: 800, color: st.c, lineHeight: 1.1 }}>
											{st.v}
										</div>
										<div style={{ fontSize: '11px', color: 'var(--mut)', marginTop: '3px' }}>
											{st.l}
										</div>
									</div>
								))}
							</div>

							{/* Circular Score and XP Display */}
							<div className="celebration-overlay__stats-container-b">
								{/* Percent correctly answered circle */}
								<div className="celebration-overlay__score-circle-wrap">
									<svg width="118" height="118" viewBox="0 0 118 118" className="celebration-overlay__score-svg">
										<circle cx="59" cy="59" r="52" fill="none" stroke="var(--track)" strokeWidth="10"></circle>
										<circle 
											cx="59" 
											cy="59" 
											r="52" 
											fill="none" 
											stroke={sub.ring} 
											strokeWidth="10" 
											strokeLinecap="round" 
											strokeDasharray={`${C.toFixed(1)}`} 
											strokeDashoffset={ringOffset}
										></circle>
									</svg>
									<div className="celebration-overlay__score-circle-text">
										<div className={`celebration-overlay__score-number ${xpPop ? 'pop' : ''}`}>
											{pctDisplay}%
										</div>
										<div className="celebration-overlay__score-label">ĐÚNG</div>
									</div>
									<div className={`celebration-overlay__score-sweep ${ringDone ? 'active' : ''}`}></div>
								</div>

								{/* XP rewards panel */}
								<div className="celebration-overlay__xp-info">
									<div className="celebration-overlay__xp-label">Điểm thưởng</div>
									<div className="celebration-overlay__xp-value-wrap">
										<div className={`celebration-overlay__xp-value ${xpPop ? 'pop' : ''}`}>
											+{xpDisplay}
										</div>
										<div className="celebration-overlay__xp-unit">XP</div>
										<div className={`celebration-overlay__xp-sparkle ${sparkOn ? 'active' : ''}`}></div>
										{xpFloat && (
											<div className="celebration-overlay__xp-float-bubble">
												+{xpTargetValue} XP
											</div>
										)}
									</div>
									<div className="celebration-overlay__xp-total-text">
										Tổng: <b style={{ color: 'var(--tx)' }}>{xpTotal}</b> XP
									</div>
								</div>
							</div>

							{/* XP Level Progress Bar */}
							<div className="celebration-overlay__progress-area-b">
								{xpOrbs.map((ob, i) => (
									<div key={`ob-${i}`} style={ob.style}></div>
								))}
								<div className="celebration-overlay__progress-header-b">
									<span className="celebration-overlay__progress-level-left">
										CẤP {barLeftLvl}
									</span>
									<span>{barXpText}</span>
									<span>CẤP {barRightLvl}</span>
								</div>
								<div className="celebration-overlay__progress-track-b">
									<div 
										className="celebration-overlay__progress-fill-b"
										style={{ width: `${barPct.toFixed(1)}%` }}
									></div>
									<div className={`celebration-overlay__progress-flash ${crossed ? 'active' : ''}`}></div>
									<div 
										className="celebration-overlay__progress-tip"
										style={{ 
											left: `${barPct.toFixed(1)}%`,
											opacity: counting ? 1 : 0
										}}
									></div>
								</div>
								<div className="celebration-overlay__progress-hint-b">{barHint}</div>
							</div>

							{/* ── Level Up expanded state ── */}
							{showLevel && (
								<div className="celebration-overlay__level-expand-wrap">
									<div className="celebration-overlay__level-up-body">
										<div className="celebration-overlay__level-up-container">
											<div className="celebration-overlay__badge-outer">
												<div className="celebration-overlay__rays-glow"></div>
												<div className="celebration-overlay__dashed-circle"></div>
												<div className="celebration-overlay__sparkle-star-1">✦</div>
												<div className="celebration-overlay__sparkle-star-2">✦</div>
												<div className="celebration-overlay__sparkle-star-3">✦</div>
												
												{showNewBadge && (
													<div className="celebration-overlay__new-badge">
														<div className="celebration-overlay__badge-content">
															<div className="celebration-overlay__badge-label">CẤP</div>
															<div className="celebration-overlay__badge-number">{lvlAfter}</div>
														</div>
														<div className="celebration-overlay__badge-shine-effect"></div>
													</div>
												)}
												{showOldBadge && (
													<div className="celebration-overlay__old-badge">
														<div className="celebration-overlay__badge-content">
															<div className="celebration-overlay__badge-label" style={{ opacity: 0.8 }}>CẤP</div>
															<div className="celebration-overlay__old-badge-number">{lvlBefore}</div>
														</div>
													</div>
												)}
											</div>

											{/* Level text */}
											<div className="celebration-overlay__level-title-wrap">
												<span className="celebration-overlay__level-deco-leaf">❧</span>
												<span className="celebration-overlay__level-title-text">
													Lên cấp {lvlAfter}{activeLevelTitle ? ` — ${activeLevelTitle}` : ''}!
												</span>
												<span className="celebration-overlay__level-deco-leaf celebration-overlay__level-deco-leaf--reverse">❧</span>
											</div>

											{/* Danh hiệu cấp độ mới (thật) */}
											{activeLevelTitle && (
												<div className="celebration-overlay__unlock-chip">
													<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="celebration-overlay__unlock-icon">
														<path d="M8 21h8"></path>
														<path d="M12 17v4"></path>
														<path d="M7 4h10v4a5 5 0 0 1-10 0z"></path>
														<path d="M17 5h2a2 2 0 0 1 0 4h-2"></path>
														<path d="M7 5H5a2 2 0 0 0 0 4h2"></path>
													</svg>
													Danh hiệu mới: <b className="celebration-overlay__unlock-highlight">{activeLevelTitle}</b>
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							<button className="celebration-overlay__action-btn" onClick={onClose} style={{ marginTop: '22px' }}>
								{closeLabel || 'Xong'}
								<div className="celebration-overlay__btn-shine"></div>
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default CelebrationOverlay;
