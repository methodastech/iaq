import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 180000, args: ['--no-sandbox','--use-angle=metal','--enable-gpu'] })
for (const [r, sel] of [['/', '.lp-field'], ['/markets', '.pg-pc-more'], ['/projects/0', '.prj-side'], ['/contact', '.of-route']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 950 })
  await p.goto('http://localhost:5177' + r + '?noanim', { waitUntil: 'networkidle2', timeout: 60000 })
  await p.evaluate(() => new Promise(res => { let y = 0; const t = setInterval(() => { scrollTo(0, y += 1400); if (y > document.body.scrollHeight) { clearInterval(t); scrollTo(0, 0); res() } }, 50) }))
  await new Promise(x => setTimeout(x, 900))
  const o = await p.evaluate(s => {
    const e = document.querySelector(s); if (!e) return { none: true }
    const cs = getComputedStyle(e); const rr = e.getBoundingClientRect()
    const kids = [...e.children].filter(k => k.getBoundingClientRect().height > 0)
    const ink = kids.length ? Math.max(...kids.map(k => k.getBoundingClientRect().bottom)) : rr.top
    const par = e.parentElement ? getComputedStyle(e.parentElement) : null
    return { cls: String(e.className).slice(0, 34), pos: cs.position, h: Math.round(rr.height), slack: Math.round(rr.bottom - ink), parentDisplay: par && par.display, parentAlign: par && par.alignItems, kids: kids.length }
  }, sel)
  console.log(r.padEnd(14) + sel.padEnd(14) + JSON.stringify(o))
  await p.close()
}
await b.close()
