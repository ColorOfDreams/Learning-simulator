import { chatSessionApi } from '@/services/ai/api';
import { RobotOutlined, RocketOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, message, Spin, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import '../TaoThiNghiem.less';

interface Props {
	onAccept: (data: Partial<Scene.IRecord>) => Promise<void>;
	onSwitchToManual: (data: Partial<Scene.IRecord>) => void;
	submitting: boolean;
}

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	metadata?: any;
}

const AiGenerate: React.FC<Props> = ({ onAccept, onSwitchToManual, submitting }) => {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Create a new session when component mounts
		const initSession = async () => {
			try {
				const res = await chatSessionApi.create({ title: 'Tạo thí nghiệm AI', subject: 'physics' });
				const resData = res.data as any;
				const newSessionId = resData.data?.id ?? resData.id;
				setSessionId(newSessionId);
				setMessages([
					{
						id: 'welcome',
						role: 'assistant',
						content:
							'Xin chào! Mình là trợ lý AI chuyên thiết kế thí nghiệm 3D. Bạn muốn làm thí nghiệm về chủ đề gì (Lý, Hóa, hay Toán)?',
					},
				]);
			} catch {
				message.error('Không thể khởi tạo phiên chat. Vui lòng thử lại.');
			}
		};
		initSession();
	}, []);

	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [messages, loading]);

	const handleSend = async () => {
		if (!input.trim() || !sessionId) return;

		const userText = input.trim();
		setInput('');

		const tempUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
		setMessages((prev) => [...prev, tempUserMsg]);
		setLoading(true);

		try {
			const res = await chatSessionApi.experimentChat(sessionId, userText);
			const resData = res.data as any;
			const data = resData.data ?? resData;
			if (data.aiMessage) {
				setMessages((prev) => [...prev, data.aiMessage]);
			}
		} catch {
			message.error('AI đang gặp sự cố. Thử lại nhé.');
		}
		setLoading(false);
	};

	const handleAcceptConfig = async (config: any) => {
		if (!config) return;
		const objects = (config.objects || []).map((obj: any) => ({
			id: `${obj.modelName}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
			modelName: obj.modelName,
			position: [0, 5, 0] as [number, number, number],
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
			properties: obj.properties || {},
		}));
		await onAccept({
			name: config.name || 'Thí nghiệm mới',
			roomType: config.roomType || 'physics',
			environment: { gravity: 9.81, temperature: 25 },
			objects,
		});
	};

	const renderConfigCard = (config: any) => {
		const subjectLabel =
			config.roomType === 'physics' ? 'Vật lý' : config.roomType === 'chemistry' ? 'Hóa học' : 'Toán học';
		return (
			<Card
				size='small'
				title={
					<span>
						<RocketOutlined style={{ color: '#1677ff', marginRight: 8 }} />
						Cấu hình đề xuất
					</span>
				}
				extra={<Tag color='blue'>{subjectLabel}</Tag>}
				style={{ marginTop: 12, borderRadius: 12, border: '1px solid #93c5fd', background: '#eff6ff' }}
			>
				<div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>{config.name}</div>
				<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
					{(config.objects || []).map((obj: any, idx: number) => (
						<Tag key={idx} color='geekblue' style={{ borderRadius: 6 }}>
							{obj.modelName}
						</Tag>
					))}
				</div>
				<Button
					type='primary'
					block
					icon={<RocketOutlined />}
					onClick={() => handleAcceptConfig(config)}
					loading={submitting}
				>
					Tạo & Vào Lab Ngay
				</Button>
			</Card>
		);
	};

	return (
		<div className='ai-generate-chat'>
			<div className='chat-header'>
				<RobotOutlined className='header-icon' />
				<h2>Trợ lý Thiết Kế Thí Nghiệm AI</h2>
			</div>

			<div
				className='chat-messages'
				ref={chatContainerRef}
				style={{
					height: 320,
					overflowY: 'auto',
					padding: '16px',
					background: '#f8fafc',
					borderRadius: 12,
					marginBottom: 16,
				}}
			>
				{messages.map((msg) => (
					<div
						key={msg.id}
						style={{
							display: 'flex',
							gap: 12,
							marginBottom: 16,
							flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
						}}
					>
						<div
							style={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								background: msg.role === 'user' ? '#1677ff' : '#10b981',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: '#fff',
								flexShrink: 0,
							}}
						>
							{msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
						</div>
						<div
							style={{
								maxWidth: '80%',
								padding: '10px 16px',
								borderRadius: 16,
								background: msg.role === 'user' ? '#1677ff' : '#fff',
								color: msg.role === 'user' ? '#fff' : '#334155',
								boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
								borderTopRightRadius: msg.role === 'user' ? 4 : 16,
								borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
							}}
						>
							<div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.content}</div>
							{msg.metadata?.experimentConfig && renderConfigCard(msg.metadata.experimentConfig)}
						</div>
					</div>
				))}
				{loading && (
					<div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
						<div
							style={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								background: '#10b981',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: '#fff',
							}}
						>
							<RobotOutlined />
						</div>
						<div
							style={{
								padding: '10px 16px',
								borderRadius: 16,
								background: '#fff',
								boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
							}}
						>
							<Spin size='small' /> Đang suy nghĩ...
						</div>
					</div>
				)}
			</div>

			<div style={{ display: 'flex', gap: 8 }}>
				<Input
					size='large'
					placeholder='Nhắn yêu cầu thí nghiệm (VD: Tạo con lắc lò xo dao động)...'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onPressEnter={handleSend}
					disabled={loading || !sessionId}
					style={{ borderRadius: 20 }}
				/>
				<Button
					type='primary'
					size='large'
					icon={<SendOutlined />}
					onClick={handleSend}
					loading={loading}
					disabled={!input.trim() || !sessionId}
					style={{ borderRadius: 20 }}
				/>
			</div>
		</div>
	);
};

export default AiGenerate;
