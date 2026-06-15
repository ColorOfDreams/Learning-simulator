export type AiGivenValue = {
	key: string;
	value: number | string;
	unit?: string;
	label: string;
};

export type AiAnalyzeOutput = {
	intent: string;
	subject: string;
	topic: string;
	confidence: number;
	analysis: {
		concepts: string[];
		skills: string[];
		given: AiGivenValue[];
		target: string[];
		pattern_id?: string;
	};
	answer: {
		short_answer: string;
		steps: string[];
	};
	simulation?: {
		simulation_id: string;
		title: string;
		parameters: AiGivenValue[];
	};
	render_blocks: { type: string }[];
	references: {
		id: string;
		title: string;
		source?: string;
	}[];
};

export type AiAnalyzeRequest = {
	message: string;
	subject?: string;
	grade?: number;
};
