import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (Number(process.versions.node.split('.')[0]) !== 22) {
	throw new Error('The frontend build requires Node.js 22.');
}

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localEnv = join(frontend, '.env.local');
const previous = existsSync(localEnv) ? readFileSync(localEnv) : undefined;
const settings = {
	APP_CONFIG_IP_ROOT: process.env.APP_CONFIG_IP_ROOT || 'https://scilab-demo-api-bl06.onrender.com',
	APP_CONFIG_GOOGLE_CLIENT_ID:
		process.env.APP_CONFIG_GOOGLE_CLIENT_ID ||
		'617306138360-lp9o43cbnndkadavilvu2fgtg9e8p5a7.apps.googleusercontent.com',
	APP_CONFIG_TEN_TRUONG: process.env.APP_CONFIG_TEN_TRUONG || 'AI Study Simulator',
};
const apiUrl = new URL(settings.APP_CONFIG_IP_ROOT);
if (apiUrl.protocol !== 'https:' || apiUrl.username || apiUrl.password) {
	throw new Error('The deployed API must use HTTPS without credentials in its URL.');
}

try {
	// Umi loads .env files after process.env; restore any local override after build.
	writeFileSync(
		localEnv,
		Object.entries(settings)
			.map(([key, value]) => `${key}=${JSON.stringify(value)}`)
			.join('\n'),
	);
	const result = spawnSync(process.execPath, ['node_modules/@umijs/max/bin/max.js', 'build'], {
		cwd: frontend,
		env: { ...process.env, ...settings },
		stdio: 'inherit',
	});
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`Frontend build failed (${result.status ?? result.signal}).`);
	await import('./prepare-cloudflare-pages.mjs');
} finally {
	if (previous) writeFileSync(localEnv, previous);
	else rmSync(localEnv, { force: true });
}
