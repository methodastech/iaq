/* exports the Codex infographic set as 1920x1080 PNGs (one per slide). The PDF is assembled from
   them by the caller. Usage: node tools/export-codex-slides-0918.mjs <outdir> [base] */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]; const BASE = process.argv[3] || 'http://localhost:5177'
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1968, height: 1200, deviceScaleFactor: 1 })
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) }); page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 200)))
await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 })
await page.evaluate(() => localStorage.setItem('iaq.cms.session.v1', '1'))
await page.goto(BASE + '/codex/slides', { waitUntil: 'networkidle2', timeout: 60000 })
await page.evaluate(() => { const st = document.createElement('style'); st.textContent = ':root{zoom:1!important}.bmws,.nav,.skip-link{display:none!important}body{padding-top:0!important}'; document.head.appendChild(st) })
await page.evaluate(() => document.fonts.ready)
await new Promise(r => setTimeout(r, 1200))
const slides = await page.$$('.cxs')
let i = 0
for (const el of slides) { i++; const id = await el.evaluate(e => e.id); const b = await el.boundingBox(); await el.screenshot({ path: `${OUT}/${id}.png` }); console.log(id, Math.round(b.width) + 'x' + Math.round(b.height)) }
/* overflow audit: any element inside a slide that spills past the slide's own box */
const spill = await page.evaluate(() => [...document.querySelectorAll('.cxs')].map((s, k) => { const r = s.getBoundingClientRect(); const bad = [...s.querySelectorAll('.cxs-b *')].filter(e => { const q = e.getBoundingClientRect(); return q.width > 0 && (q.bottom > r.bottom - 1 || q.right > r.right + 1) }); const f = s.querySelector('.cxs-f').getBoundingClientRect(); const over = [...s.querySelectorAll('.cxs-b *')].filter(e => { const q = e.getBoundingClientRect(); return q.height > 0 && q.bottom > f.top + 1 }); return { slide: k + 1, pastSlide: bad.length, pastFooter: over.length, worst: over.slice(0, 3).map(e => (e.className?.baseVal ?? e.className) || e.tagName) } }))
console.log(JSON.stringify(spill))
console.log('errors', errs.length, errs.slice(0, 3))
await browser.close()
