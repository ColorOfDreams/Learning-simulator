import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import './index.less';

interface CelebrationOverlayProps {
	score: number;
	onClose: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ score, onClose }) => {
	useEffect(() => {
		// Fire multiple confetti bursts
		const duration = 3000;
		const end = Date.now() + duration;

		const frame = () => {
			confetti({
				particleCount: 5,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
				colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
				zIndex: 999999
			});
			confetti({
				particleCount: 5,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
				zIndex: 999999
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		};

		frame();
	}, []);

	return (
		<div className='celebration-overlay'>
			<div className='celebration-overlay__content'>
				<div className='celebration-overlay__icon'>🏆</div>
				<h2 className='celebration-overlay__title'>Tuyệt vời!</h2>
				<p className='celebration-overlay__msg'>
					Bạn đã hoàn thành xuất sắc bài thực hành.
				</p>
				<div className='celebration-overlay__score'>
					Tỉ lệ đúng: <span>{score}%</span>
				</div>
				<button className='celebration-overlay__btn' onClick={onClose}>
					Xem chi tiết kết quả
				</button>
			</div>
		</div>
	);
};

export default CelebrationOverlay;
