import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.goto('http://localhost:5177/careers/culture', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2500))
const out = {}
out.strip = await p.evaluate(() => [...document.querySelectorAll('img[src*="/events/"]')].map(i => [i.getAttribute('src').split('/').pop(), i.complete && i.naturalWidth > 0]))
let y = await p.evaluate(() => { const i = document.querySelector('img[src*="mciea-2024-stage"]'); return i ? i.getBoundingClientRect().top + scrollY - 200 : 0 })
await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1800))
await p.screenshot({ path: `${OUT}/cu-strip.png`, captureBeyondViewport: false })
y = await p.evaluate(() => { const i = document.querySelector('img[src*="house-of-love-2025"]'); return i ? i.getBoundingClientRect().top + scrollY - 260 : 0 })
await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 1500))
await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => /community/i.test(b.textContent)); if (b) b.click() }); await new Promise(r => setTimeout(r, 1200))
await p.screenshot({ path: `${OUT}/cu-community.png`, captureBeyondViewport: false })
console.log(JSON.stringify({ out, errs }))
await b.close()
