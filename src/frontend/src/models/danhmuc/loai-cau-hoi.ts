import useInitModel from '@/hooks/useInitModel';

export default () => {
	const objInit = useInitModel<DanhMuc.LoaiCauHoi>('question-types');
	return { ...objInit };
};
