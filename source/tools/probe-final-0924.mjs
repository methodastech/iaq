// 24 Sep, the closing check of the day's list: home order, hero row (no line, no underline, wraps), record band canvas,
// services order, banner (IAQ model, name, reading under the map), units board, cycle marks, codex icon family
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = async (url, w, h) => { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)) }); await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 }); await p.goto(url, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500)); return [p, errs] }
{ const [p, errs] = await page('http://localhost:5177/', 1440, 900)
  const m = await p.evaluate(() => {
    const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]
    const order = qa('main section, main .glance, main .hero').filter((e, i, a) => !a.some(o => o !== e && o.contains(e))).map(e => e.id || e.className.split(' ').slice(0, 2).join('.'))
    const a = q('.hmk-iso a'); const af = getComputedStyle(a, '::after')
    const row = getComputedStyle(q('.hero .hero-mkts.hmk'))
    return { order, underline: af.display + '/' + af.width, rowLine: row.borderTopWidth, fabExplorerOnHome: !!q('.fx-explorer, .fab-explorer'), serpentine: !!q('.cyc-flow'), ring: !!q('.lpx-band #lpStage'), h1: q('h1').innerText.replace(/\n/g, ' / '), recordBg: getComputedStyle(q('.glance.gr')).backgroundImage.slice(0, 40), canvasIsSection: (() => { const c = q('#globeCv').getBoundingClientRect(), g = q('.glance.gr').getBoundingClientRect(); return Math.abs(c.width - g.width) < 2 && Math.abs(c.height - g.height) < 2 })(), overflow: document.documentElement.scrollWidth - innerWidth }
  })
  console.log('home', JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  await p.screenshot({ path: `${OUT}/home-hero-1440.png` }); await p.close() }
{ const [p, errs] = await page('http://localhost:5177/services', 1440, 900)
  const m = await p.evaluate(async () => {
    const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]
    const order = qa('main section, main header').filter((e, i, a) => !a.some(o => o !== e && o.contains(e))).map(e => e.id || e.className.split(' ').slice(0, 2).join('.'))
    const v = q('.sm-map-dark .fx-view'); const img = v.querySelector('img'); const s0 = img.getAttribute('src')
    const u = qa('.sm-map .rx-n.n-u'); u[1].click(); await new Promise(r => setTimeout(r, 300)); if (!u[1].classList.contains('me')) u[1].click(); await new Promise(r => setTimeout(r, 1800))
    const s1 = img.getAttribute('src'); const pins = qa('.sm-map-dark .fx-pin.lit').length
    const labelsOverlap = (() => { const r = qa('.sm-map-dark .fx-pin b').map(e => e.getBoundingClientRect()); let n = 0; for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (r[i].left < r[j].right && r[j].left < r[i].right && r[i].top < r[j].bottom && r[j].top < r[i].bottom) n++; return n })()
    const ub = q('.sm-ub'); const before = ub.querySelectorAll('.sm-ub-row').length; q('.sm-uc-more').click(); await new Promise(r => setTimeout(r, 400)); const after = ub.querySelectorAll('.sm-ub-row').length
    return { order, h1: q('h1').innerText, h1s: qa('h1').length, modelIsIAQ: s0.includes('model-seq-t'), scrubs: s0 !== s1, pins, labelsOverlap, view: [Math.round(v.getBoundingClientRect().width), Math.round(v.getBoundingClientRect().height)], readUnderMap: q('.sm-map-read').getBoundingClientRect().top >= q('.sm-map-in').getBoundingClientRect().bottom - 1, iso: Math.round(q('.rx-compact .rx-s .rx-iso').getBoundingClientRect().width), board: [before, after, ub.querySelectorAll('svg.ud-svg').length, qa('.sm-uc').length], cycleMarks: qa('.cyc-mk').filter(e => e.getBoundingClientRect().width > 20).length, cycleH2: q('.cyb h2')?.innerText.replace(/\n/g, ' '), overflow: document.documentElement.scrollWidth - innerWidth }
  })
  console.log('services', JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2)); await p.close() }
{ const [p, errs] = await page('http://localhost:5177/portal/codex?key=iaqsolution321', 1440, 900)
  const m = await p.evaluate(() => { const li = document.querySelectorAll('.cx-iso li'); const h = document.querySelector('#cx-iso-h'); return { family: li.length, head: h?.innerText, svgs: document.querySelectorAll('.cx-iso li svg').length, kindsGuide: !!document.querySelector('.kg, [class*=kinds]') } })
  console.log('codex', JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2)); const el = await p.$('.cx-iso'); if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 500)); await el.screenshot({ path: `${OUT}/codex-iso-1440.png` }) } await p.close() }
await b.close()
