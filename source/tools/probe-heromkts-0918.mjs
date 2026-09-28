// 18 Sep: the hero market rail. Heights per market (so the hero never jumps), rotation, hover hold, overflow.
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [1024, 768], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500))
  const hs = await p.evaluate(async () => {
    const out = []
    const tabs = [...document.querySelectorAll('.hmr-segs button')]
    for (const t of tabs) { t.click(); await new Promise(r => setTimeout(r, 120)); const n = document.querySelector('.hmr-now'); out.push(Math.round(n.getBoundingClientRect().height)) }
    tabs[0].click(); document.activeElement.blur()
    return out
  })
  // rotation: move the mouse away, wait one dwell, see the index advance; then hover and see it hold
  await p.mouse.move(5, h - 5)
  const before = await p.evaluate(() => [...document.querySelectorAll('.hmr-segs button')].findIndex(x => x.classList.contains('on')))
  await new Promise(r => setTimeout(r, 5200))
  const after = await p.evaluate(() => [...document.querySelectorAll('.hmr-segs button')].findIndex(x => x.classList.contains('on')))
  const card = await p.$('.hmr-card'); const bb = await card.boundingBox()
  await p.mouse.move(bb.x + 40, bb.y + 40)
  const h0 = await p.evaluate(() => [...document.querySelectorAll('.hmr-segs button')].findIndex(x => x.classList.contains('on')))
  await new Promise(r => setTimeout(r, 5200))
  const h1 = await p.evaluate(() => [...document.querySelectorAll('.hmr-segs button')].findIndex(x => x.classList.contains('on')))
  const ov = await p.evaluate(() => ({ page: document.documentElement.scrollWidth - innerWidth, card: (() => { const c = document.querySelector('.hmr-card'); return c.scrollWidth - c.clientWidth })(), heroBottom: Math.round(document.querySelector('.hmr').getBoundingClientRect().bottom), heroH: Math.round(document.querySelector('.hero').getBoundingClientRect().height) }))
  console.log(w, 'panel heights', hs.join(','), '| rotate', before, '->', after, '| hover hold', h0, '->', h1, '| overflow', JSON.stringify(ov), '| errors', errs.length, errs.slice(0, 2))
  await p.mouse.move(5, h - 5)
  await p.evaluate(() => document.querySelectorAll('.hmr-segs button')[0].click())
  await new Promise(r => setTimeout(r, 900))
  await p.screenshot({ path: `${OUT}/hmr-${w}.png` })
  await p.close()
}
await b.close()
