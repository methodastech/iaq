/* 25 Sep 2026, night: headless captures of the loader finale. ?ldhold keeps the loader up; window.__ldFin poses the
   finale time and window.__ldRot the finale turn. Usage: node tools/shot-loader-0925.mjs <base> <outdir> <rot,rot> [w] [h] */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = '/tmp/shots', rots = '0', W = '1440', H = '900'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', `--window-size=${W},${H}`] })
const p = await b.newPage(); await p.setViewport({ width: +W, height: +H, deviceScaleFactor: 1 })
const errs = []; p.on('pageerror', e => errs.push(e.message))
await p.goto(base + '/?ldhold', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(r => setTimeout(r, 2500))
for (const fin of [0.5, 1.0, 3]) for (const r of rots.split(',')) {
  const [ry, rx] = r.split(':')
  await p.evaluate((f, ry, rx) => { window.__ldFin = f; if (ry !== undefined && ry !== '') window.__ldRot = +ry; if (rx !== undefined && rx !== '') window.__ldTilt = +rx }, fin, ry, rx)
  await new Promise(r => setTimeout(r, 700))
  await p.screenshot({ path: `${out}/loader-w${W}-f${fin}-r${r}.png` })
}
const tags = await p.$$eval('.ld-tag', els => els.map(e => e.className + ' ' + e.textContent))
console.log(JSON.stringify({ errs, tags, pct: await p.$eval('#ldPct', e => e.textContent) }))
await b.close()
