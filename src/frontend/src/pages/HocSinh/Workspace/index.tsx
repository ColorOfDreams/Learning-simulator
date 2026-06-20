import React, { useState, useMemo, useCallback } from 'react';
import { history, useLocation } from 'umi';
import StudentLayout from '../components/StudentLayout';
import ProjectileSimulation from '@simulations/physics/SIM-02-projectile';
import './index.less';

// ── Types ──
type SubjectKey = 'physics' | 'math' | 'chem';

interface ChatMessage {
	role: 'ai' | 'user';
	text: string;
}

// ── Subject metadata ──
const SUBJECT_META: Record<SubjectKey, { label: string; title: string; tutor: string; className: string }> = {
	physics: { label: 'Vật lý', title: 'Chuyển động ném xiên', tutor: 'Trợ lý thí nghiệm AI', className: 'physics' },
	math: { label: 'Toán', title: 'Hàm bậc hai', tutor: 'Trợ lý Toán AI', className: 'math' },
	chem: { label: 'Hóa học', title: 'Chuẩn độ Axit-Bazơ', tutor: 'Trợ lý thí nghiệm AI', className: 'chem' },
};

// ── Initial chat messages ──
const INITIAL_CHATS: Record<SubjectKey, ChatMessage[]> = {
	physics: [
		{ role: 'ai', text: 'Ở góc 45°, bạn gần đạt tầm xa tối đa. Bạn nghĩ điều gì xảy ra nếu tăng góc lên 60°?' },
		{ role: 'user', text: 'Tầm xa sẽ ngắn hơn?' },
		{ role: 'ai', text: 'Đúng hướng! Kéo thanh trượt góc và quan sát số tầm xa — sau đó để ý phần nào của công thức thay đổi.' },
	],
	math: [
		{ role: 'ai', text: 'Thử tăng a — parabol sẽ hẹp hơn. Điều gì không thay đổi?' },
		{ role: 'user', text: 'Đỉnh parabol?' },
		{ role: 'ai', text: 'Chính xác — a kiểm soát độ rộng, không phải vị trí đỉnh. Quan sát tốt!' },
	],
	chem: [
		{ role: 'ai', text: 'Quan sát pH — nó đang tăng chậm. Điều gì xảy ra ngay tại điểm tương đương?' },
		{ role: 'user', text: 'Nó tăng nhanh?' },
		{ role: 'ai', text: 'Đúng vậy. Thêm vài mL NaOH nữa và xem đường cong dốc như thế nào.' },
	],
};

// ── Quiz data ──
const QUIZZES: Record<SubjectKey, { q: string; opts: { k: string; t: string }[]; correct: string }> = {
	physics: {
		q: 'Bỏ qua sức cản không khí, góc ném nào cho tầm xa tối đa?',
		opts: [{ k: 'a', t: '30°' }, { k: 'b', t: '45°' }, { k: 'c', t: '75°' }],
		correct: 'b',
	},
	math: {
		q: 'Nghiệm của y = x² − 2x − 3 là?',
		opts: [{ k: 'a', t: 'x = −1 và x = 3' }, { k: 'b', t: 'x = 1 và x = −3' }, { k: 'c', t: 'x = 0 và x = 3' }],
		correct: 'a',
	},
	chem: {
		q: 'Tại điểm tương đương của chuẩn độ axit mạnh-bazơ mạnh, pH khoảng:',
		opts: [{ k: 'a', t: 'pH 1–2' }, { k: 'b', t: 'pH 7 (trung tính)' }, { k: 'c', t: 'pH 12–13' }],
		correct: 'b',
	},
};

// ── Chem steps ──
const CHEM_STEPS = [
	{ n: 1, title: 'Thêm chất chỉ thị', sub: 'Phenolphtalein đã thêm' },
	{ n: 2, title: 'Chuẩn độ với NaOH', sub: 'Đang tiến hành…' },
	{ n: 3, title: 'Quan sát đổi màu', sub: 'Tại điểm cuối' },
	{ n: 4, title: 'Ghi nhận điểm tương đương', sub: '' },
];

