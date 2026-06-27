import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateAiQuiz } from '@/services/ai/api';
import CelebrationOverlay from '@/components/CelebrationOverlay';
import { completeActivity, completeLabSession, getUserInfo } from '@/services/base/api';
import { useModel } from 'umi';
import '../../HocSinh/Workspace/index.less';

export type DynQuestion = { q: string; opts: Array<{ k: string; t: string }>; correct: string; explanation: string };

const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface Props {
	simId: string;
	subject?: string;
	title?: string;
}

const AiQuizTab: React.FC<Props> = ({ simId, subject = 'physics', title = 'Thí nghiệm tùy chỉnh' }) => {
	const [dynQuizState, setDynQuizState] = useState<'setup' | 'loading' | 'active' | 'done'>('setup');
	const [dynQuizCount, setDynQuizCount] = useState<3 | 5 | 10>(5);
	const [dynQuestions, setDynQuestions] = useState<DynQuestion[]>([]);
	const [dynCurrent, setDynCurrent] = useState(0);
	const [dynAnswers, setDynAnswers] = useState<Record<number, string>>({});
	const [dynUsedLlm, setDynUsedLlm] = useState(false);
	const [showCelebration, setShowCelebration] = useState(false);
	const xpAwardedRef = useRef(false);
	const { setInitialState } = useModel('@@initialState');

	useEffect(() => {
		if (dynQuizState === 'done' && dynQuestions.length > 0 && !xpAwardedRef.current) {
			xpAwardedRef.current = true;
			const correct = dynQuestions.filter((q, i) => dynAnswers[i] === q.correct).length;
			const pct = dynQuestions.length > 0 ? Math.round((correct / dynQuestions.length) * 100) : 0;
			const xpEarned = correct * 10;
			completeLabSession({
				simulationId: simId || 'default',
				simulationTitle: title || 'Thí nghiệm tùy chỉnh',
				subject,
				score: pct,
				totalQuestions: dynQuestions.length,
				correctAnswers: correct,
			}).catch(() => {});
			if (xpEarned > 0) {
				completeActivity(xpEarned)
					.then(() => {
						getUserInfo().then((res) => {
							const user = res.data?.data || res.data;
							setInitialState((s: any) => ({ ...s, currentUser: user }));
						});
					})
					.catch(() => {});
			}
		}
		if (dynQuizState !== 'done') {
			xpAwardedRef.current = false;
		}
	}, [dynQuizState]);

	const [printWithAnswers, setPrintWithAnswers] = useState(true);
	const [showPrintMenu, setShowPrintMenu] = useState(false);

	const startDynQuiz = useCallback(async () => {
		setDynQuizState('loading');
		setShowCelebration(false);
		setDynCurrent(0);
		setDynAnswers({});
		try {
			const res = await generateAiQuiz({
				simulationId: simId || 'default',
				subject,
				count: dynQuizCount,
			});
			const data = res?.data?.data;
			if (data?.questions?.length > 0) {
				setDynQuestions(data.questions);
				setDynUsedLlm(data.used_llm ?? false);
				setDynQuizState('active');
			} else {
				setDynQuizState('setup');
			}
		} catch {
			setDynQuizState('setup');
		}
	}, [simId, subject, dynQuizCount]);

	const pickDynAnswer = useCallback(
		(idx: number, key: string) => {
			if (dynAnswers[idx] !== undefined) return;
			setDynAnswers((prev) => ({ ...prev, [idx]: key }));
		},
		[dynAnswers],
	);

	const triggerPrint = useCallback(
		(withAnswers: boolean) => {
			setPrintWithAnswers(withAnswers);
			setShowPrintMenu(false);

			const questionsHtml =
				dynQuestions.length === 0
					? `<div class="print-empty">Chưa có câu hỏi để in. Hãy tạo bộ câu hỏi trước.</div>`
					: dynQuestions
							.map(
								(q, i) => `
								<section class="print-question">
									<div class="print-q-text"><b>Câu ${i + 1}:</b> ${escapeHtml(q.q)}</div>
									<div class="print-opts">
										${q.opts
											.map(
												(o) => `
													<div class="print-opt">
														<b>${escapeHtml(o.k).toUpperCase()}.</b> ${escapeHtml(o.t)}
													</div>
												`,
											)
											.join('')}
									</div>
								</section>
							`,
							)
							.join('');

			const answersHtml =
				withAnswers && dynQuestions.length > 0
					? `
					<section class="print-answer-key">
						<h2>BẢNG ĐÁP ÁN</h2>
						<div class="print-key-grid">
							${dynQuestions
								.map(
									(q, i) => `
										<div class="print-key-item">Câu ${i + 1}: <b>${escapeHtml(q.correct).toUpperCase()}</b></div>
									`,
								)
								.join('')}
						</div>
					</section>
				`
					: '';

			const printHtml = `
			<!doctype html>
			<html>
				<head>
					<meta charset="utf-8" />
					<title>Đề trắc nghiệm ôn tập</title>
					<style>
						@page { margin: 18mm 16mm; }
						* { box-sizing: border-box; }
						body { margin: 0; background: #fff; color: #000; font-family: "Times New Roman", Times, serif; font-size: 11pt; }
						.print-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10pt; margin-bottom: 16pt; }
						.print-header h1 { font-size: 16pt; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4pt; }
						.print-header p { font-size: 11pt; margin: 3pt 0; color: #333; }
						.print-questions { display: flex; flex-direction: column; gap: 18pt; }
						.print-question { break-inside: avoid; page-break-inside: avoid; }
						.print-q-text { font-size: 11pt; line-height: 1.5; margin-bottom: 6pt; }
						.print-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 16pt; padding-left: 12pt; }
						.print-opt { line-height: 1.4; break-inside: avoid; }
						.print-answer-key { margin-top: 30pt; padding-top: 16pt; border-top: 2px dashed #ccc; break-before: always; }
						.print-answer-key h2 { font-size: 14pt; margin: 0 0 12pt; text-align: center; }
						.print-key-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10pt; }
						.print-key-item { font-size: 11pt; border: 1px solid #eee; padding: 6pt; text-align: center; }
					</style>
				</head>
				<body>
					<div class="print-header">
						<h1>ĐỀ TRẮC NGHIỆM ÔN TẬP</h1>
						<p>Chủ đề: ${subject} · ${title}</p>
						<p>Số câu: ${dynQuestions.length} · Thời gian: ${dynQuestions.length * 2} phút</p>
					</div>
					<div class="print-questions">${questionsHtml}</div>
					${answersHtml}
					<script>window.onload = () => window.print();</script>
				</body>
			</html>
			`;

			const win = window.open('', '_blank');
			if (win) {
				win.document.open();
				win.document.write(printHtml);
				win.document.close();
			}
		},
		[dynQuestions, subject, title],
	);

	const resetDynQuiz = () => {
		setDynQuizState('setup');
		setDynQuestions([]);
		setDynAnswers({});
		setDynCurrent(0);
	};

	return (
		<div className='stu-ws__quiz-tab-content' style={{ 
			flex: 1, 
			overflowY: 'auto', 
			padding: '16px',
			// Light theme variables to override Workspace's dark theme
			'--right-text': '#1f2937',
			'--right-muted': '#6b7280',
			'--right-border': '#e5e7eb',
			'--right-panel-soft': '#f3f4f6',
			'--right-card': '#ffffff',
			'--right-accent': '#6366f1',
			'--right-grad': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
			'--right-ok': '#10b981',
			'--right-ok-bg': 'rgba(16, 185, 129, 0.1)',
			'--right-ok-border': '#10b981',
			'--right-bad': '#ef4444',
			'--right-bad-bg': 'rgba(239, 68, 68, 0.1)',
			'--right-bad-border': '#ef4444'
		} as React.CSSProperties}>
			{dynQuizState === 'setup' && (
				<div className='stu-ws__quiz dqz-setup'>
					<div className='stu-ws__quiz-header'>
						<span className='stu-ws__quiz-badge'>AI QUIZ</span>
						<span className='stu-ws__quiz-count'>Sinh đề AI</span>
					</div>
					<div className='dqz-setup__label'>Chọn số câu hỏi ôn tập:</div>
					<div className='dqz-setup__options'>
						{([3, 5, 10] as const).map((n) => (
							<div
								key={n}
								className={`dqz-setup__count-btn ${dynQuizCount === n ? 'dqz-setup__count-btn--active' : ''}`}
								onClick={() => setDynQuizCount(n)}
							>
								{n} câu
							</div>
						))}
					</div>
					<div className='dqz-setup__hint'>
						AI sẽ sinh {dynQuizCount} câu trắc nghiệm có độ khó tăng dần về chủ đề đang mô phỏng.
					</div>
					<div className='dqz-setup__start-btn' onClick={startDynQuiz}>
						✨ Sinh đề ngay
					</div>
				</div>
			)}

			{dynQuizState === 'loading' && (
				<div className='stu-ws__quiz dqz-loading'>
					<div className='dqz-loading__spinner' />
					<div className='dqz-loading__text'>AI đang soạn đề thi cho bạn…</div>
				</div>
			)}

			{dynQuizState === 'active' && dynQuestions.length > 0 && (() => {
				const q = dynQuestions[dynCurrent];
				const picked = dynAnswers[dynCurrent];
				const progressPct = `${Math.round(((picked ? dynCurrent + 1 : dynCurrent) / dynQuestions.length) * 100)}%`;
				return (
					<div className='stu-ws__quiz stu-ws__quiz--active'>
						<div className='stu-ws__quiz-header'>
							<span
								className='stu-ws__quiz-badge'
								title={dynUsedLlm ? 'Câu hỏi tạo bởi AI' : 'Câu hỏi mẫu'}
							>
								AI
							</span>
							<span className='stu-ws__quiz-count'>
								Câu {dynCurrent + 1}/{dynQuestions.length}
							</span>
							<div 
								className='dqz-print-wrap' 
								style={{ paddingBottom: '10px', marginBottom: '-10px' }}
								onMouseEnter={() => setShowPrintMenu(true)} 
								onMouseLeave={() => setShowPrintMenu(false)}
							>
								<div
									className='dqz-print-btn'
									title='In / Xuất PDF'
								>
									In đề
								</div>
								{showPrintMenu && (
									<div className='dqz-print-menu'>
										<div className='dqz-print-menu__item' onClick={() => triggerPrint(true)}>
											In có đáp án
										</div>
										<div className='dqz-print-menu__item' onClick={() => triggerPrint(false)}>
											In không đáp án
										</div>
									</div>
								)}
							</div>
						</div>
						<div className='stu-ws__quiz-progress'>
							<span style={{ width: progressPct }} />
						</div>
						<div className='dqz-nav-dots'>
							{dynQuestions.map((_, i) => (
								<div
									key={i}
									className={`dqz-nav-dot ${i === dynCurrent ? 'dqz-nav-dot--active' : ''} ${dynAnswers[i] !== undefined ? (dynAnswers[i] === dynQuestions[i].correct ? 'dqz-nav-dot--correct' : 'dqz-nav-dot--wrong') : ''}`}
									onClick={() => setDynCurrent(i)}
								/>
							))}
						</div>
						<div className='stu-ws__quiz-question'>{q.q}</div>
						<div className='stu-ws__quiz-options'>
							{q.opts.map((o) => {
								const isSel = picked === o.k;
								const isCorrect = o.k === q.correct;
								let optClass = '';
								if (!picked) optClass = '';
								else if (isCorrect) optClass = 'stu-ws__quiz-opt--correct';
								else if (isSel) optClass = 'stu-ws__quiz-opt--wrong';
								else optClass = 'stu-ws__quiz-opt--dimmed';
								return (
									<div
										key={o.k}
										className={`stu-ws__quiz-opt ${optClass}`}
										onClick={() => pickDynAnswer(dynCurrent, o.k)}
									>
										<div
											className={`stu-ws__quiz-radio ${isCorrect && picked ? 'stu-ws__quiz-radio--correct' : ''} ${isSel && !isCorrect ? 'stu-ws__quiz-radio--wrong' : ''}`}
										>
											{picked ? (isCorrect ? '✓' : isSel ? '✗' : o.k.toUpperCase()) : o.k.toUpperCase()}
										</div>
										<span>{o.t}</span>
									</div>
								);
							})}
						</div>
						{picked && (
							<div
								className={`stu-ws__quiz-feedback ${picked === q.correct ? 'stu-ws__quiz-feedback--correct' : 'stu-ws__quiz-feedback--wrong'}`}
							>
								{picked === q.correct ? '✓ Chính xác!' : '✗ Chưa đúng.'}
								{q.explanation && (
									<span
										style={{
											display: 'block',
											fontWeight: 400,
											marginTop: 3,
											fontSize: 11.5,
											lineHeight: 1.45,
										}}
									>
										{q.explanation}
									</span>
								)}
							</div>
						)}
						<div className='dqz-nav-btns'>
							{dynCurrent > 0 && (
								<div className='dqz-nav-btn' onClick={() => setDynCurrent((c) => c - 1)}>
									← Trước
								</div>
							)}
							{dynCurrent < dynQuestions.length - 1 ? (
								<div
									className={`dqz-nav-btn dqz-nav-btn--primary ${!picked ? 'dqz-nav-btn--disabled' : ''}`}
									onClick={() => picked && setDynCurrent((c) => c + 1)}
								>
									Tiếp →
								</div>
							) : (
								<div
									className={`stu-ws__quiz-btn ${picked ? 'stu-ws__quiz-btn--primary' : 'stu-ws__quiz-btn--disabled'}`}
									onClick={() => {
										if (picked) {
											setDynQuizState('done');
											setShowCelebration(true);
										}
									}}
								>
									Hoàn thành
								</div>
							)}
						</div>
					</div>
				);
			})()}

			{dynQuizState === 'done' && (() => {
				const totalCorrect = dynQuestions.filter((q, i) => dynAnswers[i] === q.correct).length;
				const pct = Math.round((totalCorrect / dynQuestions.length) * 100);
				return (
					<div className='stu-ws__quiz dqz-results'>
						<div className='stu-ws__quiz-header'>
							<span className='stu-ws__quiz-badge'>KẾT QUẢ</span>
							<div 
								className='dqz-print-wrap'
								style={{ paddingBottom: '10px', marginBottom: '-10px' }}
								onMouseEnter={() => setShowPrintMenu(true)} 
								onMouseLeave={() => setShowPrintMenu(false)}
							>
								<div
									className='dqz-print-btn'
									title='In / Xuất PDF'
								>
									🖨️
								</div>
								{showPrintMenu && (
									<div className='dqz-print-menu'>
										<div className='dqz-print-menu__item' onClick={() => triggerPrint(true)}>
											In có đáp án
										</div>
										<div className='dqz-print-menu__item' onClick={() => triggerPrint(false)}>
											In không đáp án
										</div>
									</div>
								)}
							</div>
						</div>
						<div
							className='dqz-results__score'
							style={{
								background: `conic-gradient(var(--right-accent, #6366f1) ${pct}%, var(--right-border, #e2e8f0) 0)`,
							}}
						>
							<div className='dqz-results__pct'>{pct}%</div>
							<div className='dqz-results__sub'>
								{totalCorrect}/{dynQuestions.length} câu đúng
							</div>
						</div>
						<div className='dqz-results__list'>
							{dynQuestions.map((q, i) => (
								<div
									key={i}
									className={`dqz-results__item ${dynAnswers[i] === q.correct ? 'dqz-results__item--correct' : 'dqz-results__item--wrong'}`}
								>
									<span>{dynAnswers[i] === q.correct ? '✓' : '✗'}</span>
									<span>
										Câu {i + 1}: Đáp án đúng là <b>{q.correct.toUpperCase()}</b>
									</span>
								</div>
							))}
						</div>
						<div className='dqz-setup__start-btn' style={{ marginTop: 8 }} onClick={resetDynQuiz}>
							🔄 Làm lại bộ đề mới
						</div>
					</div>
				);
			})()}
			{showCelebration && dynQuizState === 'done' && (
				<CelebrationOverlay 
					score={dynQuestions.length > 0 ? Math.round((dynQuestions.filter((q, i) => dynAnswers[i] === q.correct).length / dynQuestions.length) * 100) : 0} 
					onClose={() => setShowCelebration(false)} 
				/>
			)}
		</div>
	);
};

export default AiQuizTab;
