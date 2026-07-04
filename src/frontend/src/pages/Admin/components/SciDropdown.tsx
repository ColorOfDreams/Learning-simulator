import React, { useState, useRef, useEffect } from 'react';

interface Option {
	value: string | number;
	label: string;
}

interface SciDropdownProps {
	value: string | number;
	options: Option[];
	onChange: (value: any) => void;
	variant?: 'filter' | 'plain' | 'badge';
	accent?: number;
	dark?: boolean;
	placeholder?: string;
	style?: React.CSSProperties;
}

const SciDropdown: React.FC<SciDropdownProps> = ({
	value,
	options = [],
	onChange,
	variant = 'filter',
	accent = 264,
	dark = false,
	placeholder = 'Chọn…',
	style,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [menuRect, setMenuRect] = useState({ left: 0, top: 0, width: 180 });
	const rootRef = useRef<HTMLDivElement>(null);

	const toggle = () => {
		if (isOpen) {
			setIsOpen(false);
			return;
		}
		if (rootRef.current) {
			const rect = rootRef.current.getBoundingClientRect();
			setMenuRect({
				left: rect.left,
				top: rect.bottom + window.scrollY,
				width: rect.width,
			});
		}
		setIsOpen(true);
	};

	const close = () => setIsOpen(false);

	const pick = (val: string | number, e: React.MouseEvent) => {
		e.stopPropagation();
		setIsOpen(false);
		if (onChange) {
			onChange(val);
		}
	};

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [isOpen]);

	const cur = options.find((o) => String(o.value) === String(value));
	const currentLabel = cur ? cur.label : placeholder;

	const triBg = dark ? '#1c1c20' : '#faf9f5';
	const triBorder = dark ? '#3a3a42' : '#e0ddd4';
	const triText = dark ? '#ededee' : '#2a2a28';
	const rot = isOpen ? 'rotate(180deg)' : 'none';

	let triggerStyle: React.CSSProperties = {};
	let labelStyle: React.CSSProperties = {};
	let chevronStyle: React.CSSProperties = {
		flex: 'none',
		opacity: 0.55,
		transition: 'transform .18s',
		transform: rot,
	};

	if (variant === 'badge') {
		triggerStyle = {
			display: 'inline-flex',
			alignItems: 'center',
			gap: '6px',
			padding: '5px 11px',
			borderRadius: '999px',
			cursor: 'pointer',
			userSelect: 'none',
			background: `oklch(0.62 0.14 ${accent} / ${dark ? '.22' : '.14'})`,
			color: `oklch(${dark ? '0.74' : '0.44'} 0.15 ${accent})`,
			transition: 'filter .15s',
		};
		labelStyle = {
			fontSize: '12px',
			fontWeight: 700,
			whiteSpace: 'nowrap',
		};
		chevronStyle = {
			...chevronStyle,
			opacity: 0.75,
		};
	} else if (variant === 'plain') {
		triggerStyle = {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			justifyContent: 'space-between',
			padding: '7px 11px',
			borderRadius: '9px',
			cursor: 'pointer',
			userSelect: 'none',
			background: triBg,
			border: `1px solid ${triBorder}`,
			color: triText,
			transition: 'border-color .15s',
		};
		labelStyle = {
			fontSize: '13px',
			fontWeight: 600,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		};
	} else {
		triggerStyle = {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			justifyContent: 'space-between',
			width: '100%',
			padding: '10px 13px',
			borderRadius: '11px',
			cursor: 'pointer',
			userSelect: 'none',
			background: triBg,
			border: isOpen ? `1px solid oklch(0.62 0.14 264 / .6)` : `1px solid ${triBorder}`,
			boxShadow: isOpen ? `0 0 0 3px oklch(0.62 0.14 264 / .1)` : 'none',
			color: triText,
			transition: 'border-color .15s, box-shadow .15s',
		};
		labelStyle = {
			fontSize: '13.5px',
			fontWeight: 600,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		};
	}

	const menuStyle: React.CSSProperties = {
		position: 'fixed',
		top: `${menuRect.top - window.scrollY + 6}px`,
		left: `${menuRect.left}px`,
		zIndex: 1000,
		minWidth: `${menuRect.width}px`,
		width: 'max-content',
		maxWidth: '300px',
		maxHeight: '288px',
		overflowY: 'auto',
		background: dark ? '#26262b' : '#fff',
		border: dark ? '1px solid #34343b' : '1px solid #eceae3',
		borderRadius: '13px',
		padding: '6px',
		boxShadow: '0 20px 46px -16px rgba(30,25,50,.4), 0 3px 10px rgba(0,0,0,.07)',
		animation: 'ddIn .16s cubic-bezier(.2,.8,.3,1) both',
	};

	return (
		<div style={{ position: 'relative', ...style }} ref={rootRef}>
			<div onClick={toggle} style={triggerStyle} className="sci-dd-trigger">
				<span style={labelStyle}>{currentLabel}</span>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
					style={chevronStyle}
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</div>
			{isOpen && (
				<>
					<div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
					<div className="dd-scl" style={menuStyle}>
						{options.map((o) => {
							const selected = String(o.value) === String(value);
							const itemStyle: React.CSSProperties = {
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								padding: '9px 12px',
								borderRadius: '9px',
								cursor: 'pointer',
								fontSize: '13.5px',
								fontWeight: selected ? 700 : 500,
								color: selected ? `oklch(${dark ? '0.78' : '0.42'} 0.14 ${accent})` : triText,
								background: selected ? `oklch(0.62 0.14 ${accent} / ${dark ? '.2' : '.12'})` : 'transparent',
								transition: 'background .12s',
							};
							const checkColor = `oklch(${dark ? '0.72' : '0.5'} 0.15 ${accent})`;

							return (
								<div
									key={o.value}
									onClick={(e) => pick(o.value, e)}
									style={itemStyle}
									className={`sci-dd-item ${selected ? 'selected' : ''}`}
								>
									<span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
										{o.label}
									</span>
									{selected && (
										<svg
											width="15"
											height="15"
											viewBox="0 0 24 24"
											fill="none"
											stroke={checkColor}
											strokeWidth="2.6"
											strokeLinecap="round"
											strokeLinejoin="round"
											style={{ flex: 'none' }}
										>
											<path d="M5 12.5 10 17l9-10" />
										</svg>
									)}
								</div>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
};

export default SciDropdown;
