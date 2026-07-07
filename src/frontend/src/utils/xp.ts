// Công thức XP / cấp độ — MIRROR đúng logic backend (users.controller.ts):
//   calcLevel(xp) = floor(sqrt(xp / 100)) + 1
//   ngưỡng lên cấp kế tiếp của "level" = level² × 100  (nextThreshold)
//   XP tối thiểu để ĐANG ở "level"                    = (level-1)² × 100  (levelFloor)
//   getLevelTitle: bảng danh hiệu theo cấp
// Dùng chung cho modal chúc mừng + các nơi hiển thị tiến trình, tránh mỗi
// nơi tự chế số rồi lệch với backend.

export function calcLevel(xp: number): number {
	return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

// XP tối thiểu để đạt (đang ở) cấp `level`.
export function levelFloorXp(level: number): number {
	const l = Math.max(1, level);
	return (l - 1) * (l - 1) * 100;
}

// XP cần đạt để lên cấp kế tiếp (rời khỏi `level`).
export function nextThresholdXp(level: number): number {
	const l = Math.max(1, level);
	return l * l * 100;
}

export function getLevelTitle(level: number): string {
	if (level <= 3) return 'Học sinh mới';
	if (level <= 6) return 'Nhà thí nghiệm';
	if (level <= 10) return 'Nhà khoa học tập sự';
	return 'Nhà khoa học';
}

export interface CelebrationData {
	score: number; // % đúng của quiz (0-100)
	xpEarned: number; // XP thật vừa cộng
	xpBefore: number; // tổng XP trước khi cộng
	xpAfter: number; // tổng XP sau khi cộng
	levelBefore: number;
	levelAfter: number;
	levelTitle: string; // danh hiệu ứng với levelAfter
	stepsDone: number; // số bước/câu đã hoàn thành thật
	stepsTotal: number;
	elapsedSeconds: number; // thời lượng thật từ lúc mở lab tới lúc nộp
}

// Dựng payload dữ liệu thật cho CelebrationOverlay từ trạng thái user hiện tại
// + kết quả quiz. Dùng chung cho cả Workspace lẫn AiQuizTab để không phân kỳ.
export function buildCelebrationData(params: {
	score: number;
	xpEarned: number;
	xpBefore: number;
	stepsDone: number;
	stepsTotal: number;
	elapsedSeconds: number;
}): CelebrationData {
	const xpBefore = Math.max(0, Math.round(params.xpBefore));
	const xpEarned = Math.max(0, Math.round(params.xpEarned));
	const xpAfter = xpBefore + xpEarned;
	const levelBefore = calcLevel(xpBefore);
	const levelAfter = calcLevel(xpAfter);
	return {
		score: params.score,
		xpEarned,
		xpBefore,
		xpAfter,
		levelBefore,
		levelAfter,
		levelTitle: getLevelTitle(levelAfter),
		stepsDone: params.stepsDone,
		stepsTotal: params.stepsTotal,
		elapsedSeconds: Math.max(0, Math.round(params.elapsedSeconds)),
	};
}

// Format giây → "M:SS" (hoặc "H:MM:SS" nếu ≥ 1 giờ).
export function formatElapsed(totalSeconds: number): string {
	const s = Math.max(0, Math.round(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const pad = (n: number) => n.toString().padStart(2, '0');
	if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
	return `${m}:${pad(sec)}`;
}
