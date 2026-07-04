import readAll from '@/assets/read-all.svg';
import reLoad from '@/assets/refresh.svg';
import { Link, useIntl } from '@umijs/max';
import { Badge, Space, Tooltip } from 'antd';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export type NoticeIconProps = {
	count?: number;
	total?: number;
	onPopupVisibleChange?: (visible: boolean) => void;
	popupVisible?: boolean;
	children?: React.ReactNode;
	allowClear?: boolean;
	onClear?: () => void;
	getData?: () => void;
	placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | 'bottom' | 'top' | 'right' | 'rightTop' | 'rightBottom';
};

const NoticeIcon: React.FC<NoticeIconProps> = ({
	count,
	total,
	children,
	allowClear,
	onClear,
	popupVisible,
	onPopupVisibleChange,
	getData,
	placement,
}) => {
	const intl = useIntl();
	const { loading } = useModel('thongbao.noticeicon');
	const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
	const [visible, setVisible] = useMergedState<boolean>(false, {
		value: popupVisible,
		onChange: onPopupVisibleChange,
	});

	return (
		<HeaderDropdown
			placement={placement || (isMobile ? 'bottom' : 'bottomRight')}
			content={
				<div className='module-view' style={{ width: 360, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
					<div className={styles.headerContainer}>
						<div className={styles.headerTitle}>
							Thông báo
						</div>
						<div className={styles.headerActions}>
							<Tooltip title={intl.formatMessage({ id: 'app.header.reload', defaultMessage: 'Làm mới' })}>
								<Link
									to='#!'
									onClick={(e) => {
										e.preventDefault();
										if (getData) getData();
									}}
								>
									<img src={reLoad} className={`${styles.reloadIcon} ${loading ? styles.spinning : ''}`} alt='reload' style={{ width: 16, height: 16, filter: 'grayscale(100%) opacity(60%)' }} />
								</Link>
							</Tooltip>
							{allowClear && (
								<Tooltip
									title={intl.formatMessage({ id: 'app.header.readAll', defaultMessage: 'Đánh dấu tất cả là đã đọc' })}
								>
									<Link
										to='#!'
										onClick={(e) => {
											e.preventDefault();
											if (onClear) onClear();
										}}
									>
										<img src={readAll} alt='read all' style={{ width: 16, height: 16, filter: 'grayscale(100%) opacity(60%)' }} />
									</Link>
								</Tooltip>
							)}
						</div>
					</div>
					<div className='module-container' style={{ paddingBottom: 0, overflow: 'hidden' }}>
						{children}
					</div>
				</div>
			}
			trigger={['click']}
			open={visible}
			onOpenChange={(open) => setVisible(open)}
		>
			<Tooltip title={intl.formatMessage({ id: 'app.header.notice', defaultMessage: 'Thông báo' })} placement='bottom'>
				<div className='header-menu-item'>
					<Badge count={count ? (count < 100 ? count : '99+') : undefined} className={styles.noti_badge}>
						<img src='/icons/notification.svg' alt='notif' className={count ? styles.ringing : undefined} />
					</Badge>
				</div>
			</Tooltip>
		</HeaderDropdown>
	);
};

export default NoticeIcon;
