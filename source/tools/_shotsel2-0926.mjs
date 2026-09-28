import puppeteer from 'puppeteer-core'
const [sel, out, w = '1440'] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); await p.setViewport({ width: +w, height: 900, deviceScaleFactor: 1.5 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle2' }); await p.addStyleTag({ content: '.bmws,.snav{visibility:hidden}html{scroll-behavior:auto!important}' })
const el = await p.$(sel); if (!el) { console.log('missing'); process.exit(1) }
await el.evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' })); await new Promise(r => setTimeout(r, 500))
const box = await el.evaluate(e => { const r = e.getBoundingClientRect(), n = e.nextElementSibling ? e.nextElementSibling.getBoundingClientRect() : r; return { x: 0, y: r.top + scrollY, w: innerWidth, h: Math.min(n.bottom - r.top, 3000) } })
await p.screenshot({ path: out, clip: { x: 0, y: box.y, width: box.w, height: box.h }, captureBeyondViewport: true })
console.log('ok'); await b.close()
