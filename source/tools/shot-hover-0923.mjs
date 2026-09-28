import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 140)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2000))
await p.evaluate(() => document.querySelector('.hmk-row.hmk-iso').scrollIntoView({ block: 'center' }))
await new Promise(r => setTimeout(r, 900))
const before = await p.evaluate(() => {
  const g = document.querySelectorAll('.hmk-iso li')[2].querySelector('.mk-bd')
  return getComputedStyle(g).transform
})
await p.hover('.hmk-iso li:nth-child(3) a')
await new Promise(r => setTimeout(r, 800))
const after = await p.evaluate(() => {
  const li = document.querySelectorAll('.hmk-iso li')[2]
  const g = li.querySelector('.mk-bd')
  const all = [...li.querySelectorAll('.mk-bd')].map(x => getComputedStyle(x).transform.match(/[-\d.]+\)$/)?.[0] || '0')
  return { one: getComputedStyle(g).transform, all, mk: getComputedStyle(li.querySelector('svg')).transform }
})
const row = await p.$('.hmk-row.hmk-iso')
await row.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ before, after, errs: errs.slice(0, 3) }))
await b.close()
