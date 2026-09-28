/* The downloadable Codex: prints /portal/codex with its own print styles (landscape A4, the three sections and the
   document check, one picture per page, no site nav, portal tabs or footer) to public/codex/IAQ-Codex.pdf, and writes
   public/codex/IAQ-Codex.json ({ pages, date }) for the note beside the Download button.
   Run after any change to the Codex:   node tools/export-codex-pdf-0918.mjs [base]
   public/codex/ is review-only; tools/prune-launch.mjs removes it from the launch build. */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const BASE = process.argv[2] || 'http://localhost:5177'
const OUT = fileURLToPath(new URL('../public/codex/', import.meta.url))
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await page.setViewport({ width: 1280, height: 900 })
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await page.goto(BASE + '/portal/codex?admin', { waitUntil: 'networkidle2', timeout: 90000 })
await page.evaluate(() => document.fonts.ready)
/* every image in (the frames and the slides), then give the fab story its last frame */
/* 18 Sep (Bazil: "download the whole codex page"): every closed panel opens, so the PDF carries the whole page */
await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true }))
/* 24 Sep: one pass down the page, so every in-view reveal (data-reveal, the FAQ's .in) has fired before printing */
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) } scrollTo(0, 0) })
await new Promise(r => setTimeout(r, 600))
await page.evaluate(async () => { for (const im of document.images) { im.loading = 'eager'; if (!im.complete) await new Promise(r => { im.onload = im.onerror = r }) } })
await new Promise(r => setTimeout(r, 1500))
/* Chrome stores WebP images losslessly in a PDF (30 MB for this page). Each photograph and model frame is swapped
   for a JPEG at twice its printed width, which Chrome embeds as is; nothing is rewritten after printing (PyMuPDF's
   image rewrite broke Chrome's shading and transparency resources). The logo keeps its transparency. */
await page.evaluate(() => {
  for (const im of document.querySelectorAll('.cx-page img')) {
    /* 18 Sep: skip other origins (the video thumbnails, hidden in print): a canvas that draws them cannot be exported */
    if (!im.naturalWidth || /logo/.test(im.src) || new URL(im.currentSrc || im.src, location.href).origin !== location.origin) continue
    const w = Math.min(im.naturalWidth, Math.max(480, Math.round(im.getBoundingClientRect().width * 2)))
    const h = Math.round(w * im.naturalHeight / im.naturalWidth)
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h)
    im.removeAttribute('srcset'); im.src = c.toDataURL('image/jpeg', 0.84)
  }
})
await new Promise(r => setTimeout(r, 800))
await page.emulateMediaType('print')
const pdf = await page.pdf({ path: OUT + 'IAQ-Codex.pdf', preferCSSPageSize: true, printBackground: true })
/* PyMuPDF only counts the pages (Chrome compresses its page objects, so they cannot be counted from the bytes) */
/* ...and saves four page previews for the Downloads tab (codex-page-0..3.jpg, spread through the document) */
const py = `import fitz,sys,os
from PIL import Image
p=sys.argv[1]; d=fitz.open(p); n=d.page_count
for k,i in enumerate([0,n//4,n//2,(3*n)//4]):
    px=d[i].get_pixmap(dpi=56); Image.frombytes('RGB',(px.width,px.height),px.samples).save(os.path.join(os.path.dirname(p),'codex-page-%d.jpg'%k),quality=80)
print(n, os.path.getsize(p))`
const [pages, bytes] = execFileSync('python3', ['-c', py, OUT + 'IAQ-Codex.pdf']).toString().trim().split(' ').map(Number)
const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
fs.writeFileSync(OUT + 'IAQ-Codex.json', JSON.stringify({ pages, date, bytes }))
console.log('IAQ-Codex.pdf', pages, 'pages', (bytes / 1048576).toFixed(1) + ' MB', date)
console.log('errors', errs.length, errs.slice(0, 3))
await browser.close()
