// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import routes from './routes';

const {
	APP_CONFIG_TEN_TRUONG = '',
	APP_CONFIG_TIEN_TO_TRUONG = '',
	APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH = '',
	APP_CONFIG_GA_ID = '',
} = process.env;

export default defineConfig({
	hash: true,
	mfsu: false,
	chainWebpack(memo) {
		memo.experiments({
			...memo.get('experiments'),
			asyncWebAssembly: true,
			syncWebAssembly: true,
		});
	},
	title: `AI Thực chiến - ${APP_CONFIG_TEN_TRUONG.toUpperCase()}`,
	metas: [
		{
			name: 'keywords',
			content: `${APP_CONFIG_TIEN_TO_TRUONG}, ${APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH}, Trực tuyến, AI Thực chiến - ${APP_CONFIG_TEN_TRUONG.toUpperCase()}, đào tạo`,
		},
		{ property: 'og:image', content: '/metadata.png' },
		{
			name: 'description',
			content: `AI Thực chiến - ${APP_CONFIG_TEN_TRUONG.toUpperCase()}`,
		},
		{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' },
	],
	links: [
		{ rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
		{ rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css' },
	],

	headScripts: [
		{ src: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js' },
		...(APP_CONFIG_GA_ID
			? [
					{ src: `https://www.googletagmanager.com/gtag/js?id=${APP_CONFIG_GA_ID}`, async: true },
					{
						content: `window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', '${APP_CONFIG_GA_ID}');`,
					},
				]
			: []),
	],

	antd: {
		import: false,
		// Transform DayJS to MomentJS
		momentPicker: false,
	},
	access: {},
	model: {},
	initialState: {},
	request: {},
	layout: {
		// https://umijs.org/zh-CN/plugins/plugin-layout
		locale: true,
		...defaultSettings,
	},
	// https://umijs.org/zh-CN/plugins/plugin-locale
	locale: {
		// enable: true,
		default: 'vi-VN',
		antd: true,
		// default true, when it is true, will use `navigator.language` overwrite default
		// Có sử dụng ngôn ngữ mặc định của trình duyệt?
		baseNavigator: false,

		// Default: '-' => 'vi-VN'
		// baseSeparator: '_',
	},
	targets: { ie: 11 },
	routes,

	ignoreMomentLocale: true,
	// proxy: proxy[REACT_APP_ENV || 'dev'],
	// base: '/qldt', 		// Sub-path
	manifest: {
		basePath: '/',
	},
	// Fast Refresh 热更新
	fastRefresh: true,

	// plugins: ['@react-dev-inspector/umi4-plugin'],

	alias: {
		'pdfjs-dist': require.resolve('@react-pdf-viewer/pdfjs-dist-signature'),
		'@simulations': require('path').resolve(__dirname, '../../simulations'),
		three: require('path').resolve(__dirname, '../node_modules/three'),
	},

	jsMinifier: 'terser',
	exportStatic: {},

	define: {
		// Defaults cho tất cả APP_CONFIG_* identifiers — esbuild sẽ replace tất cả,
		// tránh ReferenceError khi env var không được set lúc build
		APP_CONFIG_IP_ROOT: '',
		APP_CONFIG_TEN_TRUONG: '',
		APP_CONFIG_TIEN_TO_TRUONG: '',
		APP_CONFIG_TEN_TRUONG_VIET_TAT_TIENG_ANH: '',
		APP_CONFIG_GA_ID: '',
		APP_CONFIG_SENTRY_DSN: '',
		APP_CONFIG_ONE_SIGNAL_ID: '',
		APP_CONFIG_GOOGLE_CLIENT_ID: '',
		APP_CONFIG_PRIMARY_COLOR: '',
		APP_CONFIG_HIGHLIGHT_COLOR: '',
		APP_CONFIG_APP_VERSION: '',
		APP_CONFIG_PHAN_QUYEN_URL: '',
		APP_CONFIG_URL_LANDING: '',
		APP_CONFIG_URL_CORE: '',
		APP_CONFIG_URL_CAN_BO: '',
		APP_CONFIG_URL_DAO_TAO: '',
		APP_CONFIG_URL_TAI_CHINH: '',
		APP_CONFIG_URL_KHAO_THI: '',
		APP_CONFIG_URL_NHAN_SU: '',
		APP_CONFIG_URL_CTSV: '',
		APP_CONFIG_URL_QLKH: '',
		APP_CONFIG_URL_QLVB: '',
		APP_CONFIG_URL_QLND: '',
		APP_CONFIG_URL_CSVC: '',
		APP_CONFIG_URL_THU_VIEN: '',
		APP_CONFIG_URL_CONNECT: '',
		APP_CONFIG_URL_KY_SO: '',
		APP_CONFIG_URL_VPS: '',
		APP_CONFIG_URL_TAP_CHI_KH: '',
		APP_CONFIG_URL_VBCC: '',
		GOOGLE_CLIENT_ID: '',
		// Override bằng env vars thực (Railway build args / local .env)
		...Object.entries(process.env).reduce((result: Record<string, string>, [key, value]) => {
			if ((key.startsWith('APP_CONFIG_') || key === 'GOOGLE_CLIENT_ID') && value !== undefined) {
				return { ...result, [key]: value };
			}
			return result;
		}, {}),
	},
});
