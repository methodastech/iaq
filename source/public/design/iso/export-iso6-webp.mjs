#!/usr/bin/env node
/* 29 Sep 2026. The six service objects as 240 px square WebP cuts with a transparent ground, for the
   delivery cycle discs. Source: the still twins (svc-*-still.svg, the rest pose) from build-iso6.mjs.
   Each cut is cropped square round the drawing itself with a small even margin, so the six sit at one
   size in a disc. Run after build-iso6.mjs:  node public/design/iso/export-iso6-webp.mjs
   Needs puppeteer-core (in the project) and Google Chrome at the standard macOS path. */
import puppeteer from 'puppeteer-core';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const NAMES = ['design', 'procure', 'construct', 'commission', 'maintain', 'hookup'];
const SIZE = 240, MARGIN = 0.06;

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
for (const n of NAMES) {
  const svg = readFileSync(join(DIR, `svc-${n}-still.svg`), 'utf8');
  await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:${SIZE}px;height:${SIZE}px}</style></head><body>${svg}</body></html>`);
  await page.evaluate((m) => {
    const s = document.querySelector('svg');
    const b = s.getBBox();
    const side = Math.max(b.width, b.height) * (1 + 2 * m);
    s.setAttribute('viewBox', `${b.x + b.width / 2 - side / 2} ${b.y + b.height / 2 - side / 2} ${side} ${side}`);
    s.setAttribute('width', String(240)); s.setAttribute('height', String(240));
  }, MARGIN);
  const buf = await page.screenshot({ type: 'webp', quality: 92, omitBackground: true, clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  writeFileSync(join(DIR, `svc-${n}-ic.webp`), buf);
  console.log(`svc-${n}-ic.webp`, (buf.length / 1024).toFixed(1), 'kb');
}
await browser.close();
