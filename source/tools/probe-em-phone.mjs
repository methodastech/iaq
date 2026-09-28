/* the red phrase on phones: measured as TEXT (a Range), not as the block it sits in */
import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const w of [390, 375, 360, 344]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 800, isMobile: true, hasTouch: true })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  const r = await p.evaluate(() => [...document.querySelectorAll('.sm-units h2, .sm-map h2, .sm-qs h2, .sm-work h2, .sm-faq h2')].map(h => { const em = h.querySelector('em'); const rg = document.createRange(); rg.selectNodeContents(em); const rects = rg.getClientRects(); const tw = rg.getBoundingClientRect().width; const col = h.getBoundingClientRect().width; return { t: em.textContent.trim().slice(0, 30), lines: rects.length, spare: Math.round(col - tw) } }))
  console.log(w, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), JSON.stringify(r))
  await p.close()
}
await b.close()
