import useInitModel from '@/hooks/useInitModel';

export default () => {
	const objInit = useInitModel<DanhMuc.DoKho>('difficulties');
	return { ...objInit };
};
