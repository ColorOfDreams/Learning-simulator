import { primaryColor } from '@/services/base/constant';
import { tienVietNam } from '@/utils/utils';
import { getLocale } from '@umijs/max';
import { type ApexOptions } from 'apexcharts';
import en from 'apexcharts/dist/locales/en.json';
import vi from 'apexcharts/dist/locales/vi.json';
import Chart from 'react-apexcharts';
import { type DataChartType } from '.';
import './style.less';

const ColumnChart = (props: DataChartType) => {
	const { title, xAxis, yAxis, yLabel, height, type, formatY, colors, otherOptions, theme } = props;
	const locale = getLocale();
	const defaultLocale = locale === 'vi-VN' ? 'vi' : 'en';

	const getIsDark = () => {
		if (theme) {
			return theme === 'dark';
		}
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('scl-theme');
			if (stored) return stored === 'dark';
			if (document.documentElement.getAttribute('data-theme') === 'dark') return true;
			const dashboard = document.querySelector('.admin-dashboard');
			if (dashboard && dashboard.getAttribute('data-theme') === 'dark') return true;
			const stuRoot = document.querySelector('.stu-root');
			if (stuRoot && stuRoot.getAttribute('data-theme') === 'dark') return true;
		}
		return false;
	};
	const isDark = getIsDark();

	const safeFormatY = (val: number) => {
		if (val === undefined || val === null || isNaN(val)) {
			return '';
		}
		return formatY ? formatY(val) : tienVietNam(val);
	};

	const options: ApexOptions = {
		chart: {
			background: 'transparent',
			fontFamily: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
			defaultLocale: defaultLocale,
			locales: [vi, en],
			zoom: {
				enabled: true,
				type: 'x',
				autoScaleYaxis: false,
				zoomedArea: {
					fill: {
						color: '#90CAF9',
						opacity: 0.4,
					},
					stroke: {
						color: '#0D47A1',
						opacity: 0.4,
						width: 1,
					},
				},
			},
		},
		theme: {
			mode: isDark ? 'dark' : 'light',
		},
		title: {
			text: title ?? yLabel[0],
			align: 'left',
			style: {
				fontSize: '14px',
				fontWeight: '600',
				color: isDark ? '#ededee' : '#2a2a28',
			},
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: '50%',
			},
		},
		legend: {
			position: 'right',
			labels: {
				colors: isDark ? '#ededee' : '#2a2a28',
			},
		},
		responsive: [
			{
				breakpoint: 1600, //xxl
				options: {
					legend: { horizontalAlign: 'center', position: 'bottom' },
					plotOptions: {
						bar: {
							columnWidth: '100%',
						},
					},
				},
			},
		],
		dataLabels: {
			enabled: false,
		},
		yaxis: {
			labels: {
				formatter: safeFormatY,
				style: {
					colors: isDark ? '#9b9ba4' : '#7c7a72',
				},
			},
		},
		xaxis: {
			categories: xAxis || [],
			tickAmount: xAxis && xAxis.length > 10 ? 10 : undefined,
			labels: {
				rotate: -45,
				rotateAlways: false,
				hideOverlappingLabels: true,
				style: {
					colors: isDark ? '#9b9ba4' : '#7c7a72',
				},
			},
		},
		tooltip: {
			theme: isDark ? 'dark' : 'light',
			y: { formatter: safeFormatY },
			intersect: false,
			shared: true,
		},
		grid: {
			borderColor: isDark ? '#2e2e35' : '#e0e0e0',
			strokeDashArray: 2,
			xaxis: { lines: { show: false } },
		},
	};

	const series = yLabel.map((y, index) => ({
		name: y,
		data: yAxis?.[index] || [],
		color: colors?.[index] ?? primaryColor,
	}));

	return (
		<Chart options={{ ...options, ...otherOptions }} series={series} type={type ?? 'bar'} height={height ?? 350} />
	);
};

export default ColumnChart;
