import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle2' })
await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); res() } }, 50) }))
const el = await p.$('.sm-ub-models, .sm-ud-models, .sm-uc3-models')
if (el) { await el.evaluate(e => e.closest('section,div').scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 800)); const box = await el.evaluate(e => { const s = e.closest('[class*="sm-ub"], section') || e; const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }); await p.screenshot({ path: process.argv[2], clip: { x: 0, y: Math.max(0, box.y - 20), width: 1440, height: Math.min(900, box.h + 40) } }) }
console.log(!!el); await b.close()
