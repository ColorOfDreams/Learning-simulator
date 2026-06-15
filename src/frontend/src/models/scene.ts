import useInitModel from '@/hooks/useInitModel';

export default () => {
  const objInit = useInitModel<Scene.IRecord>('scene');

  return {
    ...objInit,
  };
};
