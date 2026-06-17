import type { IInitialState } from './services/base/typing';
// import { currentRole } from './utils/ip';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: IInitialState) {
	// const scopes = initialState.authorizedPermissions?.find((item) => item.rsname === currentRole)?.scopes;
	const scopes = initialState.authorizedPermissions?.map((item) => item.scopes).flat();

	return {
		accessFilter: (route: any) => {
			if (!route?.maChucNang || !scopes) return false;
			if (scopes.includes(route.maChucNang)) return true;
			// Hierarchy: tao → xem
			const [prefix] = route.maChucNang.split('|');
			return scopes.includes(`${prefix}|tao`);
		},
		manyAccessFilter: (route: any) => route?.listChucNang?.some((role: string) => scopes?.includes(role)) || false,
	};
}
