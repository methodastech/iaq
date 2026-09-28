import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) }); page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 160)))
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto('http://localhost:5177/about', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise(r => setTimeout(r, 1200))
const out = {}
for (const label of ['About', 'Services', 'Markets', 'Careers']) {
  const h = await page.evaluateHandle(l => [...document.querySelectorAll('.nav-links a, .nav-links button')].find(a => a.textContent.trim() === l), label)
  const el = h.asElement(); if (!el) { out[label] = 'no trigger'; continue }
  await el.hover(); await new Promise(r => setTimeout(r, 1700))
  out[label] = await page.evaluate(() => { const w = document.querySelector('.nav-mega.open'); if (!w) return null; const r = w.getBoundingClientRect(); return { seth: w.querySelectorAll('.nm-seth').length, left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth, h: Math.round(r.height), links: w.querySelectorAll('a').length, segs: w.querySelectorAll('.nm-seg').length, strip: w.querySelectorAll('.nm-st').length, tiles: w.querySelectorAll('.nm-ict').length, pageW: document.documentElement.scrollWidth } })
  await page.screenshot({ path: `${OUT}/wing-${label.toLowerCase()}.png` })
  await page.mouse.move(700, 850); await new Promise(r => setTimeout(r, 500))
}
console.log(JSON.stringify(out)); console.log('errors', errs.length, errs.slice(0, 3))
await browser.close()
