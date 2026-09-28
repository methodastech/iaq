import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500))
  const band = await p.$('.sm-map'); await band.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1500))
  const r = await p.evaluate(async () => {
    const q = s => document.querySelector(s)
    const st = () => ({ frame: q('.sm-map-stage .fx-view img').getAttribute('src').split('/').pop(), lit: [...document.querySelectorAll('.sm-map-stage .fx-pin.lit:not(.gone)')].map(e => e.querySelector('i').textContent).join(','), me: q('.sm-map .rx-n.me')?.textContent.slice(0, 24) || null })
    document.querySelectorAll('.sm-map .rx-n.n-u')[1].click(); await new Promise(r => setTimeout(r, 1500)); const a = st()
    document.querySelectorAll('.sm-map .rx-n.n-w')[0].click(); await new Promise(r => setTimeout(r, 1500)); const c = st()
    const pin7 = [...document.querySelectorAll('.sm-map-stage .fx-pin')].find(e => e.querySelector('i').textContent === '7'); pin7.click(); await new Promise(r => setTimeout(r, 1500)); const d = st()
    return { unit2: a, csa: c, pin7: d, past: [...document.querySelectorAll('.sm-map *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length }
  })
  console.log(w, JSON.stringify(r), 'errors', errs.length, errs.slice(0, 2))
  await p.evaluate(() => document.querySelectorAll('.sm-map .rx-n.n-u')[0].click()); await new Promise(r => setTimeout(r, 1800))
  const el = await p.$('.sm-map-stage'); await el.screenshot({ path: `${OUT}/mapstage-${w}.png` })
  await p.close()
}
await b.close()
