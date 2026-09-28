import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
const out = {}
await p.goto('http://localhost:5177/contact', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 1800))
let y = await p.evaluate(() => { const i = document.querySelector('img[src*="hq-front"]'); return i ? i.getBoundingClientRect().top + scrollY - 120 : -1 })
out.contactY = Math.round(y); if (y > 0) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500)) }
out.contact = await p.evaluate(() => { const i = document.querySelector('img[src*="hq-front"]'); return i && [i.complete && i.naturalWidth > 0, Math.round(i.getBoundingClientRect().width)] })
await p.screenshot({ path: `${OUT}/off-contact.png`, captureBeyondViewport: false })
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000))
y = await p.evaluate(() => { const i = document.querySelector('img[src*="hq-aerial"]'); return i ? i.getBoundingClientRect().top + scrollY - 160 : -1 })
out.cultureY = Math.round(y); if (y > 0) { await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1800)) }
out.culture = await p.evaluate(() => { const i = document.querySelector('img[src*="hq-aerial"]'); return i && [i.complete && i.naturalWidth > 0, Math.round(i.getBoundingClientRect().width)] })
await p.screenshot({ path: `${OUT}/off-culture.png`, captureBeyondViewport: false })
console.log(JSON.stringify({ out, errs }))
await b.close()
