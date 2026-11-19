import { access, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(frontend, 'dist');
await access(join(output, 'index.html'));

// Pages enables SPA fallback only when no top-level 404.html is present.
await rm(join(output, '404.html'), { force: true });

async function countFiles(directory) {
	let count = 0;
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		count += entry.isDirectory() ? await countFiles(join(directory, entry.name)) : 1;
	}
	return count;
}

console.log(`Cloudflare Pages: ${await countFiles(output)} assets ready in dist; SPA fallback enabled.`);
