import puppeteer from 'puppeteer-core'
const out = process.argv[2], W = +(process.argv[3] || 1440), H = +(process.argv[4] || 900)
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 120000, args: ['--use-angle=metal', '--enable-gpu', '--no-sandbox'] })
const p = await b.newPage()
const errs = []
p.on('pageerror', e => errs.push(String(e).slice(0, 140)))
p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
await p.setViewport({ width: W, height: H, deviceScaleFactor: 2 })
await p.goto('http://localhost:5177/?noanim', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2200))
const info = await p.evaluate(() => {
  const row = document.querySelector('.hmk-row.hmk-iso')
  if (!row) return { row: false }
  row.scrollIntoView({ block: 'center' })
  const li = [...row.querySelectorAll('li')]
  const over = li.filter(l => { const r = l.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth }).length
  const wrap2 = li.filter(l => { const s = l.querySelector('.hmk-nm'); return s && s.getBoundingClientRect().height > 22 }).length
  const bg = getComputedStyle(row.closest('section') || document.body).backgroundColor
  return { row: true, n: li.length, over, wrap2, mk: li[0]?.querySelector('svg')?.getBoundingClientRect().width | 0, bg }
})
await new Promise(r => setTimeout(r, 400))
const row = await p.$('.hmk-row.hmk-iso')
if (row) await row.screenshot({ path: out })
console.log(JSON.stringify({ ...info, errs: errs.slice(0, 4) }))
await b.close()
