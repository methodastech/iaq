/* The booth plan as one PDF (22 Sep 2026): prints /portal/booth with its print styles (A4 landscape, a section a page
   run, no site chrome) to public/booth/IAQ-SEMICON-Europa-2026-booth-plan.pdf. Run after any change to data/booth.js
   or the drafts:   node tools/export-booth-plan-0922.mjs [base]    public/booth/ is review-only (pruned from launch). */
import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const BASE = process.argv[2] || 'http://localhost:5177'
const OUT = fileURLToPath(new URL('../public/booth/IAQ-SEMICON-Europa-2026-booth-plan.pdf', import.meta.url))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
await p.setViewport({ width: 1280, height: 900 })
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await p.goto(BASE + '/portal/booth?admin', { waitUntil: 'networkidle2', timeout: 90000 })
await p.evaluate(() => document.fonts.ready)
await p.evaluate(async () => { for (const im of document.images) { im.loading = 'eager'; if (!im.complete) await new Promise(r => { im.onload = im.onerror = r }) } })
/* the renders and spec sheets go in as JPEG at twice their printed width; Chrome stores WebP losslessly */
await p.evaluate(() => {
  for (const im of document.querySelectorAll('.bt img')) {
    if (!im.naturalWidth || /mark|logo/.test(im.src)) continue
    const w = Math.min(im.naturalWidth, Math.max(480, Math.round(im.getBoundingClientRect().width * 2))), h = Math.round(w * im.naturalHeight / im.naturalWidth)
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h)
    im.src = c.toDataURL('image/jpeg', 0.82)
  }
})
await new Promise(r => setTimeout(r, 1200))
await p.emulateMediaType('print')
await p.pdf({ path: OUT, preferCSSPageSize: true, printBackground: true })
const info = execFileSync('python3', ['-c', `import fitz,os,sys; d=fitz.open(sys.argv[1]); print(d.page_count, round(os.path.getsize(sys.argv[1])/1048576,1))`, OUT]).toString().trim()
console.log('booth plan PDF:', info.split(' ')[0], 'pages,', info.split(' ')[1], 'MB · errors', errs.length, errs.slice(0, 2))
await b.close()
