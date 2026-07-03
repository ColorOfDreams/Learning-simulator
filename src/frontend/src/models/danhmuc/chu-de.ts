import useInitModel from '@/hooks/useInitModel';

export default () => {
	const objInit = useInitModel<DanhMuc.ChuDe>('topics');
	return { ...objInit };
};
