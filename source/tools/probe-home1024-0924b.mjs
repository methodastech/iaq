import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
await p.setViewport({ width: 1024, height: 768 })
await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2000))
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)) } })
const m = await p.evaluate(() => { const past = [...document.querySelectorAll('.fx *, .cyb *, .glance.gr *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).visibility !== 'hidden').slice(0, 4).map(e => e.className.toString().slice(0, 30)); return { overflow: document.documentElement.scrollWidth - innerWidth, past, h1Em: document.querySelector('.hero h1 em').getClientRects().length, fxEm: document.querySelector('.fx h2 em').getClientRects().length, cybEm: document.querySelector('.cyb h2 em').getClientRects().length } })
console.log(JSON.stringify(m), 'errors', errs.length)
for (const [sel, name] of [['.fx', 'fx'], ['.cyb', 'cyb']]) { const el = await p.$(sel); await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200)); await el.screenshot({ path: `${OUT}/${name}-1024.png` }) }
await b.close()
