import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox', '--enable-unsafe-webgpu'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await p.setViewport({ width: +(process.argv[3] || 1440), height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 3500))
await p.evaluate(() => document.querySelector('.hmk-row.hmk-iso').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 1500))
const info = await p.evaluate(() => {
  const h = document.querySelector('.hmk')
  const c = document.querySelector('.hmk-gl-canvas')
  return { on3d: h?.className.includes('hmk-on3d'), canvas: c ? [c.width, c.height] : null }
})
if (process.argv[4]) await p.hover('.hmk-iso li:nth-child(' + process.argv[4] + ') a'), await new Promise(r => setTimeout(r, 900))
const el = await p.$('.hmk')
await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ ...info, errs: errs.slice(0, 4) }))
await b.close()
