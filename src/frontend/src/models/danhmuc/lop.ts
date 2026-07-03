import useInitModel from '@/hooks/useInitModel';

export default () => {
	const objInit = useInitModel<DanhMuc.Lop>('grades');
	return { ...objInit };
};
