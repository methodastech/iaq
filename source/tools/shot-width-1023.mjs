/* 23 Oct 2026: one element of one page at one window width, after the page has been scrolled through so every reveal has
   fired. For the responsive faults the overlap audit found, and for the Polishing record at phone and tablet widths.
   Usage: node tools/shot-width-1023.mjs <url> <width> <selector> <out.webp> [waitMs=3000] [padPx=24] */
import puppeteer from 'puppeteer-core'
const [url, width = '430', selector = 'body', out = '/tmp/shot.webp', waitMs = '3000', pad = '24'] = process.argv.slice(2)
const W = +width
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new',
  args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars', '--window-size=1440,900'] })
const p = await b.newPage(); await p.setViewport({ width: W, height: 900, deviceScaleFactor: 2, isMobile: W < 700, hasTouch: W < 700 })
await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(w => setTimeout(w, 1500))
await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 400) { window.scrollTo(0, y); await new Promise(w => setTimeout(w, 90)) } })
const box = await p.evaluate(async (sel, padPx) => {
  const el = document.querySelector(sel); if (!el) return null
  el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90); await new Promise(w => setTimeout(w, 600))
  const r = el.getBoundingClientRect()
  return { x: 0, y: Math.max(0, r.top + window.scrollY - padPx), width: innerWidth, height: Math.min(1800, r.height + padPx * 2), sy: window.scrollY }
}, selector, +pad)
if (!box) { console.log('no element for', selector); await b.close(); process.exit(1) }
await new Promise(w => setTimeout(w, +waitMs))
await p.screenshot({ path: out, type: 'webp', quality: 88, clip: { x: box.x, y: box.y, width: box.width, height: box.height }, captureBeyondViewport: true })
console.log('->', out, JSON.stringify(box))
await b.close()
