import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2600))
const info = await p.evaluate(() => {
  const el = document.querySelector('.fab, .fab-assembly, [class*="fab"]')
  if (!el) return { found: false, classes: [...document.querySelectorAll('section')].map(s => s.className).slice(0, 20) }
  el.scrollIntoView({ block: 'center' })
  el.id = 'fabshot'
  return { found: true, cls: el.className, h: Math.round(el.getBoundingClientRect().height) }
})
await new Promise(r => setTimeout(r, 1600))
const el = await p.$('#fabshot')
if (el) await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ ...info, errs }))
await b.close()
