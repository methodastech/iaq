import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const out = process.argv[2]; const res = []
for (const [w, h, mob] of [[768, 1024, true], [390, 844, true], [1440, 900, false]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)))
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob })
  await p.goto('http://localhost:50519/markets', { waitUntil: 'networkidle2', timeout: 90000 }); await new Promise(r => setTimeout(r, 1800))
  const m = await p.evaluate(() => { const c = [...document.querySelectorAll('.mk-cd')]; const vis = c.filter(e => e.getBoundingClientRect().width > 0); return { cards: vis.length, widths: [...new Set(vis.map(e => Math.round(e.getBoundingClientRect().width)))], labels: vis.length ? vis[0].querySelectorAll('small').length : null, table: !!document.querySelector('.mk-tbl') && document.querySelector('.mk-tbl').getBoundingClientRect().width > 0, docW: document.documentElement.scrollWidth, lead: vis[0] && vis[0].querySelector('.mk-cd-lead').textContent } })
  if (m.cards) { const t = await p.evaluate(() => document.querySelector('.mk-cards').getBoundingClientRect().top + scrollY); await p.evaluate(y => { document.documentElement.style.marginTop = (-y + 20) + 'px' }, t); await new Promise(r => setTimeout(r, 1200)); await p.screenshot({ path: `${out}/mk-cards-${w}.png`, captureBeyondViewport: false }) }
  res.push({ w, errs, ...m }); await p.close()
}
console.log(JSON.stringify(res)); await b.close()
