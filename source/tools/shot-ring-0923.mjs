import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.setViewport({ width: +(process.argv[3] || 1440), height: 1000, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/services?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2600))
const info = await p.evaluate(() => {
  const el = document.querySelector('.cring')
  if (!el) return { found: false }
  el.scrollIntoView({ block: 'center' })
  const nodes = [...el.querySelectorAll('.cring-node')].map(n => { const r = n.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width) } })
  return { found: true, nodes: nodes.length, box: nodes }
})
await new Promise(r => setTimeout(r, 1400))
const el = await p.$('.cring')
if (el) await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ ...info, errs: errs.slice(0, 3) }))
await b.close()
