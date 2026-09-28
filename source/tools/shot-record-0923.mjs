import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
await p.setViewport({ width: +(process.argv[3] || 1440), height: 950, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2500))
const info = await p.evaluate(() => {
  const gr = document.querySelector('.gr .grid-stats, .gr .gstats, .gr')
  const st = [...document.querySelectorAll('.gr .gstat')]
  st[0]?.scrollIntoView({ block: 'center' })
  const num = st[0]?.querySelector('.num')
  return { stats: st.length, mk: st[0]?.querySelector('svg')?.getBoundingClientRect().width | 0, num: num && getComputedStyle(num).fontSize, lab: st[0] && getComputedStyle(st[0].querySelector('.lab')).fontSize }
})
await new Promise(r => setTimeout(r, 900))
const el = await p.$('.gr')
if (el) await el.screenshot({ path: process.argv[2] })
console.log(JSON.stringify({ ...info, errs: errs.slice(0, 3) }))
await b.close()
