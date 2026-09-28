import puppeteer from 'puppeteer-core'
const SP = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1.5 })
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 110)))
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(r => setTimeout(r, 3200))
await p.evaluate(() => document.getElementById('globeHost')?.scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 2600))
console.log(JSON.stringify(await p.evaluate(() => (window.__globeQA ? window.__globeQA() : { no: true }))), 'errs', errs.length, errs.slice(0, 2))
const el = await p.$('#globeHost')
if (el) await el.screenshot({ path: SP + '/globe.png' })
await b.close()
