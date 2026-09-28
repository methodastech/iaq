// the home page, late 24 Sep: ring under the hero, no serpentine, record band full canvas with plain tags, hero row no hairline
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const [w, h] of [[1440, 900], [1024, 800], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500))
  const m = await p.evaluate(() => {
    const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)]
    const secs = qa('main > section, main > header, main > div').map(e => e.id || e.className.split(' ').slice(0, 2).join('.'))
    const hero = q('.hero'), ring = q('.lpx-band'); const ringAfterHero = hero && ring && ring.getBoundingClientRect().top >= hero.getBoundingClientRect().bottom - 1
    const row = q('.hero .hero-mkts.hmk'); const cs = row && getComputedStyle(row)
    const cells = qa('.hmk-row.hmk-iso > *'); const rows = new Set(cells.map(c => Math.round(c.getBoundingClientRect().top))).size
    const gr = q('.glance.gr'); const cv = q('#globeCv'); const grr = gr?.getBoundingClientRect(), cr = cv?.getBoundingClientRect()
    const tag = q('.gr .tag, .gr .gr-tag, .gr [class*=tag]'); const ts = tag && getComputedStyle(tag)
    return { secs, ringAfterHero, serpentine: !!q('.cyc-flow, .cyb'), ringStage: !!q('#lpStage'), rowBorder: cs ? cs.borderTopWidth + ' ' + cs.borderTopStyle : null, rowCells: cells.length, rowRows: rows, past: cells.filter(c => c.getBoundingClientRect().right > innerWidth + 1).length, globe: cv ? { cw: Math.round(cr.width), ch: Math.round(cr.height), gw: Math.round(grr.width), gh: Math.round(grr.height), fills: Math.abs(cr.width - grr.width) < 3 && Math.abs(cr.height - grr.height) < 3 } : null, tag: ts ? { bg: ts.backgroundColor, border: ts.borderTopWidth, cls: tag.className } : null, overflow: document.documentElement.scrollWidth - innerWidth }
  })
  console.log(w, JSON.stringify(m), 'errors', errs.length, errs.slice(0, 3))
  if (w === 1440) { const el = await p.$('.lpx-band'); if (el) { await el.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1500)); await el.screenshot({ path: `${OUT}/ring-1440.png` }) } const g = await p.$('.glance.gr'); if (g) { await g.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 2500)); await g.screenshot({ path: `${OUT}/record-1440.png` }) } }
  if (w === 390) { await p.screenshot({ path: `${OUT}/home-390-top.png` }) }
  await p.close()
}
await b.close()
