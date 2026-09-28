// the Services page, late 24 Sep: IAQ's own model on the dark banner, the interface named, the reading under the map,
// the units as one board, blue isometric cycle marks
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' })
for (const [w, h] of [[1440, 900], [1300, 900], [1024, 800], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500))
  const m = await p.evaluate(async () => {
    const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]
    const banner = q('.sm-map-dark'); const br = banner.getBoundingClientRect()
    const view = q('.sm-map-dark .fx-view'); const vr = view.getBoundingClientRect(); const img = view.querySelector('img')
    const stage = q('.sm-map-stage').getBoundingClientRect(), side = q('.sm-map-side').getBoundingClientRect()
    const over = qa('.rx-compact .rx-n').filter(n => { const s = n.querySelector('span:last-child'); return s && s.getBoundingClientRect().right > n.getBoundingClientRect().right + 1 }).length
    const iso = q('.rx-compact .rx-s .rx-iso')?.getBoundingClientRect().width
    // pick a unit in the map: the model scrubs, pins light, the reading fills
    const u = qa('.sm-map .rx-n.n-u'); u[0].click(); await new Promise(r => setTimeout(r, 300)); if (!u[0].classList.contains('me')) u[0].click(); await new Promise(r => setTimeout(r, 1800))
    const src0 = img.getAttribute('src'); const pins = qa('.sm-map-dark .fx-pin.lit').length; const read = q('.sm-map-read p')?.innerText.slice(0, 70)
    const readBelowMap = q('.sm-map-read').getBoundingClientRect().top >= q('.sm-map-in').getBoundingClientRect().bottom - 1
    // the units board
    const ub = q('.sm-ub'); const rows0 = ub.querySelectorAll('.sm-ub-row').length
    const btn = q('.sm-uc-more'); btn.click(); await new Promise(r => setTimeout(r, 500))
    const rows1 = ub.querySelectorAll('.sm-ub-row').length; const svgs = ub.querySelectorAll('svg.ud-svg').length
    const ubPast = [...ub.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > ub.getBoundingClientRect().right + 1).length
    const cards = qa('.sm-uc').length
    // the cycle marks: isometric svg, blue, none cut
    const mk = qa('.cyc-mk'); const mkSvg = mk.filter(e => e.tagName === 'svg' || e.querySelector('svg')).length
    const stg = q('.cyc-stage')?.getBoundingClientRect(); const mkCut = mk.filter(e => { const r = e.getBoundingClientRect(); return stg && (r.left < stg.left - 2 || r.right > stg.right + 2 || r.top < stg.top - 2 || r.bottom > stg.bottom + 2) }).length
    const blue = mk[0] ? getComputedStyle(mk[0].querySelector('[fill]:not([fill^="#E"]):not([fill^="#B"]):not([fill^="#9"])') || mk[0]).fill : null
    return { h1: q('h1')?.innerText, h1s: qa('h1').length, sub: q('.sm-map-sub')?.innerText.slice(0, 40), bannerW: Math.round(br.width), viewW: Math.round(vr.width), viewH: Math.round(vr.height), viewBg: getComputedStyle(view).backgroundColor, imgT: img.getAttribute('src').includes('model-seq-t'), src0: src0.split('/').pop(), pins, read, readBelowMap, sideBySide: w => stage.right <= side.left + 1, sbs: stage.right <= side.left + 1, mapOver: over, iso, board: { rows0, rows1, svgs, ubPast, cards }, cyc: { marks: mk.length, mkSvg, mkCut, blue }, overflow: document.documentElement.scrollWidth - innerWidth }
  })
  console.log(w, JSON.stringify(m), 'errors', errs.length, errs.slice(0, 3))
  if (w === 1440 || w === 390) { const el = await p.$('.sm-map-dark'); await el.screenshot({ path: `${OUT}/banner-${w}.png` }) }
  if (w === 1440) { const c = await p.$('.sm-ub'); await c.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 600)); await c.screenshot({ path: `${OUT}/board-1440.png` }); const cy = await p.$('.cyb'); await cy.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200)); await cy.screenshot({ path: `${OUT}/cycle-1440.png` }) }
  await p.close()
}
await b.close()
