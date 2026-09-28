/* every h2/h3 and lede on /services, and whether each red phrase sits on one line at three widths */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [1440, 1100, 390]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
  await p.setViewport({ width: w, height: 900, isMobile: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  const r = await p.evaluate(() => [...document.querySelectorAll('main h1, main h2, .sm-h3, h1, h2')].filter((e, i, a) => a.indexOf(e) === i).map(h => { const em = h.querySelector('em'); return { t: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 70), emLines: em ? em.getClientRects().length : null } }))
  const wraps = r.filter(x => x.emLines > 1)
  console.log(w, 'headings', r.length, 'em wraps', wraps.length, wraps.map(x => x.t), 'errors', errs.length)
  if (w === 1440) r.forEach(x => console.log('  ', x.t))
  await p.close()
}
await b.close()
