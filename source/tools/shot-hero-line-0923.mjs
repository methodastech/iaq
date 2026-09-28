import puppeteer from 'puppeteer-core'
const W = +(process.argv[3] || 1440)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.setViewport({ width: W, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2200))
const info = await p.evaluate(() => {
  const row = document.querySelector('.hmk-row.hmk-iso')
  row.scrollIntoView({ block: 'center' })
  const li = [...row.querySelectorAll('li')]
  return {
    n: li.length,
    line: document.querySelector('.hmk').className.includes('hmk-line'),
    gl: !!document.querySelector('.hmk-gl-canvas'),
    wrap2: li.filter(l => l.querySelector('.hmk-nm').getBoundingClientRect().height > 24).length,
    mk: Math.round(li[0].querySelector('svg').getBoundingClientRect().width),
  }
})
await new Promise(r => setTimeout(r, 500))
if (process.argv[4]) { await p.hover('.hmk-iso li:nth-child(' + process.argv[4] + ') a'); await new Promise(r => setTimeout(r, 700)) }
const el = await p.$('.hmk')
await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ ...info, errs: errs.slice(0, 3) }))
await b.close()
