import GenericChemSimulation from '@simulations/chemistry/GenericChemSimulation';
import { EXPERIMENTS_CONFIG as CHEM_EXPERIMENTS_CONFIG } from '@simulations/chemistry/experiments';
import SimThumbCapture, { MATH_REGISTRY, PHYSICS_REGISTRY } from '@simulations/SimThumbCapture';
import React, { useEffect } from 'react';
import { useSearchParams } from 'umi';

type Subject = 'physics' | 'math' | 'chem';

declare global {
	interface Window {
		__THUMB_ALL_IDS__?: { id: string; subject: Subject }[];
		__THUMB_RESULT__?: string;
		__THUMB_ERROR__?: string;
	}
}

class ThumbErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean }> {
	constructor(props: React.PropsWithChildren) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: unknown) {
		window.__THUMB_ERROR__ = error instanceof Error ? error.message : String(error);
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) return null;
		return this.props.children;
	}
}

// Dev-only page (excluded from production builds via routes.ts) used by
// scripts/generate-thumbnails.mjs (Playwright) to render one simulation in
// isolation and read back the same capture data-URL SimThumbCapture /
// GenericChemSimulation already produce for the live client-side preview.
const ThumbnailCapture: React.FC = () => {
	const [searchParams] = useSearchParams();
	const mode = searchParams.get('mode');
	const simId = searchParams.get('simId');
	const subject = searchParams.get('subject') as Subject | null;

	useEffect(() => {
		if (mode !== 'list') return;
		const list: { id: string; subject: Subject }[] = [
			...Object.keys(PHYSICS_REGISTRY).map((id) => ({ id, subject: 'physics' as const })),
			...Object.keys(MATH_REGISTRY).map((id) => ({ id, subject: 'math' as const })),
			...Object.keys(CHEM_EXPERIMENTS_CONFIG).map((id) => ({ id, subject: 'chem' as const })),
		];
		window.__THUMB_ALL_IDS__ = list;
	}, [mode]);

	if (mode === 'list') return null;
	if (!simId || !subject) return null;

	const handleResult = (_id: string, dataUrl: string) => {
		window.__THUMB_RESULT__ = dataUrl;
	};

	return (
		<div style={{ width: 640, height: 360 }}>
			<ThumbErrorBoundary>
				{subject === 'chem' ? (
					<GenericChemSimulation
						config={{ simulation_id: simId, subject: 'chemistry', topic: 'generic', parameters: [] }}
						currentStep={1}
						onThumbnail={handleResult}
					/>
				) : (
					<SimThumbCapture simId={simId} subject={subject} onCapture={handleResult} />
				)}
			</ThumbErrorBoundary>
		</div>
	);
};

export default ThumbnailCapture;
