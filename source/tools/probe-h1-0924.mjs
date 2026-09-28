import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [390, 'm'], [360, 's']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 120)))
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 60000 }); await new Promise(r => setTimeout(r, 2500))
  const r = await p.evaluate(() => { const h = document.querySelector('.hero h1'); const em = h.querySelector('em'); const rg = document.createRange(); rg.selectNodeContents(em); const lines = [...h.querySelectorAll('.hl')].map(e => Math.round(e.getBoundingClientRect().top)); return { text: h.getAttribute('aria-label'), emLines: new Set([...rg.getClientRects()].map(r => Math.round(r.top))).size, hlTops: lines, h1W: Math.round(h.getBoundingClientRect().width), h1R: Math.round(h.getBoundingClientRect().right), vw: innerWidth, lede: document.querySelector('.hero .lede').textContent.slice(0, 80), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  if (w !== 360) await p.screenshot({ path: `${OUT}/${tag}-hero-h1.png`, clip: { x: 0, y: 0, width: w, height: w < 500 ? 700 : 820 } })
  await p.close()
}
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); await p.goto('http://localhost:5177/design.html', { waitUntil: 'networkidle0', timeout: 60000 })
console.log('design tab dioramas:', await p.evaluate(() => document.querySelectorAll('svg.iaq-dm').length), 'faq+grow:', await p.evaluate(() => !!document.querySelector('.dm-faq') && !!document.querySelector('.dm-grow')))
const el = await p.$('.dm-grow'); if (el) { await el.evaluate(e => e.closest('figure').scrollIntoView({ block: 'center' })); await new Promise(r => setTimeout(r, 500)); await (await p.evaluateHandle(() => document.querySelector('.dm-faq').closest('.isoset'))).screenshot({ path: `${OUT}/design-dioramas.png` }) }
await b.close()
