import React, { useEffect, useState } from 'react';
import { history, useLocation, useModel } from 'umi';
import { useAuthActions } from '@/hooks/useAuthActions';
import './index.less';

interface StudentLayoutProps {
	children: React.ReactNode;
	hideSidebar?: boolean;
}

interface NavItem {
	key: string;
	label: string;
	path: string;
	icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
	{
		key: 'home',
		label: 'Trang chủ',
		path: '/hoc-sinh',
		icon: (
			<svg
				width='18'
				height='18'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5' />
			</svg>
		),
	},
	{
		key: 'my-labs',
		label: 'Phòng thí nghiệm',
		path: '/hoc-sinh/my-labs',
		icon: (
			<svg
				width='18'
				height='18'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' />
				<path d='M8 14h8' />
			</svg>
		),
	},
	{
		key: 'progress',
		label: 'Tiến trình',
		path: '/hoc-sinh/progress',
		icon: (
			<svg
				width='18'
				height='18'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M4 20V4M4 20h16M8 17v-5M12 17V8M16 17v-7' />
			</svg>
		),
	},
	{
		key: 'leaderboard',
		label: 'Bảng xếp hạng',
		path: '/hoc-sinh/leaderboard',
		icon: (
			<svg
				width='18'
				height='18'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z' />
			</svg>
		),
	},
	{
		key: 'classes',
		label: 'Lớp học',
		path: '/hoc-sinh/classes',
		icon: (
			<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
				<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
				<circle cx='9' cy='7' r='4' />
				<path d='M23 21v-2a4 4 0 0 0-3-3.87' />
				<path d='M16 3.13a4 4 0 0 1 0 7.75' />
			</svg>
		),
	},
	{
		key: 'saved',
		label: 'Đã lưu',
		path: '#',
		icon: (
			<svg
				width='18'
				height='18'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='1.8'
				strokeLinecap='round'
				strokeLinejoin='round'
			>
				<path d='M7 4h10v16l-5-3.2L7 20V4Z' />
			</svg>
		),
	},
];

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, hideSidebar }) => {
	const location = useLocation();
	const { initialState } = useModel('@@initialState');
	const user = initialState?.currentUser;
	const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Học sinh';
	const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'HS';
	const levelLabel = `Lớp ${user?.grade ?? 11} · Level ${user?.level ?? 1}`;

	const [theme, setTheme] = useState<'light' | 'dark'>(() => {
		try {
			const t = localStorage.getItem('scl-theme');
			if (t === 'dark' || t === 'light') return t;
		} catch {}
		return 'light';
	});

	const toggleTheme = () => {
		const next = theme === 'dark' ? 'light' : 'dark';
		setTheme(next);
		try {
			localStorage.setItem('scl-theme', next);
		} catch {}
	};

	useEffect(() => {
		const root = document.querySelector('.stu-root');
		if (root) {
			root.setAttribute('data-theme', theme);
		}
	}, [theme]);

	const isActive = (path: string) => {
		if (path === '/hoc-sinh') return location.pathname === '/hoc-sinh';
		return location.pathname.startsWith(path);
	};

	const { dangXuat } = useAuthActions();

	const handleNav = (path: string) => {
		if (path === '#') return;
		history.push(path);
	};

	return (
		<div className='stu-root' data-theme={theme}>
			{/* Google Fonts */}
			<link rel='preconnect' href='https://fonts.googleapis.com' />
			<link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
			<link
				href='https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap'
				rel='stylesheet'
			/>

			{/* Sidebar */}
			{!hideSidebar && (
				<aside className='stu-sidebar'>
					{/* Glow decorative overlays */}
					<div className='stu-sidebar__glow-top' />
					<div className='stu-sidebar__glow-bottom' />

					{/* Logo */}
					<div className='stu-sidebar__logo' onClick={() => handleNav('/hoc-sinh')}>
						<div className='stu-sidebar__logo-icon'>
							<svg
								width='19'
								height='19'
								viewBox='0 0 24 24'
								fill='none'
								stroke='#fff'
								strokeWidth='1.9'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' />
								<path d='M8 14h8' />
							</svg>
						</div>
						<div>
							<div className='stu-sidebar__logo-title'>SciLab</div>
							<div className='stu-sidebar__logo-sub'>Virtual Lab</div>
						</div>
					</div>

					{/* Navigation */}
					<nav className='stu-sidebar__nav'>
						{NAV_ITEMS.map((item) => (
							<div
								key={item.key}
								className={`stu-sidebar__nav-item stu-sidebar__nav-item--${item.key} ${
									isActive(item.path) ? `stu-sidebar__nav-item--active stu-sidebar__nav-item--active-${item.key}` : ''
								}`}
								onClick={() => handleNav(item.path)}
							>
								{item.icon}
								{item.label}
							</div>
						))}
					</nav>

					{/* Bottom */}
					<div className='stu-sidebar__bottom'>
						<div className='stu-sidebar__nav-item stu-sidebar__nav-item--logout' onClick={dangXuat}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='1.8'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
								<polyline points='16 17 21 12 16 7' />
								<line x1='21' y1='12' x2='9' y2='12' />
							</svg>
							Đăng xuất
						</div>
						<div className='stu-sidebar__nav-item stu-sidebar__nav-item--settings' onClick={toggleTheme}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='1.8'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z' />
								<path d='M12 3v2.2M12 18.8V21M5 12H3M21 12h-2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6' />
							</svg>
							Cài đặt
							<span className='stu-sidebar__theme-badge'>{theme === 'dark' ? 'Tối' : 'Sáng'}</span>
						</div>

						<div className='stu-sidebar__user' onClick={() => handleNav('/hoc-sinh/profile')}>
							{user?.picture
								? <img src={user.picture} alt={fullName} className='stu-sidebar__user-avatar stu-sidebar__user-avatar--img' style={{ borderRadius: '50%', objectFit: 'cover', width: 32, height: 32 }} />
								: <div className='stu-sidebar__user-avatar'>{initials}</div>
							}
							<div className='stu-sidebar__user-info'>
								<div className='stu-sidebar__user-name'>{fullName}</div>
								<div className='stu-sidebar__user-meta'>{levelLabel}</div>
							</div>
							<svg
								width='15'
								height='15'
								viewBox='0 0 24 24'
								fill='none'
								stroke='#a8a69e'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								style={{ flex: 'none' }}
							>
								<path d='M9 6l6 6-6 6' />
							</svg>
						</div>

						
					</div>
				</aside>
			)}

			{/* Main Content */}
			<main className={`stu-main ${hideSidebar ? 'stu-main--full' : ''}`}>{children}</main>
		</div>
	);
};

export default StudentLayout;
