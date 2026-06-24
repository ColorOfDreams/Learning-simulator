declare module Ai {
	export type GivenValue = {
		key: string;
		value: number | string;
		unit?: string;
		label: string;
	};

	export interface IRecord {
		intent: string;
		subject: string;
		topic: string;
		confidence: number;
		analysis: {
			concepts: string[];
			skills: string[];
			given: GivenValue[];
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
			parameters: GivenValue[];
		};
		render_blocks: { type: string }[];
		references: { id: string; title: string; source?: string }[];
	}

	export type AnalyzeRequest = {
		message: string;
		subject?: string;
		grade?: number;
		context?: { role: 'user' | 'assistant'; content: string }[];
	};
}
