import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';

/**
 * Trang /admin dùng layout: false nên KHÔNG đi qua childrenRender/unAccessible
 * của app.tsx (cơ chế đó chỉ áp dụng cho route dùng Layout mặc định) — vì vậy
 * `access: 'isAdmin'` khai báo ở routes.ts không được Umi tự thực thi ở đây.
 * Guard này kiểm tra thủ công vai trò admin trước khi render trang.
 */
const AdminBounder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { initialState } = useModel('@@initialState');
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('access_token');
		if (!token || token === 'undefined') {
			history.replace('/user/login');
			return;
		}
		if (!initialState) return; // đợi getInitialState() tải currentUser
		if (initialState.currentUser?.role !== 'admin') {
			history.replace('/403');
			return;
		}
		setIsReady(true);
	}, [initialState]);

	if (!isReady) {
		return (
			<Spin size='large' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />
		);
	}

	return <>{children}</>;
};

export default AdminBounder;
