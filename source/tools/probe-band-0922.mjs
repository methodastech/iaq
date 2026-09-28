/* 22 Sep: the rebuilt closing band. Real GPU. Shoots it on Home and Careers at 1440 and 390, reports the flow field's
   frame rate, the three sections' positions, the segmented choice, overflow and console errors.
   Usage: node tools/probe-band-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
for (const [route, w, h, m] of [['/', 1440, 900, false], ['/careers', 1440, 900, false], ['/', 390, 844, true]]) {
  const p = await b.newPage(); const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 160)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: m, hasTouch: m })
  await p.goto('http://localhost:5177' + route, { waitUntil: 'domcontentloaded', timeout: 90000 }); await wait(4500)
  await p.evaluate(() => { const s = document.querySelector('.close3d.cb'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY) }); await wait(2500)
  const r = await p.evaluate(() => {
    const s = document.querySelector('.close3d.cb'), q = sel => { const e = s.querySelector(sel); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.top), Math.round(x.height)] }
    return { amb: window.__closeAmb, band: q(':scope'), top: q('.cb-top'), reach: q('.cb-ledger'), low: q('.cb-low'), cols: s.querySelectorAll('.cb-links > div').length,
      seg: s.querySelectorAll('.cb-pick button').length, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }
  })
  let fps = null
  if (!m) { fps = await p.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(Math.round(n / 2)) }; requestAnimationFrame(f) })) }
  console.log(route, w, JSON.stringify({ ...r, fps, errs }))
  const band = await p.$('.close3d.cb'); await band.screenshot({ path: `${OUT}/band-${route === '/' ? 'home' : 'careers'}-${w}.png` })
  if (route === '/' && !m) {
    const seg = await p.$$('.cb-pick button'); await seg[2].click(); await wait(900)
    await p.mouse.move(900, 300); await wait(900)
    const top = await p.$('.cb-top'); await top.screenshot({ path: `${OUT}/band-home-choice.png` })
  }
  await p.close()
}
await b.close()
