import { ReloadOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { useIntl, useModel } from '@umijs/max';
import { Avatar, Button, Drawer, FloatButton, Input, List, Tag, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { unAIChatBotPaths } from './constant';
import './index.less';

const { Text, Paragraph } = Typography;

const AIChatBotBounder = (props: { children: React.ReactNode }) => {
	const intl = useIntl();
	const { open, subject, messages, loading, openChatbot, closeChatbot, sendMessage, resetChat } =
		useModel('useAIChatBotModel');

	const listRef = useRef<HTMLDivElement>(null);
	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight;
		}
	}, [messages, loading]);

	const handleSend = () => {
		const trimmed = inputValue.trim();
		if (!trimmed || loading) return;
		sendMessage(trimmed);
		setInputValue('');
	};

	const shouldShowFloat = !unAIChatBotPaths.some((path) => window.location.pathname.startsWith(path));

	return (
		<>
			{props.children}

			{shouldShowFloat && (
				<FloatButton
					className='chatbot-float-btn'
					tooltip={intl.formatMessage({ id: 'global.chatbot.float.tooltip' })}
					onClick={() => openChatbot()}
					type='primary'
					icon={<RobotOutlined />}
				/>
			)}

			<Drawer
				className='chatbot-drawer'
				title={
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<RobotOutlined style={{ color: '#fff', fontSize: 20 }} />
						<div>
							<div style={{ color: '#fff', fontSize: 15, fontWeight: 600, lineHeight: 1.2 }}>
								{intl.formatMessage({ id: 'global.chatbot.title' })}
							</div>
						</div>
					</div>
				}
				extra={
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<Button
							type='text'
							size='small'
							icon={<ReloadOutlined style={{ color: '#fff' }} />}
							onClick={resetChat}
							style={{ color: '#fff' }}
						/>
					</div>
				}
				placement='right'
				onClose={closeChatbot}
				open={open}
				width={420}
				mask
				maskClosable
				styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' } }}
			>
				<div className='chatbot-body' ref={listRef}>
					{messages.length === 0 ? (
						<div className='chatbot-empty'>
							<RobotOutlined style={{ fontSize: 36, opacity: 0.3 }} />
							<Text type='secondary'>Hỏi tôi bất cứ điều gì về bài tập</Text>
						</div>
					) : (
						<List
							dataSource={messages}
							renderItem={(msg) => (
								<List.Item style={{ border: 'none', padding: '6px 0' }}>
									<div className={`chatbot-bubble ${msg.sender === 'user' ? 'chatbot-bubble-user' : ''}`}>
										<div
											className={`chatbot-avatar ${msg.sender === 'user' ? 'chatbot-avatar-user' : 'chatbot-avatar-ai'}`}
										>
											<Avatar size={32} icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />} />
										</div>
										<div
											className={`chatbot-message ${msg.sender === 'user' ? 'chatbot-message-user' : 'chatbot-message-ai'}`}
										>
											{msg.sender === 'user' ? (
												<Text>{msg.text}</Text>
											) : (
												<div>
													{msg.text.split('\n').map((line, i) => (
														<Paragraph
															key={i}
															style={{ margin: '2px 0', fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
														>
															{line}
														</Paragraph>
													))}
													{msg.aiResult && (
														<div className='chatbot-tags'>
															<Tag color='blue'>{msg.aiResult.intent}</Tag>
															<Tag color='green'>{Math.round(msg.aiResult.confidence * 100)}%</Tag>
															{msg.aiResult.analysis.pattern_id && (
																<Tag color='purple'>{msg.aiResult.analysis.pattern_id}</Tag>
															)}
														</div>
													)}
												</div>
											)}
										</div>
									</div>
								</List.Item>
							)}
						/>
					)}

					{loading && (
						<div className='chatbot-loading'>
							<div className='chatbot-typing'>
								<span className='chatbot-typing-dot' />
								<span className='chatbot-typing-dot' />
								<span className='chatbot-typing-dot' />
							</div>
							<Text type='secondary'>{intl.formatMessage({ id: 'global.chatbot.loading' })}</Text>
						</div>
					)}
				</div>

				<div className='chatbot-footer'>
					<div className='chatbot-input-group'>
						<Input
							placeholder={intl.formatMessage({ id: 'global.chatbot.placeholder' })}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onPressEnter={handleSend}
							disabled={loading}
							style={{ borderRadius: 8 }}
						/>
						<Button
							type='primary'
							icon={<SendOutlined />}
							onClick={handleSend}
							loading={loading}
							style={{ borderRadius: 8 }}
						/>
					</div>
				</div>
			</Drawer>
		</>
	);
};

export default AIChatBotBounder;