const Workspace: React.FC = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const subject = (params.get('subject') || 'physics') as SubjectKey;
	const meta = SUBJECT_META[subject] || SUBJECT_META.physics;

	// Physics params
	const [phAngle, setPhAngle] = useState(45);
	const [phVel, setPhVel] = useState(20);
	const [phGrav, setPhGrav] = useState(9.8);
	const [phAir, setPhAir] = useState(false);
	const [phVec, setPhVec] = useState(true);
	const [isPhPlaying, setIsPhPlaying] = useState(false);
	const [isPhSlow, setIsPhSlow] = useState(false);

	// Math params
	const [mA, setMA] = useState(1);
	const [mB, setMB] = useState(-2);
	const [mC, setMC] = useState(-3);

	// Chem params
	const [chemStep, setChemStep] = useState(2);
	const [chemPh, setChemPh] = useState(8.6);

	// Chat
	const [chats, setChats] = useState<Record<SubjectKey, ChatMessage[]>>(INITIAL_CHATS);
	const [chatInput, setChatInput] = useState('');

	// Quiz
	const [quizSel, setQuizSel] = useState<Record<SubjectKey, string | null>>({ physics: null, math: null, chem: null });

	// ── Physics calculations ──
	const physicsCalc = useMemo(() => {
		const rad = (phAngle * Math.PI) / 180;
		const range = (phVel * phVel * Math.sin(2 * rad)) / phGrav;
		const maxH = Math.pow(phVel * Math.sin(rad), 2) / (2 * phGrav);
		const time = (2 * phVel * Math.sin(rad)) / phGrav;
		return { range: range.toFixed(1), maxH: maxH.toFixed(1), time: time.toFixed(1) };
	}, [phAngle, phVel, phGrav]);

	// ── Math calculations ──
	const mathCalc = useMemo(() => {
		const a = Math.abs(mA) < 0.1 ? (mA < 0 ? -0.1 : 0.1) : mA;
		const f = (x: number) => { const r = Math.round(x * 10) / 10; return Object.is(r, -0) ? 0 : r; };
		const vx = -mB / (2 * a);
		const vy = mC - (mB * mB) / (4 * a);
		const disc = mB * mB - 4 * a * mC;
		let roots = 'không có nghiệm thực';
		if (disc >= 0) {
			const sq = Math.sqrt(disc);
			const r1 = (-mB - sq) / (2 * a);
			const r2 = (-mB + sq) / (2 * a);
			roots = `x = ${f(Math.min(r1, r2))}, ${f(Math.max(r1, r2))}`;
		}
		return { vertex: `(${f(vx)}, ${f(vy)})`, roots, axis: `x = ${f(vx)}` };
	}, [mA, mB, mC]);

	// ── Chat ──
	const sendChat = useCallback(() => {
		const t = chatInput.trim();
		if (!t) return;
		setChats((prev) => ({
			...prev,
			[subject]: [...prev[subject], { role: 'user' as const, text: t }],
		}));
		setChatInput('');
		const replies = [
			'Câu hỏi hay — thử điều chỉnh thông số và quan sát kết quả thay đổi, rồi cho tôi biết bạn nhận thấy gì.',
			'Hãy nghĩ xem biến nào ảnh hưởng. Bạn muốn gợi ý, hay thử nghiệm trong mô phỏng?',
			'Suy nghĩ tốt lắm. Hãy kiểm chứng: thay đổi từng giá trị và so sánh kết quả.',
			'Điều đó liên quan đến công thức bên dưới — xem phần nào thay đổi khi bạn kéo thanh trượt.',
		];
		setTimeout(() => {
			const r = replies[Math.floor(Math.random() * replies.length)];
			setChats((prev) => ({
				...prev,
				[subject]: [...prev[subject], { role: 'ai' as const, text: r }],
			}));
		}, 750);
	}, [chatInput, subject]);

	// ── Quiz ──
	const pickQuiz = useCallback(
		(k: string) => {
			if (quizSel[subject]) return;
			setQuizSel((prev) => ({ ...prev, [subject]: k }));
		},
		[subject, quizSel],
	);

	// ── Reset ──
	const resetParams = useCallback(() => {
		if (subject === 'physics') {
			setPhAngle(45);
			setPhVel(20);
			setPhGrav(9.8);
			setPhAir(false);
			setPhVec(true);
			setIsPhPlaying(false);
			setIsPhSlow(false);
		}
		else if (subject === 'math') { setMA(1); setMB(-2); setMC(-3); }
		else { setChemStep(1); setChemPh(4.0); }
	}, [subject]);

	const addNaOH = useCallback(() => {
		let ph = Math.min(12, chemPh + (chemPh > 7 ? 1.0 : 0.6));
		let step = ph >= 8.2 ? (ph >= 10 ? 4 : 3) : 2;
		setChemPh(ph);
		setChemStep(step);
	}, [chemPh]);

	const quiz = QUIZZES[subject];
	const sel = quizSel[subject];
	const f = (x: number) => { const r = Math.round(x * 10) / 10; return Object.is(r, -0) ? 0 : r; };

	const formulaText = subject === 'physics'
		? 'y = v·sinθ·t − ½·g·t²'
		: subject === 'math'
			? `y = ${f(mA)}x² ${mB >= 0 ? '+' : '−'} ${Math.abs(f(mB))}x ${mC >= 0 ? '+' : '−'} ${Math.abs(f(mC))}`
			: 'HCl + NaOH → NaCl + H₂O';

	const centerTitle = subject === 'physics' ? 'Quỹ đạo' : subject === 'math' ? 'Đồ thị' : 'Mô phỏng phản ứng';
	const actionLabel = subject === 'physics' ? 'Phóng' : subject === 'math' ? 'Vẽ' : 'Phát lại';

	return (
		<StudentLayout hideSidebar>
			<div className="stu-ws">
				{/* Subheader */}
				<div className="stu-ws__subheader">
					<div className="stu-ws__subheader-left">
						<div className="stu-ws__back" onClick={() => history.push('/hoc-sinh')}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6862" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M15 6l-6 6 6 6" />
							</svg>
						</div>
						<div className={`stu-ws__subject-pill stu-ws__subject-pill--${meta.className}`}>{meta.label}</div>
						<span className="stu-ws__breadcrumb-sep">/</span>
						<span className="stu-ws__breadcrumb-title">{meta.title}</span>
					</div>
					<div className="stu-ws__live-badge">
						<div className="stu-ws__live-dot" />
						Trực tiếp · cập nhật khi tương tác
					</div>
					<div className="stu-ws__subheader-actions">
						<div className="stu-ws__btn-secondary" onClick={resetParams}>Đặt lại</div>
						<div className="stu-ws__btn-primary">Lưu & Nộp</div>
					</div>
				</div>

				{/* 3-Panel Layout */}
				<div className="stu-ws__panels">
					{/* LEFT: Parameters */}
					<div className="stu-ws__left scl">
						{/* Physics Params */}
						{subject === 'physics' && (
							<>
								<div className="stu-ws__section-label">Thông số</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>Góc ném</span><span className="stu-ws__param-val">{phAngle}°</span></div>
									<input type="range" min={0} max={90} step={1} value={phAngle} onChange={(e) => setPhAngle(+e.target.value)} />
								</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>Vận tốc ban đầu</span><span className="stu-ws__param-val">{phVel} m/s</span></div>
									<input type="range" min={1} max={40} step={1} value={phVel} onChange={(e) => setPhVel(+e.target.value)} />
								</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>Gia tốc trọng trường</span><span className="stu-ws__param-val">{f(phGrav)} m/s²</span></div>
									<input type="range" min={1} max={20} step={0.1} value={phGrav} onChange={(e) => setPhGrav(+e.target.value)} />
								</div>
								<div className="stu-ws__toggle-row" onClick={() => setPhAir(!phAir)}>
									<span>Sức cản không khí</span>
									<div className={`stu-ws__toggle ${phAir ? 'stu-ws__toggle--on' : ''}`}>
										<div className="stu-ws__toggle-knob" />
									</div>
								</div>
								<div className="stu-ws__toggle-row" onClick={() => setPhVec(!phVec)}>
									<span>Hiện vector vận tốc</span>
									<div className={`stu-ws__toggle ${phVec ? 'stu-ws__toggle--on' : ''}`}>
										<div className="stu-ws__toggle-knob" />
									</div>
								</div>
								<div className="stu-ws__results">
									<div className="stu-ws__results-title">Kết quả trực tiếp</div>
									<div className="stu-ws__result-row"><span>Tầm xa</span><span className="stu-ws__result-val stu-ws__result-val--accent">{physicsCalc.range} m</span></div>
									<div className="stu-ws__result-row"><span>Độ cao tối đa</span><span className="stu-ws__result-val">{physicsCalc.maxH} m</span></div>
									<div className="stu-ws__result-row"><span>Thời gian bay</span><span className="stu-ws__result-val">{physicsCalc.time} s</span></div>
								</div>
							</>
						)}

						{/* Math Params */}
						{subject === 'math' && (
							<>
								<div className="stu-ws__section-label">Thông số</div>
								<div className="stu-ws__formula-box">y = a·x² + b·x + c</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>a</span><span className="stu-ws__param-val">{f(mA).toFixed(1)}</span></div>
									<input type="range" min={-3} max={3} step={0.1} value={mA} onChange={(e) => setMA(+e.target.value)} />
								</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>b</span><span className="stu-ws__param-val">{f(mB).toFixed(1)}</span></div>
									<input type="range" min={-6} max={6} step={0.1} value={mB} onChange={(e) => setMB(+e.target.value)} />
								</div>
								<div className="stu-ws__param">
									<div className="stu-ws__param-row"><span>c</span><span className="stu-ws__param-val">{f(mC).toFixed(1)}</span></div>
									<input type="range" min={-6} max={6} step={0.1} value={mC} onChange={(e) => setMC(+e.target.value)} />
								</div>
								<div className="stu-ws__results">
									<div className="stu-ws__results-title">Thông tin</div>
									<div className="stu-ws__result-row"><span>Đỉnh</span><span className="stu-ws__result-val stu-ws__result-val--accent">{mathCalc.vertex}</span></div>
									<div className="stu-ws__result-row"><span>Nghiệm</span><span className="stu-ws__result-val">{mathCalc.roots}</span></div>
									<div className="stu-ws__result-row"><span>Trục đối xứng</span><span className="stu-ws__result-val">{mathCalc.axis}</span></div>
								</div>
							</>
						)}

						{/* Chem Steps */}
						{subject === 'chem' && (
							<>
								<div className="stu-ws__section-label">Các bước hướng dẫn</div>
								<div className="stu-ws__steps">
									{CHEM_STEPS.map((st) => {
										const done = st.n < chemStep;
										const active = st.n === chemStep;
										return (
											<div key={st.n} className="stu-ws__step">
												<div className={`stu-ws__step-circle ${done ? 'stu-ws__step-circle--done' : active ? 'stu-ws__step-circle--active' : ''}`}>
													{done ? '✓' : st.n}
												</div>
												<div>
													<div className={`stu-ws__step-title ${done || active ? '' : 'stu-ws__step-title--muted'}`}>{st.title}</div>
													<div className={`stu-ws__step-sub ${active ? 'stu-ws__step-sub--accent' : ''}`}>{st.sub}</div>
												</div>
											</div>
										);
									})}
								</div>
								<div className="stu-ws__chem-actions">
									<div className="stu-ws__btn-primary stu-ws__btn-full" onClick={addNaOH}>Thêm 1 mL NaOH ›</div>
									<div className="stu-ws__btn-outline stu-ws__btn-full" onClick={() => { setChemPh(10.5); setChemStep(4); }}>Tự động chuẩn độ</div>
								</div>
								<div className="stu-ws__watch">
									<div className="stu-ws__results-title">Quan sát</div>
									<div className="stu-ws__watch-item">
										<div className="stu-ws__watch-dot stu-ws__watch-dot--pink" />
										Màu chuyển sang hồng
									</div>
									<div className="stu-ws__watch-item stu-ws__watch-item--muted">
										<div className="stu-ws__watch-dot stu-ws__watch-dot--empty" />
										Bọt khí (N/A)
									</div>
								</div>
							</>
						)}
					</div>

					{/* CENTER: Simulation */}
					<div className="stu-ws__center">
						<div className="stu-ws__center-header">
							<span className="stu-ws__center-title">{centerTitle}</span>
							<div className="stu-ws__center-actions">
								{subject === 'physics' ? (
									<>
										<div
											className="stu-ws__center-btn stu-ws__center-btn--primary"
											onClick={() => setIsPhPlaying(prev => !prev)}
										>
											{isPhPlaying ? 'Tạm dừng' : 'Phóng'}
										</div>
										<div
											className={`stu-ws__center-btn ${isPhSlow ? 'stu-ws__center-btn--active' : ''}`}
											onClick={() => setIsPhSlow(prev => !prev)}
										>
											Chậm
										</div>
									</>
								) : (
									<>
										<div className="stu-ws__center-btn stu-ws__center-btn--primary">{actionLabel}</div>
										<div className="stu-ws__center-btn">Chậm</div>
									</>
								)}
							</div>
						</div>

						{/* Simulation mount point */}
						<div className={`stu-ws__sim-slot stu-ws__sim-slot--${meta.className}`} id={`sim-mount-${subject}`} data-sim={subject}>
							<div className={`stu-ws__sim-pill stu-ws__sim-pill--${meta.className}`}>
								{subject === 'physics' && `θ ${phAngle}°  ·  v ${phVel} m/s  ·  g ${f(phGrav)}`}
								{subject === 'math' && `a ${f(mA)}  ·  b ${f(mB)}  ·  c ${f(mC)}`}
								{subject === 'chem' && `pH ${f(chemPh)}  ·  bước ${chemStep}/4`}
							</div>
							{subject === 'physics' ? (
								<ProjectileSimulation
									config={{
										simulation_id: 'SIM-02',
										subject: 'physics',
										topic: 'projectile',
										parameters: [
											{ key: 'theta', value: phAngle, unit: '°', label: 'Góc ném' },
											{ key: 'v0', value: phVel, unit: 'm/s', label: 'Vận tốc đầu' },
											{ key: 'g', value: phGrav, unit: 'm/s²', label: 'Gia tốc trọng trường' },
											{ key: 'airResistance', value: phAir ? 1 : 0, unit: '', label: 'Sức cản không khí' },
											{ key: 'showVectors', value: phVec ? 1 : 0, unit: '', label: 'Hiện vector vận tốc' },
										],
									}}
									isPlaying={isPhPlaying}
									isSlow={isPhSlow}
									onAnimationEnd={() => setIsPhPlaying(false)}
								/>
							) : (
								<div className="stu-ws__sim-placeholder">
									<div className="stu-ws__sim-icon">
										{subject === 'math' && (
											<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
												<path d="M4 4v16h16" /><path d="M7 16c3-9 7-9 10 0" />
											</svg>
										)}
										{subject === 'chem' && (
											<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
												<path d="M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3" />
											</svg>
										)}
									</div>
									<div className="stu-ws__sim-label">Điểm gắn Three.js</div>
									<div className="stu-ws__sim-id">#{`sim-mount-${subject}`}</div>
									<div className="stu-ws__sim-hint">
										lắng nghe → sự kiện "scilab:params"
									</div>
								</div>
							)}
						</div>

						<div className="stu-ws__formula-bar">{formulaText}</div>
					</div>

					{/* RIGHT: AI Tutor + Quiz */}
					<div className="stu-ws__right">
						{/* Tutor header */}
						<div className="stu-ws__tutor-header">
							<div className="stu-ws__tutor-icon">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 3v2M12 19v2M3 12h2M19 12h2" />
								</svg>
							</div>
							<span className="stu-ws__tutor-name">{meta.tutor}</span>
							<div className="stu-ws__tutor-live" />
						</div>

						{/* Chat messages */}
						<div className="stu-ws__chat scl">
							{(chats[subject] || []).map((m, i) => (
								<div key={i} className={`stu-ws__chat-msg ${m.role === 'user' ? 'stu-ws__chat-msg--user' : 'stu-ws__chat-msg--ai'}`}>
									{m.text}
								</div>
							))}
						</div>

						{/* Chat input */}
						<div className="stu-ws__chat-input-row">
							<input
								className="stu-ws__chat-input"
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && sendChat()}
								placeholder="Đặt câu hỏi…"
							/>
							<div className="stu-ws__chat-send" onClick={sendChat}>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							</div>
						</div>

						{/* Quiz */}
						<div className="stu-ws__quiz">
							<div className="stu-ws__quiz-header">
								<span className="stu-ws__quiz-badge">AI QUIZ</span>
								<span className="stu-ws__quiz-count">Câu 1 / 3</span>
							</div>
							<div className="stu-ws__quiz-question">{quiz.q}</div>
							<div className="stu-ws__quiz-options">
								{quiz.opts.map((o) => {
									const isSel = sel === o.k;
									const isCorrect = o.k === quiz.correct;
									let optClass = '';
									if (!sel) optClass = '';
									else if (isCorrect) optClass = 'stu-ws__quiz-opt--correct';
									else if (isSel) optClass = 'stu-ws__quiz-opt--wrong';
									else optClass = 'stu-ws__quiz-opt--dimmed';

									return (
										<div key={o.k} className={`stu-ws__quiz-opt ${optClass}`} onClick={() => pickQuiz(o.k)}>
											<div className={`stu-ws__quiz-radio ${isCorrect && sel ? 'stu-ws__quiz-radio--correct' : ''} ${isSel && !isCorrect ? 'stu-ws__quiz-radio--wrong' : ''}`} />
											{o.t}
										</div>
									);
								})}
							</div>
							{sel && (
								<div className={`stu-ws__quiz-feedback ${sel === quiz.correct ? 'stu-ws__quiz-feedback--correct' : 'stu-ws__quiz-feedback--wrong'}`}>
									{sel === quiz.correct
										? '✓  Chính xác! +40 XP — làm tốt lắm.'
										: 'Chưa đúng — đáp án đúng đã được tô sáng.'}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</StudentLayout>
	);
};

export default Workspace;
