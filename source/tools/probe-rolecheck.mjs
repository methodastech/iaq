import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', e => errs.push(String(e)))
await p.goto('http://localhost:5177/careers', { waitUntil: 'networkidle2' }); await new Promise(r => setTimeout(r, 2000))
const y = await p.evaluate(() => { const h = [...document.querySelectorAll('h2,h3')].find(e => /^Engineering/.test(e.textContent.trim())); return h.getBoundingClientRect().top + scrollY - 40 })
await p.evaluate(y => window.scrollTo(0, y), y); await new Promise(r => setTimeout(r, 2500))
await p.screenshot({ path: `${OUT}/roles.png`, captureBeyondViewport: false })
console.log(JSON.stringify(errs))
await b.close()
