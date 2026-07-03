// Regenerates static thumbnail images (public/thumbnails/<simId>.webp) by driving
// the dev-only /dev/thumbnail-capture route with headless Chromium and reusing
// the exact same capture logic the app already uses for live previews
// (SimThumbCapture / GenericChemSimulation onThumbnail).
//
// Usage:
//   yarn dev                                   # Umi dev server must already be running
//   yarn thumbnails:generate                   # regenerate every registered sim
//   yarn thumbnails:generate MATH10-01 SIM-26  # regenerate only the given ids
//
// One-time setup: npx playwright install chromium

import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.THUMB_BASE_URL || 'http://localhost:8000';
const OUTPUT_DIR = path.resolve(__dirname, '../public/thumbnails');
const CAPTURE_TIMEOUT_MS = 8000;

function parseDataUrl(dataUrl) {
	const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
	if (!match) return null;
	return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
}

async function fetchAllIds(page) {
	await page.goto(`${BASE_URL}/dev/thumbnail-capture?mode=list`, { waitUntil: 'domcontentloaded' });
	await page.waitForFunction(() => window.__THUMB_ALL_IDS__ !== undefined, { timeout: CAPTURE_TIMEOUT_MS });
	return page.evaluate(() => window.__THUMB_ALL_IDS__);
}

async function captureOne(page, { id, subject }) {
	await page.goto(`${BASE_URL}/dev/thumbnail-capture?simId=${encodeURIComponent(id)}&subject=${subject}`, {
		waitUntil: 'domcontentloaded',
	});
	await page.waitForFunction(() => window.__THUMB_RESULT__ || window.__THUMB_ERROR__, { timeout: CAPTURE_TIMEOUT_MS });
	const [result, error] = await page.evaluate(() => [window.__THUMB_RESULT__, window.__THUMB_ERROR__]);
	if (error) throw new Error(error);
	if (!result) throw new Error('Không nhận được dữ liệu ảnh');

	const parsed = parseDataUrl(result);
	if (!parsed) throw new Error('Data URL không hợp lệ');

	let webpBuffer;
	if (parsed.mime === 'image/webp') {
		if (parsed.buffer.length < 500) throw new Error('Ảnh chụp quá nhỏ, có thể sim chưa render xong');
		webpBuffer = parsed.buffer;
	} else if (parsed.mime === 'image/svg+xml') {
		if (parsed.buffer.length < 100) throw new Error('SVG chụp được quá nhỏ');
		webpBuffer = await sharp(parsed.buffer).resize(640, 360).webp({ quality: 80 }).toBuffer();
	} else {
		throw new Error(`Định dạng không hỗ trợ: ${parsed.mime}`);
	}

	await fs.writeFile(path.join(OUTPUT_DIR, `${id}.webp`), webpBuffer);
}

async function main() {
	const requestedIds = process.argv.slice(2);
	await fs.mkdir(OUTPUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage({ viewport: { width: 640, height: 360 } });

	const results = { ok: [], failed: [] };
	try {
		let targets;
		if (requestedIds.length > 0) {
			const all = await fetchAllIds(page);
			const bySubject = new Map(all.map((item) => [item.id, item.subject]));
			targets = requestedIds.map((id) => ({ id, subject: bySubject.get(id) }));
			const unknown = targets.filter((t) => !t.subject);
			if (unknown.length > 0) {
				console.error(`Không tìm thấy sim: ${unknown.map((t) => t.id).join(', ')}`);
				process.exitCode = 1;
			}
			targets = targets.filter((t) => t.subject);
		} else {
			targets = await fetchAllIds(page);
		}

		console.log(`Đang sinh ${targets.length} thumbnail...`);
		for (const target of targets) {
			try {
				await captureOne(page, target);
				results.ok.push(target.id);
				console.log(`  ✓ ${target.id}`);
			} catch (err) {
				results.failed.push({ id: target.id, reason: err.message });
				console.error(`  ✗ ${target.id}: ${err.message}`);
			}
		}
	} finally {
		await browser.close();
	}

	console.log(`\nHoàn tất: ${results.ok.length} thành công, ${results.failed.length} lỗi.`);
	if (results.failed.length > 0) {
		console.table(results.failed);
		process.exitCode = 1;
	}
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
