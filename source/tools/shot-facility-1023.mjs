/* 23 Oct 2026: the Services facility map at rest and in a picked state, headless on Metal, for the Polishing record.
   Usage: node tools/shot-facility-1023.mjs <base> <outdir> <tag>   (writes <tag>-rest.webp, <tag>-picked.webp, <tag>-zoom.webp) */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const [base = 'http://localhost:5177', out = '/tmp/facility', tag = 'shot', query = ''] = process.argv.slice(2)   /* query: e.g. "?frdir=-.68,.36,-.64" */
fs.mkdirSync(out, { recursive: true })
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)))
await p.goto(base + '/services' + query, { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 6000))
const sec = await p.$('.sm-map-full')
const clip = async () => { const r = await sec.boundingBox(); return { x: 0, y: Math.max(0, r.y), width: 1440, height: Math.min(900, r.height) } }
await p.evaluate(() => window.scrollTo(0, 0)); await new Promise(w => setTimeout(w, 800))
await p.screenshot({ path: `${out}/${tag}-rest.webp`, type: 'webp', quality: 88, clip: await clip() })
/* a pick: the system row named Architectural finishes */
const picked = await p.evaluate(() => { const el = [...document.querySelectorAll('.sm-map-side button, .sm-map-side [role="button"], .sm-map-side li, .sm-map-side a')].find(e => /Architectural finishes/.test(e.textContent)); if (!el) return false; el.click(); return true })
await new Promise(w => setTimeout(w, 3500))
await p.screenshot({ path: `${out}/${tag}-picked.webp`, type: 'webp', quality: 88, clip: await clip() })
/* a second pick: the cleanroom envelope */
await p.evaluate(() => { const el = [...document.querySelectorAll('.sm-map-side button, .sm-map-side [role="button"], .sm-map-side li, .sm-map-side a')].find(e => /Cleanroom envelope/.test(e.textContent)); if (el) el.click() })
await new Promise(w => setTimeout(w, 3500))
await p.screenshot({ path: `${out}/${tag}-picked2.webp`, type: 'webp', quality: 88, clip: await clip() })
/* zoomed in two steps at rest */
await p.evaluate(() => { const el = [...document.querySelectorAll('.sm-map-side button, .sm-map-side [role="button"], .sm-map-side li, .sm-map-side a')].find(e => /Architectural finishes/.test(e.textContent)); if (el) el.click() })
await new Promise(w => setTimeout(w, 1200))
for (let i = 0; i < 2; i++) { await p.click('.sm-map-tools button[aria-label="Zoom in"]'); await new Promise(w => setTimeout(w, 900)) }
await new Promise(w => setTimeout(w, 1500))
await p.screenshot({ path: `${out}/${tag}-zoom.webp`, type: 'webp', quality: 88, clip: await clip() })
console.log(JSON.stringify({ picked, errs }))
await b.close()
