import React, { useState, useEffect, useRef } from 'react';
import { useModel } from 'umi';
import { message } from 'antd';
import AdminBounder from '@/components/AdminBounder';
import { useAuthActions } from '@/hooks/useAuthActions';
import LineChart from '@/components/Chart/LineChart';
import ColumnChart from '@/components/Chart/ColumnChart';
import SciDropdown from './components/SciDropdown';
import './index.less';
import {
	getAdminOverviewStats,
	getAdminRailwayMetrics,
	getAdminUsers,
	createAdminUser,
	updateAdminUserRole,
	setAdminUserLocked,
	resetAdminUserPassword,
	deleteAdminUser,
	importAdminUsers,
	getAdminClasses,
	reassignAdminClass,
	setAdminClassLocked,
	deleteAdminClass,
	getAdminSims,
	setAdminSimPublished,
	assignAdminSimSubject,
	getAdminQuestions,
	approveAdminQuestion,
	rejectAdminQuestion,
	getAdminExams,
	approveAdminExam,
	rejectAdminExam,
} from '@/services/admin/api';
import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

// ── Types & Interfaces ──
interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	level: number | string;
	xp: number | string;
	streak: number | string;
}

interface Classroom {
	id: string;
	name: string;
	teacher: string;
	teacherId: string;
	subject: string;
	grade: number | string;
	students: number;
	status: string;
}

interface Sim {
	id: string;
	name: string;
	subject: string;
	roomType: string;
	pub: boolean;
	plays: number;
	hue: number;
}

interface Question {
	id: string;
	text: string;
	subject: string;
	type: string;
	difficulty: string;
	status: string;
}

interface Exam {
	id: string;
	name: string;
	subject: string;
	grade: number;
	questions: number;
	status: string;
}

interface Catalog {
	subjects: string[];
	grades: string[];
	topics: string[];
	difficulties: string[];
	qtypes: string[];
}

