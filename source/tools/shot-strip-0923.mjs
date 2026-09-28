/* the markets strip, which draws the same LINE_SHAPES at icon size */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 140)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/markets?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2000))
const el = await p.$('.ig, .industry-grid, .ig-grid')
if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 800)); await el.screenshot({ path: process.argv[2] }) }
else { await p.screenshot({ path: process.argv[2], fullPage: false }) }
const n = await p.evaluate(() => document.querySelectorAll('.ig-ic').length)
console.log(JSON.stringify({ found: !!el, icons: n, errs }))
await b.close()
