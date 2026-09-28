import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1800))
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)) } scrollTo(0, 0) }); await new Promise(r => setTimeout(r, 900))
  const m = await p.evaluate(() => {
    const past = [...document.querySelectorAll('.cyb *, .sm-work *, .sysm *, .sm-units *')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.right <= innerWidth + 1) return false; for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { if (/hidden|clip/.test(getComputedStyle(x).overflow)) return false } return true }).length
    return { total: document.body.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth, pastEdge: past, screens: +(document.body.scrollHeight / innerHeight).toFixed(1) }
  })
  console.log(w, JSON.stringify(m), 'errors', errs.length)
  if (w === 1440) { await p.screenshot({ path: OUT + '/services-final-full.png', fullPage: true }) }
  await p.close()
}
await b.close()
