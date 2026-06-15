import { analyzeAiPrompt } from '@/services/ai/api';
import type { AiAnalyzeOutput } from '@/services/ai/typing';
import { Button, Empty, Input, Space, Tag, Typography, message } from 'antd';
import { useState } from 'react';
import './index.less';

const { Text, Title } = Typography;

const defaultPrompt =
	'Một vật dao động điều hòa theo phương trình x = 5cos(4πt + π/3) cm. Hãy tính chu kì và mô phỏng chuyển động.';

const AiDemo = () => {
	const [prompt, setPrompt] = useState(defaultPrompt);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<AiAnalyzeOutput>();

	const handleAnalyze = async () => {
		if (!prompt.trim()) {
			message.warning('Nhập đề bài trước khi phân tích');
			return;
		}

		setLoading(true);
		try {
			const response = await analyzeAiPrompt({
				message: prompt,
				subject: 'physics',
				grade: 11,
			});
			setResult(response.data.data);
			message.success('Phân tích thành công');
		} catch (error) {
			console.error(error);
			message.error('Không gọi được AI backend');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='ai-demo-page'>
			<div className='ai-demo-main'>
				<section className='ai-demo-panel ai-demo-stack'>
					<Title level={3}>AI Demo</Title>
					<Input.TextArea
						value={prompt}
						onChange={(event) => setPrompt(event.target.value)}
						autoSize={{ minRows: 7, maxRows: 12 }}
					/>
					<Space wrap>
						<Button type='primary' loading={loading} onClick={handleAnalyze}>
							Phân tích
						</Button>
						<Button onClick={() => setPrompt(defaultPrompt)}>Đề mẫu</Button>
					</Space>
				</section>

				<section className='ai-demo-panel'>
					{result ? (
						<div className='ai-demo-stack'>
							<div className='ai-demo-metadata'>
								<Tag color='blue'>{result.intent}</Tag>
								<Tag color='cyan'>{result.topic}</Tag>
								<Tag color='geekblue'>{result.analysis.pattern_id}</Tag>
								<Tag color='green'>{Math.round(result.confidence * 100)}%</Tag>
							</div>

							<div>
								<Title level={4}>Dữ kiện</Title>
								<div className='ai-demo-params'>
									{result.analysis.given.map((item) => (
										<div className='ai-demo-param' key={item.key}>
											<Text strong>{item.label}</Text>
											<br />
											<Text>
												{item.key} = {item.value} {item.unit}
											</Text>
										</div>
									))}
								</div>
							</div>

							<div>
								<Title level={4}>Lời giải</Title>
								<Text strong>{result.answer.short_answer}</Text>
								<ol className='ai-demo-list'>
									{result.answer.steps.map((step) => (
										<li key={step}>{step}</li>
									))}
								</ol>
							</div>

							{result.simulation ? (
								<div>
									<Title level={4}>Mô phỏng</Title>
									<Text strong>{result.simulation.title}</Text>
									<div className='ai-demo-params'>
										{result.simulation.parameters.map((item) => (
											<div className='ai-demo-param' key={item.key}>
												<Text strong>{item.label}</Text>
												<br />
												<Text>
													{item.key} = {item.value} {item.unit}
												</Text>
											</div>
										))}
									</div>
								</div>
							) : null}

							<div>
								<Title level={4}>Tài liệu</Title>
								<Space wrap>
									{result.references.map((reference) => (
										<Tag key={reference.id}>
											{reference.title}
											{reference.source ? ` - ${reference.source}` : ''}
										</Tag>
									))}
								</Space>
							</div>

							<pre className='ai-demo-json'>{JSON.stringify(result, null, 2)}</pre>
						</div>
					) : (
						<Empty description='Chưa có kết quả' />
					)}
				</section>
			</div>
		</div>
	);
};

export default AiDemo;