// ── Backend <-> UI label mappings ──
const ROOM_TYPE_TO_LABEL: Record<string, string> = { physics: 'Vật lý', chemistry: 'Hóa học', math: 'Toán' };
const LABEL_TO_ROOM_TYPE: Record<string, string> = { 'Vật lý': 'physics', 'Hóa học': 'chemistry', Toán: 'math' };
const QTYPE_TO_LABEL: Record<string, string> = { MULTIPLE_CHOICE: 'Trắc nghiệm', ESSAY: 'Tự luận', SHORT_ANSWER: 'Điền khuyết' };
const difficultyLabel = (d: number) => (d <= 2 ? 'Dễ' : d === 3 ? 'Trung bình' : 'Khó');
const userDisplayName = (u: { firstName?: string; lastName?: string; email: string }) =>
	[u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email;

const AdminDashboard: React.FC = () => {
	const { initialState } = useModel('@@initialState');
	const currentUser = initialState?.currentUser;
	const { dangXuat } = useAuthActions();

	// ── Core Layout & Theme State ──
	const [view, setView] = useState<'dashboard' | 'users' | 'classes' | 'content'>('dashboard');
	const [theme, setTheme] = useState<'light' | 'dark'>(() => {
		if (typeof window !== 'undefined') {
			return (localStorage.getItem('scl-theme') as 'light' | 'dark') || 'dark';
		}
		return 'dark';
	});
	const [range, setRange] = useState<'day' | 'week' | 'month'>('day');

	// ── Filters & Search State ──
	const [userSearch, setUserSearch] = useState('');
	const [userRole, setUserRole] = useState('all');
	const [userStatus, setUserStatus] = useState('all');

	const [clsTeacher, setClsTeacher] = useState('all');
	const [clsSubject, setClsSubject] = useState('all');
	const [clsGrade, setClsGrade] = useState('all');

	const [contentTab, setContentTab] = useState<'sim' | 'questions' | 'exams' | 'catalog'>('sim');

	// ── Dialog & Feedback States ──
	const [modal, setModal] = useState<null | 'import' | 'user'>(null);
	const [toastMsg, setToastMsg] = useState<null | string>(null);
	const [confirmConfig, setConfirmConfig] = useState<null | {
		icon: string;
		tone: string;
		title: string;
		message: string;
		confirmLabel: string;
		onConfirm: () => void;
	}>(null);

	// ── Form States ──
	const [formId, setFormId] = useState<null | string>(null);
	const [formName, setFormName] = useState('');
	const [formEmail, setFormEmail] = useState('');
	const [formRole, setFormRole] = useState('student');
	const [importFile, setImportFile] = useState<File | null>(null);

	// ── Real Data States (fetched from backend) ──
	const [users, setUsers] = useState<User[]>([]);
	const [classes, setClasses] = useState<Classroom[]>([]);
	const [sims, setSims] = useState<Sim[]>([]);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [exams, setExams] = useState<Exam[]>([]);
	const [statsData, setStatsData] = useState<{
		users: { admin: number; teacher: number; student: number; total: number };
		totalClasses: number;
		totalExams: number;
		totalQuestions: number;
		totalScenes: number;
		labCompletions: number;
		systemVisits: number;
		dauTrend: { date: string; count: number }[];
		aiCalls: number;
		aiCostUsd: number;
		aiCostTrend: { date: string; cost: number }[];
	} | null>(null);
	const [railwayRange, setRailwayRange] = useState<'1h' | '6h' | '1d' | '7d' | '30d'>('1d');
	const [railwayMetrics, setRailwayMetrics] = useState<{
		configured: boolean;
		range?: string;
		cpu?: { ts: number; value: number }[];
		memory?: { ts: number; value: number }[];
		networkRx?: { ts: number; value: number }[];
		networkTx?: { ts: number; value: number }[];
		requests?: { total: number; trend: { ts: number; value: number }[] };
		errorRate?: { percent: number; trend: { ts: number; value: number }[] };
		responseTime?: { trend: { ts: number; p50: number; p90: number; p95: number; p99: number }[] };
		notSupported?: string[];
	} | null>(null);

	// ── Catalog: tái dùng model danh mục hệ thống đã có sẵn (DanhMuc) ──
	const monHocModel = useModel('danhmuc.mon-hoc');
	const lopModel = useModel('danhmuc.lop');
	const chuDeModel = useModel('danhmuc.chu-de');
	const doKhoModel = useModel('danhmuc.do-kho');
	const loaiCauHoiModel = useModel('danhmuc.loai-cau-hoi');
	const catalogModels = {
		subjects: monHocModel,
		grades: lopModel,
		topics: chuDeModel,
		difficulties: doKhoModel,
		qtypes: loaiCauHoiModel,
	} as const;
	const catalog: Catalog = {
		subjects: monHocModel.danhSach.map((it: any) => it.name),
		grades: lopModel.danhSach.map((it: any) => it.name),
		topics: chuDeModel.danhSach.map((it: any) => it.name),
		difficulties: doKhoModel.danhSach.map((it: any) => it.name),
		qtypes: loaiCauHoiModel.danhSach.map((it: any) => it.name),
	};

	const toastTimer = useRef<NodeJS.Timeout | null>(null);

	// ── Normalizers: backend record -> UI shape ──
	const normalizeUser = (u: any): User => ({
		id: u.id,
		name: userDisplayName(u),
		email: u.email,
		role: u.role,
		status: u.isLocked ? 'locked' : 'active',
		level: u.role === 'student' ? (u.level ?? 1) : '—',
		xp: u.role === 'student' ? (u.xp ?? 0) : '—',
		streak: u.role === 'student' ? (u.streak ?? 0) : '—',
	});

	const normalizeClass = (c: any): Classroom => ({
		id: c.id,
		name: c.name,
		teacher: c.teacher ? userDisplayName(c.teacher) : '—',
		teacherId: c.teacherId,
		subject: c.subject ?? '—',
		grade: c.grade ?? '—',
		students: c.studentsCount ?? 0,
		status: c.isLocked ? 'locked' : 'active',
	});

	const normalizeSim = (s: any): Sim => {
		const subject = ROOM_TYPE_TO_LABEL[s.roomType] ?? s.roomType;
		return {
			id: s.id,
			name: s.name,
			subject,
			roomType: s.roomType,
			pub: Boolean(s.published),
			plays: s.plays ?? 0,
			hue: _subjHue(subject),
		};
	};

	const normalizeQuestion = (q: any): Question => ({
		id: q.id,
		text: q.question,
		subject: q.subject,
		type: QTYPE_TO_LABEL[q.type] ?? q.type,
		difficulty: difficultyLabel(q.difficulty ?? 2),
		status: q.status,
	});

	const normalizeExam = (x: any): Exam => ({
		id: x.id,
		name: x.title,
		subject: x.subject,
		grade: x.grade,
		questions: x.questionCount ?? 0,
		status: x.status,
	});

	// ── Fetchers ──
	const loadStats = async () => {
		try {
			const res = await getAdminOverviewStats(range);
			setStatsData(res.data?.data ?? res.data);
		} catch {
			/* thông báo lỗi đã được xử lý bởi axios interceptor */
		}
	};

	const loadRailwayMetrics = async () => {
		try {
			const res = await getAdminRailwayMetrics(railwayRange);
			setRailwayMetrics(res.data?.data ?? res.data);
		} catch {
			/* noop */
		}
	};

	const loadUsers = async () => {
		try {
			const res = await getAdminUsers({
				search: userSearch || undefined,
				role: userRole !== 'all' ? userRole : undefined,
				limit: 200,
			});
			const data = res.data?.data ?? res.data;
			setUsers((data.result ?? []).map(normalizeUser));
		} catch {
			/* noop */
		}
	};

	const loadClasses = async () => {
		try {
			const res = await getAdminClasses({});
			const data = res.data?.data ?? res.data;
			setClasses((data ?? []).map(normalizeClass));
		} catch {
			/* noop */
		}
	};

	const loadSims = async () => {
		try {
			const res = await getAdminSims();
			const data = res.data?.data ?? res.data;
			setSims((data ?? []).map(normalizeSim));
		} catch {
			/* noop */
		}
	};

	const loadQuestions = async () => {
		try {
			const res = await getAdminQuestions();
			const data = res.data?.data ?? res.data;
			setQuestions((data ?? []).map(normalizeQuestion));
		} catch {
			/* noop */
		}
	};

	const loadExams = async () => {
		try {
			const res = await getAdminExams();
			const data = res.data?.data ?? res.data;
			setExams((data ?? []).map(normalizeExam));
		} catch {
			/* noop */
		}
	};

	useEffect(() => {
		loadStats();
	}, [range]);

	useEffect(() => {
		loadRailwayMetrics();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [railwayRange]);

	useEffect(() => {
		if (view === 'users') loadUsers();
		if (view === 'classes') loadClasses();
		if (view === 'content') {
			loadSims();
			loadQuestions();
			loadExams();
		}
	}, [view]);

	useEffect(() => {
		if (view === 'users') loadUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userSearch, userRole]);

	useEffect(() => {
		monHocModel.getModel(undefined, undefined, undefined, 1, 200);
		lopModel.getModel(undefined, undefined, undefined, 1, 200);
		chuDeModel.getModel(undefined, undefined, undefined, 1, 200);
		doKhoModel.getModel(undefined, undefined, undefined, 1, 200);
		loaiCauHoiModel.getModel(undefined, undefined, undefined, 1, 200);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ── Toast Helper ──
	const triggerToast = (msg: string) => {
		setToastMsg(msg);
		if (toastTimer.current) clearTimeout(toastTimer.current);
		toastTimer.current = setTimeout(() => {
			setToastMsg(null);
		}, 2200);
	};

	// ── Theme Switcher ──
	const toggleTheme = () => {
		const nextTheme = theme === 'dark' ? 'light' : 'dark';
		setTheme(nextTheme);
		if (typeof window !== 'undefined') {
			localStorage.setItem('scl-theme', nextTheme);
		}
	};

	// ── Confirm Modal helper ──
	const askConfirm = (cfg: {
		icon: string;
		tone: string;
		title: string;
		message: string;
		confirmLabel: string;
		onConfirm: () => void;
	}) => {
		setConfirmConfig(cfg);
	};

	const closeConfirm = () => setConfirmConfig(null);

	const runConfirm = () => {
		if (confirmConfig) {
			confirmConfig.onConfirm();
			closeConfirm();
		}
	};

	// ── User Management Helpers ──
	const openNewUser = () => {
		setFormId(null);
		setFormName('');
		setFormEmail('');
		setFormRole('student');
		setModal('user');
	};

	const editUser = (u: User) => {
		setFormId(u.id);
		setFormName(u.name);
		setFormEmail(u.email);
		setFormRole(u.role);
		setModal('user');
	};

	const saveUser = async () => {
		if (!formName.trim()) {
			triggerToast('Vui lòng nhập họ tên');
			return;
		}
		try {
			if (formId) {
				const [firstName, ...rest] = formName.trim().split(/\s+/);
				await axios.put(`${ip3}/users/${formId}`, {
					firstName,
					lastName: rest.join(' '),
					email: formEmail,
					role: formRole,
				});
				triggerToast('Đã cập nhật người dùng');
			} else {
				const tempPassword = Math.random().toString(36).slice(2, 10);
				const [firstName, ...rest] = formName.trim().split(/\s+/);
				await createAdminUser({
					email: formEmail,
					firstName,
					lastName: rest.join(' '),
					role: formRole,
					password: tempPassword,
				});
				triggerToast(`Đã tạo người dùng mới. Mật khẩu tạm: ${tempPassword}`);
			}
			setModal(null);
			loadUsers();
		} catch {
			/* lỗi đã được thông báo qua axios interceptor */
		}
	};

	const toggleUserLock = (u: User) => {
		if (u.status === 'locked') {
			askConfirm({
				icon: 'unlock',
				tone: 'default',
				title: 'Mở khóa tài khoản?',
				message: `Tài khoản “${u.name}” sẽ được mở khóa và có thể đăng nhập trở lại.`,
				confirmLabel: 'Mở khóa',
				onConfirm: async () => {
					await setAdminUserLocked(u.id, false);
					setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: 'active' } : x)));
					triggerToast('Đã mở khóa tài khoản');
				},
			});
		} else {
			askConfirm({
				icon: 'lock',
				tone: 'warn',
				title: 'Khóa tài khoản?',
				message: `Tài khoản “${u.name}” sẽ bị khóa và không thể đăng nhập cho tới khi được mở lại.`,
				confirmLabel: 'Khóa tài khoản',
				onConfirm: async () => {
					await setAdminUserLocked(u.id, true);
					setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: 'locked' } : x)));
					triggerToast('Đã khóa tài khoản');
				},
			});
		}
	};

	const changeUserRoleV = async (u: User, role: string) => {
		try {
			await updateAdminUserRole(u.id, role);
			setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
			triggerToast(`Đã đổi vai trò → ${_roleLabel(role)}`);
		} catch {
			/* noop */
		}
	};

	const resetPwd = (u: User) => {
		askConfirm({
			icon: 'key',
			tone: 'default',
			title: 'Đặt lại mật khẩu?',
			message: `Hệ thống chưa tích hợp gửi email — mật khẩu tạm sẽ được tạo và hiển thị để bạn gửi thủ công cho ${u.name}.`,
			confirmLabel: 'Tạo mật khẩu tạm',
			onConfirm: async () => {
				const res = await resetAdminUserPassword(u.id);
				const tempPassword = (res.data?.data ?? res.data)?.tempPassword;
				message.success(`Mật khẩu tạm cho ${u.name}: ${tempPassword}`);
				triggerToast(`Đã đặt lại mật khẩu cho ${u.name}`);
			},
		});
	};

	const removeUser = (u: User) => {
		askConfirm({
			icon: 'trash',
			tone: 'danger',
			title: 'Xóa người dùng?',
			message: `Tài khoản “${u.name}” cùng toàn bộ dữ liệu học tập sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`,
			confirmLabel: 'Xóa vĩnh viễn',
			onConfirm: async () => {
				await deleteAdminUser(u.id);
				setUsers((prev) => prev.filter((x) => x.id !== u.id));
				triggerToast('Đã xóa người dùng');
			},
		});
	};

	// ── Class Management Helpers ──
	const reassignClassV = async (c: Classroom, teacherId: string) => {
		try {
			await reassignAdminClass(c.id, teacherId);
			const teacherName = uniqueTeachers.find((t) => t.id === teacherId)?.name ?? teacherId;
			setClasses((prev) => prev.map((x) => (x.id === c.id ? { ...x, teacher: teacherName, teacherId } : x)));
			triggerToast(`Đã gán lại GV: ${teacherName}`);
		} catch {
			/* noop */
		}
	};

	const toggleClassLock = (c: Classroom) => {
		if (c.status === 'locked') {
			askConfirm({
				icon: 'unlock',
				tone: 'default',
				title: 'Mở khóa lớp học?',
				message: `Lớp “${c.name}” sẽ hoạt động trở lại cho giáo viên và học sinh.`,
				confirmLabel: 'Mở khóa',
				onConfirm: async () => {
					await setAdminClassLocked(c.id, false);
					setClasses((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'active' } : x)));
					triggerToast('Đã mở khóa lớp');
				},
			});
		} else {
			askConfirm({
				icon: 'lock',
				tone: 'warn',
				title: 'Khóa lớp học?',
				message: `Lớp “${c.name}” sẽ bị tạm khóa; giáo viên và học sinh không thể truy cập cho tới khi mở lại.`,
				confirmLabel: 'Khóa lớp',
				onConfirm: async () => {
					await setAdminClassLocked(c.id, true);
					setClasses((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: 'locked' } : x)));
					triggerToast('Đã khóa lớp');
				},
			});
		}
	};

	const removeClass = (c: Classroom) => {
		askConfirm({
			icon: 'trash',
			tone: 'danger',
			title: 'Xóa lớp học?',
			message: `Lớp “${c.name}” (${c.students} học sinh) sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`,
			confirmLabel: 'Xóa vĩnh viễn',
			onConfirm: async () => {
				await deleteAdminClass(c.id);
				setClasses((prev) => prev.filter((x) => x.id !== c.id));
				triggerToast('Đã xóa lớp học');
			},
		});
	};

	// ── Content Management Helpers ──
	const toggleSimPub = (e: Sim) => {
		if (e.pub) {
			askConfirm({
				icon: 'eye',
				tone: 'warn',
				title: 'Gỡ xuất bản thí nghiệm?',
				message: `“${e.name}” sẽ bị ẩn khỏi học sinh cho tới khi được xuất bản lại.`,
				confirmLabel: 'Gỡ xuất bản',
				onConfirm: async () => {
					await setAdminSimPublished(e.id, false);
					setSims((prev) => prev.map((x) => (x.id === e.id ? { ...x, pub: false } : x)));
					triggerToast('Đã gỡ xuất bản thí nghiệm');
				},
			});
		} else {
			setAdminSimPublished(e.id, true).then(() => {
				setSims((prev) => prev.map((x) => (x.id === e.id ? { ...x, pub: true } : x)));
				triggerToast('Đã xuất bản thí nghiệm');
			});
		}
	};

	const assignSimSubjectV = async (e: Sim, subject: string) => {
		const roomType = LABEL_TO_ROOM_TYPE[subject] ?? subject;
		try {
			await assignAdminSimSubject(e.id, roomType);
			setSims((prev) => prev.map((x) => (x.id === e.id ? { ...x, subject, roomType, hue: _subjHue(subject) } : x)));
			triggerToast(`Đã gán môn: ${subject}`);
		} catch {
			/* noop */
		}
	};

	const approveQ = async (q: Question) => {
		await approveAdminQuestion(q.id);
		setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: 'approved' } : x)));
		triggerToast('Đã duyệt câu hỏi');
	};

	const rejectQ = (q: Question) => {
		askConfirm({
			icon: 'x',
			tone: 'danger',
			title: 'Từ chối câu hỏi?',
			message: 'Câu hỏi sẽ bị đánh dấu từ chối và không được đưa vào ngân hàng đề.',
			confirmLabel: 'Từ chối',
			onConfirm: async () => {
				await rejectAdminQuestion(q.id);
				setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: 'rejected' } : x)));
				triggerToast('Đã từ chối câu hỏi');
			},
		});
	};

	const approveX = async (examItem: Exam) => {
		await approveAdminExam(examItem.id);
		setExams((prev) => prev.map((e) => (e.id === examItem.id ? { ...e, status: 'approved' } : e)));
		triggerToast('Đã duyệt đề thi');
	};

	const rejectX = (examItem: Exam) => {
		askConfirm({
			icon: 'x',
			tone: 'danger',
			title: 'Từ chối đề thi?',
			message: `Đề thi “${examItem.name}” sẽ bị đánh dấu từ chối và không được phát hành.`,
			confirmLabel: 'Từ chối',
			onConfirm: async () => {
				await rejectAdminExam(examItem.id);
				setExams((prev) => prev.map((e) => (e.id === examItem.id ? { ...e, status: 'rejected' } : e)));
				triggerToast('Đã từ chối đề thi');
			},
		});
	};

	const addCat = (key: keyof Catalog, label: string) => {
		const name = window.prompt(`Tên mục mới cho "${label}":`, '');
		if (!name?.trim()) return;
		const code = name.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 20);
		catalogModels[key].postModel({ name: name.trim(), code } as any);
		triggerToast('Đã thêm mục danh mục');
	};

	const removeCat = (key: keyof Catalog, item: string) => {
		const record = (catalogModels[key].danhSach as any[]).find((it) => it.name === item);
		if (!record) return;
		askConfirm({
			icon: 'trash',
			tone: 'danger',
			title: 'Xóa mục danh mục?',
			message: `“${item}” sẽ bị xóa khỏi danh mục hệ thống.`,
			confirmLabel: 'Xóa',
			onConfirm: () => {
				catalogModels[key].deleteModel(record.id);
				triggerToast('Đã xóa mục');
			},
		});
	};

	// ── Style & Badge Color Helpers ──
	const _roleLabel = (r: string) => (r === 'student' ? 'Học sinh' : r === 'teacher' ? 'Giáo viên' : 'Quản trị');
	const _roleHue = (r: string) => (r === 'student' ? 264 : r === 'teacher' ? 350 : 300);
	const _subjHue = (s: string) => (s === 'Hóa học' ? 264 : s === 'Vật lý' ? 195 : 150);
	const _diffHue = (d: string) => (d === 'Dễ' ? 150 : d === 'Trung bình' ? 70 : 25);
	const _initials = (n: string) => {
		const p = n.trim().split(/\s+/);
		return ((p[0] || '')[0] || '') + ((p[p.length - 1] || '')[0] || '');
	};

	const _avatarStyle = (hue: number): React.CSSProperties => ({
		width: '34px',
		height: '34px',
		borderRadius: '9px',
		flexShrink: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '12px',
		fontWeight: 700,
		color: '#fff',
		background: `linear-gradient(140deg, oklch(0.66 0.15 ${hue}), oklch(0.56 0.16 ${hue + 30}))`,
	});

	const _badgeStyle = (hue: number, dark: boolean): React.CSSProperties => ({
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '4px 11px',
		borderRadius: '999px',
		fontSize: '12px',
		fontWeight: 700,
		background: `oklch(${dark ? '0.6' : '0.62'} 0.14 ${hue} / .14)`,
		color: `oklch(${dark ? '0.74' : '0.46'} 0.15 ${hue})`,
	});

	const _statusBadgeStyle = (active: boolean, dark: boolean): React.CSSProperties => {
		return active
			? _badgeStyle(150, dark)
			: {
					display: 'inline-flex',
					alignItems: 'center',
					padding: '4px 11px',
					borderRadius: '999px',
					fontSize: '12px',
					fontWeight: 700,
					background: 'oklch(0.6 0.03 40 / .12)',
					color: 'oklch(0.5 0.02 40)',
			  };
	};

	const _pubBadgeStyle = (pub: boolean): React.CSSProperties => {
		return pub
			? {
					padding: '3px 9px',
					borderRadius: '999px',
					fontSize: '11px',
					fontWeight: 700,
					background: 'oklch(0.5 0.14 150 / .9)',
					color: '#fff',
					backdropFilter: 'blur(4px)',
			  }
			: {
					padding: '3px 9px',
					borderRadius: '999px',
					fontSize: '11px',
					fontWeight: 700,
					background: 'rgba(30,28,36,.55)',
					color: '#fff',
					backdropFilter: 'blur(4px)',
			  };
	};

	// ── Sidebar styling ──
	const navStyle = (viewName: string): React.CSSProperties => {
		const active = view === viewName;
		const base: React.CSSProperties = {
			display: 'flex',
			alignItems: 'center',
			gap: '11px',
			padding: '10px 12px',
			borderRadius: '10px',
			fontSize: '14px',
			cursor: 'pointer',
			transition: 'background .18s, color .18s',
			userSelect: 'none',
		};

		let hue = 'oklch(0.62 0.14 264)';
		if (viewName === 'users') hue = 'oklch(0.58 0.17 350)';
		if (viewName === 'classes') hue = 'oklch(0.55 0.13 195)';
		if (viewName === 'content') hue = 'oklch(0.62 0.14 70)';

		return active
			? { ...base, background: hue, color: '#fff', fontWeight: 700, boxShadow: `0 6px 16px -8px ${hue}` }
			: { ...base, color: 'var(--muted, #7c7a72)', fontWeight: 600 };
	};

	// ── Chart Calculators ──
	// DAU chart points (từ dữ liệu thật, có thể rỗng cho tới khi đủ dữ liệu tích lũy)
	const dauData = statsData?.dauTrend?.length ? statsData.dauTrend.map((d) => d.count) : [0, 0];
	const chartW = 600;
	const chartH = 200;
	const rawMaxDau = Math.max(...dauData) * 1.08;
	const rawMinDau = Math.min(...dauData) * 0.9;
	const maxDau = rawMaxDau > rawMinDau ? rawMaxDau : rawMinDau + 1;
	const minDau = rawMinDau;
	const getPx = (i: number) => (i / Math.max(1, dauData.length - 1)) * chartW;
	const getPy = (v: number) => chartH - ((v - minDau) / (maxDau - minDau)) * (chartH - 14) - 7;
	const points = dauData.map((v, i) => `${getPx(i).toFixed(1)},${getPy(v).toFixed(1)}`);
	const dauLine = points.join(' ');
	const dauArea = `M${points[0]} L${points.join(' L')} L${chartW},${chartH} L0,${chartH} Z`;
	const dauDots = dauData.map((v, i) => ({ x: getPx(i).toFixed(1), y: getPy(v).toFixed(1) }));

	// AI bars (chi phí ước tính theo ngày, 14 ngày gần nhất)
	const aiRawData = statsData?.aiCostTrend?.length
		? statsData.aiCostTrend.map((d) => ({ label: d.date.slice(5), cost: Number(d.cost.toFixed(6)) }))
		: [{ label: '—', cost: 0 }];
	const maxCost = Math.max(1, ...aiRawData.map((d) => d.cost));

	// ── Railway infra metrics: chuẩn bị dữ liệu cho chart ──
	const railwayTsLabel = (ts: number) => {
		const d = new Date(ts * 1000);
		if (railwayRange === '1h' || railwayRange === '6h') {
			return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
		}
		if (railwayRange === '1d') {
			return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
		}
		return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
	};
	const railwayXAxis = (railwayMetrics?.cpu ?? []).map((p) => railwayTsLabel(p.ts));
	const railwayNotSupported = new Set(railwayMetrics?.notSupported ?? []);

	// ── Filtering Data logic ──
	const filteredUsers = users.filter((u) => {
		if (userRole !== 'all' && u.role !== userRole) return false;
		if (userStatus !== 'all' && u.status !== userStatus) return false;
		const query = userSearch.trim().toLowerCase();
		if (query && !(u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))) {
			return false;
		}
		return true;
	});

	const uniqueTeachers = Array.from(
		new Map(classes.map((c) => [c.teacherId, { id: c.teacherId, name: c.teacher }])).values(),
	);
	const filteredClasses = classes.filter((c) => {
		if (clsTeacher !== 'all' && c.teacherId !== clsTeacher) return false;
		if (clsSubject !== 'all' && c.subject !== clsSubject) return false;
		if (clsGrade !== 'all' && String(c.grade) !== clsGrade) return false;
		return true;
	});

	const activeAdminName = currentUser?.name || 'Vũ Đình Khoa';
	const adminInitials = _initials(activeAdminName);
	const todayLabel = new Date().toLocaleDateString('vi-VN', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

	const isDark = theme === 'dark';

	// Chi phí AI thường rất nhỏ (phần nghìn/chục nghìn đô) — .toFixed(2) sẽ luôn ra "0.00"
	const formatUsd = (v: number) => {
		if (v === 0) return '$0.00';
		if (v < 0.01) return `$${v.toFixed(6)}`;
		return `$${v.toFixed(2)}`;
	};

	// Stats card data configurations (dữ liệu thật từ /admin/stats/overview)
	const statsDefinitions = [
		{ label: 'Người dùng hoạt động', value: (statsData?.users.total ?? 0).toLocaleString('en-US'), delta: `${statsData?.users.student ?? 0} HS · ${statsData?.users.teacher ?? 0} GV`, up: true, hue: 264, iconPath: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4' },
		{ label: 'Lớp học', value: (statsData?.totalClasses ?? 0).toLocaleString('en-US'), delta: `${statsData?.totalExams ?? 0} đề thi`, up: true, hue: 195, iconPath: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H19a1 1 0 0 1 1 1v14M4 5.5V19a1 1 0 0 0 1 1h15M8 9h8M8 13h5' },
		{ label: 'Lượt hoàn thành thí nghiệm', value: (statsData?.labCompletions ?? 0).toLocaleString('en-US'), delta: `${statsData?.totalScenes ?? 0} mô phỏng`, up: true, hue: 150, iconPath: 'M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3' },
		{ label: 'Lượt truy cập hệ thống', value: (statsData?.systemVisits ?? 0).toLocaleString('en-US'), delta: `theo ${range === 'day' ? 'ngày' : range === 'week' ? 'tuần' : 'tháng'}`, up: true, hue: 70, iconPath: 'M3 12h4l3 8 4-16 3 8h4' },
		{ label: 'Lượt gọi AI', value: (statsData?.aiCalls ?? 0).toLocaleString('en-US'), delta: `theo ${range === 'day' ? 'ngày' : range === 'week' ? 'tuần' : 'tháng'}`, up: true, hue: 300, iconPath: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z' },
		{ label: 'Chi phí AI ước tính', value: formatUsd(statsData?.aiCostUsd ?? 0), delta: 'ước tính, không phải hóa đơn thật', up: true, hue: 350, iconPath: 'M12 3v18M8 7h6a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5h7' },
	];

	return (
		<div className="admin-dashboard" data-theme={theme}>
			{/* ===================== SIDEBAR ===================== */}
			<aside
				className="app-sidebar"
				style={{
					width: '244px',
					flex: 'none',
					position: 'relative',
					overflow: 'hidden',
					borderRight: '1px solid var(--border)',
					padding: '20px 16px',
					display: 'flex',
					flexDirection: 'column',
					gap: '4px',
					background: isDark
						? 'linear-gradient(177deg, #1e1e24 0%, #18181c 60%, #131316 100%)'
						: 'linear-gradient(177deg, oklch(0.97 0.018 285) 0%, #fbfaf7 38%, #faf8f4 100%)',
				}}
			>
				{/* Background decorative blobs */}
				<div
					style={{
						position: 'absolute',
						top: '-90px',
						left: '-50px',
						width: '240px',
						height: '240px',
						borderRadius: '50%',
						background: 'radial-gradient(circle, oklch(0.66 0.16 264 / .22), transparent 65%)',
						pointerEvents: 'none',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						bottom: '-70px',
						right: '-60px',
						width: '220px',
						height: '220px',
						borderRadius: '50%',
						background: 'radial-gradient(circle, oklch(0.6 0.18 350 / .14), transparent 65%)',
						pointerEvents: 'none',
					}}
				/>

				{/* Brand header */}
				<div
					onClick={() => setView('dashboard')}
					style={{
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						gap: '11px',
						padding: '6px 8px 20px',
						cursor: 'pointer',
					}}
				>
					<div
						style={{
							width: '34px',
							height: '34px',
							borderRadius: '10px',
							background: 'linear-gradient(150deg, oklch(0.66 0.16 264), oklch(0.55 0.17 285))',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 4px 12px -3px oklch(0.6 0.16 275 / .55)',
						}}
					>
						<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
							<path d="M9 3h6M10 3v5.5L5.2 16.8A2 2 0 0 0 7 20h10a2 2 0 0 0 1.8-3.2L14 8.5V3" />
							<path d="M8 14h8" />
						</svg>
					</div>
					<div>
						<div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-.2px', color: 'var(--text)' }}>SciLab</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '-1px' }}>
							<span
								style={{
									fontSize: '10px',
									fontWeight: 700,
									letterSpacing: '.3px',
									color: '#fff',
									background: 'linear-gradient(120deg, oklch(0.62 0.16 264), oklch(0.55 0.17 285))',
									padding: '1px 6px',
									borderRadius: '5px',
								}}
							>
								QUẢN TRỊ
							</span>
						</div>
					</div>
				</div>

				<div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '.6px', color: '#a3a196', textTransform: 'uppercase', padding: '6px 10px 4px' }}>
					Hệ thống
				</div>

				<div onClick={() => setView('dashboard')} style={navStyle('dashboard')} className="sidebar-link dash">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5" />
					</svg>
					Tổng quan
				</div>

				<div onClick={() => setView('users')} style={navStyle('users')} className="sidebar-link users">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM20 19v-1.4a3.5 3.5 0 0 0-2.6-3.4M15.5 4.8a3.2 3.2 0 0 1 0 6.2" />
					</svg>
					Người dùng
				</div>

				<div onClick={() => setView('classes')} style={navStyle('classes')} className="sidebar-link classes">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19a1 1 0 0 1 1 1v13.5M4 5.5V19a1 1 0 0 0 1 1h15M4 5.5H20M8 9h8M8 13h5" />
					</svg>
					Lớp học
				</div>

				<div onClick={() => setView('content')} style={navStyle('content')} className="sidebar-link content">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
						<path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
						<path d="M14 4v5h5M8 13h8M8 17h5" />
					</svg>
					Nội dung học tập
				</div>

				{/* Sidebar footer section */}
				<div style={{ position: 'relative', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
					<div
						onClick={toggleTheme}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '11px',
							padding: '10px 12px',
							borderRadius: '10px',
							fontSize: '14px',
							cursor: 'pointer',
							transition: 'background .18s, color .18s',
							color: 'var(--muted, #7c7a72)',
							fontWeight: 600,
						}}
						className="sidebar-link settings"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
							<path d="M12 3v2.2M12 18.8V21M5 12H3M21 12h-2M6 6l1.6 1.6M16.4 16.4 18 18M6 18l1.6-1.6M16.4 7.6 18 6" />
						</svg>
						Giao diện
						<span
							style={{
								marginLeft: 'auto',
								fontSize: '11px',
								fontWeight: 700,
								padding: '3px 8px',
								borderRadius: '999px',
								background: 'oklch(0.62 0.05 280 / .14)',
								color: 'var(--muted, #9a988f)',
							}}
						>
							{theme === 'dark' ? 'Tối' : 'Sáng'}
						</span>
					</div>

					<div
						onClick={dangXuat}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '11px',
							padding: '10px 12px',
							borderRadius: '10px',
							fontSize: '14px',
							cursor: 'pointer',
							transition: 'background .18s, color .18s',
							color: 'var(--muted, #7c7a72)',
							fontWeight: 600,
						}}
						className="sidebar-link logout"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
							<polyline points="16 17 21 12 16 7" />
							<line x1="21" y1="12" x2="9" y2="12" />
						</svg>
						Đăng xuất
					</div>

					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '10px',
							padding: '11px 10px',
							marginTop: '8px',
							borderRadius: '13px',
							background: 'linear-gradient(120deg, oklch(0.66 0.16 264 / .1), oklch(0.6 0.18 350 / .08))',
							border: '1px solid oklch(0.62 0.16 275 / .18)',
						}}
					>
						<div
							style={{
								width: '36px',
								height: '36px',
								borderRadius: '50%',
								background: 'linear-gradient(140deg, oklch(0.66 0.16 264), oklch(0.6 0.16 300))',
								flexShrink: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '13px',
								fontWeight: 700,
								color: '#fff',
								boxShadow: '0 3px 8px -2px oklch(0.6 0.16 280 / .5)',
							}}
						>
							{adminInitials}
						</div>
						<div style={{ minWidth: 0, flex: 1 }}>
							<div
								style={{
									fontSize: '13px',
									fontWeight: 700,
									color: 'var(--text)',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}
							>
								{activeAdminName}
							</div>
							<div
								style={{
									fontSize: '11px',
									color: '#8a887f',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}
							>
								Quản trị viên · SciLab
							</div>
						</div>
					</div>
				</div>
			</aside>

			{/* ===================== MAIN ===================== */}
			<main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
				{/* ──────────── 1. DASHBOARD VIEW ──────────── */}
				{view === 'dashboard' && (
					<div
						className="scl pg"
						style={{
							flex: 1,
							overflowY: 'auto',
							padding: '34px 44px 56px',
							background: isDark
								? 'radial-gradient(900px 540px at 12% -8%, oklch(0.66 0.16 264 / .1), transparent 60%), radial-gradient(820px 520px at 100% 4%, oklch(0.6 0.18 350 / .08), transparent 58%), var(--app-bg)'
								: 'radial-gradient(900px 540px at 12% -8%, oklch(0.66 0.16 264 / .1), transparent 60%), radial-gradient(820px 520px at 100% 4%, oklch(0.6 0.18 350 / .08), transparent 58%), var(--app-bg)',
						}}
					>
						<div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
							<div
								style={{
									display: 'flex',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
									gap: '20px',
									flexWrap: 'wrap',
									animation: 'fadeUp .5s cubic-bezier(.2,.7,.3,1) both',
								}}
							>
								<div>
									<div style={{ fontSize: '27px', fontWeight: 800, letterSpacing: '-.4px', color: 'var(--text)' }}>
										Bảng điều khiển hệ thống
									</div>
									<div style={{ fontSize: '15px', color: '#86847c', marginTop: '4px' }}>
										{todayLabel} · Toàn hệ thống SciLab
									</div>
								</div>
								<div
									style={{
										display: 'flex',
										gap: '4px',
										borderRadius: '11px',
										padding: '4px',
									}}
									className="surf"
								>
									{(['day', 'week', 'month'] as const).map((r) => {
										const active = range === r;
										const labelMap = { day: 'Ngày', week: 'Tuần', month: 'Tháng' };
										return (
											<div
												key={r}
												onClick={() => setRange(r)}
												style={{
													padding: '6px 14px',
													borderRadius: '8px',
													fontSize: '12.5px',
													fontWeight: 700,
													cursor: 'pointer',
													transition: 'all .15s',
													background: active ? 'oklch(0.62 0.16 264 / .14)' : 'transparent',
													color: active ? 'oklch(0.46 0.16 264)' : '#8a887f',
												}}
											>
												{labelMap[r]}
											</div>
										);
									})}
								</div>
							</div>

							{/* Stats Cards Grid */}
							<div className="stgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
								{statsDefinitions.map((st, i) => (
									<div
										key={st.label}
										className="surf"
										style={{
											position: 'relative',
											overflow: 'hidden',
											borderRadius: '16px',
											padding: '18px',
											display: 'flex',
											flexDirection: 'column',
											gap: '12px',
											boxShadow: '0 1px 3px rgba(60,50,90,.05)',
											animation: 'fadeUp .5s cubic-bezier(.2,.7,.3,1) both',
											animationDelay: `${0.04 + i * 0.05}s`,
										}}
									>
										<div style={{ display: 'flex', alignItems: 'center', justifyContainer: 'space-between', justifyContent: 'space-between' }}>
											<div
												style={{
													width: '40px',
													height: '40px',
													borderRadius: '11px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													background: `oklch(0.62 0.14 ${st.hue} / .12)`,
													color: `oklch(0.5 0.15 ${st.hue})`,
												}}
											>
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
													<path d={st.iconPath} />
												</svg>
											</div>
											<div
												style={{
													fontSize: '12px',
													fontWeight: 700,
													padding: '3px 8px',
													borderRadius: '999px',
													background: st.up ? 'oklch(0.6 0.13 150 / .14)' : 'oklch(0.6 0.03 40 / .12)',
													color: st.up ? 'oklch(0.46 0.14 150)' : 'oklch(0.5 0.02 40)',
												}}
											>
												{st.delta}
											</div>
										</div>
										<div>
											<div style={{ fontSize: '29px', fontWeight: 800, letterSpacing: '-.6px', lineHeight: 1, color: 'var(--text)' }}>
												{st.value}
											</div>
											<div style={{ fontSize: '13px', color: '#86847c', marginTop: '6px', fontWeight: 600 }}>
												{st.label}
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Charts layout */}
							<div className="chgrid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'start' }}>
								{/* DAU SVG Chart */}
								<div className="surf" style={{ borderRadius: '18px', padding: '22px', boxShadow: '0 1px 3px rgba(60,50,90,.05)', animation: 'fadeUp .55s both .16s' }}>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
										<div>
											<div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Người dùng hoạt động</div>
											<div style={{ fontSize: '12.5px', color: '#8a887f', marginTop: '2px' }}>Theo ngày · 14 ngày gần nhất</div>
										</div>
										<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'oklch(0.5 0.13 150)' }}>
											<span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'oklch(0.62 0.14 264)' }} />
											DAU
										</div>
									</div>
									<svg viewBox="0 0 600 200" preserveAspectRatio="none" style={{ width: '100%', height: '196px', marginTop: '6px', overflow: 'visible' }}>
										<defs>
											<linearGradient id="aArea" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="oklch(0.62 0.14 264)" stopOpacity="0.28" />
												<stop offset="100%" stopColor="oklch(0.62 0.14 264)" stopOpacity="0" />
											</linearGradient>
										</defs>
										<line x1="0" y1="50" x2="600" y2="50" stroke="var(--border)" strokeWidth="1" />
										<line x1="0" y1="100" x2="600" y2="100" stroke="var(--border)" strokeWidth="1" />
										<line x1="0" y1="150" x2="600" y2="150" stroke="var(--border)" strokeWidth="1" />
										<path d={dauArea} fill="url(#aArea)" />
										<polyline
											points={dauLine}
											fill="none"
											stroke="oklch(0.62 0.14 264)"
											strokeWidth="2.6"
											strokeLinecap="round"
											strokeLinejoin="round"
											style={{ strokeDasharray: '2000', animation: 'aDash 1.4s ease-out both' }}
										/>
										{dauDots.map((d, idx) => (
											<circle key={idx} cx={d.x} cy={d.y} r="2.6" fill="oklch(0.62 0.14 264)" />
										))}
									</svg>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', fontFamily: 'monospace', color: '#a3a196', marginTop: '4px' }}>
										<span>14 ngày trước</span>
										<span>Hôm nay</span>
									</div>
								</div>

								{/* AI Costs Bar Chart */}
								<div className="surf" style={{ borderRadius: '18px', padding: '22px', boxShadow: '0 1px 3px rgba(60,50,90,.05)', animation: 'fadeUp .55s both .22s' }}>
									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
										<div>
											<div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Lượt gọi AI &amp; chi phí</div>
											<div style={{ fontSize: '12.5px', color: '#8a887f', marginTop: '2px' }}>Theo tháng</div>
										</div>
									</div>
									<div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '150px' }}>
										{aiRawData.map((b, idx) => {
											const pct = ((b.cost / maxCost) * 100).toFixed(0);
											return (
												<div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', height: '100%', justifyContent: 'flex-end' }}>
													<div style={{ fontSize: '10.5px', fontWeight: 700, color: 'oklch(0.5 0.15 300)', fontFamily: 'monospace' }}>
														${b.cost}
													</div>
													<div
														style={{
															width: '100%',
															maxWidth: '30px',
															borderRadius: '7px 7px 3px 3px',
															background: 'linear-gradient(180deg, oklch(0.66 0.15 300), oklch(0.58 0.16 285))',
															transformOrigin: 'bottom',
															height: `${pct}%`,
															animation: 'aBarV .8s cubic-bezier(.2,.8,.3,1) both',
															animationDelay: `${0.1 + idx * 0.08}s`,
														}}
													/>
													<div style={{ fontSize: '11px', color: '#8a887f', fontWeight: 600 }}>{b.label}</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>

						{/* Railway Infra Metrics */}
						<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeUp .55s both .28s' }}>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
								<div>
									<div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Hạ tầng — Service backend (Railway)</div>
									<div style={{ fontSize: '12.5px', color: '#8a887f', marginTop: '2px' }}>CPU, bộ nhớ, mạng, request, tỉ lệ lỗi, thời gian phản hồi</div>
								</div>
								<div style={{ display: 'flex', gap: '4px', borderRadius: '11px', padding: '4px' }} className="surf">
									{(['1h', '6h', '1d', '7d', '30d'] as const).map((r) => {
										const active = railwayRange === r;
										return (
											<div
												key={r}
												onClick={() => setRailwayRange(r)}
												style={{
													padding: '6px 12px',
													borderRadius: '8px',
													fontSize: '12.5px',
													fontWeight: 700,
													cursor: 'pointer',
													background: active ? 'oklch(0.62 0.16 264 / .14)' : 'transparent',
													color: active ? 'oklch(0.46 0.16 264)' : '#8a887f',
												}}
											>
												{r}
											</div>
										);
									})}
								</div>
							</div>

							{!railwayMetrics?.configured ? (
								<div className="surf" style={{ borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#8a887f', fontSize: '13.5px' }}>
									Railway chưa được cấu hình (thiếu <code>RAILWAY_API_TOKEN</code> / <code>RAILWAY_ENVIRONMENT_ID</code> / <code>RAILWAY_BACKEND_SERVICE_ID</code> ở backend .env).
								</div>
							) : (
								<div className="chgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
									<div className="surf" style={{ borderRadius: '18px', padding: '18px' }}>
										<LineChart
											title="CPU (vCPU)"
											xAxis={railwayXAxis}
											yAxis={[(railwayMetrics.cpu ?? []).map((p) => Number(p.value.toFixed(4)))]}
											yLabel={['CPU']}
											height={220}
											formatY={(v: number) => v.toFixed(4)}
											theme={theme}
										/>
									</div>
									<div className="surf" style={{ borderRadius: '18px', padding: '18px' }}>
										<LineChart
											title="Bộ nhớ (GB)"
											xAxis={railwayXAxis}
											yAxis={[(railwayMetrics.memory ?? []).map((p) => Number(p.value.toFixed(3)))]}
											yLabel={['Memory']}
											height={220}
											formatY={(v: number) => `${v.toFixed(2)} GB`}
											theme={theme}
										/>
									</div>
									<div className="surf" style={{ borderRadius: '18px', padding: '18px' }}>
										<LineChart
											title="Network Traffic (GB)"
											xAxis={railwayXAxis}
											yAxis={[
												(railwayMetrics.networkRx ?? []).map((p) => Number(p.value.toFixed(4))),
												(railwayMetrics.networkTx ?? []).map((p) => Number(p.value.toFixed(4))),
											]}
											yLabel={['Ingress (RX)', 'Egress (TX)']}
											height={220}
											formatY={(v: number) => `${v.toFixed(3)} GB`}
											theme={theme}
										/>
									</div>
									<div className="surf" style={{ borderRadius: '18px', padding: '18px' }}>
										{railwayNotSupported.has('requests') ? (
											<div style={{ padding: '40px 0', textAlign: 'center', color: '#8a887f', fontSize: '13px' }}>
												Requests: chưa khả dụng qua API công khai của Railway.
											</div>
										) : (
											<ColumnChart
												title={`Requests (tổng: ${railwayMetrics.requests?.total ?? 0})`}
												xAxis={railwayXAxis}
												yAxis={[(railwayMetrics.requests?.trend ?? []).map((p) => p.value)]}
												yLabel={['Requests']}
												height={220}
												formatY={(v: number) => v.toFixed(0)}
												theme={theme}
											/>
										)}
									</div>
									<div className="surf" style={{ borderRadius: '18px', padding: '18px' }}>
										{railwayNotSupported.has('errorRate') ? (
											<div style={{ padding: '40px 0', textAlign: 'center', color: '#8a887f', fontSize: '13px' }}>
												Error rate: chưa khả dụng qua API công khai của Railway.
											</div>
										) : (
											<LineChart
												title={`Request Error Rate (${railwayMetrics.errorRate?.percent ?? 0}%)`}
												xAxis={(railwayMetrics.errorRate?.trend ?? []).map((p) => railwayTsLabel(p.ts))}
												yAxis={[(railwayMetrics.errorRate?.trend ?? []).map((p) => p.value)]}
												yLabel={['Error %']}
												height={220}
												formatY={(v: number) => `${v}%`}
												theme={theme}
											/>
										)}
									</div>
									<div className="surf" style={{ borderRadius: '18px', padding: '18px' }}>
										{railwayNotSupported.has('responseTime') ? (
											<div style={{ padding: '40px 0', textAlign: 'center', color: '#8a887f', fontSize: '13px' }}>
												Response time: chưa khả dụng qua API công khai của Railway.
											</div>
										) : (
											<LineChart
												title="Response Time (ms)"
												xAxis={(railwayMetrics.responseTime?.trend ?? []).map((p) => railwayTsLabel(p.ts))}
												yAxis={[
													(railwayMetrics.responseTime?.trend ?? []).map((p) => p.p50),
													(railwayMetrics.responseTime?.trend ?? []).map((p) => p.p90),
													(railwayMetrics.responseTime?.trend ?? []).map((p) => p.p95),
													(railwayMetrics.responseTime?.trend ?? []).map((p) => p.p99),
												]}
												yLabel={['p50', 'p90', 'p95', 'p99']}
												height={220}
												formatY={(v: number) => `${v}ms`}
												theme={theme}
											/>
										)}
									</div>
								</div>
							)}
						</div>
						</div>
					</div>
				)}

				{/* ──────────── 2. USERS MANAGEMENT VIEW ──────────── */}
				{view === 'users' && (
					<div className="scl pg" style={{ flex: 1, overflowY: 'auto', padding: '34px 44px 56px', background: 'var(--app-bg)' }}>
						<div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
							<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', animation: 'fadeUp .5s both' }}>
								<div>
									<div style={{ fontSize: '27px', fontWeight: 800, letterSpacing: '-.4px', color: 'var(--text)' }}>Quản lý người dùng</div>
									<div style={{ fontSize: '15px', color: '#86847c', marginTop: '4px' }}>
										{filteredUsers.length} tài khoản · {users.filter((u) => u.status === 'locked').length} đã khóa
									</div>
								</div>
								<div style={{ display: 'flex', gap: '9px' }}>
									<div
										onClick={() => setModal('import')}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											padding: '11px 16px',
											borderRadius: '11px',
											color: 'var(--text)',
											fontSize: '13.5px',
											fontWeight: 700,
											cursor: 'pointer',
										}}
										className="surf"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.14 150)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
											<path d="M12 3v12M8 11l4 4 4-4M4 20h16" />
										</svg>
										Import Excel
									</div>
									<div
										onClick={openNewUser}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											padding: '11px 16px',
											borderRadius: '11px',
											background: 'linear-gradient(150deg, oklch(0.64 0.16 264), oklch(0.55 0.17 282))',
											color: '#fff',
											fontSize: '13.5px',
											fontWeight: 700,
											cursor: 'pointer',
											boxShadow: '0 6px 16px -6px oklch(0.6 0.16 264 / .55)',
										}}
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M12 5v14M5 12h14" />
										</svg>
										Thêm người dùng
									</div>
								</div>
							</div>

							{/* Filters Bar */}
							<div
								className="surf"
								style={{
									display: 'flex',
									gap: '12px',
									flexWrap: 'wrap',
									alignItems: 'center',
									borderRadius: '14px',
									padding: '12px 14px',
									boxShadow: '0 1px 3px rgba(60,50,90,.05)',
								}}
							>
								<div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a196" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
										<circle cx="11" cy="11" r="7" />
										<path d="m20 20-3.2-3.2" />
									</svg>
									<input
										className="fld"
										value={userSearch}
										onChange={(e) => setUserSearch(e.target.value)}
										placeholder="Tìm theo tên hoặc email…"
										style={{
											width: '100%',
											padding: '10px 12px 10px 36px',
											borderRadius: '10px',
											fontSize: '13.5px',
											outline: 'none',
										}}
									/>
								</div>
								<SciDropdown
									value={userRole}
									options={[
										{ value: 'all', label: 'Tất cả vai trò' },
										{ value: 'student', label: 'Học sinh' },
										{ value: 'teacher', label: 'Giáo viên' },
										{ value: 'admin', label: 'Quản trị' },
									]}
									onChange={setUserRole}
									variant="filter"
									accent={264}
									dark={isDark}
									style={{ width: '190px' }}
								/>
								<SciDropdown
									value={userStatus}
									options={[
										{ value: 'all', label: 'Mọi trạng thái' },
										{ value: 'active', label: 'Đang hoạt động' },
										{ value: 'locked', label: 'Đã khóa' },
									]}
									onChange={setUserStatus}
									variant="filter"
									accent={150}
									dark={isDark}
									style={{ width: '200px' }}
								/>
							</div>

							{/* Users Table */}
							<div className="surf tblwrap" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(60,50,90,.05)' }}>
								<table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
									<thead>
										<tr style={{ background: 'var(--bg)' }}>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'left' }}>Người dùng</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Vai trò</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Trạng thái</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Level</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>XP</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Streak</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'right' }}>Hành động</th>
										</tr>
									</thead>
									<tbody>
										{filteredUsers.map((u) => (
											<tr key={u.id} className="rowln" style={{ transition: 'background .12s' }}>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'left' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
														<div style={_avatarStyle(_roleHue(u.role))}>{_initials(u.name)}</div>
														<div style={{ minWidth: 0 }}>
															<div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
																{u.name}
															</div>
															<div style={{ fontSize: '12px', color: '#8a887f', fontFamily: 'monospace' }}>{u.email}</div>
														</div>
													</div>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
													<SciDropdown
														value={u.role}
														options={[
															{ value: 'student', label: 'Học sinh' },
															{ value: 'teacher', label: 'Giáo viên' },
															{ value: 'admin', label: 'Quản trị' },
														]}
														onChange={(role) => changeUserRoleV(u, role)}
														variant="badge"
														accent={_roleHue(u.role)}
														dark={isDark}
														style={{ display: 'inline-flex', width: '110px' }}
													/>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
													<span style={_statusBadgeStyle(u.status === 'active', isDark)}>
														{u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
													</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center', color: 'var(--text)' }}>
													<span style={{ fontWeight: 700 }}>{u.level}</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center', color: 'var(--text)' }}>
													<span style={{ fontFamily: 'monospace', color: '#6a6860' }}>
														{typeof u.xp === 'number' ? u.xp.toLocaleString('en-US') : u.xp}
													</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
													<span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700, color: 'oklch(0.6 0.16 45)' }}>
														<svg width="13" height="13" viewBox="0 0 24 24" fill="oklch(0.68 0.17 55)" stroke="none">
															<path d="M12 2c1 3-1 4-1 6a3 3 0 0 0 6 0c0-1 0-2-.5-3 2 2 3.5 4.5 3.5 7a8 8 0 1 1-16 0c0-3 2-6 5-8-.5 2 0 3 1 3.5C13 12 11 8 12 2Z" />
														</svg>
														{u.streak}
													</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
													<div style={{ display: 'inline-flex', gap: '6px' }}>
														<div
															onClick={() => toggleUserLock(u)}
															title="Khóa / Mở khóa"
															className="actBtn lock-btn"
															style={u.status === 'locked' ? { borderColor: 'oklch(0.6 0.16 45 / .5)', color: 'oklch(0.55 0.16 45)' } : {}}
														>
															<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
																{u.status === 'locked' ? (
																	<path d="M7 11V8a5 5 0 0 1 9.9-1M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
																) : (
																	<path d="M8 11V7a4 4 0 0 1 8 0v4M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
																)}
															</svg>
														</div>
														<div onClick={() => resetPwd(u)} title="Reset mật khẩu" className="actBtn reset-btn">
															<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
																<path d="M4 12a8 8 0 1 1 2.3 5.6M4 20v-4h4" />
															</svg>
														</div>
														<div onClick={() => editUser(u)} title="Sửa" className="actBtn edit-btn">
															<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
																<path d="M14.5 4.5 19.5 9.5M4 20l1-4L16 5l3 3L8 19l-4 1Z" />
															</svg>
														</div>
														<div onClick={() => removeUser(u)} title="Xóa" className="actBtn remove-btn">
															<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
																<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
															</svg>
														</div>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{filteredUsers.length === 0 && (
									<div style={{ padding: '42px', textAlign: 'center', color: '#a3a196', fontSize: '14px' }}>
										Không có người dùng phù hợp bộ lọc.
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* ──────────── 3. CLASSES MANAGEMENT VIEW ──────────── */}
				{view === 'classes' && (
					<div className="scl pg" style={{ flex: 1, overflowY: 'auto', padding: '34px 44px 56px', background: 'var(--app-bg)' }}>
						<div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
							<div style={{ animation: 'fadeUp .5s both' }}>
								<div style={{ fontSize: '27px', fontWeight: 800, letterSpacing: '-.4px', color: 'var(--text)' }}>Lớp học toàn hệ thống</div>
								<div style={{ fontSize: '15px', color: '#86847c', marginTop: '4px' }}>
									{filteredClasses.length} lớp · {uniqueTeachers.length} giáo viên phụ trách
								</div>
							</div>

							{/* Filters Bar */}
							<div
								className="surf"
								style={{
									display: 'flex',
									gap: '12px',
									flexWrap: 'wrap',
									alignItems: 'center',
									borderRadius: '14px',
									padding: '12px 14px',
									boxShadow: '0 1px 3px rgba(60,50,90,.05)',
								}}
							>
								<SciDropdown
									value={clsTeacher}
									options={[{ value: 'all', label: 'Tất cả giáo viên' }].concat(
										uniqueTeachers.map((t) => ({ value: t.id, label: t.name }))
									)}
									onChange={setClsTeacher}
									variant="filter"
									accent={350}
									dark={isDark}
									style={{ flex: 1, minWidth: '200px' }}
								/>
								<SciDropdown
									value={clsSubject}
									options={[
										{ value: 'all', label: 'Tất cả môn' },
										{ value: 'Hóa học', label: 'Hóa học' },
										{ value: 'Vật lý', label: 'Vật lý' },
										{ value: 'Toán', label: 'Toán' },
									]}
									onChange={setClsSubject}
									variant="filter"
									accent={264}
									dark={isDark}
									style={{ width: '170px' }}
								/>
								<SciDropdown
									value={clsGrade}
									options={[
										{ value: 'all', label: 'Tất cả khối' },
										{ value: '10', label: 'Khối 10' },
										{ value: '11', label: 'Khối 11' },
										{ value: '12', label: 'Khối 12' },
									]}
									onChange={setClsGrade}
									variant="filter"
									accent={195}
									dark={isDark}
									style={{ width: '156px' }}
								/>
							</div>

							{/* Classes Table */}
							<div className="surf tblwrap" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(60,50,90,.05)' }}>
								<table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
									<thead>
										<tr style={{ background: 'var(--bg)' }}>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'left' }}>Lớp</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'left' }}>Giáo viên phụ trách</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Môn</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Khối</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Sĩ số</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Trạng thái</th>
											<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'right' }}>Hành động</th>
										</tr>
									</thead>
									<tbody>
										{filteredClasses.map((c) => (
											<tr key={c.id} className="rowln" style={{ transition: 'background .12s' }}>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'left' }}>
													<div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
														<div
															style={{
																width: '34px',
																height: '34px',
																borderRadius: '9px',
																flexShrink: 0,
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																fontSize: '11px',
																fontWeight: 800,
																color: `oklch(0.46 0.15 ${_subjHue(c.subject)})`,
																background: `oklch(0.62 0.14 ${_subjHue(c.subject)} / .14)`,
															}}
														>
															{c.grade}
														</div>
														<div style={{ fontWeight: 700, color: 'var(--text)' }}>{c.name}</div>
													</div>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'left' }}>
													<SciDropdown
														value={c.teacherId}
														options={uniqueTeachers.map((t) => ({ value: t.id, label: t.name }))}
														onChange={(val) => reassignClassV(c, val)}
														variant="plain"
														accent={350}
														dark={isDark}
														style={{ maxWidth: '200px' }}
													/>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
													<span style={_badgeStyle(_subjHue(c.subject), isDark)}>{c.subject}</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center', color: 'var(--text)' }}>
													<span style={{ fontWeight: 700 }}>{c.grade}</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center', color: 'var(--text)' }}>
													<span style={{ fontFamily: 'monospace', color: '#6a6860' }}>{c.students}</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
													<span style={_statusBadgeStyle(c.status === 'active', isDark)}>
														{c.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
													</span>
												</td>
												<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
													<div style={{ display: 'inline-flex', gap: '6px' }}>
														<div
															onClick={() => toggleClassLock(c)}
															title="Khóa / Mở khóa lớp"
															className="actBtn lock-btn"
															style={c.status === 'locked' ? { borderColor: 'oklch(0.6 0.16 45 / .5)', color: 'oklch(0.55 0.16 45)' } : {}}
														>
															<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
																{c.status === 'locked' ? (
																	<path d="M7 11V8a5 5 0 0 1 9.9-1M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
																) : (
																	<path d="M8 11V7a4 4 0 0 1 8 0v4M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" />
																)}
															</svg>
														</div>
														<div onClick={() => removeClass(c)} title="Xóa lớp" className="actBtn remove-btn">
															<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
																<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
															</svg>
														</div>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{filteredClasses.length === 0 && (
									<div style={{ padding: '42px', textAlign: 'center', color: '#a3a196', fontSize: '14px' }}>
										Không có lớp phù hợp bộ lọc.
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* ──────────── 4. CONTENT MANAGEMENT VIEW ──────────── */}
				{view === 'content' && (
					<div className="scl pg" style={{ flex: 1, overflowY: 'auto', padding: '34px 44px 56px', background: 'var(--app-bg)' }}>
						<div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
							<div style={{ animation: 'fadeUp .5s both' }}>
								<div style={{ fontSize: '27px', fontWeight: 800, letterSpacing: '-.4px', color: 'var(--text)' }}>Quản lý nội dung học tập</div>
								<div style={{ fontSize: '15px', color: '#86847c', marginTop: '4px' }}>Thí nghiệm, câu hỏi, đề thi &amp; danh mục hệ thống</div>
							</div>

							{/* Tabs Navigation */}
							<div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
								{([
									{ key: 'sim', label: 'Thí nghiệm mô phỏng', count: 0 },
									{ key: 'questions', label: 'Kho câu hỏi', count: questions.filter((q) => q.status === 'pending').length },
									{ key: 'exams', label: 'Đề thi', count: exams.filter((x) => x.status === 'pending').length },
									{ key: 'catalog', label: 'Danh mục', count: 0 },
								] as const).map((t) => {
									const active = contentTab === t.key;
									return (
										<div
											key={t.key}
											onClick={() => setContentTab(t.key)}
											style={{
												position: 'relative',
												padding: '11px 14px 13px',
												fontSize: '14px',
												fontWeight: 700,
												cursor: 'pointer',
												marginBottom: '-1px',
												borderBottom: `2.5px solid ${active ? 'oklch(0.6 0.16 264)' : 'transparent'}`,
												color: active ? 'oklch(0.48 0.16 264)' : '#8a887f',
												transition: 'color .15s',
											}}
										>
											{t.label}
											{t.count > 0 && (
												<span
													style={{
														marginLeft: '7px',
														fontSize: '11px',
														fontWeight: 700,
														padding: '1px 7px',
														borderRadius: '999px',
														background: 'oklch(0.6 0.18 25 / .16)',
														color: 'oklch(0.52 0.19 25)',
													}}
												>
													{t.count}
												</span>
											)}
										</div>
									);
								})}
							</div>

							{/* ── Tab: Simulations ── */}
							{contentTab === 'sim' && (
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
									{sims.map((e) => (
										<div
											key={e.id}
											className="surf"
											style={{
												borderRadius: '16px',
												overflow: 'hidden',
												boxShadow: '0 1px 3px rgba(60,50,90,.05)',
												display: 'flex',
												flexDirection: 'column',
											}}
										>
											<div
												style={{
													height: '96px',
													position: 'relative',
													background: `repeating-linear-gradient(135deg, oklch(0.62 0.13 ${e.hue} / .16) 0 10px, oklch(0.62 0.13 ${e.hue} / .09) 10px 20px)`,
												}}
											>
												<span style={{ position: 'absolute', top: '10px', left: '10px', ..._badgeStyle(e.hue, isDark), backdropFilter: 'blur(4px)' }}>
													{e.subject}
												</span>
												<span style={{ position: 'absolute', top: '10px', right: '10px', ..._pubBadgeStyle(e.pub) }}>
													{e.pub ? 'Đã xuất bản' : 'Bản nháp'}
												</span>
											</div>
											<div style={{ padding: '15px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
												<div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.25, color: 'var(--text)' }}>{e.name}</div>
												<div style={{ fontSize: '12px', color: '#8a887f', display: 'flex', alignItems: 'center', gap: '6px' }}>
													<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
														<path d="M12 6v6l4 2" />
														<circle cx="12" cy="12" r="9" />
													</svg>
													{e.plays.toLocaleString('en-US')} lượt hoàn thành
												</div>
												<div style={{ display: 'flex', gap: '8px', marginTop: 'auto', alignItems: 'center' }}>
													<div
														onClick={() => toggleSimPub(e)}
														style={{
															flex: 1,
															textAlign: 'center',
															padding: '8px',
															borderRadius: '9px',
															fontSize: '13px',
															fontWeight: 700,
															cursor: 'pointer',
															background: e.pub ? 'var(--bg)' : 'linear-gradient(150deg, oklch(0.55 0.14 150), oklch(0.5 0.15 155))',
															border: e.pub ? '1px solid var(--border)' : 'none',
															color: e.pub ? '#6a6860' : '#fff',
														}}
													>
														{e.pub ? 'Gỡ xuất bản' : 'Xuất bản'}
													</div>
													<SciDropdown
														value={e.subject}
														options={[
															{ value: 'Hóa học', label: 'Hóa học' },
															{ value: 'Vật lý', label: 'Vật lý' },
															{ value: 'Toán', label: 'Toán' },
														]}
														onChange={(val) => assignSimSubjectV(e, val)}
														variant="plain"
														accent={264}
														dark={isDark}
														style={{ width: '130px' }}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							)}

							{/* ── Tab: Question Bank ── */}
							{contentTab === 'questions' && (
								<div className="surf tblwrap" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(60,50,90,.05)' }}>
									<table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
										<thead>
											<tr style={{ background: 'var(--bg)' }}>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'left' }}>Câu hỏi</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Môn</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Loại</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Độ khó</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Trạng thái</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'right' }}>Kiểm duyệt</th>
											</tr>
										</thead>
										<tbody>
											{questions.map((q) => {
												const badgeQ = (st: string) => {
													if (st === 'approved') return _badgeStyle(150, isDark);
													if (st === 'rejected') {
														return {
															display: 'inline-flex',
															padding: '4px 11px',
															borderRadius: '999px',
															fontSize: '12px',
															fontWeight: 700,
															background: 'oklch(0.6 0.18 25 / .14)',
															color: 'oklch(0.52 0.19 25)',
														} as React.CSSProperties;
													}
													return {
														display: 'inline-flex',
														padding: '4px 11px',
														borderRadius: '999px',
														fontSize: '12px',
														fontWeight: 700,
														background: 'oklch(0.7 0.15 70 / .18)',
														color: 'oklch(0.5 0.14 65)',
													} as React.CSSProperties;
												};
												const labelQ = (st: string) => (st === 'approved' ? 'Đã duyệt' : st === 'rejected' ? 'Từ chối' : 'Chờ duyệt');

												return (
													<tr key={q.id} className="rowln" style={{ transition: 'background .12s' }}>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'left', color: 'var(--text)' }}>
															<div style={{ maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
																{q.text}
															</div>
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
															<span style={_badgeStyle(_subjHue(q.subject), isDark)}>{q.subject}</span>
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center', color: '#6a6860' }}>
															<span>{q.type}</span>
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
															<span style={_badgeStyle(_diffHue(q.difficulty), isDark)}>{q.difficulty}</span>
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
															<span style={badgeQ(q.status)}>{labelQ(q.status)}</span>
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
															<div style={{ display: 'inline-flex', gap: '6px' }}>
																<div
																	onClick={() => approveQ(q)}
																	title="Duyệt"
																	className="actBtn"
																	style={{ borderColor: 'oklch(0.6 0.14 150 / .5)', color: 'oklch(0.5 0.14 150)' }}
																>
																	<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
																		<path d="M5 12.5 10 17l9-10" />
																	</svg>
																</div>
																<div onClick={() => rejectQ(q)} title="Từ chối" className="actBtn remove-btn">
																	<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
																		<path d="M6 6l12 12M18 6 6 18" />
																	</svg>
																</div>
															</div>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}

							{/* ── Tab: Exams ── */}
							{contentTab === 'exams' && (
								<div className="surf tblwrap" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(60,50,90,.05)' }}>
									<table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
										<thead>
											<tr style={{ background: 'var(--bg)' }}>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'left' }}>Đề thi</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Môn</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Khối</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Số câu</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'center' }}>Trạng thái</th>
												<th style={{ padding: '13px 16px', fontSize: '11.5px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: '#a3a196', textAlign: 'right' }}>Kiểm duyệt</th>
											</tr>
										</thead>
										<tbody>
											{exams.map((x) => {
												const badgeX = (st: string) => {
													if (st === 'approved') return _badgeStyle(150, isDark);
													if (st === 'rejected') {
														return {
															display: 'inline-flex',
															padding: '4px 11px',
															borderRadius: '999px',
															fontSize: '12px',
															fontWeight: 700,
															background: 'oklch(0.6 0.18 25 / .14)',
															color: 'oklch(0.52 0.19 25)',
														} as React.CSSProperties;
													}
													return {
														display: 'inline-flex',
														padding: '4px 11px',
														borderRadius: '999px',
														fontSize: '12px',
														fontWeight: 700,
														background: 'oklch(0.7 0.15 70 / .18)',
														color: 'oklch(0.5 0.14 65)',
													} as React.CSSProperties;
												};
												const labelX = (st: string) => (st === 'approved' ? 'Đã duyệt' : st === 'rejected' ? 'Từ chối' : 'Chờ duyệt');

												return (
													<tr key={x.id} className="rowln" style={{ transition: 'background .12s' }}>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'left', color: 'var(--text)', fontWeight: 700 }}>
															{x.name}
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
															<span style={_badgeStyle(_subjHue(x.subject), isDark)}>{x.subject}</span>
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>
															{x.grade}
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center', color: '#6a6860', fontFamily: 'monospace' }}>
															{x.questions}
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
															<span style={badgeX(x.status)}>{labelX(x.status)}</span>
														</td>
														<td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
															<div style={{ display: 'inline-flex', gap: '6px' }}>
																<div
																	onClick={() => approveX(x)}
																	title="Duyệt"
																	className="actBtn"
																	style={{ borderColor: 'oklch(0.6 0.14 150 / .5)', color: 'oklch(0.5 0.14 150)' }}
																>
																	<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
																		<path d="M5 12.5 10 17l9-10" />
																	</svg>
																</div>
																<div onClick={() => rejectX(x)} title="Từ chối" className="actBtn remove-btn">
																	<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
																		<path d="M6 6l12 12M18 6 6 18" />
																	</svg>
																</div>
															</div>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}

							{/* ── Tab: Catalog System ── */}
							{contentTab === 'catalog' && (
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
									{([
										{ key: 'subjects', title: 'Môn học', hue: 264, iconPath: 'M12 3 2 8l10 5 10-5-10-5ZM4 10v6l8 4 8-4v-6' },
										{ key: 'grades', title: 'Khối', hue: 195, iconPath: 'M4 20V4M4 20h16M8 16V9M12 16V6M16 16v-4' },
										{ key: 'topics', title: 'Chủ đề', hue: 150, iconPath: 'M7 7h.01M3 6a3 3 0 0 1 3-3h6l9 9-9 9-9-9V6Z' },
										{ key: 'difficulties', title: 'Độ khó', hue: 70, iconPath: 'M12 2 15 9l7 .5-5.5 4.5 1.8 6.8L12 17l-6.3 3.8L7.5 14 2 9.5 9 9l3-7Z' },
										{ key: 'qtypes', title: 'Loại câu hỏi', hue: 300, iconPath: 'M9 11a3 3 0 1 1 4 2.8c-.8.4-1 .8-1 1.7M12 18h.01M4 5h16v11H8l-4 4V5Z' },
									] as const).map((d) => (
										<div
											key={d.key}
											className="surf"
											style={{
												borderRadius: '16px',
												padding: '18px',
												boxShadow: '0 1px 3px rgba(60,50,90,.05)',
												display: 'flex',
												flexDirection: 'column',
												gap: '12px',
											}}
										>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
												<div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
													<div
														style={{
															width: '30px',
															height: '30px',
															borderRadius: '9px',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															background: `oklch(0.62 0.14 ${d.hue} / .14)`,
															color: `oklch(0.5 0.15 ${d.hue})`,
														}}
													>
														<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
															<path d={d.iconPath} />
														</svg>
													</div>
													<div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>{d.title}</div>
												</div>
												<div
													onClick={() => addCat(d.key, d.title)}
													title="Thêm"
													style={{
														width: '28px',
														height: '28px',
														borderRadius: '8px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														background: 'var(--bg)',
														border: '1px solid var(--border)',
														cursor: 'pointer',
														color: '#6a6860',
													}}
												>
													<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
														<path d="M12 5v14M5 12h14" />
													</svg>
												</div>
											</div>
											<div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
												{catalog[d.key].map((it) => (
													<div
														key={it}
														style={{
															display: 'inline-flex',
															alignItems: 'center',
															gap: '6px',
															padding: '6px 10px',
															borderRadius: '999px',
															background: 'var(--bg)',
															border: '1px solid var(--border)',
															fontSize: '12.5px',
															fontWeight: 600,
															color: 'var(--text)',
														}}
													>
														{it}
														<span
															onClick={() => removeCat(d.key, it)}
															style={{ cursor: 'pointer', color: '#b3b1a8', display: 'inline-flex' }}
														>
															<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
																<path d="M6 6l12 12M18 6 6 18" />
															</svg>
														</span>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</main>

			{/* ==================== CONFIRM OVERLAY ==================== */}
			{confirmConfig && (
				<div
					onClick={closeConfirm}
					style={{
						position: 'absolute',
						inset: 0,
						zIndex: 85,
						background: 'rgba(20,18,28,.5)',
						backdropFilter: 'blur(3px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '24px',
						animation: 'fadeUp .2s both',
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="surf"
						style={{
							width: '100%',
							maxWidth: '400px',
							borderRadius: '22px',
							padding: '30px 28px 24px',
							boxShadow: '0 30px 70px -20px rgba(0,0,0,.45)',
							textAlign: 'center',
						}}
					>
						{(() => {
							const toneHue = confirmConfig.tone === 'danger' ? 25 : confirmConfig.tone === 'warn' ? 55 : 264;
							const iconMap: Record<string, string> = {
								lock: 'M8 11V7a4 4 0 0 1 8 0v4M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
								unlock: 'M7 11V8a5 5 0 0 1 9.9-1M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
								key: 'M4 12a8 8 0 1 1 2.3 5.6M4 20v-4h4',
								trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13',
								eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
								x: 'M6 6l12 12M18 6 6 18',
							};
							const pathD = iconMap[confirmConfig.icon] || iconMap.x;
							return (
								<>
									<div
										style={{
											width: '56px',
											height: '56px',
											margin: '0 auto',
											borderRadius: '17px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											background: `oklch(0.62 0.16 ${toneHue} / .14)`,
											color: `oklch(0.5 0.17 ${toneHue})`,
										}}
									>
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
											<path d={pathD} />
										</svg>
									</div>
									<div style={{ fontSize: '18.5px', fontWeight: 800, letterSpacing: '-.2px', marginTop: '16px', color: 'var(--text)' }}>
										{confirmConfig.title}
									</div>
									<div style={{ fontSize: '14px', color: '#7c7a72', marginTop: '9px', lineHeight: 1.6, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
										{confirmConfig.message}
									</div>
									<div style={{ display: 'flex', gap: '11px', marginTop: '26px' }}>
										<div
											onClick={closeConfirm}
											style={{
												flex: 1,
												padding: '12px',
												borderRadius: '12px',
												border: '1px solid var(--border)',
												fontSize: '14px',
												fontWeight: 700,
												cursor: 'pointer',
												color: 'var(--text)',
											}}
										>
											Hủy
										</div>
										<div
											onClick={runConfirm}
											style={{
												flex: 1,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												padding: '12px',
												borderRadius: '12px',
												color: '#fff',
												fontSize: '14px',
												fontWeight: 700,
												cursor: 'pointer',
												background: `linear-gradient(150deg, oklch(0.58 0.17 ${toneHue}), oklch(0.5 0.18 ${toneHue}))`,
												boxShadow: `0 8px 18px -8px oklch(0.55 0.17 ${toneHue} / .6)`,
											}}
										>
											{confirmConfig.confirmLabel}
										</div>
									</div>
								</>
							);
						})()}
					</div>
				</div>
			)}

			{/* ==================== TOAST MESSAGES ==================== */}
			{toastMsg && (
				<div
					style={{
						position: 'absolute',
						bottom: '26px',
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 60,
						display: 'flex',
						alignItems: 'center',
						gap: '10px',
						padding: '12px 18px',
						borderRadius: '12px',
						background: 'oklch(0.28 0.03 275)',
						color: '#fff',
						fontSize: '13.5px',
						fontWeight: 600,
						boxShadow: '0 14px 34px -12px rgba(0,0,0,.5)',
						animation: 'aToast .3s cubic-bezier(.2,.8,.3,1) both',
					}}
				>
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="oklch(0.75 0.15 150)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M5 12.5 10 17l9-10" />
					</svg>
					{toastMsg}
				</div>
			)}

			{/* ==================== MODALS ==================== */}
			{modal && (
				<div
					onClick={() => setModal(null)}
					style={{
						position: 'absolute',
						inset: 0,
						zIndex: 70,
						background: 'rgba(20,18,28,.5)',
						backdropFilter: 'blur(3px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '24px',
						animation: 'fadeUp .2s both',
					}}
				>
					{/* Modal 1: Import Excel */}
					{modal === 'import' && (
						<div
							onClick={(e) => e.stopPropagation()}
							className="surf"
							style={{
								width: '100%',
								maxWidth: '520px',
								borderRadius: '20px',
								padding: '26px',
								boxShadow: '0 30px 70px -20px rgba(0,0,0,.4)',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
								<div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text)' }}>Import người dùng từ Excel</div>
								<div onClick={() => setModal(null)} style={{ cursor: 'pointer', color: '#a3a196' }}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
										<path d="M6 6l12 12M18 6 6 18" />
									</svg>
								</div>
							</div>
							<div style={{ fontSize: '13.5px', color: '#86847c', marginBottom: '16px' }}>
								Tải lên file <b>.xlsx</b> theo mẫu. Hệ thống sẽ khớp các cột và tạo tài khoản hàng loạt.
							</div>
							<div
								style={{
									border: '2px dashed var(--border)',
									borderRadius: '14px',
									padding: '30px',
									textAlignment: 'center',
									textAlign: 'center',
									background: 'var(--bg)',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: '10px',
								}}
							>
								<div
									style={{
										width: '46px',
										height: '46px',
										borderRadius: '12px',
										background: 'oklch(0.6 0.14 150 / .14)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: 'oklch(0.5 0.14 150)',
									}}
								>
									<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
										<path d="M12 3v12M8 11l4 4 4-4M4 20h16" />
									</svg>
								</div>
								<div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
									{importFile ? importFile.name : 'Kéo thả file vào đây'}
								</div>
								<div style={{ fontSize: '12.5px', color: '#8a887f' }}>hoặc</div>
								<input
									id="admin-import-file-input"
									type="file"
									accept=".xlsx,.xls"
									style={{ display: 'none' }}
									onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
								/>
								<div
									onClick={() => document.getElementById('admin-import-file-input')?.click()}
									style={{
										padding: '9px 16px',
										borderRadius: '10px',
										background: 'var(--surface)',
										border: '1px solid var(--border)',
										fontSize: '13px',
										fontWeight: 700,
										cursor: 'pointer',
										color: 'var(--text)',
									}}
								>
									Chọn file
								</div>
							</div>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									marginTop: '14px',
									padding: '11px 14px',
									borderRadius: '11px',
									background: 'oklch(0.62 0.14 264 / .08)',
									border: '1px solid oklch(0.62 0.14 264 / .2)',
								}}
							>
								<div style={{ fontSize: '12.5px', color: 'oklch(0.42 0.13 264)', fontWeight: 600 }}>
									Cột yêu cầu: Email · Họ · Tên · Vai trò (student/teacher/admin)
								</div>
							</div>
							<div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
								<div
									onClick={() => {
										setModal(null);
										setImportFile(null);
									}}
									style={{
										padding: '11px 18px',
										borderRadius: '11px',
										border: '1px solid var(--border)',
										fontSize: '13.5px',
										fontWeight: 700,
										cursor: 'pointer',
										color: 'var(--text)',
									}}
								>
									Hủy
								</div>
								<div
									onClick={async () => {
										if (!importFile) {
											triggerToast('Vui lòng chọn file Excel');
											return;
										}
										try {
											const res = await importAdminUsers(importFile);
											const result = res.data?.data ?? res.data;
											setModal(null);
											setImportFile(null);
											triggerToast(`Đã nhập ${result.created} người dùng${result.errors?.length ? `, ${result.errors.length} dòng lỗi` : ''}`);
											loadUsers();
										} catch {
											/* lỗi đã được thông báo qua axios interceptor */
										}
									}}
									style={{
										padding: '11px 20px',
										borderRadius: '11px',
										background: 'linear-gradient(150deg, oklch(0.55 0.14 150), oklch(0.5 0.15 155))',
										color: '#fff',
										fontSize: '13.5px',
										fontWeight: 700,
										cursor: 'pointer',
									}}
								>
									Nhập dữ liệu
								</div>
							</div>
						</div>
					)}

					{/* Modal 2: Create / Edit User */}
					{modal === 'user' && (
						<div
							onClick={(e) => e.stopPropagation()}
							className="surf"
							style={{
								width: '100%',
								maxWidth: '480px',
								borderRadius: '20px',
								padding: '26px',
								boxShadow: '0 30px 70px -20px rgba(0,0,0,.4)',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
								<div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text)' }}>
									{formId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
								</div>
								<div onClick={() => setModal(null)} style={{ cursor: 'pointer', color: '#a3a196' }}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
										<path d="M6 6l12 12M18 6 6 18" />
									</svg>
								</div>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
								<div>
									<div style={{ fontSize: '12.5px', fontWeight: 700, color: '#6a6860', marginBottom: '6px' }}>Họ và tên</div>
									<input
										className="fld"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
										placeholder="Nguyễn Văn A"
										style={{
											width: '100%',
											padding: '11px 13px',
											borderRadius: '11px',
											fontSize: '14px',
											outline: 'none',
										}}
									/>
								</div>
								<div>
									<div style={{ fontSize: '12.5px', fontWeight: 700, color: '#6a6860', marginBottom: '6px' }}>Email</div>
									<input
										className="fld"
										value={formEmail}
										onChange={(e) => setFormEmail(e.target.value)}
										placeholder="email@scilab.edu.vn"
										style={{
											width: '100%',
											padding: '11px 13px',
											borderRadius: '11px',
											fontSize: '14px',
											outline: 'none',
											fontFamily: 'monospace',
										}}
									/>
								</div>
								<div>
									<div style={{ fontSize: '12.5px', fontWeight: 700, color: '#6a6860', marginBottom: '6px' }}>Vai trò</div>
									<SciDropdown
										value={formRole}
										options={[
											{ value: 'student', label: 'Học sinh' },
											{ value: 'teacher', label: 'Giáo viên' },
											{ value: 'admin', label: 'Quản trị' },
										]}
										onChange={setFormRole}
										variant="filter"
										accent={264}
										dark={isDark}
										style={{ width: '100%' }}
									/>
								</div>
							</div>
							<div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
								<div
									onClick={() => setModal(null)}
									style={{
										padding: '11px 18px',
										borderRadius: '11px',
										border: '1px solid var(--border)',
										fontSize: '13.5px',
										fontWeight: 700,
										cursor: 'pointer',
										color: 'var(--text)',
									}}
								>
									Hủy
								</div>
								<div
									onClick={saveUser}
									style={{
										padding: '11px 20px',
										borderRadius: '11px',
										background: 'linear-gradient(150deg, oklch(0.64 0.16 264), oklch(0.55 0.17 282))',
										color: '#fff',
										fontSize: '13.5px',
										fontWeight: 700,
										cursor: 'pointer',
									}}
								>
									Lưu
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const AdminDashboardPage: React.FC = () => (
	<AdminBounder>
		<AdminDashboard />
	</AdminBounder>
);

export default AdminDashboardPage;
