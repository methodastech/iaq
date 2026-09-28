import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim&marks=line', { waitUntil: 'domcontentloaded', timeout: 60000 })
await new Promise(r => setTimeout(r, 3200))
await p.evaluate(() => document.querySelector('.hmk-row.hmk-iso').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 900))
const el = await p.$('.hmk')
await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ errs }))
await b.close()
