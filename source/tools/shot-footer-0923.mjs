import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2500))
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await new Promise(r => setTimeout(r, 1500))
const rows = await p.evaluate(() => {
  const q = s => document.querySelector(s)?.getBoundingClientRect()
  const r = { brand: q('.cb-brand'), ask: q('.cb-ask'), nav: q('.cb-nav'), led: q('.cb-ledger') }
  const o = {}
  for (const k in r) o[k] = r[k] ? { top: Math.round(r[k].top), left: Math.round(r[k].left), h: Math.round(r[k].height) } : null
  return o
})
const el = await p.$('.cb')
if (el) await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify(rows))
await b.close()
