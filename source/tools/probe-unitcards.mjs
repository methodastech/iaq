import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
for (const [w, tag] of [[1440, 'd'], [1200, 'l'], [390, 'm']]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => document.querySelector('.sm-units').scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 2500))
  const r = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.sm-uc')]
    const rowTops = k => cards.map(c => Math.round(c.querySelectorAll('.sm-uc-spec > div')[k].getBoundingClientRect().top))
    const spread = a => Math.max(...a) - Math.min(...a)
    return { cards: cards.length, h: cards.map(c => Math.round(c.getBoundingClientRect().height)), rowSpread: [0, 1, 2, 3].map(k => spread(rowTops(k))), goTop: spread(cards.map(c => Math.round(c.querySelector('.sm-uc-go').getBoundingClientRect().top))), svc6: cards.map(c => c.querySelectorAll('.sm-svc6 .sm-chip').length), opacity: cards.map(c => getComputedStyle(c).opacity), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }
  })
  console.log(w, JSON.stringify(r), 'errors', errs.length ? errs : 0)
  if (w !== 1200) { const el = await p.$('.sm-units'); await el.screenshot({ path: `${OUT}/${tag}-unitcards.png` }) }
  await p.close()
}
await b.close()
