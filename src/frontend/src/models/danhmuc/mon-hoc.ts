import useInitModel from '@/hooks/useInitModel';

export default () => {
	const objInit = useInitModel<DanhMuc.MonHoc>('subjects');
	return { ...objInit };
};
