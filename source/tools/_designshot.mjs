import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle0', timeout: 90000 })
await new Promise(r => setTimeout(r, 1500))
const el = await p.$('.lineset-hero')
if (!el) { console.log(JSON.stringify({ found: false, errs })); await b.close(); process.exit(1) }
await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 600))
await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ found: true, errs }))
await b.close()
