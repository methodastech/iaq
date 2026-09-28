/* 22 Sep: the rebuilt Contact page. Shoots the enquiry, the district map (after the fly-in, then zoomed in and out) and
   the offices at 1440 and 390, and reports the map's own QA numbers, label positions, flags and overflow.
   Usage: node tools/probe-contact-0922.mjs <outdir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', protocolTimeout: 240000,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] })
const wait = ms => new Promise(r => setTimeout(r, ms))
for (const [w, h, m] of [[1440, 900, false], [390, 844, true]]) {
  const p = await b.newPage()
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200))); p.on('console', e => { if (e.type() === 'error') errs.push(e.text().slice(0, 200)) })
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: m, hasTouch: m })
  await p.goto('http://localhost:5177/contact', { waitUntil: 'domcontentloaded', timeout: 90000 })
  await wait(5000)
  const top = await p.$('#contact-form'); await top.screenshot({ path: `${OUT}/cx-${w}.png` })
  await p.evaluate(() => { const s = document.querySelector('#find-us'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 60) })
  await wait(1500)
  const mid = await p.evaluate(() => window.__hqmapQA && window.__hqmapQA())
  await wait(9000)
  const qa = await p.evaluate(() => window.__hqmapQA && window.__hqmapQA())
  const map = await p.$('#find-us'); await map.screenshot({ path: `${OUT}/map-${w}.png` }).catch(e => errs.push('shot ' + e.message))
  await p.evaluate(() => document.querySelector('[data-hqm="in"]').click()); await wait(2500)
  await map.screenshot({ path: `${OUT}/map-in-${w}.png` }).catch(e => errs.push('shot ' + e.message))
  await p.evaluate(() => { const o = document.querySelector('[data-hqm="out"]'); o.click(); o.click(); o.click() }); await wait(3000)
  await map.screenshot({ path: `${OUT}/map-out-${w}.png` }).catch(e => errs.push('shot ' + e.message))
  const off = await p.$('#offices'); await off.screenshot({ path: `${OUT}/offices-${w}.png` })
  const dom = await p.evaluate(() => ({ flags: document.querySelectorAll('.of .flag').length, countries: [...document.querySelectorAll('.of-head h3')].map(x => x.textContent),
    cities: [...document.querySelectorAll('.of-b h4')].map(x => x.textContent), live: document.querySelector('#hqmap').className,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }))
  console.log(w, JSON.stringify({ mid, qa, dom, errs }, null, 0))
  await p.close()
}
await b.close()
