import useInitModel from '@/hooks/useInitModel';

export default () => {
  const objInit = useInitModel<QuestionBank.Record>('question-bank');
  return { ...objInit };
};
