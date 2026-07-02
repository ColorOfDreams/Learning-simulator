import { layDungCu } from '@/dung-cu/thanh-ghi';
import { useCallback, useState } from 'react';

export default function useSimulationModel() {
	const [sceneGraph, setSceneGraph] = useState<Scene.IRecord | null>(null);

	const initScene = useCallback((data: Scene.IRecord) => {
		setSceneGraph(data);
	}, []);

	const clearScene = useCallback(() => {
		setSceneGraph(null);
	}, []);

	const addObject = useCallback((modelName: string) => {
		setSceneGraph((prev) => {
			if (!prev) return prev;

			const def = layDungCu(modelName);
			const defaultProps: Record<string, any> = {};
			if (def && def.thuocTinh) {
				def.thuocTinh.forEach((t) => {
					if (t.khoa && t.macDinh !== undefined) defaultProps[t.khoa] = t.macDinh;
				});
			}
			if (modelName === 'WoodenBlock') defaultProps.color = '#feca57';

			const newObj: Scene.Object = {
				id: `${modelName}_${Date.now()}`,
				modelName,
				nhan: def?.nhan,
				position: [0, 5, 0] as [number, number, number],
				rotation: [0, 0, 0] as [number, number, number],
				scale: [1, 1, 1] as [number, number, number],
				properties: defaultProps,
			};
			return { ...prev, objects: [...(prev.objects || []), newObj] };
		});
	}, []);

	const removeObject = useCallback((id: string) => {
		setSceneGraph((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				objects: (prev.objects || []).filter((obj) => obj.id !== id),
			};
		});
	}, []);

	const updateObjectPosition = useCallback((id: string, position: [number, number, number]) => {
		setSceneGraph((prev) => {
			if (!prev) return prev;
			const targetObj = prev.objects?.find((o) => o.id === id);
			if (!targetObj) return prev;

			const dx = position[0] - targetObj.position[0];
			const dy = position[1] - targetObj.position[1];
			const dz = position[2] - targetObj.position[2];

			const movingIds = new Set<string>([id]);

			// Find all children recursively
			let added = true;
			while (added) {
				added = false;
				prev.objects?.forEach((o) => {
					if (o.properties?.attachedTo && movingIds.has(o.properties.attachedTo as string) && !movingIds.has(o.id)) {
						movingIds.add(o.id);
						added = true;
					}
				});
			}

			return {
				...prev,
				objects: (prev.objects || []).map((obj) => {
					if (movingIds.has(obj.id)) {
						if (obj.id === id) return { ...obj, position };
						return {
							...obj,
							position: [obj.position[0] + dx, obj.position[1] + dy, obj.position[2] + dz] as [number, number, number],
						};
					}
					return obj;
				}),
			};
		});
	}, []);

	const updateObjectRotation = useCallback((id: string, rotation: [number, number, number]) => {
		setSceneGraph((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				objects: (prev.objects || []).map((obj) => (obj.id === id ? { ...obj, rotation } : obj)),
			};
		});
	}, []);

	const updateObjectProperty = useCallback((id: string, key: string, value: any) => {
		setSceneGraph((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				objects: (prev.objects || []).map((obj) =>
					obj.id === id ? { ...obj, properties: { ...obj.properties, [key]: value } } : obj,
				),
			};
		});
	}, []);

	const updateAllProperties = useCallback((id: string, props: Record<string, any>) => {
		setSceneGraph((prev) => {
			if (!prev) return prev;
			return {
				...prev,
				objects: (prev.objects || []).map((obj) =>
					obj.id === id ? { ...obj, properties: { ...obj.properties, ...props } } : obj,
				),
			};
		});
	}, []);

	const [currentStepIndex, setCurrentStepIndex] = useState(0);

	const nextStep = useCallback(() => {
		setCurrentStepIndex((prev) => {
			const max = sceneGraph?.steps?.length ? sceneGraph.steps.length - 1 : 0;
			return Math.min(prev + 1, max);
		});
	}, [sceneGraph]);

	const prevStep = useCallback(() => {
		setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
	}, []);

	const setStep = useCallback(
		(index: number) => {
			const max = sceneGraph?.steps?.length ? sceneGraph.steps.length - 1 : 0;
			setCurrentStepIndex(Math.max(0, Math.min(index, max)));
		},
		[sceneGraph],
	);

	const checkRuleAndAdvance = useCallback(
		(actionType: string, sourceId?: string, targetId?: string) => {
			if (!sceneGraph || !sceneGraph.steps) return;
			const currentStep = sceneGraph.steps[currentStepIndex];
			if (!currentStep || !currentStep.expectedAction) return;

			if (
				currentStep.expectedAction.type === actionType ||
				(actionType === 'pour' && currentStep.expectedAction.type === 'drag_and_drop')
			) {
				const getModel = (o: any) => o?.modelName || o?.maDungCu || o?.nhan;
				const isMatch = (o: any, targetStr: string) => {
					if (!targetStr) return false;
					const str = targetStr.toLowerCase();
					return (
						(o.modelName && o.modelName.toLowerCase().includes(str)) ||
						(o.maDungCu && o.maDungCu.toLowerCase().includes(str)) ||
						(o.nhan && o.nhan.toLowerCase().includes(str)) ||
						(o.id && o.id.toLowerCase().includes(str))
					);
				};

				const sourceObj = sceneGraph.objects.find((o) => o.id === sourceId);
				const targetObj = sceneGraph.objects.find((o) => o.id === targetId);
				const expectedSource = currentStep.expectedAction.sourceModel;
				const expectedTarget = currentStep.expectedAction.targetModel;

				let sourceMatch = !expectedSource || (sourceObj && isMatch(sourceObj, expectedSource));
				let targetMatch = !expectedTarget || (targetObj && isMatch(targetObj, expectedTarget));

				if (sourceMatch && targetMatch) {
					nextStep();
				}
			}
		},
		[sceneGraph, currentStepIndex, nextStep],
	);

	return {
		sceneGraph,
		initScene,
		clearScene,
		addObject,
		removeObject,
		updateObjectPosition,
		updateObjectRotation,
		updateObjectProperty,
		updateAllProperties,
		currentStepIndex,
		nextStep,
		prevStep,
		setStep,
		checkRuleAndAdvance,
	};
}
