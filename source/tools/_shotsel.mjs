import puppeteer from 'puppeteer-core'
const [route, sel, out, w] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: +(w || 1440), height: 950, deviceScaleFactor: 1.4 })
await p.goto('http://localhost:5177' + route + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
await new Promise(r => setTimeout(r, 1200))
const el = await p.$(sel)
if (!el) { console.log('MISSING', sel); await b.close(); process.exit(1) }
await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 800))
await el.screenshot({ path: out })
console.log('ok', JSON.stringify(await el.evaluate(e => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })))
await b.close()
