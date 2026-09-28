/* 25 Sep 2026: captures of the Design tab's 02 Brand elements and 18 Applications, plus the sidebar.
   Usage: node tools/shot-design-apps-0925.mjs <outdir> [width] [only] */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [out = '/tmp/dz', W = '1440', only = ''] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--hide-scrollbars'] })
const p = await b.newPage(); await p.setViewport({ width: +W, height: 900, deviceScaleFactor: 1.5 })
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
p.on('requestfailed', r => errs.push('failed ' + r.url()))
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2', timeout: 90000 })
await p.evaluate(() => document.fonts.ready)
await p.addStyleTag({ content: '.bmws{visibility:hidden}' })   /* the sticky bar would print across every element capture */
const shots = [['side', '.dsb'], ...['el-lockup','el-colour','el-fonts','el-line','el-seven','el-cycle','el-boxes','el-square','el-wire','el-visuals','el-gradients','el-badges','el-library','el-lines','el-company','el-print','el-bounds'].map(k => [k, '#' + k]), ['direction', '#direction'], ['panels', '#ap-panels .ap-stage'], ['signature', '#ap-signature .ap-stage'], ['documents', '#ap-documents .ap-stage'], ['cards', '#ap-cards .ap-stage'], ['rollups', '#ap-rollups .ap-stage'], ['banners', '#ap-banners .ap-stage'], ['stationery', '#ap-stationery .ap-stage'], ['signage', '#ap-signage .ap-stage'], ['inuse', '#inuse']]
for (const [n, sel] of shots) {
  if (only && !only.split(',').includes(n)) continue
  const el = await p.$(sel); if (!el) { errs.push('missing ' + sel); continue }
  if (n !== 'side') { await el.evaluate(e => { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -(document.querySelector('.bmws')?.offsetHeight || 60) - 16) }); await new Promise(r => setTimeout(r, 500)) }
  await el.screenshot({ path: `${out}/${n}-w${W}.png` })
}
const m = await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth, imgsBroken: [...document.querySelectorAll('#elements img, #applications img')].filter(i => !i.complete || !i.naturalWidth).map(i => i.src), on: [...document.querySelectorAll('.dsb a.on')].map(a => a.textContent) }))
console.log(JSON.stringify({ errs, ...m }))
await b.close()
