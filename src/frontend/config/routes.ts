export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
		],
	},

	// GROUP TITLE
	// {
	// 	name: 'DashboardGroup',
	// 	path: '/__group__/dashboard',
	// 	disabled: true,
	// },

	///////////////////////////////////

	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
		access: 'accessFilter',
		maChucNang: 'dashboard|xem',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		name: 'Quản lý thí nghiệm',
		path: '/quan-ly-thi-nghiem',
		icon: 'ExperimentOutlined',
		component: './QuanLyThiNghiem',
		access: 'accessFilter',
		maChucNang: 'quanlythinghiem|tao',
	},
	{
		name: 'Tạo thí nghiệm',
		path: '/tao-thi-nghiem',
		icon: 'PlusSquareOutlined',
		component: './TaoThiNghiem',
		hideInMenu: true,
		access: 'accessFilter',
		maChucNang: 'quanlythinghiem|tao',
	},
	{
		name: 'Phòng thí nghiệm 3D',
		path: '/thi-nghiem',
		icon: 'PlayCircleOutlined',
		component: './ThiNghiem',
		layout: false,
		hideInMenu: true,
	},
	{
		name: 'Bài Học',
		path: '/bai-hoc',
		icon: 'BookOutlined',
		component: './BaiHoc',
		access: 'accessFilter',
		maChucNang: 'baihoc|xem',
	},

	// // DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },
	// ─── GIAO DIỆN HỌC SINH & LỚP HỌC ───
	{
		path: '/join',
		component: './HocSinh/Classes/JoinClass',
		layout: false,
	},
	{
		path: '/hoc-sinh',
		layout: false,
		routes: [
			{
				path: '/hoc-sinh',
				component: './HocSinh/Home',
			},
			{
				path: '/hoc-sinh/classes',
				component: './HocSinh/Classes/StudentClasses',
			},
			{
				path: '/hoc-sinh/my-labs',
				component: './HocSinh/MyLabs',
			},
			{
				path: '/hoc-sinh/progress',
				component: './HocSinh/Progress',
			},
			{
				path: '/hoc-sinh/leaderboard',
				component: './HocSinh/Leaderboard',
			},
			{
				path: '/hoc-sinh/workspace',
				component: './HocSinh/Workspace',
			},
			{
				path: '/hoc-sinh/profile',
				component: './HocSinh/Profile',
			},
			{
				path: '/hoc-sinh/classes/:id',
				component: './HocSinh/Classes/StudentClassDetails',
			},
		],
	},

	// ─── GIAO DIỆN GIÁO VIÊN (LỚP HỌC + THỐNG KÊ + ĐỀ THI) ───
	{
		path: '/giao-vien/classes',
		name: 'Lớp học',
		icon: 'TeamOutlined',
		component: './GiaoVien/Classes/TeacherClasses',
		access: 'accessFilter',
		maChucNang: 'quanlythinghiem|tao',
	},
	{
		path: '/giao-vien/classes/:id',
		name: 'Chi tiết lớp',
		hideInMenu: true,
		component: './GiaoVien/Classes/TeacherClassDetails',
	},
	{
		path: '/giao-vien/question-bank',
		name: 'Ngân hàng câu hỏi',
		icon: 'DatabaseOutlined',
		component: './GiaoVien/QuestionBank',
		access: 'accessFilter',
		maChucNang: 'quanlythinghiem|tao',
	},
	{
		path: '/giao-vien/exams',
		name: 'Đề thi',
		icon: 'FileTextOutlined',
		component: './GiaoVien/Exams',
		access: 'accessFilter',
		maChucNang: 'quanlythinghiem|tao',
	},
	{
		path: '/giao-vien/exams/create',
		name: 'Tạo đề thi',
		hideInMenu: true,
		component: './GiaoVien/Exams/Create',
	},
	{
		path: '/giao-vien/exams/:id/print',
		name: 'In đề thi',
		hideInMenu: true,
		layout: false,
		component: './GiaoVien/Exams/Print',
	},

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		path: '/*',
		component: './exception/404',
		layout: false,
	},
];
