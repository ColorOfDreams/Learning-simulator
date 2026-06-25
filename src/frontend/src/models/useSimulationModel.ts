import { useState, useCallback } from 'react';

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
      const getInitialY = (name: string) => {
        switch (name) {
          case 'WoodenBlock': return 0.15;
          case 'Beaker': return 0.4;
          case 'Stand': return 1.9;
          case 'SimplePendulum': return 1.5;
          case 'SpringPendulum': return 1.5;
          default: return 0;
        }
      };
      const newObj: Scene.Object = {
        id: `${modelName}_${Date.now()}`,
        modelName,
        position: [0, 5, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        properties: modelName === 'WoodenBlock' ? { color: '#feca57' } : { liquidVolume: 200 },
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
      return {
        ...prev,
        objects: (prev.objects || []).map((obj) => 
          obj.id === id ? { ...obj, position } : obj
        ),
      };
    });
  }, []);

  const updateObjectRotation = useCallback((id: string, rotation: [number, number, number]) => {
    setSceneGraph((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        objects: (prev.objects || []).map((obj) =>
          obj.id === id ? { ...obj, rotation } : obj
        ),
      };
    });
  }, []);

  const updateObjectProperty = useCallback((id: string, key: string, value: any) => {
    setSceneGraph((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        objects: (prev.objects || []).map((obj) =>
          obj.id === id ? { ...obj, properties: { ...obj.properties, [key]: value } } : obj
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
          obj.id === id ? { ...obj, properties: { ...obj.properties, ...props } } : obj
        ),
      };
    });
  }, []);

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
  };
}
