import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2600))
const ok = await p.evaluate(() => {
  const el = document.querySelector('.ig-row') || document.querySelector('[class*="ig-"]')
  if (!el) return false
  el.scrollIntoView({ block: 'center' }); el.id = 'igshot'; return true
})
await new Promise(r => setTimeout(r, 1600))
if (ok) { const el = await p.$('#igshot'); await el.screenshot({ path: process.argv[2] }) }
console.log(JSON.stringify({ ok, errs: errs.slice(0, 3) }))
await b.close()
