// the Services page after the restructure: order, h1, the banner, the map fit, the compare table, the cycle flow
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const [w, h] of [[1440, 900], [1300, 900], [1024, 800], [390, 844]]) {
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: w < 500 ? 2 : 1 })
  await p.goto('http://localhost:5177/services', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 3000))
  const m = await p.evaluate(async () => {
    const secs = [...document.querySelectorAll('section, header.pg-head')].filter((e, i, a) => !a.some(o => o !== e && o.contains(e))).map(e => e.id || e.className.split(' ').slice(0, 2).join('.'))
    const banner = document.querySelector('.sm-map-dark'); const br = banner.getBoundingClientRect()
    const nav = document.querySelector('.nav'); const nr = nav ? nav.getBoundingClientRect() : null
    // map overflow: any service card whose text runs past the card
    const over = [...document.querySelectorAll('.rx-compact .rx-n')].filter(n => { const s = n.querySelector('span:last-child'); if (!s) return false; return s.getBoundingClientRect().right > n.getBoundingClientRect().right + 1 }).length
    const u = document.querySelectorAll('.sm-map .rx-n.n-u'); u[0].click(); await new Promise(r => setTimeout(r, 300)); if (!u[0].classList.contains('me')) u[0].click(); await new Promise(r => setTimeout(r, 2200))
    const lit = [...document.querySelectorAll('.fv-legend li.on b')].map(e => e.textContent).join(',')
    const more = document.querySelector('.sm-map-more')?.innerText.slice(0, 60)
    const svcIcon = !!document.querySelector('.rx-compact .rx-s .rx-n svg') && !document.querySelector('.rx-compact .rx-mk')
    const btn = document.querySelector('.sm-uc-more'); btn.click(); await new Promise(r => setTimeout(r, 800))
    const cmp = document.getElementById('units-compare')
    const flow = !!document.querySelector('.cyc-flow'); const cyb = document.querySelector('.cyb h2')
    const bgTop = getComputedStyle(banner).backgroundColor
    return { secs, h1: document.querySelector('h1')?.innerText.replace(/\n/g, ' / '), h1s: document.querySelectorAll('h1').length, bannerBg: bgTop, bannerUnderNav: nr ? Math.round(br.top - nr.bottom) : null, bannerW: Math.round(br.width), mapOver: over, lit, more, svcIcon, cmp: cmp ? { svgs: cmp.querySelectorAll('svg.ud-svg').length, rows: cmp.querySelectorAll('tbody tr').length, cols: cmp.querySelectorAll('thead th').length, past: [...cmp.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length } : null, flow, cycleH2: cyb ? cyb.innerText.replace(/\n/g, ' ') : null, overflow: document.documentElement.scrollWidth - innerWidth }
  })
  console.log(w, JSON.stringify(m), 'errors', errs.length, errs.slice(0, 2))
  if (w === 1440 || w === 1300) { const el = await p.$('.sm-map-dark'); await el.screenshot({ path: `${OUT}/banner-${w}.png` }) }
  if (w === 1440) { const c = await p.$('#units-compare'); if (c) { await c.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 600)); await c.screenshot({ path: `${OUT}/compare-1440.png` }) } const cy = await p.$('.cyb'); await cy.evaluate(e => e.scrollIntoView({ block: 'start' })); await new Promise(r => setTimeout(r, 1200)); await cy.screenshot({ path: `${OUT}/cycle-1440.png` }) }
  await p.close()
}
await b.close()
