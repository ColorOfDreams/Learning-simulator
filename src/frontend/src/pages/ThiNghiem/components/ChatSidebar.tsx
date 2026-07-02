import {
	AimOutlined,
	BookOutlined,
	BulbOutlined,
	CalculatorOutlined,
	CheckCircleOutlined,
	ClearOutlined,
	CodeOutlined,
	DatabaseOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	ExperimentOutlined,
	FileSearchOutlined,
	FileTextOutlined,
	HistoryOutlined,
	LeftOutlined,
	LoadingOutlined,
	MessageOutlined,
	PlusOutlined,
	RobotOutlined,
	ScanOutlined,
	SendOutlined,
	TagOutlined,
	ThunderboltOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Modal, Spin, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import AiQuizTab from './AiQuizTab';
import './ChatSidebar.less';
import GuidanceCard from './GuidanceCard';

const { confirm } = Modal;

const LOG_ICONS: Record<string, React.ReactNode> = {
	'file-text': <FileTextOutlined />,
	scan: <ScanOutlined />,
	aim: <AimOutlined />,
	book: <BookOutlined />,
	tag: <TagOutlined />,
	calculator: <CalculatorOutlined />,
	'check-circle': <CheckCircleOutlined />,
	database: <DatabaseOutlined />,
	'file-search': <FileSearchOutlined />,
	bulb: <BulbOutlined />,
	experiment: <ExperimentOutlined />,
	edit: <EditOutlined />,
	code: <CodeOutlined />,
	thunderbolt: <ThunderboltOutlined />,
};

const SUBJECT_LABELS: Record<string, string> = {
	physics: 'Vật lý',
	chemistry: 'Hóa học',
	math: 'Toán học',
};

interface Props {
	collapsed: boolean;
	onToggle: () => void;
	subject?: string;
	simId?: string;
	title?: string;
}

const ChatSidebar: React.FC<Props> = ({ collapsed, onToggle, subject, simId, title }) => {
	const {
		messages,
		loading,
		logs,
		sessions,
		loadingSessions,
		sessionId,
		sendMessage,
		stopGenerating,
		listSessions,
		loadSession,
		deleteSession,
		deleteAllSessions,
		newSession,
	} = useModel('useAIChatBotModel');
	const listRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<any>(null);
	const [inputValue, setInputValue] = useState('');
	const [showHistory, setShowHistory] = useState(false);
	const [activeRightTab, setActiveRightTab] = useState<'chat' | 'quiz'>('chat');

	useEffect(() => {
		if (listRef.current) listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
	}, [messages, logs, loading]);

	const { currentStepIndex } = useModel('useSimulationModel');

	const handleSend = () => {
		if (loading) {
			stopGenerating();
			return;
		}
		const t = inputValue.trim();
		if (!t) return;
		sendMessage(t);
		setInputValue('');
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleOpenHistory = () => {
		setShowHistory(true);
		listSessions();
	};
	const handleLoadSession = (sid: string) => {
		loadSession(sid);
		setShowHistory(false);
	};

	const confirmDelete = (sid: string, e: React.MouseEvent) => {
		e.stopPropagation();
		confirm({
			title: 'Xóa cuộc trò chuyện?',
			icon: <ExclamationCircleOutlined />,
			content: 'Bạn sẽ không thể khôi phục lại cuộc trò chuyện này.',
			okText: 'Xóa',
			okType: 'danger',
			cancelText: 'Hủy',
			centered: true,
			onOk: () => deleteSession(sid),
		});
	};

	const confirmDeleteAll = () => {
		if (sessions.length === 0) return;
		confirm({
			title: 'Xóa tất cả lịch sử chat?',
			icon: <ExclamationCircleOutlined />,
			content: `Bạn sắp xóa ${sessions.length} cuộc trò chuyện. Hành động này không thể hoàn tác.`,
			okText: 'Xóa tất cả',
			okType: 'danger',
			cancelText: 'Hủy',
			centered: true,
			onOk: () => deleteAllSessions(),
		});
	};

	const subjectLabel = subject ? SUBJECT_LABELS[subject] || subject : 'Chung';
	const lastMsg = messages.filter((m) => m.sender === 'user').slice(-1)[0];

	return (
		<div className={`chat-sidebar ${collapsed ? 'collapsed' : ''}`}>
			<div className='cs-header'>
				<div className='cs-header-left'>
					<div className='cs-avatar'>
						<RobotOutlined className='cs-avatar-icon' />
					</div>
					<div>
						<div className='cs-title'>
							{sessionId ? (lastMsg?.text || 'Cuộc trò chuyện').slice(0, 30) : 'AI Trợ giảng'}
						</div>
						<div className='cs-subtitle'>{subjectLabel} · Lớp 11</div>
					</div>
				</div>
				<div className='cs-header-actions'>
					<Tooltip title='Lịch sử chat'>
						<Button
							type='text'
							size='small'
							className='cs-header-btn'
							icon={<HistoryOutlined />}
							onClick={handleOpenHistory}
						/>
					</Tooltip>
					<Tooltip title='Cuộc trò chuyện mới'>
						<Button type='text' size='small' className='cs-header-btn' icon={<PlusOutlined />} onClick={newSession} />
					</Tooltip>
					<Tooltip title='Thu gọn'>
						<Button type='text' size='small' className='cs-header-btn' icon={<LeftOutlined />} onClick={onToggle} />
					</Tooltip>
				</div>
			</div>

			<div className='cs-tabs-row' style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
				<div
					style={{
						flex: 1,
						textAlign: 'center',
						padding: '12px 0',
						cursor: 'pointer',
						borderBottom: activeRightTab === 'chat' ? '2px solid #6366f1' : '2px solid transparent',
						color: activeRightTab === 'chat' ? '#6366f1' : '#666',
						fontWeight: activeRightTab === 'chat' ? 600 : 400,
					}}
					onClick={() => setActiveRightTab('chat')}
				>
					Trợ lý AI
				</div>
				<div
					style={{
						flex: 1,
						textAlign: 'center',
						padding: '12px 0',
						cursor: 'pointer',
						borderBottom: activeRightTab === 'quiz' ? '2px solid #6366f1' : '2px solid transparent',
						color: activeRightTab === 'quiz' ? '#6366f1' : '#666',
						fontWeight: activeRightTab === 'quiz' ? 600 : 400,
					}}
					onClick={() => setActiveRightTab('quiz')}
				>
					AI Quiz
				</div>
			</div>

			{activeRightTab === 'quiz' ? (
				<AiQuizTab simId={simId || ''} subject={subject} title={title} />
			) : (
				<>
					{showHistory ? (
						<div className='cs-body'>
							<div className='cs-history-header'>
								<Button type='text' icon={<LeftOutlined />} onClick={() => setShowHistory(false)}>
									Trợ lại
								</Button>
								{sessions.length > 0 && (
									<Button type='text' danger size='small' icon={<ClearOutlined />} onClick={confirmDeleteAll}>
										Xóa tất cả
									</Button>
								)}
							</div>
							{loadingSessions ? (
								<div style={{ textAlign: 'center', padding: 30 }}>
									<Spin />
								</div>
							) : sessions.length === 0 ? (
								<div className='cs-empty'>
									<div className='cs-empty-icon'>
										<MessageOutlined />
									</div>
									<div className='cs-empty-title'>Chưa có lịch sử</div>
									<div className='cs-empty-desc'>Các cuộc trò chuyện sẽ xuất hiện ở đây</div>
								</div>
							) : (
								<div className='cs-history-list'>
									{sessions.map((s) => (
										<div
											key={s.id}
											className={`cs-history-item ${s.id === sessionId ? 'active' : ''}`}
											onClick={() => handleLoadSession(s.id)}
										>
											<div className='cs-history-item-icon'>
												<MessageOutlined />
											</div>
											<div className='cs-history-item-body'>
												<div className='cs-history-item-title'>{s.title || 'Không tên'}</div>
												<div className='cs-history-item-meta'>
													<span>{SUBJECT_LABELS[s.subject] || s.subject}</span>
													<span>·</span>
													<span>{dayjs(s.updatedAt).format('DD/MM HH:mm')}</span>
												</div>
											</div>
											<Button
												type='text'
												size='small'
												className='cs-history-del'
												icon={<DeleteOutlined />}
												onClick={(e) => confirmDelete(s.id, e)}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					) : (
						<div className='cs-body' ref={listRef}>
							{messages.length === 0 && !loading && (
								<div className='cs-empty'>
									<div className='cs-empty-icon'>
										<ThunderboltOutlined />
									</div>
									<div className='cs-empty-title'>AI Trợ giảng sẵn sàng</div>
									<div className='cs-empty-desc'>Hỏi tôi bất cứ điều gì về thí nghiệm</div>
									<div className='cs-empty-hints'>
										{['Dao động điều hòa là gì?', 'Cách tính chu kì con lắc?', 'Giải thích năng lượng dao động'].map(
											(h, i) => (
												<div
													key={i}
													className='cs-hint'
													onClick={() => {
														sendMessage(h);
													}}
												>
													{h}
												</div>
											),
										)}
									</div>
								</div>
							)}
							{messages.map((msg) => (
								<div key={msg.id} className={`cs-msg-row ${msg.sender === 'user' ? 'user' : ''}`}>
									{msg.sender === 'guidance' ? (
										<GuidanceCard steps={msg.metadata?.steps as any[]} currentStepIndex={currentStepIndex} />
									) : (
										<div className={`cs-bubble ${msg.sender}`}>
											<div className='cs-bubble-avatar'>
												{msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
											</div>
											<div className='cs-bubble-body'>
												<div className='cs-bubble-text'>
													{msg.text.split('\n').map((line, i) => (
														<span key={i}>
															{line}
															{i < msg.text.split('\n').length - 1 && <br />}
														</span>
													))}
												</div>
												{msg.aiResult && (
													<div className='cs-bubble-tags'>
														<span className='cs-tag'>{msg.aiResult.intent}</span>
														<span className='cs-tag cs-tag-green'>{Math.round(msg.aiResult.confidence * 100)}%</span>
														{msg.aiResult.analysis?.pattern_id && (
															<span className='cs-tag cs-tag-purple'>{msg.aiResult.analysis.pattern_id}</span>
														)}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							))}
							{loading && (
								<div className='cs-logs'>
									{logs.filter(Boolean).map((log, i) => (
										<div key={log.id || i} className='cs-log-line' style={{ animationDelay: `${i * 0.05}s` }}>
											<span className='cs-log-icon'>{LOG_ICONS[log.icon] || <BulbOutlined />}</span>
											<span className='cs-log-text'>{log.text}</span>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{!showHistory && (
						<div className='cs-footer'>
							<div className='cs-footer-inner'>
								<div className='cs-input-wrap'>
									<input
										ref={inputRef}
										className='cs-input'
										placeholder={loading ? 'AI đang trả lời...' : 'Nhập câu hỏi về thí nghiệm...'}
										value={inputValue}
										onChange={(e) => setInputValue(e.target.value)}
										onKeyDown={handleKeyDown}
										disabled={loading}
									/>
								</div>
								<Button
									className={`cs-send-btn ${loading ? 'stopping' : ''}`}
									icon={loading ? <LoadingOutlined spin /> : <SendOutlined />}
									onClick={handleSend}
									disabled={!loading && !inputValue.trim()}
								/>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default ChatSidebar;
