/* 9 Oct 2026: the exhibition portal inside the website, checked headless. Usage: node tools/check-expo-1009.mjs <base> <outdir> */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = '/tmp/expo'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900', '--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()) })
await p.goto(base + '/booth/expo/index.html', { waitUntil: 'networkidle2', timeout: 90000 })
await new Promise(r => setTimeout(r, 2500))
const st = await p.evaluate(() => ({
  imgs: [...document.images].length, drawn: [...document.images].filter(i => i.naturalWidth > 0).length, emptySrc: [...document.images].filter(i => !i.getAttribute('src')).length, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src')).slice(0, 8),
  sections: [...document.querySelectorAll('main section[id]')].map(s => s.id), canvas3d: !!document.querySelector('#viewer canvas'), booth: !!document.querySelector('#booth *'),
  tiles: document.querySelectorAll('#tiles-stand img, #tiles-print img').length }))
await p.screenshot({ path: out + '/expo-top.png' })
for (const id of ['compare', 'stand3d', 'stand', 'digital', 'files']) { await p.evaluate(id => document.getElementById(id).scrollIntoView(), id); await new Promise(r => setTimeout(r, 2500)); await p.screenshot({ path: `${out}/expo-${id}.png` }) }
/* a single download, through the rewritten fetch: the blob must have the file's real size */
const dl = await p.evaluate(async () => { const b = await FILEBLOB('IAQ-D-Side-wall.png'); return b ? b.size : null })
const zip = await p.evaluate(async () => { const b = await FILEBLOB('IAQ-qr-website.png'); return b ? b.size : null })
console.log(JSON.stringify({ ...st, sideWallBytes: dl, qrBytes: zip, errs: errs.slice(0, 12), errCount: errs.length }, null, 1))
await b.close()
