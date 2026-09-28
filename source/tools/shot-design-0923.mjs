import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle0', timeout: 60000 })
const r = await p.evaluate(() => {
  const h = [...document.querySelectorAll('h3')].find(x => x.textContent.trim() === 'The market set')
  if (!h) return { found: false }
  const set = h.nextElementSibling.nextElementSibling
  set.id = 'tmset'
  return { found: true, tm: set.querySelectorAll('.iaq-tm').length, figs: set.querySelectorAll('figure').length }
})
await new Promise(x => setTimeout(x, 600))
const el = await p.$('#tmset'); if (el) await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ ...r, errs }))
await b.close()
